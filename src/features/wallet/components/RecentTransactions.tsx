import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import {
  ArrowDownLeft,
  ArrowUpRight,
  Lock,
  Unlock,
  RotateCcw,
  Gavel,
  ChevronLeft,
  ChevronRight,
  Receipt,
} from 'lucide-react';
import { useRecentTransactions } from '../hooks/useRecentTransactions';
import { TransactionStatusBadge } from './TransactionStatusBadge';
import { TransactionDetailsModal } from './TransactionDetailsModal';
import { EmptyState } from '@/components/feedback/EmptyState';
import { ROUTES } from '@/constants/routes.constants';
import { formatPrice, formatRelativeTime } from '@/utils/formatters';
import { cn } from '@/utils/cn';
import {
  type Transaction,
  type TransactionType,
  type TransactionStatus,
  getTransactionAmountConfig,
} from '../types/wallet.types';

export const RecentTransactions: React.FC = () => {
  const { t, i18n } = useTranslation(['wallet']);
  const isRTL = i18n.language.startsWith('ar');
  const { transactions, isLoading } = useRecentTransactions();
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);

  const getTypeIconConfig = (type: string) => {
    const upperType = type.toUpperCase() as TransactionType;
    switch (upperType) {
      case 'DEPOSIT':
        return {
          icon: <ArrowDownLeft className="h-4 w-4" />,
          bg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
        };
      case 'WITHDRAW':
        return {
          icon: <ArrowUpRight className="h-4 w-4" />,
          bg: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
        };
      case 'HOLD':
        return {
          icon: <Lock className="h-4 w-4" />,
          bg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
        };
      case 'RELEASE':
        return {
          icon: <Unlock className="h-4 w-4" />,
          bg: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20',
        };
      case 'CAPTURE':
        return {
          icon: <Gavel className="h-4 w-4" />,
          bg: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
        };
      case 'REFUND':
        return {
          icon: <RotateCcw className="h-4 w-4" />,
          bg: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
        };
      default:
        return {
          icon: <Receipt className="h-4 w-4" />,
          bg: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20',
        };
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
        <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
          {t('wallet:recentTransactions.title')}
        </h2>
        <Link
          to={ROUTES.WALLET_TRANSACTIONS}
          className="text-xs sm:text-sm font-semibold text-amber-600 dark:text-amber-400 hover:text-amber-500 flex items-center gap-1 transition-colors"
        >
          {t('wallet:recentTransactions.viewAll')}
          {isRTL ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </Link>
      </div>

      {/* Content */}
      <div className="pt-2">
        {isLoading ? (
          <div className="space-y-3 pt-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/30 animate-pulse"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-700/50" />
                  <div className="space-y-1.5">
                    <div className="h-4 w-24 rounded bg-slate-200 dark:bg-slate-700/50" />
                    <div className="h-3 w-16 rounded bg-slate-200 dark:bg-slate-700/30" />
                  </div>
                </div>
                <div className="h-5 w-20 rounded bg-slate-200 dark:bg-slate-700/50" />
              </div>
            ))}
          </div>
        ) : transactions.length === 0 ? (
          <EmptyState
            size="sm"
            icon={<Receipt />}
            title={t('wallet:recentTransactions.emptyTitle')}
            description={t('wallet:recentTransactions.emptyDescription')}
          />
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
            {transactions.map((tx) => {
              const iconConfig = getTypeIconConfig(tx.type);
              const amountConfig = getTransactionAmountConfig(tx.type);
              const typeLabel = t(`wallet:transactionTypes.${tx.type.toUpperCase()}`, tx.type);

              const isFailedOrCancelled =
                tx.status === 'FAILED' ||
                tx.status === 'CANCELLED' ||
                tx.status === 'EXPIRED';

              const txObject: Transaction = {
                _id: tx._id,
                walletId: '',
                type: tx.type as TransactionType,
                amount: tx.amount,
                currency: tx.currency,
                status: tx.status as TransactionStatus,
                referenceId: tx.referenceId,
                createdAt: tx.createdAt,
              };

              return (
                <div
                  key={tx._id}
                  onClick={() => setSelectedTx(txObject)}
                  className="flex items-center justify-between py-3.5 px-2 rounded-xl transition-colors hover:bg-slate-50/70 dark:hover:bg-slate-800/40 cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div className={cn('p-2.5 rounded-xl border shrink-0', iconConfig.bg)}>
                      {iconConfig.icon}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                          {typeLabel}
                        </p>
                        <TransactionStatusBadge status={tx.status} size="sm" />
                      </div>
                      <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                        {formatRelativeTime(tx.createdAt, isRTL)}
                      </p>
                    </div>
                  </div>

                  <div className={isRTL ? 'text-left' : 'text-right'}>
                    <p className="font-mono tracking-tight flex items-baseline justify-end gap-1">
                      {amountConfig.sign && !isFailedOrCancelled && (
                        <span className={cn('text-sm sm:text-base font-extrabold', amountConfig.textColor)}>
                          {amountConfig.sign}
                        </span>
                      )}
                      <span
                        className={cn(
                          'font-mono',
                          isFailedOrCancelled
                            ? 'line-through text-slate-400 dark:text-slate-500 decoration-slate-400/80 dark:decoration-slate-500/80 text-sm sm:text-base font-medium'
                            : cn('text-sm sm:text-base font-extrabold', amountConfig.textColor)
                        )}
                      >
                        {formatPrice(tx.amount, isRTL)}
                      </span>
                      <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 no-underline select-none">
                        {t('wallet:balance.currency')}
                      </span>
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Transaction Details Modal when clicking any recent transaction */}
      <TransactionDetailsModal
        transaction={selectedTx}
        isOpen={Boolean(selectedTx)}
        onClose={() => setSelectedTx(null)}
      />
    </div>
  );
};

export default RecentTransactions;
