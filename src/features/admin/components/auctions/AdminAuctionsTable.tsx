import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import {
  Search,
  X,
  RefreshCw,
  ArrowUpDown,
  Ban,
  MessageSquare,
  ExternalLink,
  Calendar,
  Layers,
  ChevronDown,
  Check,
  Image as ImageIcon,
} from 'lucide-react';
import { Pagination } from '@/components/common/Pagination';
import { ROUTES } from '@/constants/routes.constants';
import {
  formatAdminCurrency,
  formatAdminDate,
  getAuctionStatusBadge,
  getAuctionCategoryLabel,
} from '../../utils/admin.utils';
import type { Auction, AuctionStatus, AuctionCategory } from '../../types/admin.types';

const CATEGORIES: AuctionCategory[] = [
  'ELECTRONICS',
  'FASHION',
  'JEWELRY',
  'WATCHES',
  'ANTIQUES',
  'ART',
  'COLLECTIBLES',
  'BOOKS',
  'FURNITURE',
  'HOME_APPLIANCES',
  'CARS',
  'MOTORCYCLES',
  'REAL_ESTATE',
  'SPORTS',
  'TOYS',
  'OTHER',
];

export interface AdminAuctionsTableProps {
  auctions: Auction[];
  total?: number;
  totalPages: number;
  currentPage: number;
  isLoading: boolean;
  isRefetching: boolean;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  selectedCategory?: AuctionCategory | 'ALL';
  onCategoryChange: (category: AuctionCategory | 'ALL') => void;
  selectedStatus?: AuctionStatus | 'ALL';
  onStatusChange: (status: AuctionStatus | 'ALL') => void;
  sortOrder: 'DESC' | 'ASC';
  onSortOrderToggle: () => void;
  onPageChange: (page: number) => void;
  onRefresh: () => void;
  onCancelAuction: (auction: Auction) => void;
  onModerateReviews: (auction: Auction) => void;
}

export const AdminAuctionsTable: React.FC<AdminAuctionsTableProps> = ({
  auctions,
  total,
  totalPages,
  currentPage,
  isLoading,
  isRefetching,
  searchQuery,
  onSearchChange,
  selectedCategory = 'ALL',
  onCategoryChange,
  selectedStatus = 'ALL',
  onStatusChange,
  sortOrder,
  onSortOrderToggle,
  onPageChange,
  onRefresh,
  onCancelAuction,
  onModerateReviews,
}) => {
  const { t, i18n } = useTranslation(['admin', 'common']);
  const isRTL = i18n.language?.startsWith('ar');

  // Category Dropdown State & Click-outside handler
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const categoryRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (categoryRef.current && !categoryRef.current.contains(event.target as Node)) {
        setIsCategoryOpen(false);
      }
    };
    if (isCategoryOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isCategoryOpen]);

  const selectedCategoryLabel =
    selectedCategory === 'ALL'
      ? t('auctions.filters.allCategories', { defaultValue: isRTL ? 'كافة التصنيفات' : 'All Categories' })
      : getAuctionCategoryLabel(selectedCategory, isRTL);

  // Status Filter Tabs Configuration (Smooth color transitions, translucent pattern)
  const statusTabs = [
    {
      id: 'ALL' as const,
      label: t('auctions.filters.allStatuses', { defaultValue: isRTL ? 'الكل' : 'All' }),
      activeClass:
        'bg-slate-500/15 dark:bg-slate-500/20 text-slate-800 dark:text-slate-200 border-slate-500/40 dark:border-slate-500/40',
    },
    {
      id: 'ACTIVE' as const,
      label: t('auctions.filters.statusActive', { defaultValue: isRTL ? 'النشطة' : 'Active' }),
      activeClass:
        'bg-emerald-500/15 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/40',
    },
    {
      id: 'PENDING' as const,
      label: t('auctions.filters.statusPending', { defaultValue: isRTL ? 'المعلقة' : 'Pending' }),
      activeClass:
        'bg-amber-500/15 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/40',
    },
    {
      id: 'ENDED' as const,
      label: t('auctions.filters.statusEnded', { defaultValue: isRTL ? 'المنتهية' : 'Ended' }),
      activeClass:
        'bg-blue-500/15 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-500/40',
    },
    {
      id: 'CANCELLED' as const,
      label: t('auctions.filters.statusCancelled', { defaultValue: isRTL ? 'الملغاة' : 'Cancelled' }),
      activeClass:
        'bg-rose-500/15 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 border-rose-500/40',
    },
  ];

  return (
    <div className="space-y-4">
      {/* 1. Control & Filter Command Toolbar (Matching AdminUsersTable Pattern) */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-4">
        {/* Row 1: Search Bar + Sort Order + Refresh Button */}
        <div className="flex items-center gap-2 sm:gap-3 w-full">
          {/* Direct Reactive Search Bar */}
          <div className="relative flex-1 min-w-0">
            <Search className="w-4 h-4 text-slate-400 absolute start-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={t('auctions.filters.searchPlaceholder', {
                defaultValue: isRTL
                  ? 'بحث بعنوان المزاد أو الوصف...'
                  : 'Search by auction title or description...',
              })}
              className="w-full ps-10 pe-10 py-2.5 rounded-2xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all truncate"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                className="absolute end-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg cursor-pointer outline-none focus:outline-none"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Sort Order Toggle */}
          <button
            type="button"
            onClick={onSortOrderToggle}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-amber-600 dark:hover:text-amber-400 transition-colors cursor-pointer shrink-0 shadow-2xs outline-none focus:outline-none"
          >
            <ArrowUpDown className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span className="hidden sm:inline">
              {sortOrder === 'DESC'
                ? t('auctions.filters.newest', { defaultValue: isRTL ? 'الأحدث أولاً' : 'Newest First' })
                : t('auctions.filters.oldest', { defaultValue: isRTL ? 'الأقدم أولاً' : 'Oldest First' })}
            </span>
            <span className="sm:hidden">
              {sortOrder === 'DESC' ? (isRTL ? 'الأحدث' : 'Newest') : (isRTL ? 'الأقدم' : 'Oldest')}
            </span>
          </button>

          {/* Refresh Button with Dashboard Animation & Strict Locale Handling (Matching AdminUsersTable Pattern) */}
          <button
            type="button"
            onClick={onRefresh}
            disabled={isLoading || isRefetching}
            className="group inline-flex items-center justify-center gap-1.5 px-3 sm:px-3.5 py-2.5 rounded-2xl text-xs font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-amber-500/10 dark:hover:bg-amber-500/15 hover:text-amber-600 dark:hover:text-amber-400 hover:border-amber-500/50 dark:hover:border-amber-500/40 border border-slate-200 dark:border-slate-700 shadow-2xs hover:shadow-xs transition-all duration-200 disabled:opacity-50 cursor-pointer active:scale-95 shrink-0"
            title={t('common:refresh', { defaultValue: isRTL ? 'تحديث' : 'Refresh' })}
          >
            <RefreshCw
              className={`w-3.5 h-3.5 text-amber-500 group-hover:text-amber-400 transition-transform duration-500 group-hover:rotate-180 ${
                isRefetching ? 'animate-spin' : ''
              }`}
            />
            <span className="hidden sm:inline">
              {t('common:refresh', { defaultValue: isRTL ? 'تحديث' : 'Refresh' })}
            </span>
          </button>
        </div>

        {/* Row 2: Status Tabs + Category Selector (Transparent Background, Seamless Flow) */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800/80">
          {/* Status Filter Group */}
          <div className="flex-1 min-w-0">
            <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
              {statusTabs.map((tab) => {
                const active = selectedStatus === tab.id;

                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => onStatusChange(tab.id)}
                    className={`py-2 px-1 sm:px-2.5 text-center rounded-xl font-bold transition-colors duration-200 whitespace-nowrap cursor-pointer select-none text-xs border outline-none ${
                      active
                        ? tab.activeClass
                        : 'bg-transparent border-slate-200/80 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100/70 dark:hover:bg-slate-800/70 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Category Dropdown (Transparent Background, Sleek Button) */}
          <div className="w-full md:w-52 shrink-0 relative" ref={categoryRef}>
            <button
              type="button"
              onClick={() => setIsCategoryOpen((prev) => !prev)}
              className={`w-full flex items-center justify-between gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-150 cursor-pointer border outline-none ${
                selectedCategory !== 'ALL'
                  ? 'bg-amber-500/10 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border-amber-500/35 shadow-2xs'
                  : 'bg-transparent border-slate-200/80 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100/60 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white shadow-2xs'
              }`}
            >
              <span className="truncate">{selectedCategoryLabel}</span>
              <ChevronDown
                className={`w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform duration-200 ${
                  isCategoryOpen ? 'rotate-180 text-amber-500' : ''
                }`}
              />
            </button>

            {/* Category Dropdown Popover */}
            {isCategoryOpen && (
              <div
                role="listbox"
                className="absolute z-50 end-0 mt-2 w-56 rounded-2xl p-1.5 select-none bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200/90 dark:border-slate-800 shadow-xl shadow-slate-900/10 dark:shadow-black/50 animate-in fade-in-0 zoom-in-95 duration-100 max-h-60 overflow-y-auto space-y-0.5"
              >
                <button
                  type="button"
                  role="option"
                  aria-selected={selectedCategory === 'ALL'}
                  onClick={() => {
                    onCategoryChange('ALL');
                    setIsCategoryOpen(false);
                  }}
                  className={`w-full flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-colors text-start cursor-pointer outline-none ${
                    selectedCategory === 'ALL'
                      ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <span className="truncate">
                    {t('auctions.filters.allCategories', { defaultValue: 'كافة التصنيفات' })}
                  </span>
                  {selectedCategory === 'ALL' && (
                    <Check className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  )}
                </button>

                {CATEGORIES.map((cat) => {
                  const isSelected = selectedCategory === cat;
                  return (
                    <button
                      key={cat}
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      onClick={() => {
                        onCategoryChange(cat);
                        setIsCategoryOpen(false);
                      }}
                      className={`w-full flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-colors text-start cursor-pointer outline-none ${
                        isSelected
                          ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      <span className="truncate">{getAuctionCategoryLabel(cat, isRTL)}</span>
                      {isSelected && (
                        <Check className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. High-Density Auctions Data Table (Matching AdminUsersTable Pattern) */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-950/40 text-slate-500 dark:text-slate-400 font-bold uppercase text-xs tracking-wider">
                <th className="py-3.5 px-4 text-center w-[28%] min-w-[220px]">
                  {t('auctions.table.auctionTitle', { defaultValue: isRTL ? 'المزاد' : 'Auction' })}
                </th>
                <th className="py-3.5 px-4 text-center w-[14%] min-w-[110px] whitespace-nowrap">
                  {t('auctions.table.category', { defaultValue: 'التصنيف' })}
                </th>
                <th className="py-3.5 px-4 text-center w-[16%] min-w-[130px] whitespace-nowrap">
                  {t('auctions.table.prices', { defaultValue: 'الأسعار' })}
                </th>
                <th className="py-3.5 px-4 text-center w-[14%] min-w-[110px] whitespace-nowrap">
                  {t('auctions.table.status', { defaultValue: 'الحالة' })}
                </th>
                <th className="py-3.5 px-4 text-center w-[14%] min-w-[120px] whitespace-nowrap">
                  {t('auctions.table.timeline', { defaultValue: 'تاريخ الانتهاء' })}
                </th>
                <th className="py-3.5 px-4 text-center w-[14%] min-w-[110px] whitespace-nowrap">
                  {t('auctions.table.actions', { defaultValue: 'الإجراءات' })}
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 font-normal">
              {isLoading && auctions.length === 0 ? (
                // Skeletons
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="py-4 ps-6 pe-4 text-start">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-800 shrink-0" />
                        <div className="space-y-1.5 text-start">
                          <div className="w-28 h-3.5 bg-slate-200 dark:bg-slate-800 rounded" />
                          <div className="w-20 h-2.5 bg-slate-200 dark:bg-slate-800 rounded" />
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <div className="w-16 h-5 bg-slate-200 dark:bg-slate-800 rounded-xl mx-auto" />
                    </td>
                    <td className="py-4 px-4 text-center space-y-1">
                      <div className="w-20 h-3.5 bg-slate-200 dark:bg-slate-800 rounded mx-auto" />
                      <div className="w-14 h-2.5 bg-slate-200 dark:bg-slate-800 rounded mx-auto" />
                    </td>
                    <td className="py-4 px-4 text-center">
                      <div className="w-16 h-5 bg-slate-200 dark:bg-slate-800 rounded-xl mx-auto" />
                    </td>
                    <td className="py-4 px-4 text-center">
                      <div className="w-24 h-3.5 bg-slate-200 dark:bg-slate-800 rounded mx-auto" />
                    </td>
                    <td className="py-4 px-4 text-center">
                      <div className="w-16 h-8 bg-slate-200 dark:bg-slate-800 rounded mx-auto" />
                    </td>
                  </tr>
                ))
              ) : auctions.length === 0 ? (
                // Empty State
                <tr>
                  <td colSpan={6} className="text-center py-16 text-slate-400 space-y-2">
                    <Layers className="w-8 h-8 text-slate-300 dark:text-slate-700 mx-auto" />
                    <p className="font-bold text-sm text-slate-700 dark:text-slate-300">
                      {t('auctions.table.empty', { defaultValue: 'لم يتم العثور على أي مزادات' })}
                    </p>
                  </td>
                </tr>
              ) : (
                auctions.map((auc) => {
                  const statusBadge = getAuctionStatusBadge(auc.status, isRTL);
                  const isCancellable = auc.status === 'ACTIVE' || auc.status === 'PENDING';
                  const thumbnail = auc.images && auc.images.length > 0 ? auc.images[0] : null;

                  return (
                    <tr
                      key={auc._id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors group"
                    >
                      {/* 1. Auction Identity (Start-aligned, image strictly anchored at fixed X) */}
                      <td className="py-3.5 ps-6 pe-4 text-start">
                        <div className="flex items-center gap-3">
                          {thumbnail ? (
                            <img
                              src={thumbnail}
                              alt={auc.title}
                              className="w-10 h-10 rounded-xl object-cover border border-slate-200 dark:border-slate-800 shrink-0 shadow-2xs"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 shrink-0">
                              <ImageIcon className="w-4 h-4" />
                            </div>
                          )}
                          <div className="min-w-0 max-w-[180px] sm:max-w-[240px] md:max-w-[300px] text-start">
                            <Link
                              to={ROUTES.AUCTION_DETAIL(auc._id)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white hover:text-amber-500 transition-colors block truncate"
                              title={auc.title}
                            >
                              {auc.title}
                            </Link>
                            <span className="text-[10px] text-slate-400 font-mono block truncate mt-0.5">
                              #{auc._id.slice(-8)}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* 2. Category (Centered) */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-center">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-xl text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60">
                          {getAuctionCategoryLabel(auc.category, isRTL)}
                        </span>
                      </td>

                      {/* 3. Prices (Centered, Clean Typography, No Dollar Sign) */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-center">
                        <div className="space-y-0.5 text-center">
                          <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white font-mono block">
                            {formatAdminCurrency(auc.currentPrice, undefined, isRTL)}
                          </span>
                          <span className="text-[11px] text-slate-400 dark:text-slate-500 font-mono block">
                            {isRTL ? 'البدء:' : 'Start:'} {formatAdminCurrency(auc.startingPrice, undefined, isRTL)}
                          </span>
                        </div>
                      </td>

                      {/* 4. Status Badge (Centered, Clean without awkward text wrapping) */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-center">
                        <span
                          title={
                            auc.adminActionReason
                              ? `${isRTL ? statusBadge.labelAr : statusBadge.labelEn} (${auc.adminActionReason})`
                              : undefined
                          }
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[10px] font-black border ${statusBadge.bgClass}`}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-current shrink-0" />
                          <span>{isRTL ? statusBadge.labelAr : statusBadge.labelEn}</span>
                        </span>
                      </td>

                      {/* 5. Timeline (Centered, Clean Date Only) */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-center text-slate-600 dark:text-slate-300 font-mono text-xs">
                        <div className="inline-flex items-center justify-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{formatAdminDate(auc.endTime, i18n.language, isRTL)}</span>
                        </div>
                      </td>

                      {/* 6. Action Buttons (Centered, Sleek Uniform Icons) */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* Public View Link */}
                          <Link
                            to={ROUTES.AUCTION_DETAIL(auc._id)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-500/10 border border-transparent hover:border-blue-500/20 transition-all cursor-pointer shadow-2xs"
                            title={t('auctions.actions.view', { defaultValue: 'عرض صفحة المزاد' })}
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Link>

                          {/* Reviews Moderation */}
                          <button
                            type="button"
                            onClick={() => onModerateReviews(auc)}
                            className="p-2 rounded-xl text-amber-600 dark:text-amber-400 hover:bg-amber-500/10 border border-transparent hover:border-amber-500/20 transition-all cursor-pointer shadow-2xs"
                            title={t('auctions.actions.reviews', { defaultValue: 'مراجعات وتقييمات المزاد' })}
                          >
                            <MessageSquare className="w-4 h-4" />
                          </button>

                          {/* Cancel Auction */}
                          <button
                            type="button"
                            onClick={() => onCancelAuction(auc)}
                            disabled={!isCancellable}
                            className={`p-2 rounded-xl border border-transparent transition-all ${
                              isCancellable
                                ? 'text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/20 cursor-pointer shadow-2xs'
                                : 'text-rose-400/70 dark:text-rose-500/40 bg-transparent cursor-default pointer-events-none select-none shadow-none'
                            }`}
                            title={
                              isCancellable
                                ? t('auctions.actions.cancel', { defaultValue: 'إلغاء المزاد الإداري' })
                                : t('auctions.actions.cannotCancel', { defaultValue: 'المزاد غير نشط للإلغاء' })
                            }
                          >
                            <Ban className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* 3. Shared Standard Pagination */}
        {totalPages > 1 && (
          <div className="border-t border-slate-100 dark:border-slate-800 px-4 py-2">
            <Pagination
              page={currentPage}
              totalPages={totalPages}
              total={total}
              limit={10}
              onPageChange={onPageChange}
              isLoading={isLoading}
              showSummary={true}
            />
          </div>
        )}
      </div>
    </div>
  );
};
