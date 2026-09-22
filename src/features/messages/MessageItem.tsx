import React from 'react';
import type { Message } from '../../types/message';
import { useLanguage } from '../../context/LanguageContext';

interface MessageItemProps {
  message: Message;
  senderName: string;
  isOwnMessage: boolean;
  alignRight: boolean;
  isEditing: boolean;
  editingText: string;
  onEditingTextChange: (text: string) => void;
}

export const MessageItem: React.FC<MessageItemProps> = ({
  message,
  senderName,
  isOwnMessage,
  alignRight,
  isEditing,
  editingText,
  onEditingTextChange,
}) => {
  const { t, language } = useLanguage();

  return (
    <div className={`flex min-w-0 w-full ${alignRight ? 'justify-end' : 'justify-start'} items-start gap-2 sm:gap-3`}>
      <div
        className={`min-w-0 max-w-[92%] rounded-3xl border px-3 py-2.5 shadow-sm sm:max-w-[80%] sm:px-4 sm:py-3 ${
          isOwnMessage
            ? 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/40'
            : 'border-gray-200 bg-white dark:border-slate-700 dark:bg-slate-800'
        }`}
      >
        <div className="mb-2 min-w-0 break-words text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-slate-300">
          {senderName}
        </div>
        {isEditing ? (
          <textarea
            value={editingText}
            onChange={(event) => onEditingTextChange(event.target.value)}
            rows={3}
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-blue-400 dark:focus:ring-blue-900"
          />
        ) : (
          <>
            {message.image_url ? (
              <img
                src={message.image_url}
                alt="Client media"
                className="h-auto max-h-80 max-w-full rounded-xl object-contain"
              />
            ) : (
              <p className="break-words whitespace-pre-wrap text-sm text-gray-900 dark:text-slate-100">
                {message.message || t('messages.noContent')}
              </p>
            )}
            <div className="mt-3 flex items-center justify-between gap-3 text-xs text-gray-500 dark:text-slate-400">
              <span>
                {new Date(message.created_at).toLocaleTimeString(
                  language === 'ar' ? 'ar-EG' : 'en-US',
                  { hour: '2-digit', minute: '2-digit' },
                )}
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

