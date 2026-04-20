import React, { useEffect, useState } from 'react';
import { api } from '../../api';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { BarChart3, Clock, Lock } from 'lucide-react';

export default function Links() {
  const { t } = useTranslation();
  const [links, setLinks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getLinks().then(res => {
      setLinks(res.data);
      setLoading(false);
    }).catch(console.error);
  }, []);

  if (loading) return <div className="text-gray-500 dark:text-gray-400">{t('loading_links')}</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white transition-colors">{t('links')}</h1>
      </div>

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
                      {link.password && (
                        <div className="flex items-center gap-1 text-xs px-2 py-1 bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 rounded-full" title="Password Protected">
                          <Lock size={12} /> {t('protected')}
                        </div>
                      )}
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
                    <Link
                      to={`/admin/links/${link.id}/stats`}
                      className="inline-flex items-center gap-1 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
                    >
                      <BarChart3 size={16} />
                      {t('stats')}
                    </Link>
                  </td>
                </tr>
              ))}
              {links.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400 transition-colors">
                    {t('no_links_found')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}