import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import {
  ArrowDownLeft,
  ArrowUpRight,
  Lock,
  Unlock,
  RotateCcw,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Receipt,
} from 'lucide-react';
import { useRecentTransactions } from '../hooks/useRecentTransactions';
import { EmptyState } from '@/components/feedback/EmptyState';
import { ROUTES } from '@/constants/routes.constants';
import { formatPrice, formatRelativeTime } from '@/utils/formatters';
import { cn } from '@/utils/cn';

export const RecentTransactions: React.FC = () => {
  const { t, i18n } = useTranslation(['wallet']);
  const isRTL = i18n.language.startsWith('ar');
  const { transactions, isLoading } = useRecentTransactions();

  const getTypeDetails = (type: string) => {
    const upperType = type.toUpperCase();
    const label = t(`wallet:transactionTypes.${upperType}`, upperType);

    switch (upperType) {
      case 'DEPOSIT':
        return {
          icon: <ArrowDownLeft className="h-4 w-4" />,
          color: 'text-emerald-600 dark:text-emerald-400',
          bg: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500/20',
          prefix: '+',
          label,
        };
      case 'WITHDRAW':
        return {
          icon: <ArrowUpRight className="h-4 w-4" />,
          color: 'text-rose-600 dark:text-rose-400',
          bg: 'bg-rose-50 dark:bg-rose-950/40 border-rose-500/20',
          prefix: '-',
          label,
        };
      case 'HOLD':
        return {
          icon: <Lock className="h-4 w-4" />,
          color: 'text-amber-600 dark:text-amber-400',
          bg: 'bg-amber-50 dark:bg-amber-950/40 border-amber-500/20',
          prefix: '',
          label,
        };
      case 'RELEASE':
        return {
          icon: <Unlock className="h-4 w-4" />,
          color: 'text-emerald-600 dark:text-emerald-400',
          bg: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500/20',
          prefix: '+',
          label,
        };
      case 'REFUND':
        return {
          icon: <RotateCcw className="h-4 w-4" />,
          color: 'text-blue-600 dark:text-blue-400',
          bg: 'bg-blue-50 dark:bg-blue-950/40 border-blue-500/20',
          prefix: '+',
          label,
        };
      case 'CAPTURE':
        return {
          icon: <CheckCircle2 className="h-4 w-4" />,
          color: 'text-indigo-600 dark:text-indigo-400',
          bg: 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-500/20',
          prefix: '-',
          label,
        };
      default:
        return {
          icon: <Receipt className="h-4 w-4" />,
          color: 'text-slate-600 dark:text-slate-400',
          bg: 'bg-slate-50 dark:bg-slate-800 border-slate-700/20',
          prefix: '',
          label: type,
        };
    }
  };

  const getStatusDetails = (status: string) => {
    const upperStatus = (status || 'PENDING').toUpperCase();
    const label = t(`wallet:transactionStatuses.${upperStatus}`, upperStatus);

    switch (upperStatus) {
      case 'SUCCESS':
        return {
          label,
          badgeBg: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-500/20',
          dotBg: 'bg-emerald-500',
          isCompleted: true,
          isPending: false,
          isFailed: false,
        };
      case 'PROCESSING':
        return {
          label,
          badgeBg: 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border-indigo-500/20',
          dotBg: 'bg-indigo-500 animate-pulse',
          isCompleted: false,
          isPending: true,
          isFailed: false,
        };
      case 'PENDING':
        return {
          label,
          badgeBg: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-500/20',
          dotBg: 'bg-amber-500 animate-pulse',
          isCompleted: false,
          isPending: true,
          isFailed: false,
        };
      case 'FAILED':
      case 'CANCELLED':
      case 'EXPIRED':
      default:
        return {
          label,
          badgeBg: 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-500/20',
          dotBg: 'bg-rose-500',
          isCompleted: false,
          isPending: false,
          isFailed: true,
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
              const typeDetails = getTypeDetails(tx.type);
              const statusDetails = getStatusDetails(tx.status);

              // Amount styling logic based on transaction status:
              // - Completed (SUCCESS): bold with positive/negative type color & prefix
              // - Pending / Processing: neutral slate/amber without deceiving '+' prefix
              // - Failed / Cancelled: line-through muted slate
              let amountColorClass = typeDetails.color;
              let amountPrefix = typeDetails.prefix;

              if (statusDetails.isPending) {
                amountColorClass = 'text-amber-700 dark:text-amber-400 font-bold';
                amountPrefix = ''; // Do not display + to avoid falsely implying funds were added
              } else if (statusDetails.isFailed) {
                amountColorClass = 'text-slate-400 dark:text-slate-500';
                amountPrefix = '';
              }

              return (
                <div
                  key={tx._id}
                  className="flex items-center justify-between py-3.5 px-2 rounded-xl transition-colors hover:bg-slate-50/70 dark:hover:bg-slate-800/40"
                >
                  <div className="flex items-center gap-3">
                    <div className={cn('p-2.5 rounded-xl border', typeDetails.bg, typeDetails.color)}>
                      {typeDetails.icon}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                          {typeDetails.label}
                        </p>
                        <span
                          className={cn(
                            'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border',
                            statusDetails.badgeBg
                          )}
                        >
                          <span className={cn('w-1.5 h-1.5 rounded-full', statusDetails.dotBg)} />
                          {statusDetails.label}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                        {formatRelativeTime(tx.createdAt, isRTL)}
                      </p>
                    </div>
                  </div>

                  <div className={isRTL ? 'text-left' : 'text-right'}>
                    <p className="font-mono tracking-tight flex items-baseline justify-end gap-1">
                      {amountPrefix && (
                        <span className={cn('text-sm sm:text-base font-extrabold', amountColorClass)}>
                          {amountPrefix}
                        </span>
                      )}
                      <span
                        className={cn(
                          'font-mono',
                          statusDetails.isFailed
                            ? cn(
                                'line-through text-slate-400 dark:text-slate-500 decoration-slate-400/80 dark:decoration-slate-500/80 decoration-[1.5px]',
                                isRTL ? 'text-base sm:text-lg font-black tracking-wider' : 'text-sm sm:text-base font-medium'
                              )
                            : cn('text-sm sm:text-base font-extrabold', amountColorClass)
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
    </div>
  );
};
