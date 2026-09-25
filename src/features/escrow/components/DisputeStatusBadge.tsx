import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  AlertCircle,
  Clock,
  CheckCircle2,
  XCircle,
  ShieldAlert,
} from 'lucide-react';
import type { DisputeStatus } from '../types/escrow.types';
import { cn } from '@/utils/cn';

export interface DisputeStatusBadgeProps {
  status: DisputeStatus;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  className?: string;
}

interface StatusConfig {
  labelKey: string;
  defaultLabel: string;
  icon: React.ComponentType<{ className?: string }>;
  classes: string;
  dotClass: string;
  isPulsing?: boolean;
}

const STATUS_CONFIGS: Record<DisputeStatus, StatusConfig> = {
  OPEN: {
    labelKey: 'disputeStatus.OPEN',
    defaultLabel: 'نزاع مفتوح',
    icon: ShieldAlert,
    classes:
      'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30 dark:bg-amber-500/15',
    dotClass: 'bg-amber-500',
    isPulsing: true,
  },
  UNDER_REVIEW: {
    labelKey: 'disputeStatus.UNDER_REVIEW',
    defaultLabel: 'قيد المراجعة والتحقيق',
    icon: Clock,
    classes:
      'bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/30 dark:bg-purple-500/15',
    dotClass: 'bg-purple-500',
    isPulsing: true,
  },
  RESOLVED_BUYER_REFUNDED: {
    labelKey: 'disputeStatus.RESOLVED_BUYER_REFUNDED',
    defaultLabel: 'محسوم: استرداد للمشتري',
    icon: CheckCircle2,
    classes:
      'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 dark:bg-emerald-500/15',
    dotClass: 'bg-emerald-500',
  },
  RESOLVED_SELLER_PAID: {
    labelKey: 'disputeStatus.RESOLVED_SELLER_PAID',
    defaultLabel: 'محسوم: تحرير للبائع',
    icon: CheckCircle2,
    classes:
      'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 dark:bg-emerald-500/15',
    dotClass: 'bg-emerald-500',
  },
  CANCELLED: {
    labelKey: 'disputeStatus.CANCELLED',
    defaultLabel: 'ملغي بالتراضي',
    icon: XCircle,
    classes:
      'bg-slate-500/10 text-slate-700 dark:text-slate-400 border-slate-500/30 dark:bg-slate-500/15',
    dotClass: 'bg-slate-400',
  },
};

const SIZE_CONFIGS = {
  sm: {
    badge: 'px-2 py-0.5 text-3xs gap-1',
    icon: 'w-3 h-3',
    dot: 'w-1.5 h-1.5',
  },
  md: {
    badge: 'px-2.5 py-1 text-2xs gap-1.5',
    icon: 'w-3.5 h-3.5',
    dot: 'w-2 h-2',
  },
  lg: {
    badge: 'px-3.5 py-1.5 text-xs sm:text-sm gap-2',
    icon: 'w-4 h-4',
    dot: 'w-2.5 h-2.5',
  },
};

export const DisputeStatusBadge: React.FC<DisputeStatusBadgeProps> = ({
  status,
  size = 'md',
  showIcon = true,
  className,
}) => {
  const { t } = useTranslation(['escrow', 'common']);
  const config = STATUS_CONFIGS[status] || {
    labelKey: 'disputeStatus.UNKNOWN',
    defaultLabel: status,
    icon: AlertCircle,
    classes: 'bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-300',
    dotClass: 'bg-slate-400',
  };

  const sizeConfig = SIZE_CONFIGS[size];
  const IconComponent = config.icon;

  return (
    <span
      className={cn(
        'inline-flex items-center font-black rounded-full border shadow-2xs select-none transition-colors duration-200',
        config.classes,
        sizeConfig.badge,
        className
      )}
    >
      {/* Animated Pulse Dot */}
      <span className="relative flex shrink-0">
        {config.isPulsing && (
          <span
            className={cn(
              'animate-ping absolute inline-flex h-full w-full rounded-full opacity-75',
              config.dotClass
            )}
          />
        )}
        <span className={cn('relative inline-flex rounded-full', sizeConfig.dot, config.dotClass)} />
      </span>

      {showIcon && <IconComponent className={cn(sizeConfig.icon, 'shrink-0')} />}

      <span className="truncate">{t(config.labelKey, config.defaultLabel)}</span>
    </span>
  );
};
