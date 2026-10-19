import React, { useState, useMemo, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Landmark, ArrowRightLeft, Receipt } from 'lucide-react';
import { ROUTES } from '@/constants/routes.constants';
import { toLocalizedDigits } from '@/utils/formatters';
import { useAdminTreasuryStats } from '../hooks/useAdminTreasuryStats';
import { useAdminWithdrawals } from '../hooks/useAdminWithdrawals';
import { useAdminWithdrawalActions } from '../hooks/useAdminWithdrawalActions';
import { useAdminWithdrawalSubscription } from '../hooks/useAdminWithdrawalSubscription';
import { TreasuryOverviewSection } from '../components/financials/TreasuryOverviewSection';
import { WithdrawalsTable } from '../components/financials/WithdrawalsTable';
import { CompleteWithdrawalModal } from '../components/financials/CompleteWithdrawalModal';
import { RejectWithdrawalModal } from '../components/financials/RejectWithdrawalModal';
import type {
  WithdrawalResponse,
  WithdrawalStatus,
  PayoutMethod,
  WithdrawalsFilterInput,
} from '../types/admin.types';

export const AdminFinancialsPage: React.FC = () => {
  const { t, i18n } = useTranslation(['admin', 'common']);
  const isRTL = i18n.language?.startsWith('ar');
  const [searchParams, setSearchParams] = useSearchParams();

  // 1. URL Query Params synchronization
  const withdrawalsPage = useMemo(() => {
    const p = parseInt(searchParams.get('withdrawalsPage') || '1', 10);
    return isNaN(p) || p < 1 ? 1 : p;
  }, [searchParams]);

  const searchQuery = searchParams.get('search') || '';
  const selectedStatus = (searchParams.get('status') as WithdrawalStatus | 'ALL') || 'ALL';
  const selectedMethod = (searchParams.get('method') as PayoutMethod | 'ALL') || 'ALL';
  const startDateFilter = searchParams.get('startDate') || undefined;
  const endDateFilter = searchParams.get('endDate') || undefined;

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

  // 2. Real-time Live Subscription to admin withdrawal feed
  useAdminWithdrawalSubscription({
    enabled: true,
  });

  // 3. Build Server-side Filter Object
  const filter: WithdrawalsFilterInput = useMemo(() => {
    const f: WithdrawalsFilterInput = {};
    if (selectedStatus !== 'ALL') {
      f.status = selectedStatus;
    }
    if (selectedMethod !== 'ALL') {
      f.payoutMethod = selectedMethod;
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
    return f;
  }, [selectedStatus, selectedMethod, searchQuery, startDateFilter, endDateFilter]);

  // 4. Data Hooks
  const {
    data: treasury,
    isLoading: isTreasuryLoading,
    refetch: refetchTreasury,
  } = useAdminTreasuryStats();

  const {
    data: withdrawalsData,
    isLoading: isWithdrawalsLoading,
    isFetching: isWithdrawalsRefetching,
    refetch: refetchWithdrawals,
  } = useAdminWithdrawals({ page: withdrawalsPage, limit: 10 }, filter);

  // 5. Actions Hook
  const {
    startProcessing,
    isStartingProcessing,
    completeWithdrawal,
    isCompleting,
    rejectWithdrawal,
    isRejecting,
  } = useAdminWithdrawalActions();

  // 6. Modal States
  const [completeModalItem, setCompleteModalItem] = useState<WithdrawalResponse | null>(null);
  const [rejectModalItem, setRejectModalItem] = useState<WithdrawalResponse | null>(null);

  const handleRefreshAll = () => {
    refetchTreasury();
    refetchWithdrawals();
  };

  const pendingCount = treasury?.pendingWithdrawalsCount || 0;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-row items-center justify-between gap-4 w-full">
        <div className="flex items-center gap-3 min-w-0">
          <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20 shadow-xs shrink-0">
            <Landmark className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h1 className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight truncate">
              {t('financials.title', {
                defaultValue: 'الخزينة والسحوبات المالية',
              })}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate hidden sm:block">
              {t('financials.subtitle', {
                defaultValue:
                  'معالجة طلبات السحب المباشرة، فحص مؤشرات الخزينة، ومراقبة السيولة النقدية',
              })}
            </p>
          </div>
        </div>

        {/* Pending Badge on opposite side of header row */}
        {pendingCount > 0 && (
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 animate-pulse whitespace-nowrap shrink-0 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
            <span>
              {toLocalizedDigits(pendingCount, isRTL)} {isRTL ? 'طلبات سحب معلقة' : 'pending withdrawals'}
            </span>
          </div>
        )}
      </div>

      {/* Section 1: Treasury Liquidity Overview */}
      <TreasuryOverviewSection
        treasury={treasury}
        isLoading={isTreasuryLoading}
      />

      {/* Section 2: Withdrawals Management Table */}
      <section className="space-y-3 pt-2">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-500">
              <ArrowRightLeft className="w-4 h-4" />
            </div>
            <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
              {t('financials.tabs.withdrawals', {
                defaultValue: 'إدارة طلبات سحب الأرباح المصرفية',
              })}
            </h2>
          </div>

          <Link
            to={ROUTES.ADMIN.TRANSACTIONS}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-amber-600 dark:text-amber-400 hover:bg-amber-500/10 border border-amber-500/20 transition-colors shadow-2xs"
          >
            <Receipt className="w-3.5 h-3.5" />
            <span>{isRTL ? 'عرض سجل التدقيق المالي' : 'View Transactions Audit'}</span>
          </Link>
        </div>

        <WithdrawalsTable
          withdrawals={withdrawalsData?.items || []}
          total={withdrawalsData?.total || 0}
          totalPages={withdrawalsData?.totalPages || 1}
          currentPage={withdrawalsPage}
          isLoading={isWithdrawalsLoading}
          isRefetching={isWithdrawalsRefetching}
          searchQuery={searchQuery}
          onSearchChange={(val) => updateParam('search', val, 'withdrawalsPage')}
          selectedStatus={selectedStatus}
          onStatusChange={(st) => updateParam('status', st, 'withdrawalsPage')}
          selectedMethod={selectedMethod}
          onMethodChange={(m) => updateParam('method', m, 'withdrawalsPage')}
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
                next.delete('withdrawalsPage');
                return next;
              },
              { replace: true }
            );
          }}
          onPageChange={(page) => updateParam('withdrawalsPage', String(page))}
          onRefresh={handleRefreshAll}
          onStartProcessing={startProcessing}
          isStartingProcessing={isStartingProcessing}
          onOpenCompleteModal={(item) => setCompleteModalItem(item)}
          onOpenRejectModal={(item) => setRejectModalItem(item)}
        />
      </section>

      {/* Complete Disbursal Modal */}
      <CompleteWithdrawalModal
        isOpen={!!completeModalItem}
        onClose={() => setCompleteModalItem(null)}
        withdrawal={completeModalItem}
        onComplete={completeWithdrawal}
        isLoading={isCompleting}
      />

      {/* Reject Withdrawal Modal */}
      <RejectWithdrawalModal
        isOpen={!!rejectModalItem}
        onClose={() => setRejectModalItem(null)}
        withdrawal={rejectModalItem}
        onReject={rejectWithdrawal}
        isLoading={isRejecting}
      />
    </div>
  );
};

export default AdminFinancialsPage;
