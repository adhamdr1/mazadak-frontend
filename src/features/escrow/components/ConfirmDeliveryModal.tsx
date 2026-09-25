import React from 'react';
import { useTranslation } from 'react-i18next';
import { CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';
import { Modal } from '@/components/common/Modal';
import { Button } from '@/components/common/Button';
import { formatPrice } from '@/utils/formatters';

export interface ConfirmDeliveryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
  auctionTitle?: string;
  amount: string;
}

export const ConfirmDeliveryModal: React.FC<ConfirmDeliveryModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
  auctionTitle,
  amount,
}) => {
  const { t, i18n } = useTranslation(['escrow', 'common']);
  const isRTL = i18n.language?.startsWith('ar');

  const formattedAmount = formatPrice(amount, isRTL);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="md"
      title={
        <div className="flex items-center gap-2.5 text-slate-900 dark:text-white">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <span className="text-base sm:text-lg font-black">
            {t('confirmModal.title', 'تأكيد استلام السلعة وتحرير المبلغ')}
          </span>
        </div>
      }
    >
      <div className="space-y-5">
        {/* Auction & Amount Summary Pill */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 space-y-2">
          {auctionTitle && (
            <div className="text-xs text-slate-500 dark:text-slate-400">
              <span>{t('confirmModal.auctionLabel', 'المزاد:')} </span>
              <span className="font-bold text-slate-800 dark:text-slate-200">{auctionTitle}</span>
            </div>
          )}
          <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 dark:border-slate-700/60">
            <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
              {t('confirmModal.amountToRelease', 'المبلغ الذي سيتم تحريره للبائع:')}
            </span>
            <div className="flex items-baseline gap-1 text-emerald-600 dark:text-emerald-400 font-mono font-black text-base sm:text-lg">
              <span>{formattedAmount}</span>
              <span className="text-xs font-bold">
                {t('escrow:currency.egp', isRTL ? 'ج.م' : 'EGP')}
              </span>
            </div>
          </div>
        </div>

        {/* Warning Callout: Irreversible Action */}
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/25 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1 text-xs">
            <div className="font-black text-amber-900 dark:text-amber-200">
              {t('confirmModal.warningTitle', 'تنبيه: هذا الإجراء نهائي وغير قابل للإلغاء')}
            </div>
            <p className="text-amber-800/90 dark:text-amber-300/90 leading-relaxed">
              {t(
                'confirmModal.warningText',
                'بالضغط على تأكيد، فإنك تقر بأنك عاينت واستلمت السلعة بحالة ممتازة ومطابقة للمواصفات. سيتم تحويل المبلغ فوراً إلى محفظة البائع ولن تتمكن من فتح أي نزاع مالي بعد ذلك.'
              )}
            </p>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="w-full sm:w-auto font-bold rounded-xl"
          >
            {t('common:actions.cancel', 'تراجع')}
          </Button>
          <Button
            type="button"
            onClick={onConfirm}
            isLoading={isLoading}
            className="w-full sm:w-auto font-black rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white shadow-lg shadow-emerald-600/25"
            leftIcon={<ShieldCheck className="w-4 h-4" />}
          >
            {t('confirmModal.confirmAction', 'نعم، أؤكد الاستلام وأحرر المبلغ')}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
