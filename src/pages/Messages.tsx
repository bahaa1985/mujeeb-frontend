import React from 'react';
import { PageWrapper } from '../components/layout/PageWrapper';
import { MessagesList } from '../features/messages/MessagesList';
import { useLanguage } from '../context/LanguageContext';

export const MessagesPage: React.FC = () => {
  const { t } = useLanguage();

  return (
        <PageWrapper>
      <div className="space-y-4 sm:space-y-8 h-full flex flex-col">
        <div className="px-4 sm:px-0">
          <h1 className="text-2xl sm:text-4xl font-bold text-gray-900 dark:text-slate-100">{t('messages.title')}</h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-slate-300 mt-1 sm:mt-2">
            {t('messages.subtitle')}
          </p>
        </div>
        <div className="flex-1 min-h-0">
          <MessagesList />
        </div>
      </div>
    </PageWrapper>

  );
};
