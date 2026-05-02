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
    <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 ease-apple">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 transition-colors tracking-tight">{t('domains')} Configuration</h1>
        <button 
          onClick={() => setShowModal(true)}
          className="glass-button px-6 py-3 text-sm flex items-center justify-center shadow-lg hover:shadow-xl"
        >
          Add Domain
        </button>
      </div>

      <div className="glass-panel overflow-hidden transition-all duration-500">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-100/50 dark:bg-black/30 border-b border-white/20 dark:border-white/10 transition-colors backdrop-blur-xl">
              <tr>
                <th className="px-8 py-5 text-xs font-bold text-gray-500 dark:text-gray-400 tracking-widest uppercase">Domain</th>
                <th className="px-8 py-5 text-xs font-bold text-gray-500 dark:text-gray-400 tracking-widest uppercase">Primary</th>
                <th className="px-8 py-5 text-xs font-bold text-gray-500 dark:text-gray-400 tracking-widest uppercase">{t('created_at')}</th>
                <th className="px-8 py-5 text-xs font-bold text-gray-500 dark:text-gray-400 tracking-widest uppercase">Status</th>
                <th className="px-8 py-5 text-xs font-bold text-gray-500 dark:text-gray-400 tracking-widest uppercase text-right">{t('actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/20 dark:divide-white/10 transition-colors">
              {domains.map((domain) => (
                <tr key={domain.id} className="hover:bg-white/40 dark:hover:bg-white/5 transition-colors duration-300">
                  <td className="px-8 py-5 font-bold text-gray-900 dark:text-white transition-colors tracking-tight text-lg">
                    {domain.domain}
                  </td>
                  <td className="px-8 py-5">
                    {domain.is_primary === 1 ? (
                      <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold bg-accent-blue/10 text-accent-blue dark:text-accent-cyan border border-accent-blue/20 tracking-tight">
                        Primary
                      </span>
                    ) : (
                      <span className="text-gray-400 dark:text-gray-500">-</span>
                    )}
                  </td>
                  <td className="px-8 py-5 text-gray-500 dark:text-gray-400 transition-colors font-medium tracking-tight">
                    {new Date(domain.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-8 py-5">
                    <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold border tracking-tight ${
                      domain.is_active === 1 ? 'bg-green-500/10 border-green-500/20 text-green-700 dark:text-green-400' : 'bg-red-500/10 border-red-500/20 text-red-700 dark:text-red-400'
                    }`}>
                      {domain.is_active === 1 ? 'Active' : 'Disabled'}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <button 
                      onClick={() => handleDelete(domain.id)}
                      className="inline-flex items-center justify-center p-2 text-gray-500 hover:text-red-500 transition-colors duration-300"
                      title="Delete Domain"
                    >
                      <Trash2 size={20} />
                    </button>
                  </td>
                </tr>
              ))}
              {domains.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-8 py-16 text-center text-gray-500 dark:text-gray-400 transition-colors font-bold tracking-tight text-lg">
                    No domains found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center z-50 p-6 transition-opacity animate-in fade-in duration-300">
          <div className="glass-panel w-full max-w-md overflow-hidden transition-all duration-500 animate-in slide-in-from-bottom-8 ease-apple">
            <div className="px-8 py-6 border-b border-white/20 dark:border-white/10 bg-white/40 dark:bg-black/20 backdrop-blur-xl">
              <h2 className="text-xl font-extrabold text-gray-900 dark:text-white transition-colors tracking-tight">Add New Domain</h2>
            </div>
            <form onSubmit={handleCreate} className="p-8">
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 tracking-widest uppercase">
                    Domain Name
                  </label>
                  <input
                    type="text"
                    required
                    value={newDomain}
                    onChange={(e) => setNewDomain(e.target.value)}
                    placeholder="e.g. short.mycompany.com"
                    className="glass-input w-full px-6 py-4 rounded-[1.5rem] text-gray-900 dark:text-white font-medium placeholder-gray-400/80 dark:placeholder-gray-500/80 text-lg tracking-tight"
                  />
                </div>
                <div className="flex items-center gap-3 pt-2">
                  <div className="relative flex items-center justify-center w-6 h-6">
                    <input
                      type="checkbox"
                      id="is_primary"
                      checked={isPrimary}
                      onChange={(e) => setIsPrimary(e.target.checked)}
                      className="peer sr-only"
                    />
                    <div className="absolute inset-0 rounded-md border-2 border-gray-300 dark:border-gray-600 bg-white/50 dark:bg-black/50 peer-checked:bg-accent-blue peer-checked:border-accent-blue transition-all duration-300 shadow-sm backdrop-blur-sm" />
                  </div>
                  <label htmlFor="is_primary" className="text-sm font-semibold text-gray-700 dark:text-gray-300 cursor-pointer transition-colors">
                    Set as Primary Domain
                  </label>
                </div>
              </div>
              <div className="mt-10 flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-6 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 rounded-[1.2rem] transition-all duration-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitLoading || !newDomain}
                  className="glass-button px-8 py-3 flex items-center justify-center min-w-[120px] text-lg tracking-tight disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}