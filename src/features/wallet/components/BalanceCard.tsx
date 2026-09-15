import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { HelpCircle, X } from 'lucide-react';
import { formatPrice } from '@/utils/formatters';
import { cn } from '@/utils/cn';

export interface BalanceCardProps {
  title: string;
  amount: number | string;
  tooltip: string;
  variant: 'primary' | 'success' | 'warning';
  icon: React.ReactNode;
  isLoading?: boolean;
}

export const BalanceCard: React.FC<BalanceCardProps> = ({
  title,
  amount,
  tooltip,
  variant,
  icon,
  isLoading = false,
}) => {
  const { i18n, t } = useTranslation(['wallet', 'common']);
  const isRTL = i18n.language.startsWith('ar');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const variantConfig = {
    primary: {
      border: 'border-slate-200/90 dark:border-slate-800 hover:border-amber-500/50 dark:hover:border-amber-500/40',
      iconBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20',
      accentDot: 'bg-amber-500',
    },
    success: {
      border: 'border-slate-200/90 dark:border-slate-800 hover:border-emerald-500/50 dark:hover:border-emerald-500/40',
      iconBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20',
      accentDot: 'bg-emerald-500',
    },
    warning: {
      border: 'border-slate-200/90 dark:border-slate-800 hover:border-slate-400/50 dark:hover:border-slate-600/50',
      iconBg: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700',
      accentDot: 'bg-slate-400 dark:bg-slate-500',
    },
  };

  const config = variantConfig[variant];

  return (
    <>
      <div
        className={cn(
          'group relative overflow-hidden rounded-2xl border bg-white dark:bg-slate-900 p-4 sm:p-5 transition-all duration-200 shadow-sm hover:shadow-md flex flex-col justify-between min-w-0',
          config.border
        )}
      >
        {/* Top Header: Icon + Title + Info Trigger */}
        <div className="flex items-center justify-between gap-2 mb-3 min-w-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className={cn('p-2 rounded-xl shrink-0', config.iconBg)}>
              {React.cloneElement(icon as React.ReactElement, {
                className: 'w-4 h-4 sm:w-4.5 sm:h-4.5',
              })}
            </div>
            <span className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 truncate">
              {title}
            </span>
          </div>

          {/* Info Button: Single clean icon with no duplicate outer circle */}
          <button
            type="button"
            aria-label={`Info about ${title}`}
            onClick={() => setIsModalOpen(true)}
            className="p-0.5 text-slate-400 hover:text-amber-500 dark:hover:text-amber-400 transition-colors focus:outline-none"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>

        {/* Bottom Amount Row: Scalable font with break protection */}
        <div className="min-w-0 pt-1">
          {isLoading ? (
            <div className="h-8 w-32 animate-pulse rounded-lg bg-slate-100 dark:bg-slate-800" />
          ) : (
            <div className="flex items-baseline gap-1.5 flex-wrap min-w-0">
              <span className="text-lg sm:text-xl md:text-2xl font-extrabold tracking-tight font-mono text-slate-900 dark:text-white break-words">
                {formatPrice(amount, isRTL)}
              </span>
              <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase shrink-0">
                {t('wallet:balance.currency')}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Info Modal Dialog: Clean, refined design with matching card icon */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-150"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="w-full max-w-sm rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-xl space-y-4 animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 dark:border-slate-800/80">
              <div className="flex items-center gap-2.5">
                <div className={cn('p-2 rounded-xl shrink-0', config.iconBg)}>
                  {React.cloneElement(icon as React.ReactElement, {
                    className: 'w-4 h-4',
                  })}
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {tooltip}
            </p>

            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-800 dark:text-slate-100 text-sm font-bold border border-slate-200 dark:border-slate-700 transition-all duration-200 shadow-2xs active:scale-[0.99]"
            >
              {isRTL ? 'إغلاق' : 'Close'}
            </button>
          </div>
        </div>
      )}
    </>
  );
};
