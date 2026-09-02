import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Gavel } from 'lucide-react';
import { ROUTES } from '@/constants/routes.constants';
import { cn } from '@/utils/cn';

export interface BrandLogoProps {
  to?: string;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  to = ROUTES.HOME,
  size = 'md',
  showText = true,
  className,
}) => {
  const { t } = useTranslation('common');

  const sizeConfigs = {
    sm: {
      box: 'w-8 h-8 rounded-lg',
      icon: 'w-4 h-4',
      text: 'text-base',
    },
    md: {
      box: 'w-10 h-10 rounded-xl',
      icon: 'w-5 h-5',
      text: 'text-xl',
    },
    lg: {
      box: 'w-12 h-12 rounded-2xl',
      icon: 'w-6 h-6',
      text: 'text-2xl',
    },
  };

  const currentSize = sizeConfigs[size];

  const content = (
    <div className={cn('flex items-center gap-2.5 group shrink-0 select-none', className)}>
      <div
        className={cn(
          'bg-amber-500/10 dark:bg-amber-500/20 text-amber-500 flex items-center justify-center border border-amber-500/20 group-hover:scale-105 transition-transform duration-200 shadow-sm',
          currentSize.box
        )}
      >
        <Gavel className={currentSize.icon} />
      </div>

      {showText && (
        <span
          className={cn(
            'font-black tracking-tight bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 bg-clip-text text-transparent transition-opacity group-hover:opacity-95',
            currentSize.text
          )}
        >
          {t('appName')}
        </span>
      )}
    </div>
  );

  if (to) {
    return (
      <Link to={to} className="inline-flex items-center focus:outline-none">
        {content}
      </Link>
    );
  }

  return content;
};

export default BrandLogo;
