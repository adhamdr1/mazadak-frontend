import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  X,
} from 'lucide-react';
import { normalizeArabicDigits, toLocalizedDigits } from '@/utils/formatters';
import { cn } from '@/utils/cn';

export interface DatePickerProps {
  label?: string;
  value?: string; // YYYY-MM-DD
  min?: string; // YYYY-MM-DD
  max?: string; // YYYY-MM-DD
  onChange: (value?: string) => void;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  className?: string;
}

const AR_MONTHS = [
  'يناير',
  'فبراير',
  'مارس',
  'أبريل',
  'مايو',
  'يونيو',
  'يوليو',
  'أغسطس',
  'سبتمبر',
  'أكتوبر',
  'نوفمبر',
  'ديسمبر',
];

const EN_MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const AR_WEEKDAYS = ['أحد', 'إثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت'];
const EN_WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

/**
 * Parses user input (ISO YYYY-MM-DD or DD/MM/YYYY or DD-MM-YYYY) into a valid ISO YYYY-MM-DD string
 */
const parseInputToIso = (text: string): string | null => {
  const normalized = normalizeArabicDigits(text.trim()).replace(/[^\d\-/.]/g, '');
  if (!normalized) return null;

  // Pattern 1: YYYY-MM-DD or YYYY/MM/DD
  const ymdMatch = normalized.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})$/);
  if (ymdMatch) {
    const y = parseInt(ymdMatch[1], 10);
    const m = parseInt(ymdMatch[2], 10);
    const d = parseInt(ymdMatch[3], 10);
    if (m >= 1 && m <= 12) {
      const maxDays = new Date(y, m, 0).getDate();
      if (d >= 1 && d <= maxDays) {
        return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      }
    }
  }

  // Pattern 2: DD/MM/YYYY or DD-MM-YYYY
  const dmyMatch = normalized.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})$/);
  if (dmyMatch) {
    const d = parseInt(dmyMatch[1], 10);
    const m = parseInt(dmyMatch[2], 10);
    const y = parseInt(dmyMatch[3], 10);
    if (m >= 1 && m <= 12) {
      const maxDays = new Date(y, m, 0).getDate();
      if (d >= 1 && d <= maxDays) {
        return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      }
    }
  }

  return null;
};

export const DatePicker: React.FC<DatePickerProps> = ({
  label,
  value,
  min,
  max,
  onChange,
  placeholder,
  error,
  disabled = false,
  className,
}) => {
  const { i18n } = useTranslation('common');
  const isRTL = i18n.language?.startsWith('ar');

  // Lock future dates: effectiveMax is capped at today unless otherwise restricted
  const todayStr = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const effectiveMax = useMemo(() => {
    if (!max) return todayStr;
    return max < todayStr ? max : todayStr;
  }, [max, todayStr]);
  const effectiveMin = min;

  const [isOpen, setIsOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'days' | 'months' | 'years'>('days');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Parse initial view date from value or today
  const initialDate = value ? new Date(value) : new Date();
  const validInitialDate = isNaN(initialDate.getTime()) ? new Date() : initialDate;

  const [viewYear, setViewYear] = useState(validInitialDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(validInitialDate.getMonth());

  // Format display text DD / MM / YYYY
  const formatDisplayDate = useCallback(
    (valStr?: string): string => {
      if (!valStr) return '';
      const parts = valStr.split('-');
      if (parts.length !== 3) return valStr;
      const [y, m, d] = parts;
      const formatted = `${d} / ${m} / ${y}`;
      return isRTL ? toLocalizedDigits(formatted, true) : formatted;
    },
    [isRTL]
  );

  // Local text input state for typing
  const [typedText, setTypedText] = useState<string>(() => formatDisplayDate(value));
  const [isInputFocused, setIsInputFocused] = useState(false);

  // Close calendar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setViewMode('days');
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Sync view & typed text when external value or language changes
  useEffect(() => {
    if (!isInputFocused) {
      setTypedText(formatDisplayDate(value));
    }
    if (value) {
      const d = new Date(value);
      if (!isNaN(d.getTime())) {
        setViewYear(d.getFullYear());
        setViewMonth(d.getMonth());
      }
    }
  }, [value, isInputFocused, formatDisplayDate]);

  // Available years for fast jump (bounded strictly between effectiveMin and effectiveMax)
  const currentYearNum = new Date().getFullYear();
  const availableYears = useMemo(() => {
    const years: number[] = [];
    const minYear = effectiveMin ? parseInt(effectiveMin.slice(0, 4), 10) : 2020;
    const maxYear = effectiveMax ? parseInt(effectiveMax.slice(0, 4), 10) : currentYearNum;
    for (let y = maxYear; y >= minYear; y--) {
      years.push(y);
    }
    return years;
  }, [effectiveMin, effectiveMax, currentYearNum]);

  // Boundaries for month navigation
  const canGoPrevMonth = useMemo(() => {
    if (!effectiveMin) return true;
    const [minY, minM] = effectiveMin.split('-').map(Number);
    if (viewYear < minY) return false;
    if (viewYear === minY && viewMonth <= minM - 1) return false;
    return true;
  }, [effectiveMin, viewYear, viewMonth]);

  const canGoNextMonth = useMemo(() => {
    if (!effectiveMax) return true;
    const [maxY, maxM] = effectiveMax.split('-').map(Number);
    if (viewYear > maxY) return false;
    if (viewYear === maxY && viewMonth >= maxM - 1) return false;
    return true;
  }, [effectiveMax, viewYear, viewMonth]);

  // Helper to check if a month in the month picker grid is disabled
  const isMonthDisabled = useCallback(
    (monthIdx: number) => {
      if (effectiveMin) {
        const [minY, minM] = effectiveMin.split('-').map(Number);
        if (viewYear < minY) return true;
        if (viewYear === minY && monthIdx < minM - 1) return true;
      }
      if (effectiveMax) {
        const [maxY, maxM] = effectiveMax.split('-').map(Number);
        if (viewYear > maxY) return true;
        if (viewYear === maxY && monthIdx > maxM - 1) return true;
      }
      return false;
    },
    [effectiveMin, effectiveMax, viewYear]
  );

  // Clamp view to effectiveMin / effectiveMax if current view is out of bounds
  useEffect(() => {
    if (effectiveMin) {
      const [minY, minM] = effectiveMin.split('-').map(Number);
      if (viewYear < minY || (viewYear === minY && viewMonth < minM - 1)) {
        setViewYear(minY);
        setViewMonth(minM - 1);
      }
    }
    if (effectiveMax) {
      const [maxY, maxM] = effectiveMax.split('-').map(Number);
      if (viewYear > maxY || (viewYear === maxY && viewMonth > maxM - 1)) {
        setViewYear(maxY);
        setViewMonth(maxM - 1);
      }
    }
  }, [effectiveMin, effectiveMax, viewYear, viewMonth]);

  const handlePrevMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!canGoPrevMonth) return;
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((prev) => prev - 1);
    } else {
      setViewMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!canGoNextMonth) return;
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((prev) => prev + 1);
    } else {
      setViewMonth((prev) => prev + 1);
    }
  };

  const handleSelectDay = (day: number) => {
    const mm = String(viewMonth + 1).padStart(2, '0');
    const dd = String(day).padStart(2, '0');
    const formatted = `${viewYear}-${mm}-${dd}`;
    onChange(formatted);
    setTypedText(formatDisplayDate(formatted));
    setIsOpen(false);
    setViewMode('days');
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(undefined);
    setTypedText('');
  };

  const handleSelectToday = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(todayStr);
    setTypedText(formatDisplayDate(todayStr));
    const today = new Date();
    setViewYear(today.getFullYear());
    setViewMonth(today.getMonth());
    setIsOpen(false);
    setViewMode('days');
  };

  // Typing Handler
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    setTypedText(raw);

    const parsedIso = parseInputToIso(raw);
    if (parsedIso) {
      const isOutOfBounds =
        (effectiveMin && parsedIso < effectiveMin) ||
        (effectiveMax && parsedIso > effectiveMax);

      if (!isOutOfBounds) {
        onChange(parsedIso);
        const d = new Date(parsedIso);
        if (!isNaN(d.getTime())) {
          setViewYear(d.getFullYear());
          setViewMonth(d.getMonth());
        }
      }
    } else if (raw.trim() === '') {
      onChange(undefined);
    }
  };

  const handleInputBlur = () => {
    setIsInputFocused(false);
    if (!typedText.trim()) {
      onChange(undefined);
      setTypedText('');
      return;
    }

    const parsedIso = parseInputToIso(typedText);
    if (parsedIso) {
      const isOutOfBounds =
        (effectiveMin && parsedIso < effectiveMin) ||
        (effectiveMax && parsedIso > effectiveMax);

      if (!isOutOfBounds) {
        onChange(parsedIso);
        setTypedText(formatDisplayDate(parsedIso));
        return;
      }
    }

    // Reset to existing valid value
    setTypedText(formatDisplayDate(value));
  };

  // Calendar Grid Calculations
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay(); // 0 = Sunday
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

  const months = isRTL ? AR_MONTHS : EN_MONTHS;
  const weekdays = isRTL ? AR_WEEKDAYS : EN_WEEKDAYS;

  const PrevIcon = isRTL ? ChevronRight : ChevronLeft;
  const NextIcon = isRTL ? ChevronLeft : ChevronRight;

  const defaultPlaceholder = isRTL ? 'يوم / شهر / سنة' : 'DD / MM / YYYY';

  return (
    <div ref={containerRef} className={cn('relative space-y-1.5 text-start', className)}>
      {label && (
        <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400">
          {label}
        </label>
      )}

      {/* Input Field with Calendar Trigger & Clear */}
      <div
        className={cn(
          'relative w-full flex items-center justify-between rounded-xl border text-xs font-semibold transition-all duration-150 shadow-2xs',
          'bg-white dark:bg-slate-900',
          disabled && 'opacity-50 pointer-events-none',
          error
            ? 'border-rose-500 ring-2 ring-rose-500/20'
            : isOpen || isInputFocused
            ? 'border-amber-500 ring-2 ring-amber-500/20 dark:border-amber-500'
            : value
            ? 'border-amber-500/70 dark:border-amber-500/50 text-slate-900 dark:text-slate-100'
            : 'border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500 hover:border-amber-500/50'
        )}
      >
        {/* Calendar Icon Button */}
        <button
          type="button"
          disabled={disabled}
          onClick={() => {
            setIsOpen((prev) => !prev);
            setViewMode('days');
          }}
          className="ps-3 pe-1.5 py-2 text-amber-500 hover:text-amber-600 dark:hover:text-amber-400 cursor-pointer shrink-0 transition-colors"
          title={isRTL ? 'فتح التقويم' : 'Open Calendar'}
        >
          <CalendarIcon className="w-3.5 h-3.5" />
        </button>

        {/* Editable Input */}
        <input
          ref={inputRef}
          type="text"
          disabled={disabled}
          value={typedText}
          onChange={handleInputChange}
          onFocus={() => {
            setIsInputFocused(true);
            setIsOpen(true);
            setViewMode('days');
          }}
          onBlur={handleInputBlur}
          placeholder={placeholder || defaultPlaceholder}
          className="w-full py-2 px-1 text-xs font-mono font-semibold bg-transparent text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none focus:outline-none"
        />

        {/* Clear Button (only when value or text exists) */}
        {(value || typedText) && !disabled && (
          <button
            type="button"
            onClick={handleClear}
            className="p-1 me-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer shrink-0"
            title={isRTL ? 'مسح التاريخ' : 'Clear Date'}
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Error Message if provided */}
      {error && <p className="text-[11px] font-semibold text-rose-500 pt-0.5">{error}</p>}

      {/* Custom Popup Calendar */}
      {isOpen && !disabled && (
        <div
          className={cn(
            'absolute z-50 mt-1.5 inset-x-0 sm:w-80 p-3.5 rounded-2xl select-none',
            'bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800',
            'shadow-xl shadow-slate-900/10 dark:shadow-black/50 backdrop-blur-md',
            'animate-in fade-in-0 zoom-in-95 duration-100'
          )}
        >
          {/* Header Navigation with Custom Interactive Pills */}
          <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-slate-100 dark:border-slate-800 gap-2">
            {viewMode === 'days' ? (
              <>
                <button
                  type="button"
                  disabled={!canGoPrevMonth}
                  onClick={handlePrevMonth}
                  className={cn(
                    'p-1.5 rounded-lg transition-colors shrink-0',
                    !canGoPrevMonth
                      ? 'text-slate-300 dark:text-slate-700 cursor-default opacity-30'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer'
                  )}
                  title={isRTL ? 'الشهر السابق' : 'Previous Month'}
                >
                  <PrevIcon className="w-4 h-4" />
                </button>

                {/* Custom Month & Year Interactive Dropdown Trigger Pills */}
                <div className="flex items-center gap-1.5">
                  {/* Month Pill */}
                  <button
                    type="button"
                    onClick={() => setViewMode('months')}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-amber-500/15 hover:text-amber-600 dark:hover:text-amber-400 border border-slate-200/60 dark:border-slate-700/60 transition-colors cursor-pointer"
                  >
                    <span>{months[viewMonth]}</span>
                    <ChevronDown className="w-3 h-3 text-slate-400" />
                  </button>

                  {/* Year Pill */}
                  <button
                    type="button"
                    onClick={() => setViewMode('years')}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold font-mono text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-amber-500/15 hover:text-amber-600 dark:hover:text-amber-400 border border-slate-200/60 dark:border-slate-700/60 transition-colors cursor-pointer"
                  >
                    <span>{isRTL ? toLocalizedDigits(viewYear, true) : viewYear}</span>
                    <ChevronDown className="w-3 h-3 text-slate-400" />
                  </button>
                </div>

                <button
                  type="button"
                  disabled={!canGoNextMonth}
                  onClick={handleNextMonth}
                  className={cn(
                    'p-1.5 rounded-lg transition-colors shrink-0',
                    !canGoNextMonth
                      ? 'text-slate-300 dark:text-slate-700 cursor-default opacity-30'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer'
                  )}
                  title={isRTL ? 'الشهر التالي' : 'Next Month'}
                >
                  <NextIcon className="w-4 h-4" />
                </button>
              </>
            ) : (
              /* Sub-view Header (Month Picker or Year Picker) */
              <div className="w-full flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  {viewMode === 'months'
                    ? isRTL
                      ? `اختر الشهر (${toLocalizedDigits(viewYear, true)})`
                      : `Select Month (${viewYear})`
                    : isRTL
                    ? 'اختر السنة'
                    : 'Select Year'}
                </span>

                <button
                  type="button"
                  onClick={() => setViewMode('days')}
                  className="px-2 py-0.5 rounded-md text-[11px] font-semibold text-amber-600 dark:text-amber-400 hover:bg-amber-500/10 transition-colors cursor-pointer"
                >
                  {isRTL ? 'الرجوع للأيام' : 'Back to Days'}
                </button>
              </div>
            )}
          </div>

          {/* VIEW 1: DAYS VIEW */}
          {viewMode === 'days' && (
            <>
              {/* Weekday Headers */}
              <div className="grid grid-cols-7 gap-1 text-center mb-1.5">
                {weekdays.map((dayName, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] font-bold text-slate-400 dark:text-slate-500 py-1"
                  >
                    {dayName}
                  </span>
                ))}
              </div>

              {/* Days Grid */}
              <div className="grid grid-cols-7 gap-1 text-center">
                {/* Previous Month trailing days */}
                {[...Array(firstDayOfWeek)].map((_, idx) => {
                  const dayNum = daysInPrevMonth - firstDayOfWeek + idx + 1;
                  return (
                    <span
                      key={`prev-${idx}`}
                      className="p-1.5 text-xs text-slate-300 dark:text-slate-600 font-mono select-none"
                    >
                      {isRTL ? toLocalizedDigits(dayNum, true) : dayNum}
                    </span>
                  );
                })}

                {/* Current Month days */}
                {[...Array(daysInMonth)].map((_, idx) => {
                  const day = idx + 1;
                  const mm = String(viewMonth + 1).padStart(2, '0');
                  const dd = String(day).padStart(2, '0');
                  const dateIso = `${viewYear}-${mm}-${dd}`;

                  const isSelected = value === dateIso;

                  const isDisabledMin = effectiveMin ? dateIso < effectiveMin : false;
                  const isDisabledMax = effectiveMax ? dateIso > effectiveMax : false;
                  const isDisabled = isDisabledMin || isDisabledMax;

                  return (
                    <button
                      key={day}
                      type="button"
                      disabled={isDisabled}
                      onClick={() => handleSelectDay(day)}
                      className={cn(
                        'p-1.5 text-xs font-semibold rounded-lg font-mono transition-all select-none',
                        isSelected
                          ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                          : isDisabled
                          ? 'text-slate-300 dark:text-slate-700 cursor-default opacity-40'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white cursor-pointer'
                      )}
                    >
                      {isRTL ? toLocalizedDigits(day, true) : day}
                    </button>
                  );
                })}
              </div>

              {/* Footer Quick Action Buttons */}
              <div className="pt-2.5 mt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                {(() => {
                  const isTodayDisabled = Boolean(
                    (effectiveMin && todayStr < effectiveMin) ||
                    (effectiveMax && todayStr > effectiveMax)
                  );
                  return (
                    <button
                      type="button"
                      disabled={isTodayDisabled}
                      onClick={handleSelectToday}
                      className={cn(
                        'text-[11px] font-bold transition-colors',
                        isTodayDisabled
                          ? 'text-slate-300 dark:text-slate-700 cursor-default opacity-30'
                          : 'text-amber-600 dark:text-amber-400 hover:underline cursor-pointer'
                      )}
                    >
                      {isRTL ? 'اليوم' : 'Today'}
                    </button>
                  );
                })()}

                {value && (
                  <button
                    type="button"
                    onClick={handleClear}
                    className="text-[11px] font-medium text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:underline cursor-pointer"
                  >
                    {isRTL ? 'إلغاء التحديد' : 'Clear'}
                  </button>
                )}
              </div>
            </>
          )}

          {/* VIEW 2: MONTHS PICKER GRID */}
          {viewMode === 'months' && (
            <div className="grid grid-cols-3 gap-2 py-1">
              {months.map((mName, idx) => {
                const isCurrentMonth = viewMonth === idx;
                const isDisabled = isMonthDisabled(idx);
                return (
                  <button
                    key={idx}
                    type="button"
                    disabled={isDisabled}
                    onClick={() => {
                      if (isDisabled) return;
                      setViewMonth(idx);
                      setViewMode('days');
                    }}
                    className={cn(
                      'py-2 px-2 rounded-xl text-xs font-bold transition-all select-none text-center',
                      isCurrentMonth
                        ? 'bg-amber-500 text-slate-950 shadow-xs'
                        : isDisabled
                        ? 'text-slate-300 dark:text-slate-700 cursor-default opacity-30 bg-slate-50/50 dark:bg-slate-800/30'
                        : 'bg-slate-50 dark:bg-slate-800/70 text-slate-700 dark:text-slate-300 hover:bg-amber-500/15 hover:text-amber-600 dark:hover:text-amber-400 cursor-pointer'
                    )}
                  >
                    {mName}
                  </button>
                );
              })}
            </div>
          )}

          {/* VIEW 3: YEARS PICKER GRID */}
          {viewMode === 'years' && (
            <div className="grid grid-cols-3 gap-2 py-1 max-h-56 overflow-y-auto pr-1">
              {availableYears.map((yr) => {
                const isCurrentYear = viewYear === yr;
                return (
                  <button
                    key={yr}
                    type="button"
                    onClick={() => {
                      setViewYear(yr);
                      setViewMode('days');
                    }}
                    className={cn(
                      'py-2 px-2 rounded-xl text-xs font-bold font-mono transition-all cursor-pointer select-none text-center',
                      isCurrentYear
                        ? 'bg-amber-500 text-slate-950 shadow-xs'
                        : 'bg-slate-50 dark:bg-slate-800/70 text-slate-700 dark:text-slate-300 hover:bg-amber-500/15 hover:text-amber-600 dark:hover:text-amber-400'
                    )}
                  >
                    {isRTL ? toLocalizedDigits(yr, true) : yr}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DatePicker;
