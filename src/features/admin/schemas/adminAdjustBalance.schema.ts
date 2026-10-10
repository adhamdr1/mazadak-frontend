import { z } from 'zod';
import { normalizeArabicDigits } from '@/utils/formatters';

export const adminAdjustBalanceSchema = z.object({
  amount: z.preprocess(
    (val) => {
      if (typeof val === 'string') {
        const normalized = normalizeArabicDigits(val.trim());
        const parsed = parseFloat(normalized);
        return isNaN(parsed) ? val : parsed;
      }
      return val;
    },
    z
      .number({
        required_error: 'validation.amountRequired',
        invalid_type_error: 'validation.amountInvalid',
      })
      .positive('validation.amountPositive')
      .min(1, 'validation.amountMin')
  ),
  type: z.enum(['CREDIT', 'DEBIT'], {
    required_error: 'validation.typeRequired',
  }),
  reason: z
    .string({
      required_error: 'validation.reasonRequired',
    })
    .trim()
    .min(10, 'validation.reasonMinLength'),
});

export type AdminAdjustBalanceFormData = z.infer<typeof adminAdjustBalanceSchema>;
