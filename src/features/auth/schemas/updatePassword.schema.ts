import { z } from 'zod';

export const updatePasswordSchema = z
  .object({
    oldPassword: z.string().min(1, 'validation.passwordRequired'),
    password: z
      .string()
      .min(8, 'validation.passwordMin')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9])/,
        'validation.passwordComplexity'
      ),
    confirmPassword: z.string().min(1, 'validation.confirmPasswordRequired'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'validation.passwordsDoNotMatch',
    path: ['confirmPassword'],
  })
  .refine((data) => data.oldPassword !== data.password, {
    message: 'errors.SAME_PASSWORD',
    path: ['password'],
  });

export type UpdatePasswordSchema = z.infer<typeof updatePasswordSchema>;
