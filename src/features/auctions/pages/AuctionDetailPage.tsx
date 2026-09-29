import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AlertTriangle, MessageSquare } from 'lucide-react';
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
import { AutoBidModal } from '@/features/bids/components/AutoBidModal';
import { AuctionBidHistory } from '@/features/bids/components/AuctionBidHistory';
import { AuctionChatDrawer } from '@/features/chat';
import { Button } from '@/components/common/Button';
import { EscrowBanner } from '@/components/common/EscrowBanner';
import { ROUTES } from '@/constants/routes.constants';
import { useAuth } from '@/hooks/useAuth';

export const AuctionDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation(['auctions', 'chat']);
  const { user } = useAuth();

  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isAutoBidModalOpen, setIsAutoBidModalOpen] = useState(false);
  const [isChatDrawerOpen, setIsChatDrawerOpen] = useState(false);

  const {
    auction,
    effectiveStatus,
    isLoading,
    isError,
    error,
    isSeller,
    isWinner,
    hasBids,
    refetch,
  } = useAuctionDetail(id);

  // Chat is strictly available ONLY when the auction has a winner AND the user is Seller, Winner, or Admin
  const hasWinner = Boolean(auction?.winnerId);
  const canAccessChat = Boolean(
    user && hasWinner && (isSeller || isWinner || user.role === 'ADMIN')
  );

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
          {/* Top Real-time Escrow & Dispute Status Banner */}
          <EscrowBanner auctionId={auction._id} />

          {/* Main 2-Column Responsive Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
            {/* Left Column (Desktop 7/8 cols): Gallery, Specs, Description & Desktop Seller Profile */}
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

              {/* 3. Product Description (Directly under Specs!) */}
              <section aria-label="Product Description">
                <AuctionDescription description={auction.description} />
              </section>

              {/* 4. Verified Seller Profile Card — strictly visible under Description on Desktop (Full Screen) */}
              {!isSeller && auction.sellerId && (
                <div className="hidden lg:block">
                  <section aria-label="Seller Information">
                    <AuctionSellerCard
                      sellerId={auction.sellerId}
                    />
                  </section>
                </div>
              )}
            </div>

            {/* Right Column (Desktop 5/4 cols): Sticky Sidebar with Price, Live Bids & Mobile Seller Profile */}
            <div className="lg:col-span-5 xl:col-span-4 space-y-6 lg:sticky lg:top-24 self-start">
              {/* 1. Action Box: Price, Timer, Bidding Controls or Seller Controls */}
              <AuctionBiddingCTA
                auction={auction}
                effectiveStatus={effectiveStatus || auction.status}
                isSeller={isSeller}
                isWinner={isWinner}
                hasBids={hasBids}
                onCancelAuction={
                  (effectiveStatus || auction.status) === 'PENDING' && isSeller
                    ? handleOpenCancelModal
                    : undefined
                }
                onOpenAutoBid={
                  (effectiveStatus || auction.status) === 'ACTIVE' && !isSeller
                    ? () => setIsAutoBidModalOpen(true)
                    : undefined
                }
                isCancelling={isCancelling}
              />

              {/* 2. Live Bid History Stream: directly under Price & Bidding Box */}
              <AuctionBidHistory
                auctionId={auction._id}
                auctionStatus={effectiveStatus || auction.status}
              />

              {/* 3. Live Auction Chat CTA Card (Strictly visible only when auction has a winner and user is authorized) */}
              {canAccessChat && (
                <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 sm:p-5 shadow-sm space-y-3 hover:border-amber-500/30 dark:hover:border-amber-500/40 transition-colors">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-10 h-10 rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/20">
                        <MessageSquare className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                          {t('chat:drawer.title', 'شات المزاد')}
                        </h4>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                          {t('chat:messages.chatSub', 'تواصل مباشر بين البائع والفائز')}
                        </p>
                      </div>
                    </div>

                    <Button
                      variant="accent"
                      size="sm"
                      onClick={() => setIsChatDrawerOpen(true)}
                      className="rounded-xl shrink-0 font-bold"
                    >
                      {t('chat:openChat', 'فتح الشات')}
                    </Button>
                  </div>
                </div>
              )}

              {/* 4. Verified Seller Profile Card — strictly visible under Bid History on Mobile / Split-Screen */}
              {!isSeller && auction.sellerId && (
                <div className="block lg:hidden">
                  <section aria-label="Seller Information">
                    <AuctionSellerCard
                      sellerId={auction.sellerId}
                    />
                  </section>
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

          {/* Auto-Bid Configuration Modal */}
          {isAutoBidModalOpen && (
            <AutoBidModal
              isOpen={isAutoBidModalOpen}
              auction={auction}
              onClose={() => setIsAutoBidModalOpen(false)}
            />
          )}

          {/* Real-time Auction Chat Drawer (Only for authorized winner / seller / admin) */}
          {canAccessChat && (
            <AuctionChatDrawer
              auctionId={auction._id}
              auctionTitle={auction.title}
              isAuctionActive={(effectiveStatus || auction.status) === 'ACTIVE'}
              isOpen={isChatDrawerOpen}
              onClose={() => setIsChatDrawerOpen(false)}
            />
          )}
        </>
      )}
    </div>
  );
};

export default AuctionDetailPage;
