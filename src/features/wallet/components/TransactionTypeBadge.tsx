import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  ArrowDownLeft,
  ArrowUpRight,
  Lock,
  Unlock,
  Gavel,
  RotateCcw,
  ShieldCheck,
  ShieldAlert,
} from 'lucide-react';
import { cn } from '@/utils/cn';
import type { TransactionType } from '../types/wallet.types';

export interface TransactionTypeBadgeProps {
  type: TransactionType | string;
  size?: 'sm' | 'md';
  showIcon?: boolean;
  className?: string;
}

export const TransactionTypeBadge: React.FC<TransactionTypeBadgeProps> = ({
  type,
  size = 'md',
  showIcon = true,
  className,
}) => {
  const { t } = useTranslation('wallet');

  const normalizedType = type.toUpperCase() as TransactionType;

  const config: Record<
    TransactionType,
    {
      labelKey: string;
      icon: React.ComponentType<{ className?: string }>;
      classes: string;
    }
  > = {
    DEPOSIT: {
      labelKey: 'transactionTypes.DEPOSIT',
      icon: ArrowDownLeft,
      classes:
        'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20',
    },
    WITHDRAW: {
      labelKey: 'transactionTypes.WITHDRAW',
      icon: ArrowUpRight,
      classes:
        'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20',
    },
    HOLD: {
      labelKey: 'transactionTypes.HOLD',
      icon: Lock,
      classes:
        'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20',
    },
    RELEASE: {
      labelKey: 'transactionTypes.RELEASE',
      icon: Unlock,
      classes:
        'bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border-cyan-500/20',
    },
    CAPTURE: {
      labelKey: 'transactionTypes.CAPTURE',
      icon: Gavel,
      classes:
        'bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20',
    },
    REFUND: {
      labelKey: 'transactionTypes.REFUND',
      icon: RotateCcw,
      classes:
        'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20',
    },
    ADMIN_CREDIT: {
      labelKey: 'transactionTypes.ADMIN_CREDIT',
      icon: ShieldCheck,
      classes:
        'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20',
    },
    ADMIN_DEBIT: {
      labelKey: 'transactionTypes.ADMIN_DEBIT',
      icon: ShieldAlert,
      classes:
        'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20',
    },
  };

  const item = config[normalizedType] || {
    labelKey: type,
    icon: ArrowDownLeft,
    classes:
      'bg-slate-500/10 text-slate-700 dark:text-slate-400 border-slate-500/20',
  };

  const IconComponent = item.icon;
  const label = t(item.labelKey, { defaultValue: type });

  const sizeClasses =
    size === 'sm'
      ? 'px-2 py-0.5 text-[11px] gap-1'
      : 'px-2.5 py-1 text-xs gap-1.5 font-semibold';

  const iconSizeClasses = size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5';

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border font-medium select-none transition-colors',
        item.classes,
        sizeClasses,
        className
      )}
    >
      {showIcon && <IconComponent className={cn(iconSizeClasses, 'shrink-0')} />}
      <span>{label}</span>
    </span>
  );
};

export default TransactionTypeBadge;
