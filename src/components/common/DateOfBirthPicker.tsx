import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '@/utils/cn';
import { toLocalizedDigits } from '@/utils/formatters';

export interface DateOfBirthPickerProps {
  id?: string;
  label?: string;
  error?: string;
  value?: string; // ISO format "YYYY-MM-DD"
  onChange: (value: string) => void;
  className?: string;
}

/**
 * Normalizes Eastern Arabic numerals (٠-٩) and Persian numerals (۰-۹) to standard ASCII digits (0-9)
 */
function normalizeToAsciiDigits(str: string): string {
  return str
    .replace(/[\u0660-\u0669]/g, (d) => (d.charCodeAt(0) - 0x0660).toString())
    .replace(/[\u06F0-\u06F9]/g, (d) => (d.charCodeAt(0) - 0x06f0).toString());
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

  // Raw ASCII display value in "DD / MM / YYYY" format
  const [displayValue, setDisplayValue] = useState<string>('');
  const [localError, setLocalError] = useState<string | null>(null);

  const today = new Date();

  // Safely synchronize incoming ISO "YYYY-MM-DD" without destroying in-progress user typing on backspace
  useEffect(() => {
    if (value && value.includes('-')) {
      const parts = value.split('-');
      if (parts.length === 3) {
        const [y, m, d] = parts;
        const formatted = `${d} / ${m} / ${y}`;
        setDisplayValue((prev) => {
          const prevDigits = normalizeToAsciiDigits(prev).replace(/\D/g, '');
          const incomingDigits = `${d}${m}${y}`;
          return prevDigits === incomingDigits ? prev : formatted;
        });
      }
    } else if (!value && displayValue.length === 0) {
      setDisplayValue('');
    }
  }, [value, displayValue.length]);

  // Format typed numeric input to "DD / MM / YYYY" mask and validate live
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawInput = normalizeToAsciiDigits(e.target.value);
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

    // If fully entered (8 digits: DDMMYYYY), validate and emit ISO string YYYY-MM-DD
    if (digits.length === 8) {
      const day = digits.slice(0, 2);
      const month = digits.slice(2, 4);
      const year = digits.slice(4, 8);

      const dNum = parseInt(day, 10);
      const mNum = parseInt(month, 10);
      const yNum = parseInt(year, 10);

      const iso = `${year}-${month}-${day}`;
      onChange(iso);

      // Check date validity
      if (dNum < 1 || dNum > 31 || mNum < 1 || mNum > 12 || yNum < 1900) {
        setLocalError('validation.dobInvalid');
        return;
      }

      const inputDate = new Date(yNum, mNum - 1, dNum);
      if (isNaN(inputDate.getTime()) || inputDate.getTime() > today.getTime()) {
        setLocalError('validation.dobInvalid');
        return;
      }

      // Check 18+ age constraint
      let age = today.getFullYear() - inputDate.getFullYear();
      const mDiff = today.getMonth() - inputDate.getMonth();
      if (mDiff < 0 || (mDiff === 0 && today.getDate() < inputDate.getDate())) {
        age--;
      }

      if (age < 18) {
        setLocalError('validation.underage');
      } else {
        setLocalError(null);
      }
    } else {
      setLocalError(null);
      onChange('');
    }
  };

  const getTranslatedError = (err: string): string => {
    if (i18n.exists(err, { ns: 'auth' })) return t(err, { ns: 'auth' });
    if (i18n.exists(err, { ns: 'common' })) return t(err, { ns: 'common' });
    if (i18n.exists(err)) return t(err);
    return err;
  };

  const activeError = error || localError;
  const renderedDisplayValue = isRTL && displayValue ? toLocalizedDigits(displayValue, true) : displayValue;

  return (
    <div className={cn('relative flex flex-col gap-1.5 w-full', className)}>
      {label && (
        <label
          htmlFor={id}
          className="text-xs font-medium text-slate-700 dark:text-slate-300 select-none flex items-center justify-between"
        >
          <span>{label}</span>
        </label>
      )}

      <div className="relative flex items-center">
        {/* Left / Start Decorative Calendar Icon */}
        <div className="absolute start-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
          <CalendarIcon className="w-4 h-4" />
        </div>

        {/* Masked Text Input */}
        <input
          id={id}
          type="text"
          inputMode="numeric"
          dir={isRTL ? 'rtl' : 'ltr'}
          placeholder={t('register.dobFormatPlaceholder')}
          value={renderedDisplayValue}
          onChange={handleInputChange}
          className={cn(
            'w-full text-sm rounded-xl border bg-white dark:bg-slate-900/90 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 transition-all duration-150 py-2.5 px-3.5 ps-10 focus:outline-none',
            activeError
              ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
              : 'border-slate-300 dark:border-slate-700 focus:border-amber-500 dark:focus:border-amber-400 focus:ring-2 focus:ring-amber-500/20'
          )}
        />
      </div>

      {activeError && (
        <p className="text-xs text-red-500 dark:text-red-400 mt-0.5 flex items-center gap-1 font-medium animate-fadeIn">
          {getTranslatedError(activeError)}
        </p>
      )}
    </div>
  );
};

export default DateOfBirthPicker;
