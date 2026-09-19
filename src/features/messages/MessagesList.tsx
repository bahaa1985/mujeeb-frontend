import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useLocation } from "react-router-dom";
import { messagesAPI } from "../../api/messagesAPI";

import { contactsAPI } from "../../api/contactsAPI";
import { userAPI } from "../../api/userAPI";
import type { Message } from "../../types/message";
import type { Contact } from "../../types/contact";
import type { User } from "../../types/user";
import { useAuth } from "../../context/AuthContext";
import { supabaseClient } from "../../lib/supabaseClient";
import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js";
import { ContactsList } from "./ContactsList";
import { MessageItem } from "./MessageItem";
import { useLanguage } from "../../context/LanguageContext";
import type { Subscription } from "../../types/subscription";
import { subscriptionAPI } from "../../api/subscriptionAPI";

export const MessagesList: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  const { t, dir, language } = useLanguage();

  const [messages, setMessages] = useState<Message[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedClient, setSelectedClient] = useState("");
  const [clientSearch, setClientSearch] = useState("");
  const [messageSearch, setMessageSearch] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [saveContactName, setSaveContactName] = useState("");
  const [editingMessageId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");
  const [error, setError] = useState("");
  const [isSavingContact, setIsSavingContact] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [blockedPhones, setBlockedPhones] = useState<Set<string>>(new Set());
  const [pharmPlan, setPharmPlan] = useState<Subscription>();
  const [pharmacyUsers, setPharmacyUsers] = useState<User[]>([]);
  const [selectedPharmacyUser, setSelectedPharmacyUser] = useState<User | null>(null);
  const [showPharmacyUsers, setShowPharmacyUsers] = useState(false);
  // const [isAiMode, setIsAiMode] = useState(user?.ai_mode);

  const messageContainerRef = useRef<HTMLDivElement | null>(null);

  const canViewAllContacts = user?.role_id === 1 || user?.role_id === 2;
  const activePharmacyUser = canViewAllContacts ? selectedPharmacyUser : user;
  const conversationUserMobile = activePharmacyUser?.mobile || "";
  const instanceName =
    user?.instance_name ||
    (user as User & { instanceName?: string }).instanceName ||
    "";

  const contactMap = useMemo(() => {
    const map = new Map<string, Contact>();
    contacts?.forEach((contact) => map.set(contact.contact_mobile, contact));
    return map;
  }, [contacts]);

  const loadContacts = useCallback(async () => {
    try {
      const [contactsData, blockedData] = await Promise.all([
        contactsAPI.getContacts(activePharmacyUser?.mobile),
        contactsAPI.getBlockedContacts(),
      ]);
      setContacts(contactsData);
      setBlockedPhones(
        new Set(
          blockedData
            .filter((blockedContact) => blockedContact.blocked)
            .map((blockedContact) => blockedContact.contact_number),
        ),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load contacts");
    }
  }, [activePharmacyUser?.id]);

  const loadMessages = useCallback(
    async (clientPhone?: string) => {
      if (!user || !activePharmacyUser) return;
      setIsLoading(true);
      setError("");
      try {
        const data = 
        canViewAllContacts
          ? await messagesAPI.getMessagesByPharmacy(
              user.pharmacy_id,
              clientPhone,
              conversationUserMobile,
            )
          : 
          await messagesAPI.getMessages(conversationUserMobile, clientPhone);
        if (data) setMessages(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load messages",
        );
      } finally {
        setIsLoading(false);
      }
    },
    [activePharmacyUser, canViewAllContacts, conversationUserMobile, user],
  );

  useEffect(() => {
    if (!user) return;
    if (canViewAllContacts) {
      userAPI
        .getUsers(user.pharmacy_id)
        .then(setPharmacyUsers)
        .catch((err) => setError(err instanceof Error ? err.message : "Failed to load pharmacy users"));
    } else {
      setSelectedPharmacyUser(user);
    }
  }, [canViewAllContacts, user]);

  useEffect(() => {
    if (!activePharmacyUser) {
      setIsLoading(false);
      return;
    }
    const params = new URLSearchParams(location.search);
    setSelectedClient(params.get("contact") || "");
    loadContacts();
  }, [activePharmacyUser, loadContacts, location.search]);

  useEffect(() => {
    if (selectedClient) {
      setSaveContactName(contactMap.get(selectedClient)?.contact_name ?? "");
    }
  }, [contactMap, selectedClient]);

  useEffect(() => {
    if (activePharmacyUser) loadMessages(selectedClient || undefined);
  }, [activePharmacyUser, loadMessages, selectedClient]);


  useEffect(() => {
    // get current pharmacy plan
    const fetchPharmacyPlan = async () => {
      const subscription = await subscriptionAPI.getPharmacySubscription(
        Number(user?.pharmacy_id),
      );
      setPharmPlan(subscription);
    };
    fetchPharmacyPlan();
  }, [user?.pharmacy_id]);

  //#region Messages realtime subscription
  
  useEffect(() => {
    if (!supabaseClient || !user) return;
    const client = supabaseClient;

    const channel = client
      .channel("messages-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "messages" },
        (payload: RealtimePostgresChangesPayload<Message>) => {
          const newMessageData = payload.new as Message | null;
          const oldMessageData = payload.old as Message | null;
          if (!newMessageData && !oldMessageData) return;

          const matchesCurrentUser = (msg: Message) => {
            if (!user) return false;
            return (
              String(msg.pharmacy_id) === String(user.pharmacy_id) &&
              (msg.from_number === conversationUserMobile ||
                msg.to_number === conversationUserMobile)
            );
          };

          const matchesClientSelection = (msg: Message) => {
            if (!selectedClient) return true;
            const isSamePharmacy =
              String(msg.pharmacy_id) === String(user.pharmacy_id);
            const isSameConversation =
              (msg.from_number === selectedClient &&
                msg.to_number === conversationUserMobile) ||
              (msg.from_number === conversationUserMobile &&
                msg.to_number === selectedClient);
            return isSamePharmacy && isSameConversation;
          };

          if (
            payload.eventType === "INSERT" &&
            newMessageData &&
            matchesCurrentUser(newMessageData)
          ) {
            // فحص نوع الرسالة وخطة الاشتراك واستهلاك الصور
            if (
              (newMessageData.message_type === 2 ||
                newMessageData.message_type === 3) &&
              pharmPlan?.plan_id === 2 &&
              pharmPlan?.images_count >= 100 // تأكد إن اسم الحقل يطابق الموجود في state عندك
            ) {
              messagesAPI.createMessage({
                to_number: conversationUserMobile,
                message: "You exceeds 100 images",
                instance_name: instanceName,
                from_number: conversationUserMobile,
                image_url: "",
                                pharmacyId: user?.pharmacy_id || 0,
              });
            }

            // Check if it's an order request (message_type = 10)
            // if (String(newMessageData.message_type) === "10") {
            //   messagesAPI
            //     .notifyOrderMessage({
            //       pharmacyId: String(newMessageData.pharmacy_id),
            //       fromNumber: newMessageData.from_number,
            //       message: newMessageData.message || "",
            //     })
            //     .catch((e) => console.error("Error triggering order notification:", e));
            // }

            if (matchesClientSelection(newMessageData)) {

              setMessages((prev) => {
                const exists = prev.some(
                  (item) => item.id === newMessageData.id,
                );
                if (exists) return prev;
                const next = [
                  ...prev,
                  { ...newMessageData, id: String(newMessageData.id) },
                ];
                return next.sort(
                  (a, b) =>
                    new Date(a.created_at).getTime() -
                    new Date(b.created_at).getTime(),
                );
              });
            }
          }

          if (
            payload.eventType === "UPDATE" &&
            newMessageData &&
            matchesCurrentUser(newMessageData)
          ) {
            setMessages((prev) =>
              prev.map((message) =>
                String(message.id) === String(newMessageData.id)
                  ? { ...message, ...newMessageData }
                  : message,
              ),
            );
          }

          if (payload.eventType === "DELETE" && oldMessageData) {
            setMessages((prev) =>
              prev.filter(
                (message) => String(message.id) !== String(oldMessageData.id),
              ),
            );
          }
        },
      )
      .subscribe();

    return () => {
      client.removeChannel(channel);
    };
  }, [
    user,
    selectedClient,
    canViewAllContacts,
    conversationUserMobile,
    pharmPlan,
    instanceName,
  ]);
  //#endregion Messages realtime subscription

  // Auto-select the first client if none is selected and there are messages
  useEffect(() => {
    if (!selectedClient && !canViewAllContacts && messages?.length > 0 && user) {
      const firstClient =
        messages?.find((message) => message.from_number !== user.mobile)
          ?.from_number ||
        messages?.find((message) => message.to_number !== user.mobile)
          ?.to_number ||
        "";
      if (firstClient) {
        setSelectedClient(firstClient);
      }
    }
  }, [messages, selectedClient, canViewAllContacts, user]);

  // Scroll to the bottom of the message list when messages change
  useEffect(() => {
    if (messageContainerRef.current) {
      messageContainerRef.current.scrollTop =
        messageContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const conversationMessages = useMemo(() => {
    const items = selectedClient
      ? messages?.filter((message) => {
          const isSamePharmacy =
            String(message.pharmacy_id) === String(user?.pharmacy_id);
          const isSelectedPair =
            (message.from_number === selectedClient &&
              message.to_number === conversationUserMobile) ||
            (message.from_number === conversationUserMobile &&
              message.to_number === selectedClient);
          return isSamePharmacy && (conversationUserMobile ? isSelectedPair : (
            message.from_number === selectedClient || message.to_number === selectedClient
          ));
        })
      : messages;
    const term = messageSearch.toLowerCase();
    return [...(items || [])].sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
    ).filter(
      (message) =>
        !term ||
        message.message?.toLowerCase().includes(term) ||
        message.image_url?.toLowerCase().includes(term) ||
        message.from_number.toLowerCase().includes(term) ||
        message.to_number.toLowerCase().includes(term),
    );
  }, [messages, selectedClient, conversationUserMobile, messageSearch, user?.pharmacy_id]);

  const selectedClientName = selectedClient
    ? contactMap.get(selectedClient)?.contact_name || selectedClient
    : "All clients";

  const handleSendMessage = async () => {
    if (!selectedClient) {
      setError("Please select a client to send a message.");
      return;
    }

    if (!newMessage.trim()) {
      setError("Please enter a message.");
      return;
    }
    setError("");

        try {
      const created = await messagesAPI.createMessage({
        to_number: selectedClient,
        message: newMessage.trim(),
        instance_name: instanceName,
        from_number: conversationUserMobile,
        image_url: "",
        pharmacyId: user?.pharmacy_id || 0,
        message_type: newMessage.trim().toLowerCase().includes("order") ? 11 : 6,
      });
      setMessages((prev) => [...prev, created]);
      setNewMessage("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send message");
    }
  };

  // const handleDelete = async (messageId: string) => {
  //   try {
  //     await messagesAPI.deleteMessage(messageId);
  //     setMessages((prev) => prev.filter((message) => message.id !== messageId));
  //   } catch (err) {
  //     setError(err instanceof Error ? err.message : 'Failed to delete message');
  //   }
  // };

  // const handleStartEditing = (message: Message) => {
  //   setEditingMessageId(message.id);
  //   setEditingText(message.message || '');
  // };

  // const handleSaveEdit = async () => {
  //   if (!editingMessageId) return;
  //   try {
  //     const updated = await messagesAPI.updateMessage(editingMessageId, { message: editingText });
  //     setMessages((prev) => prev.map((message) => (message.id === updated.id ? updated : message)));
  //     setEditingMessageId(null);
  //     setEditingText('');
  //   } catch (err) {
  //     setError(err instanceof Error ? err.message : 'Failed to update message');
  //   }
  // };

  const handleSaveContact = async () => {
    if (!selectedClient) {
      setError("No client selected for saving contact information.");
      return;
    }
    if (!saveContactName.trim()) {
      setError("Please enter a name for the contact.");
      return;
    }

    setError("");
    setIsSavingContact(true);
    try {
      const contact = await contactsAPI.updateContact({
        contact_mobile: selectedClient,
        user_mobile: conversationUserMobile,
        contact_name: saveContactName.trim(),
      });
      setContacts((prev) => {
        const contactExists = prev.some(
          (item) =>
            item.contact_mobile === contact.contact_mobile &&
            item.user_mobile === contact.user_mobile,
        );
        return contactExists
          ? prev.map((item) =>
              item.contact_mobile === contact.contact_mobile &&
              item.user_mobile === contact.user_mobile
                ? contact
                : item,
            )
          : [contact, ...prev];
      });
      setSaveContactName(contact.contact_name ?? "");
    } catch (err) {
      console.log("Error saving contact:", err);
      setError(err instanceof Error ? err.message : "Failed to save contact");
    } finally {
      setIsSavingContact(false);
    }
  };

  const handleToggleBlock = async (phone: string, block: boolean) => {
    try {
      await contactsAPI.toggleBlockContact(phone, block);
      setBlockedPhones((prev) => {
        const next = new Set(prev);
        if (block) {
          next.add(phone);
        } else {
          next.delete(phone);
        }
        return next;
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to toggle block status",
      );
    }
  };

  const handleSelectClient = (phone: string, contactName: string | null) => {
    setSelectedClient(phone);
    setSaveContactName(contactName ?? "");
  };

  // const handleToggleAiMode = async () => {
  //   if (!user) return;
  //   try {
  //     const newAiMode = !user.ai_mode;
  //     setIsAiMode(newAiMode);
  //     const updatedUser = await userAPI.updateUser(BigInt(user.id), { ai_mode: newAiMode });
  //     setUser({ ...user, ai_mode: updatedUser.ai_mode });
  //   } catch (err) {
  //     setError(err instanceof Error ? err.message : 'Failed to update AI mode');
  //   }
  // };

  if (!user) {
    return <div className="text-center py-8">{t("auth.pleaseSignIn")}</div>;
  }

  if (isLoading)
    return <div className="text-center py-8">{t("common.loading")}</div>;

  const isAiEnabled = !!activePharmacyUser?.ai_mode;

  return (
    <div className="space-y-4">
      {canViewAllContacts && (
        <section className="bg-white dark:bg-slate-900 border dark:border-gray-800 shadow-md rounded-lg p-6 mb-8">
          <button
            type="button"
            onClick={() => setShowPharmacyUsers((visible) => !visible)}
            className="flex w-full items-center justify-between text-left"
          >
            <span className="text-lg font-semibold text-gray-900 dark:text-slate-100">
              {t("messages.pharmacyUsers")}
            </span>
            <span className="text-sm text-gray-500 dark:text-slate-300">
              {showPharmacyUsers ? t("layout.hide") : t("layout.view")}
            </span>
          </button>
          {showPharmacyUsers && (
            <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {pharmacyUsers.map((pharmacyUser) => (
                <button
                  key={pharmacyUser.id}
                  type="button"
                  onClick={() => {
                    setSelectedPharmacyUser(pharmacyUser);
                    setSelectedClient("");
                  }}
                  className={`rounded-lg border px-3 py-2 text-left ${
                    selectedPharmacyUser?.id === pharmacyUser.id
                      ? "border-blue-600 bg-blue-50 text-blue-700"
                      : "border-gray-200 bg-gray-50 text-gray-900 hover:bg-gray-100"
                  }`}
                >
                  <div className="font-semibold">{pharmacyUser.username}</div>
                  <div className="text-xs">{pharmacyUser.mobile}</div>
                </button>
              ))}
            </div>
          )}
        </section>
      )}

      {activePharmacyUser && <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
      {/* Sidebar: contact and client selection list */}
      <ContactsList
        contacts={contacts}
        messages={messages}
        selectedClient={selectedClient}
        clientSearch={clientSearch}
        currentUserMobile={conversationUserMobile}
        contactMap={contactMap}
        onClientSearchChange={setClientSearch}
        onSelectClient={handleSelectClient}
        blockedPhones={blockedPhones}
        onToggleBlock={handleToggleBlock}
      />

      {selectedClient && <section className="space-y-4">
        {/* Conversation header: current chat info and controls */}
        <div className="rounded-xl border border-gray-200 bg-white dark:border-slate-800 dark:bg-slate-900 p-4 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-slate-100">
                {t("messages.conversation")}
              </h2>
              <p className="text-sm text-gray-500 dark:text-slate-300">
                {selectedClient
                  ? `${selectedClientName}`
                    : canViewAllContacts
                    ? t("messages.viewingAll")
                    : t("messages.selectClient")}
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              {/*<button
                type="button"
                onClick={handleToggleAiMode}
                className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
              >
                {isAiMode ? t('messages.aiEnabled') : t('messages.aiDisabled')}
              </button>*/}
              {canViewAllContacts && selectedClient && (
                <button
                  type="button"
                  onClick={() => setSelectedClient("")}
                  className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  {t("messages.showAll")}
                </button>
              )}
            </div>
          </div>
          {/* <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <span className="block text-xs font-semibold uppercase tracking-wide text-gray-500">{t('messages.user')}</span>
              <p className="mt-1 text-sm text-gray-700">{user.username}</p>
            </div>
            <div>
              <span className="block text-xs font-semibold uppercase tracking-wide text-gray-500">{t('layout.role')}</span>
              <p className="mt-1 text-sm text-gray-700">{canViewAllContacts ? t('messages.roleOwner') : t('messages.roleMember')}</p>
            </div>
          </div> */}
        </div>

        {/* Message list and search section */}
        <div className="rounded-xl border border-gray-200 bg-white dark:bg-slate-900 p-4 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100">
              {t("messages.messagesTitle")}
            </h3>
            <input
              type="text"
              value={messageSearch}
              onChange={(e) => setMessageSearch(e.target.value)}
              placeholder={t("messages.searchMessages")}
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-blue-400 dark:focus:ring-blue-900 sm:w-64"
            />
          </div>

          <div
            ref={messageContainerRef}
            className="sidebar-scrollbar mt-4 flex h-[calc(100vh-380px)] flex-col gap-3 overflow-y-auto rounded-xl border border-gray-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/70"
          >
            <style>{`
            .sidebar-scrollbar {
              scrollbar-width: thin;
              scrollbar-color: transparent transparent;
            }

            .sidebar-scrollbar::-webkit-scrollbar {
              width: 8px;
            }

            .sidebar-scrollbar::-webkit-scrollbar-track {
              background: transparent;
            }

            .sidebar-scrollbar::-webkit-scrollbar-thumb {
              background: transparent;
              border-radius: 9999px;
              border: 2px solid transparent;
              background-clip: padding-box;
            }

            .dark .sidebar-scrollbar {
              scrollbar-color: #3f3f46 transparent;
            }

            .dark .sidebar-scrollbar::-webkit-scrollbar-track {
              background: #18181b;
            }

            .dark .sidebar-scrollbar::-webkit-scrollbar-thumb {
              background: #3f3f46;
              border-radius: 9999px;
              border: 2px solid #18181b;
              background-clip: padding-box;
            }

            .dark .sidebar-scrollbar::-webkit-scrollbar-thumb:hover {
              background: #52525b;
              border-color: #18181b;
            }
          `}</style>
            {conversationMessages?.length === 0 ? (
              <div className="text-center text-sm text-gray-500">
                {t("messages.noMessages")}
              </div>
            ) : (
              conversationMessages?.map((message, index) => {
                const isOwnMessage = message.from_number === conversationUserMobile;
                const alignRight = dir === "ltr" ? isOwnMessage : !isOwnMessage;
                const senderName = isOwnMessage
                  ? t("messages.you")
                  : contactMap.get(message.from_number)?.contact_name ||
                    message.from_number;
                const messageDate = new Date(message.created_at);
                const previousMessage = conversationMessages[index - 1];
                const previousMessageDate = previousMessage
                  ? new Date(previousMessage.created_at)
                  : null;
                const isNewDate =
                  !previousMessageDate ||
                  messageDate.getFullYear() !== previousMessageDate.getFullYear() ||
                  messageDate.getMonth() !== previousMessageDate.getMonth() ||
                  messageDate.getDate() !== previousMessageDate.getDate();
                const formattedMessageDate = messageDate.toLocaleDateString(
                  language === "ar" ? "ar-EG" : "en-US",
                  {
                    day: "numeric",
                    month: "long",
                    weekday: "long",
                    year: "numeric",
                  },
                );
                return (
                  <React.Fragment key={message.id}>
                    {isNewDate && (
                      <div className="flex items-center gap-3 py-2" role="separator">
                        <div className="h-px flex-1 bg-gray-200 dark:bg-slate-600" />
                        <span className="rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-semibold text-gray-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200">
                          {formattedMessageDate}
                        </span>
                        <div className="h-px flex-1 bg-gray-200 dark:bg-slate-600" />
                      </div>
                    )}
                    <MessageItem
                      message={message}
                      senderName={senderName}
                      isOwnMessage={isOwnMessage}
                      alignRight={alignRight}
                      isEditing={editingMessageId === message.id}
                      editingText={editingText}
                      onEditingTextChange={setEditingText}
                    />
                  </React.Fragment>
                );
              })
            )}
          </div>
        </div>

        {/* New message composer and contact save section */}
        <div className="rounded-xl border border-gray-200 bg-white dark:border-slate-800 dark:bg-slate-900 p-4 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100">
            {t("messages.sendTitle")}
          </h3>
          <textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            disabled={isAiEnabled}
            rows={4}
            placeholder={
              isAiEnabled
                ? t("messages.aiEnabled")
                : selectedClient
                  ? `${t("messages.messagePreview")}: ${selectedClientName}`
                  : t("messages.placeholder")
            }
            className="mt-3 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-gray-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-blue-400 dark:focus:ring-blue-900 dark:disabled:bg-slate-700"
          />
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              onClick={handleSendMessage}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isAiEnabled || !selectedClient || !newMessage.trim()}
            >
              {t("messages.sendButton")}
            </button>

            {/* {selectedClient && !contactMap.has(selectedClient) && ( */}
              <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
                <input
                  type="text"
                  value={saveContactName}
                  onChange={(e) => setSaveContactName(e.target.value)}
                  placeholder={t("messages.contactName")}
                  className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-blue-400 dark:focus:ring-blue-900"
                />
                <button
                  type="button"
                  onClick={handleSaveContact}
                  className="rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50"
                  disabled={isSavingContact}
                >
                  {t("messages.saveContact")}
                </button>
              </div>
            {/* )} */}
          </div>

          {error && (
            <div className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}
        </div>
      </section>}
      </div>}
    </div>
  );
};
