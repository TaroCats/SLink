import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import { useAuthStore } from '../store';
import { Link2 } from 'lucide-react';
import { ThemeToggle, LanguageSwitcher } from '../components/UIControls';
import { useTranslation } from 'react-i18next';

export default function Login() {
  const { t } = useTranslation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const setToken = useAuthStore((state) => state.setToken);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await api.adminLogin({ username, password });
      setToken(res.token);
      navigate('/admin/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex flex-col justify-center px-4 py-12 sm:px-6 lg:px-8 transition-colors duration-700 ease-apple">
      <div className="absolute top-6 right-6 flex items-center gap-4 z-20">
        <ThemeToggle />
        <LanguageSwitcher />
      </div>

      <div className="w-full sm:mx-auto sm:max-w-md relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-700 ease-apple">
        <div className="flex justify-center mb-6">
          <div className="relative group cursor-pointer">
            <div className="absolute -inset-4 bg-gradient-to-r from-accent-cyan to-accent-blue rounded-full blur-xl opacity-20 group-hover:opacity-40 transition duration-700"></div>
            <div className="relative bg-white/10 dark:bg-black/10 border border-white/20 dark:border-white/10 backdrop-blur-2xl p-5 rounded-[2rem] shadow-glass dark:shadow-glass-dark transform transition-all duration-liquid group-hover:scale-[1.05]">
              <Link2 className="text-gray-900 dark:text-white w-10 h-10" strokeWidth={2} />
            </div>
          </div>
        </div>
        <h2 className="mt-2 text-center text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 tracking-tight leading-tight transition-colors">
          {t('admin_login')}
        </h2>
      </div>

      <div className="mt-10 w-full sm:mx-auto sm:max-w-md relative z-10 animate-in fade-in slide-in-from-bottom-12 duration-1000 ease-apple delay-150">
        <div className="glass-panel py-10 px-6 sm:px-10 transition-all duration-500 hover:shadow-2xl hover:shadow-accent-blue/10">
          <form className="space-y-8" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 ml-2 tracking-widest uppercase">
                {t('username')}
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="glass-input w-full px-6 py-4 rounded-[1.5rem] text-gray-900 dark:text-white placeholder-gray-400/80 dark:placeholder-gray-500/80 text-lg font-medium"
                />
              </div>
            </div>

            <div className="space-y-4">
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 ml-2 tracking-widest uppercase">
                {t('password')}
              </label>
              <div className="mt-1">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="glass-input w-full px-6 py-4 rounded-[1.5rem] text-gray-900 dark:text-white placeholder-gray-400/80 dark:placeholder-gray-500/80 text-lg font-medium"
                />
              </div>
            </div>

            {error && (
              <div className="p-5 bg-red-500/10 backdrop-blur-xl border border-red-500/20 text-red-600 dark:text-red-400 rounded-[1.5rem] text-sm text-center animate-in slide-in-from-top-4 fade-in duration-500 font-medium">
                {error}
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="glass-button w-full py-5 flex items-center justify-center gap-3 text-lg tracking-wide disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Signing in...
                  </span>
                ) : (
                  t('login')
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}