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
    <div className="flex h-screen bg-transparent transition-colors">
      {/* Sidebar */}
      <div className="w-64 backdrop-blur-2xl bg-white/70 dark:bg-[#1c1c1e]/70 border-r border-white/20 dark:border-gray-700/30 flex flex-col transition-colors z-20 shadow-[4px_0_24px_rgba(0,0,0,0.02)] dark:shadow-[4px_0_24px_rgba(0,0,0,0.2)]">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2 transition-colors tracking-tight">
            <LinkIcon className="text-indigo-600 dark:text-indigo-400" /> SLink Admin
          </h1>
        </div>
        
        <nav className="flex-1 px-4 space-y-2 mt-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={clsx(
                  'flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-300',
                  isActive
                    ? 'bg-indigo-600 dark:bg-indigo-500 text-white font-medium shadow-md shadow-indigo-500/20'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-white/50 dark:hover:bg-white/10 font-medium'
                )}
              >
                <Icon size={20} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-200/50 dark:border-gray-700/50 transition-colors">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3.5 w-full font-medium text-gray-600 dark:text-gray-400 hover:bg-red-50/80 dark:hover:bg-red-900/30 hover:text-red-600 dark:hover:text-red-400 rounded-2xl transition-all duration-300"
          >
            <LogOut size={20} />
            {t('logout')}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto flex flex-col relative z-10">
        <div className="absolute top-6 right-8 flex items-center gap-2 z-50">
          <ThemeToggle />
          <LanguageSwitcher />
        </div>
        <div className="p-8 md:p-12 mt-4">
          {children}
        </div>
      </div>
    </div>
  );
}