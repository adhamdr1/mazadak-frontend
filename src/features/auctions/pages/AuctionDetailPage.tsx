import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AlertTriangle } from 'lucide-react';
import { useAuctionDetail } from '../hooks/useAuctionDetail';
import { useCancelAuction } from '../hooks/useCancelAuction';
import { AuctionImageGallery } from '../components/detail/AuctionImageGallery';
import { AuctionInfoSection } from '../components/detail/AuctionInfoSection';
import { AuctionDescription } from '../components/detail/AuctionDescription';
import { AuctionTermsSection } from '../components/detail/AuctionTermsSection';
import { AuctionSellerCard } from '../components/detail/AuctionSellerCard';
import { AuctionBiddingCTA } from '../components/detail/AuctionBiddingCTA';
import { AuctionDetailSkeleton } from '../components/detail/AuctionDetailSkeleton';
import { CancelAuctionModal } from '../components/shared/CancelAuctionModal';
import { Button } from '@/components/common/Button';
import { ROUTES } from '@/constants/routes.constants';

export const AuctionDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation('auctions');

  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);

  const {
    auction,
    effectiveStatus,
    isLoading,
    isError,
    error,
    isSeller,
    isWinner,
    refetch,
  } = useAuctionDetail(id);

  const {
    cancel,
    isLoading: isCancelling,
    error: cancelError,
    reset: resetCancelState,
  } = useCancelAuction({
    onSuccess: () => {
      setIsCancelModalOpen(false);
      refetch();
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

  return (
    <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8">
      {/* Loading Skeleton */}
      {isLoading && <AuctionDetailSkeleton />}

      {/* Error State */}
      {!isLoading && (isError || !auction) && (
        <div className="py-20 text-center space-y-4 max-w-md mx-auto">
          <div className="w-16 h-16 rounded-3xl bg-red-500/10 text-red-500 flex items-center justify-center mx-auto border border-red-500/20">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              {t('detail.notFoundTitle')}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {error || t('detail.notFoundMessage')}
            </p>
          </div>
          <Button to={ROUTES.AUCTIONS} variant="accent" size="sm">
            {t('detail.backToAuctions')}
          </Button>
        </div>
      )}

      {/* Main Auction Presentation */}
      {!isLoading && auction && (
        <>
          {/* Main 2-Column Responsive Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
            {/* Left Column (Desktop 7/8 cols): Gallery, Specs & Description */}
            <div className="lg:col-span-7 xl:col-span-8 space-y-6">
              {/* 1. Media Image Gallery Showcase */}
              <section aria-label="Auction Media Gallery">
                <AuctionImageGallery
                  images={auction.images}
                  title={auction.title}
                  category={auction.category}
                  status={effectiveStatus || auction.status}
                />
              </section>

              {/* 2. Core Auction Meta Specs, Title, ID & Details */}
              <section aria-label="Auction Specifications">
                <AuctionInfoSection auction={auction} />
              </section>

              {/* 3. Product Description */}
              <section aria-label="Product Description">
                <AuctionDescription description={auction.description} />
              </section>
            </div>

            {/* Right Column (Desktop 5/4 cols): Sticky Sidebar with Price, Timer, Bidding Controls & Seller Card */}
            <div className="lg:col-span-5 xl:col-span-4 space-y-6 lg:sticky lg:top-24 self-start">
              {/* Action Box: Price, Timer, Bidding Controls or Seller Controls */}
              <AuctionBiddingCTA
                auction={auction}
                effectiveStatus={effectiveStatus || auction.status}
                isSeller={isSeller}
                isWinner={isWinner}
                onCancelAuction={
                  (effectiveStatus || auction.status) === 'PENDING' && isSeller
                    ? handleOpenCancelModal
                    : undefined
                }
                isCancelling={isCancelling}
              />

              {/* Verified Seller Profile Card — strictly visible for bidders/visitors, NOT the seller themselves */}
              {!isSeller && auction.sellerId && (
                <section aria-label="Seller Information">
                  <AuctionSellerCard
                    sellerId={auction.sellerId}
                    canContact={isWinner}
                  />
                </section>
              )}
            </div>
          </div>

          {/* Dedicated Bottom Section: Auction Terms & Platform Rules */}
          <section aria-label="Auction Terms">
            <AuctionTermsSection />
          </section>

          {/* Cancel Confirmation Modal */}
          <CancelAuctionModal
            isOpen={isCancelModalOpen}
            auction={auction}
            isLoading={isCancelling}
            error={cancelError}
            onClose={handleCloseCancelModal}
            onConfirm={cancel}
          />
        </>
      )}
    </div>
  );
};

export default AuctionDetailPage;
