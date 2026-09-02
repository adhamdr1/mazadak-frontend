import React from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/utils/cn';
import { formatPrice } from '@/utils/formatters';

export interface PriceDisplayProps {
  amount: number | string;
  label?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'accent' | 'success' | 'muted';
  className?: string;
}

export const PriceDisplay: React.FC<PriceDisplayProps> = ({
  amount,
  label,
  size = 'md',
  variant = 'accent',
  className,
}) => {
  const { t, i18n } = useTranslation('auctions');
  const isRTL = i18n.language?.startsWith('ar');

  const formattedAmount = formatPrice(amount, isRTL);
  const currencySymbol = t('currency.symbol');

  const sizeStyles = {
    sm: {
      amount: 'text-sm font-bold',
      currency: 'text-[11px] font-semibold',
      label: 'text-[10px]',
    },
    md: {
      amount: 'text-base sm:text-lg font-black',
      currency: 'text-xs font-bold',
      label: 'text-xs',
    },
    lg: {
      amount: 'text-xl sm:text-2xl font-black',
      currency: 'text-sm font-bold',
      label: 'text-xs sm:text-sm',
    },
    xl: {
      amount: 'text-2xl sm:text-3xl lg:text-4xl font-black',
      currency: 'text-base sm:text-lg font-bold',
      label: 'text-xs sm:text-sm uppercase tracking-wider',
    },
  };

  const variantStyles = {
    default: 'text-slate-900 dark:text-slate-100',
    accent: 'text-amber-500 dark:text-amber-400',
    success: 'text-emerald-600 dark:text-emerald-400',
    muted: 'text-slate-500 dark:text-slate-400',
  };

  return (
    <div className={cn('inline-flex flex-col', className)}>
      {label && (
        <span className={cn('text-slate-500 dark:text-slate-400 font-medium mb-0.5 select-none', sizeStyles[size].label)}>
          {label}
        </span>
      )}
      <div className={cn('inline-flex items-baseline gap-1 font-mono tracking-tight select-none', variantStyles[variant])}>
        <span className={sizeStyles[size].amount}>{formattedAmount}</span>
        <span className={cn('font-sans font-semibold text-slate-500 dark:text-slate-400', sizeStyles[size].currency)}>
          {currencySymbol}
        </span>
      </div>
    </div>
  );
};

export default PriceDisplay;
