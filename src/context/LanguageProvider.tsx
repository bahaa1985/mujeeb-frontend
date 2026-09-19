import { LanguageContext } from "./LanguageContext";
// import {LanguageContextType} from "./LanguageContext";
import {useState, useEffect, useMemo} from "react";
import en from '../i18n/en.json';
import ar from '../i18n/ar.json';

type Language = 'en' | 'ar';

type TranslationMap = typeof en;

interface LanguageContextType {
  language: Language;
  dir: 'ltr' | 'rtl';
  t: (path: string) => string;
  setLanguage: (language: Language) => void;
}

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
  try {
    // التأكد من وجود window لتجنب أخطاء الـ SSR لو بتستخدم Next.js مثلاً
    if (typeof window !== 'undefined') {
      const storedToken = window.localStorage.getItem('pharmacydb-settings-token');
      if (storedToken) {
        const parsed = JSON.parse(storedToken) as { language?: Language };
        if (parsed.language === 'en' || parsed.language === 'ar') {
          return parsed.language; // لو لقى لغة صحيحة هيرجعها
        }
      }
    }
  } catch {
    // تجاهل الخطأ في حالة الـ token غير صالح
  }
  
  // القيمة الافتراضية اللي هيرجعها لو مفيش حاجة متسجلة في localStorage
  return 'ar'; // أو 'en' حسب ما تفضل
});

  const dictionaries: Record<Language, TranslationMap> = {
  en,
  ar,
};

const getValueAtPath = (obj: Record<string, unknown>, path: string): string => {
  return path.split('.').reduce<unknown>((acc, key) => {
    if (acc && typeof acc === 'object' && key in acc) {
      return (acc as Record<string, unknown>)[key];
    }
    return undefined;
  }, obj as Record<string, unknown>) as string | undefined ?? path;
};


  useEffect(() => {
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
    window.localStorage.setItem('pharmacydb-settings-token', JSON.stringify({ language }));
  }, [language]);

  const setLanguage = (nextLanguage: Language) => {
    setLanguageState(nextLanguage);
  };

  const t = useMemo(() => {
    return (path: string) => {
      const value = getValueAtPath(dictionaries[language] as unknown as Record<string, unknown>, path);
      return typeof value === 'string' ? value : path;
    };
  }, [language]);

  const value = useMemo<LanguageContextType>(() => ({
    language,
    dir: language === 'ar' ? 'rtl' : 'ltr',
    t,
    setLanguage,
  }), [language, t]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};