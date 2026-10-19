/**
 * Administrative Module Utility Helpers
 * Formats financial metrics, status badges, and data presentation.
 */

import { toLocalizedDigits } from '@/utils/formatters';

export const formatAdminNumber = (
  value: number | string | undefined | null,
  isRTL: boolean = true
): string => {
  if (value === undefined || value === null) return isRTL ? '٠' : '0';
  const num = typeof value === 'string' ? Number(value) : value;
  if (isNaN(num)) return isRTL ? '٠' : '0';
  const formatted = new Intl.NumberFormat('en-US').format(num);
  return toLocalizedDigits(formatted, isRTL);
};

export const formatAdminCurrency = (
  amount: number | string | undefined | null,
  currency?: string,
  isRTL: boolean = true
): string => {
  let displayCurrency: string;
  if (!currency || currency.toUpperCase() === 'EGP' || currency === 'ج.م') {
    displayCurrency = isRTL ? 'ج.م' : 'EGP';
  } else if (currency.toUpperCase() === 'USD' || currency === '$') {
    displayCurrency = isRTL ? 'دولار' : 'USD';
  } else {
    displayCurrency = currency;
  }

  if (amount === undefined || amount === null) return `${isRTL ? '٠' : '0'} ${displayCurrency}`;
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num)) return `${isRTL ? '٠' : '0'} ${displayCurrency}`;

  const hasFractions = num % 1 !== 0;
  const formatted = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: hasFractions ? 2 : 0,
    maximumFractionDigits: hasFractions ? 2 : 0,
  }).format(num);

  const localizedNum = toLocalizedDigits(formatted, isRTL);
  return `${localizedNum} ${displayCurrency}`;
};

export const formatAdminDate = (
  isoString: string | undefined | null,
  locale: string = 'ar',
  isRTL: boolean = true
): string => {
  if (!isoString) return '—';
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return '—';
    const formatted = new Intl.DateTimeFormat(locale === 'ar' ? 'ar-EG' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
    return toLocalizedDigits(formatted, isRTL);
  } catch {
    return '—';
  }
};

const EGYPTIAN_CITIES_MAP: Record<string, { ar: string; en: string }> = {
  cairo: { ar: 'القاهرة', en: 'Cairo' },
  'القاهرة': { ar: 'القاهرة', en: 'Cairo' },
  giza: { ar: 'الجيزة', en: 'Giza' },
  'الجيزة': { ar: 'الجيزة', en: 'Giza' },
  alexandria: { ar: 'الإسكندرية', en: 'Alexandria' },
  'الإسكندرية': { ar: 'الإسكندرية', en: 'Alexandria' },
  mansoura: { ar: 'المنصورة', en: 'Mansoura' },
  'المنصورة': { ar: 'المنصورة', en: 'Mansoura' },
  tanta: { ar: 'طنطا', en: 'Tanta' },
  'طنطا': { ar: 'طنطا', en: 'Tanta' },
  aswan: { ar: 'أسوان', en: 'Aswan' },
  'أسوان': { ar: 'أسوان', en: 'Aswan' },
  luxor: { ar: 'الأقصر', en: 'Luxor' },
  'الأقصر': { ar: 'الأقصر', en: 'Luxor' },
  suez: { ar: 'السويس', en: 'Suez' },
  'السويس': { ar: 'السويس', en: 'Suez' },
  'port said': { ar: 'بورسعيد', en: 'Port Said' },
  'بورسعيد': { ar: 'بورسعيد', en: 'Port Said' },
  ismailia: { ar: 'الإسماعيلية', en: 'Ismailia' },
  'الإسماعيلية': { ar: 'الإسماعيلية', en: 'Ismailia' },
  fayoum: { ar: 'الفيوم', en: 'Fayoum' },
  'الفيوم': { ar: 'الفيوم', en: 'Fayoum' },
  zagazig: { ar: 'الزقازيق', en: 'Zagazig' },
  'الزقازيق': { ar: 'الزقازيق', en: 'Zagazig' },
  damietta: { ar: 'دمياط', en: 'Damietta' },
  'دمياط': { ar: 'دمياط', en: 'Damietta' },
  assiut: { ar: 'أسيوط', en: 'Assiut' },
  'أسيوط': { ar: 'أسيوط', en: 'Assiut' },
  sohag: { ar: 'سوهاج', en: 'Sohag' },
  'سوهاج': { ar: 'سوهاج', en: 'Sohag' },
  qena: { ar: 'قنا', en: 'Qena' },
  'قنا': { ar: 'قنا', en: 'Qena' },
  minya: { ar: 'المنيا', en: 'Minya' },
  'المنيا': { ar: 'المنيا', en: 'Minya' },
  'beni suef': { ar: 'بني سويف', en: 'Beni Suef' },
  'بني سويف': { ar: 'بني سويف', en: 'Beni Suef' },
  hurghada: { ar: 'الغردقة', en: 'Hurghada' },
  'الغردقة': { ar: 'الغردقة', en: 'Hurghada' },
  'sharm el sheikh': { ar: 'شرم الشيخ', en: 'Sharm El Sheikh' },
  'شرم الشيخ': { ar: 'شرم الشيخ', en: 'Sharm El Sheikh' },
};

export const formatAdminCity = (city: string | undefined | null, isRTL: boolean = true): string => {
  if (!city || city.trim() === '') return isRTL ? 'غير محدد' : 'Not specified';
  const clean = city.trim().toLowerCase();
  const match = EGYPTIAN_CITIES_MAP[clean] || EGYPTIAN_CITIES_MAP[city.trim()];
  if (match) {
    return isRTL ? match.ar : match.en;
  }
  return city;
};

export const formatAdminPhone = (phone: string | undefined | null, isRTL: boolean = true): string => {
  if (!phone || phone.trim() === '') return isRTL ? 'غير متوفر' : 'N/A';
  return toLocalizedDigits(phone.trim(), isRTL);
};

export const getTransactionTypeLabel = (type: string, isRTL: boolean = true): string => {
  const map: Record<string, { ar: string; en: string }> = {
    DEPOSIT: { ar: 'إيداع رصيد', en: 'Deposit' },
    WITHDRAW: { ar: 'سحب رصيد', en: 'Withdrawal' },
    WITHDRAWAL: { ar: 'طلب سحب', en: 'Withdrawal' },
    HOLD: { ar: 'حجز مؤقت', en: 'Fund Hold' },
    BID_HOLD: { ar: 'حجز مزايدة', en: 'Bid Hold' },
    RELEASE: { ar: 'فك الحجز المؤقت', en: 'Hold Released' },
    BID_RELEASE: { ar: 'تحرير حجز مزايدة', en: 'Bid Hold Release' },
    CAPTURE: { ar: 'تحصيل نهائي (إتمام صفقة)', en: 'Payment Capture' },
    REFUND: { ar: 'استرداد أموال', en: 'Refund' },
    ESCROW_PAYMENT: { ar: 'دفع ضمان مالي', en: 'Escrow Payment' },
    ESCROW_RELEASE: { ar: 'تحرير ضمان مالي', en: 'Escrow Release' },
    ESCROW_REFUND: { ar: 'استرداد ضمان', en: 'Escrow Refund' },
    AUCTION_FEE: { ar: 'رسوم المنصة', en: 'Platform Fee' },
    ADMIN_CREDIT: { ar: 'تسوية إدارية (إضافة)', en: 'Admin Credit' },
    ADMIN_DEBIT: { ar: 'تسوية إدارية (خصم)', en: 'Admin Debit' },
    ADMIN_ADJUST_CREDIT: { ar: 'تسوية إدارية (إضافة)', en: 'Admin Adjustment (Credit)' },
    ADMIN_ADJUST_DEBIT: { ar: 'تسوية إدارية (خصم)', en: 'Admin Adjustment (Debit)' },
  };

  const match = map[type?.toUpperCase()];
  if (match) return isRTL ? match.ar : match.en;
  return type?.replace(/_/g, ' ') || '—';
};

export type TransactionIconName =
  | 'ArrowDownLeft'
  | 'ArrowUpRight'
  | 'Lock'
  | 'Unlock'
  | 'CheckCircle2'
  | 'RotateCcw'
  | 'Receipt';

export const getTransactionTypeIconConfig = (
  type: string
): { icon: TransactionIconName; bgClass: string } => {
  const normalized = type?.toUpperCase();
  switch (normalized) {
    case 'DEPOSIT':
    case 'ADMIN_CREDIT':
    case 'ADMIN_ADJUST_CREDIT':
      return {
        icon: 'ArrowDownLeft',
        bgClass: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30',
      };
    case 'WITHDRAW':
    case 'WITHDRAWAL':
    case 'ADMIN_DEBIT':
    case 'ADMIN_ADJUST_DEBIT':
      return {
        icon: 'ArrowUpRight',
        bgClass: 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30',
      };
    case 'HOLD':
    case 'BID_HOLD':
      return {
        icon: 'Lock',
        bgClass: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30',
      };
    case 'RELEASE':
    case 'BID_RELEASE':
    case 'ESCROW_RELEASE':
      return {
        icon: 'Unlock',
        bgClass: 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30',
      };
    case 'CAPTURE':
    case 'ESCROW_PAYMENT':
      return {
        icon: 'CheckCircle2',
        bgClass: 'bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/30',
      };
    case 'REFUND':
    case 'ESCROW_REFUND':
      return {
        icon: 'RotateCcw',
        bgClass: 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30',
      };
    case 'AUCTION_FEE':
    default:
      return {
        icon: 'Receipt',
        bgClass: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700',
      };
  }
};

export const getTransactionStatusBadge = (
  status: string | undefined | null,
  isRTL: boolean = true
): { label: string; bgClass: string } => {
  if (!status) {
    return {
      label: '—',
      bgClass: 'bg-slate-500/10 text-slate-500 dark:text-slate-400 border-slate-500/25',
    };
  }
  switch (status.toUpperCase()) {
    case 'SUCCESS':
    case 'COMPLETED':
      return {
        label: isRTL ? 'ناجحة' : 'Success',
        bgClass: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/25',
      };
    case 'PENDING':
      return {
        label: isRTL ? 'معلقة' : 'Pending',
        bgClass: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/25',
      };
    case 'PROCESSING':
      return {
        label: isRTL ? 'قيد التنفيذ' : 'Processing',
        bgClass: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/25',
      };
    case 'FAILED':
    case 'REJECTED':
      return {
        label: isRTL ? 'فاشلة' : 'Failed',
        bgClass: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/25',
      };
    case 'CANCELLED':
      return {
        label: isRTL ? 'ملغاة' : 'Cancelled',
        bgClass: 'bg-slate-500/10 text-slate-500 dark:text-slate-400 border-slate-500/25',
      };
    default:
      return {
        label: status,
        bgClass: 'bg-slate-500/10 text-slate-500 dark:text-slate-400 border-slate-500/25',
      };
  }
};

export type TransactionReferenceIconName =
  | 'Gavel'
  | 'ShieldCheck'
  | 'Building2'
  | 'Scale'
  | 'ArrowRightLeft';

export const getTransactionReferenceConfig = (
  referenceType: string | undefined | null,
  isRTL: boolean = true
): { label: string; bgClass: string; icon: TransactionReferenceIconName } => {
  switch (referenceType?.toUpperCase()) {
    case 'AUCTION':
      return {
        label: isRTL ? 'مزاد' : 'Auction',
        bgClass: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/25',
        icon: 'Gavel',
      };
    case 'ESCROW':
      return {
        label: isRTL ? 'ضمان' : 'Escrow',
        bgClass: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/25',
        icon: 'ShieldCheck',
      };
    case 'WITHDRAWAL':
    case 'WITHDRAW':
      return {
        label: isRTL ? 'سحب' : 'Payout',
        bgClass: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/25',
        icon: 'Building2',
      };
    case 'DISPUTE':
      return {
        label: isRTL ? 'نزاع' : 'Dispute',
        bgClass: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/25',
        icon: 'Scale',
      };
    case 'TRANSACTION':
    default:
      return {
        label: isRTL ? 'مرجع' : 'Ref',
        bgClass: 'bg-slate-500/10 text-slate-600 dark:text-slate-300 border-slate-500/25',
        icon: 'ArrowRightLeft',
      };
  }
};

export const getTransactionImpactDescription = (
  type: string | undefined | null,
  isRTL: boolean = true
): string => {
  switch (type?.toUpperCase()) {
    case 'HOLD':
      return isRTL
        ? 'حجز مؤقت للرصيد كتأمين إلزامي للمزايدة النشطة. يظل المبلغ في المحفظة ولكنه غير متاح للسحب حتى انتهاء المزاد.'
        : 'Temporary balance hold as bidding deposit. Funds remain in wallet but are locked until auction finalization.';
    case 'RELEASE':
      return isRTL
        ? 'فك حجز الرصيد وإعادته كاملاً للرصيد المتاح للمزايد بعد انتهاء المزاد أو تفوق مزايد آخر.'
        : 'Hold released and funds restored to available wallet balance after outbid or auction conclusion.';
    case 'CAPTURE':
      return isRTL
        ? 'خصم نهائي للمبلغ من محفظة المشتري الفائز وتحويله لحساب الضمان المالي كقيمة شراء للمزاد.'
        : 'Final funds capture from winner wallet transferred to escrow for auction purchase settlement.';
    case 'DEPOSIT':
      return isRTL
        ? 'إيداع نقدي مباشر في رصيد المحفظة عبر بوابة الدفع الإلكتروني المعتمدة.'
        : 'Direct balance deposit into wallet via payment gateway checkout.';
    case 'WITHDRAW':
      return isRTL
        ? 'خصم رصيد من المحفظة لتنفيذ حوالة سحب مصرفي أو محفظة إلكترونية لحساب المستخدم.'
        : 'Balance deduction to process payout transfer to bank or digital wallet.';
    case 'REFUND':
      return isRTL
        ? 'استرداد مالي لحساب المشتري بعد فض نزاع أو إلغاء المعاملة بقرار إداري.'
        : 'Escrow or auction refund returned to user available balance.';
    case 'ADMIN_CREDIT':
      return isRTL
        ? 'تسوية رصيد إدارية (+): تمت إضافة رصيد للمحفظة يدوياً بقرار وتوثيق إداري.'
        : 'Administrative credit (+): manual balance addition documented by system administrator.';
    case 'ADMIN_DEBIT':
      return isRTL
        ? 'تسوية رصيد إدارية (-): تم خصم رصيد من المحفظة يدوياً بقرار وتوثيق إداري.'
        : 'Administrative debit (-): manual balance deduction documented by system administrator.';
    default:
      return isRTL
        ? 'حركة مالية نظامية مسجلة في سجل تدقيق المحفظة.'
        : 'Standard system transaction recorded in wallet audit log.';
  }
};


export const getRoleBadgeConfig = (role: string) => {
  switch (role?.toUpperCase()) {
    case 'ADMIN':
      return {
        label: 'ADMIN',
        bgClass: 'bg-amber-500/10 text-amber-500 border-amber-500/30',
      };
    case 'USER':
    default:
      return {
        label: 'USER',
        bgClass: 'bg-slate-500/10 text-slate-400 border-slate-500/30',
      };
  }
};

export const getUserStatusConfig = (isBanned: boolean, isEmailVerified: boolean) => {
  if (isBanned) {
    return {
      status: 'BANNED',
      labelAr: 'محظور',
      labelEn: 'Banned',
      bgClass: 'bg-rose-500/10 text-rose-500 border-rose-500/30',
    };
  }
  if (!isEmailVerified) {
    return {
      status: 'UNVERIFIED',
      labelAr: 'غير مفعل',
      labelEn: 'Unverified',
      bgClass: 'bg-amber-500/10 text-amber-500 border-amber-500/30',
    };
  }
  return {
    status: 'ACTIVE',
    labelAr: 'نشط',
    labelEn: 'Active',
    bgClass: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30',
  };
};

export const getAuctionStatusBadge = (
  status: string,
  isRTL: boolean = true
): { label: string; labelAr: string; labelEn: string; bgClass: string } => {
  const norm = status?.toUpperCase();
  switch (norm) {
    case 'ACTIVE':
      return {
        label: isRTL ? 'نشط' : 'Active',
        labelAr: 'نشط',
        labelEn: 'Active',
        bgClass: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 dark:bg-emerald-500/15',
      };
    case 'PENDING':
      return {
        label: isRTL ? 'قيد الانتظار' : 'Pending',
        labelAr: 'قيد الانتظار',
        labelEn: 'Pending',
        bgClass: 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30 dark:bg-amber-500/15',
      };
    case 'ENDED':
    case 'END':
      return {
        label: isRTL ? 'منتهي' : 'Ended',
        labelAr: 'منتهي',
        labelEn: 'Ended',
        bgClass: 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/30 dark:bg-blue-500/15',
      };
    case 'CANCELLED':
      return {
        label: isRTL ? 'ملغي' : 'Cancelled',
        labelAr: 'ملغي',
        labelEn: 'Cancelled',
        bgClass: 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/30 dark:bg-rose-500/15',
      };
    default:
      return {
        label: status || '—',
        labelAr: status || '—',
        labelEn: status || '—',
        bgClass: 'bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-500/30 dark:bg-slate-500/15',
      };
  }
};

export const getDisputeStatusBadge = (status: string) => {
  switch (status?.toUpperCase()) {
    case 'OPEN':
      return {
        labelAr: 'مفتوح',
        labelEn: 'Open',
        bgClass: 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30',
      };
    case 'UNDER_REVIEW':
      return {
        labelAr: 'قيد الفحص',
        labelEn: 'Under Review',
        bgClass: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30',
      };
    case 'RESOLVED_BUYER_REFUNDED':
      return {
        labelAr: 'مسترد للمشتري',
        labelEn: 'Buyer Refunded',
        bgClass: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/25',
      };
    case 'RESOLVED_SELLER_PAID':
      return {
        labelAr: 'مصروف للبائع',
        labelEn: 'Seller Paid',
        bgClass: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/25',
      };
    case 'CANCELLED':
      return {
        labelAr: 'ملغي',
        labelEn: 'Cancelled',
        bgClass: 'bg-slate-500/15 text-slate-600 dark:text-slate-400 border-slate-500/30',
      };
    default:
      return {
        labelAr: status,
        labelEn: status,
        bgClass: 'bg-slate-500/15 text-slate-600 dark:text-slate-400 border-slate-500/30',
      };
  }
};

export const getEscrowStatusBadge = (status: string) => {
  switch (status?.toUpperCase()) {
    case 'HELD':
      return {
        labelAr: 'محجوز بالأمانات',
        labelEn: 'Held in Escrow',
        bgClass: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30',
      };
    case 'RELEASED':
      return {
        labelAr: 'محرر للبائع',
        labelEn: 'Released to Seller',
        bgClass: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
      };
    case 'REFUNDED':
      return {
        labelAr: 'مسترد للمشتري',
        labelEn: 'Refunded to Buyer',
        bgClass: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30',
      };
    case 'DISPUTED':
      return {
        labelAr: 'محل نزاع قائم',
        labelEn: 'Under Dispute',
        bgClass: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30',
      };
    default:
      return {
        labelAr: status || '—',
        labelEn: status || '—',
        bgClass: 'bg-slate-500/10 text-slate-400 border-slate-500/30',
      };
  }
};

export interface FormattedEscrowReleaseReason {
  label: string;
  isDispute: boolean;
  notes?: string;
}

export const formatEscrowReleaseReason = (
  reason: string | undefined | null,
  isRTL: boolean = true
): FormattedEscrowReleaseReason => {
  if (!reason || reason.trim() === '') {
    return { label: isRTL ? '—' : '—', isDispute: false };
  }

  const trimmed = reason.trim();

  // If dispute resolution: e.g. "ADMIN_RESOLVED_DISPUTE: refund buyer" or custom notes
  if (trimmed.toUpperCase().startsWith('ADMIN_RESOLVED_DISPUTE')) {
    const rawNotes = trimmed.replace(/^ADMIN_RESOLVED_DISPUTE:?\s*/i, '').trim();
    let cleanNotes = rawNotes;
    if (rawNotes.toLowerCase() === 'refund buyer') {
      cleanNotes = isRTL
        ? 'تم حسم النزاع لصالح المشتري ورد كامل المبلغ.'
        : 'Dispute ruled in buyer favor; full amount refunded.';
    } else if (rawNotes.toLowerCase() === 'pay seller') {
      cleanNotes = isRTL
        ? 'تم حسم النزاع لصالح البائع وتحرير المبلغ له.'
        : 'Dispute ruled in seller favor; funds released to seller.';
    }

    return {
      label: isRTL ? 'حسم نزاع إداري' : 'Dispute Resolution',
      isDispute: true,
      notes: cleanNotes || undefined,
    };
  }

  const map: Record<string, { ar: string; en: string; isDispute: boolean }> = {
    BUYER_CONFIRMED: {
      ar: 'تأكيد استلام المشتري',
      en: 'Buyer Confirmed Delivery',
      isDispute: false,
    },
    EXPIRED_INSPECTION_WINDOW: {
      ar: 'انقضاء مهلة الفحص (٧ أيام)',
      en: 'Inspection Window Expired (7 Days)',
      isDispute: false,
    },
    MANUAL_RELEASE: {
      ar: 'تحرير يدوي من الإدارة',
      en: 'Admin Manual Release',
      isDispute: false,
    },
    MANUAL_REFUND: {
      ar: 'استرداد يدوي من الإدارة',
      en: 'Admin Manual Refund',
      isDispute: false,
    },
    DISPUTE_REFUND: {
      ar: 'استرداد بموجب نزاع',
      en: 'Dispute Refund',
      isDispute: true,
    },
    DISPUTE_RELEASE: {
      ar: 'تحرير بموجب نزاع',
      en: 'Dispute Release',
      isDispute: true,
    },
    DISPUTE_RESOLVED_PAY_SELLER: {
      ar: 'حسم النزاع لصالح البائع',
      en: 'Dispute Resolved (Pay Seller)',
      isDispute: true,
    },
    DISPUTE_RESOLVED_REFUND_BUYER: {
      ar: 'حسم النزاع لصالح المشتري',
      en: 'Dispute Resolved (Refund Buyer)',
      isDispute: true,
    },
    ADMIN_MANUAL_RELEASE: {
      ar: 'تسوية يدوية من الإدارة',
      en: 'Admin Manual Settlement',
      isDispute: false,
    },
  };

  const match = map[trimmed.toUpperCase()];
  if (match) {
    return {
      label: isRTL ? match.ar : match.en,
      isDispute: match.isDispute,
    };
  }

  // Fallback: format any SNAKE_CASE or ALL_CAPS string cleanly into Title Case if English
  const formattedFallback = isRTL
    ? trimmed
    : trimmed
        .replace(/_/g, ' ')
        .toLowerCase()
        .replace(/\b\w/g, (c) => c.toUpperCase());

  return { label: formattedFallback, isDispute: false };
};

export const getDisputeReasonLabel = (reason: string, isRTL: boolean = true): string => {
  const map: Record<string, { ar: string; en: string }> = {
    ITEM_NOT_RECEIVED: { ar: 'السلعة لم تصل', en: 'Item Not Received' },
    ITEM_DAMAGED: { ar: 'السلعة تالفة أو متضررة', en: 'Item Damaged' },
    ITEM_MISMATCH: { ar: 'السلعة غير مطابقة للوصف', en: 'Item Mismatch' },
    COUNTERFEIT_ITEM: { ar: 'سلعة مقلدة أو مزيفة', en: 'Counterfeit Item' },
    OTHER: { ar: 'سبب آخر', en: 'Other Reason' },
  };

  const match = map[reason?.toUpperCase()];
  if (match) return isRTL ? match.ar : match.en;
  return reason?.replace(/_/g, ' ') || '—';
};

export const getWithdrawalStatusBadge = (status: string) => {
  switch (status?.toUpperCase()) {
    case 'PENDING':
      return {
        labelAr: 'معلق بانتظار الموافقة',
        labelEn: 'Pending Approval',
        bgClass: 'bg-amber-500/10 text-amber-500 border-amber-500/30',
      };
    case 'PROCESSING':
      return {
        labelAr: 'قيد التنفيذ المصرفي',
        labelEn: 'Processing',
        bgClass: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
      };
    case 'COMPLETED':
      return {
        labelAr: 'مكتمل ومصروف',
        labelEn: 'Completed',
        bgClass: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30',
      };
    case 'REJECTED':
      return {
        labelAr: 'مرفوض',
        labelEn: 'Rejected',
        bgClass: 'bg-rose-500/10 text-rose-500 border-rose-500/30',
      };
    case 'CANCELLED':
      return {
        labelAr: 'ملغي من المستخدم',
        labelEn: 'Cancelled',
        bgClass: 'bg-slate-500/10 text-slate-400 border-slate-500/30',
      };
    default:
      return {
        labelAr: status,
        labelEn: status,
        bgClass: 'bg-slate-500/10 text-slate-400 border-slate-500/30',
      };
  }
};

export const getPayoutMethodConfig = (method: string, isRTL: boolean = true) => {
  switch (method?.toUpperCase()) {
    case 'INSTAPAY':
      return {
        label: isRTL ? 'انستاباي' : 'InstaPay',
        badgeClass: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
        type: 'INSTAPAY' as const,
      };
    case 'BANK_ACCOUNT':
      return {
        label: isRTL ? 'تحويل بنكي' : 'Bank Account',
        badgeClass: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
        type: 'BANK' as const,
      };
    case 'VODAFONE_CASH':
      return {
        label: isRTL ? 'فودافون كاش' : 'Vodafone Cash',
        badgeClass: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
        type: 'WALLET' as const,
      };
    case 'ORANGE_CASH':
      return {
        label: isRTL ? 'أورنج كاش' : 'Orange Cash',
        badgeClass: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20',
        type: 'WALLET' as const,
      };
    case 'ETISALAT_CASH':
      return {
        label: isRTL ? 'اتصالات كاش' : 'Etisalat Cash',
        badgeClass: 'bg-emerald-600/10 text-emerald-700 dark:text-emerald-400 border-emerald-600/20',
        type: 'WALLET' as const,
      };
    case 'WE_PAY':
      return {
        label: isRTL ? 'وي باي' : 'WE Pay',
        badgeClass: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
        type: 'WALLET' as const,
      };
    default:
      return {
        label: method || '—',
        badgeClass: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20',
        type: 'OTHER' as const,
      };
  }
};

export const getAuctionCategoryLabel = (category: string, isRTL: boolean = true): string => {
  const map: Record<string, { ar: string; en: string }> = {
    ELECTRONICS: { ar: 'إلكترونيات', en: 'Electronics' },
    FASHION: { ar: 'أزياء وموضة', en: 'Fashion' },
    JEWELRY: { ar: 'مجوهرات وحلي', en: 'Jewelry' },
    WATCHES: { ar: 'ساعات فاخرة', en: 'Watches' },
    ANTIQUES: { ar: 'تحف وأنتيكات', en: 'Antiques' },
    ART: { ar: 'فنون ولوحات', en: 'Art' },
    COLLECTIBLES: { ar: 'مقتنيات نادرة', en: 'Collectibles' },
    BOOKS: { ar: 'كتب ومخطوطات', en: 'Books' },
    FURNITURE: { ar: 'أثاث وديكور', en: 'Furniture' },
    HOME_APPLIANCES: { ar: 'أجهزة منزلية', en: 'Home Appliances' },
    CARS: { ar: 'سيارات ومركبات', en: 'Cars' },
    MOTORCYCLES: { ar: 'دراجات نارية', en: 'Motorcycles' },
    REAL_ESTATE: { ar: 'عقارات وأراضي', en: 'Real Estate' },
    SPORTS: { ar: 'رياضة ولياقة', en: 'Sports' },
    TOYS: { ar: 'ألعاب ومجسمات', en: 'Toys' },
    OTHER: { ar: 'أخرى ومتنوعة', en: 'Other' },
  };

  const match = map[category?.toUpperCase()];
  if (match) return isRTL ? match.ar : match.en;
  return category || '—';
};

export const getReviewStatusBadge = (status: string) => {
  switch (status?.toUpperCase()) {
    case 'PUBLISHED':
      return {
        labelAr: 'منشور',
        labelEn: 'Published',
        bgClass: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30',
      };
    case 'HIDDEN':
      return {
        labelAr: 'محجوب إدارياً',
        labelEn: 'Hidden',
        bgClass: 'bg-rose-500/10 text-rose-500 border-rose-500/30',
      };
    case 'PENDING':
      return {
        labelAr: 'قيد المراجعة',
        labelEn: 'Pending',
        bgClass: 'bg-amber-500/10 text-amber-500 border-amber-500/30',
      };
    default:
      return {
        labelAr: status || '—',
        labelEn: status || '—',
        bgClass: 'bg-slate-500/10 text-slate-400 border-slate-500/30',
      };
  }
};

/**
 * Detects if the first alphabetical character of a text string is Arabic.
 */
export const isArabicText = (text: string | undefined | null): boolean => {
  if (!text) return false;
  const match = text.match(/[\p{L}]/u);
  if (!match) return false;
  return /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/.test(match[0]);
};

/**
 * Normalizes and formats bank names into bilingual representation
 * e.g., "CIB" -> ar: "البنك التجاري الدولي (CIB)", en: "Commercial International Bank (CIB)"
 */
export const formatAdminBankName = (
  bankName: string | undefined | null,
  isRTL: boolean = true
): string => {
  if (!bankName) return '—';
  const raw = bankName.trim();
  const upper = raw.toUpperCase();

  // 1. CIB
  if (
    upper.includes('CIB') ||
    upper.includes('COMMERCIAL INTERNATIONAL') ||
    raw.includes('التجاري الدولي')
  ) {
    return isRTL ? 'البنك التجاري الدولي (CIB)' : 'Commercial International Bank (CIB)';
  }

  // 2. NBE / الأهلي
  if (
    upper.includes('NBE') ||
    upper.includes('NATIONAL BANK OF EGYPT') ||
    (raw.includes('الأهلي') && !upper.includes('QNB'))
  ) {
    return isRTL ? 'البنك الأهلي المصري' : 'National Bank of Egypt (NBE)';
  }

  // 3. Banque Misr / بنك مصر
  if (upper.includes('MISR') || raw.includes('مصر')) {
    return isRTL ? 'بنك مصر' : 'Banque Misr';
  }

  // 4. QNB
  if (upper.includes('QNB') || raw.includes('قطر الوطني')) {
    return isRTL ? 'بنك QNB الأهلي' : 'QNB Alahli';
  }

  // 5. Bank of Alexandria / بنك الإسكندرية
  if (upper.includes('ALEX') || raw.includes('الإسكندرية') || raw.includes('الاسكندرية')) {
    return isRTL ? 'بنك الإسكندرية' : 'Bank of Alexandria';
  }

  // 6. Banque du Caire / بنك القاهرة
  if (upper.includes('CAIRE') || raw.includes('القاهرة')) {
    return isRTL ? 'بنك القاهرة' : 'Banque du Caire';
  }

  // 7. ADIB / مصرف أبوظبي الإسلامي
  if (upper.includes('ADIB') || raw.includes('أبوظبي') || raw.includes('ابوظبي')) {
    return isRTL ? 'مصرف أبوظبي الإسلامي' : 'Abu Dhabi Islamic Bank (ADIB)';
  }

  // 8. Faisal / فيصل الإسلامي
  if (upper.includes('FAISAL') || raw.includes('فيصل')) {
    return isRTL ? 'بنك فيصل الإسلامي' : 'Faisal Islamic Bank';
  }

  // 9. HSBC
  if (upper.includes('HSBC')) {
    return isRTL ? 'بنك إتش إس بي سي (HSBC)' : 'HSBC Bank Egypt';
  }

  // Fallback to original bankName
  return raw;
};

