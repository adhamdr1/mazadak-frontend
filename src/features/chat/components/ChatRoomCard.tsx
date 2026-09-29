/**
 * ChatRoomCard Component
 * Displays a single chat room in the /messages inbox
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Image as ImageIcon,
  CircleSlash,
  ChevronLeft,
  ChevronRight,
  Award,
  Store,
} from 'lucide-react';
import type { ChatRoomData } from '../types/chat.types';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/constants/routes.constants';
import { formatRelativeTime, toLocalizedDigits } from '@/utils/formatters';
import { cn } from '@/utils/cn';

interface ChatRoomCardProps {
  room: ChatRoomData;
}

export const ChatRoomCard: React.FC<ChatRoomCardProps> = ({ room }) => {
  const { t, i18n } = useTranslation(['chat', 'common', 'auctions']);
  const isRTL = i18n.language?.startsWith('ar');
  const navigate = useNavigate();
  const { user } = useAuth();

  const { auction, lastMessage, lastMessageAt, unreadCount } = room;
  const isCurrentUserSender = lastMessage?.senderId === user?._id;
  const isSeller = auction.sellerId === user?._id;
  const isWinner = auction.winnerId === user?._id;
  const isAuctionActive = auction.status === 'ACTIVE';

  const ChevronIcon = isRTL ? ChevronLeft : ChevronRight;

  const handleClick = () => {
    navigate(`${ROUTES.AUCTION_DETAIL(room.auctionId)}?chat=true`);
  };

  // Format last message preview
  const renderLastMessagePreview = () => {
    if (!lastMessage) {
      return (
        <span className="text-slate-400 dark:text-slate-500 text-xs font-normal not-italic">
          {t('chat:messages.noMessages', 'لا توجد رسائل بعد')}
        </span>
      );
    }

    if (lastMessage.isDeleted) {
      return (
        <span className="inline-flex items-center gap-1.5 text-slate-400 dark:text-slate-500 text-xs font-normal not-italic">
          <CircleSlash className="w-3.5 h-3.5 flex-shrink-0" />
          <span>{t('chat:message.deleted', 'تم حذف هذه الرسالة')}</span>
        </span>
      );
    }

    if (lastMessage.type === 'IMAGE') {
      return (
        <span className="inline-flex items-center gap-1.5 text-slate-600 dark:text-slate-300 text-xs font-medium">
          <ImageIcon className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
          {isCurrentUserSender ? (
            <span className="text-slate-400 dark:text-slate-500">{t('common:you', 'أنت')}: </span>
          ) : (
            <span className="text-slate-400 dark:text-slate-500">{lastMessage.senderName}: </span>
          )}
          <span>{t('chat:message.imageAlt', 'صورة مرفقة')}</span>
        </span>
      );
    }

    return (
      <span className="text-xs text-slate-600 dark:text-slate-300 line-clamp-1">
        {isCurrentUserSender ? (
          <span className="font-semibold text-slate-500 dark:text-slate-400">
            {t('common:you', 'أنت')}:{' '}
          </span>
        ) : (
          <span className="font-semibold text-slate-700 dark:text-slate-300">
            {lastMessage.senderName}:{' '}
          </span>
        )}
        <span>{lastMessage.content}</span>
      </span>
    );
  };

  const thumbnailUrl = auction.images?.[0];

  return (
    <div
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
      className={cn(
        'group relative flex items-center gap-3 sm:gap-4 p-3.5 sm:p-4 rounded-2xl cursor-pointer select-none',
        'bg-white dark:bg-slate-900 border transition-all duration-200',
        unreadCount > 0
          ? 'border-amber-400/80 dark:border-amber-500/60 shadow-sm bg-amber-50/20 dark:bg-amber-950/10'
          : 'border-slate-200/80 dark:border-slate-800 hover:border-amber-400/60 dark:hover:border-amber-500/40 hover:shadow-md hover:bg-slate-50/50 dark:hover:bg-slate-800/40'
      )}
    >
      {/* 1. Auction Image Thumbnail */}
      <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 flex-shrink-0 border border-slate-200/60 dark:border-slate-700">
        {thumbnailUrl ? (
          <img
            src={thumbnailUrl}
            alt={auction.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-400">
            <ImageIcon className="w-6 h-6" />
          </div>
        )}

        {/* Live indicator dot if active */}
        {isAuctionActive && (
          <span className="absolute top-1.5 end-1.5 flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
          </span>
        )}
      </div>

      {/* 2. Room Information */}
      <div className="flex-1 min-w-0 space-y-1 sm:space-y-1.5">
        {/* Top Header: Title & Badges + Time */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <h2 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
              {auction.title}
            </h2>

            {/* Role Badges */}
            {isSeller && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 flex-shrink-0">
                <Store className="w-3 h-3" />
                <span>{t('common:roles.seller', 'البائع')}</span>
              </span>
            )}
            {isWinner && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 flex-shrink-0">
                <Award className="w-3 h-3" />
                <span>{t('common:roles.winner', 'الفائز')}</span>
              </span>
            )}
          </div>

          {/* Timestamp */}
          <div className="text-[11px] sm:text-xs font-medium text-slate-400 dark:text-slate-500 flex-shrink-0">
            {lastMessageAt || lastMessage?.createdAt
              ? formatRelativeTime(lastMessageAt || lastMessage!.createdAt, isRTL)
              : null}
          </div>
        </div>

        {/* Bottom Line: Last Message Snippet + Unread Counter */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex-1 min-w-0">{renderLastMessagePreview()}</div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Unread Count Badge */}
            {unreadCount > 0 && (
              <span
                aria-label={t('chat:messages.unreadPlural', {
                  count: unreadCount,
                  defaultValue: `${unreadCount} new messages`,
                })}
                className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-[11px] font-black bg-amber-500 text-slate-950 shadow-sm shadow-amber-500/30 animate-pulse"
              >
                {toLocalizedDigits(unreadCount, isRTL)}
              </span>
            )}

            {/* Chevron Navigation Icon */}
            <ChevronIcon className="w-4 h-4 text-slate-400 group-hover:text-amber-500 transition-transform group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5" />
          </div>
        </div>
      </div>
    </div>
  );
};
