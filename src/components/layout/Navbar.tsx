import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { getRoleTheme } from '../../utils/theme';
import { useTheme } from '../../context/ThemeContext';
import { DarkMode, LightMode } from '@mui/icons-material';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const { t, dir } = useLanguage();
  const { theme: currentTheme, toggleTheme } = useTheme();
  const theme = getRoleTheme(user?.role_id);
  const handleLogout = async () => {
    await logout();
  };

    return (
      <nav className="sticky top-0 z-10 bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800 transition-colors duration-300" dir={dir}>
      <div className={`w-full px-4 sm:px-6 h-16 flex items-center justify-end`}>
        {/* <Link to="/dashboard" className={`text-lg sm:text-2xl font-bold bg-gradient-to-r ${theme.shell} bg-clip-text text-transparent`}>
          <img src="/mujeeb-navbar-light.png" width={200} className='h-16 object-contain dark:hidden' alt="Mujeeb" />
          <img src="/mujeeb-navbar-ldark.png" width={200} className='hidden h-16 object-contain dark:block' alt="Mujeeb" />
        </Link> */}
        <div className={`flex items-center gap-x-4 ${dir === 'rtl' ? 'justify-end' : 'justify-start'}`}>
          <button
            type="button"
            onClick={toggleTheme}
            className="p-2 rounded-full text-gray-600 hover:bg-gray-100 dark:text-yellow-300 dark:hover:bg-slate-800 transition-colors"
            aria-label={currentTheme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
            title={currentTheme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
          >
            {currentTheme === 'light' ? <DarkMode /> : <LightMode />}
          </button>
          <Link to={`/users/${user?.id}`} className="flex items-center">
            <span className="text-xs sm:text-sm font-medium text-gray-600 dark:text-slate-300 hover:text-gray-900 dark:hover:text-white bg-gray-50 dark:bg-slate-800 px-3 py-1.5 rounded-full transition-colors">
              {user?.username}
            </span>
          </Link>

          <img src={user?.avatar} className='rounded-full w-10 h-10 m-auto' />
          <button
            onClick={handleLogout}
            className={`px-3 py-1.5 sm:px-5 sm:py-2 text-xs sm:text-sm rounded-full transition-all duration-200 ${theme.accent} text-white font-semibold shadow-sm hover:shadow-md active:scale-95`}
          >
            {t('common.logout')}
          </button>
        </div>
      </div>
    </nav>
  );
};


