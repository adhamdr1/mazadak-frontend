import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Lock,
  CheckCircle2,
  RotateCcw,
  AlertTriangle,
} from 'lucide-react';
import { cn } from '@/utils/cn';
import type { EscrowStatus } from '../types/escrow.types';

export interface EscrowStatusBadgeProps {
  status: EscrowStatus | string;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  className?: string;
}

export const EscrowStatusBadge: React.FC<EscrowStatusBadgeProps> = ({
  status,
  size = 'md',
  showIcon = true,
  className,
}) => {
  const { t } = useTranslation('escrow');

  const normalizedStatus = status.toUpperCase() as EscrowStatus;

  const config: Record<
    EscrowStatus,
    {
      labelKey: string;
      defaultLabel: string;
      icon: React.ComponentType<{ className?: string }>;
      classes: string;
      pulse?: boolean;
    }
  > = {
    HELD: {
      labelKey: 'status.HELD',
      defaultLabel: 'محتجز بالضمان',
      icon: Lock,
      pulse: true,
      classes:
        'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30 dark:border-amber-500/30 shadow-sm shadow-amber-500/10',
    },
    RELEASED: {
      labelKey: 'status.RELEASED',
      defaultLabel: 'تم التحرير للبائع',
      icon: CheckCircle2,
      classes:
        'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 dark:border-emerald-500/30 shadow-sm shadow-emerald-500/10',
    },
    REFUNDED: {
      labelKey: 'status.REFUNDED',
      defaultLabel: 'مسترد للمشتري',
      icon: RotateCcw,
      classes:
        'bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/30 dark:border-blue-500/30 shadow-sm shadow-blue-500/10',
    },
    DISPUTED: {
      labelKey: 'status.DISPUTED',
      defaultLabel: 'نزاع مالي مفتوح',
      icon: AlertTriangle,
      classes:
        'bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/30 dark:border-rose-500/30 shadow-sm shadow-rose-500/10',
    },
  };

  const item = config[normalizedStatus] || {
    labelKey: `status.${status}`,
    defaultLabel: status,
    icon: Lock,
    classes:
      'bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-500/20 shadow-sm',
  };

  const IconComponent = item.icon;
  const label = t(item.labelKey, { defaultValue: item.defaultLabel });

  const sizeClasses =
    size === 'sm'
      ? 'px-2.5 py-0.5 text-[11px] gap-1'
      : size === 'lg'
      ? 'px-3.5 py-1.5 text-sm gap-2 font-bold'
      : 'px-3 py-1 text-xs gap-1.5 font-bold';

  const iconSizeClasses =
    size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-4 h-4' : 'w-3.5 h-3.5';

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border transition-all select-none backdrop-blur-sm',
        sizeClasses,
        item.classes,
        className
      )}
    >
      {showIcon && (
        <span className={cn('flex-shrink-0', item.pulse && 'animate-pulse')}>
          <IconComponent className={iconSizeClasses} />
        </span>
      )}
      <span className="tracking-tight">{label}</span>
    </span>
  );
};
