import React, { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Bell,
  CheckCheck,
  Loader2,
  Inbox,
  Gavel,
  Wallet,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { useNotifications } from '../hooks/useNotifications';
import { useUnreadNotificationsCount } from '../hooks/useUnreadNotificationsCount';
import { useNotificationActions } from '../hooks/useNotificationActions';
import { NotificationItem } from '../components/NotificationItem';
import { NotificationFilters, type ActiveFilterCategory } from '../components/NotificationFilters';
import { NotificationSkeleton } from '../components/NotificationSkeleton';
import { Pagination } from '@/components/common/Pagination';
import { toLocalizedDigits } from '@/utils/formatters';
import { cn } from '@/utils/cn';
import type { NotificationCategory, NotificationsFilterInput } from '../types/notifications.types';

export const NotificationsPage: React.FC = () => {
  const { t, i18n } = useTranslation('notifications');
  const isRTL = i18n.language?.startsWith('ar');

  const [searchParams, setSearchParams] = useSearchParams();

  // 1. Sync Filters & Pagination with URL Search Parameters
  const activeCategory = (searchParams.get('category') || 'ALL') as ActiveFilterCategory;
  const unreadOnly = searchParams.get('unread') === 'true';
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
  const limit = 10;

  const updateFilters = (newParams: {
    category?: ActiveFilterCategory;
    unread?: boolean;
    page?: number;
  }) => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);

        if (newParams.category !== undefined) {
          if (newParams.category === 'ALL') {
            next.delete('category');
          } else {
            next.set('category', newParams.category);
          }
        }

        if (newParams.unread !== undefined) {
          if (!newParams.unread) {
            next.delete('unread');
          } else {
            next.set('unread', 'true');
          }
        }

        if (newParams.page !== undefined) {
          if (newParams.page === 1) {
            next.delete('page');
          } else {
            next.set('page', String(newParams.page));
          }
        }

        return next;
      },
      { replace: true }
    );
  };

  const handleSelectCategory = (category: ActiveFilterCategory) => {
    updateFilters({ category, page: 1 });
  };

  const handleToggleUnreadOnly = () => {
    updateFilters({ unread: !unreadOnly, page: 1 });
  };

  const handlePageChange = (newPage: number) => {
    updateFilters({ page: newPage });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 2. Build GraphQL Server Filter
  const serverFilter = useMemo<NotificationsFilterInput>(() => {
    const filter: NotificationsFilterInput = {};
    if (activeCategory !== 'ALL') {
      filter.category = activeCategory as NotificationCategory;
    }
    if (unreadOnly) {
      filter.isRead = false;
    }
    return filter;
  }, [activeCategory, unreadOnly]);

  // 3. Query Notifications & Unread Counters
  const { notifications, total, totalPages, isLoading, isFetching } = useNotifications({
    page,
    limit,
    filter: serverFilter,
  });

  const { unreadCount: totalUnread } = useUnreadNotificationsCount();
  const { markAsRead, markAllAsRead, isMarkingAllRead } = useNotificationActions();

  // Dynamic context-aware Empty State icon & translations
  const emptyKey = unreadOnly ? 'unread' : activeCategory === 'ALL' ? 'all' : activeCategory;

  const EmptyIcon = useMemo(() => {
    if (unreadOnly) return CheckCheck;
    switch (activeCategory) {
      case 'AUCTIONS':
        return Gavel;
      case 'FINANCIAL':
        return Wallet;
      case 'ESCROW':
        return ShieldCheck;
      case 'SYSTEM':
        return Sparkles;
      default:
        return Inbox;
    }
  }, [activeCategory, unreadOnly]);

  return (
    <div className="min-h-screen py-8 sm:py-12 bg-gradient-to-b from-slate-50 via-white to-amber-500/[0.03] dark:from-slate-950 dark:via-slate-900 dark:to-amber-500/[0.04]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-6">
        {/* Page Header - Rich, Balanced, Luxury Styling */}
        <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200/90 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-md shadow-slate-900/[0.02] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Title & Glowing Counter Badge */}
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-500/5 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/30 shadow-sm shadow-amber-500/10">
              <Bell className="w-5 h-5" />
            </div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl font-black text-slate-950 dark:text-white tracking-tight">
                {t('page.title', 'الإشعارات')}
              </h1>
              {totalUnread > 0 && (
                <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-black bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-sm shadow-amber-500/30 animate-in zoom-in-75 duration-200">
                  {toLocalizedDigits(totalUnread, isRTL)}
                </span>
              )}
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center gap-2.5 self-start sm:self-auto flex-wrap">
            {/* Unread Toggle Button with animated indicator */}
            <button
              type="button"
              onClick={handleToggleUnreadOnly}
              className={cn(
                'inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer select-none active:scale-95',
                unreadOnly
                  ? 'bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-md shadow-amber-500/30 border border-amber-400'
                  : 'bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-800 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700/80'
              )}
            >
              <span
                className={cn(
                  'w-2 h-2 rounded-full transition-transform duration-200',
                  unreadOnly ? 'bg-slate-950 scale-125' : 'bg-slate-400 dark:bg-slate-500'
                )}
              />
              <span>{t('page.unreadOnly', 'غير مقروء')}</span>
            </button>

            {/* Mark All Read Button */}
            {totalUnread > 0 && (
              <button
                type="button"
                onClick={() => markAllAsRead()}
                disabled={isMarkingAllRead}
                className={cn(
                  'inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 shrink-0 cursor-pointer select-none active:scale-95',
                  'bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent hover:bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 hover:border-amber-500/50 shadow-xs',
                  isMarkingAllRead && 'opacity-60 cursor-not-allowed'
                )}
              >
                {isMarkingAllRead ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-500" />
                ) : (
                  <CheckCheck className="w-3.5 h-3.5 text-amber-500" />
                )}
                <span>{t('page.markAllRead', 'تحديد الكل كمقروء')}</span>
              </button>
            )}
          </div>
        </div>

        {/* Main Notifications Card Container */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-5 sm:p-7 shadow-xl shadow-slate-900/[0.03] dark:shadow-black/40 space-y-5">
          {/* Segmented Category Tabs */}
          <NotificationFilters
            activeCategory={activeCategory}
            onSelectCategory={handleSelectCategory}
          />

          {/* List Content with seamless key transition */}
          <div key={`${activeCategory}-${unreadOnly}`} className="relative min-h-[300px]">
            {isLoading ? (
              <NotificationSkeleton count={5} />
            ) : notifications.length === 0 ? (
              <div className="py-14 sm:py-20 flex flex-col items-center justify-center text-center animate-in fade-in-50 duration-200">
                <div className="w-16 h-16 rounded-3xl bg-slate-100 dark:bg-slate-850 flex items-center justify-center mb-4 text-slate-400 dark:text-slate-500 border border-slate-200/70 dark:border-slate-750 shadow-xs">
                  <EmptyIcon className="w-8 h-8 text-amber-500/80" />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mb-1.5">
                  {t(`page.empty.${emptyKey}.title`)}
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-sm leading-relaxed">
                  {t(`page.empty.${emptyKey}.description`)}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100/90 dark:divide-slate-800/70 -mx-5 sm:-mx-7 animate-in fade-in-50 duration-150">
                {notifications.map((notification) => (
                  <NotificationItem
                    key={notification._id}
                    notification={notification}
                    onMarkAsRead={markAsRead}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Pagination Footer */}
          {totalPages > 1 && (
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80">
              <Pagination
                page={page}
                totalPages={totalPages}
                total={total}
                limit={limit}
                onPageChange={handlePageChange}
                isLoading={isFetching}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;
