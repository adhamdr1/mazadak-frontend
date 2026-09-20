import React from 'react';
import { useTranslation } from 'react-i18next';
import { AlertTriangle, Loader2, ArrowRight, ArrowLeft, Ban } from 'lucide-react';
import { Modal } from '@/components/common/Modal';
import { formatPrice } from '@/utils/formatters';

export interface CancelWithdrawalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  isPending: boolean;
  amount: string | number;
}

export const CancelWithdrawalModal: React.FC<CancelWithdrawalModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isPending,
  amount,
}) => {
  const { t, i18n } = useTranslation(['wallet']);
  const isRTL = i18n.language.startsWith('ar');

  const formattedAmount = formatPrice(amount, isRTL);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('withdrawals.cancelModal.title', 'تأكيد إلغاء طلب السحب')}
      size="sm"
    >
      <div className="space-y-5 text-center sm:text-start">
        {/* Warning Icon & Question */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3.5">
          <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">
              {t('withdrawals.cancelModal.description', 'هل أنت متأكد من رغبتك في إلغاء هذا الطلب؟')}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              {t(
                'withdrawals.cancelModal.amountNotice',
                'سيتم فك حجز مبلغ {{amount}} ج.م فورياً وإعادته مباشرة إلى رصيدك المتاح للتصرف والمزايدة.',
                { amount: formattedAmount }
              )}
            </p>
          </div>
        </div>

        {/* Amount Badge */}
        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-500 dark:text-slate-400">
            {t('withdrawals.card.requestedAmount', 'المبلغ المطلوب سحبه')}
          </span>
          <span className="font-mono font-extrabold text-slate-900 dark:text-white text-sm">
            {formattedAmount} {t('balance.currency', 'ج.م')}
          </span>
        </div>

        {/* Action Buttons: 2 Equal-width buttons with matching height & horizontal icon-text alignment */}
        <div className="grid grid-cols-2 gap-3 pt-3">
          <button
            type="button"
            disabled={isPending}
            onClick={onClose}
            className="w-full inline-flex items-center justify-center gap-2 px-3 sm:px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-200 bg-white hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700/80 border border-slate-300 dark:border-slate-700 active:scale-98 transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isRTL ? (
              <ArrowRight className="w-4 h-4 shrink-0" />
            ) : (
              <ArrowLeft className="w-4 h-4 shrink-0" />
            )}
            <span>{t('withdrawals.cancelModal.cancelButton', 'تراجع')}</span>
          </button>

          <button
            type="button"
            disabled={isPending}
            onClick={onConfirm}
            className="w-full inline-flex items-center justify-center gap-2 px-3 sm:px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-rose-600 dark:text-rose-400 bg-rose-50 hover:bg-rose-100/90 dark:bg-rose-950/30 dark:hover:bg-rose-900/40 border border-rose-200/90 dark:border-rose-900/60 active:scale-98 transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                <span className="truncate">{t('withdrawals.cancelModal.cancelling', 'جارٍ إلغاء الطلب...')}</span>
              </>
            ) : (
              <>
                <Ban className="w-4 h-4 shrink-0" />
                <span className="truncate">{t('withdrawals.cancelModal.confirmButton', 'نعم، قم بإلغاء الطلب')}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default CancelWithdrawalModal;
