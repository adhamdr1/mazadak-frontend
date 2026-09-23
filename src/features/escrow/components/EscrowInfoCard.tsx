import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  Calendar,
  Clock,
  CheckCircle2,
  Copy,
  Check,
  AlertCircle,
  ExternalLink,
  Coins,
  Lock,
  RotateCcw,
  FileText,
} from 'lucide-react';
import { EscrowStatusBadge } from './EscrowStatusBadge';
import { TransactionDetailsModal } from '@/features/wallet/components/TransactionDetailsModal';
import { walletService } from '@/features/wallet/services/wallet.service';
import type { EscrowData } from '../types/escrow.types';
import type { Transaction } from '@/features/wallet/types/wallet.types';
import { QUERY_KEYS } from '@/constants/queryKeys.constants';
import { ROUTES } from '@/constants/routes.constants';
import { formatPrice, formatDateTime, toLocalizedDigits } from '@/utils/formatters';
import { cn } from '@/utils/cn';

export interface EscrowInfoCardProps {
  escrow: EscrowData;
  className?: string;
}

export const EscrowInfoCard: React.FC<EscrowInfoCardProps> = ({ escrow, className }) => {
  const { t, i18n } = useTranslation(['escrow', 'common']);
  const isRTL = i18n.language?.startsWith('ar');
  const [copiedId, setCopiedId] = useState(false);
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);

  // 1. Fetch user transactions to locate the corresponding wallet transaction record
  const { data: txPageData } = useQuery({
    queryKey: [...QUERY_KEYS.WALLET.TRANSACTIONS, 'escrow', escrow._id],
    queryFn: () => walletService.getMyTransactions({ page: 1, limit: 30 }),
    staleTime: 30 * 1000,
  });

  const matchedTx = useMemo<Transaction | null>(() => {
    if (!txPageData?.items || txPageData.items.length === 0) return null;

    // Strict direct match by escrow ID or auction ID
    return (
      txPageData.items.find(
        (item) => item.referenceId === escrow._id || item.referenceId === escrow.auctionId
      ) || null
    );
  }, [txPageData, escrow]);

  // Fallback transaction so the modal always renders instantly and accurately
  const activeTransaction: Transaction = matchedTx || {
    _id: escrow._id,
    walletId: '',
    type:
      escrow.status === 'RELEASED'
        ? 'RELEASE'
        : escrow.status === 'REFUNDED'
        ? 'REFUND'
        : 'HOLD',
    amount: escrow.amount,
    currency: escrow.currency || 'EGP',
    status: escrow.status === 'DISPUTED' ? 'PENDING' : 'SUCCESS',
    referenceId: escrow._id,
    referenceType: 'ESCROW',
    createdAt: escrow.releasedAt || escrow.refundedAt || escrow.createdAt,
  };

  const formattedAmount = formatPrice(escrow?.amount || '0', isRTL);
  const formattedCreatedAt = escrow?.createdAt
    ? formatDateTime(escrow.createdAt, isRTL, { dateStyle: 'medium', timeStyle: 'short' })
    : '—';
  const formattedEndsAt = escrow?.inspectionPeriodEndsAt
    ? formatDateTime(escrow.inspectionPeriodEndsAt, isRTL, { dateStyle: 'medium', timeStyle: 'short' })
    : '—';

  const formattedReleasedAt = escrow?.releasedAt
    ? formatDateTime(escrow.releasedAt, isRTL, { dateStyle: 'medium', timeStyle: 'short' })
    : null;

  const formattedRefundedAt = escrow?.refundedAt
    ? formatDateTime(escrow.refundedAt, isRTL, { dateStyle: 'medium', timeStyle: 'short' })
    : null;

  const cleanId = String(escrow?._id || '');
  const formattedId =
    cleanId.length > 12
      ? `ESC-${cleanId.slice(0, 5)}...${cleanId.slice(-4)}`
      : cleanId
      ? `ESC-${cleanId}`
      : '—';

  const handleCopyId = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!cleanId) return;
    navigator.clipboard.writeText(cleanId);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const inspectionDays = Math.round((escrow?.inspectionDurationHours || 168) / 24);

  return (
    <div
      className={cn(
        'group relative w-full rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-5 sm:p-7 space-y-6 shadow-sm hover:shadow-xl hover:shadow-slate-200/70 dark:shadow-[0_4px_20px_-2px_rgba(0,0,0,0.5)] dark:hover:shadow-[0_12px_35px_-5px_rgba(0,0,0,0.8),0_0_25px_rgba(245,158,11,0.18)] hover:border-amber-500/50 dark:hover:border-amber-500/50 hover:-translate-y-1 transition-all duration-300',
        className
      )}
    >
      {/* 1. Header with Amount, Currency & Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100 dark:border-slate-800/90">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 dark:bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/20">
            <Coins className="w-6 h-6" />
          </div>

          <div className="space-y-0.5">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 block">
              {t('detail.totalSecuredAmount', 'إجمالي المبلغ المحتجز بالضمان')}
            </span>
            <div className="flex items-baseline gap-2 text-amber-600 dark:text-amber-400">
              <span className="text-2xl sm:text-3xl font-black font-mono tracking-tight">
                {formattedAmount}
              </span>
              <span className="text-xs font-black px-2 py-0.5 rounded-md bg-amber-500/10 dark:bg-amber-500/20 border border-amber-500/30 text-amber-700 dark:text-amber-300">
                {t('escrow:currency.egp', isRTL ? 'ج.م' : 'EGP')}
              </span>
            </div>
          </div>
        </div>

        <div className="self-start sm:self-auto shrink-0">
          <EscrowStatusBadge status={escrow.status} size="lg" />
        </div>
      </div>

      {/* 2. Structured 4-Column Audit Grid (Harmonious Height & Rhythm) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4 text-xs">
        {/* 1. Escrow Reference ID */}
        <div className="p-4 rounded-2xl bg-slate-50/90 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-1.5 hover:border-slate-200 dark:hover:border-slate-700 transition-colors flex flex-col justify-between">
          <span className="text-slate-400 dark:text-slate-500 font-bold block text-[11px]">
            {t('card.escrowIdLabel', 'معرّف الضمان المالي')}
          </span>
          <div className="flex items-center justify-between gap-2">
            <span className="font-mono font-bold text-slate-800 dark:text-slate-200 text-xs truncate" dir="ltr">
              {formattedId}
            </span>
            <button
              type="button"
              onClick={handleCopyId}
              title={cleanId}
              className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-white dark:bg-slate-700/80 text-slate-600 dark:text-slate-300 hover:text-amber-600 dark:hover:text-amber-400 border border-slate-200 dark:border-slate-600 text-[10px] font-bold transition-all cursor-pointer shadow-2xs hover:scale-105 active:scale-95 shrink-0"
            >
              {copiedId ? (
                <>
                  <Check className="w-3 h-3 text-emerald-500" />
                  <span className="text-emerald-600 dark:text-emerald-400">{t('card.copied', 'تم النسخ')}</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span>{t('common:actions.copy', 'نسخ')}</span>
                </>
              )}
            </button>
          </div>
          <span className="text-[10px] text-slate-400 dark:text-slate-500 block font-medium">
            {t('detail.escrowAuctionProtected', 'حساب وسيط محمي')}
          </span>
        </div>

        {/* 2. Creation Date */}
        <div className="p-4 rounded-2xl bg-slate-50/90 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-1.5 hover:border-slate-200 dark:hover:border-slate-700 transition-colors flex flex-col justify-between">
          <span className="text-slate-400 dark:text-slate-500 font-bold block text-[11px]">
            {t('detail.createdAtLabel', 'تاريخ بدء الضمان')}
          </span>
          <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200">
            <Calendar className="w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0" />
            <span className="truncate">{formattedCreatedAt}</span>
          </div>
          <span className="text-[10px] text-slate-400 dark:text-slate-500 block font-medium">
            {isRTL ? 'بدء سريان الحجز المالي' : 'Escrow holding initiated'}
          </span>
        </div>

        {/* 3. Inspection Deadline */}
        <div className="p-4 rounded-2xl bg-slate-50/90 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-1.5 hover:border-slate-200 dark:hover:border-slate-700 transition-colors flex flex-col justify-between">
          <span className="text-slate-400 dark:text-slate-500 font-bold block text-[11px]">
            {t('detail.inspectionDeadlineLabel', 'مهلة المعاينة المحددة')}
          </span>
          <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200">
            <Clock className="w-4 h-4 text-amber-500 shrink-0" />
            <span className="truncate">{formattedEndsAt}</span>
          </div>
          <span className="text-[10px] text-slate-400 dark:text-slate-500 block font-medium">
            ({toLocalizedDigits(inspectionDays, isRTL)} {t('inspection.units.days', 'أيام')} {isRTL ? 'معاينة وفحص' : 'inspection window'})
          </span>
        </div>

        {/* 4. Wallet Financial Settlement */}
        <div className="p-4 rounded-2xl bg-slate-50/90 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-1.5 hover:border-slate-200 dark:hover:border-slate-700 transition-colors flex flex-col justify-between">
          <span className="text-slate-400 dark:text-slate-500 font-bold block text-[11px]">
            {t('detail.walletSettlementLabel', isRTL ? 'التسوية بالمحفظة' : 'Wallet Settlement')}
          </span>
          <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200">
            {escrow.status === 'RELEASED' && (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span className="truncate text-emerald-700 dark:text-emerald-300">
                  {t('detail.settlementReleased', isRTL ? 'تم الإيداع للبائع' : 'Released to Seller')}
                </span>
              </>
            )}
            {escrow.status === 'REFUNDED' && (
              <>
                <RotateCcw className="w-4 h-4 text-blue-500 shrink-0" />
                <span className="truncate text-blue-700 dark:text-blue-300">
                  {t('detail.settlementRefunded', isRTL ? 'تم رد الرصيد للمشتري' : 'Refunded to Buyer')}
                </span>
              </>
            )}
            {escrow.status === 'DISPUTED' && (
              <>
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                <span className="truncate text-rose-700 dark:text-rose-300">
                  {t('detail.settlementDisputed', isRTL ? 'معلّقة قيد النزاع' : 'Frozen Pending Dispute')}
                </span>
              </>
            )}
            {escrow.status === 'HELD' && (
              <>
                <Lock className="w-4 h-4 text-amber-500 shrink-0" />
                <span className="truncate text-amber-700 dark:text-amber-300">
                  {t('detail.settlementHeld', isRTL ? 'محتجز بخزنة الضمان' : 'Held in Escrow Vault')}
                </span>
              </>
            )}
          </div>
          <button
            type="button"
            onClick={() => setIsTxModalOpen(true)}
            className="group/tx inline-flex items-center gap-1.5 text-[10px] font-bold text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 hover:underline cursor-pointer select-none text-start"
          >
            <FileText className="w-3 h-3 text-amber-500 shrink-0" />
            <span>{t('detail.viewTransactionDetails', isRTL ? 'عرض تفاصيل المعاملة' : 'View Transaction Details')}</span>
            <ExternalLink className="w-2.5 h-2.5 transition-transform group-hover/tx:scale-110 shrink-0" />
          </button>
        </div>
      </div>

      {/* 3. Conditional Status Callouts */}
      {escrow.status === 'RELEASED' && (
        <div className="rounded-2xl p-4 bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 space-y-2">
          <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-black text-xs sm:text-sm">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>{t('detail.releasedTitle', 'تم تحرير مبلغ الضمان للبائع')}</span>
          </div>
          {formattedReleasedAt && (
            <div className="text-xs text-emerald-700/90 dark:text-emerald-400 flex items-center gap-1.5">
              <span>{t('detail.releasedAtLabel', 'تاريخ التحرير:')}</span>
              <span className="font-bold">{formattedReleasedAt}</span>
            </div>
          )}
          {escrow.releaseReason && (
            <div className="text-xs text-emerald-700/80 dark:text-emerald-400/90">
              <span className="font-medium">{t('detail.releaseReasonLabel', 'السبب:')} </span>
              <span className="font-bold">
                {t(`releaseReason.${escrow.releaseReason}`, escrow.releaseReason)}
              </span>
            </div>
          )}
        </div>
      )}

      {escrow.status === 'REFUNDED' && (
        <div className="rounded-2xl p-4 bg-blue-50/80 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/60 space-y-2">
          <div className="flex items-center gap-2 text-blue-800 dark:text-blue-300 font-black text-xs sm:text-sm">
            <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
            <span>{t('detail.refundedTitle', 'تم استرداد المبلغ للمشتري')}</span>
          </div>
          {formattedRefundedAt && (
            <div className="text-xs text-blue-700/90 dark:text-blue-400 flex items-center gap-1.5">
              <span>{t('detail.refundedAtLabel', 'تاريخ الاسترداد:')}</span>
              <span className="font-bold">{formattedRefundedAt}</span>
            </div>
          )}
        </div>
      )}

      {escrow.status === 'DISPUTED' && escrow.disputeId && (
        <div className="rounded-2xl p-4 bg-rose-50/80 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-rose-800 dark:text-rose-300 font-black text-xs sm:text-sm">
              <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
              <span>{t('detail.disputeActiveTitle', 'يوجد نزاع مالي مفتوح')}</span>
            </div>
            <p className="text-xs text-rose-700/80 dark:text-rose-400">
              {t(
                'detail.disputeActiveDesc',
                'المعاملة قيد المراجعة والتحقيق من قبل إدارة مزادك للبت في قرار التسوية.'
              )}
            </p>
          </div>

          <Link
            to={ROUTES.DISPUTE_DETAIL(escrow.disputeId)}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black bg-rose-600 hover:bg-rose-700 text-white transition-colors shrink-0 shadow-sm"
          >
            <span>{t('detail.viewDisputeDetails', 'عرض تفاصيل النزاع')}</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* 4. Interactive Transaction Details Modal */}
      <TransactionDetailsModal
        transaction={activeTransaction}
        isOpen={isTxModalOpen}
        onClose={() => setIsTxModalOpen(false)}
      />
    </div>
  );
};





