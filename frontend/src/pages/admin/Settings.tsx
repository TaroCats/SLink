import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../../api';
import { KeyRound } from 'lucide-react';

export default function Settings() {
  const { t } = useTranslation();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword.trim().length < 8) {
      setError(t('password_min_length'));
      return;
    }
    if (newPassword !== confirmPassword) {
      setError(t('password_mismatch'));
      return;
    }

    setLoading(true);
    try {
      await api.changePassword({
        current_password: currentPassword,
        new_password: newPassword,
      });
      setSuccess(t('password_updated'));
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (e: any) {
      setError(e?.message || 'API Request Failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white transition-colors">{t('settings')}</h1>
      </div>

      <div className="max-w-xl backdrop-blur-2xl bg-white/70 dark:bg-[#1c1c1e]/70 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.04)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.2)] border border-white/20 dark:border-gray-700/30 p-8 transition-all duration-300">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-2xl bg-indigo-600/10 dark:bg-indigo-500/10">
            <KeyRound className="text-indigo-600 dark:text-indigo-400" size={22} />
          </div>
          <div>
            <div className="text-lg font-bold text-gray-900 dark:text-white">{t('change_password')}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">{t('change_password_desc')}</div>
          </div>
        </div>

        {error && (
          <div className="mb-5 p-4 bg-red-50/80 dark:bg-red-900/20 backdrop-blur-md border border-red-100/50 dark:border-red-800/30 text-red-600 dark:text-red-400 rounded-2xl text-sm text-center font-medium">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-5 p-4 bg-green-50/80 dark:bg-green-900/20 backdrop-blur-md border border-green-100/50 dark:border-green-800/30 text-green-700 dark:text-green-400 rounded-2xl text-sm text-center font-medium">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 ml-2 tracking-wide uppercase opacity-80">
              {t('current_password')}
            </label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              autoComplete="current-password"
              className="mt-2 w-full px-5 py-4 rounded-2xl border border-gray-200/50 dark:border-gray-700/50 bg-white/50 dark:bg-black/20 text-gray-900 dark:text-white placeholder-gray-400 focus:bg-white/80 dark:focus:bg-black/40 focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500/50 backdrop-blur-md shadow-inner transition-all duration-300 outline-none font-medium"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 ml-2 tracking-wide uppercase opacity-80">
              {t('new_password')}
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              autoComplete="new-password"
              className="mt-2 w-full px-5 py-4 rounded-2xl border border-gray-200/50 dark:border-gray-700/50 bg-white/50 dark:bg-black/20 text-gray-900 dark:text-white placeholder-gray-400 focus:bg-white/80 dark:focus:bg-black/40 focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500/50 backdrop-blur-md shadow-inner transition-all duration-300 outline-none font-medium"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 ml-2 tracking-wide uppercase opacity-80">
              {t('confirm_password')}
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
              className="mt-2 w-full px-5 py-4 rounded-2xl border border-gray-200/50 dark:border-gray-700/50 bg-white/50 dark:bg-black/20 text-gray-900 dark:text-white placeholder-gray-400 focus:bg-white/80 dark:focus:bg-black/40 focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500/50 backdrop-blur-md shadow-inner transition-all duration-300 outline-none font-medium"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-black dark:hover:bg-gray-100 rounded-2xl font-bold text-base flex items-center justify-center gap-2 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-40 active:scale-[0.98]"
          >
            {loading ? t('saving') : t('save_changes')}
          </button>
        </form>
      </div>
    </div>
  );
}

