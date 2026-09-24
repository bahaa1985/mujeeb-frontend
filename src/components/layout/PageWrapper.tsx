import React, { useState } from 'react';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { useAuth } from '../../context/AuthContext';
import { getRoleTheme } from '../../utils/theme';
import { useLanguage } from '../../context/LanguageContext';
import { ChevronRight, ChevronLeft, Menu } from '@mui/icons-material';
import packageJson from '../../../package.json';

interface PageWrapperProps {
  children: React.ReactNode;
  showSidebar?: boolean;
}

export const PageWrapper: React.FC<PageWrapperProps> = ({
  children,
  showSidebar = true,
}) => {
  const { user } = useAuth();
  const { dir } = useLanguage();
  const theme = getRoleTheme(user?.role_id);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className={`min-h-screen z-0 bg-gray-50 ${dir === 'rtl' ? 'rtl' : 'ltr'}`} dir={dir}>
      <Navbar />
      <div className="flex min-h-screen min-w-0 relative">
        {showSidebar && (
          <>
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
            
            {/* Toggle Button for Mobile */}
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className={`md:hidden fixed top-1/2 -translate-y-1/2 z-[60] flex items-center justify-center w-8 h-12 shadow-lg transition-all duration-300 bg-gradient-to-b ${theme.shell} text-white ${
                isSidebarOpen 
                  ? (dir === 'rtl' ? 'right-64 rounded-l-md' : 'left-64 rounded-r-md') 
                  : (dir === 'rtl' ? 'right-0 rounded-l-md' : 'left-0 rounded-r-md')
              }`}
              aria-label="Toggle Sidebar"
            >
              {isSidebarOpen ? (
                dir === 'rtl' ? <ChevronRight fontSize="small" /> : <ChevronLeft fontSize="small" />
              ) : (
                <Menu fontSize="small" />
              )}
            </button>
          </>
        )}
                <main className={`min-w-0 flex-1 flex flex-col sm:p-8 bg-gray-50/50 transition-all duration-300 ${
                  showSidebar ? (dir === 'rtl' ? 'md:mr-64' : 'md:ml-64') : ''
                }`}>
          <div className="w-full max-w-7xl mx-auto flex-1">
            <div className=" sm:rounded-3xl bg-white dark:bg-slate-900 sm:border sm:border-gray-100 p-2 sm:p-4 shadow-sm">
              {children}
            </div>
          </div>
          
        </main>
      </div>
      <footer className="relative z-[9999] w-full h-[10%] mx-auto mt-6 bg-gray-50 px-3 pb-3 text-gray-500 dark:bg-slate-900 dark:text-slate-400 sm:mt-8 sm:px-2 sm:pb-0">
            <div className="flex flex-col items-center justify-between gap-3 border-t border-gray-200 py-4 text-center dark:border-slate-800 sm:flex-row sm:text-start">
              <img
                src="/mujeeb-navbar-light.png"
                alt="Mujeeb"
                className="h-8 w-auto object-contain dark:hidden"
              />
              <img
                src="/mujeeb-navbar-ldark.png"
                alt="Mujeeb"
                className="hidden h-8 w-auto object-contain dark:block"
              />
              <p className="text-xs">
                Mujeeb v{packageJson.version} | Owned and developed by Bahaa Salah - 01221483799
              </p>
            </div>
          </footer>
    </div>
  );
};


