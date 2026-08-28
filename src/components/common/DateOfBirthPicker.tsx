import React, { useRef, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '@/utils/cn';

export interface DateOfBirthPickerProps {
  id?: string;
  label?: string;
  error?: string;
  value?: string; // ISO format "YYYY-MM-DD"
  onChange: (value: string) => void;
  className?: string;
}

export const DateOfBirthPicker: React.FC<DateOfBirthPickerProps> = ({
  id = 'dateOfBirth',
  label,
  error,
  value,
  onChange,
  className,
}) => {
  const { t, i18n } = useTranslation('auth');
  const isRTL = i18n.language.startsWith('ar');
  const hiddenDateInputRef = useRef<HTMLInputElement>(null);

  // Display value in "DD / MM / YYYY" format
  const [displayValue, setDisplayValue] = useState<string>('');

  // Calculate max allowed date for 18+ years constraint
  const today = new Date();
  const maxYear = today.getFullYear() - 18;
  const maxMonth = String(today.getMonth() + 1).padStart(2, '0');
  const maxDay = String(today.getDate()).padStart(2, '0');
  const maxEligibleIsoDate = `${maxYear}-${maxMonth}-${maxDay}`;

  // Synchronize incoming ISO "YYYY-MM-DD" with "DD / MM / YYYY" display
  useEffect(() => {
    if (value && value.includes('-')) {
      const parts = value.split('-');
      if (parts.length === 3) {
        const [y, m, d] = parts;
        setDisplayValue(`${d} / ${m} / ${y}`);
        return;
      }
    }
    if (!value) {
      setDisplayValue('');
    }
  }, [value]);

  // Format typed numeric input to "DD / MM / YYYY" mask
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawInput = e.target.value;
    // Strip all non-digit characters
    const digits = rawInput.replace(/\D/g, '').slice(0, 8);

    let formatted = '';
    if (digits.length > 0) {
      formatted = digits.slice(0, 2);
    }
    if (digits.length >= 3) {
      formatted += ` / ${digits.slice(2, 4)}`;
    }
    if (digits.length >= 5) {
      formatted += ` / ${digits.slice(4, 8)}`;
    }

    setDisplayValue(formatted);

    // If fully entered (8 digits: DDMMYYYY), emit ISO string YYYY-MM-DD
    if (digits.length === 8) {
      const day = digits.slice(0, 2);
      const month = digits.slice(2, 4);
      const year = digits.slice(4, 8);

      const dNum = parseInt(day, 10);
      const mNum = parseInt(month, 10);
      const yNum = parseInt(year, 10);

      // Basic sanity check for valid calendar date
      if (dNum >= 1 && dNum <= 31 && mNum >= 1 && mNum <= 12 && yNum >= 1900 && yNum <= maxYear + 10) {
        onChange(`${year}-${month}-${day}`);
      } else {
        onChange('');
      }
    } else {
      onChange('');
    }
  };

  // When native date picker is used via calendar icon
  const handleNativePickerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedIso = e.target.value; // "YYYY-MM-DD"
    if (selectedIso) {
      onChange(selectedIso);
      const [y, m, d] = selectedIso.split('-');
      setDisplayValue(`${d} / ${m} / ${y}`);
    }
  };

  const openNativeCalendar = () => {
    if (hiddenDateInputRef.current) {
      if ('showPicker' in HTMLInputElement.prototype) {
        try {
          hiddenDateInputRef.current.showPicker();
        } catch {
          hiddenDateInputRef.current.focus();
        }
      } else {
        hiddenDateInputRef.current.focus();
      }
    }
  };

  return (
    <div className={cn('flex flex-col gap-1.5 w-full', className)}>
      {label && (
        <label
          htmlFor={id}
          className="text-xs font-medium text-slate-700 dark:text-slate-300 select-none flex items-center justify-between"
        >
          <span className="flex items-center gap-1.5">
            <CalendarIcon className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
            {label}
          </span>
          <span className="text-[11px] text-slate-400 font-mono">
            {t('register.dobFormatPlaceholder')}
          </span>
        </label>
      )}

      <div className="relative flex items-center">
        {/* Main Styled Masked Input (DD / MM / YYYY) */}
        <input
          id={id}
          type="text"
          inputMode="numeric"
          placeholder={isRTL ? 'DD / MM / YYYY' : 'DD / MM / YYYY'}
          value={displayValue}
          onChange={handleInputChange}
          className={cn(
            'w-full text-sm rounded-xl border bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 transition-colors py-2.5 px-3.5 pe-11 font-mono tracking-wider focus:outline-none placeholder:text-slate-400 dark:placeholder:text-slate-600',
            error
              ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
              : 'border-slate-300 dark:border-slate-700 focus:border-amber-500 dark:focus:border-amber-400 focus:ring-2 focus:ring-amber-500/20'
          )}
        />

        {/* Calendar Picker Trigger Button */}
        <button
          type="button"
          onClick={openNativeCalendar}
          tabIndex={-1}
          aria-label={t('register.openCalendar')}
          className={cn(
            'absolute inset-y-0 flex items-center justify-center w-10 text-slate-400 hover:text-amber-500 dark:hover:text-amber-400 transition-colors cursor-pointer',
            isRTL ? 'left-0' : 'right-0'
          )}
        >
          <CalendarIcon className="w-4 h-4" />
        </button>

        {/* Hidden native date input for visual picker integration */}
        <input
          ref={hiddenDateInputRef}
          type="date"
          max={maxEligibleIsoDate}
          value={value || ''}
          onChange={handleNativePickerChange}
          className="sr-only"
          tabIndex={-1}
        />
      </div>

      {error && (
        <p className="text-xs text-red-500 dark:text-red-400 mt-0.5 flex items-center gap-1 font-medium animate-fadeIn">
          {i18n.exists(error) ? t(error) : error}
        </p>
      )}
    </div>
  );
};
