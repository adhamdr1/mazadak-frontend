import React from 'react';
import { useTranslation } from 'react-i18next';
import { Clock } from 'lucide-react';
import type { WithdrawalFeePreview, PayoutMethod } from '../types/wallet.types';
import { formatPrice, toLocalizedDigits } from '@/utils/formatters';

export interface FeePreviewCardProps {
  amount: number;
  payoutMethod?: PayoutMethod | null;
  feePreview?: WithdrawalFeePreview;
  isLoading: boolean;
  isError?: boolean;
}

export const FeePreviewCard: React.FC<FeePreviewCardProps> = ({
  amount,
  payoutMethod,
  feePreview,
  isError,
}) => {
  const { t, i18n } = useTranslation(['wallet']);
  const isRTL = i18n.language.startsWith('ar');

  const feePercentage = feePreview?.feePercentage ?? 2;

  // Live calculation values (or fallback estimated preview before method selection)
  const displayFee = feePreview
    ? feePreview.fee
    : amount > 0
    ? String((amount * 0.02).toFixed(2))
    : '0.00';

  const displayNet = feePreview
    ? feePreview.netAmount
    : amount > 0
    ? String((amount * 0.98).toFixed(2))
    : '0.00';

  // Delivery estimate resolution
  const getDeliveryEstimate = () => {
    if (payoutMethod === 'BANK_ACCOUNT') {
      return t('wallet:withdraw.methods.bankDelivery', isRTL ? 'من ٣ إلى ٥ أيام عمل' : '3 to 5 business days');
    }
    if (payoutMethod) {
      return t('wallet:withdraw.methods.fastDelivery', isRTL ? 'خلال ٢٤ ساعة عمل' : 'Within 24 business hours');
    }
    return isRTL ? 'حسب وسيلة الاستلام' : 'Depends on method';
  };

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-amber-500/60 dark:hover:border-amber-500/60 bg-white dark:bg-slate-900 p-5 space-y-4 shadow-2xs hover:shadow-md transition-all duration-300">
      {/* Header (Clean title with NO logo/icon next to text) */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800/80">
        <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white">
          {t('wallet:withdraw.feeBreakdownTitle', 'تفاصيل الحسبة والعمولة')}
        </h3>
        <span className="inline-flex items-center text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30">
          {t('wallet:withdraw.feeRate', 'عمولة {{rate}}%', {
            rate: toLocalizedDigits(String(feePercentage), isRTL),
            defaultValue: `عمولة ${toLocalizedDigits(String(feePercentage), isRTL)}%`,
          })}
        </span>
      </div>

      {/* Rows */}
      <div className="space-y-2.5 text-xs sm:text-sm">
        {/* Requested Amount */}
        <div className="flex justify-between text-slate-500 dark:text-slate-400">
          <span>{t('wallet:withdraw.requestedAmount', 'المبلغ المطلوب سحبه')}</span>
          <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
            {amount > 0 ? (
              <>
                {formatPrice(amount, isRTL)} {t('wallet:balance.currency', 'ج.م')}
              </>
            ) : (
              '—'
            )}
          </span>
        </div>

        {/* Fee */}
        <div className="flex justify-between text-slate-500 dark:text-slate-400">
          <span>{t('wallet:withdraw.feeAmount', 'رسوم الخدمة والتحويل')}</span>
          <span className="font-mono font-bold text-rose-600 dark:text-rose-400">
            {amount > 0 ? (
              <>
                - {formatPrice(displayFee, isRTL)} {t('wallet:balance.currency', 'ج.م')}
              </>
            ) : (
              '—'
            )}
          </span>
        </div>

        {/* Net Amount to Receive */}
        <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800 flex justify-between items-baseline">
          <div>
            <span className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white block">
              {t('wallet:withdraw.netAmountToReceive', 'الصافي المحول لحسابك')}
            </span>
            <span className="text-[11px] text-slate-400 dark:text-slate-500">
              {t('wallet:withdraw.netAmountNotice', 'المبلغ الفعلي الذي ستستلمه')}
            </span>
          </div>
          <span className="text-base sm:text-lg font-mono font-extrabold text-emerald-600 dark:text-emerald-400">
            {amount > 0 ? (
              <>
                {formatPrice(displayNet, isRTL)}{' '}
                <span className="text-xs font-bold text-slate-400 dark:text-slate-500">
                  {t('wallet:balance.currency', 'ج.م')}
                </span>
              </>
            ) : (
              '—'
            )}
          </span>
        </div>
      </div>

      {/* Delivery Estimate Box */}
      <div className="rounded-xl border border-slate-100 dark:border-slate-800 hover:border-amber-500/40 dark:hover:border-amber-500/40 bg-slate-50/80 dark:bg-slate-800/60 p-3 flex items-center justify-between text-xs transition-all duration-200">
        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
          <Clock className="w-4 h-4 text-amber-500 shrink-0" />
          <span className="font-medium">
            {t('wallet:withdraw.estimatedDeliveryLabel', 'الوقت المتوقع للتحويل')}:
          </span>
        </div>
        <span className="font-bold text-slate-900 dark:text-white">
          {getDeliveryEstimate()}
        </span>
      </div>

      {/* Helper / Status Note */}
      {isError && (
        <p className="text-[11px] text-rose-500 font-medium">
          {t('wallet:withdraw.previewError', 'تعذر تحديث الحسبة اللحظية')}
        </p>
      )}
    </div>
  );
};
