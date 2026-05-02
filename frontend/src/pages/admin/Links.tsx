import React, { useEffect, useState } from 'react';
import { api } from '../../api';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { BarChart3, Lock, Pencil, Trash2, X } from 'lucide-react';

export default function Links() {
  const { t } = useTranslation();
  const [links, setLinks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingLink, setEditingLink] = useState<any | null>(null);
  const [editOriginalUrl, setEditOriginalUrl] = useState('');
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
    setEditOriginalUrl(link.original_url || '');
    setEditPassword('');
    setClearPassword(false);
  };

  const closeEdit = () => {
    setEditingLink(null);
    setEditOriginalUrl('');
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

      if (editOriginalUrl.trim() && editOriginalUrl.trim() !== editingLink.original_url) {
        payload.original_url = editOriginalUrl.trim();
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
    <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 ease-apple">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 transition-colors tracking-tight">{t('links')}</h1>
      </div>

      {error && (
        <div className="mb-6 p-5 bg-red-500/10 backdrop-blur-xl border border-red-500/20 text-red-600 dark:text-red-400 rounded-[1.5rem] text-sm text-center font-medium animate-in slide-in-from-top-4 fade-in duration-500">
          {error}
        </div>
      )}

      <div className="glass-panel overflow-hidden transition-all duration-500">
        <div className="overflow-x-auto">
          {/* Desktop Table */}
          <table className="w-full text-left hidden md:table border-collapse">
            <thead className="bg-gray-100/50 dark:bg-black/30 border-b border-white/20 dark:border-white/10 transition-colors backdrop-blur-xl">
              <tr>
                <th className="px-4 md:px-8 py-4 md:py-5 text-xs font-bold text-gray-500 dark:text-gray-400 tracking-widest uppercase">{t('short_code')}</th>
                <th className="px-4 md:px-8 py-4 md:py-5 text-xs font-bold text-gray-500 dark:text-gray-400 tracking-widest uppercase">{t('original_url')}</th>
                <th className="px-4 md:px-8 py-4 md:py-5 text-xs font-bold text-gray-500 dark:text-gray-400 tracking-widest uppercase">{t('clicks')}</th>
                <th className="px-4 md:px-8 py-4 md:py-5 text-xs font-bold text-gray-500 dark:text-gray-400 tracking-widest uppercase">{t('created_at')}</th>
                <th className="px-4 md:px-8 py-4 md:py-5 text-xs font-bold text-gray-500 dark:text-gray-400 tracking-widest uppercase">{t('features')}</th>
                <th className="px-4 md:px-8 py-4 md:py-5 text-xs font-bold text-gray-500 dark:text-gray-400 tracking-widest uppercase">{t('status')}</th>
                <th className="px-4 md:px-8 py-4 md:py-5 text-xs font-bold text-gray-500 dark:text-gray-400 tracking-widest uppercase text-right">{t('actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/20 dark:divide-white/10 transition-colors">
              {links.map((link) => (
                <tr key={link.id} className="hover:bg-white/40 dark:hover:bg-white/5 transition-colors duration-300">
                  <td className="px-4 md:px-8 py-4 md:py-5 font-bold text-accent-blue dark:text-accent-cyan tracking-tight text-lg">
                    <a href={`/${link.short_code}`} target="_blank" rel="noreferrer">
                      /{link.short_code}
                    </a>
                  </td>
                  <td className="px-4 md:px-8 py-4 md:py-5 text-gray-700 dark:text-gray-300 truncate max-w-xs transition-colors font-medium tracking-tight" title={link.original_url}>
                    {link.original_url}
                  </td>
                  <td className="px-4 md:px-8 py-4 md:py-5 text-gray-900 dark:text-gray-100 transition-colors font-bold text-lg">{link.click_count}</td>
                  <td className="px-4 md:px-8 py-4 md:py-5 text-gray-500 dark:text-gray-400 transition-colors font-medium tracking-tight">
                    {new Date(link.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 md:px-8 py-4 md:py-5">
                    <div className="flex flex-wrap gap-2">
                      {link.has_password === 1 && (
                        <div className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-rose-500/10 dark:bg-rose-500/20 text-rose-700 dark:text-rose-300 border border-rose-500/20 rounded-full font-bold tracking-tight" title="Password Protected">
                          <Lock size={14} /> {t('protected')}
                        </div>
                      )}
                    </div>
                    <div className="mt-3 flex flex-col gap-1 text-[11px] font-bold text-gray-400 dark:text-gray-500 tracking-wider uppercase">
                      <div>
                        {t('protected')}: {link.has_password === 1 ? t('yes') : t('no')}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 md:px-8 py-4 md:py-5">
                    <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold border tracking-tight ${
                      link.is_active === 1 ? 'bg-green-500/10 border-green-500/20 text-green-700 dark:text-green-400' : 'bg-red-500/10 border-red-500/20 text-red-700 dark:text-red-400'
                    }`}>
                      {link.is_active === 1 ? t('active') : t('disabled')}
                    </span>
                  </td>
                  <td className="px-4 md:px-8 py-4 md:py-5 text-right">
                    <div className="inline-flex items-center gap-5 justify-end w-full">
                      <button
                        type="button"
                        onClick={() => openEdit(link)}
                        className="inline-flex items-center gap-1.5 text-sm font-bold text-gray-500 hover:text-accent-blue transition-colors duration-300"
                      >
                        <Pencil size={16} />
                        {t('edit')}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(link.id)}
                        className="inline-flex items-center gap-1.5 text-sm font-bold text-gray-500 hover:text-red-500 transition-colors duration-300"
                      >
                        <Trash2 size={16} />
                        {t('delete')}
                      </button>
                      <Link
                        to={`/admin/links/${link.id}/stats`}
                        className="inline-flex items-center gap-1.5 text-sm font-bold text-gray-500 hover:text-accent-purple transition-colors duration-300"
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
                  <td colSpan={7} className="px-8 py-16 text-center text-gray-500 dark:text-gray-400 transition-colors font-bold tracking-tight text-lg">
                    {t('no_links_found')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Mobile Card Layout */}
          <div className="md:hidden flex flex-col divide-y divide-gray-200/50 dark:divide-white/10">
            {links.map((link) => (
              <div key={link.id} className="p-5 flex flex-col gap-4 hover:bg-white/40 dark:hover:bg-white/5 transition-colors duration-300">
                <div className="flex justify-between items-start">
                  <div className="flex flex-col gap-1">
                    <a href={`/${link.short_code}`} target="_blank" rel="noreferrer" className="font-bold text-accent-blue dark:text-accent-cyan tracking-tight text-xl">
                      /{link.short_code}
                    </a>
                    <span className="text-gray-500 dark:text-gray-400 text-xs font-bold tracking-widest uppercase">
                      {new Date(link.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold border tracking-tight ${
                    link.is_active === 1 ? 'bg-green-500/10 border-green-500/20 text-green-700 dark:text-green-400' : 'bg-red-500/10 border-red-500/20 text-red-700 dark:text-red-400'
                  }`}>
                    {link.is_active === 1 ? t('active') : t('disabled')}
                  </span>
                </div>

                <div className="text-gray-700 dark:text-gray-300 truncate font-medium tracking-tight text-sm bg-white/40 dark:bg-black/20 p-3 rounded-xl border border-white/20 dark:border-white/5" title={link.original_url}>
                  {link.original_url}
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t('clicks')}</span>
                      <span className="text-gray-900 dark:text-gray-100 font-bold text-lg leading-none">{link.click_count}</span>
                    </div>
                    {link.has_password === 1 && (
                      <div className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-rose-500/10 dark:bg-rose-500/20 text-rose-700 dark:text-rose-300 border border-rose-500/20 rounded-full font-bold tracking-tight">
                        <Lock size={14} /> {t('protected')}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <button onClick={() => openEdit(link)} className="p-2 bg-white/50 dark:bg-black/30 rounded-full text-gray-500 hover:text-accent-blue transition-colors shadow-sm">
                      <Pencil size={16} />
                    </button>
                    <button onClick={() => handleDelete(link.id)} className="p-2 bg-white/50 dark:bg-black/30 rounded-full text-gray-500 hover:text-red-500 transition-colors shadow-sm">
                      <Trash2 size={16} />
                    </button>
                    <Link to={`/admin/links/${link.id}/stats`} className="p-2 bg-white/50 dark:bg-black/30 rounded-full text-gray-500 hover:text-accent-purple transition-colors shadow-sm">
                      <BarChart3 size={16} />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
            {links.length === 0 && (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400 font-bold tracking-tight text-lg">
                {t('no_links_found')}
              </div>
            )}
          </div>
        </div>
      </div>

      {editingLink && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center z-50 p-6 animate-in fade-in duration-300">
          <div className="w-full max-w-lg glass-panel p-8 shadow-2xl animate-in slide-in-from-bottom-8 duration-500 ease-apple">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-extrabold text-gray-900 dark:text-white tracking-tight">{t('edit_link')}</h2>
              <button
                type="button"
                onClick={closeEdit}
                className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-white/10 transition-colors duration-300"
              >
                <X size={20} className="text-gray-600 dark:text-gray-300" />
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 ml-2 tracking-widest uppercase">
                  {t('original_url')}
                </label>
                <div className="mt-2">
                  <input
                    type="url"
                    required
                    value={editOriginalUrl}
                    onChange={(e) => setEditOriginalUrl(e.target.value)}
                    placeholder="https://example.com"
                    className="glass-input w-full px-6 py-4 rounded-[1.5rem] text-gray-900 dark:text-white font-medium placeholder-gray-400/80 dark:placeholder-gray-500/80 tracking-tight text-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 ml-2 tracking-widest uppercase">
                  {t('password_protection')}
                </label>
                <div className="mt-2 space-y-4">
                  <input
                    type="text"
                    value={editPassword}
                    onChange={(e) => setEditPassword(e.target.value)}
                    disabled={clearPassword}
                    placeholder={t('set_new_password_placeholder')}
                    className="glass-input w-full px-6 py-4 rounded-[1.5rem] text-gray-900 dark:text-white font-medium placeholder-gray-400/80 dark:placeholder-gray-500/80 tracking-tight text-lg disabled:opacity-50"
                  />
                  <label className="flex items-center gap-3 text-sm font-semibold text-gray-700 dark:text-gray-300 cursor-pointer group ml-2">
                    <div className="relative flex items-center justify-center w-6 h-6">
                      <input
                        type="checkbox"
                        checked={clearPassword}
                        onChange={(e) => setClearPassword(e.target.checked)}
                        className="peer sr-only"
                      />
                      <div className="absolute inset-0 rounded-md border-2 border-gray-300 dark:border-gray-600 bg-white/50 dark:bg-black/50 peer-checked:bg-accent-blue peer-checked:border-accent-blue transition-all duration-300 shadow-sm backdrop-blur-sm" />
                    </div>
                    <span className="group-hover:text-gray-900 dark:group-hover:text-white transition-colors">{t('clear_password')}</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="mt-10 flex items-center justify-end gap-4">
              <button
                type="button"
                onClick={closeEdit}
                disabled={saving}
                className="px-6 py-3 rounded-[1.2rem] font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors disabled:opacity-50"
              >
                {t('cancel')}
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="glass-button px-8 py-3 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-lg tracking-tight"
              >
                {saving ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    {t('saving')}
                  </span>
                ) : t('save_changes')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
