import React from 'react';
import { LoginForm } from '../features/auth/LoginForm';
import { useLanguage } from '../context/LanguageContext';
export const LoginPage: React.FC = () => {
  const { t, dir } = useLanguage();

  return (
    <div
      className="h-screen bg-slate-950 bg-contain bg-center bg-no-repeat flex items-center justify-center p-4 relative"
      // style={{ backgroundImage: "url('/mujeeb-splashscreen.jfif')" }}
      dir={dir}
    >
      <div className="absolute inset-0 bg-slate-950/45" />
      <div className="relative bg-white/95 dark:bg-slate-900/95 rounded-lg shadow-xl p-4 w-full max-w-md">
        {/* <h1 className="text-3xl font-bold text-gray-900 mb-2 text-center">
          {t('layout.appName')}
        </h1> */}
    <img src="/mujeeb-splashscreen.jfif" alt="Mujeeb" className='w-full h-1/2 rounded-lg' />
      <p className="text-gray-600 dark:text-slate-300 text-center my-4">
          {t('auth.welcomeTitle')}
        </p>
        <LoginForm />
      </div>
    </div>
  );
};
