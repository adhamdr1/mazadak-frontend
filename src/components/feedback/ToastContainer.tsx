import React from 'react';
import { createPortal } from 'react-dom';
import { useToast } from './useToast';
import { Toast } from './Toast';

export const ToastContainer: React.FC = () => {
  const { toasts, dismissToast } = useToast();

  if (toasts.length === 0) return null;

  return createPortal(
    <div
      className="fixed z-[9999] inset-x-4 top-4 sm:top-auto sm:bottom-5 sm:inset-x-auto sm:end-5 flex flex-col gap-2.5 max-w-full sm:max-w-md pointer-events-none"
      aria-label="Notifications"
    >
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onDismiss={dismissToast} />
      ))}
    </div>,
    document.body
  );
};

export default ToastContainer;
