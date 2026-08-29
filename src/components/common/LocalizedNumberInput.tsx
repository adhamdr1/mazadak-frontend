import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/utils/cn';
import { toLocalizedDigits, normalizeArabicDigits } from '@/utils/formatters';

export interface LocalizedNumberInputProps {
  id: string;
  label: string;
  value?: number;
  placeholder?: string;
  suffix?: string;
  error?: string;
  onChange: (val: number) => void;
  className?: string;
}

export const LocalizedNumberInput: React.FC<LocalizedNumberInputProps> = ({
  id,
  label,
  value,
  placeholder,
  suffix,
  error,
  onChange,
  className,
}) => {
  const { t } = useTranslation('auctions');
  const { i18n } = useTranslation();
  const isRTL = i18n.language?.startsWith('ar');

  const [rawText, setRawText] = useState<string>(() => {
    if (value !== undefined && value !== null && !isNaN(value) && value > 0) {
      return isRTL ? toLocalizedDigits(value, true) : String(value);
    }
    return '';
  });

  // Re-synchronize display string when value changes OR when language switches between AR and EN
  useEffect(() => {
    if (value !== undefined && value !== null && !isNaN(value) && value > 0) {
      setRawText(isRTL ? toLocalizedDigits(value, true) : String(value));
    } else if (value === undefined || value === null || isNaN(value)) {
      setRawText('');
    }
  }, [value, isRTL]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;

    // If input is cleared
    if (!text.trim()) {
      setRawText('');
      onChange(0);
      return;
    }

    // Normalize any Eastern Arabic digits (٠-٩) to Western (0-9)
    const normalized = normalizeArabicDigits(text);
    // Keep only numbers and optional single decimal point
    const cleaned = normalized.replace(/[^0-9.]/g, '');

    if (!cleaned) {
      setRawText('');
      onChange(0);
      return;
    }

    const numeric = parseFloat(cleaned);
    if (!isNaN(numeric)) {
      setRawText(isRTL ? toLocalizedDigits(cleaned, true) : cleaned);
      onChange(numeric);
    }
  };

  const inputBaseClass =
    'w-full text-sm rounded-2xl border bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 p-3.5 pe-12 font-bold font-mono outline-none focus:outline-none ring-0 focus:ring-0 transition-all duration-150 shadow-sm';

  const localizedErrorMessage = error
    ? t(error, { ns: 'auctions', defaultValue: t(error, { defaultValue: error }) })
    : null;

  return (
    <div className={cn('space-y-1.5 w-full', className)}>
      <label htmlFor={id} className="block text-xs font-bold text-slate-700 dark:text-slate-300">
        {label} *
      </label>

      <div className="relative">
        <input
          id={id}
          type="text"
          dir={isRTL ? 'rtl' : 'ltr'}
          inputMode="numeric"
          value={rawText}
          placeholder={placeholder || (isRTL ? '٥٠٠' : '500')}
          onChange={handleChange}
          className={cn(
            inputBaseClass,
            'text-start',
            error
              ? 'border-red-500 focus:border-red-500'
              : 'border-slate-200/90 dark:border-slate-700/90 focus:border-amber-500 dark:focus:border-amber-500 hover:border-slate-300 dark:hover:border-slate-600'
          )}
        />
        {suffix && (
          <span className="absolute end-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 select-none pointer-events-none">
            {suffix}
          </span>
        )}
      </div>

      {localizedErrorMessage && (
        <p className="text-xs text-red-500 font-semibold animate-fadeIn">
          {localizedErrorMessage}
        </p>
      )}
    </div>
  );
};

export default LocalizedNumberInput;
