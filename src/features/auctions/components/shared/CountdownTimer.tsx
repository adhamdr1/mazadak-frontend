import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Clock, Flame, Hourglass, CheckCircle2 } from 'lucide-react';
import { cn } from '@/utils/cn';
import { toLocalizedDigits } from '@/utils/formatters';
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
 */
function formatDaysRemaining(
  days: number,
  t: (key: string, options?: Record<string, unknown>) => string,
  isRTL: boolean
): string {
  if (days <= 0) return '';
  const countStr = isRTL ? toLocalizedDigits(days, true) : days;
  if (days === 1) return t('countdown.oneDay');
  if (days === 2) return t('countdown.twoDays');
  if (days >= 3 && days <= 10) return t('countdown.fewDays', { count: countStr });
  return t('countdown.manyDays', { count: countStr });
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

  // Keep timer state strictly in sync with targetDate prop changes
  useEffect(() => {
    const immediate = calculateTimeRemaining(target);
    setTime(immediate);

    // If already expired at mount, do NOT trigger onEnd to prevent infinite refetch loops
    if (immediate.isExpired) {
      return;
    }

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
    sm: 'text-[11px] px-2.5 py-1 gap-1.5 font-bold',
    md: 'text-xs px-3 py-1.5 gap-2 font-bold',
    lg: 'text-sm sm:text-base px-4 py-2 gap-2.5 font-extrabold',
  };

  const iconSizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-4.5 h-4.5',
  };

  // Ended State: High-contrast Slate with strong grey border & text
  const isActuallyEnded = status === 'ENDED' || status === 'CANCELLED' || (status === 'ACTIVE' && time.isExpired);
  if (isActuallyEnded) {
    const endedStyles =
      variant === 'pill'
        ? 'bg-white/95 text-slate-700 border-slate-300 dark:bg-slate-900/95 dark:text-slate-300 dark:border-slate-600 shadow-md backdrop-blur-md'
        : 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800/80 dark:text-slate-300 dark:border-slate-700 shadow-sm';

    return (
      <div
        className={cn(
          'inline-flex items-center gap-1.5 font-bold rounded-full select-none border transition-colors',
          endedStyles,
          sizeStyles[size],
          variant === 'banner' && 'w-full justify-center rounded-2xl py-3 text-base',
          className
        )}
      >
        <CheckCircle2 className={cn(iconSizes[size], 'text-slate-500 dark:text-slate-400')} />
        <span>{t('countdown.ended')}</span>
      </div>
    );
  }

  // Pending State Just Expired -> Starting Now
  if (status === 'PENDING' && time.isExpired) {
    return (
      <div
        className={cn(
          'inline-flex items-center gap-1.5 font-bold rounded-full select-none border transition-colors',
          'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/40 shadow-sm animate-pulse',
          sizeStyles[size],
          variant === 'banner' && 'w-full justify-center rounded-2xl py-3 text-base',
          className
        )}
      >
        <Clock className={cn(iconSizes[size], 'text-emerald-500 shrink-0')} />
        <span>{t('status.ACTIVE')}</span>
      </div>
    );
  }

  const pad = (num: number) => {
    const padded = String(num).padStart(2, '0');
    return isRTL ? toLocalizedDigits(padded, true) : padded;
  };

  // State-Driven Unified Color Configurations
  const getThemeStyles = () => {
    const isPill = variant === 'pill';

    // 1. Starts Soon (PENDING) - Amber Border & Crisp Contrast
    if (status === 'PENDING') {
      return {
        container: isPill
          ? 'bg-white/95 text-amber-900 border-amber-400 dark:bg-slate-900/95 dark:text-amber-300 dark:border-amber-500 shadow-md backdrop-blur-md'
          : 'bg-white dark:bg-slate-900/90 text-slate-900 dark:text-amber-300 border-2 border-amber-500/60 dark:border-amber-500/40 shadow-xs',
        icon: <Hourglass className={cn(iconSizes[size], 'text-amber-500 dark:text-amber-400 shrink-0')} />,
        label: isPill
          ? 'text-amber-900 dark:text-amber-300 font-bold'
          : 'text-slate-900 dark:text-amber-300 font-black',
      };
    }

    // 2. Urgent State (< 1 min) - High-contrast Pulsing Flame
    if (time.isUrgent) {
      return {
        container:
          'bg-red-600 text-white border-red-500 shadow-md shadow-red-500/25 animate-pulse',
        icon: <Flame className={cn(iconSizes[size], 'text-white animate-bounce shrink-0')} />,
        label: 'text-white font-bold',
      };
    }

    // 3. Live Active (ACTIVE) - Green Border & Green Text
    return {
      container: isPill
        ? 'bg-white/95 text-emerald-800 border-emerald-400 dark:bg-slate-900/95 dark:text-emerald-300 dark:border-emerald-500 shadow-md backdrop-blur-md'
        : 'bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border-emerald-500/40 dark:border-emerald-500/40 shadow-sm',
      icon: <Clock className={cn(iconSizes[size], 'text-emerald-600 dark:text-emerald-400 shrink-0')} />,
      label: isPill
        ? 'text-emerald-800 dark:text-emerald-300 font-bold'
        : 'text-emerald-800 dark:text-emerald-300 font-bold',
    };
  };

  const theme = getThemeStyles();
  const daysFormatted = formatDaysRemaining(time.days, t, isRTL);

  return (
    <div
      className={cn(
        'inline-flex items-center select-none rounded-full border transition-colors',
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

      {/* Clearly Separated Digits Block */}
      <div className="inline-flex items-center gap-1.5 font-mono font-bold tracking-tight text-xs leading-none">
        {time.days > 0 && (
          <>
            <span className="font-sans font-bold text-[11px]">
              {daysFormatted}
            </span>
            <span className="opacity-40 font-normal select-none">•</span>
          </>
        )}
        <span dir="ltr">
          {pad(time.hours)}:{pad(time.minutes)}:{pad(time.seconds)}
        </span>
      </div>
    </div>
  );
};

export default CountdownTimer;
