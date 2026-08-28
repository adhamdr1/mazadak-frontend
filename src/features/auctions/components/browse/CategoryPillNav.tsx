import React, { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/utils/cn';
import type { AuctionCategory } from '../../types/auctions.types';
import { CategoryBadge } from '../shared/CategoryBadge';

export interface CategoryPillNavProps {
  selectedCategory?: AuctionCategory;
  onSelectCategory: (category?: AuctionCategory) => void;
  className?: string;
}

const ALL_CATEGORIES: AuctionCategory[] = [
  'CARS',
  'WATCHES',
  'REAL_ESTATE',
  'JEWELRY',
  'ELECTRONICS',
  'ART',
  'ANTIQUES',
  'COLLECTIBLES',
  'FASHION',
  'MOTORCYCLES',
  'FURNITURE',
  'HOME_APPLIANCES',
  'SPORTS',
  'BOOKS',
  'TOYS',
  'OTHER',
];

export const CategoryPillNav: React.FC<CategoryPillNavProps> = ({
  selectedCategory,
  onSelectCategory,
  className,
}) => {
  const { t, i18n } = useTranslation('auctions');
  const isRTL = i18n.language?.startsWith('ar');
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const handleScroll = (direction: 'start' | 'end') => {
    if (scrollContainerRef.current) {
      const scrollDistance = 280;
      const scrollMultiplier = direction === 'end' ? 1 : -1;
      const effectiveScroll = isRTL ? -scrollMultiplier * scrollDistance : scrollMultiplier * scrollDistance;

      scrollContainerRef.current.scrollBy({
        left: effectiveScroll,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div className={cn('relative w-full flex items-center gap-2 group/nav', className)}>
      {/* Start / Previous Category Navigation Arrow Button */}
      <button
        type="button"
        onClick={() => handleScroll('start')}
        className="shrink-0 w-8 h-8 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-amber-500 hover:text-amber-500 dark:hover:border-amber-500 dark:hover:text-amber-400 shadow-sm flex items-center justify-center transition-colors duration-150 focus:outline-none"
        aria-label="Scroll start"
      >
        {isRTL ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>

      {/* Scrollable Container */}
      <div
        ref={scrollContainerRef}
        className="flex-1 flex items-center gap-2 overflow-x-auto py-1 px-0.5 scroll-smooth [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
      >
        {/* "All Categories" Pill */}
        <button
          type="button"
          onClick={() => onSelectCategory(undefined)}
          className={cn(
            'inline-flex items-center gap-1.5 text-xs px-4 py-2.5 rounded-xl transition-colors duration-150 shrink-0 border select-none leading-normal',
            !selectedCategory
              ? 'bg-amber-500 text-slate-950 border-amber-500 font-extrabold shadow-sm'
              : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-amber-500 dark:hover:border-amber-500 hover:text-amber-600 dark:hover:text-amber-400 font-medium'
          )}
        >
          <Sparkles className={cn('w-3.5 h-3.5', !selectedCategory ? 'text-slate-950 stroke-[2.5]' : 'text-amber-500 stroke-2')} />
          <span className="pt-0.5">{t('categories.all')}</span>
        </button>

        {/* 16 Category Badges */}
        {ALL_CATEGORIES.map((cat) => (
          <CategoryBadge
            key={cat}
            category={cat}
            isActive={selectedCategory === cat}
            onClick={() => onSelectCategory(selectedCategory === cat ? undefined : cat)}
            className="shrink-0 py-2.5 px-4 text-xs rounded-xl"
          />
        ))}
      </div>

      {/* End / Next Category Navigation Arrow Button */}
      <button
        type="button"
        onClick={() => handleScroll('end')}
        className="shrink-0 w-8 h-8 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-amber-500 hover:text-amber-500 dark:hover:border-amber-500 dark:hover:text-amber-400 shadow-sm flex items-center justify-center transition-colors duration-150 focus:outline-none"
        aria-label="Scroll end"
      >
        {isRTL ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
      </button>
    </div>
  );
};

export default CategoryPillNav;
