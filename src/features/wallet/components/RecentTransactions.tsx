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
              const details = getTypeDetails(tx.type);
              return (
                <div
                  key={tx._id}
                  className="flex items-center justify-between py-3.5 px-2 rounded-xl transition-colors hover:bg-slate-50/70 dark:hover:bg-slate-800/40"
                >
                  <div className="flex items-center gap-3">
                    <div className={cn('p-2.5 rounded-xl border', details.bg, details.color)}>
                      {details.icon}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                        {details.label}
                      </p>
                      <p className="text-xs text-slate-400 dark:text-slate-500">
                        {formatRelativeTime(tx.createdAt, isRTL)}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p
                      className={cn(
                        'text-sm sm:text-base font-extrabold font-mono tracking-tight',
                        details.color
                      )}
                    >
                      {details.prefix} {formatPrice(tx.amount, isRTL)}{' '}
                      <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500">
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
