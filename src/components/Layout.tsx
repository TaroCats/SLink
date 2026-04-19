import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store';
import { LayoutDashboard, Link as LinkIcon, Globe, LogOut } from 'lucide-react';
import clsx from 'clsx';
import { ThemeToggle, LanguageSwitcher } from './UIControls';
import { useTranslation } from 'react-i18next';

export default function Layout({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);

  const handleLogout = () => {
    logout();
    navigate('/admin');
  };

  const navItems = [
    { name: t('dashboard'), path: '/admin/dashboard', icon: LayoutDashboard },
    { name: t('links'), path: '/admin/links', icon: LinkIcon },
    { name: t('domains'), path: '/admin/domains', icon: Globe },
  ];

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      {/* Sidebar */}
      <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col transition-colors">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2 transition-colors">
            <LinkIcon className="text-indigo-600 dark:text-indigo-400" /> SLink Admin
          </h1>
        </div>
        
        <nav className="flex-1 px-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={clsx(
                  'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
                  isActive
                    ? 'bg-indigo-50 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 font-medium'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                )}
              >
                <Icon size={20} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-200 dark:border-gray-700 transition-colors">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full text-gray-600 dark:text-gray-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 rounded-lg transition-colors"
          >
            <LogOut size={20} />
            {t('logout')}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto flex flex-col relative">
        <div className="absolute top-4 right-8 flex items-center gap-2 z-10">
          <ThemeToggle />
          <LanguageSwitcher />
        </div>
        <div className="p-8 mt-12">
          {children}
        </div>
      </div>
    </div>
  );
}