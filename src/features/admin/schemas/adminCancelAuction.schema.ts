import { z } from 'zod';

export const adminCancelAuctionSchema = z.object({
  reason: z
    .string({
      required_error: 'validation.reasonRequired',
    })
    .trim()
    .min(10, 'validation.reasonMinLength'),
});

export type AdminCancelAuctionFormData = z.infer<typeof adminCancelAuctionSchema>;
