import React from 'react';
import { useTranslation } from 'react-i18next';
import { Layers, Flame, Clock, Trophy } from 'lucide-react';
import { Card } from '@/components/common/Card';
import { toLocalizedDigits } from '@/utils/formatters';
import { cn } from '@/utils/cn';

export interface MyAuctionsStatsProps {
  stats: {
    totalCreated: number;
    activeCreated: number;
    pendingCreated: number;
    totalWon: number;
  };
}

export const MyAuctionsStats: React.FC<MyAuctionsStatsProps> = ({ stats }) => {
  const { t, i18n } = useTranslation('auctions');
  const isRTL = i18n.language?.startsWith('ar');

  const statItems = [
    {
      label: t('myAuctions.statsTotalCreated'),
      value: stats.totalCreated,
      icon: Layers,
      color: 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20',
    },
    {
      label: t('myAuctions.statsActive'),
      value: stats.activeCreated,
      icon: Flame,
      color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
    },
    {
      label: t('myAuctions.statsPending'),
      value: stats.pendingCreated,
      icon: Clock,
      color: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
    },
    {
      label: t('myAuctions.statsWon'),
      value: stats.totalWon,
      icon: Trophy,
      color: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {statItems.map((item, index) => {
        const Icon = item.icon;
        return (
          <Card
            key={index}
            glass
            padding="md"
            className={cn(
              'flex items-center gap-3.5 shadow-sm transition-all duration-200 group cursor-default',
              'border border-slate-200/90 dark:border-slate-800',
              'hover:border-amber-500/60 dark:hover:border-amber-500/60',
              'hover:shadow-md dark:hover:shadow-[0_8px_24px_rgba(245,158,11,0.18)]',
              'hover:-translate-y-0.5',
              'dark:hover:ring-1 dark:hover:ring-amber-500/30'
            )}
          >
            <div
              className={cn(
                'w-10 h-10 sm:w-11 sm:h-11 rounded-2xl flex items-center justify-center border shrink-0 group-hover:scale-105 transition-transform duration-200',
                item.color
              )}
            >
              <Icon className="w-5 h-5" />
            </div>
            <div className="min-w-0 space-y-0.5">
              <span className="text-[11px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400 truncate block">
                {item.label}
              </span>
              <span className="text-lg sm:text-xl font-black font-mono text-slate-900 dark:text-slate-100">
                {toLocalizedDigits(item.value, isRTL)}
              </span>
            </div>
          </Card>
        );
      })}
    </div>
  );
};

export default MyAuctionsStats;
