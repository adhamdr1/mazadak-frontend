import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Clock, Flame, Hourglass, CheckCircle2 } from 'lucide-react';
import { cn } from '@/utils/cn';
import type { AuctionStatus } from '../../types/auctions.types';

export interface CountdownTimerProps {
  targetDate: string | Date;
  status?: AuctionStatus;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'pill' | 'banner' | 'minimal';
  showLabel?: boolean;
  onEnd?: () => void;
  className?: string;
}

interface TimeRemaining {
  totalMs: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isUrgent: boolean; // < 1 minute
  isNearEnd: boolean; // < 1 hour
  isExpired: boolean;
}

function calculateTimeRemaining(target: Date): TimeRemaining {
  const totalMs = target.getTime() - Date.now();
  if (totalMs <= 0) {
    return {
      totalMs: 0,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      isUrgent: false,
      isNearEnd: false,
      isExpired: true,
    };
  }

  const seconds = Math.floor((totalMs / 1000) % 60);
  const minutes = Math.floor((totalMs / 1000 / 60) % 60);
  const hours = Math.floor((totalMs / (1000 * 60 * 60)) % 24);
  const days = Math.floor(totalMs / (1000 * 60 * 60 * 24));

  return {
    totalMs,
    days,
    hours,
    minutes,
    seconds,
    isUrgent: totalMs < 60 * 1000,
    isNearEnd: totalMs < 60 * 60 * 1000,
    isExpired: false,
  };
}

/**
 * Formats day string according to strict Arabic linguistic rules
 * - 1 day: "يوم"
 * - 2 days: "يومان"
 * - 3 to 10 days: "X أيام"
 * - 11+ days: "X يوم"
 */
function formatDaysRemaining(days: number, isRTL: boolean): string {
  if (days <= 0) return '';
  if (!isRTL) {
    return days === 1 ? '1d' : `${days}d`;
  }
  if (days === 1) return 'يوم';
  if (days === 2) return 'يومان';
  if (days >= 3 && days <= 10) return `${days} أيام`;
  return `${days} يوم`;
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({
  targetDate,
  status = 'ACTIVE',
  size = 'md',
  variant = 'pill',
  showLabel = true,
  onEnd,
  className,
}) => {
  const { t, i18n } = useTranslation('auctions');
  const isRTL = i18n.language?.startsWith('ar');
  const target = useMemo(() => new Date(targetDate), [targetDate]);
  const [time, setTime] = useState<TimeRemaining>(() => calculateTimeRemaining(target));

  useEffect(() => {
    const interval = setInterval(() => {
      const remaining = calculateTimeRemaining(target);
      setTime(remaining);

      if (remaining.isExpired) {
        clearInterval(interval);
        onEnd?.();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [target, onEnd]);

  const sizeStyles = {
    sm: 'text-[11px] px-2.5 py-1 gap-1.5',
    md: 'text-xs px-3 py-1.5 gap-2',
    lg: 'text-sm sm:text-base px-4 py-2 gap-2.5 font-bold',
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4',
  };

  // Ended State: Uses CheckCircle2 icon (No clock icon!)
  if (status === 'ENDED' || status === 'CANCELLED' || time.isExpired) {
    return (
      <div
        className={cn(
          'inline-flex items-center gap-1.5 font-bold rounded-full select-none backdrop-blur-md shadow-sm border transition-colors',
          'bg-white/95 text-slate-700 border-slate-200 dark:bg-slate-900/95 dark:text-slate-300 dark:border-slate-700/80',
          sizeStyles[size],
          className
        )}
      >
        <CheckCircle2 className={cn(iconSizes[size], 'text-slate-500 dark:text-slate-400')} />
        <span>{t('countdown.ended')}</span>
      </div>
    );
  }

  const pad = (n: number) => n.toString().padStart(2, '0');

  // Distinct visual themes for Starts Soon (PENDING) vs Active (ACTIVE) vs Urgent
  const getThemeStyles = () => {
    if (time.isUrgent) {
      return {
        container: 'bg-red-600 text-white border-red-500 shadow-md shadow-red-500/20 animate-pulse',
        icon: <Flame className={cn(iconSizes[size], 'text-white animate-bounce shrink-0')} />,
        label: 'text-white font-bold',
      };
    }
    if (time.isNearEnd) {
      return {
        container: 'bg-amber-600 text-white border-amber-400 shadow-md shadow-amber-500/20',
        icon: <Clock className={cn(iconSizes[size], 'text-white shrink-0')} />,
        label: 'text-white font-bold',
      };
    }
    // Starts Soon (PENDING) - Distinct Warm Amber Theme with Hourglass
    if (status === 'PENDING') {
      return {
        container:
          'bg-amber-50/95 text-amber-900 border-amber-300/90 dark:bg-amber-950/80 dark:text-amber-300 dark:border-amber-500/40 shadow-sm',
        icon: <Hourglass className={cn(iconSizes[size], 'text-amber-600 dark:text-amber-400 shrink-0')} />,
        label: 'text-amber-800 dark:text-amber-300 font-bold',
      };
    }
    // Live Active (ACTIVE) - Crisp Theme with Emerald Clock
    return {
      container:
        'bg-white/95 text-slate-900 border-slate-200/90 dark:bg-slate-900/95 dark:text-white dark:border-slate-700/80 shadow-sm',
      icon: <Clock className={cn(iconSizes[size], 'text-emerald-500 dark:text-emerald-400 shrink-0')} />,
      label: 'text-slate-600 dark:text-slate-300 font-semibold',
    };
  };

  const theme = getThemeStyles();
  const daysFormatted = formatDaysRemaining(time.days, isRTL);

  return (
    <div
      className={cn(
        'inline-flex items-center select-none backdrop-blur-md rounded-full border shadow-sm transition-colors',
        sizeStyles[size],
        theme.container,
        variant === 'banner' && 'w-full justify-center rounded-2xl py-3 text-base',
        className
      )}
    >
      {/* Icon & Label */}
      <div className="inline-flex items-center gap-1 shrink-0">
        {theme.icon}
        {showLabel && (
          <span className={cn('text-[11px] me-0.5', theme.label)}>
            {status === 'PENDING' ? t('countdown.startsIn') : t('countdown.endsIn')}
          </span>
        )}
      </div>

      {/* Clearly Separated Digits Block with Bullet separator */}
      <div dir="ltr" className="inline-flex items-center gap-1.5 font-mono font-bold tracking-tight text-xs leading-none">
        {time.days > 0 && (
          <>
            <span className="font-sans font-bold text-[11px]">
              {daysFormatted}
            </span>
            <span className="opacity-40 font-normal select-none">•</span>
          </>
        )}
        <span>
          {pad(time.hours)}:{pad(time.minutes)}:{pad(time.seconds)}
        </span>
      </div>
    </div>
  );
};

export default CountdownTimer;
