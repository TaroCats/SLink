import React, { useEffect, useState } from 'react';
import { api } from '../../api';
import { useTranslation } from 'react-i18next';

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

  if (loading) return <div className="text-gray-500 dark:text-gray-400">Loading links...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white transition-colors">{t('links')} Management</h1>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700 rounded-xl overflow-hidden transition-colors">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-700 transition-colors">
              <tr>
                <th className="px-6 py-4 text-sm font-medium text-gray-500 dark:text-gray-400 transition-colors">{t('short_code')}</th>
                <th className="px-6 py-4 text-sm font-medium text-gray-500 dark:text-gray-400 transition-colors">{t('original_url')}</th>
                <th className="px-6 py-4 text-sm font-medium text-gray-500 dark:text-gray-400 transition-colors">{t('clicks')}</th>
                <th className="px-6 py-4 text-sm font-medium text-gray-500 dark:text-gray-400 transition-colors">{t('created_at')}</th>
                <th className="px-6 py-4 text-sm font-medium text-gray-500 dark:text-gray-400 transition-colors">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700 transition-colors">
              {links.map((link) => (
                <tr key={link.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
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
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      link.is_active === 1 ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400' : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400'
                    }`}>
                      {link.is_active === 1 ? 'Active' : 'Disabled'}
                    </span>
                  </td>
                </tr>
              ))}
              {links.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400 transition-colors">
                    No links found
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