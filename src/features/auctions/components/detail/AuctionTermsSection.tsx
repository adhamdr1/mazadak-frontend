import React from 'react';
import { useTranslation } from 'react-i18next';
import { ShieldCheck, CheckCircle2 } from 'lucide-react';
import { cn } from '@/utils/cn';

export interface AuctionTermsSectionProps {
  className?: string;
}

export const AuctionTermsSection: React.FC<AuctionTermsSectionProps> = ({
  className,
}) => {
  const { t } = useTranslation('auctions');

  const terms = [
    t('detail.termsItem1'),
    t('detail.termsItem2'),
    t('detail.termsItem3'),
    t('detail.termsItem4'),
  ];

  return (
    <div
      className={cn(
        'rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-6 hover:border-amber-500/60 dark:hover:border-amber-500/60 transition-colors',
        className
      )}
    >
      <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center border border-amber-500/20 shrink-0">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
            {t('detail.auctionTerms')}
          </h2>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {t('detail.escrowGuaranteeTitle')}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {terms.map((item, idx) => (
          <div
            key={idx}
            className="flex items-start gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800/80"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
            <p className="text-xs leading-relaxed text-slate-700 dark:text-slate-300">
              {item}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AuctionTermsSection;
