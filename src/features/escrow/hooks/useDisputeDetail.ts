import { useQuery, useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/constants/queryKeys.constants';
import { escrowService } from '../services/escrow.service';
import { useAuth } from '@/hooks/useAuth';
import { usePublicProfile } from '@/features/users';
import type { DisputeData, EscrowData, DisputesPageData } from '../types/escrow.types';

export function useDisputeDetail(disputeId?: string) {
  const { user: currentUser } = useAuth();
  const queryClient = useQueryClient();

  // 1. Fetch Dispute by ID
  const disputeQuery = useQuery<DisputeData>({
    queryKey: disputeId ? QUERY_KEYS.ESCROW.DISPUTE(disputeId) : ['dispute', 'none'],
    queryFn: async () => {
      if (!disputeId) throw new Error('No dispute identifier provided');
      try {
        const directDispute = await escrowService.getDisputeById(disputeId);
        if (directDispute) return directDispute;
      } catch (err) {
        // Fallback: in case disputeId passed was an auctionId
        try {
          const byAuctionDispute = await escrowService.getDisputeByAuction(disputeId);
          if (byAuctionDispute) return byAuctionDispute;
        } catch {
          // Ignore and throw original error
        }
        throw err;
      }
      throw new Error('Dispute not found');
    },
    enabled: Boolean(disputeId),
    placeholderData: () => {
      if (!disputeId) return undefined;
      const myDisputesQueries = queryClient.getQueriesData<DisputesPageData>({
        queryKey: ['myDisputes'],
      });
      for (const [, data] of myDisputesQueries) {
        const found = data?.items?.find(
          (item) => item._id === disputeId || item.auctionId === disputeId
        );
        if (found) return found;
      }
      return undefined;
    },
    staleTime: 0,
  });

  const dispute = disputeQuery.data;

  // 2. Fetch Associated Escrow
  const escrowQuery = useQuery<EscrowData | null>({
    queryKey: dispute?.escrowId
      ? QUERY_KEYS.ESCROW.DETAIL(dispute.escrowId)
      : dispute?.auctionId
      ? QUERY_KEYS.ESCROW.BY_AUCTION(dispute.auctionId)
      : ['escrow', 'for-dispute', 'none'],
    queryFn: async () => {
      if (dispute?.escrowId) {
        try {
          return await escrowService.getEscrowById(dispute.escrowId);
        } catch {
          // Fallback to auction ID
        }
      }
      if (dispute?.auctionId) {
        return await escrowService.getEscrowByAuction(dispute.auctionId);
      }
      return null;
    },
    enabled: Boolean(dispute?.escrowId || dispute?.auctionId),
    staleTime: 30 * 1000,
  });

  const escrow = escrowQuery.data;

  // 3. User Role in Dispute
  const isOpener = Boolean(
    currentUser?._id && dispute?.openedById && currentUser._id === dispute.openedById
  );
  const isAgainstUser = Boolean(
    currentUser?._id && dispute?.againstUserId && currentUser._id === dispute.againstUserId
  );

  // 4. Counterparty profiles
  const openerProfileQuery = usePublicProfile(dispute?.openedById);
  const againstUserProfileQuery = usePublicProfile(dispute?.againstUserId);

  // 5. Dispute Lifecycle State & Actions
  const isOpen = dispute?.status === 'OPEN';
  const isUnderReview = dispute?.status === 'UNDER_REVIEW';
  const isResolved =
    dispute?.status === 'RESOLVED_BUYER_REFUNDED' ||
    dispute?.status === 'RESOLVED_SELLER_PAID';
  const isCancelled = dispute?.status === 'CANCELLED';

  const canCancel = Boolean(isOpener && (isOpen || isUnderReview));

  return {
    dispute,
    escrow,
    isLoading: disputeQuery.isLoading,
    isError: disputeQuery.isError,
    error: disputeQuery.error,
    refetch: disputeQuery.refetch,

    // Associated Entities
    isEscrowLoading: escrowQuery.isLoading,

    // User Roles
    isOpener,
    isAgainstUser,
    openerProfile: openerProfileQuery.data,
    againstUserProfile: againstUserProfileQuery.data,
    isOpenerProfileLoading: openerProfileQuery.isLoading,
    isAgainstUserProfileLoading: againstUserProfileQuery.isLoading,

    // Status Flags
    isOpen,
    isUnderReview,
    isResolved,
    isCancelled,
    canCancel,
  };
}
