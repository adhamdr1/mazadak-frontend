import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { reviewsService } from '../services/reviews.service';
import { QUERY_KEYS } from '@/constants/queryKeys.constants';
import type { ReviewAddedPayload } from '../types/reviews.types';

export interface UseReviewSubscriptionOptions {
  userId?: string;
  enabled?: boolean;
  onReviewAdded?: (payload: ReviewAddedPayload) => void;
}

/**
 * Real-time WebSocket subscription hook for reviews added to a user.
 * Built with loop-safe optionsRef and 0ms cache synchronization.
 */
export function useReviewSubscription({
  userId,
  enabled = true,
  onReviewAdded,
}: UseReviewSubscriptionOptions) {
  const queryClient = useQueryClient();
  const optionsRef = useRef({ onReviewAdded });
  optionsRef.current = { onReviewAdded };

  useEffect(() => {
    if (!userId || !enabled) return;

    const unsubscribe = reviewsService.subscribeToReviewAddedToUser(userId, {
      next: (data) => {
        if (!data?.reviewAddedToUser) return;
        const payload = data.reviewAddedToUser;
        const targetUserId = payload.reviewedUserId || userId;

        // 1. Immediately update user rating statistics in cache (0ms sync)
        if (payload.updatedRatingStats) {
          queryClient.setQueryData(
            QUERY_KEYS.REVIEWS.USER_STATS(targetUserId),
            payload.updatedRatingStats
          );
        }

        // 2. Invalidate reviews list for clean, non-duplicated refetch
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.REVIEWS.USER_REVIEWS(targetUserId),
        });

        // 3. Invalidate public profile in users cache
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.USERS.PUBLIC_PROFILE(targetUserId),
        });

        // 4. Trigger optional caller callback
        optionsRef.current.onReviewAdded?.(payload);
      },
      error: (err) => {
        console.warn('ReviewAdded subscription error:', err);
      },
    });

    return () => {
      unsubscribe();
    };
  }, [userId, enabled, queryClient]);
}
