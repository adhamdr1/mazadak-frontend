import React from 'react';
import { useTranslation } from 'react-i18next';
import { formatPrice } from '@/utils/formatters';
import { cn } from '@/utils/cn';

export interface QuickAmountPresetsProps {
  selectedAmount?: number;
  onSelectAmount: (amount: number) => void;
  disabled?: boolean;
}

const PRESET_AMOUNTS = [100, 250, 500, 1000, 5000];

export const QuickAmountPresets: React.FC<QuickAmountPresetsProps> = ({
  selectedAmount,
  onSelectAmount,
  disabled = false,
}) => {
  const { t, i18n } = useTranslation(['wallet']);
  const isRTL = i18n.language.startsWith('ar');

  return (
    <div className="space-y-2">
      <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
        {t('wallet:deposit.quickPresetsLabel', 'مبالغ شائعة')}
      </span>
      <div className="grid grid-cols-5 gap-2">
        {PRESET_AMOUNTS.map((amount) => {
          const isSelected = selectedAmount === amount;
          return (
            <button
              key={amount}
              type="button"
              disabled={disabled}
              onClick={() => onSelectAmount(amount)}
              className={cn(
                'py-2 px-2 text-center rounded-xl text-xs sm:text-sm font-bold border transition-all duration-150 active:scale-95 disabled:opacity-50 disabled:pointer-events-none',
                isSelected
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-500 shadow-2xs ring-1 ring-emerald-500/30'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-emerald-400/60 hover:bg-emerald-50/40 dark:hover:bg-emerald-950/20 dark:hover:border-emerald-500/40'
              )}
            >
              +{formatPrice(amount, isRTL)}
            </button>
          );
        })}
      </div>
    </div>
  );
};
