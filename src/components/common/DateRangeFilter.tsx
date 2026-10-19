import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar as CalendarIcon, ChevronDown, X, Check, Clock } from 'lucide-react';
import { cn } from '@/utils/cn';
import { toLocalizedDigits } from '@/utils/formatters';
import { DatePicker } from '@/components/common/DatePicker';

export interface DateRangeValue {
  startDate?: string; // YYYY-MM-DD
  endDate?: string;   // YYYY-MM-DD
}

export interface DateRangeFilterProps {
  startDate?: string;
  endDate?: string;
  onChange: (range: DateRangeValue) => void;
  className?: string;
  placeholder?: string;
  ariaLabel?: string;
}

export const DateRangeFilter: React.FC<DateRangeFilterProps> = ({
  startDate,
  endDate,
  onChange,
  className,
  placeholder,
  ariaLabel,
}) => {
  const { t, i18n } = useTranslation(['admin', 'common']);
  const isRTL = i18n.language?.startsWith('ar');

  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Local state inside popover before applying
  const [localStart, setLocalStart] = useState<string>(startDate || '');
  const [localEnd, setLocalEnd] = useState<string>(endDate || '');

  // Synchronize local state with props when opening or when props change
  useEffect(() => {
    setLocalStart(startDate || '');
    setLocalEnd(endDate || '');
  }, [startDate, endDate, isOpen]);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Format YYYY-MM-DD to DD/MM/YYYY for friendly badge display
  const formatDateSnippet = useCallback(
    (isoDate?: string): string => {
      if (!isoDate) return '';
      const parts = isoDate.split('-');
      if (parts.length !== 3) return isoDate;
      const [y, m, d] = parts;
      const formatted = `${d}/${m}/${y.slice(2)}`;
      return isRTL ? toLocalizedDigits(formatted, true) : formatted;
    },
    [isRTL]
  );

  // Helper date calculations for presets
  const todayStr = useMemo(() => new Date().toISOString().slice(0, 10), []);

  const getPastDateStr = useCallback((daysAgo: number): string => {
    const d = new Date();
    d.setDate(d.getDate() - daysAgo);
    return d.toISOString().slice(0, 10);
  }, []);

  const getStartOfMonthStr = useCallback((): string => {
    const d = new Date();
    d.setDate(1);
    return d.toISOString().slice(0, 10);
  }, []);

  const isFiltered = Boolean(startDate || endDate);

  // Computed label for the trigger button (Full format for Tablet & Desktop)
  const triggerLabel = useMemo(() => {
    if (startDate && endDate) {
      if (startDate === endDate) {
        return formatDateSnippet(startDate);
      }
      return `${formatDateSnippet(startDate)} - ${formatDateSnippet(endDate)}`;
    }
    if (startDate) {
      return isRTL ? `من: ${formatDateSnippet(startDate)}` : `From: ${formatDateSnippet(startDate)}`;
    }
    if (endDate) {
      return isRTL ? `حتى: ${formatDateSnippet(endDate)}` : `To: ${formatDateSnippet(endDate)}`;
    }
    return placeholder || t('common.dateRange', { defaultValue: isRTL ? 'الفترة الزمنية' : 'Date Range' });
  }, [startDate, endDate, formatDateSnippet, isRTL, placeholder, t]);

  // Smart compact label for mobile screens (< sm) to prevent truncation of end date
  const compactTriggerLabel = useMemo(() => {
    if (startDate && endDate) {
      if (startDate === endDate) {
        return formatDateSnippet(startDate);
      }
      const startParts = startDate.split('-');
      const endParts = endDate.split('-');
      if (startParts.length === 3 && endParts.length === 3) {
        const [startY, startM, startD] = startParts;
        const [endY, endM, endD] = endParts;

        // Case A: Same year and same month (e.g. 01 - 15/10) - 90% of use cases
        if (startY === endY && startM === endM) {
          const raw = `${startD} - ${endD}/${endM}`;
          return isRTL ? toLocalizedDigits(raw, true) : raw;
        }

        // Case B: Same year, different months (e.g. 20/09 - 15/10)
        if (startY === endY) {
          const raw = `${startD}/${startM} - ${endD}/${endM}`;
          return isRTL ? toLocalizedDigits(raw, true) : raw;
        }

        // Case C: Different years (e.g. 25/12/26 - 05/01/27)
        const raw = `${startD}/${startM}/${startY.slice(2)} - ${endD}/${endM}/${endY.slice(2)}`;
        return isRTL ? toLocalizedDigits(raw, true) : raw;
      }
      return `${formatDateSnippet(startDate)} - ${formatDateSnippet(endDate)}`;
    }
    if (startDate) {
      const parts = startDate.split('-');
      if (parts.length === 3) {
        const [, m, d] = parts;
        const raw = `${d}/${m}`;
        const localized = isRTL ? toLocalizedDigits(raw, true) : raw;
        return isRTL ? `من ${localized}` : `From ${localized}`;
      }
      return isRTL ? `من: ${formatDateSnippet(startDate)}` : `From: ${formatDateSnippet(startDate)}`;
    }
    if (endDate) {
      const parts = endDate.split('-');
      if (parts.length === 3) {
        const [, m, d] = parts;
        const raw = `${d}/${m}`;
        const localized = isRTL ? toLocalizedDigits(raw, true) : raw;
        return isRTL ? `حتى ${localized}` : `To ${localized}`;
      }
      return isRTL ? `حتى: ${formatDateSnippet(endDate)}` : `To: ${formatDateSnippet(endDate)}`;
    }
    return placeholder || t('common.dateRange', { defaultValue: isRTL ? 'الفترة الزمنية' : 'Date Range' });
  }, [startDate, endDate, formatDateSnippet, isRTL, placeholder, t]);

  // Apply Handler
  const handleApply = () => {
    const cleanStart = localStart.trim() || undefined;
    const cleanEnd = localEnd.trim() || undefined;

    // Validate if both exist that end >= start
    if (cleanStart && cleanEnd && cleanEnd < cleanStart) {
      onChange({ startDate: cleanEnd, endDate: cleanStart });
    } else {
      onChange({ startDate: cleanStart, endDate: cleanEnd });
    }
    setIsOpen(false);
  };

  // Preset Selection Handler
  const handleApplyPreset = (presetStart?: string, presetEnd?: string) => {
    setLocalStart(presetStart || '');
    setLocalEnd(presetEnd || '');
    onChange({ startDate: presetStart, endDate: presetEnd });
    setIsOpen(false);
  };

  // Clear Handler
  const handleClear = (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    setLocalStart('');
    setLocalEnd('');
    onChange({ startDate: undefined, endDate: undefined });
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      {/* Trigger Button - Sized identically to FilterDropdown and RefreshButton */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-label={ariaLabel || triggerLabel}
        title={triggerLabel}
        className={cn(
          'group inline-flex items-center justify-between gap-1.5 sm:gap-2 px-3 sm:px-3.5 h-[38px] rounded-xl text-xs font-bold select-none cursor-pointer border transition-all duration-150 shadow-2xs w-full',
          isFiltered
            ? 'bg-amber-500/10 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border-amber-500/35 hover:bg-amber-500/15'
            : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border-slate-200/80 dark:border-slate-800 hover:bg-slate-100/60 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white',
          isOpen && 'ring-2 ring-amber-500/20 border-amber-500/50'
        )}
      >
        <div className="flex items-center gap-1.5 truncate">
          <CalendarIcon className="w-3.5 h-3.5 shrink-0 text-amber-500" />
          {/* Full format for Tablet & Desktop (>= sm) */}
          <span className="hidden sm:inline truncate">
            {triggerLabel}
          </span>
          {/* Smart compact format for Mobile (< sm) */}
          <span className="inline sm:hidden truncate font-medium">
            {compactTriggerLabel}
          </span>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {isFiltered && (
            <span
              role="button"
              tabIndex={0}
              onClick={handleClear}
              onKeyDown={(e) => e.key === 'Enter' && handleClear()}
              title={isRTL ? 'إلغاء فلتر التاريخ' : 'Clear date filter'}
              className="p-0.5 rounded-full hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 cursor-pointer"
            >
              <X className="w-3 h-3" />
            </span>
          )}
          <ChevronDown
            className={cn(
              'w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform duration-200',
              isOpen && 'rotate-180 text-amber-500'
            )}
          />
        </div>
      </button>

      {/* Popover Panel */}
      {isOpen && (
        <div
          className={cn(
            'absolute top-full mt-2 z-50 w-80 sm:w-[350px] max-w-[calc(100vw-2rem)] p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xl space-y-3 animate-in fade-in zoom-in-95 duration-150',
            'start-0'
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800/80">
            <div className="flex items-center gap-1.5 text-xs font-black text-slate-900 dark:text-white">
              <Clock className="w-3.5 h-3.5 text-amber-500" />
              <span>{t('common.filterByDateRange', { defaultValue: isRTL ? 'تصفية بالنطاق الزمني' : 'Filter by Date Range' })}</span>
            </div>
            {isFiltered && (
              <button
                type="button"
                onClick={handleClear}
                className="text-[11px] font-bold text-rose-500 hover:text-rose-600 dark:text-rose-400 cursor-pointer transition-colors"
              >
                {t('common.clearAll', { defaultValue: isRTL ? 'مسح الكل' : 'Clear All' })}
              </button>
            )}
          </div>

          {/* Quick Presets */}
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
              {t('common.quickPresets', { defaultValue: isRTL ? 'اختصارات سريعة' : 'Quick Presets' })}
            </span>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                type="button"
                onClick={() => handleApplyPreset(todayStr, todayStr)}
                className="px-2 py-1.5 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-800/60 hover:bg-amber-500/10 hover:text-amber-600 dark:hover:text-amber-400 transition-colors border border-slate-200/60 dark:border-slate-700/60 text-center cursor-pointer"
              >
                {t('common.today', { defaultValue: isRTL ? 'اليوم' : 'Today' })}
              </button>
              <button
                type="button"
                onClick={() => handleApplyPreset(getPastDateStr(1), getPastDateStr(1))}
                className="px-2 py-1.5 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-800/60 hover:bg-amber-500/10 hover:text-amber-600 dark:hover:text-amber-400 transition-colors border border-slate-200/60 dark:border-slate-700/60 text-center cursor-pointer"
              >
                {t('common.yesterday', { defaultValue: isRTL ? 'أمس' : 'Yesterday' })}
              </button>
              <button
                type="button"
                onClick={() => handleApplyPreset(getPastDateStr(7), todayStr)}
                className="px-2 py-1.5 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-800/60 hover:bg-amber-500/10 hover:text-amber-600 dark:hover:text-amber-400 transition-colors border border-slate-200/60 dark:border-slate-700/60 text-center cursor-pointer"
              >
                {t('common.last7Days', { defaultValue: isRTL ? 'آخر 7 أيام' : 'Last 7 Days' })}
              </button>
              <button
                type="button"
                onClick={() => handleApplyPreset(getPastDateStr(30), todayStr)}
                className="col-span-1.5 px-2 py-1.5 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-800/60 hover:bg-amber-500/10 hover:text-amber-600 dark:hover:text-amber-400 transition-colors border border-slate-200/60 dark:border-slate-700/60 text-center cursor-pointer"
              >
                {t('common.last30Days', { defaultValue: isRTL ? 'آخر 30 يوماً' : 'Last 30 Days' })}
              </button>
              <button
                type="button"
                onClick={() => handleApplyPreset(getStartOfMonthStr(), todayStr)}
                className="col-span-2 px-2 py-1.5 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-800/60 hover:bg-amber-500/10 hover:text-amber-600 dark:hover:text-amber-400 transition-colors border border-slate-200/60 dark:border-slate-700/60 text-center cursor-pointer"
              >
                {t('common.thisMonth', { defaultValue: isRTL ? 'هذا الشهر' : 'This Month' })}
              </button>
            </div>
          </div>

          {/* Custom Date Inputs (Powered by Custom Mazadak DatePicker: DD/MM/YYYY) */}
          <div className="space-y-2.5 pt-1 border-t border-slate-100 dark:border-slate-800/80">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              {t('common.customRange', { defaultValue: isRTL ? 'تحديد مخصص' : 'Custom Range' })}
            </span>

            <div className="space-y-2">
              <DatePicker
                label={t('common.fromDate', { defaultValue: isRTL ? 'من تاريخ (بداية النطاق):' : 'From Date (Start):' })}
                value={localStart}
                max={localEnd || todayStr}
                onChange={(val) => setLocalStart(val || '')}
                placeholder={isRTL ? 'يوم / شهر / سنة' : 'DD / MM / YYYY'}
              />

              <DatePicker
                label={t('common.toDate', { defaultValue: isRTL ? 'إلى تاريخ (نهاية النطاق):' : 'To Date (End):' })}
                value={localEnd}
                min={localStart}
                max={todayStr}
                onChange={(val) => setLocalEnd(val || '')}
                placeholder={isRTL ? 'يوم / شهر / سنة' : 'DD / MM / YYYY'}
              />
            </div>
          </div>

          {/* Action Footer */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800/80">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {t('common.cancel', { defaultValue: isRTL ? 'إلغاء' : 'Cancel' })}
            </button>
            <button
              type="button"
              onClick={handleApply}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/35 active:scale-95 transition-all shadow-2xs cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{t('common.applyFilter', { defaultValue: isRTL ? 'تطبيق الفلتر' : 'Apply Filter' })}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
