import React, { useMemo } from 'react';
import type { Contact } from '../../types/contact';
import type { Message } from '../../types/message';
import { useLanguage } from '../../context/LanguageContext';

interface ContactsListProps {
  contacts: Contact[];
  messages: Message[];
  selectedClient: string;
  clientSearch: string;
  currentUserMobile: string;
  contactMap: Map<string, Contact>;
  blockedPhones: Set<string>;
  onClientSearchChange: (value: string) => void;
  onSelectClient: (phone: string, contactName: string | null) => void;
  onToggleBlock: (phone: string, block: boolean) => void;
}

interface ConversationPreview {
  phone: string;
  latestMessage?: Message;
}

export const ContactsList: React.FC<ContactsListProps> = ({
  contacts,
  messages,
  selectedClient,
  clientSearch,
  currentUserMobile,
  contactMap,
  blockedPhones,
  onClientSearchChange,
  onSelectClient,
  onToggleBlock,
}) => {

  const { t } = useLanguage();
  const participants = useMemo<ConversationPreview[]>(() => {
    const conversations = new Map<string, ConversationPreview>();

    messages?.forEach((message) => {
      const from = message.from_number?.trim();
      const to = message.to_number?.trim();
      if (!from || !to || from === to) return;

      const pair = [from, to].sort();
      const pairKey = pair.join("\u0000");
      const phone = from === currentUserMobile.trim() ? to : from;
      const existing = conversations.get(pairKey);
      if (
        !existing ||
        new Date(message.created_at).getTime() >
          new Date(existing.latestMessage?.created_at || 0).getTime()
      ) {
        conversations.set(pairKey, { phone, latestMessage: message });
      }
    });

    const contactPhones = new Set(
      Array.from(conversations.values()).map((conversation) => conversation.phone),
    );

    contacts?.forEach((contact) => {
      if (contact.contact_mobile !== currentUserMobile.trim() && !contactPhones.has(contact.contact_mobile)) {
        conversations.set(`contact:${contact.contact_mobile}`, { phone: contact.contact_mobile });
      }
    });

    return Array.from(conversations.values()).sort((a, b) => {
      const aTime = a.latestMessage ? new Date(a.latestMessage.created_at).getTime() : 0;
      const bTime = b.latestMessage ? new Date(b.latestMessage.created_at).getTime() : 0;
      if (aTime !== bTime) return bTime - aTime;
      const nameA = contactMap.get(a.phone)?.contact_name || a.phone;
      const nameB = contactMap.get(b.phone)?.contact_name || b.phone;
      return nameA.localeCompare(nameB);
    });
  }, [messages, contacts, contactMap, currentUserMobile]);

  const filteredParticipants = useMemo(() => {
    const term = clientSearch.toLowerCase();

    return participants.filter(({ phone }) => {
      const name = contactMap.get(phone)?.contact_name || phone;
      return name.toLowerCase().includes(term) || phone.includes(term);
    });
  }, [participants, contactMap, clientSearch]);

    return (
    <aside className="flex flex-col gap-4 h-full">
      <div className="flex min-h-0 flex-1 flex-col rounded-xl border border-gray-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-4">
        <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-slate-100">{t('messages.clients')}</h2>
        <p className="mt-0.5 sm:mt-1 text-xs sm:text-sm text-gray-500 dark:text-slate-300">{t('messages.clientsHint')}</p>
        <input
          type="text"
          value={clientSearch}
          onChange={(event) => onClientSearchChange(event.target.value)}
          placeholder={t('messages.searchClients')}
          className="mt-2 w-full rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:border-blue-400 dark:focus:ring-blue-900 sm:mt-3 sm:py-2"
        />

      <div className="contacts-scrollbar mt-3 min-h-0 flex-1 overflow-y-auto rounded-lg border border-gray-200 bg-gray-50 p-2 dark:border-slate-700 dark:bg-slate-800/70 sm:p-4">
        {filteredParticipants.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-4">{t('messages.noClients')}</p>
        ) : (
          <ul className="space-y-1.5 sm:space-y-2">
            {filteredParticipants.map(({ phone, latestMessage }) => {
              const contact = contactMap.get(phone);
              const isBlocked = blockedPhones.has(phone);
              const displayName = contact?.contact_name?.trim();

              return (
                <li key={phone} className="group relative ">
                  <button
                    type="button"
                    onClick={() => onSelectClient(phone, contact?.contact_name ?? null)}
                    aria-selected={selectedClient === phone}
                    className={`w-full rounded-lg sm:rounded-xl px-3 py-2 sm:py-3 text-left transition focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                      selectedClient === phone
                        ? 'bg-blue-600 text-white shadow-md ring-2 ring-blue-300 dark:bg-blue-600 dark:ring-blue-400'
                        : 'bg-gray-50 text-gray-900 hover:bg-gray-100 dark:bg-slate-500 dark:text-slate-100 dark:hover:bg-slate-600'
                    }`}
                  >
                    <div className="font-semibold text-sm sm:text-base truncate flex items-center gap-2">
                      {displayName ? `${displayName} (${phone})` : phone}
                      {isBlocked && (
                        <span className="text-[10px] bg-red-600 text-red-100 px-1.5 py-0.5 rounded-full uppercase">
                          {t('common.blocked')}
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] sm:text-xs">
                      {phone}
                    </div>
                    {latestMessage && (
                      <div className={`mt-1 truncate text-xs ${selectedClient === phone ? 'text-blue-100' : 'text-gray-500 dark:text-slate-200'}`}>
                        {latestMessage.message || (latestMessage.image_url ? t('messages.image') : '')}
                      </div>
                    )}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleBlock(phone, !isBlocked);
                    }}
                    title={isBlocked ? "Unblock" : "Block"}
                    className={`absolute top-1/2 -translate-y-1/2 right-2 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity ${
                      isBlocked ? 'text-green-600 hover:bg-green-50' : 'text-red-600 hover:bg-red-50'
                    }`}
                  >
                    {isBlocked ? (
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
      </div>
    </aside>
  );

};
