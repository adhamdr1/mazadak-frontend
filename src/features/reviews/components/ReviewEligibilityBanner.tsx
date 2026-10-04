import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { Award, Clock, Star, CheckCircle2, ShieldAlert, Lock } from 'lucide-react';
import { useCanReviewAuction } from '../hooks/useCanReviewAuction';
import { WriteReviewModal } from './WriteReviewModal';
import { escrowService } from '@/features/escrow/services/escrow.service';
import { QUERY_KEYS } from '@/constants/queryKeys.constants';
import { toLocalizedDigits } from '@/utils/formatters';
import { cn } from '@/utils/cn';

export interface ReviewEligibilityBannerProps {
  auctionId: string;
  auctionTitle?: string;
  reviewedUserName?: string;
  escrowStatus?: string;
  isDisputed?: boolean;
  showPendingNoticeWhenHeld?: boolean;
  daysRemaining?: number;
  onReviewSubmitted?: () => void;
  className?: string;
}

export const ReviewEligibilityBanner: React.FC<ReviewEligibilityBannerProps> = ({
  auctionId,
  auctionTitle,
  reviewedUserName,
  escrowStatus,
  isDisputed,
  showPendingNoticeWhenHeld = false,
  daysRemaining,
  onReviewSubmitted,
  className = '',
}) => {
  const { t, i18n } = useTranslation(['reviews', 'common']);
  const isRTL = i18n.language === 'ar';
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 1. Check eligibility from backend
  const { data: eligibility, isLoading: isEligibilityLoading } = useCanReviewAuction({
    auctionId,
  });

  // 2. Escrow status & dispute check: if not passed explicitly as prop, query from backend
  const { data: escrow } = useQuery({
    queryKey: QUERY_KEYS.ESCROW.BY_AUCTION(auctionId),
    queryFn: () => escrowService.getEscrowByAuction(auctionId),
    enabled: Boolean(auctionId && (!escrowStatus || isDisputed === undefined)),
    staleTime: 1000 * 30, // 30s
  });

  const effectiveEscrowStatus = escrowStatus || escrow?.status;
  const effectiveIsDisputed = Boolean(isDisputed || effectiveEscrowStatus === 'DISPUTED');

  // Loading skeleton state
  if (isEligibilityLoading) {
    return (
      <div
        className={cn(
          'rounded-2xl p-4 sm:p-5 bg-slate-100/70 dark:bg-slate-800/40 animate-pulse border border-slate-200/80 dark:border-slate-800 flex items-center gap-4',
          className
        )}
      >
        <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-700 shrink-0" />
        <div className="space-y-2 flex-1 min-w-0">
          <div className="h-4 w-40 bg-slate-200 dark:bg-slate-700 rounded-md" />
          <div className="h-3 w-3/4 bg-slate-200 dark:bg-slate-700 rounded-md" />
        </div>
      </div>
    );
  }

  // State 1: Active dispute on this transaction
  if (effectiveIsDisputed) {
    return (
      <section
        aria-label={t('reviews:banner.disputedTitle', 'التقييم معلق لوجود نزاع مالي نشط')}
        className={cn(
          'relative overflow-hidden rounded-2xl p-4 sm:p-5 bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200/80 dark:border-rose-900/40 shadow-2xs flex items-center gap-3.5 sm:gap-4 transition-all duration-200',
          className
        )}
      >
        <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-rose-500/15 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 border border-rose-500/25">
          <ShieldAlert className="w-5 h-5" />
        </div>
        <div className="space-y-1 min-w-0">
          <h3 className="text-xs sm:text-sm font-bold text-rose-900 dark:text-rose-200">
            {t('reviews:banner.disputedTitle', 'التقييم معلق لوجود نزاع مالي نشط')}
          </h3>
          <p className="text-xs text-rose-700/80 dark:text-rose-300/70 leading-relaxed">
            {t(
              'reviews:banner.disputedDesc',
              'لا يمكن تقديم تقييم للمعاملة في حال وجود نزاع مفتوح حتى يتم الفصل فيه نهائياً من قبل الإدارة.'
            )}
          </p>
        </div>
      </section>
    );
  }

  // State 2: Escrow is still HELD (Inspection / Handover in progress)
  // Rating is premature before delivery confirmation and escrow release
  if (effectiveEscrowStatus === 'HELD') {
    if (!showPendingNoticeWhenHeld) {
      return null;
    }

    return (
      <section
        aria-label={t('reviews:banner.heldTitle', 'التقييم متاح بعد إتمام الاستلام وتحرير الضمان')}
        className={cn(
          'relative overflow-hidden rounded-2xl p-4 sm:p-5 bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/40 shadow-2xs flex items-center gap-3.5 sm:gap-4 transition-all duration-200',
          className
        )}
      >
        <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/25">
          <Lock className="w-5 h-5" />
        </div>
        <div className="space-y-1 min-w-0">
          <h3 className="text-xs sm:text-sm font-bold text-amber-900 dark:text-amber-200">
            {t('reviews:banner.heldTitle', 'التقييم متاح بعد إتمام الاستلام وتحرير الضمان')}
          </h3>
          <p className="text-xs text-amber-700/90 dark:text-amber-300/80 leading-relaxed">
            {t(
              'reviews:banner.heldDesc',
              'أموال المعاملة محتجزة بأمان في حساب الضمان المالي حالياً. ستتمكن من تقييم الطرف الآخر فور استلام السلعة وتأكيد تحرير المبلغ بنجاح.'
            )}
          </p>
        </div>
      </section>
    );
  }

  // State 3: Already reviewed by current user
  const reasonText = (eligibility?.reason || '').toLowerCase();
  const isAlreadyReviewed = Boolean(
    !eligibility?.canReview &&
      (reasonText.includes('already') || reasonText.includes('submitted'))
  );

  if (isAlreadyReviewed) {
    return (
      <section
        aria-label={t('reviews:banner.alreadyReviewedTitle', 'لقد قمت بتقييم هذه المعاملة بنجاح')}
        className={cn(
          'relative overflow-hidden rounded-2xl p-4 sm:p-5 bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-300/80 dark:border-emerald-800/60 shadow-2xs flex items-center justify-between gap-4 transition-all duration-200',
          className
        )}
      >
        <div className="flex items-center gap-3.5 sm:gap-4 min-w-0">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/25">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div className="space-y-1 min-w-0">
            <h3 className="text-xs sm:text-sm font-bold text-emerald-900 dark:text-emerald-200">
              {t('reviews:banner.alreadyReviewedTitle', 'لقد قمت بتقييم هذه المعاملة بنجاح')}
            </h3>
            <p className="text-xs text-emerald-700/90 dark:text-emerald-300/80 leading-relaxed">
              {t(
                'reviews:banner.alreadyReviewedDesc',
                'تم حفظ وتوثيق تقييمك لهذه المعاملة في المنصة. شكراً لمساهمتك في تعزيز الشفافية والموثوقية.'
              )}
            </p>
          </div>
        </div>
      </section>
    );
  }

  // State 4: 14-day review window expired
  const isExpired = Boolean(
    !eligibility?.canReview && (reasonText.includes('expired') || reasonText.includes('window'))
  );

  if (isExpired) {
    return (
      <section
        aria-label={t('reviews:banner.windowExpiredTitle', 'انتهت فترة التقييم المتاحة (14 يوماً)')}
        className={cn(
          'relative overflow-hidden rounded-2xl p-4 sm:p-5 bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 shadow-2xs flex items-center gap-3.5 sm:gap-4 transition-all duration-200',
          className
        )}
      >
        <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400 flex items-center justify-center shrink-0">
          <Clock className="w-5 h-5" />
        </div>
        <div className="space-y-1 min-w-0">
          <h3 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
            {t('reviews:banner.windowExpiredTitle', 'انتهت فترة التقييم المتاحة (14 يوماً)')}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            {t(
              'reviews:banner.windowExpiredDesc',
              'تنص سياسة المنصة على إمكانية تقييم المزادات خلال 14 يوماً فقط من اكتمالها لضمان دقة ومصداقية التقييمات.'
            )}
          </p>
        </div>
      </section>
    );
  }

  // If user is not buyer or seller or auction is not ended at all, do not show review banner
  if (!eligibility?.canReview) {
    return null;
  }

  // State 5: Eligible to rate!
  return (
    <>
      <section
        aria-label={t('reviews:banner.title', 'شاركنا تجربتك في المزاد!')}
        className={cn(
          'relative overflow-hidden rounded-2xl p-4 sm:p-5 bg-white dark:bg-slate-900 border border-amber-500/30 dark:border-amber-500/30 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all duration-200 animate-fadeIn',
          className
        )}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-amber-500/[0.08] via-amber-500/[0.03] to-transparent pointer-events-none" />

        <div className="relative flex items-center gap-3.5 sm:gap-4 min-w-0">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/25">
            <Award className="w-5 h-5" />
          </div>

          <div className="space-y-1 min-w-0">
            <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
              {t('reviews:banner.title', 'شاركنا تجربتك في المزاد!')}
            </h3>

            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed max-w-xl line-clamp-2 sm:line-clamp-none">
              {t(
                'reviews:banner.description',
                'لقد اكتملت معاملتك بنجاح. تقييمك يساعد في بناء مجتمع آمن وموثوق للجميع.'
              )}
            </p>

            {typeof daysRemaining === 'number' && daysRemaining > 0 && (
              <div className="flex items-center gap-1 text-3xs font-medium text-amber-700 dark:text-amber-400 pt-0.5">
                <Clock className="w-3 h-3" />
                <span>
                  {toLocalizedDigits(
                    t('reviews:banner.daysRemaining', { days: daysRemaining }),
                    isRTL
                  )}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Action Button: Luxury Gold Gradient CTA */}
        <div className="relative flex items-center justify-end shrink-0 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-slate-950 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 shadow-sm shadow-amber-500/25 hover:shadow-md hover:shadow-amber-500/35 transition-all duration-200 active:scale-[0.98] cursor-pointer select-none"
          >
            <Star className="w-4 h-4 fill-slate-950 text-slate-950" />
            <span>{t('reviews:banner.rateButton', 'قيّم تجربتك الآن')}</span>
          </button>
        </div>
      </section>

      {/* Embedded Write Review Modal */}
      <WriteReviewModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        auctionId={auctionId}
        auctionTitle={auctionTitle}
        reviewedUserName={reviewedUserName}
        onSuccess={() => {
          setIsModalOpen(false);
          onReviewSubmitted?.();
        }}
      />
    </>
  );
};
