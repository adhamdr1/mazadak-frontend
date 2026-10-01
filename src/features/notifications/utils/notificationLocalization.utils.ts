import { formatPrice } from '@/utils/formatters';
import type { InAppNotification, InAppNotificationType } from '../types/notifications.types';

/**
 * Strips all Unicode emoji characters, variation selectors, and decorative symbols
 */
export function stripEmojis(str: string): string {
  if (!str) return '';
  return str
    .replace(/[\p{Extended_Pictographic}\uFE0E\uFE0F\u200D]/gu, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

/**
 * Wraps dynamic content (names, titles) with Unicode First Strong Isolate markers (\u2068 and \u2069)
 * to prevent bidirectional text reordering glitches when mixed with surrounding text.
 */
export function isolateBiDi(text: string): string {
  if (!text) return '';
  return `\u2068${text.trim()}\u2069`;
}

/**
 * Extracts a numeric amount from backend notification text (e.g., "1000 EGP" or "1000.00 EGP" or "of 1000")
 */
function extractAmount(text: string): number | null {
  if (!text) return null;

  // Priority 1: Match number immediately followed by currency symbol (e.g., "1000 EGP", "1,500.00 LE", "1000 ج.م")
  const currencyMatch = text.match(/([\d,]+(?:\.\d+)?)\s*(?:EGP|ج\.م|LE)\b/i);
  if (currencyMatch && currencyMatch[1]) {
    const cleaned = currencyMatch[1].replace(/,/g, '');
    const parsed = parseFloat(cleaned);
    if (!isNaN(parsed)) return parsed;
  }

  // Priority 2: Match number preceded by prepositions (e.g., "of 1000", "for 1000", "at 1000", "بقيمة 1000", "بمبلغ 1000")
  const prepMatch = text.match(/(?:of|for|at|amount|بقيمة|بمبلغ)\s+([\d,]+(?:\.\d+)?)\b/i);
  if (prepMatch && prepMatch[1]) {
    const cleaned = prepMatch[1].replace(/,/g, '');
    const parsed = parseFloat(cleaned);
    if (!isNaN(parsed)) return parsed;
  }

  return null;
}

/**
 * Extracts buyer name and amount from "sold for/to [Name] for [Amount] EGP"
 */
function extractSoldDetails(text: string): { buyerName?: string; amount?: number } {
  if (!text) return {};

  // Pattern 1: Matches "sold (for|to) <buyerName> (for|at) <amount> (EGP)?"
  const patternWithBuyer = /sold\s+(?:for|to)\s+(.+?)\s+(?:for|at)\s+([\d,]+(?:\.\d+)?)\s*(?:EGP|ج\.م|LE)?/i;
  const matchWithBuyer = text.match(patternWithBuyer);
  if (matchWithBuyer) {
    const rawName = matchWithBuyer[1]?.trim();
    const rawAmount = parseFloat(matchWithBuyer[2].replace(/,/g, ''));
    return {
      buyerName: rawName ? isolateBiDi(rawName) : undefined,
      amount: isNaN(rawAmount) ? undefined : rawAmount,
    };
  }

  // Pattern 2: Sold amount only without name
  const amount = extractAmount(text);
  return { amount: amount ?? undefined };
}

/**
 * Resolves fully localized title and body for any notification with BiDi and number formatting
 */
export function getLocalizedNotification(
  notification: InAppNotification,
  isRTL: boolean,
  t: (key: string, options?: Record<string, unknown>) => string
): { title: string; body: string } {
  const { type, body: rawBody, title: rawTitle } = notification;
  const currencySuffix = isRTL ? 'ج.م' : 'EGP';

  // 1. Resolve localized Title
  const translatedTitle = t(`types.${type}.title`);
  const title =
    translatedTitle && !translatedTitle.startsWith('types.')
      ? translatedTitle
      : stripEmojis(rawTitle || '');

  // 2. Resolve localized Body based on notification type and extracted dynamic parameters
  let body = '';

  switch (type) {
    case 'NEW_BID': {
      const amount = extractAmount(rawBody);
      if (amount !== null) {
        const formatted = `${formatPrice(amount, isRTL)} ${currencySuffix}`;
        body = t('types.NEW_BID.bodyWithAmount', { amount: formatted });
      } else {
        body = t('types.NEW_BID.body');
      }
      break;
    }

    case 'AUCTION_ENDED_SELLER': {
      const { buyerName, amount } = extractSoldDetails(rawBody);
      if (buyerName && amount !== undefined) {
        const formatted = `${formatPrice(amount, isRTL)} ${currencySuffix}`;
        body = t('types.AUCTION_ENDED_SELLER.bodyWithDetails', {
          buyerName,
          amount: formatted,
        });
      } else if (amount !== undefined) {
        const formatted = `${formatPrice(amount, isRTL)} ${currencySuffix}`;
        body = t('types.AUCTION_ENDED_SELLER.bodyWithAmount', {
          amount: formatted,
        });
      } else {
        body = t('types.AUCTION_ENDED_SELLER.body');
      }
      break;
    }

    case 'AUCTION_WON': {
      const amount = extractAmount(rawBody);
      if (amount !== null) {
        const formatted = `${formatPrice(amount, isRTL)} ${currencySuffix}`;
        body = t('types.AUCTION_WON.bodyWithAmount', { amount: formatted });
      } else {
        body = t('types.AUCTION_WON.body');
      }
      break;
    }

    case 'DEPOSIT_SUCCESSFUL': {
      const amount = extractAmount(rawBody);
      if (amount !== null) {
        const formatted = `${formatPrice(amount, isRTL)} ${currencySuffix}`;
        body = t('types.DEPOSIT_SUCCESSFUL.bodyWithAmount', { amount: formatted });
      } else {
        body = t('types.DEPOSIT_SUCCESSFUL.body');
      }
      break;
    }

    case 'WITHDRAWAL_COMPLETED': {
      const amount = extractAmount(rawBody);
      if (amount !== null) {
        const formatted = `${formatPrice(amount, isRTL)} ${currencySuffix}`;
        body = t('types.WITHDRAWAL_COMPLETED.bodyWithAmount', { amount: formatted });
      } else {
        body = t('types.WITHDRAWAL_COMPLETED.body');
      }
      break;
    }

    case 'WITHDRAWAL_REQUESTED': {
      const amount = extractAmount(rawBody);
      if (amount !== null) {
        const formatted = `${formatPrice(amount, isRTL)} ${currencySuffix}`;
        body = t('types.WITHDRAWAL_REQUESTED.bodyWithAmount', { amount: formatted });
      } else {
        body = t('types.WITHDRAWAL_REQUESTED.body');
      }
      break;
    }

    case 'AUTO_BID_PLACED': {
      const amount = extractAmount(rawBody);
      if (amount !== null) {
        const formatted = `${formatPrice(amount, isRTL)} ${currencySuffix}`;
        body = t('types.AUTO_BID_PLACED.bodyWithAmount', { amount: formatted });
      } else {
        body = t('types.AUTO_BID_PLACED.body');
      }
      break;
    }

    default: {
      const translatedBody = t(`types.${type}.body`);
      if (translatedBody && !translatedBody.startsWith('types.')) {
        body = translatedBody;
      } else {
        body = stripEmojis(rawBody || '');
      }
      break;
    }
  }

  return {
    title: stripEmojis(title),
    body: stripEmojis(body),
  };
}

/**
 * Gets a clean, localized title for Toast notifications with zero emojis
 */
export function getLocalizedToastTitle(
  type: InAppNotificationType,
  _isRTL: boolean,
  fallbackTitle: string,
  t: (key: string) => string
): string {
  const translated = t(`types.${type}.title`);
  if (translated && !translated.startsWith('types.')) {
    return stripEmojis(translated);
  }
  return stripEmojis(fallbackTitle);
}
