import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store';
import { LayoutDashboard, Link as LinkIcon, Globe, LogOut, Settings2, Menu, X } from 'lucide-react';
import clsx from 'clsx';
import { ThemeToggle, LanguageSwitcher } from './UIControls';
import { useTranslation } from 'react-i18next';

export default function Layout({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/admin');
  };

  const navItems = [
    { name: t('dashboard'), path: '/admin/dashboard', icon: LayoutDashboard },
    { name: t('links'), path: '/admin/links', icon: LinkIcon },
    { name: t('domains'), path: '/admin/domains', icon: Globe },
    { name: t('settings'), path: '/admin/settings', icon: Settings2 },
  ];

  return (
    <div className="flex h-screen bg-transparent transition-colors duration-700 ease-apple">
      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/20 dark:bg-black/40 backdrop-blur-sm z-30 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={clsx(
        "fixed md:relative w-64 glass-panel m-6 mr-0 flex flex-col transition-all duration-500 ease-apple z-40 overflow-hidden shadow-2xl h-[calc(100vh-3rem)]",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-[120%] md:translate-x-0"
      )}>
        <div className="p-8 flex items-center justify-between">
          <h1 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 flex items-center gap-3 transition-colors tracking-tight">
            <LinkIcon className="text-accent-blue dark:text-accent-cyan" strokeWidth={2.5} /> SLink
          </h1>
          <button 
            className="md:hidden text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <X size={24} />
          </button>
        </div>
        
        <nav className="flex-1 px-4 space-y-2 mt-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={clsx(
                  'flex items-center gap-3 px-5 py-4 rounded-[1.2rem] transition-all duration-500 ease-apple',
                  isActive
                    ? 'bg-accent-blue/10 dark:bg-accent-blue/20 text-accent-blue dark:text-accent-cyan font-bold shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-white/50 dark:hover:bg-white/10 font-semibold hover:text-gray-900 dark:hover:text-gray-200'
                )}
              >
                <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-200/30 dark:border-white/10 transition-colors">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-5 py-4 w-full font-bold text-gray-600 dark:text-gray-400 hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400 rounded-[1.2rem] transition-all duration-500 ease-apple"
          >
            <LogOut size={20} strokeWidth={2} />
            {t('logout')}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto flex flex-col relative z-10 w-full">
        <div className="sticky top-0 right-0 w-full flex justify-between md:justify-end items-center p-4 md:p-6 md:px-10 gap-4 z-20">
          <button 
            className="md:hidden bg-white/40 dark:bg-black/20 backdrop-blur-xl border border-white/40 dark:border-white/10 p-3 rounded-full flex items-center justify-center text-gray-700 dark:text-gray-300 shadow-sm hover:bg-white/60 dark:hover:bg-black/40 transition-colors"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-4 bg-white/40 dark:bg-black/20 backdrop-blur-xl border border-white/40 dark:border-white/10 p-2 rounded-[1.5rem] shadow-sm ml-auto">
            <ThemeToggle />
            <LanguageSwitcher />
          </div>
        </div>
        <div className="px-4 md:px-10 pb-12 w-full max-w-full">
          {children}
        </div>
      </div>
    </div>
  );
}
