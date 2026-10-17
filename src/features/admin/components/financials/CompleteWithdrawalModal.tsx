import React, { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import {
  CheckCircle2,
  UploadCloud,
  ExternalLink,
  Building2,
  Smartphone,
  CreditCard,
  AlertCircle,
  Hash,
  Copy,
  Check,
  Banknote,
  Trash2,
  Loader2,
  User,
} from 'lucide-react';
import { Modal } from '@/components/common/Modal';
import { uploadService } from '@/services/api/upload.service';
import {
  formatAdminCurrency,
  formatAdminBankName,
  getPayoutMethodConfig,
} from '../../utils/admin.utils';
import { toLocalizedDigits } from '@/utils/formatters';
import {
  adminCompleteWithdrawalSchema,
  type AdminCompleteWithdrawalFormData,
} from '../../schemas/adminCompleteWithdrawal.schema';
import type { WithdrawalResponse, AdminCompleteWithdrawalInput } from '../../types/admin.types';
import { cn } from '@/utils/cn';

export interface CompleteWithdrawalModalProps {
  isOpen: boolean;
  onClose: () => void;
  withdrawal: WithdrawalResponse | null;
  onComplete: (input: AdminCompleteWithdrawalInput) => Promise<unknown>;
  isLoading: boolean;
}

export const CompleteWithdrawalModal: React.FC<CompleteWithdrawalModalProps> = ({
  isOpen,
  onClose,
  withdrawal,
  onComplete,
  isLoading,
}) => {
  const { t, i18n } = useTranslation(['admin', 'common']);
  const isRTL = i18n.language?.startsWith('ar');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<AdminCompleteWithdrawalFormData>({
    resolver: zodResolver(adminCompleteWithdrawalSchema),
    defaultValues: {
      adminReference: '',
      receiptUrl: '',
    },
  });

  const receiptUrl = watch('receiptUrl');

  // Reset form when modal opens or withdrawal changes
  useEffect(() => {
    if (isOpen) {
      reset({
        adminReference: '',
        receiptUrl: '',
      });
      setUploadError(null);
      setCopiedKey(null);
    }
  }, [isOpen, reset, withdrawal]);

  const handleCopy = (text: string, key: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleImageFile = async (file: File) => {
    setUploadError(null);

    // 1. Validate image format strictly (JPG, PNG, WEBP)
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!validTypes.includes(file.type.toLowerCase())) {
      setUploadError(
        isRTL
          ? 'صيغة الملف غير مدعومة. يُرجى اختيار صورة بصيغة JPG أو PNG أو WebP.'
          : 'Invalid file format. Please upload a JPG, PNG, or WebP image.'
      );
      return;
    }

    // 2. Validate file size (10MB limit matching platform standards)
    if (file.size > 10 * 1024 * 1024) {
      setUploadError(
        isRTL
          ? 'حجم الصورة كبير جداً. الحد الأقصى المسموح به هو 10 ميجابايت.'
          : 'File size too large. Maximum allowed size is 10MB.'
      );
      return;
    }

    try {
      setIsUploadingImage(true);
      // High-speed client-side GPU compression + signed Cloudinary direct upload (fallback: base64 mutation)
      const uploadedUrls = await uploadService.uploadBatchImages([file], 'receipts');
      if (uploadedUrls && uploadedUrls.length > 0) {
        setValue('receiptUrl', uploadedUrls[0], { shouldValidate: true });
        setUploadError(null);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Upload failed';
      setUploadError(
        isRTL
          ? `تعذر رفع صورة الإيصال: ${msg}`
          : `Failed to upload receipt image: ${msg}`
      );
    } finally {
      setIsUploadingImage(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageFile(e.dataTransfer.files[0]);
    }
  };

  const onSubmit = async (data: AdminCompleteWithdrawalFormData) => {
    if (!withdrawal) return;
    try {
      await onComplete({
        withdrawalId: withdrawal._id,
        adminReference: data.adminReference.trim(),
        receiptUrl: data.receiptUrl.trim(),
      });
      onClose();
    } catch {
      // Error handled by mutation hook
    }
  };

  if (!withdrawal) return null;

  const details = withdrawal.payoutDetails;
  const methodConfig = getPayoutMethodConfig(withdrawal.payoutMethod, isRTL);

  // Dynamic Reference Labels & Placeholders tailored to the Payout Method
  const referenceConfig = (() => {
    if (methodConfig.type === 'BANK') {
      return {
        label: isRTL ? 'رقم الحوالة / المرجع المصرفي *' : 'Bank Transfer / Reference Number *',
        placeholder: isRTL ? 'مثال: CIB-TXN-98472918' : 'e.g. CIB-TXN-98472918',
        hint: isRTL
          ? 'الرقم المرجعي الصادر من البنك للتحويل المصرفي لتوثيق العملية وحفظ السجل.'
          : 'Official transaction reference issued by the bank to verify the transfer.',
      };
    }
    if (methodConfig.type === 'INSTAPAY') {
      return {
        label: isRTL ? 'رقم مرجع عملية انستاباي (RRN / Ref) *' : 'InstaPay Reference (RRN / Ref) *',
        placeholder: isRTL ? 'مثال: IPA-REF-849201' : 'e.g. IPA-REF-849201',
        hint: isRTL
          ? 'رقم المعاملة أو مرجع الـ RRN في إشعار تطبيق انستاباي.'
          : 'The RRN or transaction reference code in the InstaPay confirmation notification.',
      };
    }
    // Mobile Cash Wallet (Vodafone / Orange / Etisalat / WE)
    return {
      label: isRTL ? 'كود التحويل / رقم رسالة التأكيد *' : 'Wallet Transaction Code / SMS Ref *',
      placeholder: isRTL ? 'مثال: VF-CASH-746281' : 'e.g. VF-CASH-746281',
      hint: isRTL
        ? 'رقم العملية الوارد في رسالة تأكيد إرسال الكاش من المحفظة الإلكترونية.'
        : 'The transaction code received in the mobile wallet transfer confirmation SMS.',
    };
  })();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      title={
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20 shrink-0">
            <Banknote className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-black text-sm sm:text-base text-slate-900 dark:text-white leading-tight">
              {isRTL ? 'إتمام وصرف طلب السحب' : 'Disburse Withdrawal Funds'}
            </h3>
            <span className="text-[11px] font-semibold text-slate-400 font-mono">
              #{withdrawal._id.slice(-6).toUpperCase()}
            </span>
          </div>
        </div>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-1">
        {/* 1. Payout Summary Card */}
        <div className="rounded-2xl bg-gradient-to-br from-slate-50 via-slate-50/80 to-emerald-50/20 dark:from-slate-900/80 dark:via-slate-900/60 dark:to-emerald-950/20 border border-slate-200/80 dark:border-slate-800 p-3.5 sm:p-4 space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
              {isRTL ? 'المبلغ المقرر صرفه (الصافي):' : 'Net Disbursal Amount:'}
            </span>
            <span className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight">
              {formatAdminCurrency(withdrawal.netAmount, withdrawal.currency, isRTL)}
            </span>
          </div>

          <div className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-3 pt-3 border-t border-slate-200/70 dark:border-slate-800 text-xs">
            {/* Requested Amount */}
            <div className="flex items-center gap-1.5 whitespace-nowrap">
              <span className="text-slate-400 text-xs">{isRTL ? 'المبلغ المطلوب:' : 'Requested:'}</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">
                {formatAdminCurrency(withdrawal.amount, withdrawal.currency, isRTL)}
              </span>
            </div>

            {/* Withdrawal Fee */}
            <div className="flex items-center gap-1.5 whitespace-nowrap">
              <span className="text-slate-400 text-xs">{isRTL ? 'رسوم السحب:' : 'Withdrawal Fee:'}</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">
                {formatAdminCurrency(withdrawal.fee, withdrawal.currency, isRTL)}
                <span className="font-semibold text-slate-400 ms-1">
                  ({toLocalizedDigits(withdrawal.feePercentage, isRTL)}{isRTL ? '٪' : '%'})
                </span>
              </span>
            </div>

            {/* Payout Method */}
            <div className="flex items-center gap-1.5 whitespace-nowrap">
              <span className="text-slate-400 text-xs">{isRTL ? 'وسيلة الدفع:' : 'Payout Method:'}</span>
              <span
                className={cn(
                  'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-[11px] font-bold border',
                  methodConfig.badgeClass
                )}
              >
                {methodConfig.type === 'BANK' && <Building2 className="w-3.5 h-3.5 shrink-0" />}
                {methodConfig.type === 'INSTAPAY' && <CreditCard className="w-3.5 h-3.5 shrink-0" />}
                {methodConfig.type === 'WALLET' && <Smartphone className="w-3.5 h-3.5 shrink-0" />}
                <span>{methodConfig.label}</span>
              </span>
            </div>
          </div>
        </div>

        {/* 2. Destination Details Card with 1-Click Copy */}
        {details && (
          <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-3 sm:p-3.5 space-y-2 text-xs">
            <div className="flex items-center justify-between pb-1.5 border-b border-slate-100 dark:border-slate-800/80">
              <span className="font-bold text-slate-800 dark:text-slate-200 text-xs flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                {isRTL ? 'بيانات جهة الاستلام للتحويل' : 'Transfer Destination Details'}
              </span>
              <span className="text-[10px] text-slate-400">
                {isRTL ? 'انقر على أيقونة النسخ لنسخ الرقم سريعاً' : 'Click icon to quickly copy'}
              </span>
            </div>

            <div className="space-y-1.5">
              {details.accountHolderName && (
                <div className="flex items-center justify-between py-0.5">
                  <span className="text-slate-500 dark:text-slate-400">
                    {isRTL ? 'اسم صاحب الحساب / المستلم:' : 'Account Holder / Recipient:'}
                  </span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {details.accountHolderName}
                  </span>
                </div>
              )}

              {details.bankName && (
                <div className="flex items-center justify-between py-0.5">
                  <span className="text-slate-500 dark:text-slate-400">
                    {isRTL ? 'اسم البنك:' : 'Bank Name:'}
                  </span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    <span>{formatAdminBankName(details.bankName, isRTL)}</span>
                  </span>
                </div>
              )}

              {details.accountNumber && (
                <div className="flex items-center justify-between py-0.5">
                  <span className="text-slate-500 dark:text-slate-400">
                    {isRTL ? 'رقم الحساب البنكي:' : 'Bank Account Number:'}
                  </span>
                  <div className="flex items-center gap-1.5 font-mono font-bold text-slate-900 dark:text-white">
                    <span className="select-all">
                      {toLocalizedDigits(details.accountNumber, isRTL)}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopy(details.accountNumber || '', 'modal-acc')}
                      title={isRTL ? 'نسخ رقم الحساب' : 'Copy account number'}
                      className="p-1 rounded-md text-slate-400 hover:text-amber-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                      {copiedKey === 'modal-acc' ? (
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              )}

              {details.iban && (
                <div className="flex items-center justify-between py-0.5">
                  <span className="text-slate-500 dark:text-slate-400">
                    {isRTL ? 'رقم الآيبان الدولي (IBAN):' : 'IBAN Number:'}
                  </span>
                  <div className="flex items-center gap-1.5 font-mono font-bold text-slate-900 dark:text-white">
                    <span className="select-all tracking-wider">
                      {details.iban}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopy(details.iban || '', 'modal-iban')}
                      title={isRTL ? 'نسخ الآيبان' : 'Copy IBAN'}
                      className="p-1 rounded-md text-slate-400 hover:text-amber-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                      {copiedKey === 'modal-iban' ? (
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              )}

              {details.ipaAddress && (
                <div className="flex items-center justify-between py-0.5">
                  <span className="text-slate-500 dark:text-slate-400">
                    {isRTL ? 'عنوان انستاباي (IPA Address):' : 'InstaPay IPA Address:'}
                  </span>
                  <div className="flex items-center gap-1.5 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    <span className="select-all">{details.ipaAddress}</span>
                    <button
                      type="button"
                      onClick={() => handleCopy(details.ipaAddress || '', 'modal-ipa')}
                      title={isRTL ? 'نسخ عنوان انستاباي' : 'Copy IPA'}
                      className="p-1 rounded-md text-slate-400 hover:text-emerald-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                      {copiedKey === 'modal-ipa' ? (
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              )}

              {details.phoneNumber && (
                <div className="flex items-center justify-between py-0.5">
                  <span className="text-slate-500 dark:text-slate-400">
                    {isRTL ? 'رقم هاتف المحفظة الإلكترونية:' : 'Wallet Mobile Number:'}
                  </span>
                  <div className="flex items-center gap-1.5 font-mono font-bold text-slate-900 dark:text-white" dir="ltr">
                    <span className="select-all">
                      {toLocalizedDigits(details.phoneNumber, isRTL)}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopy(details.phoneNumber || '', 'modal-phone')}
                      title={isRTL ? 'نسخ رقم الهاتف' : 'Copy phone number'}
                      className="p-1 rounded-md text-slate-400 hover:text-amber-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                      {copiedKey === 'modal-phone' ? (
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 3. Input: Reference Number */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-black text-slate-800 dark:text-slate-200">
              {referenceConfig.label}
            </label>
            <span className="text-[11px] text-slate-400">
              {isRTL ? 'إلزامي للتوثيق المحاسبي' : 'Required for audit'}
            </span>
          </div>

          <div className="relative">
            <input
              type="text"
              {...register('adminReference')}
              placeholder={referenceConfig.placeholder}
              disabled={isLoading}
              className={cn(
                'w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold border transition-all duration-200',
                'bg-white dark:bg-slate-900 text-slate-900 dark:text-white',
                'border-slate-200/80 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500',
                errors.adminReference && 'border-rose-500 focus:ring-rose-500/20 focus:border-rose-500'
              )}
            />
            <Hash className="w-4 h-4 text-slate-400 absolute ltr:right-3.5 rtl:left-3.5 top-3 pointer-events-none" />
          </div>

          <p className="text-[11px] text-slate-400">
            {referenceConfig.hint}
          </p>

          {errors.adminReference && (
            <p className="text-xs font-bold text-rose-500 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{t(errors.adminReference.message || '', { defaultValue: 'رقم المرجع إلزامي' })}</span>
            </p>
          )}
        </div>

        {/* 4. Receipt Image Upload Zone (Unified Auctions/Disputes Pattern) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-black text-slate-800 dark:text-slate-200">
              {isRTL ? 'صورة إيصال التحويل (JPG, PNG, WEBP) *' : 'Transfer Receipt Image (JPG, PNG, WEBP) *'}
            </label>
            <span className="text-[11px] text-slate-400">
              {isRTL ? 'الحد الأقصى: 10 ميجابايت' : 'Max: 10MB'}
            </span>
          </div>

          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/jpg"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleImageFile(e.target.files[0]);
              }
            }}
            className="hidden"
          />

          {!receiptUrl ? (
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => !isUploadingImage && fileInputRef.current?.click()}
              className={cn(
                'p-6 sm:p-7 rounded-2xl border-2 border-dashed transition-all duration-200 text-center cursor-pointer select-none group',
                isDragging
                  ? 'border-amber-500 bg-amber-500/10'
                  : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900/60 hover:border-amber-500 dark:hover:border-amber-500 hover:bg-amber-500/5',
                isUploadingImage && 'pointer-events-none opacity-60 cursor-not-allowed'
              )}
            >
              <div className="flex flex-col items-center justify-center gap-2">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center border border-amber-500/20 group-hover:scale-105 transition-transform">
                  {isUploadingImage ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    <UploadCloud className="w-6 h-6" />
                  )}
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">
                    {isUploadingImage
                      ? isRTL
                        ? 'جاري ضغط ومعالجة صورة الإيصال...'
                        : 'Compressing and uploading receipt image...'
                      : isRTL
                      ? 'اضغط لاختيار صورة الإيصال أو اسحب وأفلت هنا'
                      : 'Click to select receipt image or drag and drop here'}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {isRTL
                      ? 'الصيغ المدعومة: JPG, PNG, WEBP — سيتم ضغط الصورة تلقائياً لسرعة التحميل'
                      : 'Supported formats: JPG, PNG, WEBP — Automatically compressed for instant load'}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 flex items-center justify-between gap-3 shadow-2xs">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="relative w-14 h-14 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 shrink-0 bg-slate-100 dark:bg-slate-800">
                  <img
                    src={receiptUrl}
                    alt="Receipt preview"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    {isRTL ? 'تم رفع صورة الإيصال بنجاح' : 'Receipt uploaded successfully'}
                  </span>
                  <a
                    href={receiptUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-amber-500 hover:underline inline-flex items-center gap-1 mt-0.5 truncate max-w-xs font-semibold"
                  >
                    <ExternalLink className="w-3 h-3 shrink-0" />
                    <span>{isRTL ? 'معاينة بالحجم الكامل' : 'Preview full size'}</span>
                  </a>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setValue('receiptUrl', '', { shouldValidate: true })}
                disabled={isLoading}
                title={isRTL ? 'حذف وتغيير الصورة' : 'Remove and change image'}
                className="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer shrink-0"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}

          {uploadError && (
            <p className="text-xs font-bold text-rose-500 flex items-center gap-1 animate-fadeIn">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{uploadError}</span>
            </p>
          )}

          {errors.receiptUrl && (
            <p className="text-xs font-bold text-rose-500 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{t(errors.receiptUrl.message || '', { defaultValue: 'صورة الإيصال إلزامية' })}</span>
            </p>
          )}
        </div>

        {/* 5. Modal Footer Actions */}
        <div className="flex items-center justify-end gap-2.5 pt-3.5 border-t border-slate-200/80 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading || isUploadingImage}
            className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            {t('common.cancel', { defaultValue: 'إلغاء' })}
          </button>

          <button
            type="submit"
            disabled={isLoading || isUploadingImage || !receiptUrl}
            className={cn(
              'inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white shadow-md transition-all duration-200 cursor-pointer',
              'bg-emerald-600 hover:bg-emerald-500 active:scale-95 disabled:opacity-50 disabled:pointer-events-none'
            )}
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <CheckCircle2 className="w-4 h-4" />
            )}
            <span>
              {t('financials.withdrawals.completeModal.confirmButton', {
                defaultValue: 'تأكيد إتمام السحب والصرف',
              })}
            </span>
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default CompleteWithdrawalModal;
