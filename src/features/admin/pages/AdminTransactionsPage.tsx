import React, { useMemo, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Receipt, Landmark, ArrowRightLeft } from 'lucide-react';
import { ROUTES } from '@/constants/routes.constants';
import { useAdminTransactions } from '../hooks/useAdminTransactions';
import { TransactionsAuditTable } from '../components/financials/TransactionsAuditTable';
import type {
  TransactionType,
  TransactionStatus,
  TransactionsFilterInput,
} from '@/features/wallet/types/wallet.types';

export const AdminTransactionsPage: React.FC = () => {
  const { t, i18n } = useTranslation(['admin', 'common']);
  const isRTL = i18n.language?.startsWith('ar');
  const [searchParams, setSearchParams] = useSearchParams();

  // 1. URL Query Params synchronization
  const trxPage = useMemo(() => {
    const p = parseInt(searchParams.get('trxPage') || '1', 10);
    return isNaN(p) || p < 1 ? 1 : p;
  }, [searchParams]);

  const searchQuery = searchParams.get('search') || '';
  const selectedType = (searchParams.get('type') as TransactionType | 'ALL') || 'ALL';
  const selectedStatus = (searchParams.get('status') as TransactionStatus | 'ALL') || 'ALL';
  const startDateFilter = searchParams.get('startDate') || undefined;
  const endDateFilter = searchParams.get('endDate') || undefined;
  const walletIdFilter = searchParams.get('walletId') || undefined;
  const userIdFilter = searchParams.get('userId') || undefined;

  const updateParam = useCallback(
    (key: string, value: string | null, resetPageKey?: string) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          if (value && value !== 'ALL' && value.trim() !== '') {
            next.set(key, value);
          } else {
            next.delete(key);
          }
          if (resetPageKey) {
            next.delete(resetPageKey);
          }
          return next;
        },
        { replace: true }
      );
    },
    [setSearchParams]
  );

  // 2. Build Server Filter Object
  const filter: TransactionsFilterInput = useMemo(() => {
    const f: TransactionsFilterInput = {};
    if (selectedType !== 'ALL') {
      f.type = selectedType;
    }
    if (selectedStatus !== 'ALL') {
      f.status = selectedStatus;
    }
    const cleanSearch = searchQuery.trim();
    if (cleanSearch) {
      f.search = cleanSearch;
    }
    if (startDateFilter) {
      f.startDate = startDateFilter;
    }
    if (endDateFilter) {
      f.endDate = endDateFilter;
    }
    if (walletIdFilter) {
      f.walletId = walletIdFilter;
    }
    if (userIdFilter) {
      f.userId = userIdFilter;
    }
    return f;
  }, [selectedType, selectedStatus, searchQuery, startDateFilter, endDateFilter, walletIdFilter, userIdFilter]);

  // 3. Data Query Hook
  const {
    data: transactionsData,
    isLoading,
    isFetching,
    refetch,
  } = useAdminTransactions({ page: trxPage, limit: 10 }, filter);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full">
        <div className="flex items-center gap-3 min-w-0">
          <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20 shadow-xs shrink-0">
            <Receipt className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h1 className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight truncate">
              {t('transactions.title', {
                defaultValue: isRTL ? 'سجل التدقيق المالي والمعاملات' : 'Transactions Audit Trail',
              })}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate hidden sm:block">
              {t('transactions.subtitle', {
                defaultValue: isRTL
                  ? 'مراقبة وتدقيق كافة الحركات المالية والمصرفية وحجوزات المزادات عبر النظام'
                  : 'Monitor and audit all system financial operations, payouts, and auction holds',
              })}
            </p>
          </div>
        </div>

        {/* Quick Link to Financials/Withdrawals */}
        <Link
          to={ROUTES.ADMIN.FINANCIALS}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-bold text-slate-700 dark:text-slate-200 hover:border-amber-500/40 hover:text-amber-600 dark:hover:text-amber-400 transition-colors shadow-2xs shrink-0"
        >
          <Landmark className="w-4 h-4 text-amber-500" />
          <span>{isRTL ? 'الخزينة وطلبات السحب' : 'Treasury & Withdrawals'}</span>
          <ArrowRightLeft className="w-3.5 h-3.5 opacity-60" />
        </Link>
      </div>

      {/* Main Table */}
      <TransactionsAuditTable
        transactions={transactionsData?.items || []}
        total={transactionsData?.total || 0}
        totalPages={transactionsData?.totalPages || 1}
        currentPage={trxPage}
        isLoading={isLoading}
        isRefetching={isFetching}
        searchQuery={searchQuery}
        onSearchChange={(val) => updateParam('search', val, 'trxPage')}
        selectedType={selectedType}
        onTypeChange={(tp) => updateParam('type', tp, 'trxPage')}
        selectedStatus={selectedStatus}
        onStatusChange={(st) => updateParam('status', st, 'trxPage')}
        startDate={startDateFilter}
        endDate={endDateFilter}
        onDateRangeChange={({ startDate, endDate }) => {
          setSearchParams(
            (prev) => {
              const next = new URLSearchParams(prev);
              if (startDate) next.set('startDate', startDate);
              else next.delete('startDate');
              if (endDate) next.set('endDate', endDate);
              else next.delete('endDate');
              next.delete('trxPage');
              return next;
            },
            { replace: true }
          );
        }}
        onPageChange={(p) => updateParam('trxPage', String(p))}
        onRefresh={() => refetch()}
        walletIdFilter={walletIdFilter}
        onClearWalletFilter={() => updateParam('walletId', null, 'trxPage')}
      />
    </div>
  );
};

export default AdminTransactionsPage;
