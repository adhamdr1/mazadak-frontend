import { executeGraphQL } from '@/services/api/graphqlClient';
import type { PublicProfile } from '../types/users.types';

const PUBLIC_PROFILE_QUERY = `
  query PublicProfile($userId: ID!) {
    publicProfile(userId: $userId) {
      id
      firstName
      lastName
      city
      memberSince
      ratingStats {
        averageRating
        totalReviews
      }
      activeAuctionsCount
      completedAuctionsCount
    }
  }
`;

export const usersService = {
  /**
   * Fetch public user profile with real name, city, memberSince, and rating statistics
   */
  getPublicProfile: async (userId: string): Promise<PublicProfile> => {
    const data = await executeGraphQL<{ publicProfile: PublicProfile }>(
      PUBLIC_PROFILE_QUERY,
      { userId }
    );
    return data.publicProfile;
  },
};
