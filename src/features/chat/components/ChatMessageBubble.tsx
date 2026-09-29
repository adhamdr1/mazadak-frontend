/**
 * ChatMessageBubble Component
 * WhatsApp-style message bubble with:
 * - Proper RTL / LTR alignment for owner vs participant
 * - `dir="auto"` and `break-all` for mixed Arabic/English and unbreakable test strings
 * - Hover actions & reaction capsule anchored to the bottom/footer of the bubble (no scrolling up for tall messages)
 * - Inward-pointing reaction capsule geometry that can NEVER overflow the drawer
 * - Deleted message presentation aligned with sender side
 * - Zero clipping or off-screen overflow
 */

import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  CheckCheck,
  Clock,
  AlertCircle,
  MoreVertical,
  Edit2,
  Trash2,
  Smile,
  CircleSlash,
  Maximize2,
  X,
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { formatTime } from '@/utils/formatters';
import { EmojiPanel } from './EmojiPanel';
import { MessageReactions } from './MessageReactions';
import type { ChatMessageData, PendingMessage } from '../types/chat.types';

export interface ChatMessageBubbleProps {
  message: ChatMessageData | PendingMessage;
  isOwner: boolean;
  isRead?: boolean;
  onEdit?: (messageId: string, currentContent: string) => void;
  onDelete?: (messageId: string) => void;
  onReact?: (messageId: string, emoji: string | null) => void;
  onRetry?: (pendingMsg: PendingMessage) => void;
  onRemovePending?: (localId: string) => void;
  className?: string;
}

export const ChatMessageBubble: React.FC<ChatMessageBubbleProps> = ({
  message,
  isOwner,
  isRead = false,
  onEdit,
  onDelete,
  onReact,
  onRetry,
  onRemovePending,
  className,
}) => {
  const { t, i18n } = useTranslation('chat');
  const isRTL = i18n.language?.startsWith('ar');

  const [isEmojiPanelOpen, setIsEmojiPanelOpen] = useState(false);
  const [isActionsMenuOpen, setIsActionsMenuOpen] = useState(false);
  const [isPreviewImageOpen, setIsPreviewImageOpen] = useState(false);
  const actionsMenuRef = useRef<HTMLDivElement>(null);

  // Determine if message is pending / error
  const isPending = '_status' in message && message._status === 'sending';
  const isError = '_status' in message && message._status === 'error';

  // 15-minute edit/delete window
  const EDIT_WINDOW_MS = 15 * 60 * 1000;
  const isWithinEditWindow =
    Date.now() - new Date(message.createdAt).getTime() < EDIT_WINDOW_MS;
  const canModify = isOwner && !message.isDeleted && !isPending && isWithinEditWindow;

  const handleReactSelect = (emoji: string) => {
    if (onReact && !message.isDeleted && !isPending) {
      onReact(message._id, emoji);
    }
    setIsEmojiPanelOpen(false);
  };

  const handleToggleEmoji = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEmojiPanelOpen((prev) => !prev);
    setIsActionsMenuOpen(false);
  };

  // Close menus on click outside
  useEffect(() => {
    if (!isActionsMenuOpen && !isEmojiPanelOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (actionsMenuRef.current && !actionsMenuRef.current.contains(e.target as Node)) {
        setIsActionsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isActionsMenuOpen, isEmojiPanelOpen]);

  const handleErrorTap = () => {
    if (isError && onRetry) {
      onRetry(message as PendingMessage);
    }
  };

  const formattedTime = message.createdAt
    ? formatTime(message.createdAt, isRTL)
    : '';

  // Detect compact message for tailored popup alignment
  const isCompactMessage =
    message.type !== 'IMAGE' && (!message.content || message.content.length < 35);

  const emojiPanelAlignmentClass = isCompactMessage
    ? isOwner
      ? 'ltr:right-0 ltr:left-auto rtl:left-0 rtl:right-auto'
      : 'ltr:left-0 ltr:right-auto rtl:right-0 rtl:left-auto'
    : isOwner
      ? 'ltr:left-0 rtl:right-0'
      : 'ltr:right-0 rtl:left-0';

  const actionsMenuAlignmentClass = isCompactMessage
    ? isOwner
      ? 'ltr:right-0 ltr:left-auto rtl:left-0 rtl:right-auto'
      : 'ltr:left-0 ltr:right-auto rtl:right-0 rtl:left-auto'
    : isOwner
      ? 'ltr:left-0 rtl:right-0'
      : 'ltr:right-0 rtl:left-0';



  return (
    <div
      className={cn(
        'group relative flex flex-col mb-3 transition-opacity duration-150 w-full',
        isOwner ? 'items-end' : 'items-start',
        isPending && 'opacity-75',
        className
      )}
    >
      {/* Sender Name (Only for incoming messages) */}
      {!isOwner && !message.isDeleted && (
        <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1 px-2 select-none">
          {message.senderName || t('message.participant', 'مشارك')}
        </span>
      )}

      {/* Row Container: Bubble + Hover Actions anchored to the BOTTOM of the bubble */}
      <div
        className={cn(
          'relative flex items-end gap-1.5 max-w-[85%] sm:max-w-[80%]',
          isOwner ? 'flex-row' : 'flex-row-reverse'
        )}
      >
        {/* Hover Action Buttons (Anchored at the bottom level of the bubble) */}
        {!message.isDeleted && !isPending && !isError && (
          <div className="opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity flex items-center gap-0.5 shrink-0 select-none mb-1 relative">
            {/* Smile / React Button */}
            <button
              type="button"
              onClick={handleToggleEmoji}
              className="p-1.5 text-slate-400 hover:text-amber-500 hover:bg-slate-200/70 dark:hover:bg-slate-800 rounded-full transition-colors cursor-pointer"
              title={t('actions.react', 'تفاعل')}
            >
              <Smile className="w-4 h-4" />
            </button>

            {/* Actions Menu Trigger */}
            {canModify && (
              <div className="relative" ref={actionsMenuRef}>
                <button
                  type="button"
                  onClick={() => setIsActionsMenuOpen((prev) => !prev)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/70 dark:hover:bg-slate-800 rounded-full transition-colors cursor-pointer"
                  title={t('actions.more', 'المزيد')}
                >
                  <MoreVertical className="w-4 h-4" />
                </button>

                {/* Dropdown Menu */}
                {isActionsMenuOpen && (
                  <div
                    className={cn(
                      'absolute bottom-full mb-1 min-w-[120px] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl p-1 z-50 animate-in fade-in zoom-in-95 duration-100',
                      actionsMenuAlignmentClass
                    )}
                  >
                    {onEdit && message.type === 'TEXT' && message.content && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsActionsMenuOpen(false);
                          onEdit(message._id, message.content || '');
                        }}
                        className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/70 rounded-lg transition-colors cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        <span>{t('actions.edit', 'تعديل')}</span>
                      </button>
                    )}

                    {onDelete && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsActionsMenuOpen(false);
                          onDelete(message._id);
                        }}
                        className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 dark:hover:bg-rose-500/15 rounded-lg transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5 shrink-0" />
                        <span>{t('actions.delete', 'حذف')}</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Inward-pointing Reaction Capsule (Customized alignment for small vs large messages) */}
            {isEmojiPanelOpen && (
              <div
                className={cn(
                  'absolute bottom-full mb-1.5 z-50 animate-in fade-in zoom-in-95 duration-100',
                  emojiPanelAlignmentClass
                )}
              >
                <EmojiPanel
                  showQuickRowOnly
                  onSelect={handleReactSelect}
                  onClose={() => setIsEmojiPanelOpen(false)}
                />
              </div>
            )}
          </div>
        )}

        {/* The Message Bubble */}
        <div
          className={cn(
            'relative w-fit min-w-[70px] rounded-2xl p-3 shadow-xs transition-all duration-150',
            message.isDeleted
              ? 'bg-slate-100/70 dark:bg-slate-800/50 border border-dashed border-slate-300 dark:border-slate-700 text-slate-500 dark:text-slate-400'
              : isOwner
                ? 'bg-amber-500 text-slate-950 rounded-br-xs dark:bg-amber-500 dark:text-slate-950 font-normal'
                : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200/80 dark:border-slate-700/80 rounded-bl-xs'
          )}
        >
          {/* Deleted Message Presentation */}
          {message.isDeleted ? (
            <div className="flex items-center gap-2 py-0.5 select-none">
              <CircleSlash className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
              <span className="text-xs font-normal not-italic text-slate-500 dark:text-slate-400">
                {t('message.deleted', 'تم حذف هذه الرسالة')}
              </span>
            </div>
          ) : (
            <>
              {/* Image Attachment */}
              {message.type === 'IMAGE' && message.mediaUrls && message.mediaUrls.length > 0 && (
                <div className="mb-2 space-y-1.5">
                  {message.mediaUrls.map((url, idx) => (
                    <div
                      key={`${url}-${idx}`}
                      className="relative group/img overflow-hidden rounded-xl bg-slate-900/10 cursor-pointer max-h-64 flex items-center justify-center"
                      onClick={() => setIsPreviewImageOpen(true)}
                    >
                      <img
                        src={url}
                        alt={t('message.imageAlt', 'صورة مرفقة')}
                        className="w-full h-auto object-cover rounded-xl transition-transform duration-200 group-hover/img:scale-105"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center text-white">
                        <Maximize2 className="w-5 h-5 drop-shadow" />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Message Text Content */}
              {message.content && (
                <p
                  dir="auto"
                  className="text-sm leading-relaxed whitespace-pre-wrap break-all [overflow-wrap:anywhere]"
                >
                  {message.content}
                </p>
              )}

              {/* Footer Row: Timestamp, Edited Badge & Status Icons */}
              <div
                className={cn(
                  'flex items-center gap-1.5 mt-1.5 text-[11px] select-none justify-end font-bold',
                  isOwner
                    ? 'text-slate-950'
                    : 'text-slate-900 dark:text-white'
                )}
              >
                {message.isEdited && (
                  <span
                    className={cn(
                      'font-normal not-italic text-[10px]',
                      isOwner
                        ? 'text-slate-800/80'
                        : 'text-slate-600 dark:text-slate-300'
                    )}
                  >
                    {t('message.edited', '(تم التعديل)')}
                  </span>
                )}

                <span
                  dir="ltr"
                  className="font-bold text-[11px] select-none tracking-normal inline-block font-sans"
                >
                  {formattedTime}
                </span>

                {/* Status Icons (Double checks for delivered, Double blue for read) */}
                {isOwner && (
                  <span className="inline-flex items-center">
                    {isPending ? (
                      <Clock className="w-3 h-3 text-slate-800/80" />
                    ) : isError ? (
                      <button
                        type="button"
                        onClick={handleErrorTap}
                        className="inline-flex items-center p-0 cursor-pointer"
                        title={t('message.retryLabel', 'اضغط لإعادة الإرسال')}
                      >
                        <AlertCircle className="w-3.5 h-3.5 text-rose-800" />
                      </button>
                    ) : isRead ? (
                      <span title={t('message.read', 'تمت القراءة')}>
                        <CheckCheck className="w-3.5 h-3.5 text-sky-600 font-bold" />
                      </span>
                    ) : (
                      <span title={t('message.delivered', 'تم التسليم')}>
                        <CheckCheck className="w-3.5 h-3.5 text-slate-800/80" />
                      </span>
                    )}
                  </span>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Aggregated Reactions Display below the bubble */}
      {message.reactions && message.reactions.length > 0 && !message.isDeleted && (
        <MessageReactions
          reactions={message.reactions}
          onReact={(emoji) => onReact && onReact(message._id, emoji)}
          isDeleted={message.isDeleted}
        />
      )}

      {/* Inline Retry and Cancel for Failed Messages */}
      {isError && (
        <div className="flex items-center gap-1.5 mt-1 px-1">
          {onRetry && (
            <button
              type="button"
              onClick={() => onRetry(message as PendingMessage)}
              className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 hover:text-amber-500 dark:hover:text-amber-400 transition-colors cursor-pointer"
            >
              {t('message.retryLabel', 'إعادة المحاولة')}
            </button>
          )}
          {onRemovePending && (
            <button
              type="button"
              onClick={() => onRemovePending((message as PendingMessage)._localId)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors p-0.5 cursor-pointer"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      )}

      {/* Image Preview Zoom Modal */}
      {isPreviewImageOpen && message.mediaUrls && message.mediaUrls[0] && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setIsPreviewImageOpen(false)}
        >
          <div className="relative max-w-4xl max-h-[90vh]">
            <img
              src={message.mediaUrls[0]}
              alt={t('message.imageAlt', 'صورة')}
              className="max-w-full max-h-[85vh] rounded-2xl object-contain shadow-2xl"
            />
            <button
              type="button"
              onClick={() => setIsPreviewImageOpen(false)}
              className="absolute -top-4 -right-4 w-9 h-9 rounded-full bg-white dark:bg-slate-800 text-slate-800 dark:text-white flex items-center justify-center shadow-lg hover:scale-110 transition-transform cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatMessageBubble;
