import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Lock,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  ExternalLink,
  Gavel,
  Clock,
  Ban,
  ShieldAlert,
} from 'lucide-react';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { ROUTES } from '@/constants/routes.constants';
import type { Auction } from '../../types/auctions.types';

interface AuctionLockedBannerProps {
  auction: Auction;
  isSeller: boolean;
}

export const AuctionLockedBanner: React.FC<AuctionLockedBannerProps> = ({
  auction,
  isSeller,
}) => {
  const { t, i18n } = useTranslation('auctions');
  const isRTL = i18n.language === 'ar';
  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight;

  let reasonTitle = t('edit.lockedNotPending');
  let reasonHint = t('edit.lockedActiveHint');
  let statusIcon = <Clock className="w-8 h-8 text-amber-500" />;

  if (!isSeller) {
    reasonTitle = t('edit.lockedNotSeller');
    reasonHint = t('edit.lockedNotSeller');
    statusIcon = <ShieldAlert className="w-8 h-8 text-red-500" />;
  } else if (auction.status === 'ACTIVE') {
    reasonTitle = t('edit.lockedNotPending');
    reasonHint = t('edit.lockedActiveHint');
    statusIcon = <Gavel className="w-8 h-8 text-emerald-500" />;
  } else if (auction.status === 'ENDED') {
    reasonTitle = t('edit.lockedNotPending');
    reasonHint = t('edit.lockedEndedHint');
    statusIcon = <Clock className="w-8 h-8 text-slate-500" />;
  } else if (auction.status === 'CANCELLED') {
    reasonTitle = t('edit.lockedNotPending');
    reasonHint = t('edit.lockedCancelledHint');
    statusIcon = <Ban className="w-8 h-8 text-red-500" />;
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <Card
        glass
        padding="lg"
        className="text-center shadow-2xl border border-amber-500/30 dark:border-amber-500/20 relative overflow-hidden"
      >
        {/* Background Subtle Gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-amber-500/5 to-transparent pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center space-y-6">
          {/* Header Icon */}
          <div className="relative">
            <div className="w-20 h-20 rounded-3xl bg-amber-500/10 dark:bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-500 shadow-inner">
              {statusIcon}
            </div>
            <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-slate-900 border-2 border-slate-50 dark:border-slate-900 flex items-center justify-center text-amber-400">
              <Lock className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Heading and Description */}
          <div className="space-y-2 max-w-lg">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>{t('edit.lockedTitle')}</span>
            </div>
            <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
              {reasonTitle}
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              {reasonHint}
            </p>
          </div>

          {/* Auction Overview Pill */}
          <div className="w-full max-w-md p-4 rounded-2xl bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 text-start flex items-center gap-3">
            {auction.images?.[0] ? (
              <img
                src={auction.images[0]}
                alt={auction.title}
                className="w-14 h-14 rounded-xl object-cover border border-slate-200 dark:border-slate-700 flex-shrink-0"
              />
            ) : (
              <div className="w-14 h-14 rounded-xl bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-400 flex-shrink-0">
                <Gavel className="w-6 h-6" />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                {auction.title}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {t(`categories.${auction.category}`)} • {t(`status.${auction.status}`)}
              </p>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2 w-full max-w-md">
            <Button
              to={ROUTES.AUCTION_DETAIL(auction._id)}
              variant="accent"
              size="md"
              fullWidth
              className="w-full sm:w-auto flex-1"
              rightIcon={<ExternalLink className="w-4 h-4" />}
            >
              {t('edit.viewAuction')}
            </Button>
            <Button
              to={ROUTES.MY_AUCTIONS}
              variant="outline"
              size="md"
              fullWidth
              className="w-full sm:w-auto flex-1"
              leftIcon={<ArrowIcon className="w-4 h-4" />}
            >
              {t('edit.myAuctions')}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};
