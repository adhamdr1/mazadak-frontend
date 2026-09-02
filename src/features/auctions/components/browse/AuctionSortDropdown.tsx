import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowUpDown, Check, ChevronDown } from 'lucide-react';
import { cn } from '@/utils/cn';

export interface AuctionSortDropdownProps {
  selectedSort: string;
  onSortChange: (sortKey: string) => void;
  className?: string;
}

const SORT_OPTIONS = [
  'CREATED_AT_DESC',
  'END_TIME_ASC',
  'START_TIME_ASC',
  'CURRENT_PRICE_DESC',
  'CURRENT_PRICE_ASC',
  'TITLE_ASC',
] as const;

export const AuctionSortDropdown: React.FC<AuctionSortDropdownProps> = ({
  selectedSort,
  onSortChange,
  className,
}) => {
  const { t } = useTranslation('auctions');
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const activeLabel = t(`sort.${selectedSort}`);

  return (
    <div ref={dropdownRef} className={cn('relative inline-block text-start', className)}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={cn(
          'inline-flex items-center gap-2 text-xs font-semibold px-3.5 py-2.5 rounded-xl border transition-all duration-200 select-none shadow-sm cursor-pointer',
          'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200',
          'hover:border-amber-500/50 hover:bg-slate-50 dark:hover:bg-slate-800/60 focus:outline-none focus:ring-2 focus:ring-amber-500/20',
          isOpen && 'border-amber-500 ring-2 ring-amber-500/20'
        )}
      >
        <ArrowUpDown className="w-3.5 h-3.5 text-amber-500 shrink-0" />
        <span className="truncate max-w-[140px] sm:max-w-none">{activeLabel}</span>
        <ChevronDown className={cn('w-3.5 h-3.5 text-slate-400 transition-transform duration-200 shrink-0', isOpen && 'rotate-180 text-amber-500')} />
      </button>

      {/* Custom Dropdown Menu */}
      {isOpen && (
        <div className="absolute end-0 mt-1.5 w-56 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
          <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-800/80 mb-1">
            {t('sort.label')}
          </div>

          {SORT_OPTIONS.map((opt) => {
            const isSelected = selectedSort === opt;
            return (
              <button
                key={opt}
                type="button"
                onClick={() => {
                  onSortChange(opt);
                  setIsOpen(false);
                }}
                className={cn(
                  'w-full text-start flex items-center justify-between px-3.5 py-2 text-xs font-medium transition-colors select-none',
                  isSelected
                    ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                )}
              >
                <span>{t(`sort.${opt}`)}</span>
                {isSelected && <Check className="w-3.5 h-3.5 text-amber-500 shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AuctionSortDropdown;
