import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  CheckCircle2,
  Clock,
  Loader2,
  XCircle,
  Ban,
  AlertTriangle,
} from 'lucide-react';
import { cn } from '@/utils/cn';
import type { TransactionStatus } from '../types/wallet.types';

export interface TransactionStatusBadgeProps {
  status: TransactionStatus | string;
  size?: 'sm' | 'md';
  showIcon?: boolean;
  className?: string;
}

export const TransactionStatusBadge: React.FC<TransactionStatusBadgeProps> = ({
  status,
  size = 'md',
  showIcon = true,
  className,
}) => {
  const { t } = useTranslation('wallet');

  const normalizedStatus = status.toUpperCase() as TransactionStatus;

  const config: Record<
    TransactionStatus,
    {
      labelKey: string;
      icon: React.ComponentType<{ className?: string }>;
      classes: string;
      spin?: boolean;
    }
  > = {
    SUCCESS: {
      labelKey: 'transactionStatuses.SUCCESS',
      icon: CheckCircle2,
      classes:
        'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20',
    },
    PENDING: {
      labelKey: 'transactionStatuses.PENDING',
      icon: Clock,
      classes:
        'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20',
    },
    PROCESSING: {
      labelKey: 'transactionStatuses.PROCESSING',
      icon: Loader2,
      spin: true,
      classes:
        'bg-sky-500/10 text-sky-700 dark:text-sky-400 border-sky-500/20',
    },
    FAILED: {
      labelKey: 'transactionStatuses.FAILED',
      icon: XCircle,
      classes:
        'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20',
    },
    CANCELLED: {
      labelKey: 'transactionStatuses.CANCELLED',
      icon: Ban,
      classes:
        'bg-slate-500/10 text-slate-700 dark:text-slate-400 border-slate-500/20',
    },
    EXPIRED: {
      labelKey: 'transactionStatuses.EXPIRED',
      icon: AlertTriangle,
      classes:
        'bg-zinc-500/10 text-zinc-700 dark:text-zinc-400 border-zinc-500/20',
    },
  };

  const item = config[normalizedStatus] || {
    labelKey: status,
    icon: Clock,
    classes:
      'bg-slate-500/10 text-slate-700 dark:text-slate-400 border-slate-500/20',
  };

  const IconComponent = item.icon;
  const label = t(item.labelKey, { defaultValue: status });

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
      {showIcon && (
        <IconComponent
          className={cn(
            iconSizeClasses,
            'shrink-0',
            item.spin && 'animate-spin'
          )}
        />
      )}
      <span>{label}</span>
    </span>
  );
};

export default TransactionStatusBadge;
