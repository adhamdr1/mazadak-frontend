import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  ShieldAlert,
  Loader2,
  ArrowLeft,
  ArrowRight,
  Building2,
  Zap,
  Smartphone,
  Check,
  Clock,
} from 'lucide-react';
import type { PayoutMethod, PayoutDetailsInput } from '../types/wallet.types';
import { toLocalizedDigits } from '@/utils/formatters';

export interface WithdrawSummaryStepProps {
  payoutMethod: PayoutMethod;
  details: PayoutDetailsInput;
  onBack: () => void;
  onConfirm: () => Promise<void>;
  isSubmitting: boolean;
}

export const WithdrawSummaryStep: React.FC<WithdrawSummaryStepProps> = ({
  payoutMethod,
  details,
  onBack,
  onConfirm,
  isSubmitting,
}) => {
  const { t, i18n } = useTranslation(['wallet']);
  const isRTL = i18n.language.startsWith('ar');

  const getMethodInfo = () => {
    switch (payoutMethod) {
      case 'BANK_ACCOUNT':
        return {
          title: t('wallet:withdraw.methods.bank', isRTL ? 'حساب بنكي' : 'Bank Account'),
          icon: Building2,
          color: 'text-blue-600 dark:text-blue-400 bg-blue-500/10 border-blue-500/20',
        };
      case 'INSTAPAY':
        return {
          title: t('wallet:withdraw.methods.instapay', isRTL ? 'إنستاباي' : 'InstaPay'),
          icon: Zap,
          color: 'text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/20',
        };
      case 'VODAFONE_CASH':
        return {
          title: t('wallet:withdraw.methods.vodafone', isRTL ? 'فودافون كاش' : 'Vodafone Cash'),
          icon: Smartphone,
          color: 'text-rose-600 dark:text-rose-400 bg-rose-500/10 border-rose-500/20',
        };
      case 'ORANGE_CASH':
        return {
          title: t('wallet:withdraw.methods.orange', isRTL ? 'أورنج كاش' : 'Orange Cash'),
          icon: Smartphone,
          color: 'text-orange-600 dark:text-orange-400 bg-orange-500/10 border-orange-500/20',
        };
      case 'ETISALAT_CASH':
        return {
          title: t('wallet:withdraw.methods.etisalat', isRTL ? 'اتصالات كاش' : 'Etisalat Cash'),
          icon: Smartphone,
          color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
        };
      case 'WE_PAY':
        return {
          title: t('wallet:withdraw.methods.we', isRTL ? 'وي باي' : 'WE Pay'),
          icon: Smartphone,
          color: 'text-purple-600 dark:text-purple-400 bg-purple-500/10 border-purple-500/20',
        };
      default:
        return {
          title: payoutMethod,
          icon: Building2,
          color: 'text-slate-600 dark:text-slate-400 bg-slate-500/10 border-slate-500/20',
        };
    }
  };

  const methodInfo = getMethodInfo();
  const IconComponent = methodInfo.icon;

  return (
    <div className="space-y-6">
      <div className="text-center sm:text-start space-y-1">
        <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white">
          {t('wallet:withdraw.reviewSummaryTitle', 'مراجعة وتأكيد طلب السحب')}
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {t(
            'wallet:withdraw.reviewSummarySubtitle',
            'راجع كافة التفاصيل قبل إرسال الطلب واعتماد حجز المبلغ'
          )}
        </p>
      </div>

      {/* Main Review Card */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-amber-500/60 dark:hover:border-amber-500/60 bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-sm hover:shadow-md transition-all duration-300 space-y-6">
        {/* Method Badge & Delivery Time */}
        <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-amber-500/40 dark:hover:border-amber-500/40 bg-slate-50/70 dark:bg-slate-800/40 transition-all duration-200">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl border ${methodInfo.color}`}>
              <IconComponent className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 block">
                {t('wallet:withdraw.chosenMethodLabel', 'وسيلة الاستلام')}
              </span>
              <span className="text-sm font-extrabold text-slate-900 dark:text-white">
                {methodInfo.title}
              </span>
            </div>
          </div>

          <div className="text-end">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-300">
              <Clock className="w-3.5 h-3.5 text-amber-500" />
              <span>
                {payoutMethod === 'BANK_ACCOUNT'
                  ? t('wallet:withdraw.methods.bankDelivery', isRTL ? 'من ٣ إلى ٥ أيام عمل' : '3 to 5 business days')
                  : t('wallet:withdraw.methods.fastDelivery', isRTL ? 'خلال ٢٤ ساعة عمل' : 'Within 24 business hours')}
              </span>
            </span>
          </div>
        </div>

        {/* Recipient Details Breakdown (Full-Width Rows) */}
        <div className="space-y-3 pt-1">
          <h3 className="text-xs font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            {t('wallet:withdraw.recipientDetailsTitle', 'بيانات المستلم')}
          </h3>

          <div className="space-y-2.5 text-xs sm:text-sm">
            {/* 1. Bank Account Details */}
            {payoutMethod === 'BANK_ACCOUNT' && (
              <>
                <div className="p-3 sm:p-3.5 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 hover:border-amber-500/40 dark:hover:border-amber-500/40 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 transition-all duration-200">
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    {t('wallet:withdraw.bankNameLabel', 'اسم البنك')}
                  </span>
                  <span className="font-bold text-slate-900 dark:text-white sm:text-end">
                    {details.bankName}
                  </span>
                </div>

                <div className="p-3 sm:p-3.5 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 hover:border-amber-500/40 dark:hover:border-amber-500/40 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 transition-all duration-200">
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    {t('wallet:withdraw.holderNameLabel', 'اسم صاحب الحساب')}
                  </span>
                  <span className="font-bold text-slate-900 dark:text-white sm:text-end">
                    {details.accountHolderName}
                  </span>
                </div>

                {details.accountNumber && (
                  <div className="p-3 sm:p-3.5 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 hover:border-amber-500/40 dark:hover:border-amber-500/40 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 transition-all duration-200">
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                      {t('wallet:withdraw.accountNumberLabel', 'رقم الحساب')}
                    </span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white sm:text-end">
                      {toLocalizedDigits(details.accountNumber, isRTL)}
                    </span>
                  </div>
                )}

                {details.iban && (
                  <div className="p-3 sm:p-3.5 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 hover:border-amber-500/40 dark:hover:border-amber-500/40 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 transition-all duration-200">
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                      {t('wallet:withdraw.ibanLabel', 'الآيبان (IBAN)')}
                    </span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white break-all sm:text-end">
                      {details.iban}
                    </span>
                  </div>
                )}
              </>
            )}

            {/* 2. InstaPay Details */}
            {payoutMethod === 'INSTAPAY' && (
              <>
                {details.ipaAddress && (
                  <div className="p-3 sm:p-3.5 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 hover:border-amber-500/40 dark:hover:border-amber-500/40 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 transition-all duration-200">
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                      {t('wallet:withdraw.ipaAddressLabel', 'عنوان الدفع اللحظي (IPA)')}
                    </span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white sm:text-end">
                      {details.ipaAddress}
                    </span>
                  </div>
                )}

                {details.phoneNumber && (
                  <div className="p-3 sm:p-3.5 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 hover:border-amber-500/40 dark:hover:border-amber-500/40 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 transition-all duration-200">
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                      {t('wallet:withdraw.instapayPhoneLabel', 'رقم الهاتف المسجل بإنستاباي')}
                    </span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white sm:text-end">
                      {toLocalizedDigits(details.phoneNumber, isRTL)}
                    </span>
                  </div>
                )}

                {details.accountHolderName && (
                  <div className="p-3 sm:p-3.5 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 hover:border-amber-500/40 dark:hover:border-amber-500/40 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 transition-all duration-200">
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                      {t('wallet:withdraw.holderNameLabel', 'اسم المستلم')}
                    </span>
                    <span className="font-bold text-slate-900 dark:text-white sm:text-end">
                      {details.accountHolderName}
                    </span>
                  </div>
                )}
              </>
            )}

            {/* 3. Mobile Wallets */}
            {payoutMethod !== 'BANK_ACCOUNT' && payoutMethod !== 'INSTAPAY' && (
              <div className="p-3 sm:p-3.5 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 hover:border-amber-500/40 dark:hover:border-amber-500/40 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 transition-all duration-200">
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  {t('wallet:withdraw.walletPhoneLabel', 'رقم هاتف المحفظة')}
                </span>
                <span className="font-mono font-extrabold text-slate-900 dark:text-white text-base sm:text-end">
                  {toLocalizedDigits(details.phoneNumber || '', isRTL)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Two-Phase Hold Legal Notice */}
        <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex gap-3 text-xs text-amber-800 dark:text-amber-300">
          <ShieldAlert className="w-5 h-5 shrink-0 text-amber-600 dark:text-amber-400" />
          <p className="leading-relaxed">
            {t(
              'wallet:withdraw.twoPhaseNotice',
              'تنبيه: سيتم نقل المبلغ للرصيد المحجوز فوراً لحين مراجعة التحويل واعتماده مالياً. يمكنك إلغاء الطلب واستعادة الرصيد متاحاً في أي وقت طالما كان بحالة "قيد المراجعة".'
            )}
          </p>
        </div>
      </div>

      {/* Action Buttons (Back / Confirm CTA) — Mobile / Tablet (< lg) only, rendered in sidebar on Desktop */}
      <div className="flex lg:hidden items-center gap-3 pt-2">
        <button
          type="button"
          disabled={isSubmitting}
          onClick={onBack}
          className="h-12 px-5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-amber-500/60 dark:hover:border-amber-500/60 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs sm:text-sm transition-all duration-200 cursor-pointer flex items-center gap-2 disabled:opacity-50"
        >
          {isRTL ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
          <span>{t('wallet:actions.previous', isRTL ? 'السابق' : 'Previous')}</span>
        </button>

        <button
          type="button"
          disabled={isSubmitting}
          onClick={onConfirm}
          className="flex-1 h-12 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-sm sm:text-base shadow-sm hover:shadow-md active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:pointer-events-none cursor-pointer"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>
                {t(
                  'wallet:withdraw.submitting',
                  isRTL ? 'جارٍ تسجيل وتأكيد طلب السحب...' : 'Processing withdrawal...'
                )}
              </span>
            </>
          ) : (
            <>
              <Check className="w-5 h-5 stroke-[2.5]" />
              <span>
                {t(
                  'wallet:withdraw.confirmSubmitButton',
                  isRTL ? 'تأكيد طلب السحب' : 'Confirm Withdrawal'
                )}
              </span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
