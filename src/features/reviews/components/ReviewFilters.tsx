import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Star,
  ArrowUpDown,
  RotateCcw,
  Clock,
  ChevronDown,
  Check,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';
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

  const [isSortOpen, setIsSortOpen] = useState(false);
  const sortRef = useRef<HTMLDivElement>(null);

  const isFiltered =
    activeType !== 'ALL' || minRating > 0 || sortField !== 'CREATED_AT' || sortOrder !== 'DESC';

  // Close custom dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) {
        setIsSortOpen(false);
      }
    };
    if (isSortOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isSortOpen]);

  // Close custom dropdown on escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isSortOpen) {
        setIsSortOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSortOpen]);

  const currentSortValue =
    sortField === 'RATING'
      ? sortOrder === 'DESC'
        ? 'HIGHEST'
        : 'LOWEST'
      : sortOrder === 'ASC'
      ? 'OLDEST'
      : 'NEWEST';

  const sortOptions = [
    {
      value: 'NEWEST',
      label: t('reviews:filters.newest', 'الأحدث أولاً'),
      icon: Clock,
      onClick: () => onSortChange('CREATED_AT', 'DESC'),
    },
    {
      value: 'OLDEST',
      label: t('reviews:filters.oldest', 'الأقدم أولاً'),
      icon: Clock,
      onClick: () => onSortChange('CREATED_AT', 'ASC'),
    },
    {
      value: 'HIGHEST',
      label: t('reviews:filters.highestRated', 'الأعلى تقييماً'),
      icon: TrendingUp,
      onClick: () => onSortChange('RATING', 'DESC'),
    },
    {
      value: 'LOWEST',
      label: t('reviews:filters.lowestRated', 'الأقل تقييماً'),
      icon: TrendingDown,
      onClick: () => onSortChange('RATING', 'ASC'),
    },
  ];

  const currentSortOption =
    sortOptions.find((opt) => opt.value === currentSortValue) || sortOptions[0];

  return (
    <div
      className={`bg-white dark:bg-slate-900 rounded-2xl p-2.5 sm:p-3.5 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between gap-2.5 overflow-visible relative z-30 select-none ${className}`}
    >
      {/* Left: Review Types segmented buttons in one continuous row */}
      <div className="flex items-center gap-1 sm:gap-1.5 shrink-0 overflow-x-auto no-scrollbar">
        <button
          type="button"
          onClick={() => onTypeChange('ALL')}
          className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
            activeType === 'ALL'
              ? 'bg-amber-500 text-slate-950 shadow-xs font-bold'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          {t('reviews:filters.allTypes', 'جميع التقييمات')}
        </button>

        <button
          type="button"
          onClick={() => onTypeChange('BUYER_TO_SELLER')}
          className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
            activeType === 'BUYER_TO_SELLER'
              ? 'bg-amber-500 text-slate-950 shadow-xs font-bold'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          {t('reviews:filters.buyerToSeller', 'من المشترين')}
        </button>

        <button
          type="button"
          onClick={() => onTypeChange('SELLER_TO_BUYER')}
          className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
            activeType === 'SELLER_TO_BUYER'
              ? 'bg-amber-500 text-slate-950 shadow-xs font-bold'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          {t('reviews:filters.sellerToBuyer', 'من البائعين')}
        </button>
      </div>

      {/* Right: Min Rating Filter + Custom Sort Dropdown + Reset */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        {/* Min Rating Filter Pills */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200/60 dark:border-slate-700/50 shrink-0">
          <button
            type="button"
            onClick={() => onMinRatingChange(0)}
            className={`px-2 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              minRating === 0
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            {t('reviews:filters.allRatings', 'الكل')}
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

        {/* Custom Luxury Sort Dropdown (Zero native outline / Zero orange line glitch) */}
        <div ref={sortRef} className="relative inline-block text-start shrink-0">
          <button
            type="button"
            onClick={() => setIsSortOpen((prev) => !prev)}
            aria-haspopup="listbox"
            aria-expanded={isSortOpen}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer border select-none ${
              isSortOpen
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white border-amber-500 shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200/80 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 border-slate-200/60 dark:border-slate-700/50'
            }`}
          >
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="whitespace-nowrap">{currentSortOption.label}</span>
            <ChevronDown
              className={`w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform duration-200 ${
                isSortOpen ? 'rotate-180 text-amber-500' : ''
              }`}
            />
          </button>

          {/* Floating Dropdown Menu */}
          {isSortOpen && (
            <div
              role="listbox"
              className="absolute end-0 top-full mt-1.5 w-44 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-700/80 shadow-2xl p-1.5 z-50 animate-in fade-in-0 zoom-in-95 duration-100 space-y-0.5"
            >
              {sortOptions.map((option) => {
                const isSelected = option.value === currentSortValue;
                const OptionIcon = option.icon;

                return (
                  <button
                    key={option.value}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => {
                      option.onClick();
                      setIsSortOpen(false);
                    }}
                    className={`w-full flex items-center justify-between gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-colors text-start cursor-pointer ${
                      isSelected
                        ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <OptionIcon
                        className={`w-3.5 h-3.5 shrink-0 ${
                          isSelected ? 'text-amber-500' : 'text-slate-400'
                        }`}
                      />
                      <span className="truncate">{option.label}</span>
                    </div>

                    {isSelected && (
                      <Check className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Reset button if active */}
        {isFiltered && onReset && (
          <button
            type="button"
            onClick={onReset}
            title={t('reviews:filters.reset', 'إعادة ضبط التصفية')}
            className="p-1.5 sm:p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer shrink-0"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};

export default ReviewFilters;
