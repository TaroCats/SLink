import React, { useState, useEffect } from 'react';
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

  useEffect(() => {
    // Check if password is provided in the URL hash (e.g., #mypassword)
    const hash = window.location.hash;
    if (hash && hash.length > 1) {
      const hashPassword = hash.substring(1); // remove the '#'
      setPassword(hashPassword);
      verifyPassword(hashPassword);
    }
  }, [code]);

  const verifyPassword = async (pwdToVerify: string) => {
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/unlock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ short_code: code, password: pwdToVerify }),
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
      // Clear the hash from the URL so it doesn't stay there if it's wrong
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await verifyPassword(password);
  };

  return (
    <div className="min-h-screen relative flex flex-col items-center justify-center p-6 md:p-12 transition-colors duration-700 ease-apple">
      <div className="absolute top-6 right-6 flex items-center gap-4 z-20">
        <ThemeToggle />
        <LanguageSwitcher />
      </div>

      <div className="w-full max-w-md relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-700 ease-apple">
        <div className="glass-panel p-8 sm:p-12 transition-all duration-500 hover:shadow-2xl hover:shadow-accent-blue/10">
          <div className="flex flex-col items-center mb-10">
            <div className="relative group cursor-pointer mb-6">
              <div className="absolute -inset-4 bg-gradient-to-r from-accent-cyan to-accent-blue rounded-full blur-xl opacity-20 group-hover:opacity-40 transition duration-700"></div>
              <div className="relative bg-white/10 dark:bg-black/10 border border-white/20 dark:border-white/10 backdrop-blur-2xl p-5 rounded-[2rem] shadow-glass dark:shadow-glass-dark transform transition-all duration-liquid group-hover:scale-[1.05]">
                <Lock className="w-10 h-10 text-gray-900 dark:text-white" strokeWidth={2} />
              </div>
            </div>
            <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 mb-3 tracking-tight">{t('protected_link')}</h1>
            <p className="text-gray-500 dark:text-gray-400/90 text-center leading-relaxed tracking-tight">
              {t('protected_link_desc')}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                <Lock className="h-6 w-6 text-gray-400 dark:text-gray-500 group-focus-within:text-accent-blue transition-colors duration-500" />
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t('enter_password')}
                className="glass-input w-full pl-16 pr-6 py-5 rounded-[1.5rem] text-gray-900 dark:text-white text-xl font-medium tracking-tight placeholder-gray-400/80 dark:placeholder-gray-500/80"
              />
            </div>

            {error && (
              <div className="p-5 bg-red-500/10 backdrop-blur-xl border border-red-500/20 text-red-600 dark:text-red-400 rounded-[1.5rem] text-sm text-center animate-in slide-in-from-top-4 fade-in duration-500 font-medium">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !password}
              className="glass-button w-full py-5 flex items-center justify-center gap-3 text-lg tracking-wide disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {t('verifying')}
                </span>
              ) : (
                <>
                  {t('unlock_continue')}
                  <ArrowRight size={20} className="transition-transform group-hover:translate-x-1" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}