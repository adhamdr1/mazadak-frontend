import React from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/utils/cn';
import type { AuctionStatus } from '../../types/auctions.types';

export interface AuctionStatusBadgeProps {
  status: AuctionStatus;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const AuctionStatusBadge: React.FC<AuctionStatusBadgeProps> = ({
  status,
  size = 'md',
  className,
}) => {
  const { t } = useTranslation('auctions');

  const sizeStyles = {
    sm: 'text-[11px] px-2.5 py-1 gap-1.5 font-bold',
    md: 'text-xs px-3 py-1.5 gap-1.5 font-bold',
    lg: 'text-sm px-3.5 py-2 gap-2 font-extrabold',
  };

  const dotSizeStyles = {
    sm: 'w-1.5 h-1.5',
    md: 'w-2 h-2',
    lg: 'w-2.5 h-2.5',
  };

  // High contrast visual styles for crystal-clear readability over any image background
  const statusConfig = {
    ACTIVE: {
      bg: 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-md shadow-emerald-500/20',
      dot: 'bg-slate-950 animate-pulse',
      label: t('status.ACTIVE'),
    },
    PENDING: {
      bg: 'bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/20',
      dot: 'bg-slate-950',
      label: t('status.PENDING'),
    },
    ENDED: {
      bg: 'bg-slate-900/95 text-slate-100 border-slate-700 shadow-md backdrop-blur-md',
      dot: 'bg-slate-400',
      label: t('status.ENDED'),
    },
    CANCELLED: {
      bg: 'bg-red-600 text-white border-red-500 shadow-md shadow-red-500/20',
      dot: 'bg-white',
      label: t('status.CANCELLED'),
    },
  };

  const current = statusConfig[status] || statusConfig.ENDED;

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border select-none backdrop-blur-md tracking-tight',
        sizeStyles[size],
        current.bg,
        className
      )}
    >
      <span className={cn('rounded-full shrink-0', dotSizeStyles[size], current.dot)} />
      <span className="leading-none">{current.label}</span>
    </span>
  );
};

export default AuctionStatusBadge;
