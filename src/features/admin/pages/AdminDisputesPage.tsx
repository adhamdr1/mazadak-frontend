import React, { useState, useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Scale, ShieldCheck } from 'lucide-react';
import { toLocalizedDigits } from '@/utils/formatters';
import { useToast } from '@/components/feedback/useToast';
import { useAdminDisputes } from '../hooks/useAdminDisputes';
import { useAdminEscrows } from '../hooks/useAdminEscrows';
import { useResolveDispute } from '../hooks/useResolveDispute';
import { useUpdateDisputeStatus } from '../hooks/useUpdateDisputeStatus';
import { useEscrowAdminActions } from '../hooks/useEscrowAdminActions';
import { useAdminDisputesSubscription } from '../hooks/useAdminDisputesSubscription';
import { AdminDisputesTable } from '../components/disputes/AdminDisputesTable';
import { AdminEscrowsTable } from '../components/disputes/AdminEscrowsTable';
import { DisputeResolveModal } from '../components/disputes/DisputeResolveModal';
import type {
  DisputeData,
  DisputeStatus,
  EscrowStatus,
  DisputeFilterInput,
  EscrowFilterInput,
  ResolveDisputeInput,
} from '../types/admin.types';

export const AdminDisputesPage: React.FC = () => {
  const { t, i18n } = useTranslation(['admin', 'common']);
  const isRTL = i18n.language?.startsWith('ar');
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  // 1. URL Query Params synchronization
  const activeTab = (searchParams.get('tab') as 'disputes' | 'escrows') || 'disputes';

  const disputesPage = useMemo(() => {
    const p = parseInt(searchParams.get('disputesPage') || '1', 10);
    return isNaN(p) || p < 1 ? 1 : p;
  }, [searchParams]);

  const escrowsPage = useMemo(() => {
    const p = parseInt(searchParams.get('escrowsPage') || '1', 10);
    return isNaN(p) || p < 1 ? 1 : p;
  }, [searchParams]);

  const disputeSearch = searchParams.get('disputeSearch') || '';
  const disputeStatus =
    (searchParams.get('disputeStatus') as DisputeStatus | 'ALL') || 'ALL';
  const disputeStartDate = searchParams.get('disputeStartDate') || undefined;
  const disputeEndDate = searchParams.get('disputeEndDate') || undefined;

  const escrowSearch = searchParams.get('escrowSearch') || '';
  const escrowStatus =
    (searchParams.get('escrowStatus') as EscrowStatus | 'ALL') || 'ALL';
  const escrowStartDate = searchParams.get('escrowStartDate') || undefined;
  const escrowEndDate = searchParams.get('escrowEndDate') || undefined;

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

  // 2. Real-time Subscription to Disputes Feed
  useAdminDisputesSubscription({
    enabled: true,
  });

  // 3. Build Filters (Direct Server-side Search via Backend)
  const disputeFilter: DisputeFilterInput = useMemo(() => {
    const f: DisputeFilterInput = {};
    if (disputeStatus !== 'ALL') {
      f.status = disputeStatus;
    }
    const cleanSearch = disputeSearch.trim();
    if (cleanSearch) {
      f.search = cleanSearch;
    }
    if (disputeStartDate) {
      f.startDate = disputeStartDate;
    }
    if (disputeEndDate) {
      f.endDate = disputeEndDate;
    }
    return f;
  }, [disputeStatus, disputeSearch, disputeStartDate, disputeEndDate]);

  const escrowFilter: EscrowFilterInput = useMemo(() => {
    const f: EscrowFilterInput = {};
    if (escrowStatus !== 'ALL') {
      f.status = escrowStatus;
    } else {
      f.excludeDisputed = true;
    }
    const cleanSearch = escrowSearch.trim();
    if (cleanSearch) {
      f.search = cleanSearch;
    }
    if (escrowStartDate) {
      f.startDate = escrowStartDate;
    }
    if (escrowEndDate) {
      f.endDate = escrowEndDate;
    }
    return f;
  }, [escrowStatus, escrowSearch, escrowStartDate, escrowEndDate]);

  // 4. Data Hooks
  const {
    data: disputesData,
    isLoading: isLoadingDisputes,
    isRefetching: isRefetchingDisputes,
    refetch: refetchDisputes,
  } = useAdminDisputes({
    page: disputesPage,
    limit: 10,
    filter: disputeFilter,
  });

  const {
    data: escrowsData,
    isLoading: isLoadingEscrows,
    isRefetching: isRefetchingEscrows,
    refetch: refetchEscrows,
  } = useAdminEscrows({
    page: escrowsPage,
    limit: 10,
    filter: escrowFilter,
  });

  const disputes = disputesData?.items || [];
  const disputesTotal = disputesData?.total || 0;
  const disputesTotalPages = disputesData?.totalPages || 1;

  // Single Responsibility: Escrows table displays pure escrow transactions (disputes excluded at query level)
  const escrows = escrowsData?.items || [];
  const escrowsTotal = escrowsData?.total || 0;
  const escrowsTotalPages = escrowsData?.totalPages || 1;

  // 5. Actions & Mutations
  const [resolveTargetDispute, setResolveTargetDispute] = useState<DisputeData | null>(null);

  const { mutateAsync: resolveDispute, isPending: isResolving } = useResolveDispute();
  const { mutateAsync: updateDisputeStatus, isPending: isUpdatingStatus } = useUpdateDisputeStatus();
  const { releaseEscrow, refundEscrow, isLoading: isProcessingEscrow } = useEscrowAdminActions();

  const handleResolveSubmit = async (input: ResolveDisputeInput) => {
    try {
      await resolveDispute(input);
      toast.success(
        t('disputes.resolveSuccess', {
          defaultValue: 'تم فض النزاع وتنفيذ التسوية المالية بنجاح',
        })
      );
      setResolveTargetDispute(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'فشل فض النزاع';
      toast.error(msg);
      throw err;
    }
  };

  const handleMarkUnderReview = async (dispute: DisputeData) => {
    try {
      await updateDisputeStatus({
        disputeId: dispute._id,
        status: 'UNDER_REVIEW',
      });
      toast.success(
        t('disputes.markedUnderReviewSuccess', {
          defaultValue: 'تم تحديث حالة النزاع إلى قيد المراجعة الإدارية',
        })
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'فشل تحديث حالة النزاع';
      toast.error(msg);
    }
  };

  const handleReleaseEscrow = async (escrowId: string, reason?: string) => {
    try {
      await releaseEscrow({ escrowId, reason });
      toast.success(
        t('escrow.releaseSuccess', {
          defaultValue: 'تم تحرير الضمان المالي وصرفه للبائع بنجاح',
        })
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'فشل تحرير الضمان';
      toast.error(msg);
      throw err;
    }
  };

  const handleRefundEscrow = async (escrowId: string, reason?: string) => {
    try {
      await refundEscrow({ escrowId, reason });
      toast.success(
        t('escrow.refundSuccess', {
          defaultValue: 'تم رد الضمان المالي إلى محفظة المشتري بنجاح',
        })
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'فشل رد الضمان';
      toast.error(msg);
      throw err;
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Page Header & Tab Switcher */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 shrink-0">
              <Scale className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100">
              {t('disputes.pageTitle', { defaultValue: 'فض النزاعات وإدارة الضمان المالي' })}
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            {t('disputes.pageSubtitle', {
              defaultValue: 'إدارة النزاعات المعلقة بين المشترين والبائعين والتحكم في عقود الوساطة المالية.',
            })}
          </p>
        </div>

        {/* Primary Tabs: Two distinct standalone buttons side-by-side on full screen, 50/50 full width on half screen */}
        <div className="grid grid-cols-2 lg:flex items-center gap-2 sm:gap-2.5 w-full lg:w-auto shrink-0">
          <button
            type="button"
            onClick={() => updateParam('tab', 'disputes')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-2xs ${
              activeTab === 'disputes'
                ? 'bg-amber-500 hover:bg-amber-600 text-slate-950 border border-amber-500 shadow-xs'
                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/70 hover:border-slate-300 dark:hover:border-slate-700'
            }`}
          >
            <Scale className="w-4 h-4 shrink-0" />
            <span className="truncate">{t('disputes.tabs.disputes', { defaultValue: 'النزاعات المالية' })}</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold shrink-0 ${
                activeTab === 'disputes'
                  ? 'bg-slate-950/20 text-slate-950'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200/60 dark:border-slate-700/60'
              }`}
            >
              {toLocalizedDigits(disputesTotal, isRTL)}
            </span>
          </button>

          <button
            type="button"
            onClick={() => updateParam('tab', 'escrows')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-2xs ${
              activeTab === 'escrows'
                ? 'bg-amber-500 hover:bg-amber-600 text-slate-950 border border-amber-500 shadow-xs'
                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/70 hover:border-slate-300 dark:hover:border-slate-700'
            }`}
          >
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span className="truncate">{t('disputes.tabs.escrows', { defaultValue: 'معاملات الضمان والوساطة' })}</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold shrink-0 ${
                activeTab === 'escrows'
                  ? 'bg-slate-950/20 text-slate-950'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200/60 dark:border-slate-700/60'
              }`}
            >
              {toLocalizedDigits(escrowsTotal, isRTL)}
            </span>
          </button>
        </div>
      </div>

      {/* 3. Tab Contents */}
      {activeTab === 'disputes' ? (
        <AdminDisputesTable
          disputes={disputes}
          total={disputesTotal}
          totalPages={disputesTotalPages}
          currentPage={disputesPage}
          isLoading={isLoadingDisputes}
          isRefetching={isRefetchingDisputes}
          searchQuery={disputeSearch}
          onSearchChange={(q) => updateParam('disputeSearch', q, 'disputesPage')}
          selectedStatus={disputeStatus}
          onStatusChange={(s) => updateParam('disputeStatus', s, 'disputesPage')}
          startDate={disputeStartDate}
          endDate={disputeEndDate}
          onDateRangeChange={({ startDate, endDate }) => {
            setSearchParams(
              (prev) => {
                const next = new URLSearchParams(prev);
                if (startDate) next.set('disputeStartDate', startDate);
                else next.delete('disputeStartDate');
                if (endDate) next.set('disputeEndDate', endDate);
                else next.delete('disputeEndDate');
                next.delete('disputesPage');
                return next;
              },
              { replace: true }
            );
          }}
          onPageChange={(p) => updateParam('disputesPage', p.toString())}
          onRefresh={refetchDisputes}
          onResolveDispute={(dispute) => setResolveTargetDispute(dispute)}
          onMarkUnderReview={handleMarkUnderReview}
          isMarkingReview={isUpdatingStatus}
        />
      ) : (
        <AdminEscrowsTable
          escrows={escrows}
          total={escrowsTotal}
          totalPages={escrowsTotalPages}
          currentPage={escrowsPage}
          isLoading={isLoadingEscrows}
          isRefetching={isRefetchingEscrows}
          searchQuery={escrowSearch}
          onSearchChange={(q) => updateParam('escrowSearch', q, 'escrowsPage')}
          selectedStatus={escrowStatus}
          onStatusChange={(s) => updateParam('escrowStatus', s, 'escrowsPage')}
          startDate={escrowStartDate}
          endDate={escrowEndDate}
          onDateRangeChange={({ startDate, endDate }) => {
            setSearchParams(
              (prev) => {
                const next = new URLSearchParams(prev);
                if (startDate) next.set('escrowStartDate', startDate);
                else next.delete('escrowStartDate');
                if (endDate) next.set('escrowEndDate', endDate);
                else next.delete('escrowEndDate');
                next.delete('escrowsPage');
                return next;
              },
              { replace: true }
            );
          }}
          onPageChange={(p) => updateParam('escrowsPage', p.toString())}
          onRefresh={refetchEscrows}
          onReleaseEscrow={handleReleaseEscrow}
          onRefundEscrow={handleRefundEscrow}
          isProcessingAction={isProcessingEscrow}
        />
      )}

      {/* 4. Resolve Dispute Modal */}
      <DisputeResolveModal
        isOpen={!!resolveTargetDispute}
        onClose={() => setResolveTargetDispute(null)}
        dispute={resolveTargetDispute}
        onResolve={handleResolveSubmit}
        isLoading={isResolving}
      />
    </div>
  );
};

export default AdminDisputesPage;
