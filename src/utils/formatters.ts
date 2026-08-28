/**
 * Formats numeric amounts into clean, standard currency numbers
 */
export function formatPrice(value: number | string): string {
  const numeric = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(numeric)) return '0';

  // Format with standard Latin digits and thousands separators (e.g. 5,200,000)
  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 0,
  }).format(numeric);
}

/**
 * Formats ISO date string to localized date & time
 */
export function formatDateTime(
  dateString: string | Date,
  locale = 'ar-EG',
  options?: Intl.DateTimeFormatOptions
): string {
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  if (isNaN(date.getTime())) return '';

  return new Intl.DateTimeFormat(locale === 'ar' ? 'ar-EG' : 'en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    ...options,
  }).format(date);
}
