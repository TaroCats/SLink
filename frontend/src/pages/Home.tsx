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
    <div className="min-h-screen relative flex flex-col items-center justify-center p-6 md:p-12 transition-colors duration-700 ease-apple">
      <div className="absolute top-6 right-6 flex items-center gap-4 z-20">
        <ThemeToggle />
        <LanguageSwitcher />
      </div>

      <div className="w-full max-w-3xl text-center mb-16 relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-700 ease-apple">
        <div className="flex flex-col items-center justify-center gap-6 mb-6">
          <div className="relative group cursor-pointer">
            <div className="absolute -inset-4 bg-gradient-to-r from-accent-cyan to-accent-blue rounded-full blur-xl opacity-20 group-hover:opacity-40 transition duration-700"></div>
            <div className="relative bg-white/10 dark:bg-black/10 border border-white/20 dark:border-white/10 backdrop-blur-2xl p-5 rounded-[2rem] shadow-glass dark:shadow-glass-dark transform transition-all duration-liquid group-hover:scale-[1.05]">
              <Link2 className="text-gray-900 dark:text-white w-12 h-12" strokeWidth={2} />
            </div>
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 tracking-tight leading-tight">
            {t('app_title')}
          </h1>
        </div>
        <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-400/90 font-medium tracking-tight max-w-xl mx-auto leading-relaxed">
          A fast, elegant way to shorten URLs.
        </p>
      </div>

      <div className="w-full max-w-2xl relative z-10 animate-in fade-in slide-in-from-bottom-12 duration-1000 ease-apple delay-150">
        <div className="glass-panel p-8 sm:p-12 transition-all duration-500 hover:shadow-2xl hover:shadow-accent-blue/10">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                <Link2 className="h-6 w-6 text-gray-400 dark:text-gray-500 group-focus-within:text-accent-blue transition-colors duration-500" />
              </div>
              <input
                type="url"
                required
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder={t('enter_url')}
                className="glass-input w-full pl-16 pr-6 py-5 rounded-[1.5rem] text-gray-900 dark:text-white text-xl font-medium tracking-tight placeholder-gray-400/80 dark:placeholder-gray-500/80"
              />
            </div>

            <div className="space-y-4">
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 ml-2 tracking-widest uppercase">
                {t('custom_code')}
              </label>
              <div className="flex items-stretch group rounded-[1.5rem] transition-all duration-500 glass-input p-0 overflow-hidden focus-within:ring-2 focus-within:ring-accent-blue/50 focus-within:border-accent-blue/50">
                <div className="flex items-center px-6 bg-gray-100/30 dark:bg-black/40 border-r border-white/20 dark:border-white/10 text-gray-500 dark:text-gray-400 font-medium transition-colors backdrop-blur-md">
                  {window.location.host}/
                </div>
                <input
                  type="text"
                  value={customCode}
                  onChange={(e) => setCustomCode(e.target.value)}
                  placeholder="my-custom-alias"
                  className="flex-1 px-6 py-4 bg-transparent text-gray-900 dark:text-white focus:outline-none transition-all placeholder-gray-400/80 dark:placeholder-gray-500/80 text-lg font-medium"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 px-2">
              <label className="flex items-center gap-3 text-sm font-semibold text-gray-700 dark:text-gray-300 cursor-pointer group">
                <div className="relative flex items-center justify-center w-6 h-6">
                  <input
                    type="checkbox"
                    checked={useTcn}
                    onChange={(e) => setUseTcn(e.target.checked)}
                    className="peer sr-only"
                  />
                  <div className="absolute inset-0 rounded-md border-2 border-gray-300 dark:border-gray-600 bg-white/50 dark:bg-black/50 peer-checked:bg-accent-blue peer-checked:border-accent-blue transition-all duration-300 shadow-sm backdrop-blur-sm" />
                  <Check size={14} className="absolute text-white opacity-0 peer-checked:opacity-100 transition-opacity duration-300 scale-50 peer-checked:scale-100" strokeWidth={3} />
                </div>
                <span className="group-hover:text-gray-900 dark:group-hover:text-white transition-colors">{t('use_tcn')}</span>
              </label>

              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center gap-2 text-sm font-bold text-accent-blue hover:text-accent-cyan transition-colors bg-accent-blue/10 hover:bg-accent-blue/20 dark:bg-accent-blue/20 dark:hover:bg-accent-blue/30 px-4 py-2 rounded-full"
              >
                <Settings2 size={16} className={`transition-transform duration-500 ${showAdvanced ? 'rotate-180' : ''}`} />
                {showAdvanced ? t('hide_advanced_options') : t('advanced_options')}
              </button>
            </div>

            {showAdvanced && (
              <div className="pt-8 mt-4 border-t border-gray-200/30 dark:border-white/10 space-y-6 animate-in fade-in slide-in-from-top-8 duration-500 ease-apple">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <label className="flex items-center gap-2 text-xs font-bold text-gray-500 dark:text-gray-400 ml-2 tracking-widest uppercase">
                      <Clock size={14} className="text-accent-blue" />
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
                      className="glass-input w-full px-6 py-4 rounded-[1.5rem] text-gray-900 dark:text-white font-medium placeholder-gray-400/80 dark:placeholder-gray-500/80"
                    />
                  </div>
                  <div className="space-y-4">
                    <label className="flex items-center gap-2 text-xs font-bold text-gray-500 dark:text-gray-400 ml-2 tracking-widest uppercase">
                      <Lock size={14} className="text-accent-blue" />
                      {t('password_protection')}
                    </label>
                    <input
                      type="text"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={t('leave_empty_for_public')}
                      className="glass-input w-full px-6 py-4 rounded-[1.5rem] text-gray-900 dark:text-white font-medium placeholder-gray-400/80 dark:placeholder-gray-500/80"
                    />
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="p-5 bg-red-500/10 backdrop-blur-xl border border-red-500/20 text-red-600 dark:text-red-400 rounded-[1.5rem] text-sm text-center animate-in slide-in-from-top-4 fade-in duration-500 font-medium">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !url}
              className="glass-button w-full py-5 flex items-center justify-center gap-3 text-lg tracking-wide disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {t('shortening')}
                </span>
              ) : (
                <>
                  {t('shorten_btn')}
                  <ArrowRight size={20} className="transition-transform group-hover:translate-x-1" />
                </>
              )}
            </button>
          </form>

          {result && (
            <div className="mt-10 p-1 relative overflow-hidden rounded-[1.5rem] animate-in fade-in slide-in-from-bottom-8 duration-700 ease-apple">
              <div className="absolute inset-0 bg-gradient-to-r from-accent-cyan/20 to-accent-blue/20 blur-md"></div>
              <div className="relative p-6 sm:p-8 bg-white/60 dark:bg-black/40 backdrop-blur-2xl rounded-[1.4rem] border border-white/50 dark:border-white/10 shadow-inner space-y-6">
                <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest ml-1">{t('short_link_ready')}</h3>
                
                {/* Primary Short Link */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white/80 dark:bg-[#1c1c1e]/80 p-5 rounded-2xl border border-white/50 dark:border-white/5 shadow-sm backdrop-blur-xl transition-colors group">
                  <a 
                    href={result.short_url} 
                    target="_blank" 
                    rel="noreferrer"
                    className="text-accent-blue dark:text-accent-cyan font-bold truncate hover:underline transition-colors text-xl tracking-tight"
                  >
                    {result.short_url}
                  </a>
                  <button
                    onClick={() => handleCopy(result.short_url)}
                    className="flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3 bg-gray-100/50 dark:bg-black/50 hover:bg-white dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 rounded-xl transition-all duration-300 font-semibold text-sm shadow-sm active:scale-95 border border-transparent hover:border-gray-200 dark:hover:border-gray-700"
                  >
                    {copied === result.short_url ? <Check size={18} className="text-green-500" /> : <Copy size={18} />}
                    {copied === result.short_url ? t('copied') : t('copy')}
                  </button>
                </div>

                {/* t.cn Secondary Link (if available) */}
                {result.tcn_url && (
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white/80 dark:bg-[#1c1c1e]/80 p-5 rounded-2xl border border-white/50 dark:border-white/5 shadow-sm backdrop-blur-xl transition-colors group">
                    <div className="flex flex-col overflow-hidden">
                      <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 mb-1 uppercase tracking-widest">t.cn URL</span>
                      <a 
                        href={result.tcn_url} 
                        target="_blank" 
                        rel="noreferrer"
                        className="text-accent-blue dark:text-accent-cyan font-bold truncate hover:underline transition-colors text-lg tracking-tight"
                      >
                        {result.tcn_url}
                      </a>
                    </div>
                    <button
                      onClick={() => handleCopy(result.tcn_url)}
                      className="flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3 bg-gray-100/50 dark:bg-black/50 hover:bg-white dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 rounded-xl transition-all duration-300 font-semibold text-sm shadow-sm active:scale-95 border border-transparent hover:border-gray-200 dark:hover:border-gray-700"
                    >
                      {copied === result.tcn_url ? <Check size={18} className="text-green-500" /> : <Copy size={18} />}
                      {copied === result.tcn_url ? t('copied') : t('copy')}
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
