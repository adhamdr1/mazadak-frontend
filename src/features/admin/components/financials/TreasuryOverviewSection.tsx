import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Landmark,
  Lock,
  Clock,
  ShieldCheck,
  Coins,
  CheckCircle2,
} from 'lucide-react';
import { formatAdminCurrency } from '../../utils/admin.utils';
import { toLocalizedDigits } from '@/utils/formatters';
import type { TreasuryStats } from '../../types/admin.types';
import { cn } from '@/utils/cn';

export interface TreasuryOverviewSectionProps {
  treasury?: TreasuryStats;
  isLoading?: boolean;
}

export const TreasuryOverviewSection: React.FC<TreasuryOverviewSectionProps> = ({
  treasury,
  isLoading = false,
}) => {
  const { t, i18n } = useTranslation(['admin', 'common']);
  const isRTL = i18n.language?.startsWith('ar');

  const pendingCount = treasury?.pendingWithdrawalsCount || 0;

  const cards = [
    {
      id: 'totalWalletBalance',
      title: t('dashboard.treasuryCard.totalPlatform', {
        defaultValue: 'إجمالي السيولة بالمنصة',
      }),
      amount: treasury?.totalWalletBalance,
      icon: Landmark,
      color: 'amber',
      bgColor: 'bg-amber-500/10 dark:bg-amber-500/15',
      textColor: 'text-amber-600 dark:text-amber-400',
      borderColor: 'border-amber-500/20 dark:border-amber-500/30',
      glow: 'shadow-amber-500/5',
    },
    {
      id: 'pendingWithdrawals',
      title: t('dashboard.treasuryCard.pendingWithdrawals', {
        defaultValue: 'معلق في طلبات السحب',
      }),
      amount: treasury?.totalPendingWithdrawals,
      badgeText:
        pendingCount > 0
          ? `${toLocalizedDigits(pendingCount, isRTL)} ${isRTL ? 'معلق' : 'pending'}`
          : undefined,
      badgeUrgent: pendingCount > 0,
      icon: Clock,
      color: 'rose',
      bgColor: 'bg-rose-500/10 dark:bg-rose-500/15',
      textColor: 'text-rose-600 dark:text-rose-400',
      borderColor: 'border-rose-500/20 dark:border-rose-500/30',
      glow: 'shadow-rose-500/5',
    },
    {
      id: 'heldInEscrow',
      title: t('dashboard.treasuryCard.heldInEscrow', {
        defaultValue: 'محتجز في الضمان المالي',
      }),
      amount: treasury?.totalHeldInEscrow,
      icon: ShieldCheck,
      color: 'emerald',
      bgColor: 'bg-emerald-500/10 dark:bg-emerald-500/15',
      textColor: 'text-emerald-600 dark:text-emerald-400',
      borderColor: 'border-emerald-500/20 dark:border-emerald-500/30',
      glow: 'shadow-emerald-500/5',
    },
    {
      id: 'heldInWallets',
      title: t('dashboard.treasuryCard.heldInWallets', {
        defaultValue: 'محتجز في المحافظ (مزايدات)',
      }),
      amount: treasury?.totalHeldInWallets ?? treasury?.heldInWallets,
      icon: Lock,
      color: 'blue',
      bgColor: 'bg-blue-500/10 dark:bg-blue-500/15',
      textColor: 'text-blue-600 dark:text-blue-400',
      borderColor: 'border-blue-500/20 dark:border-blue-500/30',
      glow: 'shadow-blue-500/5',
    },
    {
      id: 'collectedFees',
      title: t('dashboard.treasuryCard.collectedFees', {
        defaultValue: 'رسوم وأرباح المنصة المحصلة',
      }),
      amount: treasury?.totalCollectedFees,
      icon: Coins,
      color: 'violet',
      bgColor: 'bg-violet-500/10 dark:bg-violet-500/15',
      textColor: 'text-violet-600 dark:text-violet-400',
      borderColor: 'border-violet-500/20 dark:border-violet-500/30',
      glow: 'shadow-violet-500/5',
    },
    {
      id: 'completedPayouts',
      title: t('dashboard.treasuryCard.completedPayouts', {
        defaultValue: 'إجمالي المسحوبات المصروفة',
      }),
      amount: treasury?.totalCompletedPayouts,
      icon: CheckCircle2,
      color: 'slate',
      bgColor: 'bg-slate-500/10 dark:bg-slate-500/15',
      textColor: 'text-slate-700 dark:text-slate-300',
      borderColor: 'border-slate-500/20 dark:border-slate-700',
      glow: 'shadow-slate-500/5',
    },
  ];

  return (
    <section>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
        {cards.map((card) => {
          const Icon = card.icon;
          const formattedAmount = formatAdminCurrency(card.amount, undefined, isRTL);
          const parts = formattedAmount.split(/\s+/);
          const currency = parts.length >= 2 ? parts.pop() : isRTL ? 'ج.م' : 'EGP';
          const value = parts.join(' ');

          return (
            <div
              key={card.id}
              className={cn(
                'relative p-3.5 rounded-2xl bg-white dark:bg-slate-900/90 border transition-all duration-200',
                'hover:shadow-md hover:-translate-y-0.5',
                card.borderColor,
                card.glow
              )}
            >
              <div className="flex items-start justify-between gap-2 mb-2.5">
                <div className={cn('p-2 rounded-xl shrink-0', card.bgColor, card.textColor)}>
                  <Icon className="w-4 h-4" />
                </div>
                {card.badgeText && (
                  <span
                    className={cn(
                      'px-2 py-0.5 text-[10px] font-black rounded-full border',
                      card.badgeUrgent
                        ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                    )}
                  >
                    {card.badgeText}
                  </span>
                )}
              </div>

              <div className="space-y-1">
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 line-clamp-1">
                  {card.title}
                </p>

                {isLoading ? (
                  <div className="h-6 w-24 bg-slate-100 dark:bg-slate-800 animate-pulse rounded-md mt-1" />
                ) : (
                  <div className="flex items-baseline gap-1 flex-wrap">
                    <span className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
                      {value}
                    </span>
                    <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500">
                      {currency}
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default TreasuryOverviewSection;
