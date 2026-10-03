import { z } from 'zod';
import { normalizeArabicDigits } from '@/utils/formatters';

export const updateProfileSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(2, 'users:validation.firstNameMin')
    .max(50),
  lastName: z
    .string()
    .trim()
    .min(2, 'users:validation.lastNameMin')
    .max(50),
  phoneNumber: z
    .string()
    .transform((val) => normalizeArabicDigits(val || '').trim().replace(/\s+/g, ''))
    .refine((val) => /^(\+20|0)?1[0125]\d{8}$/.test(val), {
      message: 'users:validation.invalidPhone',
    }),
  dateOfBirth: z
    .string()
    .min(1, 'users:validation.dateRequired'),
  address: z.object({
    city: z
      .string()
      .trim()
      .min(2, 'users:validation.cityRequired')
      .max(50),
    street: z
      .string()
      .trim()
      .min(3, 'users:validation.streetRequired')
      .max(100),
  }),
});

export type UpdateProfileFormData = z.infer<typeof updateProfileSchema>;
