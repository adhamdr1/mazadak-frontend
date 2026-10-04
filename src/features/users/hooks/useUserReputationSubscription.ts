import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/constants/queryKeys.constants';
import { usersService } from '../services/users.service';

export interface UseUserReputationSubscriptionOptions {
  userId?: string;
  enabled?: boolean;
}

/**
 * Real-time WebSocket hook that listens for new reviews added to a specific user
 * and immediately invalidates public profile and review queries (0ms sync).
 */
export function useUserReputationSubscription({
  userId,
  enabled = true,
}: UseUserReputationSubscriptionOptions) {
  const queryClient = useQueryClient();
  const enabledRef = useRef(enabled);
  enabledRef.current = enabled;

  useEffect(() => {
    if (!userId || !enabledRef.current) {
      return;
    }

    const unsubscribe = usersService.subscribeToReviewAddedToUser(userId, {
      next: (data) => {
        if (data?.reviewAddedToUser) {
          const reviewedId = data.reviewAddedToUser.reviewedUserId || userId;

          // Invalidate public profile stats & cache
          queryClient.invalidateQueries({
            queryKey: QUERY_KEYS.USERS.PUBLIC_PROFILE(reviewedId),
          });

          // Invalidate reviews list and stats
          queryClient.invalidateQueries({
            queryKey: QUERY_KEYS.REVIEWS.USER_REVIEWS(reviewedId),
          });
          queryClient.invalidateQueries({
            queryKey: QUERY_KEYS.REVIEWS.USER_STATS(reviewedId),
          });
        }
      },
      error: (err) => {
        console.warn('[useUserReputationSubscription] Subscription warning:', err);
      },
    });

    return () => {
      unsubscribe();
    };
  }, [userId, queryClient]);
}
