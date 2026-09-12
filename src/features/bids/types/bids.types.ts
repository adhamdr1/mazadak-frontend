/**
 * Bids Module Types
 * Strictly aligned with backend GraphQL Schema (.agents/schema.gql)
 */

export type BidStatus = 'WINNING' | 'OUTBID';
export type AutoBidStatus = 'ACTIVE' | 'EXHAUSTED' | 'CANCELLED';

export type BidsSortField = 'AMOUNT' | 'CREATED_AT';
export type SortOrder = 'ASC' | 'DESC';

export interface Bid {
  _id: string;
  auctionId: string;
  bidderId: string;
  amount: string; // Stored as string in schema.gql
  status: BidStatus;
  createdAt: string;
  updatedAt: string;
}

export interface AutoBid {
  _id: string;
  auctionId: string;
  userId: string;
  maxAmount: string; // Stored as string in schema.gql
  status: AutoBidStatus;
  createdAt: string;
  updatedAt: string;
}

export interface BidAddedPayload {
  bid: Bid;
  currentPrice: number; // Float in schema.gql
  leadingBidderId: string;
  bidCount: number;
}

export interface BidsPage {
  items: Bid[];
  total: number;
  totalPages: number;
  hasNextPage: boolean;
}

export interface AutoBidsPage {
  items: AutoBid[];
  total: number;
  totalPages: number;
  hasNextPage: boolean;
}

export interface PaginationInput {
  page?: number;
  limit?: number;
}

export interface BidsSortInput {
  field?: BidsSortField;
  order?: SortOrder;
}

export interface BidsFilterInput {
  status?: BidStatus;
  sort?: BidsSortInput;
}

export interface PlaceBidInput {
  auctionId: string;
  amount: number;
}

export interface SetAutoBidInput {
  auctionId: string;
  maxAmount: number;
}

export interface CancelAutoBidInput {
  auctionId: string;
}
