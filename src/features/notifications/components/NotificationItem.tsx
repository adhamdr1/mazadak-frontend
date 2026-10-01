import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Trophy,
  TrendingUp,
  TrendingDown,
  PlayCircle,
  Ban,
  ArrowDownLeft,
  ArrowUpRight,
  XCircle,
  ShieldCheck,
  RotateCcw,
  Scale,
  MessageSquare,
  Star,
  Sparkles,
  Bell,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { formatRelativeTime } from '@/utils/formatters';
import { ROUTES } from '@/constants/routes.constants';
import { cn } from '@/utils/cn';
import { getLocalizedNotification } from '../utils/notificationLocalization.utils';
import type { InAppNotification, InAppNotificationType } from '../types/notifications.types';

export interface NotificationItemProps {
  notification: InAppNotification;
  onMarkAsRead?: (notification: InAppNotification) => void;
  onClose?: () => void;
  compact?: boolean;
}

interface NotificationStyle {
  icon: React.ElementType;
  badgeClass: string;
}

function getNotificationStyle(type: InAppNotificationType): NotificationStyle {
  switch (type) {
    case 'AUCTION_WON':
      return {
        icon: Trophy,
        badgeClass: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 shadow-xs shadow-emerald-500/10',
      };
    case 'OUTBID':
    case 'AUTO_BID_EXHAUSTED':
      return {
        icon: TrendingDown,
        badgeClass: 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30 shadow-xs shadow-rose-500/10',
      };
    case 'NEW_BID':
    case 'AUTO_BID_PLACED':
      return {
        icon: TrendingUp,
        badgeClass: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30 shadow-xs shadow-amber-500/10',
      };
    case 'AUCTION_ENDED_SELLER':
    case 'AUCTION_STARTED':
      return {
        icon: PlayCircle,
        badgeClass: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30 shadow-xs shadow-amber-500/10',
      };
    case 'AUCTION_CANCELLED':
    case 'AUCTION_CANCELLED_BY_ADMIN':
      return {
        icon: Ban,
        badgeClass: 'bg-slate-500/15 text-slate-600 dark:text-slate-400 border-slate-500/30',
      };
    case 'DEPOSIT_SUCCESSFUL':
    case 'WITHDRAWAL_COMPLETED':
      return {
        icon: ArrowDownLeft,
        badgeClass: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 shadow-xs shadow-emerald-500/10',
      };
    case 'WITHDRAWAL_REQUESTED':
      return {
        icon: ArrowUpRight,
        badgeClass: 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30 shadow-xs shadow-blue-500/10',
      };
    case 'WITHDRAWAL_REJECTED':
      return {
        icon: XCircle,
        badgeClass: 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30 shadow-xs shadow-rose-500/10',
      };
    case 'ESCROW_CREATED':
    case 'ESCROW_RELEASED':
      return {
        icon: ShieldCheck,
        badgeClass: 'bg-teal-500/15 text-teal-600 dark:text-teal-400 border-teal-500/30 shadow-xs shadow-teal-500/10',
      };
    case 'ESCROW_REFUNDED':
      return {
        icon: RotateCcw,
        badgeClass: 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30 shadow-xs shadow-blue-500/10',
      };
    case 'DISPUTE_OPENED':
    case 'DISPUTE_RESOLVED':
    case 'DISPUTE_CANCELLED':
      return {
        icon: Scale,
        badgeClass: 'bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30 shadow-xs shadow-purple-500/10',
      };
    case 'NEW_CHAT_MESSAGE':
      return {
        icon: MessageSquare,
        badgeClass: 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border-indigo-500/30 shadow-xs shadow-indigo-500/10',
      };
    case 'REVIEW_RECEIVED':
    case 'REVIEW_REPLIED':
      return {
        icon: Star,
        badgeClass: 'bg-amber-400/15 text-amber-600 dark:text-amber-400 border-amber-400/30 shadow-xs shadow-amber-400/10',
      };
    case 'WELCOME':
      return {
        icon: Sparkles,
        badgeClass: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30 shadow-xs shadow-amber-500/10',
      };
    default:
      return {
        icon: Bell,
        badgeClass: 'bg-slate-500/15 text-slate-600 dark:text-slate-400 border-slate-500/30',
      };
  }
}

function resolveTargetRoute(notification: InAppNotification): string {
  const { type, referenceId } = notification;

  switch (type) {
    case 'AUCTION_WON':
      return ROUTES.MY_WON_AUCTIONS;

    case 'AUCTION_ENDED_SELLER':
      return ROUTES.MY_AUCTIONS;

    case 'OUTBID':
    case 'NEW_BID':
    case 'AUCTION_STARTED':
    case 'AUCTION_CANCELLED':
    case 'AUCTION_CANCELLED_BY_ADMIN':
    case 'AUTO_BID_PLACED':
    case 'AUTO_BID_EXHAUSTED':
      return referenceId ? ROUTES.AUCTION_DETAIL(referenceId) : ROUTES.AUCTIONS;

    case 'DEPOSIT_SUCCESSFUL':
    case 'WITHDRAWAL_COMPLETED':
      return ROUTES.WALLET_TRANSACTIONS;

    case 'WITHDRAWAL_REQUESTED':
    case 'WITHDRAWAL_REJECTED':
      return ROUTES.WALLET_WITHDRAWALS;

    case 'NEW_CHAT_MESSAGE':
      return ROUTES.MESSAGES;

    case 'ESCROW_CREATED':
    case 'ESCROW_RELEASED':
    case 'ESCROW_REFUNDED':
      return referenceId ? ROUTES.ESCROW_DETAIL(referenceId) : ROUTES.MY_ESCROWS;

    case 'DISPUTE_OPENED':
    case 'DISPUTE_RESOLVED':
    case 'DISPUTE_CANCELLED':
      return referenceId ? ROUTES.DISPUTE_DETAIL(referenceId) : ROUTES.MY_ESCROWS;

    case 'REVIEW_RECEIVED':
    case 'REVIEW_REPLIED':
      return ROUTES.PROFILE;

    case 'WELCOME':
      return ROUTES.HOME;

    default:
      return ROUTES.HOME;
  }
}

export const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onMarkAsRead,
  onClose,
  compact = false,
}) => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation('notifications');
  const isRTL = i18n.language?.startsWith('ar');

  const { icon: Icon, badgeClass } = getNotificationStyle(notification.type);
  const targetRoute = resolveTargetRoute(notification);
  const { title, body } = getLocalizedNotification(notification, !!isRTL, t);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!notification.isRead && onMarkAsRead) {
      onMarkAsRead(notification);
    }
    onClose?.();
    navigate(targetRoute);
  };

  const ArrowIcon = isRTL ? ChevronLeft : ChevronRight;

  return (
    <div
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          handleClick(e as unknown as React.MouseEvent);
        }
      }}
      className={cn(
        'group relative flex items-start transition-all duration-200 cursor-pointer select-none overflow-hidden',
        isRTL ? 'text-right' : 'text-left',
        'border-b border-slate-100/90 dark:border-slate-800/80 last:border-b-0',
        compact ? 'gap-3 p-3 sm:p-3.5' : 'gap-4 p-4 sm:p-5',
        notification.isRead
          ? 'bg-transparent hover:bg-slate-50/90 dark:hover:bg-slate-800/40'
          : [
              isRTL
                ? 'bg-gradient-to-r from-amber-500/[0.09] via-amber-500/[0.03] to-transparent dark:from-amber-500/[0.14] dark:via-amber-500/[0.04] dark:to-transparent hover:from-amber-500/[0.14] hover:via-amber-500/[0.06]'
                : 'bg-gradient-to-l from-amber-500/[0.09] via-amber-500/[0.03] to-transparent dark:from-amber-500/[0.14] dark:via-amber-500/[0.04] dark:to-transparent hover:from-amber-500/[0.14] hover:via-amber-500/[0.06]',
              'before:absolute before:inset-y-0 before:start-0 before:w-1.5 before:bg-amber-500 before:shadow-xs before:shadow-amber-500/60',
            ]
      )}
    >
      {/* Category / Event Icon Badge */}
      <div
        className={cn(
          'flex items-center justify-center border shrink-0 transition-transform duration-200 group-hover:scale-105',
          compact ? 'w-8 h-8 rounded-xl mt-0.5' : 'w-11 h-11 rounded-2xl mt-0.5',
          badgeClass
        )}
      >
        <Icon className={compact ? 'w-4 h-4' : 'w-5 h-5'} />
      </div>

      {/* Content Details */}
      <div className="flex-1 min-w-0 space-y-1 sm:space-y-1.5">
        <div className="flex items-center justify-between gap-3">
          <h4
            className={cn(
              'truncate transition-colors flex-1',
              compact ? 'text-xs' : 'text-sm sm:text-base font-bold',
              isRTL ? 'text-right' : 'text-left',
              notification.isRead
                ? 'font-medium text-slate-800 dark:text-slate-200 group-hover:text-slate-950 dark:group-hover:text-white'
                : 'font-bold text-slate-950 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400'
            )}
            title={title}
          >
            {title}
          </h4>

          {/* Unread indicator dot */}
          {!notification.isRead && (
            <span
              className={cn(
                'rounded-full bg-amber-500 shrink-0 shadow-xs shadow-amber-500/50 animate-pulse',
                compact ? 'w-2 h-2' : 'w-2.5 h-2.5 ring-4 ring-amber-500/20'
              )}
              aria-label="Unread"
            />
          )}
        </div>

        <p
          className={cn(
            'leading-relaxed',
            compact
              ? 'text-[11px] text-slate-600 dark:text-slate-400 line-clamp-2'
              : 'text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-normal line-clamp-3',
            isRTL ? 'text-right' : 'text-left'
          )}
        >
          {body}
        </p>

        <div className="flex items-center justify-between pt-1 text-[11px] text-slate-400 dark:text-slate-500 font-medium">
          <span>{formatRelativeTime(notification.createdAt, isRTL)}</span>

          {!compact && (
            <div className="flex items-center gap-1 text-slate-400 dark:text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
              <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400">
                {isRTL ? 'عرض' : 'View'}
              </span>
              <ArrowIcon className="w-3.5 h-3.5 text-amber-500" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
