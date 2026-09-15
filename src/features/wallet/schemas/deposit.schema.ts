import { z } from 'zod';
import { normalizeArabicDigits } from '@/utils/formatters';

export const depositSchema = z.object({
  amount: z.preprocess(
    (val) => {
      if (typeof val === 'string') {
        const cleaned = normalizeArabicDigits(val.trim()).replace(/,/g, '');
        if (cleaned === '') return undefined;
        const num = Number(cleaned);
        return isNaN(num) ? val : num;
      }
      return val;
    },
    z
      .number({
        required_error: 'validation.amountRequired',
        invalid_type_error: 'validation.amountInvalid',
      })
      .min(10, { message: 'validation.depositMin' })
      .max(100000, { message: 'validation.depositMax' })
  ),
});

export type DepositFormData = z.infer<typeof depositSchema>;
