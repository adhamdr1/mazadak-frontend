import type {
  RatingBreakdown,
  RatingStats as UserRatingStats,
  PublicProfile,
} from '@/features/users/types/users.types';

export type { RatingBreakdown, UserRatingStats, PublicProfile };

export type ReviewType = 'BUYER_TO_SELLER' | 'SELLER_TO_BUYER';

export type ReviewStatus = 'PENDING' | 'PUBLISHED' | 'HIDDEN';

export type ReviewsSortField = 'CREATED_AT' | 'RATING';

export type SortOrder = 'ASC' | 'DESC';

export interface ReviewCriteria {
  itemAccuracy?: number;
  communication?: number;
  packaging?: number;
  smoothExperience?: number;
}

export interface ReviewAuction {
  _id: string;
  title: string;
  images: string[];
  currentPrice: string;
}

export interface Review {
  _id: string;
  auctionId: string;
  reviewerId: string;
  reviewedUserId: string;
  type: ReviewType;
  status: ReviewStatus;
  overallRating: number;
  criteria?: ReviewCriteria;
  comment?: string;
  reply?: string;
  repliedAt?: string;
  publishedAt?: string;
  createdAt: string;
  updatedAt?: string;
  reviewer?: PublicProfile;
  reviewedUser?: PublicProfile;
  auction?: ReviewAuction;
}

export interface ReviewsPage {
  items: Review[];
  total: number;
  totalPages: number;
  hasNextPage: boolean;
}

export interface CanReviewAuctionResponse {
  canReview: boolean;
  reason?: string;
}

export interface ReviewAddedPayload {
  reviewedUserId: string;
  review: Review;
  updatedRatingStats: UserRatingStats;
}

export interface PaginationInput {
  page?: number;
  limit?: number;
}

export interface ReviewsFilterInput {
  type?: ReviewType;
  minRating?: number;
}

export interface ReviewsSortInput {
  field?: ReviewsSortField;
  order?: SortOrder;
}

export interface CreateReviewCriteriaInput {
  itemAccuracy?: number;
  communication?: number;
  packaging?: number;
  smoothExperience?: number;
}

export interface CreateReviewInput {
  auctionId: string;
  overallRating: number;
  criteria?: CreateReviewCriteriaInput;
  comment?: string;
}

export interface ReplyReviewInput {
  reviewId: string;
  reply: string;
}
