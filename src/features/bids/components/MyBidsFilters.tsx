import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  ArrowUpDown,
  RotateCcw,
  Sparkles,
  History,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';
import { CustomSelect, type CustomSelectOption } from '@/components/common/CustomSelect';
import type { MyBidsFilterStatus, MyBidsSortOption } from '../hooks/useMyBids';

export interface MyBidsFiltersProps {
  statusFilter: MyBidsFilterStatus;
  sortOption: MyBidsSortOption;
  onSortChange: (sort: MyBidsSortOption) => void;
  onResetFilters: () => void;
}

export const MyBidsFilters: React.FC<MyBidsFiltersProps> = ({
  statusFilter,
  sortOption,
  onSortChange,
  onResetFilters,
}) => {
  const { t } = useTranslation('bids');

  const sortOptions: CustomSelectOption<MyBidsSortOption>[] = [
    {
      value: 'NEWEST',
      label: t('myBids.filters.sortNewest'),
      icon: Sparkles,
    },
    {
      value: 'OLDEST',
      label: t('myBids.filters.sortOldest'),
      icon: History,
    },
    {
      value: 'HIGHEST_AMOUNT',
      label: t('myBids.filters.sortHighest'),
      icon: TrendingUp,
    },
    {
      value: 'LOWEST_AMOUNT',
      label: t('myBids.filters.sortLowest'),
      icon: TrendingDown,
    },
  ];

  const hasActiveFilters = statusFilter !== 'ALL' || sortOption !== 'NEWEST';

  return (
    <div className="flex items-center justify-end gap-2.5 w-full">
      {/* Custom Sort Dropdown (Exactly matched trigger & menu width) */}
      <CustomSelect<MyBidsSortOption>
        value={sortOption}
        onChange={onSortChange}
        options={sortOptions}
        icon={ArrowUpDown}
        ariaLabel={t('myBids.filters.sortBy')}
        className="w-48 sm:w-52"
      />

      {/* Refined Reset Filter Button */}
      {hasActiveFilters && (
        <button
          type="button"
          onClick={onResetFilters}
          title={t('myBids.empty.clearFilters')}
          className="group/reset inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold cursor-pointer select-none transition-all duration-200 bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-500/30 hover:border-amber-500/60 shadow-2xs active:scale-[0.97]"
        >
          <div className="w-5 h-5 rounded-lg bg-amber-500/20 flex items-center justify-center shrink-0 transition-transform duration-500 group-hover/reset:-rotate-180">
            <RotateCcw className="w-3 h-3 text-amber-600 dark:text-amber-400" />
          </div>
          <span className="whitespace-nowrap">{t('myBids.empty.clearFilters')}</span>
        </button>
      )}
    </div>
  );
};

export default MyBidsFilters;
