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
 * Formats numeric amounts into clean currency numbers with localization support
 */
export function formatPrice(value: number | string, isRTL = false): string {
  const numeric = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(numeric)) return isRTL ? '٠' : '0';

  const formatted = new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 0,
  }).format(numeric);

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
