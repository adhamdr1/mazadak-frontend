import { z } from 'zod';

export const adminRejectWithdrawalSchema = z.object({
  rejectionReason: z
    .string()
    .trim()
    .min(10, 'validation.reasonTooShort')
    .max(500, 'validation.reasonTooLong'),
});

export type AdminRejectWithdrawalFormData = z.infer<typeof adminRejectWithdrawalSchema>;
