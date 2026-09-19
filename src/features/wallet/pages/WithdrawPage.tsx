import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  HelpCircle,
  AlertCircle,
  Check,
  Loader2,
} from 'lucide-react';
import { useWallet } from '../hooks/useWallet';
import { useFeePreview } from '../hooks/useFeePreview';
import { useRequestWithdrawal } from '../hooks/useRequestWithdrawal';
import { WithdrawStepIndicator } from '../components/WithdrawStepIndicator';
import { WithdrawAmountStep, type PayoutCategory } from '../components/WithdrawAmountStep';
import { PayoutDetailsForm } from '../components/PayoutDetailsForm';
import { WithdrawSummaryStep } from '../components/WithdrawSummaryStep';
import { FeePreviewCard } from '../components/FeePreviewCard';
import { sanitizePayoutDetails } from '../schemas/withdraw.schema';
import type { PayoutMethod, PayoutDetailsInput } from '../types/wallet.types';
import { normalizeArabicDigits } from '@/utils/formatters';
import { ROUTES } from '@/constants/routes.constants';

const METHOD_MAX_LIMITS: Record<PayoutCategory, number> = {
  BANK_ACCOUNT: 10000000,
  INSTAPAY: 50000,
  MOBILE_WALLET: 50000,
};

export const WithdrawPage: React.FC = () => {
  const { t, i18n } = useTranslation(['wallet', 'common']);
  const isRTL = i18n.language.startsWith('ar');

  const { wallet, isLoading: isWalletLoading } = useWallet();
  const { requestWithdrawal, isPending: isSubmitting } = useRequestWithdrawal();

  // Wizard state (3 Steps)
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [maxAccessibleStep, setMaxAccessibleStep] = useState<number>(1);
  const [amount, setAmount] = useState<number>(500);
  const [payoutCategory, setPayoutCategory] = useState<PayoutCategory | null>(null);
  const [resolvedPayoutMethod, setResolvedPayoutMethod] = useState<PayoutMethod>('BANK_ACCOUNT');
  const [payoutDetails, setPayoutDetails] = useState<PayoutDetailsInput>({});

  const availableBalance = Number(wallet?.availableBalance || 0);

  // Fee calculation via backend query
  const { feePreview, isLoading: isFeeLoading, isError: isFeeError } = useFeePreview({
    amount,
    payoutMethod: payoutCategory ? resolvedPayoutMethod : null,
  });

  // Set document title
  useEffect(() => {
    document.title = `${t('wallet:withdraw.pageTitle', 'طلب سحب رصيد')} | ${t(
      'common:appName',
      'مزادك'
    )}`;
  }, [t, i18n.language]);

  // Adjust max accessible step as user progresses
  const handleStepAdvance = (nextStep: number) => {
    setCurrentStep(nextStep);
    setMaxAccessibleStep((prev) => Math.max(prev, nextStep));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStepClick = (step: number) => {
    if (step <= maxAccessibleStep) {
      setCurrentStep(step);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Step 1: Amount changes
  const handleAmountChange = (newAmount: number) => {
    setAmount(newAmount);
  };

  // Step 1: Category selection
  const handleSelectCategory = (cat: PayoutCategory) => {
    setPayoutCategory(cat);
    if (cat === 'BANK_ACCOUNT') {
      setResolvedPayoutMethod('BANK_ACCOUNT');
    } else if (cat === 'INSTAPAY') {
      setResolvedPayoutMethod('INSTAPAY');
    } else if (cat === 'MOBILE_WALLET') {
      // If phone already typed, detect operator; else fallback to VODAFONE_CASH
      const phone = detailsPhone(payoutDetails.phoneNumber);
      if (phone.startsWith('011')) setResolvedPayoutMethod('ETISALAT_CASH');
      else if (phone.startsWith('012')) setResolvedPayoutMethod('ORANGE_CASH');
      else if (phone.startsWith('015')) setResolvedPayoutMethod('WE_PAY');
      else setResolvedPayoutMethod('VODAFONE_CASH');
    }
  };

  const detailsPhone = (phone?: string) => (phone ? phone.trim().replace(/[\s-]/g, '') : '');

  // Step 1 Validation
  const isAmountValid = amount >= 50 && amount <= availableBalance;
  const isMethodOverLimit = Boolean(
    payoutCategory && amount > METHOD_MAX_LIMITS[payoutCategory]
  );
  const canProceedStep1 =
    isAmountValid &&
    payoutCategory !== null &&
    !isMethodOverLimit &&
    !isWalletLoading &&
    !isSubmitting;

  // Step 2 Validation
  const isStep2Valid = () => {
    if (payoutCategory === 'BANK_ACCOUNT') {
      const hasBank = Boolean(payoutDetails.bankName && payoutDetails.bankName.trim().length >= 2);
      const hasHolder = Boolean(
        payoutDetails.accountHolderName && payoutDetails.accountHolderName.trim().length >= 3
      );
      const acc = payoutDetails.accountNumber ? payoutDetails.accountNumber.trim() : '';
      const iban = payoutDetails.iban ? payoutDetails.iban.trim().replace(/\s/g, '') : '';
      const hasAccountOrIban = acc.length >= 6 || iban.length === 29;
      return hasBank && hasHolder && hasAccountOrIban;
    }

    if (payoutCategory === 'INSTAPAY') {
      const ipa = payoutDetails.ipaAddress ? payoutDetails.ipaAddress.trim() : '';
      const phone = payoutDetails.phoneNumber
        ? normalizeArabicDigits(payoutDetails.phoneNumber.trim())
        : '';
      const hasIpaOrPhone = ipa.length >= 3 || /^01[0125][0-9]{8}$/.test(phone);
      return hasIpaOrPhone;
    }

    // Wallets
    const phone = payoutDetails.phoneNumber
      ? normalizeArabicDigits(payoutDetails.phoneNumber.trim()).replace(/[\s-]/g, '')
      : '';
    return /^01[0125][0-9]{8}$/.test(phone);
  };

  // Step 3: Final Submission
  const handleConfirmWithdrawal = async () => {
    if (!payoutCategory || amount <= 0) return;

    const cleanDetails = sanitizePayoutDetails(
      resolvedPayoutMethod,
      payoutDetails as Record<string, unknown>
    );

    await requestWithdrawal({
      amount,
      payoutMethod: resolvedPayoutMethod,
      payoutDetails: cleanDetails,
    });
  };

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 py-6 sm:py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Top Back Navigation */}
        <div className="flex items-center justify-between">
          <Link
            to={ROUTES.WALLET}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-amber-500/60 dark:hover:border-amber-500/60 bg-white dark:bg-slate-900 text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 hover:text-amber-600 dark:hover:text-amber-400 transition-all duration-200 shadow-2xs group"
          >
            {isRTL ? (
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            ) : (
              <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
            )}
            <span>
              {t('wallet:withdraw.backToWallet', isRTL ? 'العودة للمحفظة' : 'Back to Wallet')}
            </span>
          </Link>

          {/* Daily Limit badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/30 text-[11px] font-bold">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>
              {t('wallet:withdraw.dailyLimitBadge', 'طلب سحب واحد يومياً (بتوقيت مصر)')}
            </span>
          </div>
        </div>

        {/* Page Title */}
        <div className="text-center space-y-1.5 pb-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {t('wallet:withdraw.pageTitle', 'طلب سحب رصيد')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            {t(
              'wallet:withdraw.pageSubtitle',
              'سحب آمن لأموالك المتاحة عبر الحسابات البنكية والمحافظ الإلكترونية وإنستاباي'
            )}
          </p>
        </div>

        {/* 3-Step Progress Indicator */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-amber-500/60 dark:hover:border-amber-500/60 bg-white dark:bg-slate-900 p-4 sm:p-5 shadow-2xs hover:shadow-sm transition-all duration-300">
          <WithdrawStepIndicator
            currentStep={currentStep}
            maxAccessibleStep={maxAccessibleStep}
            onStepClick={handleStepClick}
          />
        </div>

        {/* 2 Columns Layout: Step Content (7 cols) + Sticky Fee Breakdown Sidebar (5 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Main Wizard Step Area */}
          <div className="lg:col-span-7">
            {currentStep === 1 && (
              <WithdrawAmountStep
                amount={amount}
                availableBalance={availableBalance}
                selectedCategory={payoutCategory}
                onSelectCategory={handleSelectCategory}
                onChangeAmount={handleAmountChange}
                onNext={() => handleStepAdvance(2)}
                disabled={isWalletLoading || isSubmitting}
              />
            )}

            {currentStep === 2 && payoutCategory && (
              <PayoutDetailsForm
                payoutCategory={payoutCategory}
                resolvedPayoutMethod={resolvedPayoutMethod}
                onResolvedPayoutMethodChange={setResolvedPayoutMethod}
                details={payoutDetails}
                onChangeDetails={setPayoutDetails}
                onBack={() => handleStepAdvance(1)}
                onNext={() => handleStepAdvance(3)}
                disabled={isSubmitting}
              />
            )}

            {currentStep === 3 && payoutCategory && (
              <WithdrawSummaryStep
                payoutMethod={resolvedPayoutMethod}
                details={payoutDetails}
                onBack={() => handleStepAdvance(2)}
                onConfirm={handleConfirmWithdrawal}
                isSubmitting={isSubmitting}
              />
            )}
          </div>

          {/* Sidebar / Live Fee Preview Card & Security Info & Desktop Action Buttons */}
          <div className="lg:col-span-5 space-y-4 lg:sticky lg:top-20">
            <FeePreviewCard
              amount={amount}
              payoutMethod={payoutCategory ? resolvedPayoutMethod : null}
              feePreview={feePreview}
              isLoading={isFeeLoading}
              isError={isFeeError}
            />

            {/* Desktop Action Buttons (Rendered below FeePreviewCard on lg screens) */}
            {currentStep === 1 && (
              <div className="hidden lg:block">
                <button
                  type="button"
                  disabled={!canProceedStep1}
                  onClick={() => handleStepAdvance(2)}
                  className="w-full h-12 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-sm sm:text-base shadow-sm hover:shadow-md active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:pointer-events-none cursor-pointer group"
                >
                  <span>
                    {t(
                      'wallet:withdraw.continueToDetails',
                      isRTL ? 'متابعة لبيانات التحويل' : 'Continue to Details'
                    )}
                  </span>
                  {isRTL ? (
                    <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                  ) : (
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  )}
                </button>
              </div>
            )}

            {currentStep === 2 && (
              <div className="hidden lg:flex items-center gap-3">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => handleStepAdvance(1)}
                  className="h-12 px-5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-amber-500/60 dark:hover:border-amber-500/60 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs sm:text-sm transition-all duration-200 cursor-pointer flex items-center gap-2"
                >
                  {isRTL ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
                  <span>{t('wallet:actions.previous', isRTL ? 'السابق' : 'Previous')}</span>
                </button>

                <button
                  type="button"
                  disabled={!isStep2Valid() || isSubmitting}
                  onClick={() => handleStepAdvance(3)}
                  className="flex-1 h-12 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-sm sm:text-base shadow-sm hover:shadow-md active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:pointer-events-none cursor-pointer group"
                >
                  <span>
                    {t(
                      'wallet:withdraw.continueToReview',
                      isRTL ? 'متابعة للمراجعة والتأكيد' : 'Continue to Review'
                    )}
                  </span>
                  {isRTL ? (
                    <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                  ) : (
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  )}
                </button>
              </div>
            )}

            {currentStep === 3 && (
              <div className="hidden lg:flex items-center gap-3">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => handleStepAdvance(2)}
                  className="h-12 px-5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-amber-500/60 dark:hover:border-amber-500/60 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs sm:text-sm transition-all duration-200 cursor-pointer flex items-center gap-2 disabled:opacity-50"
                >
                  {isRTL ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
                  <span>{t('wallet:actions.previous', isRTL ? 'السابق' : 'Previous')}</span>
                </button>

                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleConfirmWithdrawal}
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
            )}

            {/* Platform Trust & Policy Box (Shown ONLY on Step 1) */}
            {currentStep === 1 && (
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-amber-500/60 dark:hover:border-amber-500/60 bg-white dark:bg-slate-900 p-4 sm:p-5 space-y-3 text-xs shadow-2xs hover:shadow-sm transition-all duration-300">
                <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200 font-bold">
                  <HelpCircle className="w-4 h-4 text-amber-500" />
                  <h4>{t('wallet:withdraw.policyTitle', 'معلومات وسياسة السحب')}</h4>
                </div>

                <ul className="space-y-2 text-slate-500 dark:text-slate-400 text-[11px] sm:text-xs list-disc list-inside">
                  <li>
                    {t(
                      'wallet:withdraw.policyPoint1',
                      'يتم حجز مبلغ السحب مؤقتاً من رصيدك المتاح لضمان عدم استخدامه في المزايدات.'
                    )}
                  </li>
                  <li>
                    {t(
                      'wallet:withdraw.policyPoint2',
                      'تتم مراجعة وتحويل المبالغ بأمان عبر البنوك المصرية وشبكات الدفع الرسمية.'
                    )}
                  </li>
                  <li>
                    {t(
                      'wallet:withdraw.policyPoint3',
                      'يمكنك إلغاء طلب السحب في أي وقت طالما كان قيد المراجعة، وسيتم فك الحجز فوراً.'
                    )}
                  </li>
                </ul>

                <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center gap-2 text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                  <ShieldCheck className="w-4 h-4 shrink-0" />
                  <span>
                    {t('wallet:withdraw.verifiedPartner', 'معاملات مالية آمنة وموثقة')}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
