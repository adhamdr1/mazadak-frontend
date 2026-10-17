import { z } from 'zod';

export const adminResolveDisputeSchema = z.object({
  decision: z.enum(['REFUND_BUYER', 'PAY_SELLER'], {
    required_error: 'disputes.resolveModal.validation.decisionRequired',
  }),
  adminNotes: z
    .string()
    .trim()
    .max(500, 'disputes.resolveModal.validation.notesTooLong')
    .optional()
    .or(z.literal('')),
});

export type AdminResolveDisputeFormData = z.infer<typeof adminResolveDisputeSchema>;
