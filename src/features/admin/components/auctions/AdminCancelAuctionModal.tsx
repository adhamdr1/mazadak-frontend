import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertTriangle, AlertCircle, Ban, Package, Loader2 } from 'lucide-react';
import { Modal } from '@/components/common/Modal';
import { toLocalizedDigits } from '@/utils/formatters';
import {
  adminCancelAuctionSchema,
  type AdminCancelAuctionFormData,
} from '../../schemas/adminCancelAuction.schema';
import {
  formatAdminCurrency,
  getAuctionStatusBadge,
  getAuctionCategoryLabel,
} from '../../utils/admin.utils';
import type { Auction } from '../../types/admin.types';

export interface AdminCancelAuctionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => Promise<void>;
  isLoading: boolean;
  auction?: Auction | null;
}

export const AdminCancelAuctionModal: React.FC<AdminCancelAuctionModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isLoading,
  auction,
}) => {
  const { t, i18n } = useTranslation(['admin', 'common']);
  const isRTL = i18n.language?.startsWith('ar');

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<AdminCancelAuctionFormData>({
    resolver: zodResolver(adminCancelAuctionSchema),
    defaultValues: {
      reason: '',
    },
  });

  useEffect(() => {
    if (isOpen) {
      reset({ reason: '' });
    }
  }, [isOpen, reset]);

  const currentReason = watch('reason') || '';
  const trimmedLen = currentReason.trim().length;
  const isReasonValid = trimmedLen >= 10;

  const onSubmit = async (data: AdminCancelAuctionFormData) => {
    await onConfirm(data.reason);
  };

  if (!auction) return null;

  const statusBadge = getAuctionStatusBadge(auction.status, isRTL);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('auctions.cancelModal.title', { defaultValue: isRTL ? 'إلغاء المزاد إدارياً' : 'Cancel Auction Administratively' })}
      size="md"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-1">
        {/* 1. Consequence & Automatic Refund Notice Banner */}
        <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-300">
          <div className="w-9 h-9 rounded-xl bg-rose-500/20 flex items-center justify-center text-rose-600 dark:text-rose-400 shrink-0">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div className="min-w-0 space-y-0.5">
            <h4 className="font-bold text-xs sm:text-sm text-rose-700 dark:text-rose-300">
              {t('auctions.cancelModal.warningTitle', {
                defaultValue: isRTL ? 'إجراء إداري نهائي وغير قابل للتراجع' : 'Final Administrative Action (Irreversible)',
              })}
            </h4>
            <p className="text-[11px] sm:text-xs leading-relaxed text-rose-600/90 dark:text-rose-400/90">
              {t('auctions.cancelModal.warningDesc', {
                defaultValue: isRTL
                  ? 'سيتم إيقاف المزاد فوراً وإلغاؤه، وإعادة كامل مبالغ حجز المزايدات إلى محافظ المزايدين تلقائياً بواسطة النظام.'
                  : 'This action will immediately terminate the auction and automatically refund all held bidder amounts back to their respective wallets.',
              })}
            </p>
          </div>
        </div>

        {/* 2. Target Auction Summary Card (Refactored Clean, Modern Layout) */}
        <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 space-y-3">
          <div className="flex items-center gap-3.5 min-w-0">
            {auction.images && auction.images.length > 0 ? (
              <img
                src={auction.images[0]}
                alt={auction.title}
                className="w-14 h-14 rounded-xl object-cover border border-slate-200/80 dark:border-slate-700/80 shrink-0 shadow-2xs"
              />
            ) : (
              <div className="w-14 h-14 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 shrink-0">
                <Package className="w-6 h-6" />
              </div>
            )}

            <div className="min-w-0 flex-1 space-y-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 bg-slate-200/60 dark:bg-slate-700/60 px-1.5 py-0.5 rounded font-semibold">
                  #{auction._id.slice(-8)}
                </span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-200/50 dark:bg-slate-700/50 text-slate-700 dark:text-slate-300">
                  {getAuctionCategoryLabel(auction.category, isRTL)}
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${statusBadge.bgClass}`}>
                  {statusBadge.label}
                </span>
              </div>

              <h5 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white truncate" title={auction.title}>
                {auction.title}
              </h5>
            </div>
          </div>

          {/* Metric Row: Current Price with Elegant, Clean Styling - NO Dollar Sign! */}
          <div className="flex items-center justify-between pt-2.5 border-t border-slate-200/60 dark:border-slate-700/60 text-xs">
            <span className="text-slate-500 dark:text-slate-400 font-medium">
              {t('auctions.cancelModal.currentPriceLabel', {
                defaultValue: isRTL ? 'السعر الحالي:' : 'Current Price:',
              })}
            </span>
            <span className="font-bold text-slate-900 dark:text-white text-sm font-mono">
              {formatAdminCurrency(auction.currentPrice, undefined, isRTL)}
            </span>
          </div>
        </div>

        {/* 3. Reason Textarea with Red Asterisk and Localized Character Counter */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label
              htmlFor="cancel-auction-reason"
              className="inline-flex items-center text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300"
            >
              <span>
                {t('auctions.cancelModal.reasonLabel', {
                  defaultValue: isRTL ? 'سبب الإلغاء التوثيقي' : 'Audit Cancellation Reason',
                })}
              </span>
              <span className="text-rose-500 font-bold ms-1" title={isRTL ? 'مطلوب' : 'Required'}>
                *
              </span>
            </label>

            {/* Localized Character Counter */}
            <span
              className={`text-xs font-mono font-medium transition-colors ${
                isReasonValid
                  ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                  : 'text-slate-400 dark:text-slate-500'
              }`}
            >
              {isReasonValid
                ? (isRTL
                    ? `✓ ${toLocalizedDigits(trimmedLen, true)} أحرف`
                    : `✓ ${trimmedLen} chars`)
                : (isRTL
                    ? `${toLocalizedDigits(trimmedLen, true)} / ${toLocalizedDigits(10, true)} أحرف كحد أدنى`
                    : `${trimmedLen} / 10 chars min`)}
            </span>
          </div>

          <textarea
            id="cancel-auction-reason"
            {...register('reason')}
            rows={3}
            dir={isRTL ? 'rtl' : 'ltr'}
            placeholder={t('auctions.cancelModal.reasonPlaceholder', {
              defaultValue: isRTL
                ? 'اكتب سبباً توضيحياً مفصلاً لإلغاء هذا المزاد (مخالفة الشروط، سلع محظورة، نزاع قانوني...)'
                : 'Provide a detailed rationale for audit records (terms violation, restricted item, legal inquiry...)',
            })}
            className={`w-full px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm transition-all focus:outline-none focus:ring-2 resize-none ${
              errors.reason
                ? 'border-rose-500/60 bg-rose-500/5 focus:ring-rose-500/30'
                : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:border-rose-500 focus:ring-rose-500/20'
            }`}
          />

          {errors.reason && (
            <p className="flex items-center gap-1.5 text-xs text-rose-500 font-medium mt-1">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>
                {t(errors.reason.message || 'validation.reasonMinLength', {
                  defaultValue: isRTL
                    ? 'يجب ألا يقل سبب الإلغاء عن 10 أحرف للتوثيق الإداري.'
                    : 'Cancellation reason must be at least 10 characters for audit trail.',
                })}
              </span>
            </p>
          )}
        </div>

        {/* 4. Action Buttons (Refactored Clean, Modern Layout) */}
        <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-2.5 pt-3.5 border-t border-slate-200/80 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="w-full sm:w-auto px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/60 transition-colors cursor-pointer shadow-2xs outline-none"
          >
            {t('common:actions.cancel', { defaultValue: isRTL ? 'تراجع' : 'Cancel' })}
          </button>

          <button
            type="submit"
            disabled={isLoading || !isReasonValid}
            className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2 rounded-xl text-xs font-bold transition-all shadow-2xs outline-none ${
              isLoading || !isReasonValid
                ? 'bg-rose-500/20 text-rose-400/60 dark:text-rose-400/40 cursor-not-allowed border border-rose-500/20'
                : 'bg-rose-600 hover:bg-rose-700 text-white cursor-pointer shadow-rose-600/20 shadow-md active:scale-[0.98]'
            }`}
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin shrink-0" />
            ) : (
              <Ban className="w-4 h-4 shrink-0" />
            )}
            <span>
              {t('auctions.cancelModal.confirmButton', {
                defaultValue: isRTL ? 'تأكيد إلغاء المزاد' : 'Confirm Auction Cancellation',
              })}
            </span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
