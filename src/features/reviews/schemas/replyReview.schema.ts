import { z } from 'zod';

export const replyReviewSchema = z.object({
  reviewId: z.string().min(1, 'reviews:errors.reviewIdRequired'),
  reply: z
    .string()
    .trim()
    .min(2, 'reviews:errors.replyTooShort')
    .max(500, 'reviews:errors.replyTooLong'),
});

export type ReplyReviewFormData = z.infer<typeof replyReviewSchema>;
