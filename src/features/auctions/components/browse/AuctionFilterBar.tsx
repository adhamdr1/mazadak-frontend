import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, X, LayoutGrid, List, RotateCcw } from 'lucide-react';
import { cn } from '@/utils/cn';
import type { AuctionStatus } from '../../types/auctions.types';

export interface AuctionFilterBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  selectedStatus?: AuctionStatus;
  onStatusChange: (status?: AuctionStatus) => void;
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
  hasActiveFilters: boolean;
  onResetFilters: () => void;
  className?: string;
}

const STATUS_TABS: Array<{ value?: AuctionStatus; labelKey: string }> = [
  { value: undefined, labelKey: 'status.all' },
  { value: 'ACTIVE', labelKey: 'status.ACTIVE' },
  { value: 'PENDING', labelKey: 'status.PENDING' },
  { value: 'ENDED', labelKey: 'status.ENDED' },
];

export const AuctionFilterBar: React.FC<AuctionFilterBarProps> = ({
  search,
  onSearchChange,
  selectedStatus,
  onStatusChange,
  viewMode,
  onViewModeChange,
  hasActiveFilters,
  onResetFilters,
  className,
}) => {
  const { t } = useTranslation('auctions');
  const [localSearch, setLocalSearch] = useState(search);

  // Sync external search updates
  useEffect(() => {
    setLocalSearch(search);
  }, [search]);

  // Debounce search update to URL
  useEffect(() => {
    const handler = setTimeout(() => {
      if (localSearch !== search) {
        onSearchChange(localSearch);
      }
    }, 350);

    return () => clearTimeout(handler);
  }, [localSearch, search, onSearchChange]);

  return (
    <div className={cn('flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3', className)}>
      {/* Search Input */}
      <div className="relative flex-1 max-w-lg">
        <Search className="absolute start-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500 pointer-events-none" />
        <input
          type="text"
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
          placeholder={t('browse.searchPlaceholder')}
          className="w-full text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 py-2.5 ps-10 pe-9 outline-none focus:outline-none focus:border-amber-500 dark:focus:border-amber-500 ring-0 focus:ring-0 ring-offset-0 focus:ring-offset-0 hover:border-slate-300 dark:hover:border-slate-700 transition-colors duration-150 shadow-sm"
        />
        {localSearch && (
          <button
            type="button"
            onClick={() => {
              setLocalSearch('');
              onSearchChange('');
            }}
            className="absolute end-3 top-1/2 -translate-y-1/2 p-0.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            aria-label="Clear search"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Status Tabs + View Toggle */}
      <div className="flex items-center justify-between md:justify-end gap-2 flex-wrap sm:flex-nowrap">
        {/* Status Filter Tabs */}
        <div className="inline-flex p-1 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shrink-0">
          {STATUS_TABS.map((tab) => {
            const isSelected = selectedStatus === tab.value;
            return (
              <button
                key={tab.labelKey}
                type="button"
                onClick={() => onStatusChange(tab.value)}
                className={cn(
                  'text-xs font-semibold px-3 py-1.5 rounded-lg transition-all select-none',
                  isSelected
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                )}
              >
                {t(tab.labelKey)}
              </button>
            );
          })}
        </div>

        {/* View Mode Toggle (Grid vs List) */}
        <div className="inline-flex p-1 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shrink-0">
          <button
            type="button"
            onClick={() => onViewModeChange('grid')}
            className={cn(
              'p-1.5 rounded-lg transition-all',
              viewMode === 'grid'
                ? 'bg-white dark:bg-slate-800 text-amber-500 shadow-sm'
                : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
            )}
            aria-label="Grid view"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => onViewModeChange('list')}
            className={cn(
              'p-1.5 rounded-lg transition-all',
              viewMode === 'list'
                ? 'bg-white dark:bg-slate-800 text-amber-500 shadow-sm'
                : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
            )}
            aria-label="List view"
          >
            <List className="w-4 h-4" />
          </button>
        </div>

        {/* Reset Filters Quick Button */}
        {hasActiveFilters && (
          <button
            type="button"
            onClick={onResetFilters}
            className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline px-2 py-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{t('browse.resetFilters')}</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default AuctionFilterBar;
