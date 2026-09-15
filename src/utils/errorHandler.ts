import axios from 'axios';
import i18n from 'i18next';

export interface AppErrorDetails {
  message: string;
  code: string;
  statusCode?: number;
  rawError?: unknown;
}

/**
 * Extracts clear, unambiguous error details from any source:
 * - GraphQL errors (NestJS GraphQL exception filters & ValidationPipe)
 * - REST errors / AxiosError
 * - HTTP Status codes (400, 401, 403, 404, 409, 422, 429, 500, 503)
 * - Network / Connection issues (Offline, timeout, connection refused)
 */
export function parseAppError(error: unknown): AppErrorDetails {
  if (!error) {
    return { message: '', code: 'UNKNOWN_ERROR' };
  }

  // 1. Axios Error Handling (GraphQL over HTTP / REST)
  if (axios.isAxiosError(error)) {
    // Network / Connection Error (e.g. server offline, DNS failure, CORS blocked)
    if (error.code === 'ERR_NETWORK' || !error.response) {
      return {
        message: 'NETWORK_ERROR',
        code: 'NETWORK_ERROR',
        rawError: error,
      };
    }

    const status = error.response.status;
    const responseData = error.response.data as {
      errors?: Array<{
        message?: string;
        extensions?: {
          code?: string;
          status?: number;
          originalError?: {
            message?: string | string[];
            error?: string;
            statusCode?: number;
          };
        };
      }>;
      message?: string | string[];
      error?: string;
      statusCode?: number;
    };

    // Check for GraphQL errors in response body
    const graphqlErrors = responseData?.errors;
    if (Array.isArray(graphqlErrors) && graphqlErrors.length > 0) {
      const primaryError = graphqlErrors[0];
      const origMsg = primaryError?.extensions?.originalError?.message;
      const extensionsCode = primaryError?.extensions?.code;

      // A. Array of validation errors (from NestJS ValidationPipe)
      if (Array.isArray(origMsg) && origMsg.length > 0) {
        return {
          message: origMsg.join('. '),
          code: extensionsCode || 'VALIDATION_ERROR',
          statusCode: status,
          rawError: error,
        };
      }

      // B. Single message inside originalError
      if (typeof origMsg === 'string' && origMsg.trim().length > 0) {
        return {
          message: origMsg,
          code: extensionsCode || origMsg,
          statusCode: status,
          rawError: error,
        };
      }

      // C. Direct GraphQL error message
      if (typeof primaryError.message === 'string' && primaryError.message !== 'Bad Request Exception') {
        return {
          message: primaryError.message,
          code: extensionsCode || primaryError.message,
          statusCode: status,
          rawError: error,
        };
      }

      if (extensionsCode) {
        return {
          message: extensionsCode,
          code: extensionsCode,
          statusCode: status,
          rawError: error,
        };
      }
    }

    // Check for standard REST error body (e.g. from /payments)
    const restMessage = responseData?.message;
    if (Array.isArray(restMessage)) {
      return {
        message: restMessage.join('. '),
        code: 'VALIDATION_ERROR',
        statusCode: status,
        rawError: error,
      };
    }
    if (typeof restMessage === 'string' && restMessage.trim().length > 0) {
      return {
        message: restMessage,
        code: responseData?.error || 'API_ERROR',
        statusCode: status,
        rawError: error,
      };
    }

    // Fallback based on HTTP Status code
    switch (status) {
      case 400:
        return { message: 'BAD_REQUEST', code: 'BAD_REQUEST', statusCode: 400, rawError: error };
      case 401:
        return { message: 'UNAUTHORIZED', code: 'UNAUTHORIZED', statusCode: 401, rawError: error };
      case 403:
        return { message: 'FORBIDDEN', code: 'FORBIDDEN', statusCode: 403, rawError: error };
      case 404:
        return { message: 'NOT_FOUND', code: 'NOT_FOUND', statusCode: 404, rawError: error };
      case 409:
        return { message: 'CONFLICT', code: 'CONFLICT', statusCode: 409, rawError: error };
      case 429:
        return { message: 'RATE_LIMIT_EXCEEDED', code: 'RATE_LIMIT_EXCEEDED', statusCode: 429, rawError: error };
      case 500:
        return { message: 'INTERNAL_SERVER_ERROR', code: 'INTERNAL_SERVER_ERROR', statusCode: 500, rawError: error };
      case 502:
      case 503:
        return { message: 'SERVICE_UNAVAILABLE', code: 'SERVICE_UNAVAILABLE', statusCode: status, rawError: error };
      default:
        return { message: error.message || 'API_ERROR', code: 'API_ERROR', statusCode: status, rawError: error };
    }
  }

  // 2. Standard JavaScript Error
  if (error instanceof Error) {
    return {
      message: error.message,
      code: error.message,
      rawError: error,
    };
  }

  // 3. String error
  if (typeof error === 'string') {
    return {
      message: error,
      code: error,
      rawError: error,
    };
  }

  return {
    message: 'UNKNOWN_ERROR',
    code: 'UNKNOWN_ERROR',
    rawError: error,
  };
}

/**
 * Resolves standard server error phrases to their canonical translation keys.
 * This guarantees multi-lingual support even when NestJS returns English strings.
 */
export function resolveCanonicalErrorCode(raw: string): string | null {
  if (!raw || typeof raw !== 'string') return null;
  const lower = raw.toLowerCase();

  // Bids Module
  if (lower.includes('already the highest bidder') || lower.includes('already_highest_bidder')) {
    return 'ALREADY_HIGHEST_BIDDER';
  }
  if (lower.includes('cannot place a bid on your own') || lower.includes('cannot bid on your own') || lower.includes('cannot_bid_own_auction')) {
    return 'CANNOT_BID_OWN_AUCTION';
  }
  if (lower.includes('not currently active') || lower.includes('auction_not_active')) {
    return 'AUCTION_NOT_ACTIVE';
  }
  if (lower.includes('insufficient') || lower.includes('not enough balance') || lower.includes('insufficient_funds')) {
    return 'INSUFFICIENT_FUNDS';
  }
  if (lower.includes('high bidding volume') || lower.includes('high_bid_volume')) {
    return 'HIGH_BID_VOLUME';
  }
  if (lower.includes('must be greater than') || lower.includes('must be at least') || lower.includes('below the minimum') || lower.includes('bid too low') || lower.includes('bid_too_low')) {
    return 'BID_TOO_LOW';
  }
  if (lower.includes('already have an active auto-bid') || lower.includes('auto_bid_exists')) {
    return 'AUTO_BID_EXISTS';
  }
  if (lower.includes('cannot set an auto-bid') || lower.includes('auto-bid cannot') || lower.includes('cannot_auto_bid_own')) {
    return 'CANNOT_AUTO_BID_OWN';
  }
  if (lower.includes('network error') || lower.includes('failed to fetch') || lower.includes('offline') || lower.includes('network_error')) {
    return 'NETWORK_ERROR';
  }

  // Auctions Module
  if (lower.includes('auction not found') || lower.includes('auction_not_found')) {
    return 'AUCTION_NOT_FOUND';
  }
  if (lower.includes('not pending') || lower.includes('cannot be edited') || lower.includes('auction_not_pending')) {
    return 'AUCTION_NOT_PENDING';
  }
  if (lower.includes('cannot be cancelled') || lower.includes('auction_invalid_state')) {
    return 'AUCTION_INVALID_STATE';
  }
  if (lower.includes('forbidden') || lower.includes('auction_forbidden')) {
    return 'AUCTION_FORBIDDEN';
  }

  // Wallet & Payments
  if (
    lower.includes('payment creation failed') ||
    lower.includes('payment_creation_failed') ||
    lower.includes('failed to create payment') ||
    lower.includes('failed to create gateway payment') ||
    lower.includes('payment intention') ||
    lower.includes('paymob')
  ) {
    return 'PAYMENT_CREATION_FAILED';
  }
  if (lower.includes('invalid payment provider') || lower.includes('invalid_provider')) {
    return 'INVALID_PAYMENT_PROVIDER';
  }

  // Auth Module
  if (lower.includes('invalid credentials') || lower.includes('invalid_credentials')) {
    return 'INVALID_CREDENTIALS';
  }
  if (lower.includes('email already exists') || lower.includes('email_already_exists')) {
    return 'EMAIL_ALREADY_EXISTS';
  }
  if (lower.includes('phone') && (lower.includes('already exists') || lower.includes('phone_already_exists'))) {
    return 'PHONE_ALREADY_EXISTS';
  }
  if (lower.includes('invalid') && lower.includes('token')) {
    return 'INVALID_TOKEN';
  }
  if (lower.includes('not verified') || lower.includes('email_not_verified')) {
    return 'EMAIL_NOT_VERIFIED';
  }
  if (lower.includes('deactivated') || lower.includes('account_deactivated')) {
    return 'ACCOUNT_DEACTIVATED';
  }
  if (lower.includes('banned') || lower.includes('account_banned')) {
    return 'ACCOUNT_BANNED';
  }

  return null;
}

/**
 * Formats and localizes any error cleanly.
 * Resolution priority:
 * 1. Semantic canonical mapping -> `[namespace]:errors.[canonicalCode]`
 * 2. `[namespace]:errors.[code]`
 * 3. `[namespace]:errors.[message]`
 * 4. `common:errors.[canonicalCode | code | message]`
 * 5. Return clean human-readable server message directly
 */
export function getLocalizedErrorMessage(
  error: unknown,
  translateFn: (key: string, options?: { defaultValue?: string }) => string,
  namespace = 'auth'
): string | null {
  if (!error) return null;

  const parsed = parseAppError(error);
  if (!parsed.message && !parsed.code) return null;

  // 0. Check semantic canonical mapping from message or code
  const canonicalCode =
    resolveCanonicalErrorCode(parsed.message) || resolveCanonicalErrorCode(parsed.code);

  if (canonicalCode) {
    if (i18n.exists(`${namespace}:errors.${canonicalCode}`)) {
      return translateFn(`errors.${canonicalCode}`);
    }
    if (i18n.exists(`common:errors.${canonicalCode}`)) {
      return i18n.t(`common:errors.${canonicalCode}`);
    }
  }

  // 1. Check namespace by code
  if (parsed.code && i18n.exists(`${namespace}:errors.${parsed.code}`)) {
    return translateFn(`errors.${parsed.code}`);
  }

  // 2. Check namespace by message
  if (parsed.message && i18n.exists(`${namespace}:errors.${parsed.message}`)) {
    return translateFn(`errors.${parsed.message}`);
  }

  // 3. Check common errors by code
  if (parsed.code && i18n.exists(`common:errors.${parsed.code}`)) {
    return i18n.t(`common:errors.${parsed.code}`);
  }

  // 4. Check common errors by message
  if (parsed.message && i18n.exists(`common:errors.${parsed.message}`)) {
    return i18n.t(`common:errors.${parsed.message}`);
  }

  // 5. If message contains common keywords, provide sensible translations
  if (parsed.message === 'NETWORK_ERROR') {
    return i18n.t('common:errors.NETWORK_ERROR');
  }

  // 6. Safe localized fallbacks for Arabic when unmapped server error occurs
  if (i18n.language && i18n.language.startsWith('ar')) {
    if (parsed.statusCode === 500 || parsed.message === 'INTERNAL_SERVER_ERROR') {
      return i18n.t('common:errors.INTERNAL_SERVER_ERROR');
    }
  }

  return parsed.message || parsed.code;
}
