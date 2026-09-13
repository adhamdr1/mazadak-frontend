/**
 * Converts Western digits (0-9) to Eastern Arabic numerals (٠-٩) if locale is Arabic
 */
export function toLocalizedDigits(value: number | string, isRTL = false): string {
  const str = String(value);
  if (!isRTL) return str;
  const arabicDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  return str.replace(/[0-9]/g, (d) => arabicDigits[parseInt(d, 10)]);
}

/**
 * Normalizes Eastern Arabic numerals (٠-٩) and Persian numerals back to standard ASCII digits (0-9)
 */
export function normalizeArabicDigits(str: string): string {
  const arabicEasternDigits: Record<string, string> = {
    '٠': '0',
    '١': '1',
    '٢': '2',
    '٣': '3',
    '٤': '4',
    '٥': '5',
    '٦': '6',
    '٧': '7',
    '٨': '8',
    '٩': '9',
  };
  return str.replace(/[٠-٩]/g, (w) => arabicEasternDigits[w] || w);
}

/**
 * Formats numeric amounts into clean currency numbers with localization support
 */
export function formatPrice(value: number | string, isRTL = false): string {
  const numeric = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(numeric)) return isRTL ? '٠' : '0';

  const hasFractions = numeric % 1 !== 0;
  const formatted = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: hasFractions ? 2 : 0,
    maximumFractionDigits: hasFractions ? 2 : 0,
  }).format(numeric);

  return isRTL ? toLocalizedDigits(formatted, true) : formatted;
}

/**
 * Formats ISO date string to localized relative time (e.g., "5 minutes ago" or "منذ ٥ دقائق")
 */
export function formatRelativeTime(
  dateString: string | Date,
  isRTL = false
): string {
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  if (isNaN(date.getTime())) return '';

  const now = Date.now();
  const diffInSeconds = Math.round((date.getTime() - now) / 1000);
  const absSeconds = Math.abs(diffInSeconds);

  if (absSeconds < 45) {
    return isRTL ? 'الآن' : 'Just now';
  }

  const rtf = new Intl.RelativeTimeFormat(isRTL ? 'ar-EG' : 'en-US', {
    numeric: 'auto',
  });

  let formatted = '';
  if (absSeconds < 3600) {
    const minutes = Math.round(diffInSeconds / 60);
    formatted = rtf.format(minutes, 'minute');
  } else if (absSeconds < 86400) {
    const hours = Math.round(diffInSeconds / 3600);
    formatted = rtf.format(hours, 'hour');
  } else if (absSeconds < 2592000) {
    const days = Math.round(diffInSeconds / 86400);
    formatted = rtf.format(days, 'day');
  } else {
    const months = Math.round(diffInSeconds / 2592000);
    formatted = rtf.format(months, 'month');
  }

  return isRTL ? toLocalizedDigits(formatted, true) : formatted;
}

/**
 * Formats ISO date string to localized date & time with numeral conversion
 */
export function formatDateTime(
  dateString: string | Date,
  isRTL = false,
  options?: Intl.DateTimeFormatOptions
): string {
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  if (isNaN(date.getTime())) return '';

  const formatted = new Intl.DateTimeFormat(isRTL ? 'ar-EG' : 'en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    ...options,
  }).format(date);

  return isRTL ? toLocalizedDigits(formatted, true) : formatted;
}

/**
 * Formats ISO date string into concise numeric date and exact time with seconds
 * Example (EN): "12/09/2026, 05:35:02 PM"
 * Example (AR): "١٢/٠٩/٢٠٢٦، ٠٥:٣٥:٠٢ م"
 */
export function formatBidTimestamp(
  dateString: string | Date,
  isRTL = false
): string {
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  if (isNaN(date.getTime())) return '';

  const formatted = new Intl.DateTimeFormat(isRTL ? 'ar-EG' : 'en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  }).format(date);

  return isRTL ? toLocalizedDigits(formatted, true) : formatted;
}


