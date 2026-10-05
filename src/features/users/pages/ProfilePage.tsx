import React from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  User as UserIcon,
  KeyRound,
  Star,
  ExternalLink,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { UserAvatar } from '../components/UserAvatar';
import { ProfileInfoForm } from '../components/ProfileInfoForm';
import { SecuritySettingsCard } from '../components/SecuritySettingsCard';
import { UserReviewsSection, useUserRatingStats } from '@/features/reviews';
import { ROUTES } from '@/constants/routes.constants';
import { formatDateTime } from '@/utils/formatters';
import type { ProfileTabType } from '../types/users.types';

export const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const { t, i18n } = useTranslation(['users', 'common']);
  const isRTL = i18n.language?.startsWith('ar');

  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = (searchParams.get('tab') as ProfileTabType) || 'personal';

  // Always fetch fresh live rating stats for the profile owner
  const { data: freshStats } = useUserRatingStats({
    userId: user?._id || '',
    enabled: Boolean(user?._id),
  });

  const effectiveStats = freshStats || user?.ratingStats || undefined;

  const handleTabChange = (tab: ProfileTabType) => {
    setSearchParams({ tab });
  };

  if (!user) {
    return null;
  }

  const memberSinceFormatted = user.createdAt
    ? formatDateTime(user.createdAt, isRTL, {
        year: 'numeric',
        month: 'long',
      })
    : '';

  return (
    <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8 animate-in fade-in duration-200">
      {/* Profile Header Card */}
      <div className="relative overflow-hidden rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm p-6 sm:p-8 lg:p-9">
        <div className="relative flex flex-col md:flex-row items-center md:items-start justify-between gap-5 sm:gap-6 text-center md:text-start w-full min-w-0">
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 min-w-0 max-w-full">
            {/* User Avatar */}
            <UserAvatar
              firstName={user.firstName}
              lastName={user.lastName}
              userId={user._id}
              size="2xl"
              isAdmin={user.role === 'ADMIN'}
            />

            {/* User Meta Information */}
            <div className="space-y-1.5 min-w-0 text-center sm:text-start">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5 min-w-0">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 dark:text-white tracking-tight truncate max-w-full">
                  {user.firstName} {user.lastName}
                </h1>
              </div>

              <p className="text-sm text-slate-500 dark:text-slate-400 font-mono truncate max-w-full">
                {user.email}
              </p>

              {memberSinceFormatted && (
                <p className="text-xs text-slate-400 dark:text-slate-500 flex items-center justify-center sm:justify-start gap-1.5 pt-0.5 truncate max-w-full">
                  <Calendar className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{t('users:profile.memberSince', { date: memberSinceFormatted })}</span>
                </p>
              )}
            </div>
          </div>

          {/* Action Links: Public Profile & Reviews (Side-by-side on Full Screen, Stacked vertically on Half Screen) */}
          <div className="flex flex-col xl:flex-row items-stretch xl:items-center gap-2.5 shrink-0 self-center md:self-start xl:self-center w-full md:w-auto min-w-0">
            <Link
              to={ROUTES.USER_PUBLIC(user._id)}
              className="group relative inline-flex items-center justify-center gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-black bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-md shadow-amber-500/20 hover:shadow-amber-500/35 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 overflow-hidden select-none cursor-pointer w-full xl:w-auto text-center whitespace-nowrap"
            >
              <Sparkles className="w-4 h-4 text-slate-950 shrink-0" />
              <span>{t('users:profile.viewPublicProfile', 'الملف العام')}</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-950 transition-transform group-hover:scale-110 shrink-0" />
            </Link>

            <Link
              to={ROUTES.USER_PUBLIC(user._id) + '?tab=reviews'}
              className="group relative inline-flex items-center justify-center gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-slate-50 dark:bg-slate-800/90 hover:bg-slate-100 dark:hover:bg-slate-700/80 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 shadow-xs hover:border-amber-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 overflow-hidden select-none cursor-pointer w-full xl:w-auto text-center whitespace-nowrap"
            >
              <Star className="w-4 h-4 text-amber-500 fill-amber-500 shrink-0" />
              <span>{t('reviews:title', 'التقييمات والآراء')}</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-500 transition-colors shrink-0" />
            </Link>
          </div>
        </div>

        {/* Tab Navigation Segmented Bar - 3 Columns Perfectly Balanced */}
        <div className="mt-8 pt-4 border-t border-slate-200/80 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
          {/* Tab 1: Personal */}
          <button
            type="button"
            onClick={() => handleTabChange('personal')}
            className={`flex items-center justify-center gap-2.5 px-4 py-3 rounded-2xl text-xs sm:text-sm font-bold transition-all w-full cursor-pointer text-center ${
              currentTab === 'personal'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/25 font-black scale-[1.01]'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/80'
            }`}
          >
            <UserIcon className="w-4 h-4 shrink-0" />
            <span className="truncate">{t('users:profile.tabs.personal')}</span>
          </button>

          {/* Tab 2: Security */}
          <button
            type="button"
            onClick={() => handleTabChange('security')}
            className={`flex items-center justify-center gap-2.5 px-4 py-3 rounded-2xl text-xs sm:text-sm font-bold transition-all w-full cursor-pointer text-center ${
              currentTab === 'security'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/25 font-black scale-[1.01]'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/80'
            }`}
          >
            <KeyRound className="w-4 h-4 shrink-0" />
            <span className="truncate">{t('users:profile.tabs.security')}</span>
          </button>

          {/* Tab 3: Reputation */}
          <button
            type="button"
            onClick={() => handleTabChange('reputation')}
            className={`flex items-center justify-center gap-2.5 px-4 py-3 rounded-2xl text-xs sm:text-sm font-bold transition-all w-full cursor-pointer text-center ${
              currentTab === 'reputation'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/25 font-black scale-[1.01]'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/80'
            }`}
          >
            <Star className="w-4 h-4 shrink-0" />
            <span className="truncate">{t('users:profile.tabs.reputation')}</span>
          </button>
        </div>
      </div>

      {/* Tab Panels */}
      <div className="transition-all duration-200">
        {/* Tab 1: Personal Info */}
        {currentTab === 'personal' && <ProfileInfoForm user={user} />}

        {/* Tab 2: Security & Password */}
        {currentTab === 'security' && <SecuritySettingsCard user={user} />}

        {/* Tab 3: Reputation & Reviews */}
        {currentTab === 'reputation' && (
          <div className="space-y-6">
            <UserReviewsSection
              userId={user._id}
              currentUserId={user._id}
              ratingStats={effectiveStats}
              paginationMode="local"
            />
          </div>
        )}
      </div>
    </div>
  );
};
