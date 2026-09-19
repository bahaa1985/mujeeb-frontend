import { createContext, useContext } from 'react';
// import en from '../i18n/en.json';
// import ar from '../i18n/ar.json';

type Language = 'en' | 'ar';

// type TranslationMap = typeof en;

interface LanguageContextType {
  language: Language;
  dir: 'ltr' | 'rtl';
  t: (path: string) => string;
  setLanguage: (language: Language) => void;
}

export const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
