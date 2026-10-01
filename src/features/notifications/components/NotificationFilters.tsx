import React from 'react';
import { useTranslation } from 'react-i18next';
import { Gavel, Wallet, ShieldCheck, Layers, Sparkles } from 'lucide-react';
import { useUnreadNotificationsCount } from '../hooks/useUnreadNotificationsCount';
import { toLocalizedDigits } from '@/utils/formatters';
import { cn } from '@/utils/cn';
import type { NotificationCategory } from '../types/notifications.types';

export type ActiveFilterCategory = 'ALL' | NotificationCategory;

export interface NotificationFiltersProps {
  activeCategory: ActiveFilterCategory;
  onSelectCategory: (category: ActiveFilterCategory) => void;
  className?: string;
}

interface TabConfig {
  key: ActiveFilterCategory;
  labelKey: string;
  category?: NotificationCategory;
  icon: React.ElementType;
}

const TABS: TabConfig[] = [
  { key: 'ALL', labelKey: 'page.tabs.all', icon: Layers },
  { key: 'AUCTIONS', labelKey: 'page.tabs.auctions', category: 'AUCTIONS', icon: Gavel },
  { key: 'FINANCIAL', labelKey: 'page.tabs.financial', category: 'FINANCIAL', icon: Wallet },
  { key: 'ESCROW', labelKey: 'page.tabs.escrow', category: 'ESCROW', icon: ShieldCheck },
  { key: 'SYSTEM', labelKey: 'page.tabs.system', category: 'SYSTEM', icon: Sparkles },
];

export const NotificationFilters: React.FC<NotificationFiltersProps> = ({
  activeCategory,
  onSelectCategory,
  className,
}) => {
  const { t, i18n } = useTranslation('notifications');
  const isRTL = i18n.language?.startsWith('ar');

  const { unreadCount: allUnread } = useUnreadNotificationsCount();
  const { unreadCount: auctionsUnread } = useUnreadNotificationsCount('AUCTIONS');
  const { unreadCount: financialUnread } = useUnreadNotificationsCount('FINANCIAL');
  const { unreadCount: escrowUnread } = useUnreadNotificationsCount('ESCROW');
  const { unreadCount: systemUnread } = useUnreadNotificationsCount('SYSTEM');

  const getUnreadCountForTab = (tabKey: ActiveFilterCategory): number => {
    switch (tabKey) {
      case 'ALL':
        return allUnread;
      case 'AUCTIONS':
        return auctionsUnread;
      case 'FINANCIAL':
        return financialUnread;
      case 'ESCROW':
        return escrowUnread;
      case 'SYSTEM':
        return systemUnread;
      default:
        return 0;
    }
  };

  return (
    <div className={cn('w-full select-none', className)}>
      {/* Segmented Tab Bar - Balanced, High-Density, Full Width */}
      <div className="grid grid-cols-5 p-1.5 bg-slate-100/90 dark:bg-slate-800/80 rounded-2xl gap-1.5 border border-slate-200/80 dark:border-slate-700/80 shadow-xs">
        {TABS.map((tab) => {
          const isActive = activeCategory === tab.key;
          const unreadCount = getUnreadCountForTab(tab.key);
          const Icon = tab.icon;

          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => onSelectCategory(tab.key)}
              className={cn(
                'flex items-center justify-center gap-1.5 sm:gap-2 py-2.5 sm:py-3 px-2 sm:px-3 rounded-xl text-xs sm:text-sm transition-all duration-200 cursor-pointer min-w-0',
                isActive
                  ? 'bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 font-extrabold shadow-sm border border-slate-200/90 dark:border-slate-700/80 scale-[1.01]'
                  : 'text-slate-600 dark:text-slate-400 font-bold hover:text-slate-900 dark:hover:text-white hover:bg-white/40 dark:hover:bg-slate-800/40'
              )}
            >
              <Icon className={cn('w-4 h-4 shrink-0 hidden xs:inline-block transition-colors', isActive ? 'text-amber-500' : 'text-slate-400 dark:text-slate-500')} />
              <span className="truncate">{t(tab.labelKey)}</span>

              {unreadCount > 0 && (
                <span
                  className={cn(
                    'px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-black leading-none shrink-0 transition-colors',
                    isActive
                      ? 'bg-amber-500 text-slate-950 shadow-xs'
                      : 'bg-amber-500/15 text-amber-700 dark:text-amber-400'
                  )}
                >
                  {toLocalizedDigits(unreadCount > 99 ? '99+' : unreadCount, isRTL)}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
