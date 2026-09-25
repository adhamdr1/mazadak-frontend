import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  AlertTriangle,
  RotateCcw,
  ShieldCheck,
  Loader2,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react';
import { Modal } from '@/components/common/Modal';

export interface CancelDisputeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
  isLoading: boolean;
}

export const CancelDisputeModal: React.FC<CancelDisputeModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isLoading,
}) => {
  const { t, i18n } = useTranslation(['escrow', 'common']);
  const isRTL = i18n.language?.startsWith('ar');

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('cancelDisputeModal.title', isRTL ? 'إلغاء النزاع المالي' : 'Cancel Financial Dispute')}
      size="md"
    >
      <div className="space-y-5 p-1">
        {/* Warning Icon & Headline */}
        <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/30 text-amber-700 dark:text-amber-400">
          <AlertTriangle className="w-6 h-6 shrink-0 text-amber-600 dark:text-amber-400" />
          <div className="space-y-0.5">
            <h4 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white">
              {t('cancelDisputeModal.confirmQuestion', isRTL ? 'هل أنت متأكد من رغبتك في إلغاء هذا النزاع؟' : 'Are you sure you want to cancel this dispute?')}
            </h4>
            <p className="text-2xs sm:text-xs text-slate-600 dark:text-slate-400">
              {t(
                'cancelDisputeModal.warningDesc',
                isRTL
                  ? 'عند إلغاء النزاع بالتراضي، ستعود معاملة الضمان فوراً إلى حالتها الطبيعية (محتجزة HELD).'
                  : 'Upon cancellation, the escrow will immediately revert to standard HELD status.'
              )}
            </p>
          </div>
        </div>

        {/* Informational Checklist */}
        <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
          <div className="flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <span>
              {t(
                'cancelDisputeModal.point1',
                isRTL
                  ? 'ستتمكن مجدداً من تأكيد استلام السلعة وتحرير المبلغ للبائع بعد معاينتها.'
                  : 'You will regain the ability to confirm delivery and release payment after inspection.'
              )}
            </span>
          </div>
          <div className="flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <span>
              {t(
                'cancelDisputeModal.point2',
                isRTL
                  ? 'سيتم استئناف عداد مهلة الفحص والمعاينة المتبقية تلقائياً.'
                  : 'The remaining inspection countdown will resume automatically.'
              )}
            </span>
          </div>
          <div className="flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <span>
              {t(
                'cancelDisputeModal.point3',
                isRTL
                  ? 'تبقى الأموال محتجزة بأمان في حساب الضمان ولا يتم تحويلها للبائع إلا بعد تأكيدك للاستلام.'
                  : 'Funds remain safely held in escrow and are not transferred to the seller until you confirm delivery.'
              )}
            </span>
          </div>
        </div>

        {/* Action Buttons: Cancel and Confirm */}
        <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            disabled={isLoading}
            onClick={onClose}
            className="w-full inline-flex items-center justify-center gap-2 px-3 sm:px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-200 bg-white hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700/80 hover:text-amber-600 dark:hover:text-amber-400 hover:border-amber-500/50 dark:hover:border-amber-500/50 border border-slate-300 dark:border-slate-700 active:scale-98 transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed select-none shadow-2xs"
          >
            {isRTL ? (
              <ArrowRight className="w-4 h-4 shrink-0" />
            ) : (
              <ArrowLeft className="w-4 h-4 shrink-0" />
            )}
            <span>{t('common:actions.cancel', isRTL ? 'تراجع' : 'Keep Dispute')}</span>
          </button>

          <button
            type="button"
            disabled={isLoading}
            onClick={onConfirm}
            className="w-full inline-flex items-center justify-center gap-2 px-3 sm:px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-rose-600 dark:text-rose-400 bg-rose-50 hover:bg-rose-100/90 dark:bg-rose-950/40 dark:hover:bg-rose-900/50 border border-rose-200/90 dark:border-rose-900/60 active:scale-98 transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed select-none shadow-2xs"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                <span>{t('cancelDisputeModal.cancelling', isRTL ? 'جاري الإلغاء...' : 'Cancelling...')}</span>
              </>
            ) : (
              <>
                <RotateCcw className="w-4 h-4 shrink-0" />
                <span>{t('cancelDisputeModal.confirmBtn', isRTL ? 'تأكيد إلغاء النزاع' : 'Confirm Cancellation')}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
};
