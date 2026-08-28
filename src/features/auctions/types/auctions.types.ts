/**
 * Auctions Module TypeScript Definitions
 * Strictly aligned with `.agents/schema.gql` and `.agents/BACKEND_CONTRACT.md`
 */

export type AuctionCategory =
  | 'ELECTRONICS'
  | 'FASHION'
  | 'JEWELRY'
  | 'WATCHES'
  | 'ANTIQUES'
  | 'ART'
  | 'COLLECTIBLES'
  | 'BOOKS'
  | 'FURNITURE'
  | 'HOME_APPLIANCES'
  | 'CARS'
  | 'MOTORCYCLES'
  | 'REAL_ESTATE'
  | 'SPORTS'
  | 'TOYS'
  | 'OTHER';

export type AuctionStatus = 'PENDING' | 'ACTIVE' | 'ENDED' | 'CANCELLED';

export type AuctionsSortField =
  | 'CREATED_AT'
  | 'START_TIME'
  | 'END_TIME'
  | 'CURRENT_PRICE'
  | 'TITLE';

export type SortOrder = 'ASC' | 'DESC';

// ----------------------------------------------------
// Core Entities & Projections
// ----------------------------------------------------

export interface Auction {
  _id: string;
  sellerId: string;
  title: string;
  description: string;
  images: string[];
  category: AuctionCategory;
  startingPrice: string;
  minimumBidIncrement: string;
  currentPrice: string;
  status: AuctionStatus;
  startTime: string; // ISO DateTime string
  endTime: string; // ISO DateTime string
  winnerId?: string | null;
  isFinalized: boolean;
  adminActionReason?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AuctionsPage {
  items: Auction[];
  total: number;
  totalPages: number;
  hasNextPage: boolean;
}

export interface UploadImageResponse {
  url: string;
}

export interface UploadSignatureResponse {
  signature: string;
  timestamp: number;
  apiKey: string;
  cloudName: string;
  folder: string;
}

export interface AuctionStatusChangedPayload {
  auction: Auction;
}

// ----------------------------------------------------
// GraphQL Inputs
// ----------------------------------------------------

export interface PaginationInput {
  page?: number;
  limit?: number;
}

export interface AuctionsSortInput {
  field: AuctionsSortField;
  order: SortOrder;
}

export interface AuctionsFilterInput {
  category?: AuctionCategory;
  status?: AuctionStatus;
  search?: string;
  sort?: AuctionsSortInput;
}

export interface CreateAuctionInput {
  title: string;
  description: string;
  category: AuctionCategory;
  startingPrice: number;
  minimumBidIncrement: number;
  images: string[];
  startTime: string; // ISO DateTime string
  endTime: string; // ISO DateTime string
}

export interface UpdateAuctionInput {
  title?: string;
  description?: string;
  category?: AuctionCategory;
  images?: string[];
  startTime?: string;
  endTime?: string;
}

export interface UploadImageInput {
  base64Data: string;
  folder?: string;
}

// ----------------------------------------------------
// UI Form Data Types (Consumed by React Hook Form)
// ----------------------------------------------------

export interface CreateAuctionFormData {
  title: string;
  description: string;
  category: AuctionCategory;
  startingPrice: number;
  minimumBidIncrement: number;
  startTime: string;
  endTime: string;
  images: string[];
}

export interface UpdateAuctionFormData {
  title?: string;
  description?: string;
  category?: AuctionCategory;
  startTime?: string;
  endTime?: string;
  images?: string[];
}

// ----------------------------------------------------
// Backend Contract Error Codes
// ----------------------------------------------------

export type AuctionErrorCode =
  | 'AUCTION_NOT_FOUND'
  | 'AUCTION_START_TIME_TOO_SOON'
  | 'AUCTION_END_TIME_MUST_BE_AFTER_START_TIME'
  | 'AUCTION_FORBIDDEN'
  | 'AUCTION_NOT_PENDING'
  | 'AUCTION_INVALID_STATE'
  | 'INVALID_IMAGE_FORMAT'
  | 'IMAGE_SIZE_EXCEEDS_LIMIT'
  | 'GENERIC_ERROR';
