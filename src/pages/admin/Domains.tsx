import React, { useEffect, useState } from 'react';
import { api } from '../../api';
import { useTranslation } from 'react-i18next';
import { Trash2 } from 'lucide-react';

export default function Domains() {
  const { t } = useTranslation();
  const [domains, setDomains] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newDomain, setNewDomain] = useState('');
  const [isPrimary, setIsPrimary] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);

  const fetchDomains = () => {
    setLoading(true);
    api.getDomains().then(res => {
      setDomains(res.data || []);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchDomains();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDomain) return;
    
    setSubmitLoading(true);
    try {
      await api.createDomain({ domain: newDomain, is_primary: isPrimary });
      setNewDomain('');
      setIsPrimary(false);
      setShowModal(false);
      fetchDomains();
    } catch (err: any) {
      console.error('Failed to create domain:', err);
      alert(err.message || 'Failed to create domain');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this domain?')) return;
    
    try {
      await api.deleteDomain(id);
      fetchDomains();
    } catch (err) {
      console.error('Failed to delete domain:', err);
      alert('Failed to delete domain');
    }
  };

  if (loading && domains.length === 0) return <div className="text-gray-500 dark:text-gray-400">Loading domains...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white transition-colors">{t('domains')} Configuration</h1>
        <button 
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
        >
          Add Domain
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700 rounded-xl overflow-hidden transition-colors">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-700 transition-colors">
              <tr>
                <th className="px-6 py-4 text-sm font-medium text-gray-500 dark:text-gray-400 transition-colors">Domain</th>
                <th className="px-6 py-4 text-sm font-medium text-gray-500 dark:text-gray-400 transition-colors">Primary</th>
                <th className="px-6 py-4 text-sm font-medium text-gray-500 dark:text-gray-400 transition-colors">{t('created_at')}</th>
                <th className="px-6 py-4 text-sm font-medium text-gray-500 dark:text-gray-400 transition-colors">Status</th>
                <th className="px-6 py-4 text-sm font-medium text-gray-500 dark:text-gray-400 transition-colors text-right">{t('actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700 transition-colors">
              {domains.map((domain) => (
                <tr key={domain.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900 dark:text-white transition-colors">
                    {domain.domain}
                  </td>
                  <td className="px-6 py-4">
                    {domain.is_primary === 1 ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400">
                        Primary
                      </span>
                    ) : (
                      <span className="text-gray-400 dark:text-gray-500">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-gray-500 dark:text-gray-400 transition-colors">
                    {new Date(domain.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      domain.is_active === 1 ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400' : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400'
                    }`}>
                      {domain.is_active === 1 ? 'Active' : 'Disabled'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => handleDelete(domain.id)}
                      className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                      title="Delete Domain"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
              {domains.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400 transition-colors">
                    No domains found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 transition-opacity">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md overflow-hidden transition-colors">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white transition-colors">Add New Domain</h2>
            </div>
            <form onSubmit={handleCreate} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors">
                    Domain Name
                  </label>
                  <input
                    type="text"
                    required
                    value={newDomain}
                    onChange={(e) => setNewDomain(e.target.value)}
                    placeholder="e.g. short.mycompany.com"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="is_primary"
                    checked={isPrimary}
                    onChange={(e) => setIsPrimary(e.target.checked)}
                    className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                  />
                  <label htmlFor="is_primary" className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer transition-colors">
                    Set as Primary Domain
                  </label>
                </div>
              </div>
              <div className="mt-8 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitLoading || !newDomain}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md transition-colors disabled:opacity-50"
                >
                  {submitLoading ? 'Creating...' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}