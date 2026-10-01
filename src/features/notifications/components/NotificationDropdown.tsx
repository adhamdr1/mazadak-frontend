import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Bell, CheckCheck, ArrowRight, ArrowLeft, Loader2, Inbox } from 'lucide-react';
import { useNotifications } from '../hooks/useNotifications';
import { useUnreadNotificationsCount } from '../hooks/useUnreadNotificationsCount';
import { useNotificationActions } from '../hooks/useNotificationActions';
import { NotificationItem } from './NotificationItem';
import { toLocalizedDigits } from '@/utils/formatters';
import { ROUTES } from '@/constants/routes.constants';
import { cn } from '@/utils/cn';

export interface NotificationDropdownProps {
  className?: string;
}

export const NotificationDropdown: React.FC<NotificationDropdownProps> = ({ className }) => {
  const { t, i18n } = useTranslation('notifications');
  const isRTL = i18n.language?.startsWith('ar');

  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { unreadCount } = useUnreadNotificationsCount();
  const { notifications, isLoading } = useNotifications({
    limit: 5,
    enabled: isOpen, // Fetch recent 5 items when dropdown is opened
  });

  const { markAsRead, markAllAsRead, isMarkingAllRead } = useNotificationActions();

  // Close on Click Outside & on Escape Key
  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (e: MouseEvent | TouchEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('touchstart', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('touchstart', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight;

  return (
    <div ref={dropdownRef} className={cn('relative inline-flex items-center', className)}>
      {/* Bell Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label={t('dropdown.bellLabel', 'الإشعارات')}
        aria-expanded={isOpen}
        className={cn(
          'relative p-2 rounded-xl transition-all duration-150 cursor-pointer select-none',
          isOpen
            ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30'
            : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60 border border-transparent'
        )}
      >
        <Bell className="w-4 h-4" />

        {/* Pulsing Unread Counter Badge */}
        {unreadCount > 0 && (
          <span
            className={cn(
              'absolute -top-1 -end-1 inline-flex items-center justify-center font-black text-[9px] leading-none',
              'px-1 min-w-[17px] h-[17px] rounded-full',
              'bg-rose-500 text-white shadow-xs shadow-rose-500/50',
              'animate-in zoom-in-75 duration-200'
            )}
          >
            {toLocalizedDigits(unreadCount > 99 ? '99+' : unreadCount, isRTL)}
          </span>
        )}
      </button>

      {/* Popover Dropdown Panel */}
      {isOpen && (
        <div
          className={cn(
            'fixed inset-x-3 top-16 sm:absolute sm:inset-auto sm:end-0 sm:top-full sm:mt-2',
            'w-auto sm:w-[380px] max-h-[85vh] sm:max-h-[520px] flex flex-col',
            'rounded-2xl bg-white dark:bg-slate-900',
            'border border-slate-200/90 dark:border-slate-800/90',
            'shadow-2xl shadow-slate-900/15 dark:shadow-black/60',
            'z-50 overflow-hidden animate-in fade-in-0 zoom-in-95 duration-150'
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/50 shrink-0">
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                {t('dropdown.title', 'الإشعارات')}
              </h3>
              {unreadCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400">
                  {toLocalizedDigits(unreadCount, isRTL)}
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={() => markAllAsRead()}
                disabled={isMarkingAllRead}
                className={cn(
                  'flex items-center gap-1 text-[11px] font-semibold text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 transition-colors',
                  isMarkingAllRead && 'opacity-60 cursor-not-allowed'
                )}
              >
                {isMarkingAllRead ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <CheckCheck className="w-3 h-3" />
                )}
                <span>{t('dropdown.markAllRead', 'تحديد الكل كمقروء')}</span>
              </button>
            )}
          </div>

          {/* List Content */}
          <div className="overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60 max-h-[360px]">
            {isLoading ? (
              <div className="flex items-center justify-center p-8 text-slate-400 dark:text-slate-500 gap-2 text-xs">
                <Loader2 className="w-4 h-4 animate-spin text-amber-500" />
                <span>{t('dropdown.loading', 'جاري تحميل الإشعارات...')}</span>
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800/60 text-slate-400 dark:text-slate-500 flex items-center justify-center mb-3">
                  <Inbox className="w-6 h-6" />
                </div>
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {t('dropdown.emptyTitle', 'لا توجد إشعارات')}
                </p>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 max-w-[200px]">
                  {t('dropdown.emptySubtitle', 'ستظهر هنا كافة الإشعارات والتحديثات فور وصولها')}
                </p>
              </div>
            ) : (
              notifications.map((notification) => (
                <NotificationItem
                  key={notification._id}
                  notification={notification}
                  onMarkAsRead={markAsRead}
                  onClose={() => setIsOpen(false)}
                  compact
                />
              ))
            )}
          </div>

          {/* Footer View All Link */}
          <div className="p-2 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/70 dark:bg-slate-900/70 shrink-0">
            <Link
              to={ROUTES.NOTIFICATIONS}
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-center gap-1.5 w-full py-2 px-3 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-white dark:hover:bg-slate-800/80 transition-all border border-transparent hover:border-slate-200/60 dark:hover:border-slate-700/60"
            >
              <span>{t('dropdown.viewAll', 'عرض جميع الإشعارات')}</span>
              <ArrowIcon className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};
