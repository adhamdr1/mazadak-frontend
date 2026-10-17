import { z } from 'zod';

export const adminCompleteWithdrawalSchema = z.object({
  adminReference: z
    .string()
    .trim()
    .min(3, 'validation.referenceMin')
    .max(100, 'validation.referenceMax'),
  receiptUrl: z
    .string()
    .trim()
    .min(1, 'validation.receiptRequired')
    .url('validation.receiptInvalidUrl'),
});

export type AdminCompleteWithdrawalFormData = z.infer<typeof adminCompleteWithdrawalSchema>;
