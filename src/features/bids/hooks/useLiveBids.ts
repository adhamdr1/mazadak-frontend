import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useSocket } from '@/hooks/useSocket';
import { useAuth } from '@/hooks/useAuth';
import { bidsService } from '../services/bids.service';
import type { Auction } from '@/features/auctions/types/auctions.types';
import { QUERY_KEYS } from '@/constants/queryKeys.constants';

export const useLiveBids = (auctionId: string) => {
  const { isConnected } = useSocket();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // 1. Initial query to fetch the latest leading bid on page load & refresh
  const initialBidsQuery = useQuery({
    queryKey: [...QUERY_KEYS.BIDS.BY_AUCTION(auctionId), 'leading-bid'],
    queryFn: () =>
      auctionId
        ? bidsService.getAuctionBids(auctionId, { page: 1, limit: 1 })
        : Promise.resolve({ items: [], total: 0, totalPages: 0, hasNextPage: false }),
    enabled: Boolean(auctionId),
    staleTime: 30 * 1000,
  });

  // Query cached auction detail for real-time winnerId / leadingBidderId (maintained by useAuctionDetail)
  const cachedAuction = queryClient.getQueryData<Auction>(QUERY_KEYS.AUCTIONS.DETAIL(auctionId));

  // Determine leading bidder ID from cached auction details OR initial query's latest bid
  const leadingBidderId =
    cachedAuction?.winnerId ||
    (initialBidsQuery.data?.items && initialBidsQuery.data.items.length > 0
      ? initialBidsQuery.data.items[0].bidderId
      : null);

  const isLeadingBidder = Boolean(
    user?._id && leadingBidderId && user._id === leadingBidderId
  );

  return {
    latestBid: null,
    isLeadingBidder,
    isSocketConnected: isConnected,
  };
};

export default useLiveBids;
