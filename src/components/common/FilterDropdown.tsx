import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { cn } from '@/utils/cn';

export interface FilterDropdownOption<T extends string = string> {
  value: T;
  label: string;
}

export interface FilterDropdownProps<T extends string = string> {
  value: T;
  onChange: (value: T) => void;
  options: FilterDropdownOption<T>[];
  icon?: React.FC<{ className?: string }>;
  allValue?: T;
  className?: string;
  menuClassName?: string;
  ariaLabel?: string;
}

export function FilterDropdown<T extends string = string>({
  value,
  onChange,
  options,
  icon: Icon,
  allValue = 'ALL' as T,
  className,
  menuClassName,
  ariaLabel,
}: FilterDropdownProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value) || options[0];
  const isFiltered = value !== allValue;

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

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      {/* Trigger Button - Sized identically to RefreshButton */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={ariaLabel || selectedOption?.label}
        className={cn(
          'group inline-flex items-center justify-between gap-1.5 sm:gap-2 px-3 sm:px-3.5 h-[38px] rounded-xl text-xs font-bold select-none cursor-pointer border transition-all duration-150 shadow-2xs w-full',
          isFiltered
            ? 'bg-amber-500/10 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border-amber-500/35 hover:bg-amber-500/15'
            : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border-slate-200/80 dark:border-slate-800 hover:bg-slate-100/60 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white',
          isOpen && 'ring-2 ring-amber-500/20 border-amber-500/50'
        )}
      >
        <div className="flex items-center gap-1.5 truncate">
          {Icon && (
            <Icon
              className="w-3.5 h-3.5 shrink-0 text-amber-500 transition-colors"
            />
          )}
          <span className="truncate">
            {selectedOption?.label}
          </span>
        </div>

        <ChevronDown
          className={cn(
            'w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform duration-200',
            isOpen && 'rotate-180 text-amber-500'
          )}
        />
      </button>

      {/* Popover Menu matching AdminAuctionsTable standard */}
      {isOpen && (
        <div
          role="listbox"
          className={cn(
            'absolute z-50 start-0 sm:start-auto sm:end-0 mt-2 w-52 sm:w-56 rounded-2xl p-1.5 select-none',
            'bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200/90 dark:border-slate-800',
            'shadow-xl shadow-slate-900/10 dark:shadow-black/50',
            'animate-in fade-in-0 zoom-in-95 duration-100 max-h-60 overflow-y-auto space-y-0.5',
            menuClassName
          )}
        >
          {options.map((option) => {
            const isSelected = option.value === value;

            return (
              <button
                key={option.value}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={cn(
                  'w-full flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-colors text-start cursor-pointer outline-none',
                  isSelected
                    ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-white'
                )}
              >
                <span className="truncate">{option.label}</span>
                {isSelected && <Check className="w-3.5 h-3.5 text-amber-500 shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
