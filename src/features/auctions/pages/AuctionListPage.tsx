import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Gavel,
  PlusCircle,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  User,
  LogOut,
  LogIn,
  UserPlus,
} from 'lucide-react';
import { useAuctions } from '../hooks/useAuctions';
import { CategoryPillNav } from '../components/browse/CategoryPillNav';
import { AuctionFilterBar } from '../components/browse/AuctionFilterBar';
import { AuctionSortDropdown } from '../components/browse/AuctionSortDropdown';
import { AuctionGrid } from '../components/browse/AuctionGrid';
import { LanguageSwitcher } from '@/components/common/LanguageSwitcher';
import { ThemeToggle } from '@/components/common/ThemeToggle';
import { Button } from '@/components/common/Button';
import { Alert } from '@/components/common/Alert';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/constants/routes.constants';

export const AuctionListPage: React.FC = () => {
  const { t, i18n } = useTranslation('auctions');
  const { t: tCommon } = useTranslation('common');
  const isRTL = i18n.language?.startsWith('ar');
  const { user, isAuthenticated, logout } = useAuth();

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
    <div className="min-h-screen flex flex-col justify-between bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      {/* Top Navbar */}
      <header className="sticky top-0 z-30 w-full bg-white/90 dark:bg-slate-950/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4">
          {/* Brand Logo */}
          <Link to={ROUTES.HOME} className="flex items-center gap-2 group shrink-0">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center border border-amber-500/20 group-hover:scale-105 transition-transform">
              <Gavel className="w-5 h-5" />
            </div>
            <span className="text-lg font-black tracking-tight text-slate-900 dark:text-white">
              {tCommon('appName')}
            </span>
          </Link>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold">
            <Link
              to={ROUTES.HOME}
              className="text-slate-600 dark:text-slate-400 hover:text-amber-500 transition-colors"
            >
              {tCommon('nav.home')}
            </Link>
            <Link
              to={ROUTES.AUCTIONS}
              className="text-amber-500 font-bold border-b-2 border-amber-500 pb-0.5"
            >
              {t('title')}
            </Link>
            {isAuthenticated && (
              <Link
                to={ROUTES.MY_AUCTIONS}
                className="text-slate-600 dark:text-slate-400 hover:text-amber-500 transition-colors"
              >
                {t('myAuctions.title')}
              </Link>
            )}
          </nav>

          {/* User & Settings Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            <LanguageSwitcher />
            <ThemeToggle />

            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <Link to={ROUTES.CREATE_AUCTION}>
                  <Button
                    variant="accent"
                    size="sm"
                    leftIcon={<PlusCircle className="w-3.5 h-3.5" />}
                    className="hidden sm:inline-flex"
                  >
                    {t('create.title')}
                  </Button>
                </Link>

                <div className="hidden lg:flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  <User className="w-3.5 h-3.5 text-amber-500" />
                  <span>{user?.firstName}</span>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={logout}
                  leftIcon={<LogOut className="w-3.5 h-3.5" />}
                  className="text-xs text-slate-500 hover:text-red-500"
                >
                  {tCommon('nav.logout')}
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <Link to={ROUTES.LOGIN}>
                  <Button variant="ghost" size="sm" leftIcon={<LogIn className="w-3.5 h-3.5" />}>
                    {tCommon('nav.login')}
                  </Button>
                </Link>
                <Link to={ROUTES.REGISTER}>
                  <Button variant="accent" size="sm" leftIcon={<UserPlus className="w-3.5 h-3.5" />}>
                    {tCommon('nav.register')}
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
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
                  count: auctions.length,
                  total,
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
                current: page,
                total: totalPages,
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
      </main>

      {/* Global Footer */}
      <footer className="w-full border-t border-slate-200 dark:border-slate-800 py-6 text-center text-xs text-slate-400 dark:text-slate-600 mt-12">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span>© {new Date().getFullYear()} Mazadak Platform. {tCommon('rightsReserved')}</span>
          <div className="flex items-center gap-4 text-xs font-medium">
            <Link to={ROUTES.HOME} className="hover:text-amber-500 transition-colors">
              {tCommon('nav.home')}
            </Link>
            <Link to={ROUTES.AUCTIONS} className="hover:text-amber-500 transition-colors">
              {t('title')}
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AuctionListPage;
