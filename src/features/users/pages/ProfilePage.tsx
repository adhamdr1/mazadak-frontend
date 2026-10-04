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
import { RatingBreakdownCard } from '@/features/reviews';
import { ROUTES } from '@/constants/routes.constants';
import { formatDateTime } from '@/utils/formatters';
import type { ProfileTabType } from '../types/users.types';

export const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const { t, i18n } = useTranslation(['users', 'common']);
  const isRTL = i18n.language?.startsWith('ar');

  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = (searchParams.get('tab') as ProfileTabType) || 'personal';

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
        <div className="relative flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6 text-center sm:text-start">
          <div className="flex flex-col sm:flex-row items-center gap-5 sm:gap-6">
            {/* User Avatar */}
            <UserAvatar
              firstName={user.firstName}
              lastName={user.lastName}
              userId={user._id}
              size="2xl"
              isAdmin={user.role === 'ADMIN'}
            />

            {/* User Meta Information */}
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                  {user.firstName} {user.lastName}
                </h1>
              </div>

              <p className="text-sm text-slate-500 dark:text-slate-400 font-mono">
                {user.email}
              </p>

              {memberSinceFormatted && (
                <p className="text-xs text-slate-400 dark:text-slate-500 flex items-center justify-center sm:justify-start gap-1.5 pt-1">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{t('users:profile.memberSince', { date: memberSinceFormatted })}</span>
                </p>
              )}
            </div>
          </div>

          {/* Action Link to Public Profile - Styled like browseAuctions in Messages */}
          <Link
            to={ROUTES.USER_PUBLIC(user._id)}
            className="group relative inline-flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-black shrink-0 self-center sm:self-start bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-lg shadow-amber-500/20 hover:shadow-amber-500/35 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 overflow-hidden select-none cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-slate-950" />
            <span>{t('users:profile.viewPublicProfile')}</span>
            <ExternalLink className="w-4 h-4 text-slate-950 transition-transform group-hover:scale-110" />
          </Link>
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
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>{t('users:reputation.title')}</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {t('users:reputation.description')}
                </p>
              </div>

              {/* Action Link to Reviews on Public Profile */}
              <Link
                to={ROUTES.USER_PUBLIC(user._id) + '?tab=reviews'}
                className="group relative inline-flex items-center justify-center gap-2 px-4 py-2 rounded-2xl text-xs font-black bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-md shadow-amber-500/20 hover:shadow-amber-500/35 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 overflow-hidden select-none shrink-0 self-start sm:self-auto cursor-pointer"
              >
                <span>{t('users:reputation.viewAllReviews')}</span>
                <ExternalLink className="w-3.5 h-3.5 text-slate-950 transition-transform group-hover:scale-110" />
              </Link>
            </div>

            {/* Rating Breakdown Card */}
            <RatingBreakdownCard stats={user.ratingStats || undefined} />
          </div>
        )}
      </div>
    </div>
  );
};
