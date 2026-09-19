import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Building2,
  Zap,
  Smartphone,
  CheckCircle2,
  ArrowLeft,
  ArrowRight,
  AlertCircle,
  Clock,
} from 'lucide-react';
import type { PayoutMethod } from '../types/wallet.types';

export interface PayoutMethodOption {
  id: PayoutMethod;
  nameKey: string;
  defaultName: string;
  subtitleKey: string;
  defaultSubtitle: string;
  maxLimit: number;
  estimatedDeliveryKey: string;
  defaultDelivery: string;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
}

const METHODS: PayoutMethodOption[] = [
  {
    id: 'BANK_ACCOUNT',
    nameKey: 'withdraw.methods.bank',
    defaultName: 'تحويل لحساب بنكي',
    subtitleKey: 'withdraw.methods.bankDesc',
    defaultSubtitle: 'أي حساب بنكي مصري (CIB, الأهلي, مصر, QNB...)',
    maxLimit: 10000000,
    estimatedDeliveryKey: 'withdraw.methods.bankDelivery',
    defaultDelivery: 'من ٣ إلى ٥ أيام عمل',
    icon: Building2,
    iconBg: 'bg-blue-500/10 dark:bg-blue-500/20 border-blue-500/20',
    iconColor: 'text-blue-600 dark:text-blue-400',
  },
  {
    id: 'INSTAPAY',
    nameKey: 'withdraw.methods.instapay',
    defaultName: 'شبكة إنستاباي (InstaPay)',
    subtitleKey: 'withdraw.methods.instapayDesc',
    defaultSubtitle: 'عبر عنوان IPA أو رقم الهاتف المسجل بإنستاباي',
    maxLimit: 50000,
    estimatedDeliveryKey: 'withdraw.methods.bankDelivery',
    defaultDelivery: 'من ٣ إلى ٥ أيام عمل',
    icon: Zap,
    iconBg: 'bg-amber-500/10 dark:bg-amber-500/20 border-amber-500/20',
    iconColor: 'text-amber-600 dark:text-amber-400',
  },
  {
    id: 'VODAFONE_CASH',
    nameKey: 'withdraw.methods.vodafone',
    defaultName: 'فودافون كاش (Vodafone Cash)',
    subtitleKey: 'withdraw.methods.walletDesc',
    defaultSubtitle: 'تحويل مباشر لمحفظة 010',
    maxLimit: 50000,
    estimatedDeliveryKey: 'withdraw.methods.bankDelivery',
    defaultDelivery: 'من ٣ إلى ٥ أيام عمل',
    icon: Smartphone,
    iconBg: 'bg-rose-500/10 dark:bg-rose-500/20 border-rose-500/20',
    iconColor: 'text-rose-600 dark:text-rose-400',
  },
  {
    id: 'ORANGE_CASH',
    nameKey: 'withdraw.methods.orange',
    defaultName: 'أورنج كاش (Orange Cash)',
    subtitleKey: 'withdraw.methods.walletDesc',
    defaultSubtitle: 'تحويل مباشر لمحفظة 012',
    maxLimit: 50000,
    estimatedDeliveryKey: 'withdraw.methods.bankDelivery',
    defaultDelivery: 'من ٣ إلى ٥ أيام عمل',
    icon: Smartphone,
    iconBg: 'bg-orange-500/10 dark:bg-orange-500/20 border-orange-500/20',
    iconColor: 'text-orange-600 dark:text-orange-400',
  },
  {
    id: 'ETISALAT_CASH',
    nameKey: 'withdraw.methods.etisalat',
    defaultName: 'اتصالات كاش (Etisalat Cash)',
    subtitleKey: 'withdraw.methods.walletDesc',
    defaultSubtitle: 'تحويل مباشر لمحفظة 011',
    maxLimit: 50000,
    estimatedDeliveryKey: 'withdraw.methods.bankDelivery',
    defaultDelivery: 'من ٣ إلى ٥ أيام عمل',
    icon: Smartphone,
    iconBg: 'bg-emerald-500/10 dark:bg-emerald-500/20 border-emerald-500/20',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
  },
  {
    id: 'WE_PAY',
    nameKey: 'withdraw.methods.we',
    defaultName: 'وي باي (WE Pay)',
    subtitleKey: 'withdraw.methods.walletDesc',
    defaultSubtitle: 'تحويل مباشر لمحفظة 015',
    maxLimit: 50000,
    estimatedDeliveryKey: 'withdraw.methods.bankDelivery',
    defaultDelivery: 'من ٣ إلى ٥ أيام عمل',
    icon: Smartphone,
    iconBg: 'bg-purple-500/10 dark:bg-purple-500/20 border-purple-500/20',
    iconColor: 'text-purple-600 dark:text-purple-400',
  },
];

export interface PayoutMethodSelectorProps {
  selectedMethod: PayoutMethod | null;
  onSelectMethod: (method: PayoutMethod) => void;
  amount: number;
  onBack: () => void;
  onNext: () => void;
  disabled?: boolean;
}

export const PayoutMethodSelector: React.FC<PayoutMethodSelectorProps> = ({
  selectedMethod,
  onSelectMethod,
  amount,
  onBack,
  onNext,
  disabled = false,
}) => {
  const { t, i18n } = useTranslation(['wallet']);
  const isRTL = i18n.language.startsWith('ar');

  return (
    <div className="space-y-6">
      <div className="text-center sm:text-start space-y-1">
        <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white">
          {t('wallet:withdraw.selectMethodTitle', 'اختر وسيلة استلام الأموال')}
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {t(
            'wallet:withdraw.selectMethodSubtitle',
            'جميع الوسائل معتمدة ومحمية عبر البنوك المصرية وشبكات الدفع الرسمية'
          )}
        </p>
      </div>

      {/* Grid of 6 Payout Method Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {METHODS.map((method) => {
          const isSelected = selectedMethod === method.id;
          const isOverLimit = amount > method.maxLimit;
          const IconComponent = method.icon;

          return (
            <div
              key={method.id}
              onClick={() => {
                if (!isOverLimit && !disabled) {
                  onSelectMethod(method.id);
                }
              }}
              className={`relative rounded-2xl p-4 sm:p-5 border-2 transition-all duration-300 cursor-pointer select-none text-start flex flex-col justify-between ${
                isOverLimit
                  ? 'border-slate-200/60 dark:border-slate-800/60 bg-slate-100/60 dark:bg-slate-900/30 opacity-60 cursor-not-allowed'
                  : isSelected
                  ? 'border-amber-500 dark:border-amber-400 bg-amber-500/5 dark:bg-amber-500/10 shadow-md ring-2 ring-amber-500/20'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-amber-500/80 dark:hover:border-amber-500/70 hover:shadow-md'
              }`}
            >
              {/* Card Header & Icon */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2.5 rounded-xl border ${method.iconBg} ${method.iconColor}`}
                  >
                    <IconComponent className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                      {t(`wallet:${method.nameKey}`, method.defaultName)}
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      {t(`wallet:${method.subtitleKey}`, method.defaultSubtitle)}
                    </p>
                  </div>
                </div>

                {/* Selection Checkmark */}
                {isSelected && !isOverLimit && (
                  <CheckCircle2 className="w-5 h-5 text-amber-500 dark:text-amber-400 shrink-0" />
                )}
              </div>

              {/* Card Footer: Limits & Estimated Delivery */}
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-1 text-slate-400 dark:text-slate-500">
                  <Clock className="w-3 h-3" />
                  <span className="font-mono">{t(`wallet:${method.estimatedDeliveryKey}`, method.defaultDelivery)}</span>
                </div>

                {isOverLimit ? (
                  <span className="flex items-center gap-1 font-bold text-rose-500 dark:text-rose-400">
                    <AlertCircle className="w-3 h-3" />
                    {t('wallet:withdraw.limitExceeded', 'المبلغ يتجاوز الحد')}
                  </span>
                ) : (
                  <span className="font-bold text-slate-500 dark:text-slate-400 font-mono">
                    {t('wallet:withdraw.maxLimitLabel', 'الحد الأقصى: {{limit}} ج.م', {
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

      {/* Navigation Buttons (Back / Next) */}
      <div className="flex items-center gap-3 pt-2">
        <button
          type="button"
          disabled={disabled}
          onClick={onBack}
          className="h-12 px-5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-amber-500/60 dark:hover:border-amber-500/60 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs sm:text-sm transition-all duration-200 cursor-pointer flex items-center gap-2"
        >
          {isRTL ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
          <span>{t('wallet:actions.previous', 'السابق')}</span>
        </button>

        <button
          type="button"
          disabled={!selectedMethod || disabled}
          onClick={onNext}
          className="flex-1 h-12 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-sm sm:text-base shadow-sm hover:shadow-md active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:pointer-events-none cursor-pointer group"
        >
          <span>{t('wallet:withdraw.continueToDetails', 'متابعة لتعبئة بيانات الحساب')}</span>
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
