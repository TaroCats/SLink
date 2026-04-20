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
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-all duration-300 shadow-md hover:shadow-lg active:scale-95"
        >
          Add Domain
        </button>
      </div>

      <div className="backdrop-blur-2xl bg-white/70 dark:bg-[#1c1c1e]/70 shadow-[0_8px_32px_rgba(0,0,0,0.04)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.2)] border border-white/20 dark:border-gray-700/30 rounded-2xl overflow-hidden transition-all duration-300">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-white/40 dark:bg-black/20 border-b border-gray-200/50 dark:border-gray-700/50 transition-colors backdrop-blur-md">
              <tr>
                <th className="px-6 py-4 text-sm font-medium text-gray-500 dark:text-gray-400 transition-colors">Domain</th>
                <th className="px-6 py-4 text-sm font-medium text-gray-500 dark:text-gray-400 transition-colors">Primary</th>
                <th className="px-6 py-4 text-sm font-medium text-gray-500 dark:text-gray-400 transition-colors">{t('created_at')}</th>
                <th className="px-6 py-4 text-sm font-medium text-gray-500 dark:text-gray-400 transition-colors">Status</th>
                <th className="px-6 py-4 text-sm font-medium text-gray-500 dark:text-gray-400 transition-colors text-right">{t('actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200/50 dark:divide-gray-700/50 transition-colors">
              {domains.map((domain) => (
                <tr key={domain.id} className="hover:bg-white/50 dark:hover:bg-white/5 transition-colors">
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
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity animate-in fade-in duration-300">
          <div className="backdrop-blur-2xl bg-white/80 dark:bg-[#1c1c1e]/80 rounded-[2rem] shadow-[0_8px_32px_rgba(0,0,0,0.08)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)] border border-white/20 dark:border-gray-700/30 w-full max-w-md overflow-hidden transition-all duration-300 transform scale-100 animate-in zoom-in-95 duration-300">
            <div className="px-6 py-4 border-b border-gray-200/50 dark:border-gray-700/50 bg-white/40 dark:bg-black/20 backdrop-blur-md">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white transition-colors">Add New Domain</h2>
            </div>
            <form onSubmit={handleCreate} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors">
                    Domain Name
                  </label>
                  <input
                    type="text"
                    required
                    value={newDomain}
                    onChange={(e) => setNewDomain(e.target.value)}
                    placeholder="e.g. short.mycompany.com"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200/50 dark:border-gray-700/50 bg-white/50 dark:bg-black/20 text-gray-900 dark:text-white focus:bg-white/80 dark:focus:bg-black/40 focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500/50 backdrop-blur-md shadow-inner transition-all duration-300 outline-none font-medium placeholder-gray-400 dark:placeholder-gray-500"
                  />
                </div>
                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="is_primary"
                    checked={isPrimary}
                    onChange={(e) => setIsPrimary(e.target.checked)}
                    className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 transition-all duration-200"
                  />
                  <label htmlFor="is_primary" className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer transition-colors">
                    Set as Primary Domain
                  </label>
                </div>
              </div>
              <div className="mt-8 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 text-gray-700 dark:text-gray-300 hover:bg-white/60 dark:hover:bg-gray-700/60 rounded-xl transition-all duration-300 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitLoading || !newDomain}
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-all duration-300 disabled:opacity-50 font-medium shadow-md hover:shadow-lg active:scale-95 flex items-center justify-center min-w-[100px]"
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