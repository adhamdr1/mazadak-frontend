import React from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { AlertTriangle, X, Trash2, Loader2 } from 'lucide-react';
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

  if (!isOpen || !auction) return null;

  const handleConfirm = () => {
    onConfirm(auction._id);
  };

  const coverImage = auction.images?.[0] || '';

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 overflow-y-auto outline-none">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm animate-fadeIn cursor-pointer"
        onClick={isLoading ? undefined : onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-md my-auto rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col z-10 animate-scaleUp transition-all duration-200">
        {/* Header (Clean, brand-consistent, without muddy red tint) */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3 bg-white dark:bg-slate-900">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-red-500/10 text-red-500 dark:text-red-400 flex items-center justify-center border border-red-500/20 shrink-0">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-100 leading-none">
                {t('cancelModal.title')}
              </h3>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 font-medium">
                {t('cancelModal.warning')}
              </p>
            </div>
          </div>

          <button
            type="button"
            disabled={isLoading}
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white flex items-center justify-center transition-colors cursor-pointer disabled:opacity-50"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
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
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50/70 dark:bg-slate-900/60 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2.5">
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
            onClick={handleConfirm}
            leftIcon={
              isLoading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Trash2 className="w-3.5 h-3.5" />
              )
            }
          >
            {isLoading
              ? t('cancelModal.cancellingButton')
              : t('cancelModal.confirmButton')}
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default CancelAuctionModal;
