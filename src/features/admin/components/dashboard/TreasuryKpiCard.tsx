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

const renderFormattedTreasuryValue = (
  amount: number | string | undefined | null,
  isRTL: boolean,
  isLoading: boolean,
  isHeadline = false
) => {
  if (isLoading) {
    return (
      <div
        className={cn(
          'bg-slate-100 dark:bg-slate-800 animate-pulse rounded-lg',
          isHeadline ? 'h-8 w-44' : 'h-6 w-24'
        )}
      />
    );
  }

  const formattedStr = formatAdminCurrency(amount, undefined, isRTL);
  const parts = formattedStr.split(/\s+/);
  const currency = parts.length >= 2 ? parts.pop() : isRTL ? 'ج.م' : 'EGP';
  const val = parts.join(' ');

  if (isHeadline) {
    return (
      <div className="flex items-baseline gap-2 flex-wrap">
        <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          {val}
        </span>
        <span className="text-sm font-bold text-slate-400 dark:text-slate-500">
          {currency}
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-baseline gap-1.5 flex-wrap">
      <span className="text-base font-black text-slate-900 dark:text-white tracking-tight">
        {val}
      </span>
      <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500">
        {currency}
      </span>
    </div>
  );
};

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
      label: isRTL ? 'محتجز في المحافظ (مزايدات)' : 'Held in Wallets (Bids)',
      value: heldWallets,
      icon: Lock,
      iconClass: 'bg-amber-500/15 text-amber-500 dark:text-amber-400 border border-amber-500/30',
      barBg: 'bg-amber-500',
    },
    {
      label: isRTL ? 'معلق في طلبات السحب' : 'Pending Withdrawals',
      value: pendingWithdrawals,
      icon: Clock,
      iconClass: 'bg-rose-500/15 text-rose-500 dark:text-rose-400 border border-rose-500/30',
      barBg: 'bg-rose-500',
    },
    {
      label: isRTL ? 'محتجز في الضمان المالي' : 'Held in Escrow',
      value: heldEscrow,
      icon: ShieldCheck,
      iconClass: 'bg-purple-500/15 text-purple-500 dark:text-purple-400 border border-purple-500/30',
      barBg: 'bg-purple-500',
    },
    {
      label: isRTL ? 'رسوم المنصة المحصلة' : 'Collected Platform Fees',
      value: collectedFees,
      icon: DollarSign,
      iconClass: 'bg-emerald-500/15 text-emerald-500 dark:text-emerald-400 border border-emerald-500/30',
      barBg: 'bg-emerald-500',
    },
  ];

  return (
    <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/80 shadow-2xs p-5 sm:p-7 space-y-6">
      {/* Card Header */}
      <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800/80">
        <div className="flex items-center gap-3.5">
          <div className="flex items-center justify-center w-11 h-11 rounded-2xl bg-amber-500/15 text-amber-500 dark:text-amber-400 border border-amber-500/30 shrink-0">
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
          className="group flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 shadow-2xs hover:shadow-xs transition-all duration-200 shrink-0 active:scale-95"
        >
          <span>{isRTL ? 'إدارة الخزينة' : 'Manage Treasury'}</span>
          <ArrowUpRight className="w-3.5 h-3.5 text-amber-500 transition-transform duration-200 group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5 group-hover:-translate-y-0.5" />
        </Link>
      </div>

      {/* Primary Headline Liquidity Total */}
      <div className="space-y-3.5">
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-3">
          <div className="space-y-1">
            <span className="text-xs uppercase font-bold tracking-wider text-slate-500 dark:text-slate-400">
              {t('dashboard.treasuryCard.totalPlatform', {
                ns: 'admin',
                defaultValue: 'إجمالي السيولة النقدية بالمنصة',
              })}
            </span>
            <div>
              {renderFormattedTreasuryValue(totalBalance, isRTL, isLoading, true)}
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800/70 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 self-start sm:self-auto shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse shrink-0" />
            <span className="text-slate-500 dark:text-slate-400 font-medium">
              {isRTL ? 'إجمالي المحتجز والمعلق:' : 'Held & Processing:'}
            </span>
            <span className="font-bold text-amber-600 dark:text-amber-400">
              {formatAdminCurrency(lockedTotal, undefined, isRTL)} ({toLocalizedDigits(lockedPercentage, isRTL)}%)
            </span>
          </div>
        </div>

        {/* Commitment Multi-color Progress Bar */}
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-slate-100 dark:border-slate-800/80">
        {items.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={idx}
              className="flex flex-col justify-between p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800/80 hover:bg-slate-100/70 dark:hover:bg-slate-800/60 hover:border-slate-300 dark:hover:border-slate-700 transition-all space-y-3"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div
                  className={cn(
                    'flex items-center justify-center w-8 h-8 rounded-xl shrink-0 shadow-2xs',
                    item.iconClass
                  )}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate">
                  {item.label}
                </p>
              </div>

              <div className="pt-0.5">
                {renderFormattedTreasuryValue(item.value, isRTL, isLoading)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
