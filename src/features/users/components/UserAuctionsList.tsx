import React from 'react';
import { useTranslation } from 'react-i18next';
import { PackageOpen, AlertCircle, RefreshCw } from 'lucide-react';
import { AuctionCard, AuctionCardSkeleton } from '@/features/auctions';
import { Pagination } from '@/components/common/Pagination';
import { EmptyState } from '@/components/feedback/EmptyState';
import { Button } from '@/components/common/Button';
import { useUserAuctions } from '../hooks/useUserAuctions';
import type { AuctionStatus } from '@/features/auctions/types/auctions.types';

export interface UserAuctionsListProps {
  userId: string;
  status: AuctionStatus;
  page: number;
  onPageChange: (newPage: number) => void;
  className?: string;
}

export const UserAuctionsList: React.FC<UserAuctionsListProps> = ({
  userId,
  status,
  page,
  onPageChange,
  className = '',
}) => {
  const { t } = useTranslation(['users', 'common']);
  const limit = 6;

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useUserAuctions({
    userId,
    status,
    page,
    limit,
  });

  // Loading State
  if (isLoading) {
    return (
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${className}`}>
        {Array.from({ length: limit }).map((_, i) => (
          <AuctionCardSkeleton key={`auction-skel-${i}`} viewMode="grid" />
        ))}
      </div>
    );
  }

  // Error State
  if (isError) {
    return (
      <div className="rounded-3xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 p-8 text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-red-500/10 text-red-500 mx-auto flex items-center justify-center">
          <AlertCircle className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            {t('common:error', 'حدث خطأ')}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
            {error?.message || t('users:personal.updateError')}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
        >
          {t('common:retry', 'إعادة المحاولة')}
        </Button>
      </div>
    );
  }

  const items = data?.items || [];
  const total = data?.total || 0;
  const totalPages = data?.totalPages || 0;

  // Empty State
  if (items.length === 0) {
    const isCompleted = status === 'ENDED';
    return (
      <div className="py-8">
        <EmptyState
          icon={<PackageOpen className="w-8 h-8 text-slate-400" />}
          title={
            isCompleted
              ? t('users:public.noCompletedAuctions', 'لا توجد مزادات منتهية مسجلة لهذا المستخدم.')
              : t('users:public.noActiveAuctions', 'لا توجد مزادات نشطة لهذا المستخدم حالياً.')
          }
          size="md"
        />
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Grid of Auctions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((auction) => (
          <AuctionCard
            key={auction._id}
            auction={auction}
            viewMode="grid"
          />
        ))}
      </div>

      {/* Independent Pagination */}
      {totalPages > 1 && (
        <Pagination
          page={page}
          totalPages={totalPages}
          total={total}
          limit={limit}
          onPageChange={onPageChange}
          isLoading={isFetching}
        />
      )}
    </div>
  );
};
