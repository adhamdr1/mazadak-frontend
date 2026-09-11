import React from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/utils/cn';

export interface PageLoaderProps {
  message?: string;
  className?: string;
  fullScreen?: boolean;
}

export const PageLoader: React.FC<PageLoaderProps> = ({
  message,
  className,
  fullScreen = false,
}) => {
  const { t } = useTranslation('common');
  const loadingText = message || t('common.loading', 'جاري التحميل...');

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={loadingText}
      className={cn(
        'flex flex-col items-center justify-center gap-4 text-center select-none',
        fullScreen ? 'fixed inset-0 z-50 bg-slate-50/80 dark:bg-slate-950/80 backdrop-blur-sm' : 'min-h-[60vh] w-full bg-transparent',
        className
      )}
    >
      {/* Brand Spinner Ring */}
      <div className="relative flex items-center justify-center">
        {/* Ambient Glowing Background */}
        <div className="absolute w-14 h-14 rounded-full bg-amber-500/10 dark:bg-amber-500/20 blur-md animate-pulse" />

        {/* Outer Ring */}
        <div className="w-12 h-12 rounded-full border-3 border-slate-200 dark:border-slate-800" />

        {/* Spinning Gradient Arc */}
        <div className="absolute w-12 h-12 rounded-full border-3 border-transparent border-t-amber-500 border-r-amber-400 animate-spin" />

        {/* Central Glowing Dot */}
        <div className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-sm shadow-amber-500/50" />
      </div>

      {/* Loading Label */}
      <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 tracking-wide animate-pulse">
        {loadingText}
      </p>
    </div>
  );
};

export default PageLoader;
