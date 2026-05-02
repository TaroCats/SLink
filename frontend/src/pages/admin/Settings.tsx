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
    <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 ease-apple">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 transition-colors tracking-tight">{t('settings')}</h1>
      </div>

      <div className="max-w-xl glass-panel p-8 sm:p-12 transition-all duration-500">
        <div className="flex items-center gap-4 mb-10">
          <div className="p-4 rounded-[1.2rem] bg-accent-blue/10 dark:bg-accent-blue/20">
            <KeyRound className="text-accent-blue dark:text-accent-cyan" size={24} strokeWidth={2} />
          </div>
          <div>
            <div className="text-xl font-extrabold text-gray-900 dark:text-white tracking-tight">{t('change_password')}</div>
            <div className="text-sm font-semibold text-gray-500 dark:text-gray-400 tracking-tight">{t('change_password_desc')}</div>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-5 bg-red-500/10 backdrop-blur-xl border border-red-500/20 text-red-600 dark:text-red-400 rounded-[1.5rem] text-sm text-center font-medium animate-in slide-in-from-top-4 fade-in duration-500">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-6 p-5 bg-green-500/10 backdrop-blur-xl border border-green-500/20 text-green-700 dark:text-green-400 rounded-[1.5rem] text-sm text-center font-medium animate-in slide-in-from-top-4 fade-in duration-500">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 ml-2 tracking-widest uppercase">
              {t('current_password')}
            </label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              autoComplete="current-password"
              className="mt-2 glass-input w-full px-6 py-4 rounded-[1.5rem] text-gray-900 dark:text-white font-medium tracking-tight text-lg"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 ml-2 tracking-widest uppercase">
              {t('new_password')}
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              autoComplete="new-password"
              className="mt-2 glass-input w-full px-6 py-4 rounded-[1.5rem] text-gray-900 dark:text-white font-medium tracking-tight text-lg"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 ml-2 tracking-widest uppercase">
              {t('confirm_password')}
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
              className="mt-2 glass-input w-full px-6 py-4 rounded-[1.5rem] text-gray-900 dark:text-white font-medium tracking-tight text-lg"
              required
            />
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="glass-button w-full py-5 flex items-center justify-center gap-3 text-lg tracking-wide disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {t('saving')}
                </span>
              ) : t('save_changes')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

