import React from 'react';
import { PageWrapper } from '../components/layout/PageWrapper';
import { MessagesList } from '../features/messages/MessagesList';
import { useLanguage } from '../context/LanguageContext';

export const MessagesPage: React.FC = () => {
  const { t } = useLanguage();

  return (
    <PageWrapper>
      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-x-hidden sm:gap-8">
        <div className="shrink-0 px-1 sm:px-0">
          <h1 className="text-2xl sm:text-4xl font-bold text-gray-900 dark:text-slate-100">{t('messages.title')}</h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-slate-300 mt-1 sm:mt-2">
            {t('messages.subtitle')}
          </p>
        </div>
        <div className="min-h-0 min-w-0 flex-1">
          <MessagesList />
        </div>
      </div>
    </PageWrapper>
  );
};
