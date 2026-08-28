import React from 'react';
import { useTranslation } from 'react-i18next';
import { FileText } from 'lucide-react';
import { cn } from '@/utils/cn';

export interface AuctionDescriptionProps {
  description: string;
  className?: string;
}

export const AuctionDescription: React.FC<AuctionDescriptionProps> = ({
  description,
  className,
}) => {
  const { t } = useTranslation('auctions');

  return (
    <div
      className={cn(
        'rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-5 sm:p-7 shadow-sm space-y-4 hover:border-amber-500/60 dark:hover:border-amber-500/60 transition-colors',
        className
      )}
    >
      <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3 text-slate-900 dark:text-white font-bold text-sm sm:text-base">
        <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center border border-amber-500/20">
          <FileText className="w-4 h-4" />
        </div>
        <h2>{t('detail.description')}</h2>
      </div>

      <div className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
        <p>{description}</p>
      </div>
    </div>
  );
};

export default AuctionDescription;
