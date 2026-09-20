import { z } from 'zod';
import { normalizeArabicDigits } from '@/utils/formatters';
import type { PayoutMethod, PayoutDetailsInput } from '../types/wallet.types';

// Helper regexes
const EGYPT_PHONE_REGEX = /^01[0125][0-9]{8}$/;
const EGYPT_IBAN_REGEX = /^EG[0-9]{27}$/i;

// Step 1: Amount Schema Builder
export const createAmountSchema = (availableBalance: number) =>
  z.object({
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
        .min(50, { message: 'validation.withdrawMin' })
        .max(availableBalance > 0 ? availableBalance : 50, {
          message: 'validation.insufficientFunds',
        })
    ),
  });

// Step 2: Method Schema
export const payoutMethodSchema = z.enum([
  'VODAFONE_CASH',
  'ORANGE_CASH',
  'ETISALAT_CASH',
  'WE_PAY',
  'INSTAPAY',
  'BANK_ACCOUNT',
] as const, {
  required_error: 'validation.methodRequired',
});

// Step 3: Details Schemas per method
export const bankDetailsSchema = z
  .object({
    bankName: z
      .string({ required_error: 'validation.bankNameRequired' })
      .trim()
      .min(2, { message: 'validation.bankNameTooShort' }),
    accountHolderName: z
      .string({ required_error: 'validation.holderNameRequired' })
      .trim()
      .min(3, { message: 'validation.holderNameTooShort' }),
    accountNumber: z.string().trim().optional(),
    iban: z.string().trim().optional(),
  })
  .refine(
    (data) => {
      const acc = data.accountNumber ? data.accountNumber.trim() : '';
      const iban = data.iban ? data.iban.trim().replace(/\s/g, '') : '';
      return acc.length >= 6 || (iban.length === 29 && EGYPT_IBAN_REGEX.test(iban));
    },
    {
      message: 'validation.bankAccountOrIbanRequired',
      path: ['accountNumber'],
    }
  );

export const instapayDetailsSchema = z
  .object({
    ipaAddress: z.string().trim().optional(),
    phoneNumber: z.string().trim().optional(),
    accountHolderName: z.string().trim().optional(),
  })
  .refine(
    (data) => {
      const ipa = data.ipaAddress ? data.ipaAddress.trim() : '';
      const phone = data.phoneNumber ? normalizeArabicDigits(data.phoneNumber.trim()) : '';
      return ipa.length >= 3 || EGYPT_PHONE_REGEX.test(phone);
    },
    {
      message: 'validation.instapayAddressOrPhoneRequired',
      path: ['ipaAddress'],
    }
  );

export const walletDetailsSchema = z.object({
  phoneNumber: z
    .string({ required_error: 'validation.phoneRequired' })
    .trim()
    .transform((val) => normalizeArabicDigits(val).replace(/[\s-]/g, ''))
    .refine((val) => EGYPT_PHONE_REGEX.test(val), {
      message: 'validation.invalidEgyptPhone',
    }),
});

/**
 * Sanitizes payout details according to the selected payout method
 * to ensure no stale data from other methods is sent in the mutation payload
 */
export const sanitizePayoutDetails = (
  method: PayoutMethod,
  details: Record<string, unknown>
): PayoutDetailsInput => {
  switch (method) {
    case 'BANK_ACCOUNT':
      return {
        bankName: details.bankName ? String(details.bankName).trim() : undefined,
        accountHolderName: details.accountHolderName ? String(details.accountHolderName).trim() : undefined,
        accountNumber: details.accountNumber ? String(details.accountNumber).trim() : undefined,
        iban: details.iban ? String(details.iban).trim().replace(/\s/g, '') : undefined,
      };

    case 'INSTAPAY':
      return {
        ipaAddress: details.ipaAddress ? String(details.ipaAddress).trim() : undefined,
        phoneNumber: details.phoneNumber
          ? normalizeArabicDigits(String(details.phoneNumber).trim())
          : undefined,
        accountHolderName: details.accountHolderName
          ? String(details.accountHolderName).trim()
          : undefined,
      };

    case 'VODAFONE_CASH':
    case 'ORANGE_CASH':
    case 'ETISALAT_CASH':
    case 'WE_PAY':
      return {
        phoneNumber: details.phoneNumber
          ? normalizeArabicDigits(String(details.phoneNumber).trim()).replace(/[\s-]/g, '')
          : undefined,
      };

    default:
      return {};
  }
};

/**
 * Maps Backend Error Codes to localized translation keys
 */
export const WITHDRAWAL_ERROR_KEYS: Record<string, string> = {
  INVALID_PAYOUT_DETAILS: 'errors.INVALID_PAYOUT_DETAILS',
  WITHDRAWAL_BELOW_MINIMUM: 'errors.WITHDRAWAL_BELOW_MINIMUM',
  WITHDRAWAL_EXCEEDS_MAX_FOR_INSTAPAY: 'errors.WITHDRAWAL_EXCEEDS_MAX',
  WITHDRAWAL_EXCEEDS_MAX_FOR_VODAFONE_CASH: 'errors.WITHDRAWAL_EXCEEDS_MAX',
  WITHDRAWAL_EXCEEDS_MAX_FOR_ORANGE_CASH: 'errors.WITHDRAWAL_EXCEEDS_MAX',
  WITHDRAWAL_EXCEEDS_MAX_FOR_ETISALAT_CASH: 'errors.WITHDRAWAL_EXCEEDS_MAX',
  WITHDRAWAL_EXCEEDS_MAX_FOR_WE_PAY: 'errors.WITHDRAWAL_EXCEEDS_MAX',
  WITHDRAWAL_EXCEEDS_MAX_FOR_BANK_ACCOUNT: 'errors.WITHDRAWAL_EXCEEDS_MAX',
  INSUFFICIENT_FUNDS: 'errors.INSUFFICIENT_FUNDS',
  DAILY_WITHDRAWAL_LIMIT_REACHED: 'errors.DAILY_WITHDRAWAL_LIMIT_REACHED',
  WITHDRAWAL_NOT_FOUND: 'errors.WITHDRAWAL_NOT_FOUND',
  WITHDRAWAL_NOT_CANCELLABLE: 'errors.WITHDRAWAL_NOT_CANCELLABLE',
};
