import { z } from 'zod';

export const createPlaceBidSchema = (minBid: number) =>
  z.object({
    amount: z
      .number({
        required_error: 'validation.required',
        invalid_type_error: 'validation.invalidNumber',
      })
      .positive('validation.invalidNumber')
      .min(minBid, { message: 'validation.minBid' }),
  });

export const placeBidBaseSchema = z.object({
  amount: z
    .number({
      required_error: 'validation.required',
      invalid_type_error: 'validation.invalidNumber',
    })
    .positive('validation.invalidNumber'),
});

export type PlaceBidFormData = z.infer<typeof placeBidBaseSchema>;
