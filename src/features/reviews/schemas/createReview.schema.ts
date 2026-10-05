import { z } from 'zod';

/**
 * Zod Schema for Creating a Review
 * Validates overall rating (1-5), optional detailed criteria (1-5 each),
 * and sanitizes optional comment text (max 500 chars, empty string -> undefined).
 */
export const createReviewSchema = z.object({
  auctionId: z.string().min(1, 'reviews:errors.auctionIdRequired'),
  overallRating: z
    .number({
      required_error: 'reviews:modal.ratingRequired',
      invalid_type_error: 'reviews:modal.ratingRequired',
    })
    .int()
    .min(1, 'reviews:modal.ratingMin')
    .max(5, 'reviews:modal.ratingMax'),
  criteria: z
    .object({
      itemAccuracy: z.number().int().min(1).max(5).optional(),
      communication: z.number().int().min(1).max(5).optional(),
      packaging: z.number().int().min(1).max(5).optional(),
      smoothExperience: z.number().int().min(1).max(5).optional(),
    })
    .optional(),
  comment: z
    .string()
    .trim()
    .max(500, 'reviews:modal.commentTooLong')
    .optional()
    .transform((val) => (val && val.length > 0 ? val : undefined)),
});

export type CreateReviewFormData = z.infer<typeof createReviewSchema>;
