import React from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';
import { cn } from '@/utils/cn';

export interface LanguageSwitcherProps {
  className?: string;
  variant?: 'pill' | 'text' | 'ghost';
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  className,
  variant = 'pill',
}) => {
  const { t, i18n } = useTranslation('common');
  const currentLang = i18n.language.startsWith('ar') ? 'ar' : 'en';

  const toggleLanguage = () => {
    const nextLang = currentLang === 'ar' ? 'en' : 'ar';
    i18n.changeLanguage(nextLang);
  };

  const isArabic = currentLang === 'ar';
  const label = t('switchToLanguage');

  return (
    <button
      type="button"
      onClick={toggleLanguage}
      title={label}
      aria-label={label}
      className={cn(
        'inline-flex items-center gap-1.5 text-xs font-semibold rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-amber-500/40 select-none',
        variant === 'pill' &&
          'px-3 py-1.5 bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 shadow-sm',
        variant === 'ghost' &&
          'px-2 py-1 text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white',
        className
      )}
    >
      <Globe className="w-3.5 h-3.5 text-amber-500 shrink-0" />
      <span>{isArabic ? 'English' : 'العربية'}</span>
    </button>
  );
};
