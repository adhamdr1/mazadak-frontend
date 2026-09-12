/**
 * Auto-Bid Zod Validation Schema
 * Strictly typed validation with localized error messages
 */

import { z } from 'zod';

export const createAutoBidSchema = (minAllowedCeiling: number) =>
  z.object({
    auctionId: z.string().min(1, 'bids:validation.required'),
    maxAmount: z
      .number({
        required_error: 'bids:validation.maxBidRequired',
        invalid_type_error: 'bids:validation.invalidNumber',
      })
      .positive('bids:validation.invalidNumber')
      .min(minAllowedCeiling, 'bids:validation.maxBidTooLow'),
  });

export type AutoBidFormData = {
  auctionId: string;
  maxAmount: number;
};
