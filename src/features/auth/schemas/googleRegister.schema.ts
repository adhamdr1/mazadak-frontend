import { z } from 'zod';

/**
 * Google Register Schema — No password required.
 * User name fields are pre-filled from Google JWT but remain editable.
 * Email is disabled (comes from Google, cannot be changed).
 */
export const googleRegisterSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(2, 'validation.firstNameMin')
    .max(50, 'validation.firstNameMax'),
  lastName: z
    .string()
    .trim()
    .min(2, 'validation.lastNameMin')
    .max(50, 'validation.lastNameMax'),
  email: z
    .string()
    .trim()
    .min(1, 'validation.emailRequired')
    .email('validation.emailInvalid'),
  phoneNumber: z
    .string()
    .trim()
    .regex(
      /^(?:\+?20|0)?1[0125]\d{8}$/,
      'validation.phoneInvalid'
    ),
  dateOfBirth: z
    .string()
    .min(1, 'validation.dobRequired')
    .refine((dobString) => {
      const date = new Date(dobString);
      if (isNaN(date.getTime())) return false;
      const today = new Date();
      let age = today.getFullYear() - date.getFullYear();
      const m = today.getMonth() - date.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < date.getDate())) {
        age--;
      }
      return age >= 18;
    }, 'validation.underage'),
  city: z
    .string()
    .trim()
    .min(2, 'validation.cityRequired')
    .max(100),
  street: z
    .string()
    .trim()
    .min(3, 'validation.streetRequired')
    .max(200),
});

export type GoogleRegisterSchema = z.infer<typeof googleRegisterSchema>;
