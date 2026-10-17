import React from 'react';
import { useTranslation } from 'react-i18next';
import { RefreshCw } from 'lucide-react';
import { cn } from '@/utils/cn';

export interface RefreshButtonProps {
  onRefresh: () => void | Promise<unknown>;
  isLoading?: boolean;
  isRefetching?: boolean;
  label?: string;
  showLabel?: boolean;
  showLabelOnMobile?: boolean;
  className?: string;
  title?: string;
}

export const RefreshButton: React.FC<RefreshButtonProps> = ({
  onRefresh,
  isLoading = false,
  isRefetching = false,
  label,
  showLabel = true,
  showLabelOnMobile = false,
  className,
  title,
}) => {
  const { t, i18n } = useTranslation(['common', 'admin']);
  const isRTL = i18n.language?.startsWith('ar');

  const defaultLabel = t('common.refresh', { defaultValue: isRTL ? 'تحديث' : 'Refresh' });
  const displayLabel = label ?? defaultLabel;
  const disabled = isLoading || isRefetching;

  return (
    <button
      type="button"
      onClick={onRefresh}
      disabled={disabled}
      title={title || displayLabel}
      className={cn(
        'group inline-flex items-center justify-center gap-1.5 px-3 sm:px-3.5 py-2.5 rounded-xl text-xs font-bold',
        'text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900',
        'hover:bg-amber-500/10 dark:hover:bg-amber-500/15 hover:text-amber-600 dark:hover:text-amber-400',
        'hover:border-amber-500/50 dark:hover:border-amber-500/40 border border-slate-200/80 dark:border-slate-800',
        'shadow-2xs hover:shadow-xs transition-all duration-200 disabled:opacity-50 cursor-pointer active:scale-95 shrink-0',
        className
      )}
    >
      <RefreshCw
        className={cn(
          'w-3.5 h-3.5 text-amber-500 group-hover:text-amber-400 transition-transform duration-500 group-hover:rotate-180',
          isRefetching && 'animate-spin'
        )}
      />
      {showLabel && (
        <span className={cn(showLabelOnMobile ? 'inline' : 'hidden sm:inline')}>
          {displayLabel}
        </span>
      )}
    </button>
  );
};

export default RefreshButton;
