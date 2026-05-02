import React, { useEffect, useState } from 'react';
import { api } from '../../api';
import { Link2, MousePointerClick, Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function Dashboard() {
  const { t } = useTranslation();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getStats().then(data => {
      setStats(data);
      setLoading(false);
    }).catch(console.error);
  }, []);

  if (loading) {
    return <div className="text-gray-500 dark:text-gray-400">Loading stats...</div>;
  }

  const statCards = [
    { name: t('total_links'), value: stats?.total_links || 0, icon: Link2, color: 'bg-blue-500', iconColor: 'text-blue-500' },
    { name: t('total_visits'), value: stats?.total_visits || 0, icon: MousePointerClick, color: 'bg-green-500', iconColor: 'text-green-500' },
    { name: t('total_clicks'), value: stats?.total_clicks || 0, icon: Globe, color: 'bg-purple-500', iconColor: 'text-purple-500' },
  ];

  return (
    <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 ease-apple">
      <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 mb-8 transition-colors tracking-tight">
        {t('dashboard')} Overview
      </h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.name} className="glass-panel p-8 transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 group cursor-pointer">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-gray-500 dark:text-gray-400 tracking-widest uppercase transition-colors mb-2">
                    {stat.name}
                  </p>
                  <p className="text-5xl font-extrabold text-gray-900 dark:text-white transition-colors tracking-tight">
                    {stat.value}
                  </p>
                </div>
                <div className={`p-4 rounded-[1.2rem] ${stat.color} bg-opacity-10 dark:bg-opacity-20 backdrop-blur-md group-hover:scale-110 transition-transform duration-500 ease-apple`}>
                  <Icon className={stat.iconColor} size={32} strokeWidth={2} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}