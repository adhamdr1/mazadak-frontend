import { createContext } from 'react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastOptions {
  id?: string;
  title?: string;
  message: string;
  type?: ToastType;
  duration?: number; // In milliseconds, default 4000
  action?: {
    label: string;
    onClick: () => void;
  };
}

export interface ToastItem extends ToastOptions {
  id: string;
  type: ToastType;
  createdAt: number;
}

export interface ToastContextType {
  toasts: ToastItem[];
  showToast: (options: ToastOptions | string, type?: ToastType) => string;
  dismissToast: (id: string) => void;
  clearAllToasts: () => void;
  toast: {
    success: (message: string, options?: Omit<ToastOptions, 'message' | 'type'>) => string;
    error: (message: string, options?: Omit<ToastOptions, 'message' | 'type'>) => string;
    warning: (message: string, options?: Omit<ToastOptions, 'message' | 'type'>) => string;
    info: (message: string, options?: Omit<ToastOptions, 'message' | 'type'>) => string;
  };
}

export const ToastContext = createContext<ToastContextType | undefined>(undefined);
