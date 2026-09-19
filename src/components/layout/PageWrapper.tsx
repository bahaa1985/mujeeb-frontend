import React, { useState } from 'react';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { useAuth } from '../../context/AuthContext';
import { getRoleTheme } from '../../utils/theme';
import { useLanguage } from '../../context/LanguageContext';
import { ChevronRight, ChevronLeft, Menu } from '@mui/icons-material';

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
      <div className="flex min-h-screen relative">
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
                <main className={`flex-1 p-2 sm:p-8 bg-gray-50/50 transition-all duration-300 ${
                  showSidebar ? (dir === 'rtl' ? 'md:mr-64' : 'md:ml-64') : ''
                }`}>
          <div className="max-w-7xl mx-auto">
            <div className="rounded-3xl bg-white dark:bg-slate-900 border border-gray-100 p-4 sm:p-8 shadow-sm">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};


