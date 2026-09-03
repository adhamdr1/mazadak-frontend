import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar as CalendarIcon, Clock } from 'lucide-react';
import { cn } from '@/utils/cn';
import { toLocalizedDigits } from '@/utils/formatters';
import { CustomDateTimePickerModal } from '@/components/common/CustomDateTimePickerModal';

export interface AuctionDateTimePickerProps {
  id: string;
  label: string;
  value?: string; // ISO datetime string "YYYY-MM-DDTHH:mm"
  min?: string; // ISO datetime string "YYYY-MM-DDTHH:mm"
  error?: string;
  hint?: string;
  onChange: (isoValue: string) => void;
  className?: string;
}

export const AuctionDateTimePicker: React.FC<AuctionDateTimePickerProps> = ({
  id,
  label,
  value,
  min,
  error,
  hint,
  onChange,
  className,
}) => {
  const { t, i18n } = useTranslation('auctions');
  const isRTL = i18n.language?.startsWith('ar');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Format the ISO datetime for human-friendly localized display
  const formattedDisplay = useMemo(() => {
    if (!value) return '';
    const dateObj = new Date(value);
    if (isNaN(dateObj.getTime())) return '';

    const day = String(dateObj.getDate()).padStart(2, '0');
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const year = dateObj.getFullYear();

    let hours = dateObj.getHours();
    const minutes = String(dateObj.getMinutes()).padStart(2, '0');
    const isPM = hours >= 12;
    hours = hours % 12 || 12;
    const hoursStr = String(hours).padStart(2, '0');

    if (isRTL) {
      const period = isPM ? 'م' : 'ص';
      const dStr = toLocalizedDigits(day, true);
      const mStr = toLocalizedDigits(month, true);
      const yStr = toLocalizedDigits(year, true);
      const hStr = toLocalizedDigits(hoursStr, true);
      const minStr = toLocalizedDigits(minutes, true);
      return `${dStr} / ${mStr} / ${yStr}  —  ${hStr}:${minStr} ${period}`;
    }

    const period = isPM ? 'PM' : 'AM';
    return `${day} / ${month} / ${year}  —  ${hoursStr}:${minutes} ${period}`;
  }, [value, isRTL]);

  return (
    <div className={cn('space-y-1.5 w-full', className)}>
      <label htmlFor={id} className="block text-xs font-bold text-slate-700 dark:text-slate-300">
        {label} *
      </label>

      {/* Styled Interactive Trigger Box */}
      <button
        id={id}
        type="button"
        onClick={() => setIsModalOpen(true)}
        className={cn(
          'w-full text-sm rounded-2xl border bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 p-3.5 flex items-center justify-between cursor-pointer select-none transition-all duration-150 shadow-sm text-start outline-none focus:outline-none ring-0 focus:ring-0',
          error
            ? 'border-red-500'
            : 'border-slate-200/90 dark:border-slate-700/90 hover:border-amber-500 dark:hover:border-amber-500'
        )}
      >
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="w-7 h-7 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0 border border-amber-500/20">
            <CalendarIcon className="w-3.5 h-3.5" />
          </div>
          <span
            className={cn(
              'font-bold truncate text-xs sm:text-sm',
              formattedDisplay
                ? 'text-slate-900 dark:text-slate-100'
                : 'text-slate-400 dark:text-slate-500'
            )}
          >
            {formattedDisplay || (isRTL ? 'يوم / شهر / سنة  —  ساعة : دقيقة' : 'DD / MM / YYYY  —  HH:MM')}
          </span>
        </div>

        <div className="flex items-center gap-1 text-slate-400 dark:text-slate-500 shrink-0">
          <Clock className="w-4 h-4" />
        </div>
      </button>

      {/* 100% Custom Dedicated DateTime Picker Modal */}
      <CustomDateTimePickerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        value={value}
        min={min}
        title={label}
        onConfirm={(newIso) => {
          onChange(newIso);
        }}
      />

      {error ? (
        <p className="text-xs text-red-500 font-semibold animate-fadeIn">
          {t(error, { ns: 'auctions', defaultValue: t(error, { defaultValue: error }) })}
        </p>
      ) : hint ? (
        <p className="text-[11px] text-slate-400 dark:text-slate-500 leading-normal">
          {hint}
        </p>
      ) : null}
    </div>
  );
};

export default AuctionDateTimePicker;
