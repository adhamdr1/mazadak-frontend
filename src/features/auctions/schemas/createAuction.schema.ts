import { z } from 'zod';
import type { AuctionCategory } from '../types/auctions.types';

export const AUCTION_CATEGORIES_ENUM: [AuctionCategory, ...AuctionCategory[]] = [
  'ELECTRONICS',
  'FASHION',
  'JEWELRY',
  'WATCHES',
  'ANTIQUES',
  'ART',
  'COLLECTIBLES',
  'BOOKS',
  'FURNITURE',
  'HOME_APPLIANCES',
  'CARS',
  'MOTORCYCLES',
  'REAL_ESTATE',
  'SPORTS',
  'TOYS',
  'OTHER',
];

export const createAuctionSchema = z
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

    startingPrice: z
      .number({
        required_error: 'validation.startingPriceRequired',
        invalid_type_error: 'validation.startingPriceRequired',
      })
      .positive('validation.startingPricePositive'),

    minimumBidIncrement: z
      .number({
        required_error: 'validation.incrementRequired',
        invalid_type_error: 'validation.incrementRequired',
      })
      .positive('validation.incrementPositive'),

    startTime: z
      .string({ required_error: 'validation.startTimeRequired' })
      .min(1, 'validation.startTimeRequired')
      .refine(
        (val) => {
          if (!val) return true;
          // Must start at least 30 minutes in the future from now!
          const startMs = new Date(val).getTime();
          const minAllowedMs = Date.now() + 29 * 60 * 1000;
          return startMs >= minAllowedMs;
        },
        { message: 'validation.startTimeFuture' }
      ),

    endTime: z
      .string({ required_error: 'validation.endTimeRequired' })
      .min(1, 'validation.endTimeRequired')
      .refine(
        (val) => {
          if (!val) return true;
          return new Date(val).getTime() >= Date.now();
        },
        { message: 'validation.endTimePast' }
      ),

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
      // Minimum duration: 1 hour (60 * 60 * 1000 ms) from start time
      return end - start >= 60 * 60 * 1000;
    },
    {
      message: 'validation.minDurationOneHour',
      path: ['endTime'],
    }
  );

export type CreateAuctionSchemaType = z.infer<typeof createAuctionSchema>;

// Separate Step 1 schema to allow step 1 validation before navigating to step 2
export const step1DetailsSchema = z
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

    startingPrice: z
      .number({
        required_error: 'validation.startingPriceRequired',
        invalid_type_error: 'validation.startingPriceRequired',
      })
      .positive('validation.startingPricePositive'),

    minimumBidIncrement: z
      .number({
        required_error: 'validation.incrementRequired',
        invalid_type_error: 'validation.incrementRequired',
      })
      .positive('validation.incrementPositive'),

    startTime: z
      .string({ required_error: 'validation.startTimeRequired' })
      .min(1, 'validation.startTimeRequired')
      .refine(
        (val) => {
          if (!val) return true;
          // Must start at least 30 minutes in the future from now!
          const startMs = new Date(val).getTime();
          const minAllowedMs = Date.now() + 29 * 60 * 1000;
          return startMs >= minAllowedMs;
        },
        { message: 'validation.startTimeFuture' }
      ),

    endTime: z
      .string({ required_error: 'validation.endTimeRequired' })
      .min(1, 'validation.endTimeRequired')
      .refine(
        (val) => {
          if (!val) return true;
          return new Date(val).getTime() >= Date.now();
        },
        { message: 'validation.endTimePast' }
      ),
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
      // Minimum duration: 1 hour (60 * 60 * 1000 ms) from start time
      return end - start >= 60 * 60 * 1000;
    },
    {
      message: 'validation.minDurationOneHour',
      path: ['endTime'],
    }
  );

export type Step1DetailsSchemaType = z.infer<typeof step1DetailsSchema>;
