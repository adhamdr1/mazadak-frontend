import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Building2,
  Zap,
  Smartphone,
  ExternalLink,
  Ban,
  Clock,
  Eye,
  AlertCircle,
  Hash,
} from 'lucide-react';
import { WithdrawalStatusBadge } from './WithdrawalStatusBadge';
import {
  formatPrice,
  formatDateTime,
  toLocalizedDigits,
  localizeBankName,
} from '@/utils/formatters';
import type { WithdrawalResponse, PayoutMethod } from '../types/wallet.types';

export interface WithdrawalCardProps {
  withdrawal: WithdrawalResponse;
  onOpenDetails: (withdrawal: WithdrawalResponse) => void;
  onOpenCancelModal: (withdrawal: WithdrawalResponse) => void;
  isCancelling?: boolean;
}

export const WithdrawalCard: React.FC<WithdrawalCardProps> = ({
  withdrawal,
  onOpenDetails,
  onOpenCancelModal,
  isCancelling = false,
}) => {
  const { t, i18n } = useTranslation(['wallet']);
  const isRTL = i18n.language.startsWith('ar');

  const details = withdrawal.payoutDetails || {};

  const getMethodBadge = (method: PayoutMethod) => {
    switch (method) {
      case 'BANK_ACCOUNT':
        return {
          title: t('withdraw.methods.bank', 'حساب بنكي'),
          icon: Building2,
          color: 'text-blue-600 dark:text-blue-400 bg-blue-500/10 border-blue-500/20',
        };
      case 'INSTAPAY':
        return {
          title: t('withdraw.methods.instapay', 'إنستاباي'),
          icon: Zap,
          color: 'text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/20',
        };
      case 'VODAFONE_CASH':
        return {
          title: t('withdraw.methods.vodafone', 'فودافون كاش'),
          icon: Smartphone,
          color: 'text-rose-600 dark:text-rose-400 bg-rose-500/10 border-rose-500/20',
        };
      case 'ORANGE_CASH':
        return {
          title: t('withdraw.methods.orange', 'أورنج كاش'),
          icon: Smartphone,
          color: 'text-orange-600 dark:text-orange-400 bg-orange-500/10 border-orange-500/20',
        };
      case 'ETISALAT_CASH':
        return {
          title: t('withdraw.methods.etisalat', 'اتصالات كاش'),
          icon: Smartphone,
          color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
        };
      case 'WE_PAY':
        return {
          title: t('withdraw.methods.we', 'وي باي'),
          icon: Smartphone,
          color: 'text-purple-600 dark:text-purple-400 bg-purple-500/10 border-purple-500/20',
        };
      default:
        return {
          title: method,
          icon: Smartphone,
          color: 'text-slate-600 dark:text-slate-400 bg-slate-500/10 border-slate-500/20',
        };
    }
  };

  const methodInfo = getMethodBadge(withdrawal.payoutMethod);
  const IconComponent = methodInfo.icon;

  // Mask sensitive numbers cleanly, rendered via segmented LTR flex nodes to prevent BiDi inversion
  const renderMaskedDestination = () => {
    if (withdrawal.payoutMethod === 'BANK_ACCOUNT') {
      const bankName = localizeBankName(details.bankName, isRTL);
      const acc = details.accountNumber || details.iban || '';
      const last4 = acc.slice(-4);
      const localizedLast4 = toLocalizedDigits(last4, isRTL);
      return (
        <span className="text-xs text-slate-500 dark:text-slate-400 font-medium inline-flex items-center gap-1.5">
          {bankName && <span>{bankName}</span>}
          <span className="inline-flex items-center font-mono [direction:ltr]" dir="ltr">
            <span>(••••</span>
            <span className="ms-1">{localizedLast4}</span>
            <span>)</span>
          </span>
        </span>
      );
    }

    if (withdrawal.payoutMethod === 'INSTAPAY' && details.ipaAddress) {
      return (
        <span className="text-xs text-slate-500 dark:text-slate-400 font-mono font-medium [direction:ltr]" dir="ltr">
          ({details.ipaAddress})
        </span>
      );
    }

    // Phone-based methods (InstaPay with phone, Vodafone Cash, Orange Cash, Etisalat Cash, WE Pay)
    const phone = details.phoneNumber || '';
    if (phone.length === 11) {
      const prefix = phone.slice(0, 3);
      const suffix = phone.slice(7);
      return (
        <span
          className="text-xs text-slate-500 dark:text-slate-400 font-medium inline-flex flex-row items-center font-mono [direction:ltr]"
          dir="ltr"
        >
          <span>(</span>
          <span>{toLocalizedDigits(prefix, isRTL)}</span>
          <span className="tracking-widest px-0.5 select-none text-[10px]">••••</span>
          <span>{toLocalizedDigits(suffix, isRTL)}</span>
          <span>)</span>
        </span>
      );
    }

    if (phone) {
      return (
        <span className="text-xs text-slate-500 dark:text-slate-400 font-mono font-medium [direction:ltr]" dir="ltr">
          ({toLocalizedDigits(phone, isRTL)})
        </span>
      );
    }

    return null;
  };

  const isSafeUrl = (url?: string | null): boolean => {
    if (!url) return false;
    try {
      const parsed = new URL(url);
      return parsed.protocol === 'https:' || parsed.protocol === 'http:';
    } catch {
      return false;
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-amber-500/50 dark:hover:border-amber-500/50 bg-white dark:bg-slate-900 p-4 sm:p-5 shadow-sm hover:shadow-md transition-all duration-300 space-y-4">
      {/* 1. Header: Method Badge + Destination (unboxed) + Date + Status Badge */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3.5 border-b border-slate-100 dark:border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-xl border ${methodInfo.color} shrink-0`}>
            <IconComponent className="w-4 h-4" />
          </div>

          <div className="flex flex-col gap-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                {methodInfo.title}
              </span>
              {renderMaskedDestination()}
            </div>

            <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
              <Clock className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
              <span>{formatDateTime(withdrawal.createdAt, isRTL)}</span>
            </div>
          </div>
        </div>

        <WithdrawalStatusBadge status={withdrawal.status} size="sm" />
      </div>

      {/* 2. Middle Row: Modern Fintech Financial Metric Rail (Centered Columns) */}
      <div className="rounded-xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/80 px-4 py-3 grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 items-center text-center">
        {/* Item 1: Requested Amount */}
        <div className="space-y-0.5 text-center">
          <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
            {t('withdrawals.card.requestedAmount', 'المبلغ المطلوب')}
          </span>
          <div className="flex items-baseline justify-center gap-1 text-slate-800 dark:text-slate-100 font-extrabold text-sm sm:text-base">
            <span>{formatPrice(withdrawal.amount, isRTL)}</span>
            <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">
              {t('balance.currency', 'ج.م')}
            </span>
          </div>
        </div>

        {/* Item 2: Service Fee (with desktop side dividers) */}
        <div className="space-y-0.5 text-center sm:border-x sm:border-slate-200/80 dark:sm:border-slate-700/60 sm:px-3">
          <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
            {t('withdrawals.card.fee', 'رسوم الخدمة')}
          </span>
          <div className="flex items-baseline justify-center gap-1 text-rose-500 dark:text-rose-400 font-extrabold text-sm sm:text-base">
            <span>-{formatPrice(withdrawal.fee, isRTL)}</span>
            <span className="text-xs font-semibold text-rose-400/80 dark:text-rose-500/80">
              {t('balance.currency', 'ج.م')}
            </span>
          </div>
        </div>

        {/* Item 3: Net Amount (Hero Value - Centered) */}
        <div className="space-y-0.5 text-center">
          <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">
            {t('withdrawals.card.netAmount', 'المبلغ الصافي')}
          </span>
          <div className="flex items-baseline justify-center gap-1 text-emerald-600 dark:text-emerald-400 font-black text-base sm:text-lg tracking-tight">
            <span>{formatPrice(withdrawal.netAmount, isRTL)}</span>
            <span className="text-xs font-bold text-emerald-600/80 dark:text-emerald-400/80">
              {t('balance.currency', 'ج.م')}
            </span>
          </div>
        </div>
      </div>

      {/* 3. Rejection Reason Box (if REJECTED) */}
      {withdrawal.status === 'REJECTED' && withdrawal.rejectionReason && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-400 text-xs space-y-1">
          <div className="flex items-center gap-2 font-bold">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{t('withdrawals.card.rejectionReason', 'سبب الرفض:')}</span>
          </div>
          <p className="text-xs leading-relaxed ps-6 text-rose-800 dark:text-rose-300">{withdrawal.rejectionReason}</p>
        </div>
      )}

      {/* 4. Admin Reference Info (if COMPLETED & reference available) */}
      {withdrawal.status === 'COMPLETED' && withdrawal.adminReference && (
        <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800 flex items-center justify-between text-xs">
          <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5 font-medium">
            <Hash className="w-3.5 h-3.5 text-amber-500" />
            <span>{t('withdrawals.card.referenceNumber', 'رقم المرجع:')}</span>
          </span>
          <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
            {withdrawal.adminReference}
          </span>
        </div>
      )}

      {/* 5. Footer Actions Bar (Horizontal alignment with elegant buttons) */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-800/80">
        <div className="flex flex-wrap items-center gap-2">
          {/* Cancel button: Visible ONLY when status is PENDING */}
          {withdrawal.status === 'PENDING' && (
            <button
              type="button"
              disabled={isCancelling}
              onClick={() => onOpenCancelModal(withdrawal)}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-50 hover:bg-rose-100/80 dark:bg-rose-950/30 dark:hover:bg-rose-900/40 border border-rose-200/80 dark:border-rose-900/50 active:scale-95 transition-all duration-200 cursor-pointer disabled:opacity-50"
            >
              <Ban className="w-3.5 h-3.5 shrink-0" />
              <span>{t('withdrawals.card.cancelButton', 'إلغاء الطلب')}</span>
            </button>
          )}

          {/* Receipt link: Visible ONLY when status is COMPLETED and receiptUrl is present */}
          {withdrawal.status === 'COMPLETED' && isSafeUrl(withdrawal.receiptUrl) && (
            <a
              href={withdrawal.receiptUrl!}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 hover:bg-emerald-100/80 dark:bg-emerald-950/30 dark:hover:bg-emerald-900/40 border border-emerald-200/80 dark:border-emerald-800/50 active:scale-95 transition-all duration-200"
            >
              <ExternalLink className="w-3.5 h-3.5 shrink-0" />
              <span>{t('withdrawals.card.viewReceipt', 'عرض إيصال التحويل')}</span>
            </a>
          )}
        </div>

        {/* View Details Button (With elegant amber/orange border) */}
        <button
          type="button"
          onClick={() => onOpenDetails(withdrawal)}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border-2 border-amber-500/60 hover:border-amber-500 active:scale-95 transition-all duration-200 cursor-pointer ms-auto shadow-xs"
        >
          <Eye className="w-3.5 h-3.5 text-amber-500 shrink-0" />
          <span>{t('withdrawals.card.detailsButton', 'عرض التفاصيل')}</span>
        </button>
      </div>
    </div>
  );
};

export default WithdrawalCard;
