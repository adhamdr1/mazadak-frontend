/**
 * EmojiPanel Component
 * Ultra-fast, pure React/Tailwind Emoji Picker (~2KB, zero heavy bundle dependencies)
 * Supports WhatsApp-style Quick Reaction capsule row, categorized tabs, dark mode, and RTL/LTR
 */

import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus } from 'lucide-react';
import { cn } from '@/utils/cn';
import { QUICK_EMOJIS, EMOJI_CATEGORIES } from '../constants/emoji.constants';

export interface EmojiPanelProps {
  onSelect: (emoji: string) => void;
  onClose?: () => void;
  showQuickRowOnly?: boolean;
  className?: string;
}

export const EmojiPanel: React.FC<EmojiPanelProps> = ({
  onSelect,
  onClose,
  showQuickRowOnly = false,
  className,
}) => {
  const { t } = useTranslation('chat');
  const panelRef = useRef<HTMLDivElement>(null);
  const [isExpanded, setIsExpanded] = useState(!showQuickRowOnly);
  const [activeTab, setActiveTab] = useState<string>('smileys');

  // Close on Click Outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        if (onClose) onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  const handleSelect = (emoji: string) => {
    onSelect(emoji);
    if (onClose) onClose();
  };

  const currentCategory = EMOJI_CATEGORIES.find((c) => c.id === activeTab);
  const displayedEmojis = currentCategory?.emojis || [];

  return (
    <div
      ref={panelRef}
      className={cn(
        'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-2xl shadow-2xl text-slate-800 dark:text-slate-100 z-50 animate-in fade-in zoom-in-95 duration-100',
        className
      )}
    >
      {/* Quick Reaction Row (WhatsApp Style Capsule) */}
      <div className="flex items-center gap-1 p-1 bg-slate-50/80 dark:bg-slate-800/60 rounded-2xl">
        {QUICK_EMOJIS.map((emoji) => (
          <button
            key={emoji}
            type="button"
            onClick={() => handleSelect(emoji)}
            className="w-8 h-8 flex items-center justify-center text-lg hover:scale-130 hover:bg-slate-200/80 dark:hover:bg-slate-700 rounded-xl transition-all active:scale-95 cursor-pointer"
            title={emoji}
          >
            {emoji}
          </button>
        ))}

        {showQuickRowOnly && (
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className={cn(
              'w-8 h-8 flex items-center justify-center rounded-xl transition-colors cursor-pointer',
              isExpanded
                ? 'bg-amber-500/20 text-amber-500 font-bold'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700'
            )}
            title={t('reactions.moreEmojis', 'المزيد من التفاعلات')}
          >
            <Plus className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Expanded Categorized Picker (No search, pure clean category grid) */}
      {isExpanded && (
        <div className="w-64 p-2.5 space-y-2 border-t border-slate-100 dark:border-slate-800 animate-in fade-in duration-100">
          {/* Category Tabs */}
          <div className="flex items-center justify-between gap-1 pb-1 border-b border-slate-100 dark:border-slate-800/80">
            {EMOJI_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveTab(cat.id)}
                className={cn(
                  'w-7 h-7 flex items-center justify-center text-sm rounded-lg transition-colors cursor-pointer',
                  activeTab === cat.id
                    ? 'bg-amber-500/20 text-amber-500 font-bold shadow-2xs'
                    : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400'
                )}
                title={cat.id}
              >
                {cat.icon}
              </button>
            ))}
          </div>

          {/* Emoji Grid */}
          <div className="grid grid-cols-7 gap-1 max-h-40 overflow-y-auto p-1 custom-scrollbar">
            {displayedEmojis.map((emoji, idx) => (
              <button
                key={`${emoji}-${idx}`}
                type="button"
                onClick={() => handleSelect(emoji)}
                className="w-7 h-7 flex items-center justify-center text-lg hover:scale-130 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all active:scale-95 cursor-pointer"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default EmojiPanel;
