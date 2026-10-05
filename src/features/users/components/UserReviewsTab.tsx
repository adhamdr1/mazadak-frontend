import React from 'react';
import { UserReviewsSection } from '@/features/reviews';
import type { RatingStats } from '../types/users.types';

export interface UserReviewsTabProps {
  userId: string;
  page: number;
  onPageChange: (newPage: number) => void;
  ratingStats?: RatingStats;
  currentUserId?: string;
  className?: string;
}

export const UserReviewsTab: React.FC<UserReviewsTabProps> = ({
  userId,
  page,
  onPageChange,
  ratingStats,
  currentUserId,
  className = '',
}) => {
  return (
    <UserReviewsSection
      userId={userId}
      page={page}
      onPageChange={onPageChange}
      ratingStats={ratingStats}
      currentUserId={currentUserId}
      paginationMode="url"
      className={className}
    />
  );
};
