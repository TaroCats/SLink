import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../../api';
import { ArrowLeft, Monitor, Smartphone, Globe, Compass, MousePointer2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function LinkStats() {
  const { id } = useParams();
  const { t } = useTranslation();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      api.getLinkStats(id).then(res => {
        setStats(res);
        setLoading(false);
      }).catch(console.error);
    }
  }, [id]);

  if (loading) return <div className="text-gray-500 dark:text-gray-400">{t('loading_statistics')}</div>;
  if (!stats) return <div className="text-red-500">{t('failed_to_load_statistics')}</div>;

  const renderBarChart = (data: any[], icon: React.ReactNode, title: string) => {
    const max = Math.max(...data.map(d => d[1]), 1);
    
    return (
      <div className="backdrop-blur-2xl bg-white/70 dark:bg-[#1c1c1e]/70 p-6 rounded-2xl border border-white/20 dark:border-gray-700/30 shadow-[0_8px_32px_rgba(0,0,0,0.04)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.2)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_48px_rgba(0,0,0,0.08)] dark:hover:shadow-[0_16px_48px_rgba(0,0,0,0.3)]">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-6">
          {icon}
          {title}
        </h3>
        {data.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-sm">{t('no_data_available')}</p>
        ) : (
          <div className="space-y-4">
            {data.map(([label, count], idx) => (
              <div key={idx}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-700 dark:text-gray-300 truncate pr-4">{label}</span>
                  <span className="font-medium text-gray-900 dark:text-white">{count}</span>
                </div>
                <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-indigo-500 h-2 rounded-full transition-all duration-500" 
                    style={{ width: `${(count / max) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-8">
        <Link to="/admin/links" className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-500 dark:text-gray-400 transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white transition-colors">
          {t('statistics_details')}
        </h1>
      </div>

      <div className="backdrop-blur-2xl bg-indigo-50/70 dark:bg-indigo-900/30 p-6 rounded-2xl border border-indigo-100/50 dark:border-indigo-800/30 shadow-[0_8px_32px_rgba(0,0,0,0.04)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.2)] flex items-center gap-4 transition-all duration-300">
        <div className="p-4 backdrop-blur-md bg-white/80 dark:bg-gray-800/80 rounded-2xl shadow-sm text-indigo-600 dark:text-indigo-400">
          <MousePointer2 size={24} />
        </div>
        <div>
          <p className="text-sm font-medium text-indigo-900 dark:text-indigo-200">{t('total_valid_visits')}</p>
          <h2 className="text-3xl font-bold text-indigo-700 dark:text-indigo-300">{stats.total_visits}</h2>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {renderBarChart(stats.devices, <Smartphone size={20} />, t('devices'))}
        {renderBarChart(stats.os, <Monitor size={20} />, t('operating_systems'))}
        {renderBarChart(stats.browsers, <Globe size={20} />, t('browsers'))}
        {renderBarChart(stats.referers, <Compass size={20} />, t('referers'))}
      </div>
    </div>
  );
}