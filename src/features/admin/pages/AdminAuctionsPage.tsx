import React, { useState, useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Gavel } from 'lucide-react';
import { toLocalizedDigits } from '@/utils/formatters';
import { useToast } from '@/components/feedback/useToast';
import { useAdminAuctions } from '../hooks/useAdminAuctions';
import { useAdminCancelAuction } from '../hooks/useAdminCancelAuction';
import { AdminAuctionsTable } from '../components/auctions/AdminAuctionsTable';
import { AdminCancelAuctionModal } from '../components/auctions/AdminCancelAuctionModal';
import { AuctionReviewsModerationModal } from '../components/auctions/AuctionReviewsModerationModal';
import type { Auction, AuctionStatus, AuctionCategory, AuctionsFilterInput } from '../types/admin.types';

export const AdminAuctionsPage: React.FC = () => {
  const { t, i18n } = useTranslation(['admin', 'common']);
  const isRTL = i18n.language?.startsWith('ar');
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  // 1. URL Query Params synchronization
  const currentPage = useMemo(() => {
    const p = parseInt(searchParams.get('auctionsPage') || '1', 10);
    return isNaN(p) || p < 1 ? 1 : p;
  }, [searchParams]);

  const searchQuery = searchParams.get('search') || '';
  const selectedCategory = (searchParams.get('category') as AuctionCategory | 'ALL') || 'ALL';
  const selectedStatus = (searchParams.get('status') as AuctionStatus | 'ALL') || 'ALL';
  const sortOrder = (searchParams.get('sortOrder') as 'DESC' | 'ASC') || 'DESC';
  const startDateFilter = searchParams.get('startDate') || undefined;
  const endDateFilter = searchParams.get('endDate') || undefined;

  const updateParam = useCallback(
    (key: string, value: string | null, resetPage = true) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          if (value && value !== 'ALL' && value.trim() !== '') {
            next.set(key, value);
          } else {
            next.delete(key);
          }
          if (resetPage && key !== 'auctionsPage') {
            next.delete('auctionsPage');
          }
          return next;
        },
        { replace: true }
      );
    },
    [setSearchParams]
  );

  // 2. Build GraphQL AuctionsFilterInput based on active state
  const filterInput: AuctionsFilterInput = useMemo(() => {
    const f: AuctionsFilterInput = {
      sort: {
        field: 'CREATED_AT',
        order: sortOrder,
      },
    };

    if (searchQuery.trim()) {
      f.search = searchQuery.trim();
    }
    if (selectedCategory && selectedCategory !== 'ALL') {
      f.category = selectedCategory;
    }
    if (selectedStatus && selectedStatus !== 'ALL') {
      f.status = selectedStatus;
    }
    if (startDateFilter) {
      f.startDate = startDateFilter;
    }
    if (endDateFilter) {
      f.endDate = endDateFilter;
    }

    return f;
  }, [searchQuery, selectedCategory, selectedStatus, sortOrder, startDateFilter, endDateFilter]);

  // 3. Data fetching hook
  const {
    data: auctionsData,
    isLoading,
    isRefetching,
    refetch,
  } = useAdminAuctions({
    page: currentPage,
    limit: 10,
    filter: filterInput,
  });

  const auctions = auctionsData?.items || [];
  const total = auctionsData?.total || 0;
  const totalPages = auctionsData?.totalPages || 1;

  // 4. Modal states
  const [cancelTargetAuction, setCancelTargetAuction] = useState<Auction | null>(null);
  const [reviewsTargetAuction, setReviewsTargetAuction] = useState<Auction | null>(null);

  // 5. Cancel auction mutation
  const { mutateAsync: cancelAuction, isPending: isCancelling } = useAdminCancelAuction();

  const handleConfirmCancel = async (reason: string) => {
    if (!cancelTargetAuction) return;
    try {
      await cancelAuction({
        auctionId: cancelTargetAuction._id,
        reason,
      });
      toast.success(
        t('auctions.cancelModal.successToast', {
          defaultValue: 'تم إلغاء المزاد بنجاح ورد أموال المزايدين تلقائياً.',
        })
      );
      setCancelTargetAuction(null);
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error ? err.message : 'فشل إلغاء المزاد، يرجى المحاولة لاحقاً.';
      toast.error(errorMsg);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-500 shrink-0 shadow-2xs">
            <Gavel className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                {t('auctions.title', { defaultValue: 'مراقبة وإدارة المزادات' })}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 shadow-2xs">
                {toLocalizedDigits(total, isRTL)}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
              {t('auctions.subtitle', {
                defaultValue:
                  'متابعة المزادات الحية، التدقيق في السلع والأسعار، وإلغاء المزادات المخالفة وإشراف المراجعات',
              })}
            </p>
          </div>
        </div>
      </div>

      {/* Main Auctions Table */}
      <AdminAuctionsTable
        auctions={auctions}
        total={total}
        totalPages={totalPages}
        currentPage={currentPage}
        isLoading={isLoading}
        isRefetching={isRefetching}
        searchQuery={searchQuery}
        onSearchChange={(val) => updateParam('search', val)}
        selectedCategory={selectedCategory}
        onCategoryChange={(cat) => updateParam('category', cat)}
        selectedStatus={selectedStatus}
        onStatusChange={(st) => updateParam('status', st)}
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
              next.delete('auctionsPage');
              return next;
            },
            { replace: true }
          );
        }}
        sortOrder={sortOrder}
        onSortOrderToggle={() =>
          updateParam('sortOrder', sortOrder === 'DESC' ? 'ASC' : 'DESC')
        }
        onPageChange={(page) => updateParam('auctionsPage', page.toString(), false)}
        onRefresh={() => refetch()}
        onCancelAuction={(auc) => setCancelTargetAuction(auc)}
        onModerateReviews={(auc) => setReviewsTargetAuction(auc)}
      />

      {/* Cancel Auction Modal */}
      <AdminCancelAuctionModal
        isOpen={Boolean(cancelTargetAuction)}
        onClose={() => setCancelTargetAuction(null)}
        onConfirm={handleConfirmCancel}
        isLoading={isCancelling}
        auction={cancelTargetAuction}
      />

      {/* Auction Reviews Moderation Modal */}
      <AuctionReviewsModerationModal
        isOpen={Boolean(reviewsTargetAuction)}
        onClose={() => setReviewsTargetAuction(null)}
        auctionId={reviewsTargetAuction?._id}
        auctionTitle={reviewsTargetAuction?.title}
        auctionStatus={reviewsTargetAuction?.status}
        adminActionReason={reviewsTargetAuction?.adminActionReason}
      />
    </div>
  );
};

export default AdminAuctionsPage;
