import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Clock, AlertTriangle, ShieldCheck } from 'lucide-react';
import { toLocalizedDigits } from '@/utils/formatters';
import { cn } from '@/utils/cn';

export interface InspectionCountdownProps {
  inspectionPeriodEndsAt?: string | null;
  inspectionDurationHours?: number;
  className?: string;
}

interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isExpired: boolean;
}

function calculateTimeRemaining(endsAtDate?: Date | null): TimeRemaining {
  if (!endsAtDate || isNaN(endsAtDate.getTime())) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true };
  }

  const diff = endsAtDate.getTime() - Date.now();
  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true };
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / 1000 / 60) % 60);
  const seconds = Math.floor((diff / 1000) % 60);

  return { days, hours, minutes, seconds, isExpired: false };
}

export const InspectionCountdown: React.FC<InspectionCountdownProps> = ({
  inspectionPeriodEndsAt,
  inspectionDurationHours = 168,
  className,
}) => {
  const { t, i18n } = useTranslation(['escrow', 'common']);
  const isRTL = i18n.language?.startsWith('ar');

  const [timeLeft, setTimeLeft] = useState<TimeRemaining>(() => {
    if (!inspectionPeriodEndsAt) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true };
    }
    return calculateTimeRemaining(new Date(inspectionPeriodEndsAt));
  });

  useEffect(() => {
    if (!inspectionPeriodEndsAt) {
      setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true });
      return;
    }

    const target = new Date(inspectionPeriodEndsAt);
    if (isNaN(target.getTime())) {
      setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true });
      return;
    }

    setTimeLeft(calculateTimeRemaining(target));

    const interval = setInterval(() => {
      const remaining = calculateTimeRemaining(target);
      setTimeLeft(remaining);
      if (remaining.isExpired) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [inspectionPeriodEndsAt]);

  const padZero = (n: number) => (n < 10 ? `0${n}` : `${n}`);

  // When expired
  if (timeLeft.isExpired) {
    return (
      <div
        className={cn(
          'rounded-3xl p-5 sm:p-6 bg-slate-50 dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 space-y-3',
          className
        )}
      >
        <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
              {t('inspection.expiredTitle', 'انتهت مهلة الفحص والمعاينة')}
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              {t(
                'inspection.expiredDesc',
                'انتهت فترة الـ ٧ أيام المحددة للمعاينة. سيقوم النظام بتحرير المبلغ تلقائياً لحساب البائع.'
              )}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Urgent if less than 24 hours
  const isUrgent = timeLeft.days === 0 && timeLeft.hours < 24;

  const timeBlocks = [
    {
      value: timeLeft.days,
      label: t('inspection.units.days', 'يوم'),
    },
    {
      value: timeLeft.hours,
      label: t('inspection.units.hours', 'ساعة'),
    },
    {
      value: timeLeft.minutes,
      label: t('inspection.units.minutes', 'دقيقة'),
    },
    {
      value: timeLeft.seconds,
      label: t('inspection.units.seconds', 'ثانية'),
    },
  ];

  const durationDays = Math.round(inspectionDurationHours / 24);

  return (
    <div
      className={cn(
        'group rounded-3xl p-5 sm:p-6 transition-all duration-300 shadow-sm',
        isUrgent
          ? 'bg-rose-500/5 dark:bg-rose-950/20 border border-rose-300/60 dark:border-rose-800/60'
          : 'bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 hover:border-amber-500/40',
        className
      )}
    >
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              'w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-sm',
              isUrgent
                ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 animate-pulse'
                : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
            )}
          >
            {isUrgent ? <AlertTriangle className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
          </div>
          <div>
            <h4 className="text-sm sm:text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
              <span>{t('inspection.title', 'المهلة المتبقية للمعاينة والفحص')}</span>
              {isUrgent && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-500 text-white animate-pulse">
                  {t('inspection.urgentBadge', 'أوشكت على الانتهاء')}
                </span>
              )}
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {t('inspection.windowSubtitle', {
                days: toLocalizedDigits(durationDays, isRTL),
                defaultValue: `لديك مهلة فحص كاملة مدتها ${toLocalizedDigits(
                  durationDays,
                  isRTL
                )} أيام قبل التحرير التلقائي`,
              })}
            </p>
          </div>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold self-start sm:self-auto">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>{t('inspection.protectionGuarantee', 'حماية الضمان مفعلة')}</span>
        </div>
      </div>

      {/* Countdown Digits Grid */}
      <div className="grid grid-cols-4 gap-2 sm:gap-4 pt-4">
        {timeBlocks.map((block, idx) => (
          <div
            key={idx}
            className={cn(
              'flex flex-col items-center justify-center py-2.5 sm:py-3.5 px-2 rounded-2xl border text-center transition-all',
              isUrgent
                ? 'bg-rose-50/60 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900/60'
                : 'bg-slate-50/80 dark:bg-slate-800/50 border-slate-100 dark:border-slate-800 group-hover:border-amber-500/20'
            )}
          >
            <span
              className={cn(
                'text-xl sm:text-2xl md:text-3xl font-black font-mono tracking-tight',
                isUrgent
                  ? 'text-rose-600 dark:text-rose-400'
                  : 'text-slate-900 dark:text-white'
              )}
            >
              {toLocalizedDigits(padZero(block.value), isRTL)}
            </span>
            <span className="text-[10px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 mt-0.5">
              {block.label}
            </span>
          </div>
        ))}
      </div>

      {/* Helper text */}
      <div className="mt-3.5 text-center sm:text-start text-[11px] text-slate-400 dark:text-slate-500">
        {t(
          'inspection.instruction',
          'يمكنك معاينة وفحص السلعة خلال هذه المهلة، ثم الضغط على "تأكيد الاستلام" لتحرير المبلغ للبائع أو فتح نزاع في حال وجود مشكلة.'
        )}
      </div>
    </div>
  );
};
