import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
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
          <Link to={ROUTES.AUCTIONS}>
            <Button variant="accent" size="sm">
              {t('detail.backToAuctions')}
            </Button>
          </Link>
        </div>
      )}

      {/* Main Auction Presentation */}
      {!isLoading && auction && (
        <>
          {/* Main 2-Column Responsive Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column (Desktop 7 cols): Gallery & Description & Seller */}
            <div className="lg:col-span-7 space-y-6 sm:space-y-8">
              {/* Media Image Gallery */}
              <section aria-label="Auction Media Gallery">
                <AuctionImageGallery
                  images={auction.images}
                  title={auction.title}
                  category={auction.category}
                  status={effectiveStatus || auction.status}
                />
              </section>

              {/* Product Specifications & Description */}
              <section aria-label="Product Description">
                <AuctionDescription description={auction.description} />
              </section>

              {/* Seller Identity & Verified Credentials */}
              {auction.sellerId && (
                <section aria-label="Seller Information">
                  <AuctionSellerCard
                    sellerId={auction.sellerId}
                    canContact={isWinner}
                  />
                </section>
              )}
            </div>

            {/* Right Column (Desktop 5 cols): Title, Price, Bidding Box & CTA */}
            <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-20">
              {/* Core Auction Meta & Breadcrumbs */}
              <AuctionInfoSection
                auction={auction}
              />

              {/* Action Box: Price, Timer, Bidding Controls or Escrow Action */}
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

              {/* Mobile-only Seller Card Placement */}
              {auction.sellerId && (
                <div className="block lg:hidden">
                  <AuctionSellerCard
                    sellerId={auction.sellerId}
                    canContact={isWinner}
                  />
                </div>
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
