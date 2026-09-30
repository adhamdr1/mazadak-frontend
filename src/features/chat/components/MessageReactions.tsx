/**
 * MessageReactions Component
 * Displays aggregated emoji reactions on a chat message with toggle action
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/utils/cn';
import { toLocalizedDigits } from '@/utils/formatters';
import type { ChatReactionData } from '../types/chat.types';

export interface MessageReactionsProps {
  reactions: ChatReactionData[];
  onReact: (emoji: string | null) => void;
  isDeleted?: boolean;
  className?: string;
}

export const MessageReactions: React.FC<MessageReactionsProps> = ({
  reactions,
  onReact,
  isDeleted = false,
  className,
}) => {
  const { t, i18n } = useTranslation('chat');
  const isRTL = i18n.language?.startsWith('ar');
  const { user: currentUser } = useAuth();

  if (isDeleted || !reactions || reactions.length === 0) {
    return null;
  }

  // Aggregate reactions by emoji
  const countsMap = new Map<string, { count: number; userIds: string[] }>();
  for (const r of reactions) {
    const existing = countsMap.get(r.emoji) || { count: 0, userIds: [] };
    existing.count += 1;
    existing.userIds.push(r.userId);
    countsMap.set(r.emoji, existing);
  }

  const aggregated = Array.from(countsMap.entries()).map(([emoji, meta]) => ({
    emoji,
    count: meta.count,
    hasReacted: currentUser ? meta.userIds.includes(currentUser._id) : false,
  }));

  return (
    <div className={cn('flex flex-wrap gap-1 mt-1 items-center', className)}>
      {aggregated.map(({ emoji, count, hasReacted }) => (
        <button
          key={emoji}
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            // If user already reacted with this emoji, toggle it off by sending null
            onReact(hasReacted ? null : emoji);
          }}
          className={cn(
            'inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-xs font-medium border transition-all duration-150 active:scale-95 shadow-2xs cursor-pointer',
            hasReacted
              ? 'bg-amber-500/15 border-amber-500/40 text-amber-600 dark:text-amber-400 font-bold scale-105'
              : 'bg-white/80 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700'
          )}
          title={
            hasReacted
              ? t('reactions.removeReaction', 'إزالة تفاعلك')
              : t('reactions.addReaction', 'تفاعل بهذا')
          }
        >
          <span className="text-xs leading-none">{emoji}</span>
          <span className="text-[11px] tabular-nums font-bold text-slate-800 dark:text-slate-200">
            {toLocalizedDigits(count, isRTL)}
          </span>
        </button>
      ))}
    </div>
  );
};
