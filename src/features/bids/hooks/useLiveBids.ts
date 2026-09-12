import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useSocket } from '@/hooks/useSocket';
import { useAuth } from '@/hooks/useAuth';
import { bidsService, BID_ADDED_SUBSCRIPTION } from '../services/bids.service';
import type { BidAddedPayload, BidsPage } from '../types/bids.types';
import type { Auction } from '@/features/auctions/types/auctions.types';
import { QUERY_KEYS } from '@/constants/queryKeys.constants';

export interface UseLiveBidsOptions {
  onBidAdded?: (payload: BidAddedPayload) => void;
}

export const useLiveBids = (auctionId: string, options?: UseLiveBidsOptions) => {
  const { subscribe, isConnected } = useSocket();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [latestBid, setLatestBid] = useState<BidAddedPayload | null>(null);

  // 1. Initial query to fetch the latest leading bid on page load & refresh
  const initialBidsQuery = useQuery({
    queryKey: QUERY_KEYS.BIDS.BY_AUCTION(auctionId),
    queryFn: () =>
      auctionId
        ? bidsService.getAuctionBids(auctionId, { page: 1, limit: 1 })
        : Promise.resolve({ items: [], total: 0, totalPages: 0, hasNextPage: false }),
    enabled: Boolean(auctionId),
    staleTime: 30 * 1000,
  });

  // 2. Real-time subscription to update latest bid and sync React Query cache
  useEffect(() => {
    if (!auctionId) return;

    const unsubscribe = subscribe<{ bidAdded: BidAddedPayload }>(
      {
        query: BID_ADDED_SUBSCRIPTION,
        variables: { auctionId },
      },
      {
        next: (data) => {
          // 💡 data is GraphQL ExecutionResult.data: { bidAdded: BidAddedPayload }
          if (!data?.bidAdded) return;
          const payload = data.bidAdded;

          setLatestBid(payload);

          // Synchronously update auction details in React Query cache without a full refetch
          queryClient.setQueryData(
            QUERY_KEYS.AUCTIONS.DETAIL(auctionId),
            (oldAuction: Auction | undefined) => {
              if (!oldAuction) return oldAuction;
              return {
                ...oldAuction,
                currentPrice: payload.currentPrice.toString(),
                winnerId: payload.leadingBidderId ?? oldAuction.winnerId,
              };
            }
          );

          // Synchronously update bids list query cache
          queryClient.setQueryData(
            QUERY_KEYS.BIDS.BY_AUCTION(auctionId),
            (oldBids: BidsPage | undefined) => {
              if (!oldBids) {
                return {
                  items: [payload.bid],
                  total: payload.bidCount,
                  totalPages: 1,
                  hasNextPage: false,
                };
              }
              return {
                ...oldBids,
                items: [payload.bid, ...oldBids.items.filter((b) => b._id !== payload.bid._id)],
                total: payload.bidCount,
              };
            }
          );

          // Automatically re-sync Wallet balance and Auto-bid state in Real-Time!
          queryClient.invalidateQueries({ queryKey: QUERY_KEYS.WALLET.MY_WALLET });
          queryClient.invalidateQueries({ queryKey: QUERY_KEYS.BIDS.MY_AUTO_BID(auctionId) });

          options?.onBidAdded?.(payload);
        },
        error: (err) => {
          console.warn('WebSocket bidAdded subscription error:', err);
        },
      }
    );

    // Mandatory cleanup function to prevent memory leaks and dangling listeners
    return () => {
      unsubscribe();
    };
  }, [auctionId, subscribe, queryClient, options]);

  // Determine leading bidder ID from real-time WS payload OR initial query's latest bid
  const leadingBidderId =
    latestBid?.leadingBidderId ||
    (initialBidsQuery.data?.items && initialBidsQuery.data.items.length > 0
      ? initialBidsQuery.data.items[0].bidderId
      : null);

  const isLeadingBidder = Boolean(
    user?._id && leadingBidderId && user._id === leadingBidderId
  );

  return {
    latestBid,
    isLeadingBidder,
    isSocketConnected: isConnected,
  };
};

export default useLiveBids;
