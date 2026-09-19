import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeft,
  ArrowRight,
  Wallet,
  X,
  Building2,
  Zap,
  Smartphone,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { formatPrice, normalizeArabicDigits, toLocalizedDigits } from '@/utils/formatters';

export type PayoutCategory = 'BANK_ACCOUNT' | 'INSTAPAY' | 'MOBILE_WALLET';

export interface PayoutMethodOption {
  id: PayoutCategory;
  nameKey: string;
  defaultName: string;
  subtitleKey: string;
  defaultSubtitle: string;
  maxLimit: number;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
}

const METHOD_OPTIONS: PayoutMethodOption[] = [
  {
    id: 'BANK_ACCOUNT',
    nameKey: 'withdraw.methods.bank',
    defaultName: 'حساب بنكي',
    subtitleKey: 'withdraw.methods.bankDesc',
    defaultSubtitle: 'أي حساب بنكي مصري (CIB، الأهلي، مصر، QNB...)',
    maxLimit: 10000000,
    icon: Building2,
    iconBg: 'bg-blue-500/10 dark:bg-blue-500/20 border-blue-500/20',
    iconColor: 'text-blue-600 dark:text-blue-400',
  },
  {
    id: 'INSTAPAY',
    nameKey: 'withdraw.methods.instapay',
    defaultName: 'إنستاباي',
    subtitleKey: 'withdraw.methods.instapayDesc',
    defaultSubtitle: 'عبر عنوان IPA أو رقم الهاتف المسجل بإنستاباي',
    maxLimit: 50000,
    icon: Zap,
    iconBg: 'bg-amber-500/10 dark:bg-amber-500/20 border-amber-500/20',
    iconColor: 'text-amber-600 dark:text-amber-400',
  },
  {
    id: 'MOBILE_WALLET',
    nameKey: 'withdraw.methods.wallet',
    defaultName: 'محفظة كاش',
    subtitleKey: 'withdraw.methods.walletGeneralDesc',
    defaultSubtitle: 'فودافون كاش، أورنج كاش، اتصالات كاش، وي باي',
    maxLimit: 50000,
    icon: Smartphone,
    iconBg: 'bg-emerald-500/10 dark:bg-emerald-500/20 border-emerald-500/20',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
  },
];

export interface WithdrawAmountStepProps {
  amount: number;
  availableBalance: number;
  selectedCategory: PayoutCategory | null;
  onSelectCategory: (category: PayoutCategory) => void;
  onChangeAmount: (amount: number) => void;
  onNext: () => void;
  disabled?: boolean;
}

const PRESETS = [100, 500, 1000, 5000];

export const WithdrawAmountStep: React.FC<WithdrawAmountStepProps> = ({
  amount,
  availableBalance,
  selectedCategory,
  onSelectCategory,
  onChangeAmount,
  onNext,
  disabled = false,
}) => {
  const { t, i18n } = useTranslation(['wallet']);
  const isRTL = i18n.language.startsWith('ar');

  const [displayAmount, setDisplayAmount] = useState<string>(() =>
    amount > 0 ? (isRTL ? toLocalizedDigits(String(amount), true) : String(amount)) : ''
  );

  useEffect(() => {
    if (amount > 0) {
      setDisplayAmount(isRTL ? toLocalizedDigits(String(amount), true) : String(amount));
    } else {
      setDisplayAmount('');
    }
  }, [amount, isRTL]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const normalized = normalizeArabicDigits(raw).replace(/[^0-9.]/g, '');
    const localized = isRTL ? toLocalizedDigits(normalized, true) : normalized;
    setDisplayAmount(localized);
    onChangeAmount(normalized === '' ? 0 : Number(normalized));
  };

  const handleClear = () => {
    setDisplayAmount('');
    onChangeAmount(0);
  };

  const handleMaxClick = () => {
    const max = Math.floor(availableBalance);
    if (max > 0) {
      onChangeAmount(max);
      setDisplayAmount(isRTL ? toLocalizedDigits(String(max), true) : String(max));
    }
  };

  const handleAddPreset = (preset: number) => {
    const next = Math.min(amount + preset, availableBalance > 0 ? availableBalance : 10000000);
    onChangeAmount(next);
    setDisplayAmount(isRTL ? toLocalizedDigits(String(next), true) : String(next));
  };

  // Validation states
  const isBelowMin = amount > 0 && amount < 50;
  const isAboveAvailable = amount > availableBalance;
  const isAmountValid = amount >= 50 && amount <= availableBalance;

  // Selected method limit validation
  const activeMethodOption = METHOD_OPTIONS.find((m) => m.id === selectedCategory);
  const isMethodOverLimit = Boolean(
    activeMethodOption && amount > activeMethodOption.maxLimit
  );

  const canProceed = isAmountValid && selectedCategory && !isMethodOverLimit && !disabled;

  return (
    <div className="space-y-6">
      {/* 1. Available Balance Helper Card */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-amber-500/60 dark:hover:border-amber-500/60 bg-white dark:bg-slate-900 p-4 sm:p-5 flex items-center justify-between shadow-2xs hover:shadow-sm transition-all duration-300">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            <Wallet className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
              {t('wallet:balance.available', 'الرصيد المتاح للسحب')}
            </p>
            <p className="text-lg sm:text-xl font-extrabold font-mono text-slate-900 dark:text-white">
              {formatPrice(availableBalance, isRTL)}{' '}
              <span className="text-xs font-bold text-slate-400 dark:text-slate-500">
                {t('wallet:balance.currency', 'ج.م')}
              </span>
            </p>
          </div>
        </div>

        {availableBalance >= 50 && (
          <button
            type="button"
            disabled={disabled}
            onClick={handleMaxClick}
            className="px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 text-xs font-extrabold transition-all active:scale-95 cursor-pointer disabled:opacity-50"
          >
            {t('wallet:withdraw.maxButton', 'سحب كامل المتاح')}
          </button>
        )}
      </div>

      {/* 2. Main Amount Input Box */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-amber-500/60 dark:hover:border-amber-500/60 bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-sm hover:shadow-md transition-all duration-300 space-y-5">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label
              htmlFor="withdraw-amount-input"
              className="block text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200"
            >
              {t('wallet:withdraw.amountInputLabel', 'المبلغ المراد سحبه')}
            </label>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              {t('wallet:withdraw.minWithdrawNote', 'الحد الأدنى ٥٠ ج.م')}
            </span>
          </div>

          <div className="relative rounded-xl shadow-2xs">
            <input
              id="withdraw-amount-input"
              type="text"
              inputMode="decimal"
              autoComplete="off"
              disabled={disabled}
              value={displayAmount}
              onChange={handleInputChange}
              placeholder={isRTL ? '٥٠٠' : '500'}
              style={{ outline: 'none' }}
              className={`w-full h-13 sm:h-14 px-4 text-lg sm:text-xl font-mono font-bold bg-slate-50/50 dark:bg-slate-800/50 border-2 rounded-xl outline-none focus:outline-none transition-all disabled:opacity-50 ${
                isAboveAvailable || isBelowMin
                  ? 'border-rose-500 dark:border-rose-500 text-rose-600 dark:text-rose-400 focus:border-rose-600 focus:ring-2 focus:ring-rose-500/20'
                  : isAmountValid
                  ? 'border-emerald-500/80 dark:border-emerald-500/80 text-slate-900 dark:text-white focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20'
                  : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 text-slate-900 dark:text-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20'
              }`}
            />

            {/* Clear Button */}
            {displayAmount && !disabled && (
              <button
                type="button"
                onClick={handleClear}
                className={`absolute top-1/2 -translate-y-1/2 p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-700/60 transition-colors ${
                  isRTL ? 'left-12' : 'right-12'
                }`}
                title={t('wallet:actions.clear', 'مسح المبلغ')}
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

          {/* Real-time Alerts */}
          {isBelowMin && (
            <div className="text-xs font-semibold text-rose-500 dark:text-rose-400 pt-0.5">
              <span>{t('wallet:validation.withdrawMin', 'الحد الأدنى لطلب السحب هو 50 ج.م')}</span>
            </div>
          )}

          {isAboveAvailable && (
            <div className="text-xs font-semibold text-rose-500 dark:text-rose-400 pt-0.5">
              <span>
                {t(
                  'wallet:validation.insufficientFunds',
                  'المبلغ المطلوب يتجاوز رصيدك المتاح في المحفظة'
                )}
              </span>
            </div>
          )}

          {isAmountValid && (
            <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 pt-0.5">
              <span>{t('wallet:withdraw.amountValid', 'المبلغ صحيح ومتاح في رصيدك')}</span>
            </div>
          )}
        </div>

        {/* Quick Add Presets */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-500 dark:text-slate-400">
            {t('wallet:withdraw.quickAddPresets', 'إضافة مبالغ سريعة')}
          </label>
          <div className="grid grid-cols-4 gap-2">
            {PRESETS.map((preset) => (
              <button
                key={preset}
                type="button"
                disabled={disabled || (amount + preset > availableBalance && availableBalance > 0)}
                onClick={() => handleAddPreset(preset)}
                className="py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/40 hover:bg-amber-500/10 hover:border-amber-500/40 dark:hover:bg-amber-500/20 text-xs font-bold font-mono text-slate-700 dark:text-slate-300 hover:text-amber-600 dark:hover:text-amber-400 transition-all duration-200 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                +{isRTL ? toLocalizedDigits(String(preset), true) : preset}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Payout Method Selection (3 Clean Cards) */}
      <div className="space-y-3 pt-1">
        <div className="text-start space-y-0.5">
          <h2 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white">
            {t('wallet:withdraw.selectMethodTitle', 'اختر وسيلة استلام الأموال')}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {t(
              'wallet:withdraw.selectMethodSubtitle',
              'جميع الوسائل معتمدة ومرتبطة بغرفة المقاصة والبنك المركزي المصري'
            )}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          {METHOD_OPTIONS.map((method) => {
            const isSelected = selectedCategory === method.id;
            const isOverLimit = amount > method.maxLimit;
            const IconComponent = method.icon;

            return (
              <div
                key={method.id}
                onClick={() => {
                  if (!isOverLimit && !disabled) {
                    onSelectCategory(method.id);
                  }
                }}
                className={`relative rounded-2xl p-4 border-2 transition-all duration-300 cursor-pointer select-none text-start flex flex-col justify-between ${
                  isOverLimit
                    ? 'border-slate-200/60 dark:border-slate-800/60 bg-slate-100/60 dark:bg-slate-900/30 opacity-60 cursor-not-allowed'
                    : isSelected
                    ? 'border-amber-500 dark:border-amber-400 bg-amber-500/5 dark:bg-amber-500/10 shadow-md ring-2 ring-amber-500/20'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-amber-500/80 dark:hover:border-amber-500/70 hover:shadow-md'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className={`p-2.5 rounded-xl border ${method.iconBg} ${method.iconColor}`}>
                      <IconComponent className="w-5 h-5" />
                    </div>

                    {isSelected && !isOverLimit && (
                      <CheckCircle2 className="w-5 h-5 text-amber-500 dark:text-amber-400 shrink-0" />
                    )}
                  </div>

                  <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                    {t(`wallet:${method.nameKey}`, method.defaultName)}
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-snug">
                    {t(`wallet:${method.subtitleKey}`, method.defaultSubtitle)}
                  </p>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px]">
                  {isOverLimit ? (
                    <span className="flex items-center gap-1 font-bold text-rose-500 dark:text-rose-400">
                      <AlertCircle className="w-3 h-3" />
                      {t('wallet:withdraw.limitExceeded', 'المبلغ يتجاوز الحد')}
                    </span>
                  ) : (
                    <span className="font-bold text-slate-500 dark:text-slate-400 font-mono">
                      {t('wallet:withdraw.maxLimitLabel', 'الحد: {{limit}} ج.م', {
                        limit: isRTL
                          ? method.maxLimit.toLocaleString('ar-EG')
                          : method.maxLimit.toLocaleString('en-US'),
                        defaultValue: `الحد: ${
                          isRTL
                            ? method.maxLimit.toLocaleString('ar-EG')
                            : method.maxLimit.toLocaleString('en-US')
                        } ج.م`,
                      })}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Next Step CTA — Mobile / Tablet (< lg) only, rendered in sidebar on Desktop */}
      <div className="pt-2 block lg:hidden">
        <button
          type="button"
          disabled={!canProceed}
          onClick={onNext}
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
    </div>
  );
};
