import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { Link2, ArrowRight, Copy, Check, Settings2, Lock, Clock } from 'lucide-react';
import { ThemeToggle, LanguageSwitcher } from '../components/UIControls';
import { useTranslation } from 'react-i18next';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

export default function Home() {
  const { t } = useTranslation();
  const [url, setUrl] = useState('');
  const [customCode, setCustomCode] = useState('');
  const [useTcn, setUseTcn] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [expiresAt, setExpiresAt] = useState<Date | null>(null);
  const [password, setPassword] = useState('');
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
      const payload: any = { url, custom_code: customCode, use_tcn: useTcn };
      if (expiresAt) {
        payload.expires_at = expiresAt.toISOString();
      }
      if (password) {
        payload.password = password;
      }
      const res = await api.shorten(payload);
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
    <div className="min-h-screen relative flex flex-col items-center justify-center p-4 transition-colors">
      <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
        <ThemeToggle />
        <LanguageSwitcher />
      </div>

      <div className="w-full max-w-2xl text-center mb-12 relative z-10">
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-4 rounded-3xl shadow-lg shadow-indigo-500/30 transform transition-transform hover:scale-105 duration-300">
            <Link2 className="text-white w-10 h-10" strokeWidth={2.5} />
          </div>
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white tracking-tight">{t('app_title')}</h1>
        </div>
        <p className="text-xl text-gray-600 dark:text-gray-400/80 font-medium">
          A fast and simple way to shorten your long URLs and track their usage.
        </p>
      </div>

      <div className="w-full max-w-2xl relative z-10">
        <div className="backdrop-blur-2xl bg-white/70 dark:bg-[#1c1c1e]/70 border border-white/20 dark:border-gray-700/30 rounded-[2rem] shadow-[0_8px_32px_rgba(0,0,0,0.08)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)] p-8 sm:p-12 transition-all duration-300">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                <Link2 className="h-6 w-6 text-gray-400 dark:text-gray-500 group-focus-within:text-indigo-500 dark:group-focus-within:text-indigo-400 transition-colors" />
              </div>
              <input
                type="url"
                required
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder={t('enter_url')}
                className="w-full pl-14 pr-6 py-5 rounded-2xl border border-gray-200/50 dark:border-gray-700/50 bg-white/50 dark:bg-black/20 text-gray-900 dark:text-white placeholder-gray-400 focus:bg-white/80 dark:focus:bg-black/40 focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500/50 backdrop-blur-md shadow-inner transition-all duration-300 outline-none text-xl font-medium"
              />
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 ml-2 tracking-wide uppercase opacity-80">
                {t('custom_code')}
              </label>
              <div className="flex items-stretch group rounded-2xl transition-all shadow-sm hover:shadow-md duration-300 bg-white/50 dark:bg-black/20 backdrop-blur-md border border-gray-200/50 dark:border-gray-700/50 focus-within:ring-2 focus-within:ring-indigo-500/30 focus-within:border-indigo-500/50 focus-within:bg-white/80 dark:focus-within:bg-black/40">
                <div className="flex items-center px-5 bg-transparent border-r border-gray-200/50 dark:border-gray-700/50 text-gray-500 dark:text-gray-400 font-medium transition-colors">
                  {window.location.host}/
                </div>
                <input
                  type="text"
                  value={customCode}
                  onChange={(e) => setCustomCode(e.target.value)}
                  placeholder="my-custom-alias"
                  className="flex-1 px-5 py-4 rounded-r-2xl bg-transparent text-gray-900 dark:text-white focus:outline-none transition-all placeholder-gray-400 text-lg font-medium"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <label className="flex items-center gap-3 text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer group">
                <div className="relative flex items-center justify-center">
                  <input
                    type="checkbox"
                    checked={useTcn}
                    onChange={(e) => setUseTcn(e.target.checked)}
                    className="peer sr-only"
                  />
                  <div className="w-5 h-5 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 peer-checked:bg-indigo-500 peer-checked:border-indigo-500 transition-all duration-200 shadow-sm" />
                  <Check size={14} className="absolute text-white opacity-0 peer-checked:opacity-100 transition-opacity duration-200" strokeWidth={3} />
                </div>
                <span className="group-hover:text-gray-900 dark:group-hover:text-white transition-colors">{t('use_tcn')}</span>
              </label>

              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center gap-1.5 text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors bg-indigo-50 dark:bg-indigo-500/10 px-3 py-1.5 rounded-full"
              >
                <Settings2 size={16} />
                {showAdvanced ? t('hide_advanced_options') : t('advanced_options')}
              </button>
            </div>

            {showAdvanced && (
              <div className="pt-6 border-t border-gray-200/50 dark:border-gray-700/50 space-y-6 animate-in fade-in slide-in-from-top-4 duration-300">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 ml-2 tracking-wide uppercase opacity-80">
                      <Clock size={16} className="text-indigo-500" />
                      {t('expiration_datetime')}
                    </label>
                    <DatePicker
                      selected={expiresAt}
                      onChange={(date) => setExpiresAt(date)}
                      showPopperArrow={false}
                      showTimeSelect
                      timeFormat="HH:mm"
                      timeIntervals={15}
                      timeCaption="Time"
                      dateFormat="yyyy-MM-dd HH:mm"
                      placeholderText={t('expiration_datetime')}
                      className="w-full px-5 py-4 rounded-2xl border border-gray-200/50 dark:border-gray-700/50 bg-white/50 dark:bg-black/20 text-gray-900 dark:text-white focus:bg-white/80 dark:focus:bg-black/40 focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500/50 backdrop-blur-md shadow-inner transition-all duration-300 outline-none font-medium placeholder-gray-400 dark:placeholder-gray-500"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 ml-2 tracking-wide uppercase opacity-80">
                      <Lock size={16} className="text-indigo-500" />
                      {t('password_protection')}
                    </label>
                    <input
                      type="text"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={t('leave_empty_for_public')}
                      className="w-full px-5 py-4 rounded-2xl border border-gray-200/50 dark:border-gray-700/50 bg-white/50 dark:bg-black/20 text-gray-900 dark:text-white placeholder-gray-400 focus:bg-white/80 dark:focus:bg-black/40 focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500/50 backdrop-blur-md shadow-inner transition-all duration-300 outline-none font-medium"
                    />
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="p-4 bg-red-50/80 dark:bg-red-900/20 backdrop-blur-md border border-red-100/50 dark:border-red-800/30 text-red-600 dark:text-red-400 rounded-2xl text-sm text-center animate-in slide-in-from-top-2 fade-in duration-300 font-medium">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !url}
              className="w-full py-5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-black dark:hover:bg-gray-100 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-40 disabled:hover:shadow-lg active:scale-[0.98]"
            >
              {loading ? t('shortening') : t('shorten_btn')}
              {!loading && <ArrowRight size={22} className="transition-transform group-hover:translate-x-1" />}
            </button>
          </form>

          {result && (
            <div className="mt-8 p-6 bg-white/40 dark:bg-black/20 backdrop-blur-md rounded-2xl border border-white/40 dark:border-gray-700/30 shadow-inner animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-4">
              <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider ml-1">{t('short_link_ready')}</h3>
              
              {/* Primary Short Link */}
              <div className="flex items-center justify-between bg-white dark:bg-[#1c1c1e] p-4 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm transition-colors">
                <a 
                  href={result.short_url} 
                  target="_blank" 
                  rel="noreferrer"
                  className="text-indigo-600 dark:text-indigo-400 font-bold truncate mr-4 hover:underline transition-colors text-lg"
                >
                  {result.short_url}
                </a>
                <button
                  onClick={() => handleCopy(result.short_url)}
                  className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg transition-colors font-semibold text-sm shadow-sm active:scale-95"
                >
                  {copied === result.short_url ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                  {copied === result.short_url ? t('copied') : t('copy')}
                </button>
              </div>

              {/* t.cn Secondary Link (if available) */}
              {result.tcn_url && (
                <div className="flex items-center justify-between bg-white dark:bg-[#1c1c1e] p-4 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm transition-colors">
                  <div className="flex flex-col mr-4 overflow-hidden">
                    <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 mb-1 uppercase tracking-wider">t.cn Short URL</span>
                    <a 
                      href={result.tcn_url} 
                      target="_blank" 
                      rel="noreferrer"
                      className="text-indigo-600 dark:text-indigo-400 font-bold truncate hover:underline transition-colors"
                    >
                      {result.tcn_url}
                    </a>
                  </div>
                  <button
                    onClick={() => handleCopy(result.tcn_url)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg transition-colors font-semibold text-sm shadow-sm h-fit active:scale-95"
                  >
                    {copied === result.tcn_url ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                    {copied === result.tcn_url ? t('copied') : t('copy')}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
