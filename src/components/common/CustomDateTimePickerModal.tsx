import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Calendar as CalendarIcon,
  Clock,
  ChevronLeft,
  ChevronRight,
  Check,
  X,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { toLocalizedDigits } from '@/utils/formatters';

export interface CustomDateTimePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  value?: string; // ISO string "YYYY-MM-DDTHH:mm"
  min?: string; // ISO string "YYYY-MM-DDTHH:mm"
  title?: string;
  onConfirm: (isoString: string) => void;
}

const ARABIC_MONTHS = [
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

const ENGLISH_MONTHS = [
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

const ARABIC_DAYS = ['أحد', 'إثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت'];
const ENGLISH_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const CustomDateTimePickerModal: React.FC<CustomDateTimePickerModalProps> = ({
  isOpen,
  onClose,
  value,
  min,
  title,
  onConfirm,
}) => {
  const { i18n } = useTranslation('auctions');
  const isRTL = i18n.language?.startsWith('ar');
  const modalRef = useRef<HTMLDivElement>(null);

  // Lock background body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  // Parse initial date from value or fallback to min / now + 30 min
  const initialDate = useMemo(() => {
    if (value) {
      const d = new Date(value);
      if (!isNaN(d.getTime())) return d;
    }
    if (min) {
      const d = new Date(min);
      if (!isNaN(d.getTime())) return d;
    }
    return new Date(Date.now() + 30 * 60 * 1000);
  }, [value, min]);

  // Selected date components state
  const [selectedDate, setSelectedDate] = useState<Date>(initialDate);
  const [currentMonth, setCurrentMonth] = useState<number>(initialDate.getMonth());
  const [currentYear, setCurrentYear] = useState<number>(initialDate.getFullYear());

  // Time state (12-hour format)
  const [selectedHour, setSelectedHour] = useState<number>(() => {
    const h = initialDate.getHours();
    return h % 12 || 12;
  });
  const [selectedMinute, setSelectedMinute] = useState<number>(() => initialDate.getMinutes());
  const [period, setPeriod] = useState<'AM' | 'PM'>(() => (initialDate.getHours() >= 12 ? 'PM' : 'AM'));

  // Active time picker mode: 'hour' | 'minute'
  const [activeTimeView, setActiveTimeView] = useState<'hour' | 'minute'>('hour');

  // Sync state when modal opens
  useEffect(() => {
    if (isOpen) {
      const d = initialDate;
      setSelectedDate(d);
      setCurrentMonth(d.getMonth());
      setCurrentYear(d.getFullYear());
      const h = d.getHours();
      setSelectedHour(h % 12 || 12);
      setSelectedMinute(d.getMinutes());
      setPeriod(h >= 12 ? 'PM' : 'AM');
      setActiveTimeView('hour');
    }
  }, [isOpen, initialDate]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const minDate = min ? new Date(min) : new Date();

  // Navigation handlers
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  // Generate calendar days for current month
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();

  const handleDaySelect = (day: number) => {
    const newDate = new Date(currentYear, currentMonth, day);
    setSelectedDate(newDate);
  };

  // Convert selections to final ISO string
  const handleSave = () => {
    let hours24 = selectedHour % 12;
    if (period === 'PM') {
      hours24 += 12;
    }

    const final = new Date(
      selectedDate.getFullYear(),
      selectedDate.getMonth(),
      selectedDate.getDate(),
      hours24,
      selectedMinute,
      0
    );

    const pad = (n: number) => String(n).padStart(2, '0');
    const isoString = `${final.getFullYear()}-${pad(final.getMonth() + 1)}-${pad(final.getDate())}T${pad(final.getHours())}:${pad(final.getMinutes())}`;

    onConfirm(isoString);
    onClose();
  };

  // Quick Preset Handlers
  const applyPreset = (minutesToAdd: number) => {
    const nowTarget = new Date(Date.now() + minutesToAdd * 60 * 1000);
    setSelectedDate(nowTarget);
    setCurrentMonth(nowTarget.getMonth());
    setCurrentYear(nowTarget.getFullYear());
    const h = nowTarget.getHours();
    setSelectedHour(h % 12 || 12);
    setSelectedMinute(nowTarget.getMinutes());
    setPeriod(h >= 12 ? 'PM' : 'AM');
  };

  const monthsList = isRTL ? ARABIC_MONTHS : ENGLISH_MONTHS;
  const daysList = isRTL ? ARABIC_DAYS : ENGLISH_DAYS;

  // Selected date preview banner string
  const padStr = (n: number) => String(n).padStart(2, '0');
  const previewDay = selectedDate.getDate();
  const previewMonthName = monthsList[selectedDate.getMonth()];
  const previewYear = selectedDate.getFullYear();
  const previewTime = `${isRTL ? toLocalizedDigits(padStr(selectedHour), true) : padStr(selectedHour)}:${isRTL ? toLocalizedDigits(padStr(selectedMinute), true) : padStr(selectedMinute)} ${period === 'PM' ? (isRTL ? 'م' : 'PM') : (isRTL ? 'ص' : 'AM')}`;
  const previewFullDate = `${isRTL ? toLocalizedDigits(previewDay, true) : previewDay} ${previewMonthName} ${isRTL ? toLocalizedDigits(previewYear, true) : previewYear}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-hidden border-0 outline-none ring-0">
      {/* Click outside backdrop */}
      <div 
        className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm animate-fadeIn border-0 outline-none ring-0" 
        onClick={onClose} 
      />

      {/* Modal Container: Perfectly fitted, Symmetrical in Light & Dark */}
      <div
        ref={modalRef}
        className="relative w-full max-w-sm sm:max-w-md max-h-[92vh] sm:max-h-[90vh] rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col z-10 my-auto transition-all duration-200"
      >
        {/* 1. Header */}
        <div className="shrink-0 bg-white dark:bg-slate-900 p-3.5 sm:p-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between gap-2 mb-2.5">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-amber-500/15 text-amber-500 flex items-center justify-center border border-amber-500/25 shrink-0">
                <CalendarIcon className="w-3.5 h-3.5" />
              </div>
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                {title || (isRTL ? 'تحديد موعد المزاد' : 'Select Auction Date & Time')}
              </h3>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-7 h-7 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Current Selection Visual Highlight */}
          <div className="flex items-center justify-between bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/20 rounded-2xl p-2 px-3">
            <span className="text-amber-600 dark:text-amber-400 font-extrabold text-xs sm:text-sm truncate">
              {previewFullDate}
            </span>
            <div className="flex items-center gap-1 font-mono font-bold text-xs text-amber-600 dark:text-amber-400 bg-amber-500/15 dark:bg-amber-500/20 px-2 py-0.5 rounded-lg border border-amber-500/30 shrink-0">
              <Clock className="w-3 h-3" />
              <span>{previewTime}</span>
            </div>
          </div>

          {/* Quick Presets */}
          <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-slate-100 dark:border-slate-800/80 text-[11px] overflow-x-auto pb-0.5">
            <span className="text-slate-400 dark:text-slate-500 shrink-0 flex items-center gap-1 font-medium">
              <Sparkles className="w-3 h-3 text-amber-500" />
              {isRTL ? 'سريع:' : 'Presets:'}
            </span>
            <button
              type="button"
              onClick={() => applyPreset(30)}
              className="px-2.5 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-amber-500 hover:text-slate-950 dark:hover:bg-amber-500 dark:hover:text-slate-950 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-bold transition-colors cursor-pointer shrink-0 text-[10px] sm:text-[11px]"
            >
              {isRTL ? '+٣٠ د' : '+30m'}
            </button>
            <button
              type="button"
              onClick={() => applyPreset(60)}
              className="px-2.5 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-amber-500 hover:text-slate-950 dark:hover:bg-amber-500 dark:hover:text-slate-950 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-bold transition-colors cursor-pointer shrink-0 text-[10px] sm:text-[11px]"
            >
              {isRTL ? '+١ س' : '+1h'}
            </button>
            <button
              type="button"
              onClick={() => applyPreset(24 * 60)}
              className="px-2.5 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-amber-500 hover:text-slate-950 dark:hover:bg-amber-500 dark:hover:text-slate-950 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-bold transition-colors cursor-pointer shrink-0 text-[10px] sm:text-[11px]"
            >
              {isRTL ? 'غداً' : 'Tomorrow'}
            </button>
            <button
              type="button"
              onClick={() => applyPreset(3 * 24 * 60)}
              className="px-2.5 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-amber-500 hover:text-slate-950 dark:hover:bg-amber-500 dark:hover:text-slate-950 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-bold transition-colors cursor-pointer shrink-0 text-[10px] sm:text-[11px]"
            >
              {isRTL ? '+٣ أيام' : '+3d'}
            </button>
          </div>
        </div>

        {/* 2. Middle Body */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-3.5 space-y-3 bg-slate-50/50 dark:bg-slate-900/60">
          {/* Calendar Section */}
          <div className="space-y-2 bg-white dark:bg-slate-900 p-2.5 sm:p-3 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
            {/* Month & Year Navigation Header */}
            <div className="flex items-center justify-between pb-1.5 border-b border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={isRTL ? handleNextMonth : handlePrevMonth}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
              >
                {isRTL ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
              </button>

              <div className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                <span>{monthsList[currentMonth]}</span>
                <span className="text-amber-500 font-mono font-bold">
                  {isRTL ? toLocalizedDigits(currentYear, true) : currentYear}
                </span>
              </div>

              <button
                type="button"
                onClick={isRTL ? handlePrevMonth : handleNextMonth}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
              >
                {isRTL ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </button>
            </div>

            {/* Days of Week Row */}
            <div className="grid grid-cols-7 gap-1 text-center">
              {daysList.map((dayName, idx) => (
                <div
                  key={idx}
                  className="text-[10px] font-bold text-slate-500 dark:text-slate-400 py-0.5"
                >
                  {dayName}
                </div>
              ))}
            </div>

            {/* Days Matrix */}
            <div className="grid grid-cols-7 gap-1">
              {/* Empty leading slots */}
              {Array.from({ length: firstDayIndex }).map((_, idx) => (
                <div key={`empty-${idx}`} className="h-7 sm:h-7.5" />
              ))}

              {/* Month Days */}
              {Array.from({ length: daysInMonth }).map((_, idx) => {
                const dayNumber = idx + 1;
                const thisDayDate = new Date(currentYear, currentMonth, dayNumber, 23, 59, 59);
                const isPast = thisDayDate.getTime() < minDate.getTime();
                const isSelected =
                  selectedDate.getDate() === dayNumber &&
                  selectedDate.getMonth() === currentMonth &&
                  selectedDate.getFullYear() === currentYear;

                return (
                  <button
                    key={dayNumber}
                    type="button"
                    disabled={isPast}
                    onClick={() => handleDaySelect(dayNumber)}
                    className={cn(
                      'h-7 sm:h-7.5 rounded-xl text-xs transition-all duration-100 flex items-center justify-center select-none font-mono',
                      isSelected
                        ? 'bg-amber-500 text-slate-950 font-black shadow-sm shadow-amber-500/30 scale-105'
                        : isPast
                          ? 'text-slate-400 dark:text-slate-500 font-normal cursor-not-allowed opacity-60'
                          : 'text-slate-900 dark:text-slate-50 font-black hover:bg-amber-500/20 hover:text-amber-600 dark:hover:text-amber-400 hover:scale-105 cursor-pointer'
                    )}
                  >
                    {isRTL ? toLocalizedDigits(dayNumber, true) : dayNumber}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Luxurious 1-Click Direct Time Selection (Hour & Minute Quick Grid) */}
          <div className="bg-slate-100/70 dark:bg-slate-950/80 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2.5 shadow-xs">
            {/* Clock Header & View Selector */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
                <Clock className="w-3.5 h-3.5 text-amber-500" />
                <span>{isRTL ? 'تحديد التوقيت بدقة:' : 'Direct Time Selection:'}</span>
              </div>

              {/* AM / PM Toggle */}
              <div className="flex items-center bg-white dark:bg-slate-900 p-0.5 rounded-xl border border-slate-200 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setPeriod('AM')}
                  className={cn(
                    'px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer select-none',
                    period === 'AM'
                      ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  )}
                >
                  {isRTL ? 'ص' : 'AM'}
                </button>
                <button
                  type="button"
                  onClick={() => setPeriod('PM')}
                  className={cn(
                    'px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer select-none',
                    period === 'PM'
                      ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  )}
                >
                  {isRTL ? 'م' : 'PM'}
                </button>
              </div>
            </div>

            {/* Time Mode Switches (Hour vs Minute) */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setActiveTimeView('hour')}
                className={cn(
                  'py-2 px-3 rounded-xl border flex items-center justify-between text-xs font-bold transition-all cursor-pointer',
                  activeTimeView === 'hour'
                    ? 'border-amber-500 bg-amber-500/10 text-amber-600 dark:text-amber-400 shadow-sm'
                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-amber-500/50'
                )}
              >
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                  {isRTL ? 'الساعة:' : 'Hour:'}
                </span>
                <span className="font-mono font-black text-sm text-slate-900 dark:text-white">
                  {isRTL ? toLocalizedDigits(padStr(selectedHour), true) : padStr(selectedHour)}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTimeView('minute')}
                className={cn(
                  'py-2 px-3 rounded-xl border flex items-center justify-between text-xs font-bold transition-all cursor-pointer',
                  activeTimeView === 'minute'
                    ? 'border-amber-500 bg-amber-500/10 text-amber-600 dark:text-amber-400 shadow-sm'
                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-amber-500/50'
                )}
              >
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                  {isRTL ? 'الدقيقة:' : 'Minute:'}
                </span>
                <span className="font-mono font-black text-sm text-slate-900 dark:text-white">
                  {isRTL ? toLocalizedDigits(padStr(selectedMinute), true) : padStr(selectedMinute)}
                </span>
              </button>
            </div>

            {/* Direct 1-Click Selection Grid */}
            {activeTimeView === 'hour' ? (
              <div className="space-y-1.5 animate-fadeIn">
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 block">
                  {isRTL ? 'اختر الساعة مباشرة (نقرة واحدة):' : 'Pick Hour directly (1-click):'}
                </span>
                <div className="grid grid-cols-6 gap-1.5">
                  {Array.from({ length: 12 }).map((_, idx) => {
                    const h = idx + 1;
                    const isSelected = selectedHour === h;
                    return (
                      <button
                        key={h}
                        type="button"
                        onClick={() => {
                          setSelectedHour(h);
                          setActiveTimeView('minute'); // Auto switch to minutes for seamless 2-click UX!
                        }}
                        className={cn(
                          'py-1.5 rounded-xl font-mono text-xs font-bold transition-all cursor-pointer select-none text-center',
                          isSelected
                            ? 'bg-amber-500 text-slate-950 font-black shadow-sm shadow-amber-500/30 scale-105'
                            : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-amber-500 hover:bg-amber-500/10 hover:text-amber-600 dark:hover:text-amber-400'
                        )}
                      >
                        {isRTL ? toLocalizedDigits(padStr(h), true) : padStr(h)}
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="space-y-1.5 animate-fadeIn">
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 block">
                  {isRTL ? 'اختر الدقيقة مباشرة (نقرة واحدة):' : 'Pick Minute directly (1-click):'}
                </span>
                <div className="grid grid-cols-6 gap-1.5">
                  {[0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55].map((m) => {
                    const isSelected = selectedMinute === m;
                    return (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setSelectedMinute(m)}
                        className={cn(
                          'py-1.5 rounded-xl font-mono text-xs font-bold transition-all cursor-pointer select-none text-center',
                          isSelected
                            ? 'bg-amber-500 text-slate-950 font-black shadow-sm shadow-amber-500/30 scale-105'
                            : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-amber-500 hover:bg-amber-500/10 hover:text-amber-600 dark:hover:text-amber-400'
                        )}
                      >
                        {isRTL ? toLocalizedDigits(padStr(m), true) : padStr(m)}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 4. Sticky Footer Actions */}
        <div className="shrink-0 p-3 sm:p-3.5 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            {isRTL ? 'إلغاء' : 'Cancel'}
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-black shadow-sm shadow-amber-500/20 flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Check className="w-3.5 h-3.5 stroke-[3]" />
            <span>{isRTL ? 'تأكيد الموعد' : 'Confirm'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomDateTimePickerModal;
