import { executeGraphQL } from '@/services/api/graphqlClient';
import { subscribeToSubscription } from '@/services/websocket/socketClient';
import type {
  PublicProfile,
  FullUser,
  UpdateUserInput,
  UserAuctionsPage,
  UserAuctionsPaginationInput,
  UserAuctionsFilterInput,
} from '../types/users.types';
import type { ReviewAddedPayload } from '@/features/reviews/types/reviews.types';

// ==========================================
// GraphQL Operations (Fragments & Queries)
// ==========================================

const RATING_STATS_FIELDS = `
  ratingStats {
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
`;

const GET_ME_QUERY = `
  query GetMe {
    me {
      _id
      firstName
      lastName
      email
      role
      authProvider
      phoneNumber
      dateOfBirth
      address {
        city
        street
      }
      isEmailVerified
      isBanned
      ${RATING_STATS_FIELDS}
      deletedAt
      createdAt
      updatedAt
    }
  }
`;

const PUBLIC_PROFILE_QUERY = `
  query PublicProfile($userId: ID!) {
    publicProfile(userId: $userId) {
      id
      firstName
      lastName
      city
      memberSince
      ${RATING_STATS_FIELDS}
      activeAuctionsCount
      completedAuctionsCount
    }
  }
`;

const UPDATE_PROFILE_MUTATION = `
  mutation UpdateProfile($input: UpdateUserInput!) {
    updateProfile(input: $input) {
      _id
      firstName
      lastName
      email
      role
      authProvider
      phoneNumber
      dateOfBirth
      address {
        city
        street
      }
      isEmailVerified
      isBanned
      ${RATING_STATS_FIELDS}
      createdAt
      updatedAt
    }
  }
`;

const DELETE_ACCOUNT_MUTATION = `
  mutation DeleteAccount {
    deleteAccount
  }
`;

const USER_AUCTIONS_QUERY = `
  query UserAuctions($userId: ID!, $input: PaginationInput, $filter: AuctionsFilterInput) {
    userAuctions(userId: $userId, input: $input, filter: $filter) {
      total
      totalPages
      hasNextPage
      items {
        _id
        title
        description
        images
        category
        status
        startingPrice
        currentPrice
        minimumBidIncrement
        startTime
        endTime
        isFinalized
        winnerId
        sellerId
        createdAt
      }
    }
  }
`;

const REVIEW_ADDED_TO_USER_SUBSCRIPTION = `
  subscription OnReviewAddedToUser($userId: ID!) {
    reviewAddedToUser(userId: $userId) {
      reviewedUserId
      review {
        _id
        overallRating
        type
        comment
        createdAt
        reviewer {
          id
          firstName
          lastName
        }
      }
      updatedRatingStats {
        averageRating
        totalReviews
        breakdown {
          oneStar
          twoStar
          threeStar
          fourStar
          fiveStar
        }
      }
    }
  }
`;

// ==========================================
// Service Implementation
// ==========================================

export const usersService = {
  /**
   * Fetch current authenticated user's complete profile
   */
  getMe: async (): Promise<FullUser> => {
    const data = await executeGraphQL<{ me: FullUser }>(GET_ME_QUERY);
    return data.me;
  },

  /**
   * Fetch public user profile with verified statistics and ratings
   */
  getPublicProfile: async (userId: string): Promise<PublicProfile> => {
    const data = await executeGraphQL<{ publicProfile: PublicProfile }>(
      PUBLIC_PROFILE_QUERY,
      { userId }
    );
    return data.publicProfile;
  },

  /**
   * Fetch user auctions with pagination and status filter (ACTIVE / ENDED)
   */
  getUserAuctions: async (
    userId: string,
    input?: UserAuctionsPaginationInput,
    filter?: UserAuctionsFilterInput
  ): Promise<UserAuctionsPage> => {
    const data = await executeGraphQL<{ userAuctions: UserAuctionsPage }>(
      USER_AUCTIONS_QUERY,
      {
        userId,
        input: input ?? { page: 1, limit: 10 },
        filter,
      }
    );
    return data.userAuctions;
  },

  /**
   * Update personal profile details
   */
  updateProfile: async (input: UpdateUserInput): Promise<FullUser> => {
    const data = await executeGraphQL<{ updateProfile: FullUser }>(
      UPDATE_PROFILE_MUTATION,
      { input }
    );
    return data.updateProfile;
  },

  /**
   * Soft-delete current user's account
   */
  deleteAccount: async (): Promise<boolean> => {
    const data = await executeGraphQL<{ deleteAccount: boolean }>(
      DELETE_ACCOUNT_MUTATION
    );
    return data.deleteAccount;
  },

  /**
   * Subscribes to real-time reviews added to a specific user via WebSocket
   */
  subscribeToReviewAddedToUser: (
    userId: string,
    handlers: {
      next: (data: { reviewAddedToUser: ReviewAddedPayload }) => void;
      error?: (err: unknown) => void;
      complete?: () => void;
    },
    token?: string | null
  ): (() => void) => {
    return subscribeToSubscription<{ reviewAddedToUser: ReviewAddedPayload }>(
      {
        query: REVIEW_ADDED_TO_USER_SUBSCRIPTION,
        variables: { userId },
      },
      handlers,
      token
    );
  },
};
