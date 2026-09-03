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
