import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { useAuctions } from '../hooks/useAuctions';
import { CategoryPillNav } from '../components/browse/CategoryPillNav';
import { AuctionFilterBar } from '../components/browse/AuctionFilterBar';
import { AuctionSortDropdown } from '../components/browse/AuctionSortDropdown';
import { AuctionGrid } from '../components/browse/AuctionGrid';
import { Button } from '@/components/common/Button';
import { Alert } from '@/components/common/Alert';
import { toLocalizedDigits } from '@/utils/formatters';

export const AuctionListPage: React.FC = () => {
  const { t, i18n } = useTranslation('auctions');
  const isRTL = i18n.language?.startsWith('ar');

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const {
    auctions,
    total,
    totalPages,
    page,
    hasNextPage,
    isLoading,
    error,
    filters,
    actions,
  } = useAuctions(12);

  return (
    <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      {/* Minimalist, Elegant Hero Section */}
      <div className="text-center pt-2 pb-4 space-y-3 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-1.5 text-xs font-bold px-3.5 py-1.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>{t('hero.badge')}</span>
        </div>

        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
          {t('hero.title')}
        </h1>

        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-lg mx-auto">
          {t('hero.subtitle')}
        </p>
      </div>

      {/* Error Alert */}
      {error && <Alert variant="error">{error}</Alert>}

      {/* Horizontal Category Navigation with Smooth Arrows */}
      <section aria-label="Categories">
        <CategoryPillNav
          selectedCategory={filters.category}
          onSelectCategory={actions.setCategory}
        />
      </section>

      {/* Search & Filter Bar */}
      <section aria-label="Filters">
        <AuctionFilterBar
          search={filters.search}
          onSearchChange={actions.setSearch}
          selectedStatus={filters.status}
          onStatusChange={actions.setStatus}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          hasActiveFilters={filters.hasActiveFilters}
          onResetFilters={actions.resetFilters}
        />
      </section>

      {/* Results Counter & Sort Dropdown */}
      <div className="flex items-center justify-between gap-4 pt-2 border-t border-slate-200 dark:border-slate-800/80 text-xs text-slate-500 dark:text-slate-400">
        <div>
          {!isLoading && (
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              {t('browse.resultsCount', {
                count: isRTL ? toLocalizedDigits(auctions.length, true) : auctions.length,
                total: isRTL ? toLocalizedDigits(total, true) : total,
              })}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <span className="hidden sm:inline font-medium text-slate-600 dark:text-slate-400">{t('sort.label')}</span>
          <AuctionSortDropdown
            selectedSort={filters.sort}
            onSortChange={actions.setSort}
          />
        </div>
      </div>

      {/* Auctions Grid / List View */}
      <section aria-label="Auction Catalog">
        <AuctionGrid
          auctions={auctions}
          isLoading={isLoading}
          viewMode={viewMode}
          onResetFilters={actions.resetFilters}
          onStatusExpire={() => actions.refetch()}
        />
      </section>

      {/* Pagination Navigation */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-6 border-t border-slate-200 dark:border-slate-800">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1 || isLoading}
            onClick={() => actions.setPage(page - 1)}
            leftIcon={isRTL ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          >
            {t('browse.prevPage')}
          </Button>

          <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
            {t('browse.page', {
              current: isRTL ? toLocalizedDigits(page, true) : page,
              total: isRTL ? toLocalizedDigits(totalPages, true) : totalPages,
            })}
          </span>

          <Button
            variant="outline"
            size="sm"
            disabled={!hasNextPage || page >= totalPages || isLoading}
            onClick={() => actions.setPage(page + 1)}
            rightIcon={isRTL ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          >
            {t('browse.nextPage')}
          </Button>
        </div>
      )}
    </div>
  );
};

export default AuctionListPage;
