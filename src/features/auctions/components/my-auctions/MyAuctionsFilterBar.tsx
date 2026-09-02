import React from 'react';
import { useTranslation } from 'react-i18next';
import { Search, X, Layers, Trophy, RotateCcw } from 'lucide-react';
import { cn } from '@/utils/cn';
import type { MyAuctionsTab, FilterStatus } from '../../hooks/useMyAuctions';
import type { AuctionCategory, AuctionStatus } from '../../types/auctions.types';

export interface MyAuctionsFilterBarProps {
  activeTab: MyAuctionsTab;
  statusFilter: FilterStatus;
  categoryFilter?: AuctionCategory;
  searchQuery: string;
  totalCount: number;
  onTabChange: (tab: MyAuctionsTab) => void;
  onStatusChange: (status: FilterStatus) => void;
  onCategoryChange: (category: AuctionCategory | undefined) => void;
  onSearchChange: (search: string) => void;
  onResetFilters: () => void;
  className?: string;
}

const STATUS_FILTERS: { value: FilterStatus; labelKey: string }[] = [
  { value: 'ALL', labelKey: 'status.all' },
  { value: 'ACTIVE' as AuctionStatus, labelKey: 'status.ACTIVE' },
  { value: 'PENDING' as AuctionStatus, labelKey: 'status.PENDING' },
  { value: 'ENDED' as AuctionStatus, labelKey: 'status.ENDED' },
  { value: 'CANCELLED' as AuctionStatus, labelKey: 'status.CANCELLED' },
];

export const MyAuctionsFilterBar: React.FC<MyAuctionsFilterBarProps> = ({
  activeTab,
  statusFilter,
  searchQuery,
  onTabChange,
  onStatusChange,
  onSearchChange,
  onResetFilters,
  className,
}) => {
  const { t } = useTranslation('auctions');

  const hasActiveFilters = statusFilter !== 'ALL' || searchQuery.trim().length > 0;

  return (
    <div className={cn('space-y-4', className)}>
      {/* 1. Primary Tabs (Created Listings vs Won Auctions) */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pb-3 border-b border-slate-200/80 dark:border-slate-800">
        <div className="inline-flex p-1 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => onTabChange('created')}
            className={cn(
              'px-4 py-2 rounded-lg text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer select-none',
              activeTab === 'created'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            )}
          >
            <Layers className="w-4 h-4 text-amber-500" />
            <span>{t('myAuctions.createdTab')}</span>
          </button>

          <button
            type="button"
            onClick={() => onTabChange('won')}
            className={cn(
              'px-4 py-2 rounded-lg text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer select-none',
              activeTab === 'won'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            )}
          >
            <Trophy className="w-4 h-4 text-amber-500" />
            <span>{t('myAuctions.wonTab')}</span>
          </button>
        </div>

        {/* Reset Filter Action */}
        {hasActiveFilters && (
          <button
            type="button"
            onClick={onResetFilters}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline cursor-pointer self-end sm:self-auto"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{t('myAuctions.clearFilters')}</span>
          </button>
        )}
      </div>

      {/* 2. Search & Status Filter Tabs matching AuctionFilterBar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Status Tabs */}
        <div className="inline-flex p-1 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 overflow-x-auto scrollbar-none">
          {STATUS_FILTERS.map((s) => {
            const isSelected = statusFilter === s.value;
            return (
              <button
                key={s.value}
                type="button"
                onClick={() => onStatusChange(s.value)}
                className={cn(
                  'text-xs font-semibold px-3 py-1.5 rounded-lg transition-all select-none shrink-0 cursor-pointer',
                  isSelected
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                )}
              >
                {t(s.labelKey)}
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute start-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={t('myAuctions.searchPlaceholder')}
            className="w-full text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 py-2 ps-10 pe-9 outline-none focus:outline-none focus:border-amber-500 dark:focus:border-amber-500 hover:border-slate-300 dark:hover:border-slate-700 transition-colors duration-150 shadow-sm"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="absolute end-3 top-1/2 -translate-y-1/2 p-0.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyAuctionsFilterBar;
