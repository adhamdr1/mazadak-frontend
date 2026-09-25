import { z } from 'zod';
import type { DisputeReason } from '../types/escrow.types';

export const DISPUTE_REASONS_ENUM: [DisputeReason, ...DisputeReason[]] = [
  'ITEM_NOT_RECEIVED',
  'ITEM_DAMAGED',
  'ITEM_MISMATCH',
  'COUNTERFEIT_ITEM',
  'OTHER',
];

export const openDisputeSchema = z.object({
  reason: z.enum(DISPUTE_REASONS_ENUM, {
    errorMap: () => ({ message: 'validation.reasonRequired' }),
  }),
  description: z
    .string({ required_error: 'validation.descriptionRequired' })
    .trim()
    .min(10, 'validation.descriptionMin')
    .max(1000, 'validation.descriptionMax'),
  evidenceUrls: z
    .array(z.string().url('validation.invalidEvidenceUrl'))
    .max(5, 'validation.maxEvidence')
    .default([]),
});

export type OpenDisputeFormData = z.infer<typeof openDisputeSchema>;
