import { useQuery, useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/constants/queryKeys.constants';
import { escrowService } from '../services/escrow.service';
import { useAuth } from '@/hooks/useAuth';
import { usePublicProfile } from '@/features/users';
import type { EscrowData, EscrowsPageData } from '../types/escrow.types';

export function useEscrowDetail(escrowId?: string) {
  const { user: currentUser } = useAuth();
  const queryClient = useQueryClient();

  // 1. Fetch Escrow Entity with dual-lookup (by escrow ID, fallback to auction ID)
  const escrowQuery = useQuery<EscrowData>({
    queryKey: escrowId ? QUERY_KEYS.ESCROW.DETAIL(escrowId) : ['escrow', 'none'],
    queryFn: async () => {
      if (!escrowId) throw new Error('No escrow identifier provided');
      // 1. Try direct Escrow ID lookup
      try {
        const directEscrow = await escrowService.getEscrowById(escrowId);
        if (directEscrow) return directEscrow;
      } catch {
        // Fallback to auctionId lookup
      }

      // 2. Fallback: Lookup by Auction ID
      try {
        const byAuctionEscrow = await escrowService.getEscrowByAuction(escrowId);
        if (byAuctionEscrow) return byAuctionEscrow;
      } catch {
        // Both lookups failed
      }

      throw new Error('Escrow not found');
    },
    enabled: Boolean(escrowId),
    placeholderData: () => {
      if (!escrowId) return undefined;
      const myEscrowsQueries = queryClient.getQueriesData<EscrowsPageData>({
        queryKey: QUERY_KEYS.ESCROW.MY_ESCROWS,
      });
      for (const [, data] of myEscrowsQueries) {
        const found = data?.items?.find(
          (item) => item._id === escrowId || item.auctionId === escrowId
        );
        if (found) return found;
      }
      return undefined;
    },
    staleTime: 0,
  });

  const escrow = escrowQuery.data;

  // 2. Determine User Roles
  const isBuyer = Boolean(currentUser?._id && escrow?.buyerId && currentUser._id === escrow.buyerId);
  const isSeller = Boolean(currentUser?._id && escrow?.sellerId && currentUser._id === escrow.sellerId);

  // 3. Determine Counterparty
  const counterpartyId = isBuyer ? escrow?.sellerId : isSeller ? escrow?.buyerId : undefined;
  const counterpartyRole: 'buyer' | 'seller' = isBuyer ? 'seller' : 'buyer';

  // 4. Fetch Counterparty Public Profile
  const counterpartyQuery = usePublicProfile(counterpartyId);

  // 5. Derived Business Logic
  const now = new Date();
  const endsAt = escrow?.inspectionPeriodEndsAt ? new Date(escrow.inspectionPeriodEndsAt) : null;
  const isWithinInspectionPeriod = Boolean(
    endsAt && !isNaN(endsAt.getTime()) && now < endsAt
  );

  const isHeld = escrow?.status === 'HELD';
  const isReleased = escrow?.status === 'RELEASED';
  const isRefunded = escrow?.status === 'REFUNDED';
  const isDisputed = escrow?.status === 'DISPUTED';

  const canConfirmDelivery = Boolean(isBuyer && isHeld);
  const canOpenDispute = Boolean(isBuyer && isHeld && isWithinInspectionPeriod);

  return {
    escrow,
    isLoading: escrowQuery.isLoading,
    isError: escrowQuery.isError,
    error: escrowQuery.error,
    refetch: escrowQuery.refetch,

    // User Roles & Counterparty
    isBuyer,
    isSeller,
    counterpartyId,
    counterpartyRole,
    counterpartyProfile: counterpartyQuery.data,
    isCounterpartyLoading: counterpartyQuery.isLoading,

    // Inspection & Action Flags
    isWithinInspectionPeriod,
    canConfirmDelivery,
    canOpenDispute,
    isHeld,
    isReleased,
    isRefunded,
    isDisputed,
  };
}
