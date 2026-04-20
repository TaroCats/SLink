import React, { useEffect, useState } from 'react';
import { api } from '../../api';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { BarChart3, Clock, Lock, Pencil, Trash2, X } from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

export default function Links() {
  const { t } = useTranslation();
  const [links, setLinks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingLink, setEditingLink] = useState<any | null>(null);
  const [editExpiresAt, setEditExpiresAt] = useState<Date | null>(null);
  const [editPassword, setEditPassword] = useState('');
  const [clearPassword, setClearPassword] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadLinks = async () => {
      try {
        const res = await api.getLinks();
        setLinks(res.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    loadLinks();
  }, []);

  if (loading) return <div className="text-gray-500 dark:text-gray-400">{t('loading_links')}</div>;

  const refresh = async () => {
    const res = await api.getLinks();
    setLinks(res.data);
  };

  const openEdit = (link: any) => {
    setError('');
    setEditingLink(link);
    setEditExpiresAt(link.expires_at ? new Date(link.expires_at) : null);
    setEditPassword('');
    setClearPassword(false);
  };

  const closeEdit = () => {
    setEditingLink(null);
    setEditExpiresAt(null);
    setEditPassword('');
    setClearPassword(false);
    setSaving(false);
    setError('');
  };

  const handleDelete = async (id: string) => {
    setError('');
    if (!window.confirm(t('confirm_delete_link'))) return;
    try {
      await api.deleteLink(id);
      await refresh();
    } catch (e: any) {
      setError(e?.message || 'API Request Failed');
    }
  };

  const handleSave = async () => {
    if (!editingLink) return;
    setError('');
    setSaving(true);
    try {
      const payload: any = {};
      const originalExpiry = editingLink.expires_at ? new Date(editingLink.expires_at).getTime() : null;
      const nextExpiry = editExpiresAt ? editExpiresAt.getTime() : null;
      if (originalExpiry !== nextExpiry) {
        payload.expires_at = editExpiresAt ? editExpiresAt.toISOString() : null;
      }

      if (clearPassword) {
        payload.password = null;
      } else if (editPassword.trim()) {
        payload.password = editPassword.trim();
      }

      if (Object.keys(payload).length > 0) {
        await api.updateLink(editingLink.id, payload);
        await refresh();
      }

      closeEdit();
    } catch (e: any) {
      setError(e?.message || 'API Request Failed');
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white transition-colors">{t('links')}</h1>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50/80 dark:bg-red-900/20 backdrop-blur-md border border-red-100/50 dark:border-red-800/30 text-red-600 dark:text-red-400 rounded-2xl text-sm text-center font-medium">
          {error}
        </div>
      )}

      <div className="backdrop-blur-2xl bg-white/70 dark:bg-[#1c1c1e]/70 shadow-[0_8px_32px_rgba(0,0,0,0.04)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.2)] border border-white/20 dark:border-gray-700/30 rounded-2xl overflow-hidden transition-all duration-300">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-white/40 dark:bg-black/20 border-b border-gray-200/50 dark:border-gray-700/50 transition-colors backdrop-blur-md">
              <tr>
                <th className="px-6 py-4 text-sm font-medium text-gray-500 dark:text-gray-400 transition-colors">{t('short_code')}</th>
                <th className="px-6 py-4 text-sm font-medium text-gray-500 dark:text-gray-400 transition-colors">{t('original_url')}</th>
                <th className="px-6 py-4 text-sm font-medium text-gray-500 dark:text-gray-400 transition-colors">{t('clicks')}</th>
                <th className="px-6 py-4 text-sm font-medium text-gray-500 dark:text-gray-400 transition-colors">{t('created_at')}</th>
                <th className="px-6 py-4 text-sm font-medium text-gray-500 dark:text-gray-400 transition-colors">{t('features')}</th>
                <th className="px-6 py-4 text-sm font-medium text-gray-500 dark:text-gray-400 transition-colors">{t('status')}</th>
                <th className="px-6 py-4 text-sm font-medium text-gray-500 dark:text-gray-400 transition-colors text-right">{t('actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200/50 dark:divide-gray-700/50 transition-colors">
              {links.map((link) => (
                <tr key={link.id} className="hover:bg-white/50 dark:hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 font-medium text-indigo-600 dark:text-indigo-400">
                    <a href={`/${link.short_code}`} target="_blank" rel="noreferrer">
                      /{link.short_code}
                    </a>
                  </td>
                  <td className="px-6 py-4 text-gray-600 dark:text-gray-300 truncate max-w-xs transition-colors" title={link.original_url}>
                    {link.original_url}
                  </td>
                  <td className="px-6 py-4 text-gray-900 dark:text-gray-100 transition-colors">{link.click_count}</td>
                  <td className="px-6 py-4 text-gray-500 dark:text-gray-400 transition-colors">
                    {new Date(link.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      {link.expires_at && (
                        <div className="flex items-center gap-1 text-xs px-2 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-full" title={`Expires: ${new Date(link.expires_at).toLocaleString()}`}>
                          <Clock size={12} /> {t('expiry')}
                        </div>
                      )}
                      {link.has_password === 1 && (
                        <div className="flex items-center gap-1 text-xs px-2 py-1 bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 rounded-full" title="Password Protected">
                          <Lock size={12} /> {t('protected')}
                        </div>
                      )}
                    </div>
                    <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                      <div>
                        {t('expiry')}: {link.expires_at ? new Date(link.expires_at).toLocaleString() : t('no_expiry')}
                      </div>
                      <div>
                        {t('protected')}: {link.has_password === 1 ? t('yes') : t('no')}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      link.is_active === 1 ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400' : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400'
                    }`}>
                      {link.is_active === 1 ? t('active') : t('disabled')}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="inline-flex items-center gap-4">
                      <button
                        type="button"
                        onClick={() => openEdit(link)}
                        className="inline-flex items-center gap-1 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                      >
                        <Pencil size={16} />
                        {t('edit')}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(link.id)}
                        className="inline-flex items-center gap-1 text-sm font-medium text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors"
                      >
                        <Trash2 size={16} />
                        {t('delete')}
                      </button>
                      <Link
                        to={`/admin/links/${link.id}/stats`}
                        className="inline-flex items-center gap-1 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
                      >
                        <BarChart3 size={16} />
                        {t('stats')}
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
              {links.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400 transition-colors">
                    {t('no_links_found')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {editingLink && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-lg backdrop-blur-2xl bg-white/80 dark:bg-[#1c1c1e]/80 border border-white/30 dark:border-gray-700/40 rounded-3xl shadow-[0_16px_48px_rgba(0,0,0,0.18)] p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">{t('edit_link')}</h2>
              <button
                type="button"
                onClick={closeEdit}
                className="p-2 rounded-2xl hover:bg-white/60 dark:hover:bg-white/10 transition-colors"
              >
                <X size={18} className="text-gray-600 dark:text-gray-300" />
              </button>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 ml-2 tracking-wide uppercase opacity-80">
                  {t('expiration_datetime')}
                </label>
                <div className="mt-2">
                  <DatePicker
                    selected={editExpiresAt}
                    onChange={(date) => setEditExpiresAt(date)}
                    showPopperArrow={false}
                    showTimeSelect
                    timeFormat="HH:mm"
                    timeIntervals={15}
                    timeCaption="Time"
                    dateFormat="yyyy-MM-dd HH:mm"
                    placeholderText={t('no_expiry')}
                    className="w-full px-5 py-4 rounded-2xl border border-gray-200/50 dark:border-gray-700/50 bg-white/50 dark:bg-black/20 text-gray-900 dark:text-white focus:bg-white/80 dark:focus:bg-black/40 focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500/50 backdrop-blur-md shadow-inner transition-all duration-300 outline-none font-medium placeholder-gray-400 dark:placeholder-gray-500"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setEditExpiresAt(null)}
                  className="mt-2 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  {t('clear_expiry')}
                </button>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 ml-2 tracking-wide uppercase opacity-80">
                  {t('password_protection')}
                </label>
                <div className="mt-2 space-y-3">
                  <input
                    type="text"
                    value={editPassword}
                    onChange={(e) => setEditPassword(e.target.value)}
                    disabled={clearPassword}
                    placeholder={t('set_new_password_placeholder')}
                    className="w-full px-5 py-4 rounded-2xl border border-gray-200/50 dark:border-gray-700/50 bg-white/50 dark:bg-black/20 text-gray-900 dark:text-white placeholder-gray-400 focus:bg-white/80 dark:focus:bg-black/40 focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500/50 backdrop-blur-md shadow-inner transition-all duration-300 outline-none font-medium disabled:opacity-50"
                  />
                  <label className="flex items-center gap-3 text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer group">
                    <div className="relative flex items-center justify-center">
                      <input
                        type="checkbox"
                        checked={clearPassword}
                        onChange={(e) => setClearPassword(e.target.checked)}
                        className="peer sr-only"
                      />
                      <div className="w-5 h-5 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 peer-checked:bg-indigo-500 peer-checked:border-indigo-500 transition-all duration-200 shadow-sm" />
                    </div>
                    <span className="group-hover:text-gray-900 dark:group-hover:text-white transition-colors">{t('clear_password')}</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="mt-8 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={closeEdit}
                disabled={saving}
                className="px-5 py-3 rounded-2xl font-semibold text-gray-700 dark:text-gray-300 hover:bg-white/60 dark:hover:bg-white/10 transition-colors disabled:opacity-50"
              >
                {t('cancel')}
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="px-5 py-3 rounded-2xl font-bold bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-black dark:hover:bg-gray-100 transition-all disabled:opacity-50"
              >
                {saving ? t('saving') : t('save_changes')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
