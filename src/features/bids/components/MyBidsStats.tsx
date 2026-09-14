import React from 'react';
import { useTranslation } from 'react-i18next';
import { Gavel, Trophy, History } from 'lucide-react';
import { toLocalizedDigits } from '@/utils/formatters';
import { cn } from '@/utils/cn';
import type { MyBidsFilterStatus } from '../hooks/useMyBids';

export interface MyBidsStatsData {
  totalBids: number;
  winningBids: number;
  outbidBids: number;
}

export interface MyBidsStatsProps {
  stats: MyBidsStatsData;
  activeStatus?: MyBidsFilterStatus;
  onSelectStatus?: (status: MyBidsFilterStatus) => void;
  className?: string;
}

export const MyBidsStats: React.FC<MyBidsStatsProps> = ({
  stats,
  activeStatus = 'ALL',
  onSelectStatus,
  className,
}) => {
  const { t, i18n } = useTranslation('bids');
  const isRTL = i18n.language?.startsWith('ar');

  const statItems: Array<{
    id: MyBidsFilterStatus;
    label: string;
    value: number;
    icon: React.FC<{ className?: string }>;
  }> = [
    {
      id: 'ALL',
      label: t('myBids.stats.totalBids'),
      value: stats.totalBids,
      icon: Gavel,
    },
    {
      id: 'WINNING',
      label: t('myBids.stats.winningBids'),
      value: stats.winningBids,
      icon: Trophy,
    },
    {
      id: 'OUTBID',
      label: t('myBids.stats.outbidBids'),
      value: stats.outbidBids,
      icon: History,
    },
  ];

  return (
    <div
      className={cn(
        'w-full grid grid-cols-3 gap-2 sm:gap-2.5 lg:flex lg:w-auto lg:items-center lg:gap-2.5 select-none',
        className
      )}
    >
      {statItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeStatus === item.id;
        const isClickable = Boolean(onSelectStatus);

        return (
          <div
            key={item.id}
            role={isClickable ? 'button' : undefined}
            tabIndex={isClickable ? 0 : undefined}
            onClick={() => onSelectStatus?.(item.id)}
            onKeyDown={(e) => {
              if (isClickable && (e.key === 'Enter' || e.key === ' ')) {
                e.preventDefault();
                onSelectStatus?.(item.id);
              }
            }}
            title={item.label}
            className={cn(
              'group flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-1 sm:gap-2.5 p-2 sm:px-3.5 sm:py-2 rounded-xl transition-all duration-150 text-center sm:text-start w-full',
              'border shadow-2xs',
              isActive
                ? 'border-amber-500 bg-amber-500/[0.08] dark:bg-amber-500/[0.12] ring-1 ring-amber-500/30 shadow-xs'
                : 'bg-white dark:bg-slate-900/90 border-slate-200 dark:border-slate-800 hover:border-amber-500/50 dark:hover:border-amber-500/50',
              isClickable && 'cursor-pointer hover:scale-[1.01] active:scale-[0.99]'
            )}
          >
            {/* Icon Container */}
            <div
              className={cn(
                'w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors',
                isActive
                  ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 group-hover:bg-amber-500/10 group-hover:text-amber-500'
              )}
            >
              <Icon className="w-3.5 h-3.5" />
            </div>

            {/* Label & Count (Colorized when active & on hover) */}
            <div className="flex flex-col sm:flex-row sm:items-baseline gap-0.5 sm:gap-2 truncate">
              <span
                className={cn(
                  'text-[10px] sm:text-[11px] transition-colors truncate',
                  isActive
                    ? 'text-amber-700 dark:text-amber-400 font-bold'
                    : 'font-medium text-slate-500 dark:text-slate-400 group-hover:text-amber-600 dark:group-hover:text-amber-400'
                )}
              >
                {item.label}
              </span>
              <span
                className={cn(
                  'text-xs sm:text-sm font-mono transition-colors',
                  isActive
                    ? 'text-amber-800 dark:text-amber-300 font-black'
                    : 'font-bold text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400'
                )}
              >
                {isRTL ? toLocalizedDigits(item.value, true) : item.value}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default MyBidsStats;
