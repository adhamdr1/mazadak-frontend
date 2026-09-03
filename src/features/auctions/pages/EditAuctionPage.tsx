import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeft,
  ArrowRight,
  Edit3,
  AlertCircle,
  Home,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react';
import { useAuctionDetail } from '../hooks/useAuctionDetail';
import { useEditAuction } from '../hooks/useEditAuction';
import { useCancelAuction } from '../hooks/useCancelAuction';
import { EditAuctionForm } from '../components/edit/EditAuctionForm';
import { AuctionLockedBanner } from '../components/edit/AuctionLockedBanner';
import { CancelAuctionModal } from '../components/shared/CancelAuctionModal';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { ROUTES } from '@/constants/routes.constants';

export const EditAuctionPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { t, i18n } = useTranslation(['auctions', 'common']);
  const isRTL = i18n.language?.startsWith('ar');
  const navigate = useNavigate();
  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight;
  const ChevronIcon = isRTL ? ChevronLeft : ChevronRight;

  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);

  const {
    auction,
    isLoading,
    error,
  } = useAuctionDetail(id || '');

  const {
    form,
    images,
    isUploading,
    uploadError,
    handleImageFiles,
    handleRemoveImage,
    handleSetCover,
    onSubmit,
    isSubmitting,
    error: submitError,
    isSeller,
    isLocked,
  } = useEditAuction(auction);

  const {
    cancel,
    isLoading: isCancelling,
    error: cancelError,
    reset: resetCancelState,
  } = useCancelAuction({
    onSuccess: () => {
      setIsCancelModalOpen(false);
      navigate(ROUTES.MY_AUCTIONS);
    },
  });

  const handleOpenCancelModal = () => {
    resetCancelState();
    setIsCancelModalOpen(true);
  };

  const handleCloseCancelModal = () => {
    if (isCancelling) return;
    setIsCancelModalOpen(false);
    resetCancelState();
  };

  // Set document title
  useEffect(() => {
    if (auction?.title) {
      document.title = `${t('edit.title')} - ${auction.title} | Mazadak`;
    } else {
      document.title = `${t('edit.title')} | Mazadak`;
    }
  }, [auction?.title, t]);

  return (
    <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8">
      {/* 1. Breadcrumb Indicator */}
      <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium">
        <Link
          to={ROUTES.HOME}
          className="hover:text-amber-500 transition-colors flex items-center gap-1"
        >
          <Home className="w-3.5 h-3.5" />
          <span>{t('nav.home', { ns: 'common' })}</span>
        </Link>
        <ChevronIcon className="w-3 h-3 text-slate-400" />
        <Link to={ROUTES.MY_AUCTIONS} className="hover:text-amber-500 transition-colors">
          {t('myAuctions.title')}
        </Link>
        <ChevronIcon className="w-3 h-3 text-slate-400" />
        <span className="text-amber-500 font-bold">{t('edit.title')}</span>
      </div>

      {/* 2. Page Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            <Edit3 className="w-3.5 h-3.5" />
            <span>{t('edit.badge')}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            {t('edit.title')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            {t('edit.subtitle')}
          </p>
        </div>

        <Button
          to={ROUTES.MY_AUCTIONS}
          variant="outline"
          size="sm"
          leftIcon={<ArrowIcon className="w-4 h-4" />}
          className="text-xs font-bold"
        >
          {t('edit.backToMyAuctions')}
        </Button>
      </div>

      {/* 3. Loading State */}
      {isLoading && (
        <div className="py-20 flex flex-col items-center justify-center space-y-4">
          <div className="w-10 h-10 border-3 border-amber-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-500">{t('edit.loadingAuction')}</p>
        </div>
      )}

      {/* 4. Error State */}
      {!isLoading && (error || !auction) && (
        <Card glass padding="lg" className="max-w-xl mx-auto text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            {error || t('edit.notFoundTitle')}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {t('edit.notFoundMessage')}
          </p>
          <Button to={ROUTES.MY_AUCTIONS} variant="accent" size="sm">
            {t('edit.backToMyAuctions')}
          </Button>
        </Card>
      )}

      {/* 5. Main Form & Locking Status */}
      {!isLoading && auction && (
        <div className="space-y-6">
          {/* Active / Ended Locked Notice */}
          {isLocked && (
            <AuctionLockedBanner
              auction={auction}
              isSeller={isSeller}
            />
          )}

          {/* Form */}
          <EditAuctionForm
            form={form}
            auction={auction}
            images={images}
            isUploading={isUploading}
            uploadError={uploadError}
            onImageFiles={handleImageFiles}
            onRemoveImage={handleRemoveImage}
            onSetCover={handleSetCover}
            onSubmit={onSubmit}
            isSubmitting={isSubmitting}
            serverError={submitError}
            onCancelAuction={
              !isLocked && isSeller && auction.status === 'PENDING'
                ? handleOpenCancelModal
                : undefined
            }
          />
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      <CancelAuctionModal
        isOpen={isCancelModalOpen}
        auction={auction || null}
        isLoading={isCancelling}
        error={cancelError}
        onClose={handleCloseCancelModal}
        onConfirm={cancel}
      />
    </div>
  );
};

export default EditAuctionPage;
