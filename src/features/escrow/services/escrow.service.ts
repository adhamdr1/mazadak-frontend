import { executeGraphQL } from '@/services/api/graphqlClient';
import { subscribeToSubscription } from '@/services/websocket/socketClient';
import type {
  EscrowData,
  EscrowsPageData,
  EscrowFilterInput,
  PaginationInput,
  OpenDisputeInput,
  DisputeData,
  DisputesPageData,
  DisputeFilterInput,
  EscrowStatusChangedPayload,
  DisputeStatusChangedPayload,
} from '../types/escrow.types';

// ==========================================
// GraphQL Fragments
// ==========================================

export const ESCROW_FIELDS_FRAGMENT = `
  fragment EscrowFields on Escrow {
    _id
    auctionId
    buyerId
    sellerId
    amount
    currency
    status
    inspectionPeriodEndsAt
    inspectionDurationHours
    releasedAt
    refundedAt
    disputeId
    releaseReason
    createdAt
    updatedAt
    auction {
      _id
      title
      images
      currentPrice
      startingPrice
    }
  }
`;

export const DISPUTE_FIELDS_FRAGMENT = `
  fragment DisputeFields on Dispute {
    _id
    escrowId
    auctionId
    openedById
    againstUserId
    reason
    description
    evidenceUrls
    status
    adminId
    adminDecision
    adminNotes
    resolvedAt
    createdAt
    updatedAt
  }
`;

// ==========================================
// GraphQL Queries & Mutations
// ==========================================

export const MY_ESCROWS_QUERY = `
  ${ESCROW_FIELDS_FRAGMENT}
  query MyEscrows($input: PaginationInput, $filter: EscrowFilterInput) {
    myEscrows(input: $input, filter: $filter) {
      items {
        ...EscrowFields
      }
      total
      totalPages
      hasNextPage
    }
  }
`;

export const ESCROW_BY_ID_QUERY = `
  ${ESCROW_FIELDS_FRAGMENT}
  query EscrowById($id: ID!) {
    escrow(id: $id) {
      ...EscrowFields
    }
  }
`;

export const ESCROW_BY_AUCTION_QUERY = `
  ${ESCROW_FIELDS_FRAGMENT}
  query EscrowByAuction($auctionId: ID!) {
    escrowByAuction(auctionId: $auctionId) {
      ...EscrowFields
    }
  }
`;

export const CONFIRM_DELIVERY_MUTATION = `
  ${ESCROW_FIELDS_FRAGMENT}
  mutation ConfirmDelivery($escrowId: ID!) {
    confirmDelivery(escrowId: $escrowId) {
      ...EscrowFields
    }
  }
`;

export const OPEN_DISPUTE_MUTATION = `
  ${DISPUTE_FIELDS_FRAGMENT}
  mutation OpenDispute($input: CreateDisputeInput!) {
    openDispute(input: $input) {
      ...DisputeFields
    }
  }
`;

export const DISPUTE_BY_ID_QUERY = `
  ${DISPUTE_FIELDS_FRAGMENT}
  query DisputeById($id: ID!) {
    dispute(id: $id) {
      ...DisputeFields
    }
  }
`;

export const DISPUTE_BY_AUCTION_QUERY = `
  ${DISPUTE_FIELDS_FRAGMENT}
  query DisputeByAuction($auctionId: ID!) {
    disputeByAuction(auctionId: $auctionId) {
      ...DisputeFields
    }
  }
`;

export const MY_DISPUTES_QUERY = `
  ${DISPUTE_FIELDS_FRAGMENT}
  query MyDisputes($input: PaginationInput, $filter: DisputeFilterInput) {
    myDisputes(input: $input, filter: $filter) {
      items {
        ...DisputeFields
      }
      total
      totalPages
      hasNextPage
    }
  }
`;

export const CANCEL_DISPUTE_MUTATION = `
  ${DISPUTE_FIELDS_FRAGMENT}
  mutation CancelDispute($disputeId: ID!) {
    cancelDispute(disputeId: $disputeId) {
      ...DisputeFields
    }
  }
`;

export const ESCROW_STATUS_CHANGED_SUBSCRIPTION = `
  subscription OnEscrowStatusChanged($escrowId: ID!) {
    escrowStatusChanged(escrowId: $escrowId) {
      escrowId
      auctionId
      status
      releasedAt
      refundedAt
      disputeId
      releaseReason
    }
  }
`;

export const DISPUTE_STATUS_CHANGED_SUBSCRIPTION = `
  subscription OnDisputeStatusChanged($disputeId: ID!) {
    disputeStatusChanged(disputeId: $disputeId) {
      disputeId
      escrowId
      auctionId
      status
      adminDecision
      adminNotes
      resolvedAt
    }
  }
`;

// ==========================================
// Service Implementation
// ==========================================

export const escrowService = {
  /**
   * Fetch list of user escrows (as buyer or seller) with pagination and status filtering
   */
  getMyEscrows: async (
    input?: PaginationInput,
    filter?: EscrowFilterInput
  ): Promise<EscrowsPageData> => {
    const data = await executeGraphQL<{ myEscrows: EscrowsPageData }>(MY_ESCROWS_QUERY, {
      input,
      filter,
    });
    return data.myEscrows;
  },

  /**
   * Fetch single escrow by direct escrow ID
   */
  getEscrowById: async (id: string): Promise<EscrowData> => {
    const data = await executeGraphQL<{ escrow: EscrowData }>(ESCROW_BY_ID_QUERY, { id });
    return data.escrow;
  },

  /**
   * Fetch escrow by associated auction ID (nullable if auction has no finalized escrow)
   */
  getEscrowByAuction: async (auctionId: string): Promise<EscrowData | null> => {
    const data = await executeGraphQL<{ escrowByAuction: EscrowData | null }>(
      ESCROW_BY_AUCTION_QUERY,
      { auctionId }
    );
    return data.escrowByAuction;
  },

  /**
   * Buyer action: Confirm delivery of goods and release escrow funds to seller
   */
  confirmDelivery: async (escrowId: string): Promise<EscrowData> => {
    const data = await executeGraphQL<{ confirmDelivery: EscrowData }>(
      CONFIRM_DELIVERY_MUTATION,
      { escrowId }
    );
    return data.confirmDelivery;
  },

  /**
   * Buyer/Seller action: Open financial dispute on an auction
   */
  openDispute: async (input: OpenDisputeInput): Promise<DisputeData> => {
    const data = await executeGraphQL<{ openDispute: DisputeData }>(OPEN_DISPUTE_MUTATION, {
      input,
    });
    return data.openDispute;
  },

  /**
   * Fetch dispute details by direct dispute ID
   */
  getDisputeById: async (id: string): Promise<DisputeData> => {
    const data = await executeGraphQL<{ dispute: DisputeData }>(DISPUTE_BY_ID_QUERY, { id });
    return data.dispute;
  },

  /**
   * Fetch dispute by auction ID (nullable)
   */
  getDisputeByAuction: async (auctionId: string): Promise<DisputeData | null> => {
    const data = await executeGraphQL<{ disputeByAuction: DisputeData | null }>(
      DISPUTE_BY_AUCTION_QUERY,
      { auctionId }
    );
    return data.disputeByAuction;
  },

  /**
   * Fetch current user's disputes
   */
  getMyDisputes: async (
    input?: PaginationInput,
    filter?: DisputeFilterInput
  ): Promise<DisputesPageData> => {
    const data = await executeGraphQL<{ myDisputes: DisputesPageData }>(MY_DISPUTES_QUERY, {
      input,
      filter,
    });
    return data.myDisputes;
  },

  /**
   * Opener action: Cancel an OPEN or UNDER_REVIEW dispute, reverting Escrow to HELD
   */
  cancelDispute: async (disputeId: string): Promise<DisputeData> => {
    const data = await executeGraphQL<{ cancelDispute: DisputeData }>(
      CANCEL_DISPUTE_MUTATION,
      { disputeId }
    );
    return data.cancelDispute;
  },

  /**
   * Real-time subscription to status changes of an escrow hold
   */
  subscribeToEscrowStatusChanged: (
    escrowId: string,
    handlers: {
      next: (payload: EscrowStatusChangedPayload) => void;
      error?: (err: unknown) => void;
      complete?: () => void;
    },
    token?: string | null
  ): (() => void) => {
    return subscribeToSubscription<{ escrowStatusChanged: EscrowStatusChangedPayload }>(
      {
        query: ESCROW_STATUS_CHANGED_SUBSCRIPTION,
        variables: { escrowId },
      },
      {
        next: (data) => {
          if (data.escrowStatusChanged) {
            handlers.next(data.escrowStatusChanged);
          }
        },
        error: handlers.error,
        complete: handlers.complete,
      },
      token
    );
  },

  /**
   * Real-time subscription to status changes of a dispute
   */
  subscribeToDisputeStatusChanged: (
    disputeId: string,
    handlers: {
      next: (payload: DisputeStatusChangedPayload) => void;
      error?: (err: unknown) => void;
      complete?: () => void;
    },
    token?: string | null
  ): (() => void) => {
    return subscribeToSubscription<{ disputeStatusChanged: DisputeStatusChangedPayload }>(
      {
        query: DISPUTE_STATUS_CHANGED_SUBSCRIPTION,
        variables: { disputeId },
      },
      {
        next: (data) => {
          if (data.disputeStatusChanged) {
            handlers.next(data.disputeStatusChanged);
          }
        },
        error: handlers.error,
        complete: handlers.complete,
      },
      token
    );
  },
};
