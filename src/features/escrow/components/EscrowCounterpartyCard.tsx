import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { User, Star, MapPin, ExternalLink, ShieldCheck } from 'lucide-react';
import type { PublicProfile } from '@/features/users/types/users.types';
import { ROUTES } from '@/constants/routes.constants';
import { toLocalizedDigits } from '@/utils/formatters';
import { cn } from '@/utils/cn';

export interface EscrowCounterpartyCardProps {
  profile?: PublicProfile | null;
  role: 'buyer' | 'seller';
  isLoading?: boolean;
  className?: string;
}

export const EscrowCounterpartyCard: React.FC<EscrowCounterpartyCardProps> = ({
  profile,
  role,
  isLoading = false,
  className,
}) => {
  const { t, i18n } = useTranslation(['escrow', 'common']);
  const isRTL = i18n.language?.startsWith('ar');

  if (isLoading) {
    return (
      <div
        className={cn(
          'rounded-3xl p-5 sm:p-6 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 animate-pulse space-y-4',
          className
        )}
      >
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-200 dark:bg-slate-800" />
          <div className="space-y-2 flex-1">
            <div className="h-4 w-28 bg-slate-200 dark:bg-slate-800 rounded" />
            <div className="h-3 w-20 bg-slate-100 dark:bg-slate-800/60 rounded" />
          </div>
        </div>
      </div>
    );
  }

  const isSellerRole = role === 'seller';
  const roleLabel = isSellerRole
    ? t('counterparty.sellerRole', isRTL ? 'البائع' : 'Seller')
    : t('counterparty.buyerRole', isRTL ? 'المشتري' : 'Buyer');

  const firstName = profile?.firstName || '';
  const lastName = profile?.lastName || '';
  const fullName =
    `${firstName} ${lastName}`.trim() ||
    t('counterparty.anonymousUser', isRTL ? 'مستخدم' : 'User');

  const initials =
    `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() ||
    firstName.charAt(0).toUpperCase() ||
    '';

  const rating = Number(profile?.ratingStats?.averageRating || 0);
  const reviewsCount = Number(profile?.ratingStats?.totalReviews || 0);

  return (
    <div
      className={cn(
        'group relative rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-5 sm:p-6 space-y-4 shadow-sm hover:shadow-xl hover:shadow-slate-200/70 dark:shadow-[0_4px_20px_-2px_rgba(0,0,0,0.5)] dark:hover:shadow-[0_12px_35px_-5px_rgba(0,0,0,0.8),0_0_25px_rgba(245,158,11,0.18)] hover:border-amber-500/50 dark:hover:border-amber-500/50 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between',
        className
      )}
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
            {t('counterparty.sectionTitle', isRTL ? 'الطرف الآخر في المعاملة' : 'Transaction Counterparty')}
          </span>
          <span
            className={cn(
              'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border shadow-2xs',
              isSellerRole
                ? 'bg-amber-500/10 dark:bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30'
                : 'bg-emerald-500/10 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30'
            )}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{roleLabel}</span>
          </span>
        </div>

        <div className="flex items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center shrink-0 border border-slate-200/80 dark:border-slate-700/80 font-black text-base shadow-2xs">
              {initials ? (
                <span>{initials}</span>
              ) : (
                <User className="w-5 h-5 text-slate-400" />
              )}
            </div>

            <div className="space-y-1 min-w-0">
              <h5 className="text-sm sm:text-base font-black text-slate-900 dark:text-white truncate">
                {fullName}
              </h5>

              <div className="flex items-center flex-wrap gap-2 text-xs text-slate-500 dark:text-slate-400">
                {profile?.city && (
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{profile.city}</span>
                  </span>
                )}

                {rating > 0 && !isNaN(rating) && (
                  <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400 font-bold">
                    <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                    <span>{toLocalizedDigits(rating.toFixed(1), isRTL)}</span>
                    <span className="text-slate-400 font-normal">
                      ({toLocalizedDigits(reviewsCount, isRTL)})
                    </span>
                  </span>
                )}
              </div>
            </div>
          </div>

          {profile?.id && (
            <Link
              to={ROUTES.USER_PUBLIC(profile.id)}
              className="group/profile-btn inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:bg-amber-500 dark:hover:bg-amber-400 text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-slate-950 border border-slate-200/80 dark:border-slate-700/80 hover:border-amber-500/40 text-xs font-black transition-all duration-200 hover:scale-105 active:scale-95 shadow-2xs hover:shadow-md cursor-pointer shrink-0 select-none"
            >
              <span>{t('counterparty.viewProfile', isRTL ? 'الملف الشخصي' : 'Public Profile')}</span>
              <ExternalLink className="w-3.5 h-3.5 transition-transform duration-200 group-hover/profile-btn:translate-x-0.5 group-hover/profile-btn:-translate-y-0.5 rtl:group-hover/profile-btn:-translate-x-0.5" />
            </Link>
          )}
        </div>
      </div>

      <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 text-[11px] text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
        <span>
          {t(
            'counterparty.verifiedNotice',
            isRTL
              ? 'جميع المتعاملين في نظام الضمان موثقون وخاضعون لسياسات حماية المشتري والبائع.'
              : 'All participants in the escrow protection system are identity-verified and bound by platform terms.'
          )}
        </span>
      </div>
    </div>
  );
};

