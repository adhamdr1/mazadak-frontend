import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Copy,
  Check,
  ExternalLink,
  Hash,
  Clock,
  ShieldAlert,
  FileCheck,
  Ban,
} from 'lucide-react';
import { Modal } from '@/components/common/Modal';
import { Button } from '@/components/common/Button';
import { WithdrawalStatusBadge } from './WithdrawalStatusBadge';
import {
  formatPrice,
  formatDateTime,
  toLocalizedDigits,
  localizeBankName,
} from '@/utils/formatters';
import type { WithdrawalResponse, PayoutMethod } from '../types/wallet.types';

export interface WithdrawalDetailsModalProps {
  withdrawal: WithdrawalResponse | null;
  isOpen: boolean;
  onClose: () => void;
  onCancelRequest?: (id: string) => void;
  isCancelling?: boolean;
}

export const WithdrawalDetailsModal: React.FC<WithdrawalDetailsModalProps> = ({
  withdrawal,
  isOpen,
  onClose,
  onCancelRequest,
  isCancelling = false,
}) => {
  const { t, i18n } = useTranslation(['wallet']);
  const isRTL = i18n.language.startsWith('ar');
  const [copiedField, setCopiedField] = useState<string | null>(null);

  if (!withdrawal) return null;

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => {
      setCopiedField(null);
    }, 2000);
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

  const getMethodInfo = (method: PayoutMethod) => {
    switch (method) {
      case 'BANK_ACCOUNT':
        return {
          title: t('withdraw.methods.bank', 'حساب بنكي'),
        };
      case 'INSTAPAY':
        return {
          title: t('withdraw.methods.instapay', 'إنستاباي'),
        };
      case 'VODAFONE_CASH':
        return {
          title: t('withdraw.methods.vodafone', 'فودافون كاش'),
        };
      case 'ORANGE_CASH':
        return {
          title: t('withdraw.methods.orange', 'أورنج كاش'),
        };
      case 'ETISALAT_CASH':
        return {
          title: t('withdraw.methods.etisalat', 'اتصالات كاش'),
        };
      case 'WE_PAY':
        return {
          title: t('withdraw.methods.we', 'وي باي'),
        };
      default:
        return {
          title: method,
        };
    }
  };

  const methodInfo = getMethodInfo(withdrawal.payoutMethod);
  const details = withdrawal.payoutDetails || {};

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('withdrawals.detailsModal.title', 'تفاصيل طلب السحب')}
      size="md"
    >
      <div className="space-y-5">
        {/* Top Hero Card: Status & Net Amount */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 text-center space-y-2.5">
          <div className="flex items-center justify-center gap-2">
            <WithdrawalStatusBadge status={withdrawal.status} size="md" />
          </div>

          <div>
            <span className="text-xs text-slate-400 dark:text-slate-500 font-bold block mb-1">
              {t('withdrawals.detailsModal.net', 'المبلغ الصافي')}
            </span>
            <div className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-emerald-600 dark:text-emerald-400">
              <span>{formatPrice(withdrawal.netAmount, isRTL)}</span>
              <span className="text-sm font-sans font-semibold text-slate-500 ms-1.5">
                {t('balance.currency', 'ج.م')}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-center gap-4 pt-2 border-t border-slate-200/60 dark:border-slate-700/60 text-xs">
            <div className="text-slate-500 dark:text-slate-400">
              <span>{t('withdrawals.detailsModal.amount', 'المبلغ المطلوب')}: </span>
              <span className="font-mono font-bold text-slate-700 dark:text-slate-200">
                {formatPrice(withdrawal.amount, isRTL)} {t('balance.currency', 'ج.م')}
              </span>
            </div>
            <div className="text-slate-500 dark:text-slate-400">
              <span>{t('withdrawals.detailsModal.fee', 'رسوم الخدمة')}: </span>
              <span className="font-mono font-bold text-rose-500 dark:text-rose-400">
                -{formatPrice(withdrawal.fee, isRTL)} {t('balance.currency', 'ج.م')}
              </span>
            </div>
          </div>
        </div>

        {/* Rejection Alert Box (if REJECTED) */}
        {withdrawal.status === 'REJECTED' && (
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 space-y-2 text-rose-900 dark:text-rose-300 text-xs">
            <div className="flex items-center gap-2 font-bold text-sm text-rose-600 dark:text-rose-400">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>{t('withdrawals.detailsModal.rejectionAlertTitle', 'تم رفض طلب السحب')}</span>
            </div>
            {withdrawal.rejectionReason && (
              <p className="font-semibold bg-white/60 dark:bg-slate-900/60 p-2.5 rounded-xl border border-rose-500/20">
                {withdrawal.rejectionReason}
              </p>
            )}
            <p className="text-[11px] text-rose-700 dark:text-rose-300/80 leading-relaxed">
              {t(
                'withdrawals.detailsModal.rejectionAlertDesc',
                'تم إلغاء العملية وفك حجز كامل المبلغ وإعادته تلقائياً إلى رصيدك المتاح في المحفظة.'
              )}
            </p>
          </div>
        )}

        {/* Bank Transfer Receipt Box (if COMPLETED) */}
        {withdrawal.status === 'COMPLETED' && (
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-2.5 text-xs">
            <div className="flex items-center gap-2 font-bold text-sm text-emerald-700 dark:text-emerald-400">
              <FileCheck className="w-4 h-4 shrink-0" />
              <span>{t('withdrawals.detailsModal.receipt', 'إيصال التحويل المعتمد')}</span>
            </div>

            {withdrawal.adminReference && (
              <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-emerald-500/20">
                <span className="text-slate-500 dark:text-slate-400">
                  {t('withdrawals.detailsModal.adminReference', 'رقم المرجع البنكي')}:
                </span>
                <div className="flex items-center gap-1.5 font-mono font-bold text-slate-800 dark:text-slate-200">
                  <span>{withdrawal.adminReference}</span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(withdrawal.adminReference!, 'ref')}
                    className="p-1 rounded-md text-slate-400 hover:text-emerald-600 transition-colors cursor-pointer"
                    title={t('withdrawals.detailsModal.copy', 'نسخ')}
                  >
                    {copiedField === 'ref' ? (
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>
            )}

            {isSafeUrl(withdrawal.receiptUrl) && (
              <a
                href={withdrawal.receiptUrl!}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors shadow-xs cursor-pointer"
              >
                <span>{t('withdrawals.detailsModal.viewReceiptLink', 'فتح وتحميل الإيصال الرسمي')}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        )}

        {/* Recipient Account Details Grid (Clean Dark Mode slate-800/40 background) */}
        <div className="space-y-2.5 pt-1">
          <h4 className="text-xs font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            {t('withdrawals.detailsModal.payoutDestination', 'بيانات وجهة الاستلام')}
          </h4>

          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 p-4 space-y-2.5 text-xs">
            {/* Method Name */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-200/60 dark:border-slate-800">
              <span className="text-slate-500 dark:text-slate-400">
                {t('withdrawals.detailsModal.payoutMethodLabel', 'وسيلة الاستلام:')}
              </span>
              <span className="font-bold text-slate-900 dark:text-white">
                {methodInfo.title}
              </span>
            </div>

            {/* Bank Name */}
            {details.bankName && (
              <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800/60">
                <span className="text-slate-500 dark:text-slate-400">
                  {t('withdrawals.detailsModal.bankName', 'اسم البنك')}:
                </span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {localizeBankName(details.bankName, isRTL)}
                </span>
              </div>
            )}

            {/* Holder Name */}
            {details.accountHolderName && (
              <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800/60">
                <span className="text-slate-500 dark:text-slate-400">
                  {t('withdrawals.detailsModal.holderName', 'اسم صاحب الحساب')}:
                </span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {details.accountHolderName}
                </span>
              </div>
            )}

            {/* Account Number */}
            {details.accountNumber && (
              <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800/60">
                <span className="text-slate-500 dark:text-slate-400">
                  {t('withdrawals.detailsModal.accountNumber', 'رقم الحساب')}:
                </span>
                <div className="flex items-center gap-1.5 font-mono font-bold text-slate-800 dark:text-slate-200">
                  <span dir="ltr" className="[unicode-bidi:isolate]">
                    {toLocalizedDigits(details.accountNumber, isRTL)}
                  </span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(details.accountNumber!, 'acc')}
                    className="p-1 rounded-md text-slate-400 hover:text-amber-500 transition-colors cursor-pointer"
                    title={t('withdrawals.detailsModal.copy', 'نسخ')}
                  >
                    {copiedField === 'acc' ? (
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* IBAN */}
            {details.iban && (
              <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800/60">
                <span className="text-slate-500 dark:text-slate-400">
                  {t('withdrawals.detailsModal.iban', 'الآيبان (IBAN)')}:
                </span>
                <div className="flex items-center gap-1.5 font-mono font-bold text-slate-800 dark:text-slate-200">
                  <span dir="ltr" className="truncate max-w-[170px] sm:max-w-[220px] [unicode-bidi:isolate]">
                    {details.iban}
                  </span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(details.iban!, 'iban')}
                    className="p-1 rounded-md text-slate-400 hover:text-amber-500 transition-colors cursor-pointer"
                    title={t('withdrawals.detailsModal.copy', 'نسخ')}
                  >
                    {copiedField === 'iban' ? (
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* IPA Address */}
            {details.ipaAddress && (
              <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800/60">
                <span className="text-slate-500 dark:text-slate-400">
                  {t('withdrawals.detailsModal.ipaAddress', 'عنوان IPA')}:
                </span>
                <div className="flex items-center gap-1.5 font-mono font-bold text-slate-800 dark:text-slate-200">
                  <span dir="ltr" className="[unicode-bidi:isolate]">{details.ipaAddress}</span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(details.ipaAddress!, 'ipa')}
                    className="p-1 rounded-md text-slate-400 hover:text-amber-500 transition-colors cursor-pointer"
                    title={t('withdrawals.detailsModal.copy', 'نسخ')}
                  >
                    {copiedField === 'ipa' ? (
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Phone Number (Localized in Arabic and English) */}
            {details.phoneNumber && (
              <div className="flex items-center justify-between py-1">
                <span className="text-slate-500 dark:text-slate-400">
                  {t('withdrawals.detailsModal.phone', 'رقم الهاتف المسجل')}:
                </span>
                <div className="flex items-center gap-1.5 font-mono font-bold text-slate-800 dark:text-slate-200">
                  <span dir="ltr" className="font-mono [direction:ltr] inline-block tracking-wide">
                    {toLocalizedDigits(details.phoneNumber, isRTL)}
                  </span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(details.phoneNumber!, 'phone')}
                    className="p-1 rounded-md text-slate-400 hover:text-amber-500 transition-colors cursor-pointer"
                    title={t('withdrawals.detailsModal.copy', 'نسخ')}
                  >
                    {copiedField === 'phone' ? (
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

        {/* Timestamps */}
        <div className="space-y-2 text-xs divide-y divide-slate-100 dark:divide-slate-800">
          <div className="pt-2 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
              <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span>{t('withdrawals.detailsModal.requestedAt', 'تاريخ التقديم')}</span>
            </div>
            <span className="font-medium text-slate-800 dark:text-slate-200">
              {formatDateTime(withdrawal.createdAt, isRTL)}
            </span>
          </div>

          {withdrawal.processedAt && (
            <div className="pt-2 flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                <Clock className="w-3.5 h-3.5 text-sky-500 shrink-0" />
                <span>{t('withdrawals.detailsModal.processedAt', 'بدء المعالجة')}</span>
              </div>
              <span className="font-medium text-slate-800 dark:text-slate-200">
                {formatDateTime(withdrawal.processedAt, isRTL)}
              </span>
            </div>
          )}

          {withdrawal.completedAt && (
            <div className="pt-2 flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                <Clock className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>{t('withdrawals.detailsModal.completedAt', 'تاريخ الإتمام')}</span>
              </div>
              <span className="font-medium text-slate-800 dark:text-slate-200">
                {formatDateTime(withdrawal.completedAt, isRTL)}
              </span>
            </div>
          )}

          <div className="pt-2 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
              <Hash className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>{t('withdrawals.detailsModal.requestId', 'معرّف الطلب')}</span>
            </div>
            <span className="font-mono text-slate-600 dark:text-slate-400 text-[11px]">
              {withdrawal._id}
            </span>
          </div>
        </div>

        {/* Action Buttons (Matching soft danger pattern) */}
        <div className="flex items-center gap-2.5 pt-2">
          {withdrawal.status === 'PENDING' && onCancelRequest && (
            <button
              type="button"
              disabled={isCancelling}
              onClick={() => onCancelRequest(withdrawal._id)}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-rose-600 dark:text-rose-400 bg-rose-50 hover:bg-rose-100/80 dark:bg-rose-950/30 dark:hover:bg-rose-900/40 border border-rose-200/80 dark:border-rose-900/50 active:scale-95 transition-all duration-200 cursor-pointer disabled:opacity-50"
            >
              <Ban className="w-4 h-4 shrink-0" />
              <span>{t('withdrawals.card.cancelButton', 'إلغاء الطلب')}</span>
            </button>
          )}

          <Button variant="outline" size="md" fullWidth onClick={onClose} className="cursor-pointer">
            {t('withdrawals.detailsModal.close', 'إغلاق')}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default WithdrawalDetailsModal;
