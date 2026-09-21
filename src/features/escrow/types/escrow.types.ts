/**
 * Escrow & Disputes Module TypeScript Definitions
 * Strictly aligned with `.agents/schema.gql` and `.agents/BACKEND_CONTRACT.md` (Section 7)
 */

export type EscrowStatus = 'HELD' | 'RELEASED' | 'REFUNDED' | 'DISPUTED';

export type DisputeStatus =
  | 'OPEN'
  | 'UNDER_REVIEW'
  | 'RESOLVED_BUYER_REFUNDED'
  | 'RESOLVED_SELLER_PAID'
  | 'CANCELLED';

export type DisputeReason =
  | 'ITEM_NOT_RECEIVED'
  | 'ITEM_DAMAGED'
  | 'ITEM_MISMATCH'
  | 'COUNTERFEIT_ITEM'
  | 'OTHER';

export type DisputeResolution = 'REFUND_BUYER' | 'PAY_SELLER';

// ----------------------------------------------------
// Entities & Projections
// ----------------------------------------------------

export interface EscrowAuctionSummary {
  _id: string;
  title: string;
  images: string[];
  currentPrice: string;
  startingPrice?: string;
}

export interface EscrowData {
  _id: string;
  auctionId: string;
  buyerId: string;
  sellerId: string;
  amount: string;
  currency: string;
  status: EscrowStatus;
  inspectionPeriodEndsAt: string;
  inspectionDurationHours: number;
  releasedAt?: string | null;
  refundedAt?: string | null;
  disputeId?: string | null;
  releaseReason?: string | null;
  createdAt: string;
  updatedAt: string;
  auction?: EscrowAuctionSummary | null;
}

export interface EscrowsPageData {
  items: EscrowData[];
  total: number;
  totalPages: number;
  hasNextPage: boolean;
}

export interface DisputeData {
  _id: string;
  escrowId: string;
  auctionId: string;
  openedById: string;
  againstUserId: string;
  reason: DisputeReason;
  description: string;
  evidenceUrls: string[];
  status: DisputeStatus;
  adminId?: string | null;
  adminDecision?: DisputeResolution | null;
  adminNotes?: string | null;
  resolvedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DisputesPageData {
  items: DisputeData[];
  total: number;
  totalPages: number;
  hasNextPage: boolean;
}

// ----------------------------------------------------
// GraphQL Inputs
// ----------------------------------------------------

export interface PaginationInput {
  page?: number;
  limit?: number;
}

export interface EscrowFilterInput {
  status?: EscrowStatus;
  userId?: string;
  buyerId?: string;
  sellerId?: string;
  auctionId?: string;
}

export interface DisputeFilterInput {
  status?: DisputeStatus;
  userId?: string;
  openedById?: string;
  againstUserId?: string;
  auctionId?: string;
}

export interface OpenDisputeInput {
  auctionId: string;
  reason: DisputeReason;
  description: string;
  evidenceUrls?: string[];
}

// ----------------------------------------------------
// Subscription Payloads
// ----------------------------------------------------

export interface EscrowStatusChangedPayload {
  escrowId: string;
  auctionId: string;
  status: EscrowStatus;
  releasedAt?: string | null;
  refundedAt?: string | null;
  disputeId?: string | null;
  releaseReason?: string | null;
}

export interface DisputeStatusChangedPayload {
  disputeId: string;
  escrowId: string;
  auctionId: string;
  status: DisputeStatus;
  adminDecision?: DisputeResolution | null;
  adminNotes?: string | null;
  resolvedAt?: string | null;
}
