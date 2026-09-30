/**
 * DateSeparator Component
 * Clean pill separator indicating day boundaries between chat messages
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
import { toLocalizedDigits } from '@/utils/formatters';

interface DateSeparatorProps {
  date: string | Date;
}

export const DateSeparator: React.FC<DateSeparatorProps> = ({ date }) => {
  const { t, i18n } = useTranslation('chat');
  const isRTL = i18n.language?.startsWith('ar');

  const targetDate = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(targetDate.getTime())) return null;

  const now = new Date();
  const isToday =
    targetDate.getDate() === now.getDate() &&
    targetDate.getMonth() === now.getMonth() &&
    targetDate.getFullYear() === now.getFullYear();

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday =
    targetDate.getDate() === yesterday.getDate() &&
    targetDate.getMonth() === yesterday.getMonth() &&
    targetDate.getFullYear() === yesterday.getFullYear();

  let label = '';
  if (isToday) {
    label = t('date.today', isRTL ? 'اليوم' : 'Today');
  } else if (isYesterday) {
    label = t('date.yesterday', isRTL ? 'أمس' : 'Yesterday');
  } else {
    const formatted = new Intl.DateTimeFormat(isRTL ? 'ar-EG' : 'en-US', {
      day: 'numeric',
      month: 'short',
      year: targetDate.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    }).format(targetDate);
    label = isRTL ? toLocalizedDigits(formatted, true) : formatted;
  }

  return (
    <div className="flex items-center justify-center my-3 select-none">
      <span className="px-3 py-1 rounded-full bg-slate-200/70 dark:bg-slate-800/80 text-[11px] font-bold text-slate-500 dark:text-slate-400 border border-slate-300/40 dark:border-slate-700/40 shadow-2xs">
        {label}
      </span>
    </div>
  );
};
