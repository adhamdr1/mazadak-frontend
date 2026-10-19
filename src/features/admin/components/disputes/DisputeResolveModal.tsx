import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import {
  Scale,
  RotateCcw,
  ArrowUpRight,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  ExternalLink,
  Coins,
} from 'lucide-react';
import { Modal } from '@/components/common/Modal';
import { AutoResizeTextarea } from '@/components/common/AutoResizeTextarea';
import { ROUTES } from '@/constants/routes.constants';
import { useEscrowDetail } from '@/features/escrow';
import {
  adminResolveDisputeSchema,
  type AdminResolveDisputeFormData,
} from '../../schemas/adminResolveDispute.schema';
import {
  formatAdminCurrency,
  getDisputeReasonLabel,
} from '../../utils/admin.utils';
import type { DisputeData, ResolveDisputeInput } from '../../types/admin.types';

export interface DisputeResolveModalProps {
  isOpen: boolean;
  onClose: () => void;
  dispute: DisputeData | null;
  onResolve: (input: ResolveDisputeInput) => Promise<void>;
  isLoading: boolean;
}

export const DisputeResolveModal: React.FC<DisputeResolveModalProps> = ({
  isOpen,
  onClose,
  dispute,
  onResolve,
  isLoading,
}) => {
  const { t, i18n } = useTranslation(['admin', 'common']);
  const isRTL = i18n.language?.startsWith('ar');

  const { escrow } = useEscrowDetail(dispute?.escrowId);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<AdminResolveDisputeFormData>({
    resolver: zodResolver(adminResolveDisputeSchema),
    defaultValues: {
      decision: 'REFUND_BUYER',
      adminNotes: '',
    },
  });

  const selectedDecision = watch('decision');
  const adminNotesValue = watch('adminNotes') || '';

  const handleClose = React.useCallback(() => {
    reset();
    onClose();
  }, [reset, onClose]);

  const onSubmit = async (data: AdminResolveDisputeFormData) => {
    if (!dispute) return;
    try {
      await onResolve({
        disputeId: dispute._id,
        decision: data.decision,
        adminNotes: data.adminNotes?.trim() || undefined,
      });
      handleClose();
    } catch {
      // Error handled by parent hook
    }
  };

  if (!dispute) return null;

  const formattedAmount = escrow?.amount
    ? formatAdminCurrency(escrow.amount, escrow.currency, isRTL)
    : undefined;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={
        <div className="flex items-center gap-2">
          <Scale className="w-4 h-4 text-amber-500 shrink-0" />
          <span className="font-bold text-sm sm:text-base text-slate-900 dark:text-slate-100">
            {t('disputes.resolveModal.title', {
              defaultValue: isRTL ? 'فض النزاع وإصدار القرار الإداري' : 'Resolve Dispute & Issue Ruling',
            })}
          </span>
          <span className="text-[11px] font-mono text-slate-400 ms-auto font-normal">
            <bdi dir="ltr">#{dispute._id.slice(-6).toUpperCase()}</bdi>
          </span>
        </div>
      }
      size="lg"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        {/* 1. Compact Case Info Bar */}
        <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-800 text-xs space-y-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-slate-400">
                {t('disputes.resolveModal.auction', { defaultValue: isRTL ? 'المزاد:' : 'Auction:' })}
              </span>
              <Link
                to={ROUTES.AUCTION_DETAIL(dispute.auctionId)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 font-bold text-amber-600 dark:text-amber-400 hover:underline"
              >
                <span>{escrow?.auction?.title || `#${dispute.auctionId.slice(-6).toUpperCase()}`}</span>
                <ExternalLink className="w-3 h-3 shrink-0" />
              </Link>
              <span className="text-slate-300 dark:text-slate-700">•</span>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                {getDisputeReasonLabel(dispute.reason, isRTL)}
              </span>
            </div>

            {/* Escrow Amount Pill */}
            {formattedAmount && (
              <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-700 dark:text-amber-300 font-bold text-xs font-mono">
                <Coins className="w-3.5 h-3.5 text-amber-500" />
                <span>{formattedAmount}</span>
              </div>
            )}
          </div>

          {dispute.description && (
            <p
              className="text-[11px] text-slate-600 dark:text-slate-400 truncate max-w-full font-normal border-t border-slate-200/50 dark:border-slate-700/40 pt-1"
              title={dispute.description}
            >
              <span className="font-semibold text-slate-700 dark:text-slate-300 me-1">
                {t('disputes.resolveModal.claimantStatement', { defaultValue: isRTL ? 'الشكوى:' : 'Claim:' })}
              </span>
              "{dispute.description}"
            </p>
          )}
        </div>

        {/* 2. Compact Decision Cards */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200">
            {t('disputes.resolveModal.decisionPrompt', {
              defaultValue: isRTL ? 'حدد القرار الإداري النهائي:' : 'Select administrative ruling:',
            })}
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {/* Card 1: Refund Buyer */}
            <div
              onClick={() => setValue('decision', 'REFUND_BUYER')}
              className={`p-3 rounded-xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                selectedDecision === 'REFUND_BUYER'
                  ? 'border-blue-500 bg-blue-50/70 dark:bg-blue-950/30 ring-1 ring-blue-500/20'
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-blue-500/15 text-blue-600 dark:text-blue-400 shrink-0">
                    <RotateCcw className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-slate-900 dark:text-slate-100">
                      {t('disputes.resolveModal.refundBuyer', { defaultValue: isRTL ? 'رد المبلغ للمشتري' : 'Refund Buyer' })}
                    </h4>
                    <span className="text-[10px] text-blue-600 dark:text-blue-400 font-medium">
                      {t('disputes.resolveModal.refundBuyerTag', { defaultValue: isRTL ? 'إيداع بمحفظة المشتري' : 'Credit Buyer Wallet' })}
                    </span>
                  </div>
                </div>
                {selectedDecision === 'REFUND_BUYER' && (
                  <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0" />
                )}
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-2 leading-snug">
                {t('disputes.resolveModal.refundBuyerHelp', {
                  defaultValue: isRTL
                    ? 'إرجاع أموال الضمان بالكامل للمشتري فورياً وإغلاق النزاع.'
                    : 'Held escrow funds will be refunded to buyer and dispute closed.',
                })}
              </p>
            </div>

            {/* Card 2: Pay Seller */}
            <div
              onClick={() => setValue('decision', 'PAY_SELLER')}
              className={`p-3 rounded-xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                selectedDecision === 'PAY_SELLER'
                  ? 'border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/30 ring-1 ring-emerald-500/20'
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 shrink-0">
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-slate-900 dark:text-slate-100">
                      {t('disputes.resolveModal.paySeller', { defaultValue: isRTL ? 'صرف المبلغ للبائع' : 'Pay Seller' })}
                    </h4>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                      {t('disputes.resolveModal.paySellerTag', { defaultValue: isRTL ? 'صرف لمحفظة البائع' : 'Credit Seller Wallet' })}
                    </span>
                  </div>
                </div>
                {selectedDecision === 'PAY_SELLER' && (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                )}
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-2 leading-snug">
                {t('disputes.resolveModal.paySellerHelp', {
                  defaultValue: isRTL
                    ? 'فك حجز الضمان وتحويل الأرباح للبائع فورياً وإغلاق النزاع.'
                    : 'Held escrow funds will be released to seller and dispute closed.',
                })}
              </p>
            </div>
          </div>

          {errors.decision && (
            <p className="text-xs text-rose-500 font-medium">
              {t(errors.decision.message as string, {
                defaultValue: isRTL ? 'يرجى اختيار القرار الإداري' : 'Please select an administrative ruling',
              })}
            </p>
          )}
        </div>

        {/* 3. Compact Admin Notes */}
        <div className="space-y-1">
          <div className="flex justify-between items-center text-xs">
            <label className="font-semibold text-slate-800 dark:text-slate-200">
              {t('disputes.resolveModal.notesLabel', {
                defaultValue: isRTL ? 'ملاحظات الإدارة التوثيقية (اختياري):' : 'Audit Notes (Optional):',
              })}
            </label>
            <span className="text-[10px] text-slate-400 font-mono">
              {adminNotesValue.length}/500
            </span>
          </div>
          <AutoResizeTextarea
            {...register('adminNotes')}
            placeholder={t('disputes.resolveModal.notesPlaceholder', {
              defaultValue: isRTL
                ? 'أسباب اتخاذ القرار ونتائج مراجعة الأدلة (تظهر للمستخدمين وفي كشف الحساب)...'
                : 'Reasoning and evidence findings for audit log...',
            })}
            rows={2}
            maxRows={4}
            className="w-full text-xs"
          />
          {errors.adminNotes && (
            <p className="text-xs text-rose-500 font-medium">
              {t(errors.adminNotes.message as string, {
                defaultValue: isRTL ? 'الملاحظات أطول من المسموح به' : 'Notes cannot exceed 500 characters',
              })}
            </p>
          )}
        </div>

        {/* 4. Compact 1-line Warning */}
        <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center gap-2 text-[11px] text-amber-700 dark:text-amber-300">
          <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
          <span className="leading-tight">
            {t('disputes.resolveModal.irreversibleWarning', {
              defaultValue: isRTL
                ? 'تنبيه: قرار نهائي يترتب عليه تحويل مالي فوري بين المحافظ وتحديث سجلات الضمان.'
                : 'Warning: Final ruling that executes immediate wallet transfers and updates escrow.',
            })}
          </span>
        </div>

        {/* 5. Compact Modal Footer */}
        <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={handleClose}
            disabled={isLoading}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold cursor-pointer disabled:opacity-50 transition-colors"
          >
            {t('common:actions.cancel', { defaultValue: isRTL ? 'إلغاء' : 'Cancel' })}
          </button>

          <button
            type="submit"
            disabled={isLoading}
            className={`px-4 py-2 font-bold rounded-xl text-xs shadow-xs cursor-pointer disabled:opacity-50 flex items-center gap-1.5 transition-all ${
              selectedDecision === 'REFUND_BUYER'
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white'
            }`}
          >
            {isLoading ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : selectedDecision === 'REFUND_BUYER' ? (
              <RotateCcw className="w-3.5 h-3.5" />
            ) : (
              <ArrowUpRight className="w-3.5 h-3.5" />
            )}
            <span>
              {selectedDecision === 'REFUND_BUYER'
                ? `${t('disputes.resolveModal.confirmRefundBtn', { defaultValue: isRTL ? 'تأكيد رد المبلغ للمشتري' : 'Confirm Refund to Buyer' })}${formattedAmount ? ` (${formattedAmount})` : ''}`
                : `${t('disputes.resolveModal.confirmPayoutBtn', { defaultValue: isRTL ? 'تأكيد صرف الأرباح للبائع' : 'Confirm Payout to Seller' })}${formattedAmount ? ` (${formattedAmount})` : ''}`}
            </span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
