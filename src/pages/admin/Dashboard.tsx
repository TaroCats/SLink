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
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 transition-colors">{t('dashboard')} Overview</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.name} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400 transition-colors">{stat.name}</p>
                  <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white transition-colors">{stat.value}</p>
                </div>
                <div className={`p-4 rounded-full ${stat.color} bg-opacity-10 dark:bg-opacity-20`}>
                  <Icon className={stat.iconColor} size={24} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}