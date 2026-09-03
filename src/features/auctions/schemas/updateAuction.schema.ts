import { z } from 'zod';
import { AUCTION_CATEGORIES_ENUM } from './createAuction.schema';

export const updateAuctionSchema = z
  .object({
    title: z
      .string({ required_error: 'validation.titleRequired' })
      .trim()
      .min(5, 'validation.titleMin')
      .max(100, 'validation.titleMax'),

    category: z.enum(AUCTION_CATEGORIES_ENUM, {
      errorMap: () => ({ message: 'validation.categoryRequired' }),
    }),

    description: z
      .string({ required_error: 'validation.descriptionRequired' })
      .trim()
      .min(20, 'validation.descriptionMin')
      .max(2000, 'validation.descriptionMax'),

    startTime: z
      .string({ required_error: 'validation.startTimeRequired' })
      .min(1, 'validation.startTimeRequired'),

    endTime: z
      .string({ required_error: 'validation.endTimeRequired' })
      .min(1, 'validation.endTimeRequired'),

    images: z
      .array(z.string().url('validation.imageUrlInvalid'))
      .min(1, 'validation.imagesRequired')
      .max(10, 'validation.imagesMax'),
  })
  .refine(
    (data) => {
      if (!data.startTime || !data.endTime) return true;
      const start = new Date(data.startTime).getTime();
      const end = new Date(data.endTime).getTime();
      return end > start;
    },
    {
      message: 'validation.endTimeAfterStart',
      path: ['endTime'],
    }
  )
  .refine(
    (data) => {
      if (!data.startTime || !data.endTime) return true;
      const start = new Date(data.startTime).getTime();
      const end = new Date(data.endTime).getTime();
      // Minimum duration: 1 hour (60 * 60 * 1000 ms)
      return end - start >= 60 * 60 * 1000;
    },
    {
      message: 'validation.minDurationOneHour',
      path: ['endTime'],
    }
  );

export type UpdateAuctionSchemaType = z.infer<typeof updateAuctionSchema>;
