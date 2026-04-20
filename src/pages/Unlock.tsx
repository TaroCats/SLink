import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Lock, ArrowRight } from 'lucide-react';
import { ThemeToggle, LanguageSwitcher } from '../components/UIControls';
import { useTranslation } from 'react-i18next';

export default function Unlock() {
  const { code } = useParams();
  const { t } = useTranslation();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/unlock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ short_code: code, password }),
      });
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || t('invalid_password'));
      }
      
      if (data.original_url) {
        window.location.href = data.original_url;
      }
    } catch (err: any) {
      setError(err.message || t('verification_failed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex flex-col items-center justify-center p-4 transition-colors">
      <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
        <ThemeToggle />
        <LanguageSwitcher />
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="backdrop-blur-2xl bg-white/70 dark:bg-[#1c1c1e]/70 border border-white/20 dark:border-gray-700/30 rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.08)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)] p-8 sm:p-10 transition-all duration-300">
          <div className="flex flex-col items-center mb-10">
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-4 rounded-2xl mb-6 shadow-lg shadow-indigo-500/30 transform transition-transform hover:scale-105 duration-300">
              <Lock className="w-8 h-8 text-white" strokeWidth={2.5} />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3 tracking-tight">{t('protected_link')}</h1>
            <p className="text-gray-500 dark:text-gray-400 text-center leading-relaxed">
              {t('protected_link_desc')}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400 dark:text-gray-500 group-focus-within:text-indigo-500 dark:group-focus-within:text-indigo-400 transition-colors" />
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t('enter_password')}
                className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-200/50 dark:border-gray-700/50 bg-white/50 dark:bg-black/20 text-gray-900 dark:text-white placeholder-gray-400 focus:bg-white/80 dark:focus:bg-black/40 focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500/50 backdrop-blur-md shadow-inner transition-all duration-300 outline-none text-lg font-medium"
              />
            </div>

            {error && (
              <div className="p-4 bg-red-50/80 dark:bg-red-900/20 backdrop-blur-md border border-red-100/50 dark:border-red-800/30 text-red-600 dark:text-red-400 rounded-2xl text-sm text-center animate-in slide-in-from-top-2 fade-in duration-300 font-medium">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !password}
              className="w-full py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-black dark:hover:bg-gray-100 rounded-2xl font-semibold text-lg flex items-center justify-center gap-2 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-40 disabled:hover:shadow-lg active:scale-[0.98]"
            >
              {loading ? t('verifying') : t('unlock_continue')}
              {!loading && <ArrowRight size={20} className="transition-transform group-hover:translate-x-1" />}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}