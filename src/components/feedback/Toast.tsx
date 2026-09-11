import React, { useEffect, useState, useRef, useCallback } from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';
import { cn } from '@/utils/cn';
import type { ToastItem } from './toast.context';

export interface ToastProps {
  toast: ToastItem;
  onDismiss: (id: string) => void;
}

const TOAST_VARIANTS = {
  success: {
    icon: CheckCircle2,
    iconColor: 'text-emerald-500 dark:text-emerald-400',
    borderColor: 'border-emerald-500/20 dark:border-emerald-500/30',
    bgColor: 'bg-white dark:bg-slate-900',
    progressBg: 'bg-emerald-500',
    glow: 'shadow-emerald-500/5',
  },
  error: {
    icon: AlertCircle,
    iconColor: 'text-rose-500 dark:text-rose-400',
    borderColor: 'border-rose-500/20 dark:border-rose-500/30',
    bgColor: 'bg-white dark:bg-slate-900',
    progressBg: 'bg-rose-500',
    glow: 'shadow-rose-500/5',
  },
  warning: {
    icon: AlertTriangle,
    iconColor: 'text-amber-500 dark:text-amber-400',
    borderColor: 'border-amber-500/20 dark:border-amber-500/30',
    bgColor: 'bg-white dark:bg-slate-900',
    progressBg: 'bg-amber-500',
    glow: 'shadow-amber-500/5',
  },
  info: {
    icon: Info,
    iconColor: 'text-sky-500 dark:text-sky-400',
    borderColor: 'border-sky-500/20 dark:border-sky-500/30',
    bgColor: 'bg-white dark:bg-slate-900',
    progressBg: 'bg-sky-500',
    glow: 'shadow-sky-500/5',
  },
};

export const Toast: React.FC<ToastProps> = ({ toast, onDismiss }) => {
  const { id, type, title, message, duration = 4000, action } = toast;
  const variant = TOAST_VARIANTS[type] || TOAST_VARIANTS.info;
  const Icon = variant.icon;

  const [isPaused, setIsPaused] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const remainingTimeRef = useRef(duration);
  const startTimeRef = useRef(Date.now());
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleDismiss = useCallback(() => {
    setIsExiting(true);
    setTimeout(() => {
      onDismiss(id);
    }, 200); // 200ms exit animation
  }, [id, onDismiss]);

  const startDismissTimer = useCallback(() => {
    if (duration <= 0) return;
    startTimeRef.current = Date.now();
    timerRef.current = setTimeout(() => {
      handleDismiss();
    }, remainingTimeRef.current);
  }, [duration, handleDismiss]);

  useEffect(() => {
    startDismissTimer();
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [startDismissTimer]);

  const handleMouseEnter = () => {
    if (duration <= 0) return;
    setIsPaused(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    const elapsed = Date.now() - startTimeRef.current;
    remainingTimeRef.current = Math.max(0, remainingTimeRef.current - elapsed);
  };

  const handleMouseLeave = () => {
    if (duration <= 0) return;
    setIsPaused(false);
    startDismissTimer();
  };

  return (
    <div
      role="alert"
      aria-live="polite"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={cn(
        'relative w-full max-w-sm sm:max-w-md overflow-hidden rounded-xl border shadow-lg backdrop-blur-md transition-all duration-200 pointer-events-auto',
        variant.bgColor,
        variant.borderColor,
        variant.glow,
        isExiting
          ? 'opacity-0 scale-95 translate-y-2'
          : 'opacity-100 scale-100 translate-y-0 animate-in fade-in slide-in-from-top-2 sm:slide-in-from-bottom-2 duration-300'
      )}
    >
      <div className="flex items-start gap-3 p-4">
        {/* Type Icon */}
        <div className={cn('shrink-0 mt-0.5', variant.iconColor)}>
          <Icon className="w-5 h-5" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {title && (
            <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-0.5">
              {title}
            </h4>
          )}
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed break-words">
            {message}
          </p>

          {/* Action Button (Optional) */}
          {action && (
            <button
              type="button"
              onClick={() => {
                action.onClick();
                handleDismiss();
              }}
              className="mt-2 text-xs font-semibold text-amber-500 hover:text-amber-600 dark:hover:text-amber-400 underline underline-offset-2"
            >
              {action.label}
            </button>
          )}
        </div>

        {/* Close Button */}
        <button
          type="button"
          onClick={handleDismiss}
          className="shrink-0 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Dismiss notification"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Auto-Dismiss Progress Bar */}
      {duration > 0 && (
        <div className="h-0.5 w-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
          <div
            className={cn('h-full transition-all linear', variant.progressBg)}
            style={{
              animation: `shrinkWidth ${duration}ms linear forwards`,
              animationPlayState: isPaused ? 'paused' : 'running',
            }}
          />
        </div>
      )}
    </div>
  );
};

export default Toast;
