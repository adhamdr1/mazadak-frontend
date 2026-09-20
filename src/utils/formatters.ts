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

export const EGYPTIAN_BANKS_MAP: Array<{ ar: string; en: string }> = [
  { ar: 'البنك الأهلي المصري', en: 'National Bank of Egypt (NBE)' },
  { ar: 'بنك مصر', en: 'Banque Misr' },
  { ar: 'البنك التجاري الدولي (CIB)', en: 'Commercial International Bank (CIB)' },
  { ar: 'البنك التجاري الدولي', en: 'Commercial International Bank (CIB)' },
  { ar: 'بنك QNB الأهلي', en: 'QNB Alahli' },
  { ar: 'بنك كيو إن بي الأهلي', en: 'QNB Alahli' },
  { ar: 'بنك الإسكندرية', en: 'Bank of Alexandria' },
  { ar: 'بنك القاهرة', en: 'Banque du Caire' },
  { ar: 'مصرف أبوظبي الإسلامي', en: 'Abu Dhabi Islamic Bank (ADIB)' },
  { ar: 'بنك فيصل الإسلامي', en: 'Faisal Islamic Bank' },
  { ar: 'بنك كريدي أجريكول', en: 'Crédit Agricole Egypt' },
  { ar: 'بنك البركة', en: 'Al Baraka Bank' },
  { ar: 'البنك العربي الأفريقي الدولي', en: 'Arab African International Bank (AAIB)' },
  { ar: 'بنك قناة السويس', en: 'Suez Canal Bank' },
  { ar: 'بنك التعمير والإسكان', en: 'Housing and Development Bank' },
  { ar: 'بنك Saib', en: 'Société Arabe Internationale de Banque (saib)' },
  { ar: 'المصرف المتحد', en: 'The United Bank' },
];

/**
 * Localizes Egyptian bank names dynamically based on the active language
 */
export function localizeBankName(bankName?: string | null, isRTL = false): string {
  if (!bankName) return '';
  const trimmed = bankName.trim();
  const match = EGYPTIAN_BANKS_MAP.find(
    (b) =>
      b.ar.toLowerCase() === trimmed.toLowerCase() ||
      b.en.toLowerCase() === trimmed.toLowerCase() ||
      trimmed.toLowerCase().includes(b.ar.toLowerCase()) ||
      trimmed.toLowerCase().includes(b.en.toLowerCase())
  );
  if (match) {
    return isRTL ? match.ar : match.en;
  }
  return trimmed;
}

/**
 * Returns YYYY-MM-DD date string in Africa/Cairo timezone, exactly matching backend logic
 */
export function getCairoDateString(dateInput: string | Date = new Date()): string {
  const d = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  if (isNaN(d.getTime())) return '';
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Africa/Cairo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(d);
}
