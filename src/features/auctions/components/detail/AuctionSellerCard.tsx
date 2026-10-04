import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  UserCheck,
  Star,
  ShieldCheck,
  ExternalLink,
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { toLocalizedDigits } from '@/utils/formatters';
import { ROUTES } from '@/constants/routes.constants';
import { usePublicProfile, UserAvatar } from '@/features/users';

export interface AuctionSellerCardProps {
  sellerId: string;
  sellerName?: string;
  sellerRating?: number;
  reviewsCount?: number;
  memberSince?: string;
  isVerified?: boolean;
  className?: string;
}

export const AuctionSellerCard: React.FC<AuctionSellerCardProps> = ({
  sellerId,
  sellerName,
  sellerRating,
  reviewsCount,
  memberSince,
  isVerified = true,
  className,
}) => {
  const { t, i18n } = useTranslation('auctions');
  const isRTL = i18n.language?.startsWith('ar');

  // Query real public profile via architectural custom hook
  const { data: profile } = usePublicProfile(sellerName ? undefined : sellerId);

  const realName = sellerName || (profile ? `${profile.firstName} ${profile.lastName}` : null);
  const displayName = realName || t('detail.defaultSellerName', 'بائع مزادك');

  const rating = typeof sellerRating === 'number' ? sellerRating : profile?.ratingStats?.averageRating;
  const count = typeof reviewsCount === 'number' ? reviewsCount : profile?.ratingStats?.totalReviews;
  const hasReviews = typeof count === 'number' && count > 0 && typeof rating === 'number';

  const localizedRating = hasReviews && rating ? (isRTL ? toLocalizedDigits(rating, true) : rating) : null;
  const localizedReviews = hasReviews && count ? (isRTL ? toLocalizedDigits(count, true) : count) : null;

  const rawYear = memberSince || (profile?.memberSince ? new Date(profile.memberSince).getFullYear().toString() : new Date().getFullYear().toString());
  const localizedMemberSince = isRTL ? toLocalizedDigits(rawYear, true) : rawYear;

  const firstName = profile?.firstName || displayName.split(' ')[0] || displayName;
  const lastName = profile?.lastName || displayName.split(' ').slice(1).join(' ') || '';

  return (
    <div
      data-seller-id={sellerId}
      className={cn(
        'rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-sm space-y-4 hover:border-amber-500/30 dark:hover:border-amber-500/40 transition-colors',
        className
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400">
          {t('detail.sellerInfo', 'معلومات البائع')}
        </h3>

        {isVerified && (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{t('detail.verifiedSeller', 'بائع موثوق')}</span>
          </span>
        )}
      </div>

      {/* Seller Identity Row as Clickable Link to Public Profile */}
      <Link
        to={ROUTES.USER_PUBLIC(sellerId)}
        className="group/seller flex items-center justify-between gap-3.5 p-2 -m-2 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-all cursor-pointer"
        title={t('detail.viewProfile', 'عرض الملف الشخصي للبائع')}
      >
        <div className="flex items-center gap-3.5 min-w-0">
          <UserAvatar
            firstName={firstName}
            lastName={lastName}
            userId={sellerId}
            size="lg"
            className="group-hover/seller:scale-105 transition-transform"
          />

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 font-bold text-sm text-slate-900 dark:text-white truncate group-hover/seller:text-amber-500 transition-colors">
              <span className="truncate">{displayName}</span>
              <UserCheck className="w-4 h-4 text-emerald-500 shrink-0" />
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-1 flex-wrap">
              {hasReviews ? (
                <div className="flex items-center gap-1 text-amber-500 font-semibold">
                  <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                  <span>{localizedRating}</span>
                  <span className="text-slate-400 font-normal">({localizedReviews})</span>
                </div>
              ) : (
                <span className="text-[11px] text-amber-600 dark:text-amber-400/90 font-medium">
                  {t('detail.noReviewsYet', 'لا توجد تقييمات بعد')}
                </span>
              )}

              <span>•</span>

              <span>{t('detail.memberSince', { date: localizedMemberSince })}</span>
            </div>
          </div>
        </div>

        {/* View Profile Action Hint */}
        <div className="shrink-0 text-slate-400 group-hover/seller:text-amber-500 group-hover/seller:translate-x-[-2px] rtl:group-hover/seller:translate-x-[2px] transition-all">
          <ExternalLink className="w-4 h-4" />
        </div>
      </Link>
    </div>
  );
};

export default AuctionSellerCard;
