import React from 'react';
import { PageWrapper } from '../components/layout/PageWrapper';
import { UploadInventory } from '../features/inventory/UploadInventory';
import { useLanguage } from '../context/LanguageContext';

export const InventoryPage: React.FC = () => {
  const { t } = useLanguage();

  return (
    <PageWrapper>
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-slate-100">{t('inventory.title')}</h1>
          <p className="text-gray-600 dark:text-slate-300 mt-2">
            {t('inventory.subtitle')}
          </p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-8 rounded-lg shadow-sm border border-gray-200">
          <UploadInventory />
        </div>
      </div>
    </PageWrapper>
  );
};
