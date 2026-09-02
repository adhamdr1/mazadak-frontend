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
import { BrandLogo } from '@/components/common/BrandLogo';
import { LanguageSwitcher } from '@/components/common/LanguageSwitcher';
import { ThemeToggle } from '@/components/common/ThemeToggle';
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
    <div className="min-h-screen flex flex-col justify-between bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-white/80 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800/80 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BrandLogo size="md" />

            {/* Breadcrumb indicator */}
            <div className="hidden md:flex items-center gap-2 text-xs font-semibold text-slate-400 ms-4 ps-4 border-s border-slate-200 dark:border-slate-800">
              <Link
                to={ROUTES.AUCTIONS}
                className="hover:text-amber-500 transition-colors flex items-center gap-1"
              >
                <Home className="w-3.5 h-3.5" />
                <span>{t('title')}</span>
              </Link>
              <ChevronIcon className="w-3 h-3 text-slate-400" />
              {auction ? (
                <Link
                  to={ROUTES.AUCTION_DETAIL(auction._id)}
                  className="hover:text-amber-500 transition-colors max-w-[200px] truncate"
                >
                  {auction.title}
                </Link>
              ) : null}
              {auction && <ChevronIcon className="w-3 h-3 text-slate-400" />}
              <span className="text-amber-500 font-bold">{t('edit.title')}</span>
            </div>
          </div>

          {/* Actions & Settings */}
          <div className="flex items-center gap-2.5">
            <LanguageSwitcher />
            <ThemeToggle />
            {auction && (
              <Link to={ROUTES.AUCTION_DETAIL(auction._id)}>
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<ArrowIcon className="w-3.5 h-3.5" />}
                  className="hidden sm:inline-flex"
                >
                  {t('edit.backToAuction')}
                </Button>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8">
        {isLoading ? (
          <div className="max-w-4xl mx-auto space-y-6 animate-pulse">
            <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded-xl w-1/3" />
            <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-lg w-1/2" />
            <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-2xl w-full" />
            <div className="h-48 bg-slate-200 dark:bg-slate-800 rounded-2xl w-full" />
          </div>
        ) : error || !auction ? (
          <div className="max-w-2xl mx-auto py-12 text-center">
            <Card glass padding="lg" className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center mx-auto">
                <AlertCircle className="w-7 h-7" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                {t('detail.notFoundTitle')}
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {error || t('detail.notFoundMessage')}
              </p>
              <div className="pt-2">
                <Link to={ROUTES.AUCTIONS}>
                  <Button variant="accent" size="md">
                    {t('detail.backToAuctions')}
                  </Button>
                </Link>
              </div>
            </Card>
          </div>
        ) : isLocked ? (
          <AuctionLockedBanner auction={auction} isSeller={isSeller} />
        ) : (
          <div className="space-y-8">
            {/* Header Title Banner */}
            <div className="max-w-4xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>{t('status.PENDING')}</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
                  {t('edit.title')}
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {t('edit.subtitle')}
                </p>
              </div>
            </div>

            {/* Edit Form */}
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
      </main>

      {/* Footer */}
      <footer className="w-full py-6 text-center text-xs text-slate-400 dark:text-slate-600 border-t border-slate-200/80 dark:border-slate-800/80">
        {t('footerCopyright', { ns: 'common' })}
      </footer>

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
