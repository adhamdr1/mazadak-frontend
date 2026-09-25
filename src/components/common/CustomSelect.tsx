import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { cn } from '@/utils/cn';

export interface CustomSelectOption<T extends string = string> {
  value: T;
  label: string;
  icon?: React.FC<{ className?: string }>;
}

export interface CustomSelectProps<T extends string = string> {
  value: T;
  onChange: (value: T) => void;
  options: CustomSelectOption<T>[];
  icon?: React.FC<{ className?: string }>;
  placeholder?: string;
  ariaLabel?: string;
  className?: string;
  menuClassName?: string;
}

export function CustomSelect<T extends string = string>({
  value,
  onChange,
  options,
  icon: Icon,
  placeholder,
  ariaLabel,
  className,
  menuClassName,
}: CustomSelectProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

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
    <div ref={containerRef} className={cn('relative w-full text-start', className)}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={ariaLabel || selectedOption?.label || placeholder}
        className={cn(
          'w-full flex items-center justify-between gap-3 px-4 py-3 rounded-2xl text-xs sm:text-sm font-semibold select-none cursor-pointer',
          'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100',
          'border transition-all duration-150 shadow-2xs',
          isOpen
            ? 'border-amber-500 ring-2 ring-amber-500/20 dark:border-amber-500'
            : 'border-slate-200 dark:border-slate-800 hover:border-amber-500/50 dark:hover:border-amber-500/50'
        )}
      >
        <div className="flex items-center gap-2.5 truncate min-w-0">
          {Icon && <Icon className="w-4 h-4 text-amber-500 shrink-0" />}
          <span className="truncate">{selectedOption ? selectedOption.label : placeholder}</span>
        </div>

        <ChevronDown
          className={cn(
            'w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200',
            isOpen && 'rotate-180 text-amber-500'
          )}
        />
      </button>

      {/* Dropdown Menu Popover (Matches full input width) */}
      {isOpen && (
        <div
          role="listbox"
          className={cn(
            'absolute z-50 mt-2 inset-x-0 w-full rounded-2xl p-2 select-none',
            'bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800',
            'shadow-xl shadow-slate-900/10 dark:shadow-black/40 backdrop-blur-md',
            'animate-in fade-in-0 zoom-in-95 duration-100 max-h-60 overflow-y-auto space-y-1',
            menuClassName
          )}
        >
          {options.map((option) => {
            const isSelected = option.value === value;
            const OptionIcon = option.icon;

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
                  'w-full flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-colors text-start cursor-pointer',
                  isSelected
                    ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-white'
                )}
              >
                <div className="flex items-center gap-2.5 truncate min-w-0">
                  {OptionIcon && (
                    <OptionIcon
                      className={cn(
                        'w-4 h-4 shrink-0',
                        isSelected ? 'text-amber-500' : 'text-slate-400'
                      )}
                    />
                  )}
                  <span className="truncate">{option.label}</span>
                </div>

                {isSelected && (
                  <Check className="w-4 h-4 text-amber-500 shrink-0 ms-2" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default CustomSelect;
