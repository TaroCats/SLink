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
    <div className="min-h-screen relative flex flex-col justify-center py-12 sm:px-6 lg:px-8 transition-colors">
      <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
        <ThemeToggle />
        <LanguageSwitcher />
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex justify-center">
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-4 rounded-3xl shadow-lg shadow-indigo-500/30 transform transition-transform hover:scale-105 duration-300">
            <Link2 className="text-white w-10 h-10" strokeWidth={2.5} />
          </div>
        </div>
        <h2 className="mt-6 text-center text-4xl font-bold text-gray-900 dark:text-white tracking-tight transition-colors">
          {t('admin_login')}
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="backdrop-blur-2xl bg-white/70 dark:bg-[#1c1c1e]/70 border border-white/20 dark:border-gray-700/30 rounded-[2rem] shadow-[0_8px_32px_rgba(0,0,0,0.08)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)] py-10 px-6 sm:px-10 transition-all duration-300">
          <form className="space-y-8" onSubmit={handleSubmit}>
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 ml-2 tracking-wide uppercase opacity-80">
                {t('username')}
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-5 py-4 rounded-2xl border border-gray-200/50 dark:border-gray-700/50 bg-white/50 dark:bg-black/20 text-gray-900 dark:text-white placeholder-gray-400 focus:bg-white/80 dark:focus:bg-black/40 focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500/50 backdrop-blur-md shadow-inner transition-all duration-300 outline-none font-medium text-lg"
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 ml-2 tracking-wide uppercase opacity-80">
                {t('password')}
              </label>
              <div className="mt-1">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-5 py-4 rounded-2xl border border-gray-200/50 dark:border-gray-700/50 bg-white/50 dark:bg-black/20 text-gray-900 dark:text-white placeholder-gray-400 focus:bg-white/80 dark:focus:bg-black/40 focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500/50 backdrop-blur-md shadow-inner transition-all duration-300 outline-none font-medium text-lg"
                />
              </div>
            </div>

            {error && (
              <div className="p-4 bg-red-50/80 dark:bg-red-900/20 backdrop-blur-md border border-red-100/50 dark:border-red-800/30 text-red-600 dark:text-red-400 rounded-2xl text-sm text-center animate-in slide-in-from-top-2 fade-in duration-300 font-medium">
                {error}
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-black dark:hover:bg-gray-100 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-40 disabled:hover:shadow-lg active:scale-[0.98]"
              >
                {loading ? 'Signing in...' : t('login')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}