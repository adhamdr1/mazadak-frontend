import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Gavel,
  CheckCircle2,
  Calendar,
  FileText,
  RotateCcw,
  ArrowDownLeft,
} from 'lucide-react';
import type { DisputeResolution } from '../types/escrow.types';
import { formatDateTime } from '@/utils/formatters';
import { cn } from '@/utils/cn';

export interface DisputeAdminResolutionCardProps {
  decision: DisputeResolution;
  notes?: string | null;
  resolvedAt?: string | null;
  className?: string;
}

export const DisputeAdminResolutionCard: React.FC<DisputeAdminResolutionCardProps> = ({
  decision,
  notes,
  resolvedAt,
  className,
}) => {
  const { t, i18n } = useTranslation(['escrow', 'common']);
  const isRTL = i18n.language?.startsWith('ar');

  const isRefundBuyer = decision === 'REFUND_BUYER';

  const formattedResolvedAt = resolvedAt
    ? formatDateTime(resolvedAt, isRTL, { dateStyle: 'medium', timeStyle: 'short' })
    : null;

  return (
    <div
      className={cn(
        'group rounded-3xl p-5 sm:p-7 border shadow-sm hover:shadow-xl hover:shadow-slate-200/70 dark:shadow-[0_4px_20px_-2px_rgba(0,0,0,0.5)] dark:hover:shadow-[0_12px_35px_-5px_rgba(0,0,0,0.8),0_0_25px_rgba(245,158,11,0.18)] hover:-translate-y-1 transition-all duration-300 space-y-5',
        isRefundBuyer
          ? 'bg-gradient-to-br from-blue-500/10 via-blue-500/5 to-transparent border-blue-500/30 hover:border-blue-500/50 dark:from-blue-950/40 dark:via-slate-900 dark:to-slate-900 dark:border-blue-900/60'
          : 'bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent border-emerald-500/30 hover:border-emerald-500/50 dark:from-emerald-950/40 dark:via-slate-900 dark:to-slate-900 dark:border-emerald-900/60',
        className
      )}
    >
      {/* Header: Gavel Icon & Verdict Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200/70 dark:border-slate-800">
        <div className="flex items-center gap-3.5">
          <div
            className={cn(
              'w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border shadow-2xs',
              isRefundBuyer
                ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20'
                : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
            )}
          >
            <Gavel className="w-5 h-5" />
          </div>

          <div className="space-y-0.5">
            <span className="text-3xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
              {t('disputeDetail.adminResolutionTitle', isRTL ? 'قرار لجنة التحكيم وفض النزاعات' : 'Arbitration Committee Ruling')}
            </span>
            <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <span>
                {isRefundBuyer
                  ? t('resolutions.REFUND_BUYER', isRTL ? 'رد كامل المبلغ للمشتري' : 'Full Refund to Buyer')
                  : t('resolutions.PAY_SELLER', isRTL ? 'تحرير المبلغ للبائع' : 'Release Payment to Seller')}
              </span>
              <CheckCircle2
                className={cn(
                  'w-4 h-4 shrink-0',
                  isRefundBuyer ? 'text-blue-500' : 'text-emerald-500'
                )}
              />
            </h3>
          </div>
        </div>

        {/* Resolution Timestamp */}
        {formattedResolvedAt && (
          <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 bg-white/70 dark:bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-200/80 dark:border-slate-700/80 self-start sm:self-auto shrink-0 shadow-2xs">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-semibold">{formattedResolvedAt}</span>
          </div>
        )}
      </div>

      {/* Decision Summary Pill */}
      <div className="flex items-center gap-2.5 p-3.5 rounded-2xl bg-white/80 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 text-xs">
        {isRefundBuyer ? (
          <RotateCcw className="w-4 h-4 text-blue-500 shrink-0" />
        ) : (
          <ArrowDownLeft className="w-4 h-4 text-emerald-500 shrink-0" />
        )}
        <span className="text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
          {isRefundBuyer
            ? t(
                'disputeDetail.refundBuyerExplanation',
                isRTL
                  ? 'بناءً على مراجعة الأدلة وتفاصيل السلعة، قضت اللجنة بأحقية المشتري في استرداد كامل قيمة الصفقة إلى محفظته.'
                  : 'Based on evidence and transaction review, the arbitration committee ruled in favor of a full refund to the buyer.'
              )
            : t(
                'disputeDetail.paySellerExplanation',
                isRTL
                  ? 'بناءً على مراجعة الأدلة وتفاصيل المزاد، قضت اللجنة بمطابقة السلعة وتحرير كامل المبلغ لمحفظة البائع.'
                  : 'Based on evidence and auction review, the committee ruled the item conforms to specs and released payment to the seller.'
              )}
        </span>
      </div>

      {/* Official Admin Notes / Comments */}
      {notes && (
        <div className="space-y-1.5 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
            <FileText className="w-3.5 h-3.5 text-amber-500" />
            <span>{t('disputeDetail.officialNotesLabel', isRTL ? 'ملاحظات وحيثيات الحكم الرسمية' : 'Official Committee Notes & Findings')}</span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed whitespace-pre-wrap">
            {notes}
          </p>
        </div>
      )}
    </div>
  );
};
