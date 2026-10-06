import React from 'react';
import { useTranslation } from 'react-i18next';
import { Landmark, ArrowUpRight, ShieldCheck, Lock, Clock, DollarSign } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/constants/routes.constants';
import { formatAdminCurrency } from '../../utils/admin.utils';
import type { TreasuryStats } from '../../types/admin.types';
import { toLocalizedDigits } from '@/utils/formatters';
import { cn } from '@/utils/cn';

export interface TreasuryKpiCardProps {
  treasury?: TreasuryStats;
  isLoading?: boolean;
}

export const TreasuryKpiCard: React.FC<TreasuryKpiCardProps> = ({ treasury, isLoading = false }) => {
  const { t, i18n } = useTranslation(['admin', 'common']);
  const isRTL = i18n.language?.startsWith('ar');

  const totalBalance = treasury?.totalWalletBalance || 0;
  const heldWallets = treasury?.totalHeldInWallets ?? treasury?.heldInWallets ?? 0;
  const pendingWithdrawals = treasury?.totalPendingWithdrawals || 0;
  const heldEscrow = treasury?.totalHeldInEscrow || 0;
  const collectedFees = treasury?.totalCollectedFees || 0;

  // Calculate percentage of locked liquidity
  const lockedTotal = heldWallets + pendingWithdrawals + heldEscrow;
  const lockedPercentage = totalBalance > 0 ? Math.min(100, Math.round((lockedTotal / totalBalance) * 100)) : 0;

  const items = [
    {
      label: t('dashboard.treasuryCard.heldInWallets', {
        ns: 'admin',
        defaultValue: 'محتجز في المحافظ (مزايدات)',
      }),
      value: heldWallets,
      icon: Lock,
      dotBg: 'bg-amber-500',
    },
    {
      label: t('dashboard.treasuryCard.pendingWithdrawals', {
        ns: 'admin',
        defaultValue: 'معلق في طلبات السحب',
      }),
      value: pendingWithdrawals,
      icon: Clock,
      dotBg: 'bg-rose-500',
    },
    {
      label: t('dashboard.treasuryCard.heldInEscrow', {
        ns: 'admin',
        defaultValue: 'محتجز في الضمان المالي',
      }),
      value: heldEscrow,
      icon: ShieldCheck,
      dotBg: 'bg-purple-500',
    },
    {
      label: t('dashboard.treasuryCard.collectedFees', {
        ns: 'admin',
        defaultValue: 'أرباح ورسوم المنصة المحصلة',
      }),
      value: collectedFees,
      icon: DollarSign,
      dotBg: 'bg-emerald-500',
    },
  ];

  return (
    <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/80 shadow-2xs p-6 sm:p-7">
      {/* Card Header */}
      <div className="flex items-start justify-between gap-4 pb-5 border-b border-slate-100 dark:border-slate-800/80">
        <div className="flex items-center gap-3.5">
          <div className="flex items-center justify-center w-11 h-11 rounded-2xl bg-amber-500/15 text-amber-500 dark:text-amber-400 border border-amber-500/30">
            <Landmark className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-black text-slate-900 dark:text-white tracking-tight">
              {t('dashboard.treasuryCard.title', {
                ns: 'admin',
                defaultValue: 'الخزينة والسيولة',
              })}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              {t('dashboard.treasuryCard.description', {
                ns: 'admin',
                defaultValue: 'توزيع السيولة النقدية والمبالغ المحتجزة في المنصة',
              })}
            </p>
          </div>
        </div>

        <Link
          to={ROUTES.ADMIN.FINANCIALS}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 transition-colors"
        >
          <span>{isRTL ? 'إدارة الخزينة' : 'Manage Treasury'}</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Primary Headline Liquidity Total */}
      <div className="py-5 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
          <div className="space-y-1">
            <span className="text-xs uppercase font-bold tracking-wider text-slate-500 dark:text-slate-400">
              {t('dashboard.treasuryCard.totalPlatform', {
                ns: 'admin',
                defaultValue: 'إجمالي السيولة النقدية بالمنصة',
              })}
            </span>
            {isLoading ? (
              <div className="h-10 w-48 bg-slate-100 dark:bg-slate-800 animate-pulse rounded-lg" />
            ) : (
              <div className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                {formatAdminCurrency(totalBalance, undefined, isRTL)}
              </div>
            )}
          </div>

          <div className="text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 self-start sm:self-auto">
            <span className="font-bold text-amber-500">
              {toLocalizedDigits(lockedPercentage, isRTL)}%
            </span>{' '}
            {isRTL ? 'مقيد بالعمليات النشطة' : 'committed in active ops'}
          </div>
        </div>

        {/* Commitment Progress Bar */}
        <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden flex">
          <div
            className="bg-amber-500 transition-all duration-500"
            style={{ width: `${totalBalance > 0 ? (heldWallets / totalBalance) * 100 : 0}%` }}
            title="Held in Wallets"
          />
          <div
            className="bg-rose-500 transition-all duration-500"
            style={{ width: `${totalBalance > 0 ? (pendingWithdrawals / totalBalance) * 100 : 0}%` }}
            title="Pending Withdrawals"
          />
          <div
            className="bg-purple-500 transition-all duration-500"
            style={{ width: `${totalBalance > 0 ? (heldEscrow / totalBalance) * 100 : 0}%` }}
            title="Held in Escrow"
          />
        </div>
      </div>

      {/* Breakdown Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 pt-4 border-t border-slate-100 dark:border-slate-800/80">
        {items.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={idx}
              className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800"
            >
              <div className={cn('w-2 h-2 rounded-full flex-shrink-0', item.dotBg)} />
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <Icon className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 truncate">{item.label}</p>
                  <p className="text-sm font-bold text-slate-900 dark:text-white tracking-tight truncate">
                    {isLoading ? '...' : formatAdminCurrency(item.value, undefined, isRTL)}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
