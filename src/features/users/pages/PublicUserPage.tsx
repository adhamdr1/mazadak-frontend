import React from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Gavel,
  CheckCircle2,
  Star,
  UserX,
  ArrowRight,
  ArrowLeft,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { usePublicProfile } from '../hooks/usePublicProfile';
import { useUserReputationSubscription } from '../hooks/useUserReputationSubscription';
import { PublicProfileHeader } from '../components/PublicProfileHeader';
import { UserAuctionsList } from '../components/UserAuctionsList';
import { UserReviewsTab } from '../components/UserReviewsTab';
import { Button } from '@/components/common/Button';
import { ROUTES } from '@/constants/routes.constants';
import { toLocalizedDigits } from '@/utils/formatters';
import type { PublicProfileTabType } from '../types/users.types';

export const PublicUserPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user: currentUser } = useAuth();
  const { t, i18n } = useTranslation(['users', 'common']);
  const isRTL = i18n.language?.startsWith('ar');

  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = (searchParams.get('tab') as PublicProfileTabType) || 'active';
  const auctionPage = Math.max(1, parseInt(searchParams.get('auctionPage') || '1', 10));
  const reviewPage = Math.max(1, parseInt(searchParams.get('reviewPage') || '1', 10));

  // Query public profile data
  const {
    data: profile,
    isLoading,
    isError,
    error,
  } = usePublicProfile(id);

  // Subscribe to real-time reputation changes via WebSocket
  useUserReputationSubscription({
    userId: id,
    enabled: Boolean(id && profile),
  });

  const isOwner = Boolean(currentUser && id && currentUser._id === id);

  const handleTabChange = (tab: PublicProfileTabType) => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set('tab', tab);
    setSearchParams(nextParams);
  };

  const handleAuctionPageChange = (newPage: number) => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set('auctionPage', newPage.toString());
    setSearchParams(nextParams);
  };

  const handleReviewPageChange = (newPage: number) => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set('reviewPage', newPage.toString());
    setSearchParams(nextParams);
  };

  const BackIcon = isRTL ? ArrowRight : ArrowLeft;

  // 1. Loading Skeleton State
  if (isLoading) {
    return (
      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8 animate-pulse">
        {/* Header Skeleton */}
        <div className="rounded-3xl bg-slate-100 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-8 h-72 flex flex-col justify-between" />
        {/* Tabs Skeleton */}
        <div className="h-14 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800" />
        {/* Content Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={`profile-load-${i}`}
              className="h-80 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800"
            />
          ))}
        </div>
      </div>
    );
  }

  // 2. User Not Found / Error State
  if (isError || !profile || !id) {
    return (
      <div className="max-w-3xl w-full mx-auto px-4 sm:px-6 py-16 text-center">
        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl p-8 sm:p-12 space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-500 mx-auto flex items-center justify-center border border-amber-500/20">
            <UserX className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              {t('users:public.notFoundTitle', 'المستخدم غير موجود')}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
              {error?.message ||
                t(
                  'users:public.notFoundMessage',
                  'عذراً، لم نتمكن من العثور على الحساب المطلوب أو ربما تم حذفه أو تعطيله.'
                )}
            </p>
          </div>

          <div className="pt-2">
            <Link to={ROUTES.AUCTIONS}>
              <Button variant="accent" size="md" leftIcon={<BackIcon className="w-4 h-4" />}>
                {t('users:public.backToAuctions', 'العودة إلى سوق المزادات')}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const activeAuctionsCount = profile.activeAuctionsCount || 0;
  const completedAuctionsCount = profile.completedAuctionsCount || 0;
  const totalReviewsCount = profile.ratingStats?.totalReviews || 0;

  return (
    <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8 animate-in fade-in duration-200">
      {/* 1. Public Profile Header Card */}
      <PublicProfileHeader profile={profile} isOwner={isOwner} />

      {/* 2. Interactive Segmented Tabs Navigation Bar */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-1.5 sm:p-2 shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5 sm:gap-2">
          {/* Tab 1: Active Auctions */}
          <button
            type="button"
            onClick={() => handleTabChange('active')}
            className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              currentTab === 'active'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/25 font-black scale-[1.01]'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/80'
            }`}
          >
            <Gavel className="w-4 h-4 shrink-0" />
            <span className="truncate">{t('users:public.activeAuctions', 'مزادات نشطة')}</span>
            <span
              className={`px-1.5 py-0.5 rounded-full text-[10px] font-black shrink-0 ${
                currentTab === 'active'
                  ? 'bg-slate-950/15 text-slate-950'
                  : 'bg-slate-200/80 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
              }`}
            >
              {isRTL ? toLocalizedDigits(activeAuctionsCount, true) : activeAuctionsCount}
            </span>
          </button>

          {/* Tab 2: Completed Auctions */}
          <button
            type="button"
            onClick={() => handleTabChange('completed')}
            className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              currentTab === 'completed'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/25 font-black scale-[1.01]'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/80'
            }`}
          >
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span className="truncate">{t('users:public.completedAuctions', 'مزادات مكتملة')}</span>
            <span
              className={`px-1.5 py-0.5 rounded-full text-[10px] font-black shrink-0 ${
                currentTab === 'completed'
                  ? 'bg-slate-950/15 text-slate-950'
                  : 'bg-slate-200/80 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
              }`}
            >
              {isRTL ? toLocalizedDigits(completedAuctionsCount, true) : completedAuctionsCount}
            </span>
          </button>

          {/* Tab 3: Reviews */}
          <button
            type="button"
            onClick={() => handleTabChange('reviews')}
            className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              currentTab === 'reviews'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/25 font-black scale-[1.01]'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/80'
            }`}
          >
            <Star className="w-4 h-4 shrink-0" />
            <span className="truncate">{t('users:public.reviewsTab', 'التقييمات والآراء')}</span>
            <span
              className={`px-1.5 py-0.5 rounded-full text-[10px] font-black shrink-0 ${
                currentTab === 'reviews'
                  ? 'bg-slate-950/15 text-slate-950'
                  : 'bg-slate-200/80 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
              }`}
            >
              {isRTL ? toLocalizedDigits(totalReviewsCount, true) : totalReviewsCount}
            </span>
          </button>
        </div>
      </div>

      {/* 3. Tab Panels */}
      <div className="transition-all duration-200">
        {/* Panel 1: Active Auctions */}
        {currentTab === 'active' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>{t('users:public.activeAuctions', 'المزادات النشطة')}</span>
              </h2>
            </div>
            <UserAuctionsList
              userId={id}
              status="ACTIVE"
              page={auctionPage}
              onPageChange={handleAuctionPageChange}
            />
          </div>
        )}

        {/* Panel 2: Completed Auctions */}
        {currentTab === 'completed' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-500" />
                <span>{t('users:public.completedAuctions', 'المزادات المكتملة والسابقة')}</span>
              </h2>
            </div>
            <UserAuctionsList
              userId={id}
              status="ENDED"
              page={auctionPage}
              onPageChange={handleAuctionPageChange}
            />
          </div>
        )}

        {/* Panel 3: Reviews Stream */}
        {currentTab === 'reviews' && (
          <UserReviewsTab
            userId={id}
            page={reviewPage}
            onPageChange={handleReviewPageChange}
            ratingStats={profile.ratingStats || undefined}
            currentUserId={currentUser?._id}
          />
        )}
      </div>
    </div>
  );
};
