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
  const finalCurrency = currency || (isRTL ? 'ج.م' : 'EGP');
  if (amount === undefined || amount === null) return `${isRTL ? '٠' : '0'} ${finalCurrency}`;
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num)) return `${isRTL ? '٠' : '0'} ${finalCurrency}`;

  const hasFractions = num % 1 !== 0;
  const formatted = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: hasFractions ? 2 : 0,
    maximumFractionDigits: hasFractions ? 2 : 0,
  }).format(num);

  const localizedNum = toLocalizedDigits(formatted, isRTL);
  return `${localizedNum} ${finalCurrency}`;
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

export const getTransactionTypeLabel = (type: string, isRTL: boolean = true): string => {
  const map: Record<string, { ar: string; en: string }> = {
    DEPOSIT: { ar: 'إيداع رصيد', en: 'Deposit' },
    WITHDRAWAL: { ar: 'طلب سحب', en: 'Withdrawal' },
    BID_HOLD: { ar: 'حجز مزايدة', en: 'Bid Hold' },
    BID_RELEASE: { ar: 'تحرير حجز مزايدة', en: 'Bid Hold Release' },
    ESCROW_PAYMENT: { ar: 'دفع ضمان مالي', en: 'Escrow Payment' },
    ESCROW_RELEASE: { ar: 'تحرير ضمان مالي', en: 'Escrow Release' },
    ESCROW_REFUND: { ar: 'استرداد ضمان', en: 'Escrow Refund' },
    AUCTION_FEE: { ar: 'رسوم المنصة', en: 'Platform Fee' },
    ADMIN_ADJUST_CREDIT: { ar: 'تسوية إدارية (إيداع)', en: 'Admin Adjustment (Credit)' },
    ADMIN_ADJUST_DEBIT: { ar: 'تسوية إدارية (خصم)', en: 'Admin Adjustment (Debit)' },
  };

  const match = map[type?.toUpperCase()];
  if (match) return isRTL ? match.ar : match.en;
  return type?.replace(/_/g, ' ') || '—';
};

export const getTransactionStatusBadge = (
  status: string,
  isRTL: boolean = true
): { label: string; bgClass: string } => {
  switch (status?.toUpperCase()) {
    case 'SUCCESS':
    case 'COMPLETED':
      return {
        label: isRTL ? 'ناجحة' : 'Success',
        bgClass: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
      };
    case 'PENDING':
      return {
        label: isRTL ? 'معلقة' : 'Pending',
        bgClass: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
      };
    case 'PROCESSING':
      return {
        label: isRTL ? 'قيد التنفيذ' : 'Processing',
        bgClass: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      };
    case 'FAILED':
    case 'REJECTED':
      return {
        label: isRTL ? 'مرفوضة' : 'Failed',
        bgClass: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
      };
    case 'CANCELLED':
      return {
        label: isRTL ? 'ملغاة' : 'Cancelled',
        bgClass: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
      };
    default:
      return {
        label: status,
        bgClass: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
      };
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

export const getAuctionStatusBadge = (status: string) => {
  switch (status?.toUpperCase()) {
    case 'ACTIVE':
      return {
        labelAr: 'نشط ومباشر',
        labelEn: 'Active',
        bgClass: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30',
      };
    case 'PENDING':
      return {
        labelAr: 'قيد الانتظار',
        labelEn: 'Pending',
        bgClass: 'bg-amber-500/10 text-amber-500 border-amber-500/30',
      };
    case 'ENDED':
      return {
        labelAr: 'منتهي',
        labelEn: 'Ended',
        bgClass: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
      };
    case 'CANCELLED':
      return {
        labelAr: 'ملغي إدارياً',
        labelEn: 'Cancelled',
        bgClass: 'bg-rose-500/10 text-rose-500 border-rose-500/30',
      };
    default:
      return {
        labelAr: status,
        labelEn: status,
        bgClass: 'bg-slate-500/10 text-slate-400 border-slate-500/30',
      };
  }
};

export const getDisputeStatusBadge = (status: string) => {
  switch (status?.toUpperCase()) {
    case 'OPEN':
      return {
        labelAr: 'نزاع مفتوح',
        labelEn: 'Open',
        bgClass: 'bg-rose-500/10 text-rose-500 border-rose-500/30',
      };
    case 'UNDER_REVIEW':
      return {
        labelAr: 'قيد المراجعة الإدارية',
        labelEn: 'Under Review',
        bgClass: 'bg-amber-500/10 text-amber-500 border-amber-500/30',
      };
    case 'RESOLVED_BUYER_REFUNDED':
      return {
        labelAr: 'محلول (رد للمشتري)',
        labelEn: 'Refunded Buyer',
        bgClass: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30',
      };
    case 'RESOLVED_SELLER_PAID':
      return {
        labelAr: 'محلول (صرف للبائع)',
        labelEn: 'Paid Seller',
        bgClass: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30',
      };
    case 'CANCELLED':
      return {
        labelAr: 'ملغي',
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
