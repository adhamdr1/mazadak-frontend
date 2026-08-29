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
      const parts = dobString.split('-');
      if (parts.length !== 3) return false;
      const [y, m, d] = parts.map((p) => parseInt(p, 10));
      if (isNaN(y) || isNaN(m) || isNaN(d)) return false;
      if (m < 1 || m > 12 || d < 1 || d > 31 || y < 1900) return false;
      const date = new Date(y, m - 1, d);
      if (isNaN(date.getTime())) return false;
      const today = new Date();
      // Disallow future dates
      if (date.getTime() > today.getTime()) return false;
      return true;
    }, 'validation.dobInvalid')
    .refine((dobString) => {
      const parts = dobString.split('-');
      const [y, m, d] = parts.map((p) => parseInt(p, 10));
      const date = new Date(y, m - 1, d);
      const today = new Date();
      let age = today.getFullYear() - date.getFullYear();
      const monthDiff = today.getMonth() - date.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < date.getDate())) {
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
