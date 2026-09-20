import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { ArrowDownLeft, ArrowUpRight, History, Receipt } from 'lucide-react';
import { ROUTES } from '@/constants/routes.constants';

export const WalletActionButtons: React.FC = () => {
  const { t } = useTranslation(['wallet']);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-3.5">
      {/* 1. Deposit Button (White Surface Card with Emerald Green Accent) */}
      <Link
        to={ROUTES.WALLET_DEPOSIT}
        className="group relative flex items-center justify-center gap-2 h-12 sm:h-13 px-3 sm:px-4 rounded-2xl bg-white hover:bg-emerald-50/60 dark:bg-slate-900 dark:hover:bg-slate-850 text-slate-800 dark:text-slate-100 hover:text-emerald-700 dark:hover:text-emerald-400 font-extrabold text-xs sm:text-sm border border-slate-200 dark:border-slate-800 hover:border-emerald-500/70 dark:hover:border-emerald-500/60 shadow-sm hover:shadow-md active:scale-[0.98] transition-all duration-200 select-none cursor-pointer"
      >
        <div className="p-1 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 transition-transform group-hover:scale-105 shrink-0">
          <ArrowDownLeft className="w-3.5 h-3.5 stroke-[2.5]" />
        </div>
        <span className="truncate">{t('wallet:actions.deposit')}</span>
      </Link>

      {/* 2. Withdraw Button (White Surface Card with Blue Accent) */}
      <Link
        to={ROUTES.WALLET_WITHDRAW}
        className="group relative flex items-center justify-center gap-2 h-12 sm:h-13 px-3 sm:px-4 rounded-2xl bg-white hover:bg-blue-50/60 dark:bg-slate-900 dark:hover:bg-slate-850 text-slate-800 dark:text-slate-100 hover:text-blue-700 dark:hover:text-blue-400 font-extrabold text-xs sm:text-sm border border-slate-200 dark:border-slate-800 hover:border-blue-500/70 dark:hover:border-blue-500/60 shadow-sm hover:shadow-md active:scale-[0.98] transition-all duration-200 select-none cursor-pointer"
      >
        <div className="p-1 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 transition-transform group-hover:scale-105 shrink-0">
          <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5]" />
        </div>
        <span className="truncate">{t('wallet:actions.withdraw')}</span>
      </Link>

      {/* 3. Withdrawals Tracking Button (White Surface Card with Purple Accent) */}
      <Link
        to={ROUTES.WALLET_WITHDRAWALS}
        className="group relative flex items-center justify-center gap-2 h-12 sm:h-13 px-3 sm:px-4 rounded-2xl bg-white hover:bg-purple-50/60 dark:bg-slate-900 dark:hover:bg-slate-850 text-slate-800 dark:text-slate-100 hover:text-purple-700 dark:hover:text-purple-400 font-extrabold text-xs sm:text-sm border border-slate-200 dark:border-slate-800 hover:border-purple-500/70 dark:hover:border-purple-500/60 shadow-sm hover:shadow-md active:scale-[0.98] transition-all duration-200 select-none cursor-pointer"
      >
        <div className="p-1 rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 transition-transform group-hover:scale-105 shrink-0">
          <Receipt className="w-3.5 h-3.5 stroke-[2.5]" />
        </div>
        <span className="truncate">{t('wallet:actions.withdrawals', 'سجل السحوبات')}</span>
      </Link>

      {/* 4. Transaction History Button (White Surface Card with Amber Accent) */}
      <Link
        to={ROUTES.WALLET_TRANSACTIONS}
        className="group relative flex items-center justify-center gap-2 h-12 sm:h-13 px-3 sm:px-4 rounded-2xl bg-white hover:bg-amber-50/60 dark:bg-slate-900 dark:hover:bg-slate-850 text-slate-800 dark:text-slate-100 hover:text-amber-700 dark:hover:text-amber-400 font-extrabold text-xs sm:text-sm border border-slate-200 dark:border-slate-800 hover:border-amber-500/70 dark:hover:border-amber-500/60 shadow-sm hover:shadow-md active:scale-[0.98] transition-all duration-200 select-none cursor-pointer"
      >
        <div className="p-1 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 transition-transform group-hover:scale-105 shrink-0">
          <History className="w-3.5 h-3.5 stroke-[2.5]" />
        </div>
        <span className="truncate">{t('wallet:actions.transactions')}</span>
      </Link>
    </div>
  );
};
