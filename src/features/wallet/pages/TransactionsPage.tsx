import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  RotateCcw,
  RefreshCw,
} from 'lucide-react';
import { useTransactions } from '../hooks/useTransactions';
import { TransactionFilterBar } from '../components/TransactionFilterBar';
import { TransactionRow } from '../components/TransactionRow';
import { TransactionsSkeleton } from '../components/TransactionsSkeleton';
import { TransactionDetailsModal } from '../components/TransactionDetailsModal';
import { Pagination } from '@/components/common/Pagination';
import { Button } from '@/components/common/Button';
import { EmptyState } from '@/components/feedback/EmptyState';
import { ROUTES } from '@/constants/routes.constants';
import { cn } from '@/utils/cn';
import type { Transaction } from '../types/wallet.types';

export const TransactionsPage: React.FC = () => {
  const { t, i18n } = useTranslation(['wallet', 'common']);
  const isRTL = i18n.language?.startsWith('ar');
  const navigate = useNavigate();

  const {
    transactions,
    total,
    totalPages,
    hasNextPage,
    hasPreviousPage,
    page,
    limit,
    isLoading,
    isFetching,
    isError,
    refetch,
    type,
    status,
    startDateStr,
    endDateStr,
    hasActiveFilters,
    setPage,
    setType,
    setStatus,
    setDateRange,
    resetFilters,
  } = useTransactions({ limit: 10 });

  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  return (
    <div className="min-h-screen py-6 sm:py-8 px-4 sm:px-6 lg:px-8 bg-slate-50/50 dark:bg-slate-950">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Top Back Navigation (Unified Gold Hover Pill) */}
        <div className="flex items-center justify-between">
          <Link
            to={ROUTES.WALLET}
            className="inline-flex items-center gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 hover:text-amber-600 dark:hover:text-amber-400 hover:border-amber-500/50 dark:hover:border-amber-500/50 hover:bg-amber-50/40 dark:hover:bg-amber-950/20 transition-all shadow-2xs group shrink-0 select-none cursor-pointer whitespace-nowrap"
          >
            {isRTL ? (
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            ) : (
              <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
            )}
            <span>{t('wallet:transactions.backToWallet', isRTL ? 'العودة للمحفظة' : 'Back to Wallet')}</span>
          </Link>
        </div>

        {/* Page Header: Pure Typography & Refresh Button (Identical to WalletPage) */}
        <div className="flex items-center justify-between gap-4 border-b border-slate-200/70 dark:border-slate-800 pb-4 sm:pb-5">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {t('wallet:transactions.pageTitle', { defaultValue: 'سجل المعاملات المالية' })}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              {t('wallet:transactions.pageSubtitle', {
                defaultValue: 'عرض وتتبع كافة الحركات المالية والإيداعات وسجل الحجوزات والسحوبات',
              })}
            </p>
          </div>

          {/* Refresh Button with distinct hover border and amber icon (Matching WalletPage) */}
          <button
            type="button"
            onClick={() => refetch()}
            disabled={isFetching}
            title={t('wallet:actions.refresh', 'تحديث البيانات')}
            aria-label="Refresh transactions data"
            className="group p-2.5 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-amber-500 dark:hover:border-amber-500 hover:bg-amber-500/10 dark:hover:bg-amber-500/15 hover:shadow-md active:scale-95 transition-all duration-200 shadow-sm disabled:opacity-50 shrink-0"
          >
            <RefreshCw
              className={cn(
                'w-4.5 h-4.5 text-amber-500 transition-transform group-hover:rotate-180 duration-500',
                isFetching && 'animate-spin'
              )}
            />
          </button>
        </div>

        {/* Filters Section */}
        <TransactionFilterBar
          type={type}
          status={status}
          startDate={startDateStr}
          endDate={endDateStr}
          hasActiveFilters={hasActiveFilters}
          onTypeChange={setType}
          onStatusChange={setStatus}
          onDateRangeChange={setDateRange}
          onReset={resetFilters}
        />

        {/* Content Section: Loading | Error | Empty | Table */}
        {isLoading ? (
          <TransactionsSkeleton />
        ) : isError ? (
          <div className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-900/40 text-center space-y-4">
            <p className="text-sm font-semibold text-rose-600 dark:text-rose-400">
              {t('wallet:errors.loadFailed')}
            </p>
            <Button
              variant="primary"
              size="sm"
              onClick={() => refetch()}
              leftIcon={<RotateCcw className="w-4 h-4" />}
            >
              {t('wallet:errors.retry')}
            </Button>
          </div>
        ) : transactions.length === 0 ? (
          <div className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-center">
            <EmptyState
              title={t('wallet:transactions.emptyState.title', { defaultValue: 'لا توجد معاملات مطابقة' })}
              description={
                hasActiveFilters
                  ? t('wallet:transactions.emptyState.filteredDescription', {
                      defaultValue: 'لم نتمكن من العثور على أي معاملات تطابق معايير الفلترة المحددة.',
                    })
                  : t('wallet:transactions.emptyState.description', {
                      defaultValue: 'لم تقم بأي عمليات مالية حتى الآن. عند شحن رصيدك أو المزايدة ستظهر معاملاتك هنا.',
                    })
              }
              action={
                hasActiveFilters
                  ? {
                      label: t('wallet:transactions.emptyState.clearFilters', { defaultValue: 'مسح الفلاتر' }),
                      onClick: resetFilters,
                    }
                  : {
                      label: t('wallet:recentTransactions.depositButton', { defaultValue: 'شحن الرصيد الآن' }),
                      onClick: () => navigate(ROUTES.WALLET_DEPOSIT),
                    }
              }
            />
          </div>
        ) : (
          <div className="space-y-4">
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-hidden rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
              <table className="w-full text-center border-collapse">
                <thead>
                  <tr className="border-b border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    <th className="py-3.5 px-4 text-center">{t('wallet:transactions.table.type', { defaultValue: 'النوع' })}</th>
                    <th className="py-3.5 px-4 text-center">{t('wallet:transactions.table.amount', { defaultValue: 'المبلغ' })}</th>
                    <th className="py-3.5 px-4 text-center">{t('wallet:transactions.table.status', { defaultValue: 'الحالة' })}</th>
                    <th className="py-3.5 px-4 text-center">{t('wallet:transactions.table.date', { defaultValue: 'التاريخ' })}</th>
                    <th className="py-3.5 px-4 text-center">{t('wallet:transactions.table.reference', { defaultValue: 'رقم المعاملة' })}</th>
                    <th className="py-3.5 px-4 text-center">{t('wallet:transactions.table.actions', { defaultValue: 'التفاصيل' })}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                  {transactions.map((transaction) => (
                    <TransactionRow
                      key={transaction._id}
                      transaction={transaction}
                      onSelect={(tx) => setSelectedTransaction(tx)}
                    />
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards View */}
            <div className="md:hidden space-y-3">
              {transactions.map((transaction) => (
                <TransactionRow
                  key={transaction._id}
                  transaction={transaction}
                  onSelect={(tx) => setSelectedTransaction(tx)}
                />
              ))}
            </div>

            {/* Pagination Controls */}
            <Pagination
              page={page}
              totalPages={totalPages}
              total={total}
              limit={limit}
              hasNextPage={hasNextPage}
              hasPreviousPage={hasPreviousPage}
              onPageChange={setPage}
            />
          </div>
        )}

        {/* Transaction Details Modal */}
        <TransactionDetailsModal
          transaction={selectedTransaction}
          isOpen={Boolean(selectedTransaction)}
          onClose={() => setSelectedTransaction(null)}
        />
      </div>
    </div>
  );
};

export default TransactionsPage;
