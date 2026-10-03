import React from 'react';
import { useTranslation } from 'react-i18next';
import { Star, ArrowUpDown, RotateCcw } from 'lucide-react';
import { toLocalizedDigits } from '@/utils/formatters';
import type {
  ReviewType,
  ReviewsSortField,
  SortOrder,
} from '../types/reviews.types';

export interface ReviewFiltersProps {
  activeType?: ReviewType | 'ALL';
  onTypeChange: (type: ReviewType | 'ALL') => void;
  minRating?: number;
  onMinRatingChange: (rating: number) => void;
  sortField: ReviewsSortField;
  sortOrder: SortOrder;
  onSortChange: (field: ReviewsSortField, order: SortOrder) => void;
  onReset?: () => void;
  className?: string;
}

export const ReviewFilters: React.FC<ReviewFiltersProps> = ({
  activeType = 'ALL',
  onTypeChange,
  minRating = 0,
  onMinRatingChange,
  sortField,
  sortOrder,
  onSortChange,
  onReset,
  className = '',
}) => {
  const { t, i18n } = useTranslation(['reviews', 'common']);
  const isRTL = i18n.language?.startsWith('ar');

  const isFiltered = activeType !== 'ALL' || minRating > 0 || sortField !== 'CREATED_AT' || sortOrder !== 'DESC';

  const handleSortSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    switch (val) {
      case 'NEWEST':
        onSortChange('CREATED_AT', 'DESC');
        break;
      case 'OLDEST':
        onSortChange('CREATED_AT', 'ASC');
        break;
      case 'HIGHEST':
        onSortChange('RATING', 'DESC');
        break;
      case 'LOWEST':
        onSortChange('RATING', 'ASC');
        break;
      default:
        onSortChange('CREATED_AT', 'DESC');
    }
  };

  const currentSortValue =
    sortField === 'RATING'
      ? sortOrder === 'DESC'
        ? 'HIGHEST'
        : 'LOWEST'
      : sortOrder === 'ASC'
      ? 'OLDEST'
      : 'NEWEST';

  return (
    <div
      className={`bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 ${className}`}
    >
      {/* Left: Review Types segmented buttons */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
        <button
          type="button"
          onClick={() => onTypeChange('ALL')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
            activeType === 'ALL'
              ? 'bg-amber-500 text-slate-950 shadow-xs font-bold'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          {t('reviews:filters.allTypes')}
        </button>

        <button
          type="button"
          onClick={() => onTypeChange('BUYER_TO_SELLER')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
            activeType === 'BUYER_TO_SELLER'
              ? 'bg-amber-500 text-slate-950 shadow-xs font-bold'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          {t('reviews:filters.buyerToSeller')}
        </button>

        <button
          type="button"
          onClick={() => onTypeChange('SELLER_TO_BUYER')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
            activeType === 'SELLER_TO_BUYER'
              ? 'bg-amber-500 text-slate-950 shadow-xs font-bold'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          {t('reviews:filters.sellerToBuyer')}
        </button>
      </div>

      {/* Right: Min Rating Filter + Sort Dropdown + Reset */}
      <div className="flex flex-wrap items-center gap-2.5">
        {/* Min Rating Filter Pills */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200/60 dark:border-slate-700/50">
          <button
            type="button"
            onClick={() => onMinRatingChange(0)}
            className={`px-2 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              minRating === 0
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            {t('reviews:filters.allRatings')}
          </button>
          {[4, 3].map((stars) => (
            <button
              key={stars}
              type="button"
              onClick={() => onMinRatingChange(stars)}
              className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                minRating === stars
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <span>{toLocalizedDigits(`${stars}+`, isRTL)}</span>
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
            </button>
          ))}
        </div>

        {/* Sort Select */}
        <div className="relative inline-flex items-center">
          <select
            value={currentSortValue}
            onChange={handleSortSelect}
            className="appearance-none bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 text-xs font-semibold py-2 ps-8 pe-3 rounded-xl border border-slate-200/60 dark:border-slate-700/50 focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer transition-colors"
          >
            <option value="NEWEST">{t('reviews:filters.newest')}</option>
            <option value="OLDEST">{t('reviews:filters.oldest')}</option>
            <option value="HIGHEST">{t('reviews:filters.highestRated')}</option>
            <option value="LOWEST">{t('reviews:filters.lowestRated')}</option>
          </select>
          <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 pointer-events-none absolute start-2.5" />
        </div>

        {/* Reset button if active */}
        {isFiltered && onReset && (
          <button
            type="button"
            onClick={onReset}
            title={t('reviews:filters.reset')}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};
