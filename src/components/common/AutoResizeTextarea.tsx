import React, { useEffect, useRef, useImperativeHandle, useCallback } from 'react';
import { cn } from '@/utils/cn';

export interface AutoResizeTextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  minRows?: number;
  maxRows?: number;
  hasError?: boolean;
}

export const AutoResizeTextarea = React.forwardRef<
  HTMLTextAreaElement,
  AutoResizeTextareaProps
>(
  (
    {
      className,
      minRows = 5,
      maxRows = 20,
      hasError = false,
      value,
      onChange,
      ...props
    },
    forwardedRef
  ) => {
    const internalRef = useRef<HTMLTextAreaElement | null>(null);

    useImperativeHandle(forwardedRef, () => internalRef.current as HTMLTextAreaElement);

    const adjustHeight = useCallback(() => {
      const textarea = internalRef.current;
      if (!textarea) return;

      // Reset height to calculate scrollHeight accurately
      textarea.style.height = 'auto';

      // Line height estimation ~24px, or scrollHeight
      const computedLineHeight =
        parseFloat(window.getComputedStyle(textarea).lineHeight) || 24;
      const minHeight = minRows * computedLineHeight + 24; // padding allowance
      const maxHeight = maxRows * computedLineHeight + 24;

      const newHeight = Math.min(Math.max(textarea.scrollHeight, minHeight), maxHeight);
      textarea.style.height = `${newHeight}px`;
    }, [minRows, maxRows]);

    useEffect(() => {
      adjustHeight();
    }, [value, adjustHeight]);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      adjustHeight();
      onChange?.(e);
    };

    return (
      <textarea
        ref={internalRef}
        rows={minRows}
        value={value}
        onChange={handleChange}
        className={cn(
          'w-full text-sm rounded-2xl border transition-all duration-150 resize-none leading-relaxed outline-none focus:outline-none p-3.5 sm:p-4 shadow-sm',
          'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500',
          hasError
            ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
            : 'border-slate-200/90 dark:border-slate-700/90 hover:border-slate-300 dark:hover:border-slate-600 focus:border-amber-500 dark:focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20',
          className
        )}
        {...props}
      />
    );
  }
);

AutoResizeTextarea.displayName = 'AutoResizeTextarea';

export default AutoResizeTextarea;
