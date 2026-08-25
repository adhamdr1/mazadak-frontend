import { z } from 'zod';

export const updatePasswordSchema = z
  .object({
    oldPassword: z.string().min(1, 'validation.passwordRequired'),
    password: z
      .string()
      .min(8, 'validation.passwordMin')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()_\-+={}[\]:;"'<>,./~`|\\])/,
        'validation.passwordComplexity'
      ),
    confirmPassword: z.string().min(1, 'validation.confirmPasswordRequired'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'errors.PASSWORD_MISMATCH',
    path: ['confirmPassword'],
  })
  .refine((data) => data.oldPassword !== data.password, {
    message: 'errors.SAME_PASSWORD',
    path: ['password'],
  });

export type UpdatePasswordSchema = z.infer<typeof updatePasswordSchema>;
