import React from 'react';
import { useTranslation } from 'react-i18next';
import { useUIStore } from '../store';
import { Moon, Sun, Monitor, Globe } from 'lucide-react';

export const ThemeToggle = () => {
  const { theme, setTheme } = useUIStore();
  const { t } = useTranslation();

  const cycleTheme = () => {
    if (theme === 'light') setTheme('dark');
    else if (theme === 'dark') setTheme('system');
    else setTheme('light');
  };

  return (
    <button
      onClick={cycleTheme}
      className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors"
      title={theme === 'light' ? t('theme_light') : theme === 'dark' ? t('theme_dark') : t('theme_system')}
    >
      {theme === 'light' && <Sun size={20} />}
      {theme === 'dark' && <Moon size={20} />}
      {theme === 'system' && <Monitor size={20} />}
    </button>
  );
};

export const LanguageSwitcher = () => {
  const { lang, setLang } = useUIStore();

  return (
    <div className="relative group">
      <button className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors flex items-center gap-1">
        <Globe size={20} />
      </button>
      <div className="absolute right-0 mt-2 w-32 bg-white dark:bg-gray-800 rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all border border-gray-100 dark:border-gray-700 overflow-hidden">
        <button
          onClick={() => setLang('zh')}
          className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 ${lang === 'zh' ? 'text-blue-600 dark:text-blue-400 font-medium' : 'text-gray-700 dark:text-gray-300'}`}
        >
          中文
        </button>
        <button
          onClick={() => setLang('en')}
          className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 ${lang === 'en' ? 'text-blue-600 dark:text-blue-400 font-medium' : 'text-gray-700 dark:text-gray-300'}`}
        >
          English
        </button>
        <button
          onClick={() => setLang('ja')}
          className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 ${lang === 'ja' ? 'text-blue-600 dark:text-blue-400 font-medium' : 'text-gray-700 dark:text-gray-300'}`}
        >
          日本語
        </button>
      </div>
    </div>
  );
};
