import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import {
  XCircle,
  AlertTriangle,
  RefreshCw,
  AlertCircle,
  RotateCcw,
} from 'lucide-react';
import { Modal } from '@/components/common/Modal';
import { AutoResizeTextarea } from '@/components/common/AutoResizeTextarea';
import { formatAdminCurrency, isArabicText } from '../../utils/admin.utils';
import {
  adminRejectWithdrawalSchema,
  type AdminRejectWithdrawalFormData,
} from '../../schemas/adminRejectWithdrawal.schema';
import type { WithdrawalResponse, AdminRejectWithdrawalInput } from '../../types/admin.types';
import { cn } from '@/utils/cn';

export interface RejectWithdrawalModalProps {
  isOpen: boolean;
  onClose: () => void;
  withdrawal: WithdrawalResponse | null;
  onReject: (input: AdminRejectWithdrawalInput) => Promise<unknown>;
  isLoading: boolean;
}

export const RejectWithdrawalModal: React.FC<RejectWithdrawalModalProps> = ({
  isOpen,
  onClose,
  withdrawal,
  onReject,
  isLoading,
}) => {
  const { t, i18n } = useTranslation(['admin', 'common']);
  const isRTL = i18n.language?.startsWith('ar');

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<AdminRejectWithdrawalFormData>({
    resolver: zodResolver(adminRejectWithdrawalSchema),
    defaultValues: {
      rejectionReason: '',
    },
  });

  const enteredReason = watch('rejectionReason') || '';
  const reasonDir = isArabicText(enteredReason) ? 'rtl' : isRTL ? 'rtl' : 'ltr';

  useEffect(() => {
    if (isOpen) {
      reset({ rejectionReason: '' });
    }
  }, [isOpen, reset, withdrawal]);

  const onSubmit = async (data: AdminRejectWithdrawalFormData) => {
    if (!withdrawal) return;
    try {
      await onReject({
        withdrawalId: withdrawal._id,
        rejectionReason: data.rejectionReason.trim(),
      });
      onClose();
    } catch {
      // Error handled in hook
    }
  };

  if (!withdrawal) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="md"
      title={
        <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400">
          <XCircle className="w-5 h-5 shrink-0" />
          <span className="font-black text-slate-900 dark:text-white">
            {t('financials.withdrawals.rejectModal.title', {
              defaultValue: 'رفض طلب السحب المالي',
            })}
          </span>
        </div>
      }
      description={
        <span className="text-xs text-slate-500 dark:text-slate-400">
          {isRTL
            ? 'سيتم رفض الطلب وإلغاء عملية الصرف، مع إعادة كامل المبلغ المحجوز ورسوم السحب إلى محفظة المستخدم فوراً.'
            : 'Reject this withdrawal request and immediately return the held amount and fees back to user wallet.'}
        </span>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
        {/* Warning Notice Banner */}
        <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-300 flex items-start gap-2.5 text-xs">
          <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold">
              {t('financials.withdrawals.rejectModal.warning', {
                defaultValue:
                  'سيتم إعادة المبلغ والرسوم المقتطعة إلى محفظة المستخدم فوراً مع إرسال إشعار بسبب الرفض.',
              })}
            </p>
            <p className="text-[11px] opacity-90 flex items-center gap-1">
              <RotateCcw className="w-3 h-3 shrink-0" />
              <span>
                {isRTL ? 'المبلغ المسترد للمحفظة:' : 'Refunded amount:'}{' '}
                <strong>{formatAdminCurrency(withdrawal.amount, withdrawal.currency, isRTL)}</strong>
              </span>
            </p>
          </div>
        </div>

        {/* Textarea Reason */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-black text-slate-800 dark:text-slate-200">
              {t('financials.withdrawals.rejectModal.reasonLabel', {
                defaultValue: 'سبب الرفض الإداري (10 أحرف على الأقل) *',
              })}
            </label>
            <span
              className={cn(
                'text-[10px] font-bold',
                enteredReason.trim().length >= 10
                  ? 'text-emerald-500'
                  : 'text-amber-500'
              )}
            >
              {enteredReason.trim().length}/500 {isRTL ? 'حرف' : 'chars'}
            </span>
          </div>

          <AutoResizeTextarea
            {...register('rejectionReason')}
            minRows={3}
            maxRows={6}
            dir={reasonDir}
            placeholder={t('financials.withdrawals.rejectModal.reasonPlaceholder', {
              defaultValue: 'يرجى كتابة سبب واضح ومفصل لرفض الطلب (10 أحرف على الأقل)...',
            })}
            disabled={isLoading}
            className={cn(
              'w-full px-3.5 py-2.5 rounded-xl text-sm font-medium border transition-all duration-200',
              'bg-white dark:bg-slate-900 text-slate-900 dark:text-white',
              'border-slate-200/80 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500',
              errors.rejectionReason && 'border-rose-500 focus:ring-rose-500/20 focus:border-rose-500'
            )}
          />

          {errors.rejectionReason && (
            <p className="text-xs font-bold text-rose-500 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>
                {t(errors.rejectionReason.message || '', {
                  defaultValue: 'سبب الرفض إلزامي ويجب ألا يقل عن 10 أحرف',
                })}
              </span>
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-200/80 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            {t('common.cancel', { defaultValue: 'إلغاء' })}
          </button>

          <button
            type="submit"
            disabled={isLoading || enteredReason.trim().length < 10}
            className={cn(
              'inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white shadow-md transition-all duration-200',
              'bg-rose-600 hover:bg-rose-500 active:scale-95 disabled:opacity-50 disabled:pointer-events-none'
            )}
          >
            {isLoading && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
            <span>
              {t('financials.withdrawals.rejectModal.confirmButton', {
                defaultValue: 'تأكيد الرفض وإرجاع الرصيد',
              })}
            </span>
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default RejectWithdrawalModal;
