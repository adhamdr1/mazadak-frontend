import React, { useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { PlusCircle, MinusCircle, AlertCircle, ArrowRight, ArrowLeft } from 'lucide-react';
import { Modal } from '@/components/common/Modal';
import { Button } from '@/components/common/Button';
import { toLocalizedDigits, normalizeArabicDigits } from '@/utils/formatters';
import { formatAdminCurrency, formatAdminNumber } from '../../utils/admin.utils';
import { adminAdjustBalanceSchema, type AdminAdjustBalanceFormData } from '../../schemas/adminAdjustBalance.schema';
import { useAdminAdjustBalance } from '../../hooks/useAdminAdjustBalance';
import { useAdminUserDetails } from '../../hooks/useAdminUserDetails';
import type { User } from '../../types/admin.types';

export interface AdjustBalanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  currentBalance?: number | string;
  onSuccess?: () => void;
}

export const AdjustBalanceModal: React.FC<AdjustBalanceModalProps> = ({
  isOpen,
  onClose,
  user,
  currentBalance = 0,
  onSuccess,
}) => {
  const { t, i18n } = useTranslation(['admin', 'common']);
  const isRTL = i18n.language?.startsWith('ar');
  const { mutate: adjustBalance, isPending } = useAdminAdjustBalance();

  // Fetch live user wallet details to ensure the balance is always accurate even when opened from the table
  const { data: userDetails, isLoading: isDetailsLoading } = useAdminUserDetails(
    isOpen && user ? user._id : null
  );

  const rawBalance = userDetails?.wallet?.balance ?? currentBalance ?? 0;

  const numCurrentBalance = useMemo(() => {
    const val = typeof rawBalance === 'string' ? parseFloat(rawBalance) : rawBalance;
    return isNaN(val) ? 0 : val;
  }, [rawBalance]);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<AdminAdjustBalanceFormData>({
    resolver: zodResolver(adminAdjustBalanceSchema),
    defaultValues: {
      amount: 100,
      type: 'CREDIT',
      reason: '',
    },
  });

  const selectedType = watch('type');
  const enteredAmount = watch('amount');
  const enteredReason = watch('reason') || '';

  // Localized display value for the amount input
  const [displayAmount, setDisplayAmount] = useState<string>(() => toLocalizedDigits(100, isRTL));

  // Reset form and display amount when modal opens or language switches
  useEffect(() => {
    if (isOpen) {
      setDisplayAmount(toLocalizedDigits(100, isRTL));
      reset({
        amount: 100,
        type: 'CREDIT',
        reason: '',
      });
    }
  }, [isOpen, isRTL, reset]);

  // Handle typing in the amount input with automatic Arabic/Western digits support
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const ascii = normalizeArabicDigits(raw).replace(/[^0-9.]/g, '');
    const parts = ascii.split('.');
    const cleanAscii = parts.length > 2 ? `${parts[0]}.${parts.slice(1).join('')}` : ascii;

    const localized = toLocalizedDigits(cleanAscii, isRTL);
    setDisplayAmount(localized);

    const parsed = parseFloat(cleanAscii);
    setValue('amount', isNaN(parsed) ? 0 : parsed, { shouldValidate: true });
  };

  // Parse entered amount robustly whether it is a number or string
  const numericAmount = useMemo(() => {
    if (typeof enteredAmount === 'number') {
      return isNaN(enteredAmount) ? 0 : enteredAmount;
    }
    const parsed = parseFloat(String(enteredAmount || '0'));
    return isNaN(parsed) ? 0 : parsed;
  }, [enteredAmount]);

  // Projected new balance calculation
  const projectedBalance = useMemo(() => {
    if (selectedType === 'CREDIT') {
      return numCurrentBalance + numericAmount;
    }
    return Math.max(0, numCurrentBalance - numericAmount);
  }, [numCurrentBalance, numericAmount, selectedType]);

  const isExceeding = useMemo(() => {
    return selectedType === 'DEBIT' && numericAmount > numCurrentBalance;
  }, [numericAmount, selectedType, numCurrentBalance]);

  const onSubmit = (data: AdminAdjustBalanceFormData) => {
    if (!user) return;
    const finalAmount = typeof data.amount === 'number' && !isNaN(data.amount) ? data.amount : numericAmount;
    if (finalAmount <= 0) return;

    adjustBalance(
      {
        userId: user._id,
        amount: finalAmount,
        type: data.type,
        reason: data.reason.trim(),
      },
      {
        onSuccess: () => {
          onClose();
          onSuccess?.();
        },
      }
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('users.adjustModal.title', { defaultValue: 'تسوية رصيد المستخدم' })}
      size="md"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 py-2">
        {/* User Card & Current Balance Banner */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {t('users.table.user', { defaultValue: 'المستخدم' })}
            </p>
            <p className="font-black text-sm text-slate-900 dark:text-white mt-0.5">
              {user ? `${user.firstName} ${user.lastName}` : '—'}
            </p>
            <p className="text-[11px] font-mono text-slate-400 mt-0.5">{user?.email}</p>
          </div>

          <div className="text-end">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {t('users.adjustModal.currentBalance', { defaultValue: 'الرصيد الحالي' })}
            </p>
            {isDetailsLoading && !currentBalance ? (
              <div className="h-5 w-20 bg-slate-200 dark:bg-slate-700 animate-pulse rounded mt-1 ms-auto" />
            ) : (
              <p className="font-black text-base text-slate-900 dark:text-white mt-0.5 font-mono">
                {formatAdminCurrency(numCurrentBalance, undefined, isRTL)}
              </p>
            )}
          </div>
        </div>

        {/* Operation Type Switcher */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
            {t('users.adjustModal.typeLabel', { defaultValue: 'نوع التسوية المالية' })}
          </label>
          <div className="grid grid-cols-2 gap-3">
            {/* Credit Button */}
            <button
              type="button"
              onClick={() => setValue('type', 'CREDIT', { shouldValidate: true })}
              className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl border text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                selectedType === 'CREDIT'
                  ? 'bg-emerald-500/15 border-emerald-500 text-emerald-600 dark:text-emerald-400 shadow-xs'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <PlusCircle className="w-4 h-4 shrink-0" />
              <span>{t('users.adjustModal.credit', { defaultValue: isRTL ? 'إضافة رصيد' : 'Add Funds' })}</span>
            </button>

            {/* Debit Button */}
            <button
              type="button"
              onClick={() => setValue('type', 'DEBIT', { shouldValidate: true })}
              className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl border text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                selectedType === 'DEBIT'
                  ? 'bg-rose-500/15 border-rose-500 text-rose-600 dark:text-rose-400 shadow-xs'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <MinusCircle className="w-4 h-4 shrink-0" />
              <span>{t('users.adjustModal.debit', { defaultValue: isRTL ? 'خصم رصيد' : 'Deduct Funds' })}</span>
            </button>
          </div>
          {errors.type && <p className="text-[11px] text-rose-500 font-medium">{t(errors.type.message || '')}</p>}
        </div>

        {/* Amount Input */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
            {t('users.adjustModal.amountLabel', {
              defaultValue: isRTL ? 'مبلغ التسوية' : 'Adjustment Amount',
            })}
          </label>
          <div className="relative">
            <input
              type="text"
              inputMode="decimal"
              value={displayAmount}
              onChange={handleAmountChange}
              onBlur={() => {
                if (!displayAmount.trim()) {
                  setDisplayAmount(toLocalizedDigits(0, isRTL));
                  setValue('amount', 0, { shouldValidate: true });
                }
              }}
              placeholder={isRTL ? '١٠٠' : '100'}
              className="w-full px-4 py-2.5 rounded-xl text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-amber-500 dark:focus:border-amber-400 focus:ring-2 focus:ring-amber-500/20 focus:ring-offset-0 outline-none focus:outline-none focus-visible:outline-none transition-colors duration-150 font-mono"
            />
            <span className="absolute inset-y-0 end-3.5 flex items-center text-xs font-bold text-slate-400 pointer-events-none select-none">
              {isRTL ? 'ج.م' : 'EGP'}
            </span>
          </div>
          {errors.amount && (
            <p className="text-[11px] text-rose-500 font-medium">
              {t(errors.amount.message || 'validation.amountInvalid')}
            </p>
          )}
          {isExceeding && (
            <div className="flex items-center gap-1.5 text-[11px] text-amber-600 dark:text-amber-400 bg-amber-500/10 p-2 rounded-lg">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{t('users.adjustModal.debitExceedsWarning', { defaultValue: 'تنبيه: مبلغ الخصم أكبر من الرصيد الحالي للمستخدم.' })}</span>
            </div>
          )}
        </div>

        {/* Projected Impact Card */}
        <div className="p-3.5 rounded-xl bg-gradient-to-r from-slate-100 to-slate-50 dark:from-slate-900 dark:to-slate-800/80 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between text-xs gap-3">
          <div className="space-y-0.5">
            <span className="text-slate-500 dark:text-slate-400 text-[11px]">
              {t('users.adjustModal.projectedBalance', { defaultValue: 'الرصيد بعد التنفيذ' })}
            </span>
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-slate-500 line-through">
                {formatAdminCurrency(numCurrentBalance, undefined, isRTL)}
              </span>
              {isRTL ? <ArrowLeft className="w-3.5 h-3.5 text-amber-500 shrink-0" /> : <ArrowRight className="w-3.5 h-3.5 text-amber-500 shrink-0" />}
              <span
                className={`font-mono font-black text-sm ${
                  selectedType === 'CREDIT'
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-rose-600 dark:text-rose-400'
                }`}
              >
                {formatAdminCurrency(projectedBalance, undefined, isRTL)}
              </span>
            </div>
          </div>

          <span
            className={`px-2.5 py-1 rounded-lg text-[10px] font-black shrink-0 ${
              selectedType === 'CREDIT'
                ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                : 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/20'
            }`}
          >
            {selectedType === 'CREDIT'
              ? `+${formatAdminCurrency(numericAmount, undefined, isRTL)}`
              : `-${formatAdminCurrency(numericAmount, undefined, isRTL)}`}
          </span>
        </div>

        {/* Mandatory Reason Textarea */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between gap-2">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              {t('users.adjustModal.reasonLabel', { defaultValue: 'سبب التسوية الإدارية (إلزامي للتوثيق المالي)' })}
            </label>
            <div className="flex items-center gap-1.5 shrink-0" dir="ltr">
              <span
                className={`text-[10px] font-mono font-bold ${
                  enteredReason.trim().length >= 10 ? 'text-emerald-500' : 'text-slate-400'
                }`}
              >
                {formatAdminNumber(enteredReason.trim().length, isRTL)} / {formatAdminNumber(10, isRTL)}
              </span>
              <span className="text-[10px] text-slate-400">
                {t('users.adjustModal.charsMin', { defaultValue: isRTL ? 'أحرف كحد أدنى' : 'chars min' })}
              </span>
            </div>
          </div>
          <textarea
            dir={enteredReason ? 'auto' : (isRTL ? 'rtl' : 'ltr')}
            rows={3}
            placeholder={t('users.adjustModal.reasonPlaceholder', {
              defaultValue: isRTL
                ? 'يرجى كتابة سبب مفصل للتسوية (١٠ أحرف على الأقل)...'
                : 'Provide a detailed audit reason (at least 10 characters)...',
            })}
            {...register('reason')}
            className="w-full px-4 py-2.5 rounded-xl text-xs sm:text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-amber-500 dark:focus:border-amber-400 focus:ring-2 focus:ring-amber-500/20 focus:ring-offset-0 outline-none focus:outline-none focus-visible:outline-none transition-colors duration-150 resize-none text-start placeholder:text-start"
          />
          {errors.reason && (
            <p className="text-[11px] text-rose-500 font-medium">
              {t(errors.reason.message || 'validation.reasonMinLength')}
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <Button type="button" variant="ghost" size="md" onClick={onClose} disabled={isPending}>
            {t('common:cancel', { defaultValue: 'إلغاء' })}
          </Button>

          <Button
            type="submit"
            variant="accent"
            size="md"
            isLoading={isPending}
            disabled={enteredReason.trim().length < 10 || numericAmount <= 0}
            className="font-bold shadow-md shadow-amber-500/20"
          >
            {t('users.adjustModal.submitButton', { defaultValue: 'تأكيد التسوية المالية' })}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default AdjustBalanceModal;
