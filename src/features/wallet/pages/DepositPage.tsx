import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, ArrowRight, Wallet, Loader2, CreditCard, X } from 'lucide-react';
import { useWallet } from '../hooks/useWallet';
import { useDeposit } from '../hooks/useDeposit';
import { depositSchema, DepositFormData } from '../schemas/deposit.schema';
import { QuickAmountPresets } from '../components/QuickAmountPresets';
import { PaymobPaymentCard } from '../components/PaymobPaymentCard';
import { ROUTES } from '@/constants/routes.constants';
import { formatPrice, normalizeArabicDigits, toLocalizedDigits } from '@/utils/formatters';

export const DepositPage: React.FC = () => {
  const { t, i18n } = useTranslation(['wallet', 'common']);
  const isRTL = i18n.language.startsWith('ar');
  const { wallet, isLoading: isWalletLoading } = useWallet();
  const { deposit, isPending, isRedirecting } = useDeposit();

  const isSubmitting = isPending || isRedirecting;

  const {
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<DepositFormData>({
    resolver: zodResolver(depositSchema),
    defaultValues: {
      amount: 250,
    },
    mode: 'onChange',
  });

  const currentAmount = watch('amount');

  // Controlled input value supporting live Arabic/English numeral display
  const [displayAmount, setDisplayAmount] = useState<string>(() =>
    isRTL ? toLocalizedDigits('250', true) : '250'
  );

  // Sync display numerals whenever language changes
  useEffect(() => {
    const raw = currentAmount !== undefined && currentAmount !== null ? String(currentAmount) : '';
    setDisplayAmount(isRTL ? toLocalizedDigits(raw, true) : raw);
  }, [isRTL, currentAmount]);

  // Set document title
  useEffect(() => {
    document.title = `${t('wallet:deposit.pageTitle', 'شحن المحفظة')} | ${t('common:appName', 'مزادك')}`;
  }, [t, i18n.language]);

  // Additive preset handler (clicking +100 multiple times accumulates the amount)
  const handleSelectPreset = (preset: number) => {
    const prev = typeof currentAmount === 'number' && !isNaN(currentAmount) ? currentAmount : Number(currentAmount) || 0;
    const nextAmount = Math.min(prev + preset, 100000);
    setDisplayAmount(isRTL ? toLocalizedDigits(nextAmount, true) : String(nextAmount));
    setValue('amount', nextAmount, { shouldValidate: true });
  };

  const handleClearAmount = () => {
    setDisplayAmount('');
    setValue('amount', '' as unknown as number, { shouldValidate: true });
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const normalized = normalizeArabicDigits(raw).replace(/[^0-9.]/g, '');
    const localized = isRTL ? toLocalizedDigits(normalized, true) : normalized;
    setDisplayAmount(localized);
    setValue('amount', normalized === '' ? ('' as unknown as number) : Number(normalized), {
      shouldValidate: true,
    });
  };

  const onSubmit = async (data: DepositFormData) => {
    await deposit(data.amount);
  };

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 py-6 sm:py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Top Back Navigation (Unified Gold Hover Pill) */}
        <div className="flex items-center justify-between">
          <Link
            to={ROUTES.WALLET}
            className="inline-flex items-center gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 hover:text-amber-600 dark:hover:text-amber-400 hover:border-amber-500/50 dark:hover:border-amber-500/50 hover:bg-amber-50/40 dark:hover:bg-amber-950/20 transition-all shadow-2xs group shrink-0 select-none cursor-pointer whitespace-nowrap"
          >
            {isRTL ? (
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            ) : (
              <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
            )}
            <span>{t('wallet:deposit.backToWallet', isRTL ? 'العودة للمحفظة' : 'Back to Wallet')}</span>
          </Link>
        </div>

        {/* Centered Page Title Section */}
        <div className="text-center space-y-1.5 pb-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {t('wallet:deposit.pageTitle', 'شحن رصيد المحفظة')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            {t('wallet:deposit.pageSubtitle', 'اختر المبلغ المطلوب لإيداع الرصيد فورياً عبر بوابة Paymob')}
          </p>
        </div>

        {/* Current Available Balance Bar (Clean & Focused) */}
        <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-5 flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 dark:text-slate-500">
                {t('wallet:balance.available', 'الرصيد المتاح حالياً')}
              </p>
              <p className="text-lg sm:text-xl font-extrabold font-mono text-slate-900 dark:text-white">
                {isWalletLoading ? (
                  <span className="inline-block h-6 w-24 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
                ) : (
                  <>
                    {formatPrice(wallet?.availableBalance || '0', isRTL)}{' '}
                    <span className="text-xs font-bold text-slate-400 dark:text-slate-500">
                      {t('wallet:balance.currency', 'ج.م')}
                    </span>
                  </>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* 2 Columns Layout: Form & Payment Gateway Info */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Main Deposit Form (7 Columns) */}
          <div className="lg:col-span-7 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-sm">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {/* Amount Input */}
              <div className="space-y-2">
                <label
                  htmlFor="deposit-amount-input"
                  className="block text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200"
                >
                  {t('wallet:deposit.amountLabel', 'مبلغ الشحن')}
                </label>
                <div className="relative rounded-xl shadow-2xs">
                  <input
                    id="deposit-amount-input"
                    type="text"
                    inputMode="decimal"
                    autoComplete="off"
                    disabled={isSubmitting}
                    value={displayAmount}
                    onChange={handleAmountChange}
                    placeholder={isRTL ? '٢٥٠' : '250'}
                    style={{ outline: 'none' }}
                    className="w-full h-12 sm:h-13 px-4 text-base sm:text-lg font-mono font-bold text-slate-900 dark:text-white bg-slate-50/50 dark:bg-slate-800/50 border-2 border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:outline-none focus:border-emerald-600 dark:focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:focus:ring-emerald-500/20 transition-all disabled:opacity-50"
                  />
                  {/* Clear Button */}
                  {displayAmount && !isSubmitting && (
                    <button
                      type="button"
                      onClick={handleClearAmount}
                      className={`absolute top-1/2 -translate-y-1/2 p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-700/60 transition-colors ${
                        isRTL ? 'left-12' : 'right-12'
                      }`}
                      title={isRTL ? 'مسح المبلغ' : 'Clear amount'}
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <span
                    className={`absolute top-1/2 -translate-y-1/2 text-xs sm:text-sm font-extrabold text-slate-400 dark:text-slate-500 pointer-events-none ${
                      isRTL ? 'left-4' : 'right-4'
                    }`}
                  >
                    {t('wallet:balance.currency', 'ج.م')}
                  </span>
                </div>

                {/* Validation Error */}
                {errors.amount && (
                  <p className="text-xs font-semibold text-rose-500 dark:text-rose-400 pt-0.5">
                    {t(`wallet:${errors.amount.message}`, {
                      min: 10,
                      max: 100000,
                      defaultValue: errors.amount.message,
                    })}
                  </p>
                )}

                <p className="text-[11px] text-slate-400 dark:text-slate-500">
                  {t('wallet:deposit.minMaxNotice', isRTL ? 'الحد الأدنى: ١٠ ج.م • الحد الأقصى: ١٠٠,٠٠٠ ج.م' : 'Minimum: 10 EGP • Maximum: 100,000 EGP')}
                </p>
              </div>

              {/* Quick Amount Presets (Additive: Clicking accumulates amount) */}
              <QuickAmountPresets
                selectedAmount={typeof currentAmount === 'number' ? currentAmount : Number(currentAmount)}
                onSelectAmount={handleSelectPreset}
                disabled={isSubmitting}
              />

              {/* Order Summary Box (Clean & Uncluttered) */}
              <div className="rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 p-4 space-y-2.5">
                <div className="flex justify-between text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                  <span>{t('wallet:deposit.summaryAmount', 'مبلغ الشحن')}</span>
                  <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                    {formatPrice(currentAmount || 0, isRTL)} {t('wallet:balance.currency', 'ج.م')}
                  </span>
                </div>
                <div className="pt-2.5 border-t border-slate-200/60 dark:border-slate-700 flex justify-between text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">
                  <span>{t('wallet:deposit.summaryTotal', 'الإجمالي المستحق للدفع')}</span>
                  <span className="font-mono text-emerald-600 dark:text-emerald-400">
                    {formatPrice(currentAmount || 0, isRTL)} {t('wallet:balance.currency', 'ج.م')}
                  </span>
                </div>
              </div>

              {/* Submit CTA Button (Calm, Rich, Deep Emerald Green & Balanced Height) */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-12 sm:h-12.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white dark:bg-emerald-700 dark:hover:bg-emerald-600 font-extrabold text-sm sm:text-base border border-emerald-800/40 dark:border-emerald-600/40 shadow-sm hover:shadow-md active:scale-[0.99] transition-all flex items-center justify-center gap-2.5 disabled:opacity-60 disabled:pointer-events-none"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>
                      {isRedirecting
                        ? t('wallet:deposit.redirecting', 'جارٍ تحويلك بأمان إلى بوابة Paymob...')
                        : t('wallet:deposit.processing', 'جارٍ تجهيز جلسة الدفع...')}
                    </span>
                  </>
                ) : (
                  <>
                    <CreditCard className="w-5 h-5" />
                    <span>{t('wallet:deposit.submitButton', 'متابعة الدفع عبر Paymob')}</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Sidebar / Info Card (5 Columns) */}
          <div className="lg:col-span-5">
            <PaymobPaymentCard />
          </div>
        </div>
      </div>
    </div>
  );
};
