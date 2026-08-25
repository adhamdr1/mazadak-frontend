import React from 'react';
import { useTranslation } from 'react-i18next';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import { cn } from '@/utils/cn';

export interface ThemeToggleProps {
  className?: string;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ className }) => {
  const { t } = useTranslation('common');
  const { resolvedTheme, toggleTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  const label = isDark
    ? t('theme.light', 'Light')
    : t('theme.dark', 'Dark');

  return (
    <button
      type="button"
      onClick={toggleTheme}
      title={label}
      aria-label={label}
      className={cn(
        'inline-flex items-center justify-center w-8 h-8 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-amber-500/40 select-none',
        'bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 shadow-sm',
        className
      )}
    >
      {isDark ? (
        <Sun className="w-4 h-4 text-amber-400 animate-fadeIn" />
      ) : (
        <Moon className="w-4 h-4 text-slate-700 animate-fadeIn" />
      )}
    </button>
  );
};
