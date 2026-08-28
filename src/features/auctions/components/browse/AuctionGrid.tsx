import React from 'react';
import { cn } from '@/utils/cn';
import type { Auction } from '../../types/auctions.types';
import { AuctionCard } from '../shared/AuctionCard';
import { AuctionCardSkeleton } from '../shared/AuctionCardSkeleton';
import { AuctionEmptyState } from './AuctionEmptyState';

export interface AuctionGridProps {
  auctions: Auction[];
  isLoading?: boolean;
  viewMode?: 'grid' | 'list';
  skeletonCount?: number;
  onResetFilters?: () => void;
  onStatusExpire?: (auctionId: string) => void;
  className?: string;
}

export const AuctionGrid: React.FC<AuctionGridProps> = ({
  auctions,
  isLoading = false,
  viewMode = 'grid',
  skeletonCount = 8,
  onResetFilters,
  onStatusExpire,
  className,
}) => {
  const isListView = viewMode === 'list';

  if (isLoading) {
    return (
      <div
        className={cn(
          isListView
            ? 'flex flex-col gap-4'
            : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6',
          className
        )}
      >
        <AuctionCardSkeleton count={skeletonCount} viewMode={viewMode} />
      </div>
    );
  }

  if (auctions.length === 0) {
    return <AuctionEmptyState onResetFilters={onResetFilters} className={className} />;
  }

  return (
    <div
      className={cn(
        isListView
          ? 'flex flex-col gap-4'
          : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6',
        className
      )}
    >
      {auctions.map((auction) => (
        <AuctionCard
          key={auction._id}
          auction={auction}
          viewMode={viewMode}
          onStatusExpire={onStatusExpire}
        />
      ))}
    </div>
  );
};

export default AuctionGrid;
