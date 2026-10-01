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
        badgeClass: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
      };
    case 'OUTBID':
    case 'AUTO_BID_EXHAUSTED':
      return {
        icon: TrendingDown,
        badgeClass: 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/20',
      };
    case 'NEW_BID':
    case 'AUTO_BID_PLACED':
      return {
        icon: TrendingUp,
        badgeClass: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/20',
      };
    case 'AUCTION_ENDED_SELLER':
    case 'AUCTION_STARTED':
      return {
        icon: PlayCircle,
        badgeClass: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/20',
      };
    case 'AUCTION_CANCELLED':
    case 'AUCTION_CANCELLED_BY_ADMIN':
      return {
        icon: Ban,
        badgeClass: 'bg-slate-500/15 text-slate-600 dark:text-slate-400 border-slate-500/20',
      };
    case 'DEPOSIT_SUCCESSFUL':
    case 'WITHDRAWAL_COMPLETED':
      return {
        icon: ArrowDownLeft,
        badgeClass: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
      };
    case 'WITHDRAWAL_REQUESTED':
      return {
        icon: ArrowUpRight,
        badgeClass: 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/20',
      };
    case 'WITHDRAWAL_REJECTED':
      return {
        icon: XCircle,
        badgeClass: 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/20',
      };
    case 'ESCROW_CREATED':
    case 'ESCROW_RELEASED':
      return {
        icon: ShieldCheck,
        badgeClass: 'bg-teal-500/15 text-teal-600 dark:text-teal-400 border-teal-500/20',
      };
    case 'ESCROW_REFUNDED':
      return {
        icon: RotateCcw,
        badgeClass: 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/20',
      };
    case 'DISPUTE_OPENED':
    case 'DISPUTE_RESOLVED':
    case 'DISPUTE_CANCELLED':
      return {
        icon: Scale,
        badgeClass: 'bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/20',
      };
    case 'NEW_CHAT_MESSAGE':
      return {
        icon: MessageSquare,
        badgeClass: 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
      };
    case 'REVIEW_RECEIVED':
    case 'REVIEW_REPLIED':
      return {
        icon: Star,
        badgeClass: 'bg-amber-400/15 text-amber-500 dark:text-amber-400 border-amber-400/20',
      };
    case 'WELCOME':
      return {
        icon: Sparkles,
        badgeClass: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/20',
      };
    default:
      return {
        icon: Bell,
        badgeClass: 'bg-slate-500/15 text-slate-600 dark:text-slate-400 border-slate-500/20',
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
        'group relative flex items-start gap-3 p-3.5 transition-all duration-150 cursor-pointer text-start select-none',
        'border-b border-slate-100 dark:border-slate-800/80 last:border-b-0',
        notification.isRead
          ? 'bg-transparent hover:bg-slate-50/80 dark:hover:bg-slate-900/50'
          : 'bg-amber-500/[0.04] dark:bg-amber-500/[0.07] hover:bg-amber-500/[0.08] dark:hover:bg-amber-500/[0.12]'
      )}
    >
      {/* Category / Event Icon Badge */}
      <div
        className={cn(
          'w-9 h-9 rounded-xl flex items-center justify-center border shrink-0 transition-transform duration-200 group-hover:scale-105',
          badgeClass
        )}
      >
        <Icon className="w-4 h-4" />
      </div>

      {/* Content Details */}
      <div className="flex-1 min-w-0 pr-1">
        <div className="flex items-center justify-between gap-2 mb-1">
          <h4
            className={cn(
              'text-xs truncate transition-colors',
              notification.isRead
                ? 'font-medium text-slate-800 dark:text-slate-200 group-hover:text-slate-950 dark:group-hover:text-white'
                : 'font-bold text-slate-900 dark:text-slate-100 group-hover:text-amber-600 dark:group-hover:text-amber-400'
            )}
            title={title}
            dir="auto"
          >
            <bdi>{title}</bdi>
          </h4>

          {/* Unread indicator dot */}
          {!notification.isRead && (
            <span
              className="w-2 h-2 rounded-full bg-amber-500 shrink-0 shadow-xs shadow-amber-500/50 animate-pulse"
              aria-label="Unread"
            />
          )}
        </div>

        <p
          className={cn(
            'text-[11px] leading-relaxed text-slate-600 dark:text-slate-400 mb-1.5',
            compact ? 'line-clamp-2' : 'line-clamp-3'
          )}
          dir="auto"
        >
          <bdi>{body}</bdi>
        </p>

        <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500">
          {formatRelativeTime(notification.createdAt, isRTL)}
        </span>
      </div>
    </div>
  );
};
