import React from 'react';
import { useTranslation } from 'react-i18next';
import { ShieldCheck, CreditCard, Smartphone, Zap, CheckCircle2 } from 'lucide-react';

export const PaymobPaymentCard: React.FC = () => {
  const { t } = useTranslation(['wallet']);

  const paymentMethods = [
    {
      id: 'cards',
      icon: <CreditCard className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />,
      title: t('wallet:deposit.methods.cards', 'البطاقات البنكية'),
      subtitle: 'Visa • Mastercard • Meeza',
    },
    {
      id: 'wallets',
      icon: <Smartphone className="w-4 h-4 text-rose-600 dark:text-rose-400" />,
      title: t('wallet:deposit.methods.wallets', 'المحافظ الإلكترونية'),
      subtitle: 'Vodafone Cash • Orange • Etisalat • WE',
    },
    {
      id: 'instapay',
      icon: <Zap className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />,
      title: t('wallet:deposit.methods.instapay', 'إنستاباي'),
      subtitle: 'InstaPay Direct Transfer',
    },
  ];

  return (
    <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-sm space-y-5">
      {/* Header with Security Badge */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
              {t('wallet:deposit.gatewayTitle', 'بوابة الدفع الإلكتروني الموحدة')}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {t('wallet:deposit.gatewaySubtitle', 'مدعوم رسمياً ومعتمد من البنك المركزي المصري عبر Paymob')}
            </p>
          </div>
        </div>
      </div>

      {/* Methods List */}
      <div className="grid grid-cols-1 gap-2.5">
        {paymentMethods.map((method) => (
          <div
            key={method.id}
            className="flex items-center justify-between p-3 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-800/30"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-white dark:bg-slate-800 shadow-2xs border border-slate-200/60 dark:border-slate-700">
                {method.icon}
              </div>
              <div>
                <p className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
                  {method.title}
                </p>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 font-mono">
                  {method.subtitle}
                </p>
              </div>
            </div>
            <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md border border-emerald-500/20">
              {t('wallet:deposit.instantDeposit', 'فوري')}
            </span>
          </div>
        ))}
      </div>

      {/* Security Assurance Points */}
      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1.5 text-xs text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
          <span>{t('wallet:deposit.securityNote1', 'تشفير بنكي 256-bit بمعايير PCI-DSS العالمية')}</span>
        </div>
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
          <span>{t('wallet:deposit.securityNote2', 'يتم تحويلك مباشرة لصفحة الدفع المشفرة ولا يتم تخزين بيانات بطاقتك')}</span>
        </div>
      </div>
    </div>
  );
};
