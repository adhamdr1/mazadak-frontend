import React from 'react';
import { useTranslation } from 'react-i18next';
import { AlertTriangle, Trash2 } from 'lucide-react';
import { Modal } from '@/components/common/Modal';
import { Button } from '@/components/common/Button';
import { PriceDisplay } from './PriceDisplay';
import type { Auction } from '../../types/auctions.types';

export interface CancelAuctionModalProps {
  isOpen: boolean;
  auction: Auction | null;
  isLoading: boolean;
  error?: string | null;
  onClose: () => void;
  onConfirm: (auctionId: string) => void;
}

export const CancelAuctionModal: React.FC<CancelAuctionModalProps> = ({
  isOpen,
  auction,
  isLoading,
  error,
  onClose,
  onConfirm,
}) => {
  const { t } = useTranslation('auctions');

  if (!auction) return null;

  const handleConfirm = () => {
    onConfirm(auction._id);
  };

  const coverImage = auction.images?.[0] || '';

  const modalTitle = (
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-xl bg-red-500/10 text-red-500 dark:text-red-400 flex items-center justify-center border border-red-500/20 shrink-0">
        <AlertTriangle className="w-4 h-4" />
      </div>
      <div>
        <span className="font-extrabold text-base text-slate-900 dark:text-slate-100">
          {t('cancelModal.title')}
        </span>
      </div>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={isLoading ? () => {} : onClose}
      title={modalTitle}
      description={t('cancelModal.warning')}
      size="sm"
      showCloseButton={!isLoading}
      closeOnBackdropClick={!isLoading}
      closeOnEscape={!isLoading}
    >
      <div className="space-y-4">
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
          {t('cancelModal.confirmationMessage')}
        </p>

        {/* Auction Preview Card */}
        <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80">
          {coverImage && (
            <img
              src={coverImage}
              alt={auction.title}
              className="w-14 h-14 rounded-xl object-cover shrink-0 border border-slate-200 dark:border-slate-700"
            />
          )}
          <div className="flex-1 min-w-0 space-y-1">
            <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
              {auction.title}
            </h4>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium">
              <span>{t('cancelModal.startingPriceLabel')}</span>
              <PriceDisplay
                amount={Number(auction.startingPrice) || 0}
                size="sm"
                className="font-bold text-amber-600 dark:text-amber-400"
              />
            </div>
          </div>
        </div>

        {/* Error notice if any */}
        {error && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs font-semibold animate-fadeIn flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Footer Actions */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2.5">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={isLoading}
            onClick={onClose}
          >
            {t('cancelModal.cancelButton')}
          </Button>

          <Button
            type="button"
            variant="danger"
            size="sm"
            disabled={isLoading}
            isLoading={isLoading}
            onClick={handleConfirm}
            leftIcon={<Trash2 className="w-3.5 h-3.5" />}
          >
            {isLoading
              ? t('cancelModal.cancellingButton')
              : t('cancelModal.confirmButton')}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default CancelAuctionModal;
