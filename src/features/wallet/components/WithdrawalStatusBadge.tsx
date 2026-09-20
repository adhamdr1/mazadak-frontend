import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Clock,
  Loader2,
  CheckCircle2,
  XCircle,
  Ban,
} from 'lucide-react';
import { cn } from '@/utils/cn';
import type { WithdrawalStatus } from '../types/wallet.types';

export interface WithdrawalStatusBadgeProps {
  status: WithdrawalStatus | string;
  size?: 'sm' | 'md';
  showIcon?: boolean;
  className?: string;
}

export const WithdrawalStatusBadge: React.FC<WithdrawalStatusBadgeProps> = ({
  status,
  size = 'md',
  showIcon = true,
  className,
}) => {
  const { t } = useTranslation('wallet');

  const normalizedStatus = status.toUpperCase() as WithdrawalStatus;

  const config: Record<
    WithdrawalStatus,
    {
      labelKey: string;
      defaultLabel: string;
      icon: React.ComponentType<{ className?: string }>;
      classes: string;
      spin?: boolean;
      pulse?: boolean;
    }
  > = {
    PENDING: {
      labelKey: 'withdrawalStatuses.PENDING',
      defaultLabel: 'قيد المراجعة',
      icon: Clock,
      pulse: true,
      classes:
        'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/25',
    },
    PROCESSING: {
      labelKey: 'withdrawalStatuses.PROCESSING',
      defaultLabel: 'قيد التحويل البنكي',
      icon: Loader2,
      spin: true,
      classes:
        'bg-sky-500/10 text-sky-700 dark:text-sky-400 border-sky-500/25',
    },
    COMPLETED: {
      labelKey: 'withdrawalStatuses.COMPLETED',
      defaultLabel: 'تم التحويل بنجاح',
      icon: CheckCircle2,
      classes:
        'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/25',
    },
    REJECTED: {
      labelKey: 'withdrawalStatuses.REJECTED',
      defaultLabel: 'تم الرفض',
      icon: XCircle,
      classes:
        'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/25',
    },
    CANCELLED: {
      labelKey: 'withdrawalStatuses.CANCELLED',
      defaultLabel: 'ملغي',
      icon: Ban,
      classes:
        'bg-slate-500/10 text-slate-700 dark:text-slate-400 border-slate-500/25',
    },
  };

  const item = config[normalizedStatus] || {
    labelKey: status,
    defaultLabel: status,
    icon: Clock,
    classes:
      'bg-slate-500/10 text-slate-700 dark:text-slate-400 border-slate-500/20',
  };

  const IconComponent = item.icon;
  const label = t(item.labelKey, { defaultValue: item.defaultLabel });

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
            item.spin && 'animate-spin',
            item.pulse && 'animate-pulse'
          )}
        />
      )}
      <span>{label}</span>
    </span>
  );
};

export default WithdrawalStatusBadge;
