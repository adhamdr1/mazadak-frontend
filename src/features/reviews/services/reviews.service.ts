/**
 * Reviews Service
 * GraphQL API calls for Reviews Module connected directly to NestJS GraphQL Backend
 */

import { executeGraphQL } from '@/services/api/graphqlClient';
import type {
  Review,
  ReviewsPage,
  UserRatingStats,
  PaginationInput,
  ReviewsFilterInput,
  ReviewsSortInput,
  CanReviewAuctionResponse,
  CreateReviewInput,
} from '../types/reviews.types';

// ----------------------------------------------------
// GraphQL Fragments & Operations
// ----------------------------------------------------

const REVIEW_FIELDS_FRAGMENT = `
  fragment ReviewFields on Review {
    _id
    auctionId
    reviewerId
    reviewedUserId
    type
    status
    overallRating
    criteria {
      itemAccuracy
      communication
      packaging
      smoothExperience
    }
    comment
    reply
    repliedAt
    publishedAt
    createdAt
    reviewer {
      id
      firstName
      lastName
      city
      ratingStats {
        averageRating
        totalReviews
      }
    }
    auction {
      _id
      title
      images
      currentPrice
    }
  }
`;

const USER_REVIEWS_QUERY = `
  ${REVIEW_FIELDS_FRAGMENT}
  query UserReviews(
    $userId: ID!
    $input: PaginationInput
    $filter: ReviewsFilterInput
    $sort: ReviewsSortInput
  ) {
    userReviews(userId: $userId, input: $input, filter: $filter, sort: $sort) {
      total
      totalPages
      hasNextPage
      items {
        ...ReviewFields
      }
    }
  }
`;

const USER_RATING_STATS_QUERY = `
  query UserRatingStats($userId: ID!) {
    userRatingStats(userId: $userId) {
      averageRating
      totalReviews
      asSellerAverageRating
      asSellerTotalReviews
      asBuyerAverageRating
      asBuyerTotalReviews
      breakdown {
        oneStar
        twoStar
        threeStar
        fourStar
        fiveStar
      }
    }
  }
`;

const GET_REVIEW_QUERY = `
  ${REVIEW_FIELDS_FRAGMENT}
  query GetReview($id: ID!) {
    review(id: $id) {
      ...ReviewFields
      reviewedUser {
        id
        firstName
        lastName
        city
      }
    }
  }
`;

const CAN_REVIEW_AUCTION_QUERY = `
  query CanReviewAuction($auctionId: ID!) {
    canReviewAuction(auctionId: $auctionId) {
      canReview
      reason
    }
  }
`;

const CREATE_REVIEW_MUTATION = `
  ${REVIEW_FIELDS_FRAGMENT}
  mutation CreateReview($input: CreateReviewInput!) {
    createReview(input: $input) {
      ...ReviewFields
    }
  }
`;

// ----------------------------------------------------
// Reviews Service Implementation (Core & Mutations)
// ----------------------------------------------------

export const reviewsService = {
  /**
   * Fetch public published reviews for a given user with pagination, filter, and sort
   */
  async getUserReviews(
    userId: string,
    input?: PaginationInput,
    filter?: ReviewsFilterInput,
    sort?: ReviewsSortInput
  ): Promise<ReviewsPage> {
    const data = await executeGraphQL<{ userReviews: ReviewsPage }>(
      USER_REVIEWS_QUERY,
      {
        userId,
        input: input ?? { page: 1, limit: 10 },
        filter,
        sort,
      }
    );
    return data.userReviews;
  },

  /**
   * Fetch comprehensive rating statistics and 5-star breakdown for a user
   */
  async getUserRatingStats(userId: string): Promise<UserRatingStats> {
    const data = await executeGraphQL<{ userRatingStats: UserRatingStats }>(
      USER_RATING_STATS_QUERY,
      { userId }
    );
    return data.userRatingStats;
  },

  /**
   * Fetch a single review by its unique ID
   */
  async getReviewById(id: string): Promise<Review> {
    const data = await executeGraphQL<{ review: Review }>(
      GET_REVIEW_QUERY,
      { id }
    );
    return data.review;
  },

  /**
   * Check if current authenticated user is eligible to review an auction
   */
  async canReviewAuction(auctionId: string): Promise<CanReviewAuctionResponse> {
    const data = await executeGraphQL<{ canReviewAuction: CanReviewAuctionResponse }>(
      CAN_REVIEW_AUCTION_QUERY,
      { auctionId }
    );
    return data.canReviewAuction;
  },

  /**
   * Create a new review for a completed auction transaction
   */
  async createReview(input: CreateReviewInput): Promise<Review> {
    const data = await executeGraphQL<{ createReview: Review }>(
      CREATE_REVIEW_MUTATION,
      { input }
    );
    return data.createReview;
  },
};
