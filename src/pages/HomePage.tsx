import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Gavel,
  PlusCircle,
  ShieldCheck,
  Zap,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Laptop,
  Car,
  Home as HomeIcon,
  Palette,
  Watch,
  Shirt,
  Sparkles,
  Layers,
} from 'lucide-react';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { useAuctions } from '@/features/auctions/hooks/useAuctions';
import { AuctionCard } from '@/features/auctions/components/shared/AuctionCard';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/constants/routes.constants';
import type { AuctionCategory } from '@/features/auctions/types/auctions.types';

const CATEGORIES: Array<{
  value: AuctionCategory;
  labelKey: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}> = [
  { value: 'ELECTRONICS', labelKey: 'categories.ELECTRONICS', icon: Laptop, color: 'text-blue-500 bg-blue-500/10 border-blue-500/20' },
  { value: 'CARS', labelKey: 'categories.CARS', icon: Car, color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' },
  { value: 'REAL_ESTATE', labelKey: 'categories.REAL_ESTATE', icon: HomeIcon, color: 'text-amber-500 bg-amber-500/10 border-amber-500/20' },
  { value: 'ANTIQUES', labelKey: 'categories.ANTIQUES', icon: Palette, color: 'text-purple-500 bg-purple-500/10 border-purple-500/20' },
  { value: 'WATCHES', labelKey: 'categories.WATCHES', icon: Watch, color: 'text-rose-500 bg-rose-500/10 border-rose-500/20' },
  { value: 'FASHION', labelKey: 'categories.FASHION', icon: Shirt, color: 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20' },
];

export const HomePage: React.FC = () => {
  const { t, i18n } = useTranslation('auctions');
  const { isAuthenticated } = useAuth();
  const isRTL = i18n.language?.startsWith('ar');
  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight;

  // Fetch featured active & upcoming auctions for the homepage showcase
  const { auctions, isLoading } = useAuctions(6);

  return (
    <div className="space-y-12 sm:space-y-16 py-6 sm:py-10">
      {/* 1. Hero Showcase Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-b from-amber-500/[0.08] via-slate-50 to-white dark:from-slate-900 dark:via-slate-900/90 dark:to-slate-950 p-8 sm:p-14 lg:p-16 shadow-xl dark:shadow-2xl border border-slate-200/90 dark:border-slate-800 transition-colors duration-200">
          {/* Subtle Ambient Background Glows */}
          <div className="absolute top-0 start-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 end-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative max-w-3xl mx-auto text-center space-y-6">
            {/* Top Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-400 text-xs font-bold shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>{t('landing.heroBadge')}</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-heading font-black tracking-tight leading-[1.3] sm:leading-[1.35] text-slate-900 dark:text-white">
              {t('landing.heroTitlePrefix')}{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 via-amber-600 to-amber-500 dark:from-amber-400 dark:via-amber-300 dark:to-amber-500">
                {t('landing.heroTitleHighlight')}
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl mx-auto">
              {t('landing.heroSubtitle')}
            </p>

            {/* Clean, Harmonious Action Buttons */}
            <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
              <Button
                to={ROUTES.AUCTIONS}
                variant="accent"
                size="lg"
                leftIcon={<Gavel className="w-4 h-4" />}
                className="shadow-md shadow-amber-500/20 text-sm font-bold px-6 h-11"
              >
                <span>{t('landing.exploreLiveButton')}</span>
              </Button>

              <Button
                to={ROUTES.CREATE_AUCTION}
                variant="outline"
                size="lg"
                leftIcon={<PlusCircle className="w-4 h-4 text-amber-500" />}
                className="border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:border-amber-500 dark:hover:border-amber-500 hover:bg-slate-50 dark:hover:bg-slate-700 text-sm font-bold shadow-xs h-11 px-5"
              >
                <span>{t('landing.createAuctionButton')}</span>
              </Button>

              {isAuthenticated && (
                <Button
                  to={ROUTES.MY_AUCTIONS}
                  variant="outline"
                  size="lg"
                  leftIcon={<Layers className="w-4 h-4 text-amber-500" />}
                  className="border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:border-amber-500 dark:hover:border-amber-500 hover:bg-slate-50 dark:hover:bg-slate-700 text-sm font-bold shadow-xs h-11 px-5"
                >
                  <span>{t('landing.myAuctionsButton')}</span>
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 2. Categories Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 space-y-6">
        <div className="space-y-1">
          <h2 className="text-xl sm:text-2xl font-heading font-black text-slate-900 dark:text-slate-100">
            {t('landing.browseByCategory')}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            {t('landing.browseByCategorySubtitle')}
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            return (
              <Link
                key={cat.value}
                to={`${ROUTES.AUCTIONS}?category=${cat.value}`}
                className="group"
              >
                <Card
                  glass
                  padding="md"
                  className="text-center space-y-3 shadow-xs hover:shadow-lg hover:border-amber-500/60 dark:hover:border-amber-500/60 hover:-translate-y-1 transition-all duration-200 flex flex-col items-center bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800"
                >
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center border group-hover:scale-110 transition-transform ${cat.color}`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-amber-500 transition-colors">
                    {t(cat.labelKey)}
                  </span>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>

      {/* 3. Live Featured Auctions Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 mb-1">
              <Zap className="w-3.5 h-3.5" />
              <span>{t('landing.liveNowBadge')}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-heading font-black text-slate-900 dark:text-slate-100">
              {t('landing.latestActiveAuctions')}
            </h2>
          </div>

          <Link
            to={ROUTES.AUCTIONS}
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-amber-600 dark:text-amber-400 hover:underline"
          >
            <span>{t('landing.viewAllAuctions')}</span>
            <ArrowIcon className="w-4 h-4" />
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, idx) => (
              <div
                key={idx}
                className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 p-4 space-y-4 animate-pulse"
              >
                <div className="aspect-[16/10] bg-slate-200 dark:bg-slate-800 rounded-2xl w-full" />
                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-lg w-3/4" />
                <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded-lg w-1/2" />
                <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded-xl w-full" />
              </div>
            ))}
          </div>
        ) : auctions.length === 0 ? (
          <Card glass padding="lg" className="text-center py-12 space-y-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <Gavel className="w-12 h-12 text-amber-500 mx-auto" />
            <h3 className="font-bold text-base text-slate-800 dark:text-slate-200">
              {t('landing.noActiveAuctions')}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {t('landing.noActiveAuctionsHint')}
            </p>
            <Button to={ROUTES.CREATE_AUCTION} variant="accent" size="sm" leftIcon={<PlusCircle className="w-4 h-4" />}>
              {t('landing.createAuctionButton')}
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {auctions.slice(0, 6).map((auction) => (
              <AuctionCard key={auction._id} auction={auction} viewMode="grid" />
            ))}
          </div>
        )}
      </section>

      {/* 4. Trust, Security & Escrow Guarantee Pillars */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="rounded-3xl bg-slate-100/90 dark:bg-slate-900 text-slate-900 dark:text-white p-8 sm:p-12 border border-slate-200/90 dark:border-slate-800 space-y-8 transition-colors duration-200">
          <div className="max-w-2xl space-y-2">
            <h2 className="text-2xl sm:text-3xl font-heading font-black">
              {t('landing.whyTrustUsTitle')}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              {t('landing.whyTrustUsSubtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-3 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                {t('landing.escrowPillarTitle')}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {t('landing.escrowPillarDesc')}
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-3 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-500/30">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                {t('landing.liveBiddingPillarTitle')}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {t('landing.liveBiddingPillarDesc')}
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-3 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-500/30">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                {t('landing.trustedSellersPillarTitle')}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {t('landing.trustedSellersPillarDesc')}
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
