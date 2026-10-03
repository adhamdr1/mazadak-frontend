import type { UserRole, AuthProvider, Address } from '@/features/auth/types/auth.types';
import type { Auction, AuctionStatus } from '@/features/auctions/types/auctions.types';

// Re-export Address to maintain single source of truth across auth and users
export type { Address };

// ----------------------------------------------------
// Rating interfaces (MUST strictly match reviews.types.ts dependency)
// ----------------------------------------------------

export interface RatingBreakdown {
  oneStar: number;
  twoStar: number;
  threeStar: number;
  fourStar: number;
  fiveStar: number;
}

export interface RatingStats {
  averageRating: number;
  totalReviews: number;
  asSellerAverageRating?: number;
  asSellerTotalReviews?: number;
  asBuyerAverageRating?: number;
  asBuyerTotalReviews?: number;
  breakdown?: RatingBreakdown;
}

// ----------------------------------------------------
// User Profiles
// ----------------------------------------------------

export interface PublicProfile {
  id: string;
  firstName: string;
  lastName: string;
  city?: string;
  memberSince: string;
  ratingStats?: RatingStats;
  activeAuctionsCount: number;
  completedAuctionsCount: number;
}

export interface FullUser {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  authProvider: AuthProvider;
  phoneNumber: string;
  dateOfBirth: string;
  address: Address;
  isEmailVerified: boolean;
  isBanned: boolean;
  ratingStats?: RatingStats | null;
  deletedAt?: string | null;
  createdAt: string;
  updatedAt?: string;
}

// ----------------------------------------------------
// Inputs & Mutations
// ----------------------------------------------------

export interface AddressInput {
  city: string;
  street: string;
}

export interface UpdateUserInput {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  address?: AddressInput;
}

// ----------------------------------------------------
// User Auctions
// ----------------------------------------------------

export interface UserAuctionsFilterInput {
  status?: AuctionStatus;
}

export interface UserAuctionsPaginationInput {
  page?: number;
  limit?: number;
}

export interface UserAuctionsPage {
  items: Auction[];
  total: number;
  totalPages: number;
  hasNextPage: boolean;
}

// ----------------------------------------------------
// Tab Types
// ----------------------------------------------------

export type ProfileTabType = 'personal' | 'security' | 'reputation';
export type PublicProfileTabType = 'active' | 'completed' | 'reviews';
