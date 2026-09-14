import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ToastContext,
  type ToastContextType,
  type ToastItem,
  type ToastOptions,
  type ToastType,
} from './toast.context';

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const idCounter = useRef(0);
  const { i18n } = useTranslation();

  // Clear stale toasts on language switch to prevent lingering foreign-language notifications
  useEffect(() => {
    const handleLanguageChange = () => {
      setToasts([]);
    };
    i18n.on('languageChanged', handleLanguageChange);
    return () => {
      i18n.off('languageChanged', handleLanguageChange);
    };
  }, [i18n]);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const clearAllToasts = useCallback(() => {
    setToasts([]);
  }, []);

  const showToast = useCallback(
    (options: ToastOptions | string, typeOverride?: ToastType): string => {
      const opts: ToastOptions = typeof options === 'string' ? { message: options } : options;
      const id = opts.id || `toast_${Date.now()}_${++idCounter.current}`;
      const type: ToastType = typeOverride || opts.type || 'info';

      const newToast: ToastItem = {
        ...opts,
        id,
        type,
        duration: opts.duration ?? 4000,
        createdAt: Date.now(),
      };

      setToasts((prev) => {
        // Limit max concurrent toasts to 5
        const next = prev.filter((t) => t.id !== id);
        if (next.length >= 5) {
          next.shift();
        }
        return [...next, newToast];
      });

      return id;
    },
    []
  );

  const toastHelpers = {
    success: useCallback(
      (message: string, options?: Omit<ToastOptions, 'message' | 'type'>) =>
        showToast({ ...options, message, type: 'success' }),
      [showToast]
    ),
    error: useCallback(
      (message: string, options?: Omit<ToastOptions, 'message' | 'type'>) =>
        showToast({ ...options, message, type: 'error' }),
      [showToast]
    ),
    warning: useCallback(
      (message: string, options?: Omit<ToastOptions, 'message' | 'type'>) =>
        showToast({ ...options, message, type: 'warning' }),
      [showToast]
    ),
    info: useCallback(
      (message: string, options?: Omit<ToastOptions, 'message' | 'type'>) =>
        showToast({ ...options, message, type: 'info' }),
      [showToast]
    ),
  };

  const contextValue: ToastContextType = {
    toasts,
    showToast,
    dismissToast,
    clearAllToasts,
    toast: toastHelpers,
  };

  return <ToastContext.Provider value={contextValue}>{children}</ToastContext.Provider>;
};

export default ToastProvider;
