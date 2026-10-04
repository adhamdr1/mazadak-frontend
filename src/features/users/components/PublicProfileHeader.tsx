import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Calendar,
  MapPin,
  Star,
  Gavel,
  CheckCircle2,
  Edit3,
  ShieldCheck,
} from 'lucide-react';
import { UserAvatar } from './UserAvatar';
import { ROUTES } from '@/constants/routes.constants';
import { formatDateTime, toLocalizedDigits } from '@/utils/formatters';
import type { PublicProfile } from '../types/users.types';

export interface PublicProfileHeaderProps {
  profile: PublicProfile;
  isOwner?: boolean;
  className?: string;
}

export const PublicProfileHeader: React.FC<PublicProfileHeaderProps> = ({
  profile,
  isOwner = false,
  className = '',
}) => {
  const { t, i18n } = useTranslation(['users', 'common']);
  const isRTL = i18n.language?.startsWith('ar');

  const fullName = `${profile.firstName} ${profile.lastName}`.trim();

  const memberSinceFormatted = profile.memberSince
    ? formatDateTime(profile.memberSince, isRTL, {
        year: 'numeric',
        month: 'long',
      })
    : '';

  const avgRating = profile.ratingStats?.averageRating;
  const totalReviews = profile.ratingStats?.totalReviews || 0;
  const hasRating = typeof avgRating === 'number' && avgRating > 0;

  return (
    <div
      className={`relative overflow-hidden rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm p-6 sm:p-8 lg:p-9 ${className}`}
    >
      <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6 text-center sm:text-start">
        {/* User Identity Info */}
        <div className="flex flex-col sm:flex-row items-center gap-5 sm:gap-6">
          <UserAvatar
            firstName={profile.firstName}
            lastName={profile.lastName}
            userId={profile.id}
            size="2xl"
          />

          <div className="space-y-2">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                {fullName}
              </h1>

              {hasRating && avgRating >= 4.5 && (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>{t('users:profile.verifiedUser', 'عضو موثوق')}</span>
                </span>
              )}
            </div>

            {/* Meta Tags: City & Member Since */}
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 sm:gap-4 text-xs text-slate-500 dark:text-slate-400">
              {profile.city && (
                <span className="flex items-center gap-1.5 font-medium">
                  <MapPin className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span>{profile.city}</span>
                </span>
              )}

              {memberSinceFormatted && (
                <span className="flex items-center gap-1.5 font-medium">
                  <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{t('users:public.memberSince', { date: memberSinceFormatted })}</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Action: Edit Profile (Only for Owner viewing their own profile) */}
        {isOwner && (
          <Link
            to={ROUTES.PROFILE}
            className="group relative inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold shrink-0 self-center sm:self-start bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-800 dark:text-slate-200 border border-slate-200/90 dark:border-slate-700/80 hover:border-amber-500/50 transition-all duration-200 cursor-pointer shadow-2xs"
            title={t('users:profile.editProfileHint', 'تعديل ملفك الشخصي وإعداداتك')}
          >
            <Edit3 className="w-3.5 h-3.5 text-amber-500 transition-transform group-hover:scale-110" />
            <span>{t('users:profile.editProfile', 'تعديل الملف الشخصي')}</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-amber-500/15 text-amber-600 dark:text-amber-400 font-extrabold">
              {t('users:profile.yourAccount', 'حسابك')}
            </span>
          </Link>
        )}
      </div>

      {/* Quick Stats Grid */}
      <div className="relative z-10 mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        {/* Stat 1: Rating */}
        <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800">
          <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-500 flex items-center justify-center shrink-0">
            <Star className="w-5 h-5 fill-amber-500 text-amber-500" />
          </div>
          <div className="min-w-0">
            <span className="block text-xs font-semibold text-slate-500 dark:text-slate-400">
              {t('users:reputation.title', 'التقييم العام')}
            </span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                {hasRating
                  ? isRTL
                    ? toLocalizedDigits(avgRating.toFixed(1), true)
                    : avgRating.toFixed(1)
                  : isRTL
                  ? '٠.٠'
                  : '0.0'}
              </span>
              <span className="text-xs text-slate-400">
                ({isRTL ? toLocalizedDigits(totalReviews, true) : totalReviews})
              </span>
            </div>
          </div>
        </div>

        {/* Stat 2: Active Auctions */}
        <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center shrink-0">
            <Gavel className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <span className="block text-xs font-semibold text-slate-500 dark:text-slate-400">
              {t('users:public.activeAuctions', 'مزادات نشطة')}
            </span>
            <span className="block text-base sm:text-lg font-black text-slate-900 dark:text-white mt-0.5">
              {isRTL
                ? toLocalizedDigits(profile.activeAuctionsCount, true)
                : profile.activeAuctionsCount}
            </span>
          </div>
        </div>

        {/* Stat 3: Completed Auctions */}
        <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800">
          <div className="w-10 h-10 rounded-xl bg-blue-500/15 text-blue-500 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <span className="block text-xs font-semibold text-slate-500 dark:text-slate-400">
              {t('users:public.completedAuctions', 'مزادات مكتملة')}
            </span>
            <span className="block text-base sm:text-lg font-black text-slate-900 dark:text-white mt-0.5">
              {isRTL
                ? toLocalizedDigits(profile.completedAuctionsCount, true)
                : profile.completedAuctionsCount}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
