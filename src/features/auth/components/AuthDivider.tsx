import React from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/utils/cn';

export interface AuthDividerProps {
  label?: string;
  className?: string;
}

export const AuthDivider: React.FC<AuthDividerProps> = ({ label, className }) => {
  const { t } = useTranslation('auth');
  const dividerText = label || t('login.orDivider');

  return (
    <div className={cn('relative my-5 flex items-center justify-center', className)}>
      <div className="w-full border-t border-slate-200 dark:border-slate-800" />
      <span className="absolute bg-white dark:bg-slate-900 px-3 text-xs uppercase tracking-wider text-slate-400 dark:text-slate-500 select-none">
        {dividerText}
      </span>
    </div>
  );
};
