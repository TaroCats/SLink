import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { Link2, ArrowRight, Copy, Check } from 'lucide-react';
import { ThemeToggle, LanguageSwitcher } from '../components/UIControls';
import { useTranslation } from 'react-i18next';

export default function Home() {
  const { t } = useTranslation();
  const [url, setUrl] = useState('');
  const [customCode, setCustomCode] = useState('');
  const [useTcn, setUseTcn] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState<string | false>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const res = await api.shorten({ url, custom_code: customCode, use_tcn: useTcn });
      setResult(res);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (urlToCopy: string) => {
    if (urlToCopy) {
      navigator.clipboard.writeText(urlToCopy);
      setCopied(urlToCopy);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center p-4 transition-colors">
      <div className="absolute top-4 right-4 flex items-center gap-2">
        <ThemeToggle />
        <LanguageSwitcher />
      </div>

      <div className="w-full max-w-2xl text-center mb-12">
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="bg-indigo-600 p-3 rounded-2xl">
            <Link2 className="text-white" size={32} />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white transition-colors">{t('app_title')}</h1>
        </div>
        <p className="text-lg text-gray-600 dark:text-gray-400 transition-colors">
          A fast and simple way to shorten your long URLs and track their usage.
        </p>
      </div>

      <div className="w-full max-w-2xl bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 transition-colors">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors">
              Long URL
            </label>
            <input
              type="url"
              required
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder={t('enter_url')}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors">
              {t('custom_code')}
            </label>
            <div className="flex items-stretch group focus-within:ring-2 focus-within:ring-indigo-600 rounded-lg transition-all">
              <div className="relative flex items-center bg-gray-100 dark:bg-gray-700 border border-r-0 border-gray-300 dark:border-gray-600 rounded-l-lg transition-colors px-4 py-3 text-gray-500 dark:text-gray-400">
                {window.location.host}/
              </div>
              <input
                type="text"
                value={customCode}
                onChange={(e) => setCustomCode(e.target.value)}
                placeholder="my-custom-alias"
                className="flex-1 px-4 py-3 rounded-r-lg border border-l-0 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer transition-colors">
              <input
                type="checkbox"
                checked={useTcn}
                onChange={(e) => setUseTcn(e.target.checked)}
                className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
              />
              {t('use_tcn')}
            </label>
          </div>

          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg text-sm transition-colors">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !url}
            className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium text-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
          >
            {loading ? 'Shortening...' : t('shorten_btn')}
            {!loading && <ArrowRight size={20} />}
          </button>
        </form>

        {result && (
          <div className="mt-8 p-6 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border border-indigo-100 dark:border-indigo-800 transition-colors space-y-4">
            <h3 className="text-sm font-medium text-indigo-900 dark:text-indigo-200 transition-colors">{t('short_link_ready')}</h3>
            
            {/* Primary Short Link */}
            <div className="flex items-center justify-between bg-white dark:bg-gray-800 p-4 rounded-lg border border-indigo-200 dark:border-indigo-700 transition-colors">
              <a 
                href={result.short_url} 
                target="_blank" 
                rel="noreferrer"
                className="text-indigo-600 dark:text-indigo-400 font-medium truncate mr-4 hover:underline transition-colors"
              >
                {result.short_url}
              </a>
              <button
                onClick={() => handleCopy(result.short_url)}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-100 dark:bg-indigo-900/50 hover:bg-indigo-200 dark:hover:bg-indigo-800 text-indigo-700 dark:text-indigo-300 rounded-md transition-colors font-medium text-sm"
              >
                {copied === result.short_url ? <Check size={16} /> : <Copy size={16} />}
                {copied === result.short_url ? t('copied') : t('copy')}
              </button>
            </div>

            {/* t.cn Secondary Link (if available) */}
            {result.tcn_url && (
              <div className="flex items-center justify-between bg-white dark:bg-gray-800 p-4 rounded-lg border border-indigo-200 dark:border-indigo-700 transition-colors">
                <div className="flex flex-col mr-4 overflow-hidden">
                  <span className="text-xs text-gray-500 dark:text-gray-400 mb-1">t.cn Short URL:</span>
                  <a 
                    href={result.tcn_url} 
                    target="_blank" 
                    rel="noreferrer"
                    className="text-indigo-600 dark:text-indigo-400 font-medium truncate hover:underline transition-colors"
                  >
                    {result.tcn_url}
                  </a>
                </div>
                <button
                  onClick={() => handleCopy(result.tcn_url)}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-100 dark:bg-indigo-900/50 hover:bg-indigo-200 dark:hover:bg-indigo-800 text-indigo-700 dark:text-indigo-300 rounded-md transition-colors font-medium text-sm h-fit"
                >
                  {copied === result.tcn_url ? <Check size={16} /> : <Copy size={16} />}
                  {copied === result.tcn_url ? t('copied') : t('copy')}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}