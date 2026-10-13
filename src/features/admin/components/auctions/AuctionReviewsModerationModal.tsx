import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Star,
  Eye,
  EyeOff,
  MessageSquare,
  AlertCircle,
  Loader2,
  Calendar,
  Gavel,
  ArrowRight,
  ArrowLeft,
  CornerDownLeft,
  CornerDownRight,
  Ban,
} from 'lucide-react';
import { Modal } from '@/components/common/Modal';
import { UserAvatar } from '@/features/users';
import { toLocalizedDigits } from '@/utils/formatters';
import { useAdminAuctionReviews } from '../../hooks/useAdminAuctionReviews';
import { useAdminReviewModeration } from '../../hooks/useAdminReviewModeration';
import {
  formatAdminDate,
  getReviewStatusBadge,
  getAuctionStatusBadge,
} from '../../utils/admin.utils';
import type { Review } from '../../types/admin.types';

export interface AuctionReviewsModerationModalProps {
  isOpen: boolean;
  onClose: () => void;
  auctionId?: string;
  auctionTitle?: string;
  auctionStatus?: string;
  adminActionReason?: string | null;
}

export const AuctionReviewsModerationModal: React.FC<AuctionReviewsModerationModalProps> = ({
  isOpen,
  onClose,
  auctionId,
  auctionTitle = '',
  auctionStatus,
  adminActionReason,
}) => {
  const { t, i18n } = useTranslation(['admin', 'common']);
  const isRTL = i18n.language?.startsWith('ar');

  const { data: reviews = [], isLoading, isError } = useAdminAuctionReviews(isOpen ? auctionId : undefined);
  const { hideReview, unhideReview, isLoading: isModerating } = useAdminReviewModeration();
  const [targetReviewId, setTargetReviewId] = useState<string | null>(null);

  const handleToggleHide = async (review: Review) => {
    setTargetReviewId(review._id);
    try {
      if (review.status === 'HIDDEN') {
        await unhideReview({ reviewId: review._id, auctionId });
      } else {
        await hideReview({ reviewId: review._id, auctionId });
      }
    } catch (err) {
      console.error('Failed to moderate review:', err);
    } finally {
      setTargetReviewId(null);
    }
  };

  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight;

  const isTextRTL = (text?: string, fallbackRTL = isRTL): boolean => {
    if (!text) return fallbackRTL;
    const arabicRegex = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
    const latinRegex = /[a-zA-Z]/;
    for (const char of text) {
      if (arabicRegex.test(char)) return true;
      if (latinRegex.test(char)) return false;
    }
    return fallbackRTL;
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('auctions.reviewsModal.title', { defaultValue: isRTL ? 'إشراف ومراقبة مراجعات المزاد' : 'Auction Reviews Moderation' })}
      size="xl"
      showCloseButton={false}
    >
      <div className="space-y-4 py-1">
        {/* Top Auction Information Card (Clean, modern banner without awkward text) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 shrink-0">
              <Gavel className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-slate-400">
                  {t('auctions.reviewsModal.auctionSubtitle', { defaultValue: isRTL ? 'المزاد:' : 'Auction:' })}
                </span>
                {auctionId && (
                  <span className="text-[10px] font-mono text-slate-400 bg-slate-200/50 dark:bg-slate-700/50 px-1.5 py-0.2 rounded">
                    #{auctionId.slice(-8)}
                  </span>
                )}
                {auctionStatus && (() => {
                  const stBadge = getAuctionStatusBadge(auctionStatus, isRTL);
                  return (
                    <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-md border ${stBadge.bgClass}`}>
                      {stBadge.label}
                    </span>
                  );
                })()}
              </div>
              <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate mt-0.5" title={auctionTitle}>
                {auctionTitle || (isRTL ? 'مزاد بدون عنوان' : 'Untitled Auction')}
              </h4>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/25 shadow-2xs">
              {toLocalizedDigits(reviews.length, isRTL)} {t('auctions.reviewsModal.countLabel', { defaultValue: isRTL ? 'مراجعات' : 'reviews' })}
            </span>
          </div>
        </div>

        {/* If Cancelled by Admin, Show High-Impact Cancellation Notice with Reason */}
        {adminActionReason && (
          <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-300">
            <Ban className="w-4 h-4 shrink-0 mt-0.5 text-rose-600 dark:text-rose-400" />
            <div className="min-w-0 text-xs space-y-1">
              <span className="font-bold block">
                {t('auctions.reviewsModal.cancelledByAdminNotice', {
                  defaultValue: isRTL ? 'تم إلغاء هذا المزاد بقرار إداري' : 'This auction was cancelled by administration',
                })}
              </span>
              <p className="leading-relaxed">
                <span className="font-semibold text-rose-800 dark:text-rose-200">
                  {t('auctions.reviewsModal.cancellationReasonLabel', {
                    defaultValue: isRTL ? 'سبب الإلغاء:' : 'Cancellation Reason:',
                  })}{' '}
                </span>
                "{adminActionReason}"
              </p>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="py-12 flex flex-col items-center justify-center text-slate-400 space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
            <p className="text-sm font-medium">
              {t('common:states.loading', { defaultValue: 'جاري تحميل المراجعات...' })}
            </p>
          </div>
        )}

        {/* Error State */}
        {isError && !isLoading && (
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p className="text-sm">
              {t('auctions.reviewsModal.errorLoading', {
                defaultValue: 'حدث خطأ أثناء تحميل مراجعات هذا المزاد.',
              })}
            </p>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !isError && reviews.length === 0 && (
          <div className="py-12 flex flex-col items-center justify-center text-slate-400 space-y-2">
            <MessageSquare className="w-10 h-10 text-slate-300 dark:text-slate-600" />
            <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
              {t('auctions.reviewsModal.emptyTitle', { defaultValue: 'لا توجد مراجعات مسجلة' })}
            </p>
            <p className="text-xs text-slate-400">
              {t('auctions.reviewsModal.emptyDesc', {
                defaultValue: 'لم يقم أي طرف بكتابة تقييم لهذا المزاد حتى الآن.',
              })}
            </p>
          </div>
        )}

        {/* Reviews List */}
        {!isLoading && !isError && reviews.length > 0 && (
          <div className="space-y-3.5 max-h-[60vh] overflow-y-auto px-1">
            {reviews.map((rev) => {
              const badge = getReviewStatusBadge(rev.status);
              const isItemBusy = isModerating && targetReviewId === rev._id;

              // Roles clarification: Buyer vs Seller
              const isBuyerReviewingSeller = rev.type !== 'SELLER_TO_BUYER';
              const reviewerRoleLabel = isBuyerReviewingSeller
                ? t('auctions.reviewsModal.buyer', { defaultValue: isRTL ? 'المشتري' : 'Buyer' })
                : t('auctions.reviewsModal.seller', { defaultValue: isRTL ? 'البائع' : 'Seller' });
              const reviewedUserRoleLabel = isBuyerReviewingSeller
                ? t('auctions.reviewsModal.seller', { defaultValue: isRTL ? 'البائع' : 'Seller' })
                : t('auctions.reviewsModal.buyer', { defaultValue: isRTL ? 'المشتري' : 'Buyer' });

              const reviewerName = rev.reviewer
                ? `${rev.reviewer.firstName} ${rev.reviewer.lastName}`.trim()
                : t('auctions.reviewsModal.unknownUser', { defaultValue: isRTL ? 'مستخدم' : 'User' });
              const reviewedUserName = rev.reviewedUser
                ? `${rev.reviewedUser.firstName} ${rev.reviewedUser.lastName}`.trim()
                : '';

              return (
                <div
                  key={rev._id}
                  className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                    rev.status === 'HIDDEN'
                      ? 'bg-rose-500/[0.03] dark:bg-rose-950/20 border-rose-500/30'
                      : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 shadow-2xs'
                  }`}
                >
                  {/* Top Bar: Reviewer Flow & Status & Single-Row Semi-Transparent Action Button */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800/80">
                    {/* User Identity Flow with Clear Buyer/Seller Role Badges (Strictly Single Row) */}
                    <div className="flex items-center gap-3 min-w-0">
                      <UserAvatar
                        firstName={rev.reviewer?.firstName}
                        lastName={rev.reviewer?.lastName}
                        name={reviewerName}
                        userId={rev.reviewer?.id}
                        size="sm"
                        className="shrink-0"
                      />

                      <div className="min-w-0">
                        {/* Strictly Single Row with compact text, arrow, and badges */}
                        <div className="flex items-center gap-1.5 whitespace-nowrap">
                          {/* Reviewer Name + Role */}
                          <span className="font-bold text-xs text-slate-900 dark:text-white truncate max-w-[110px] sm:max-w-[140px]" title={reviewerName}>
                            {reviewerName}
                          </span>
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 shrink-0">
                            {reviewerRoleLabel}
                          </span>

                          {/* Relationship Arrow + Reviewed Target User (Compact & smaller) */}
                          {reviewedUserName && (
                            <>
                              <ArrowIcon className="w-3 h-3 text-slate-400 shrink-0 mx-0.5" />
                              <span className="font-semibold text-[11px] text-slate-600 dark:text-slate-300 truncate max-w-[100px] sm:max-w-[130px]" title={reviewedUserName}>
                                {reviewedUserName}
                              </span>
                              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 shrink-0">
                                {reviewedUserRoleLabel}
                              </span>
                            </>
                          )}
                        </div>

                        <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-0.5">
                          <Calendar className="w-3 h-3 shrink-0" />
                          <span>{formatAdminDate(rev.createdAt, i18n.language, isRTL)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Status Badge + Sleek Semi-Transparent Single-Row Action Button */}
                    <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                      <span
                        className={`px-2.5 py-1 rounded-xl text-[11px] font-bold border ${badge.bgClass}`}
                      >
                        {isRTL ? badge.labelAr : badge.labelEn}
                      </span>

                      {/* Hide / Unhide Action Button (Strictly Single Row, Semi-Transparent, No Wrapping) */}
                      <button
                        type="button"
                        onClick={() => handleToggleHide(rev)}
                        disabled={isItemBusy}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 border cursor-pointer outline-none shadow-2xs ${
                          rev.status === 'HIDDEN'
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/25 hover:bg-emerald-500/20'
                            : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/25 hover:bg-rose-500/20'
                        }`}
                      >
                        {isItemBusy ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />
                        ) : rev.status === 'HIDDEN' ? (
                          <Eye className="w-3.5 h-3.5 shrink-0" />
                        ) : (
                          <EyeOff className="w-3.5 h-3.5 shrink-0" />
                        )}
                        <span className="whitespace-nowrap">
                          {rev.status === 'HIDDEN'
                            ? t('auctions.reviewsModal.unhideBtn', { defaultValue: isRTL ? 'إظهار المراجعة' : 'Unhide Review' })
                            : t('auctions.reviewsModal.hideBtn', { defaultValue: isRTL ? 'حجب المراجعة' : 'Hide Review' })}
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Rating Stars & Bilingual Criteria Section */}
                  <div className="mt-3.5 flex flex-wrap items-center gap-3">
                    {/* Overall Star Rating with Localized Digits & 5 Star Icons */}
                    <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-xl bg-amber-500/10 dark:bg-amber-950/30 border border-amber-500/20">
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-3.5 h-3.5 ${
                              star <= Math.round(rev.overallRating)
                                ? 'text-amber-500 fill-amber-500'
                                : 'text-slate-300 dark:text-slate-700'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="font-bold font-mono text-xs text-amber-600 dark:text-amber-400">
                        {toLocalizedDigits(rev.overallRating.toFixed(1), isRTL)} / {toLocalizedDigits('5.0', isRTL)}
                      </span>
                    </div>

                    {/* Criteria Breakdown with Localized Digits and Arabic/English Labels */}
                    {rev.criteria && (
                      <div className="flex items-center gap-1.5 flex-wrap text-[11px]">
                        {rev.criteria.itemAccuracy !== undefined && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60">
                            <span>{t('auctions.reviewsModal.accuracy', { defaultValue: isRTL ? 'الدقة' : 'Accuracy' })}:</span>
                            <span className="font-mono font-bold text-amber-500">
                              {toLocalizedDigits(rev.criteria.itemAccuracy, isRTL)} ★
                            </span>
                          </span>
                        )}
                        {rev.criteria.communication !== undefined && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60">
                            <span>{t('auctions.reviewsModal.communication', { defaultValue: isRTL ? 'التواصل' : 'Communication' })}:</span>
                            <span className="font-mono font-bold text-amber-500">
                              {toLocalizedDigits(rev.criteria.communication, isRTL)} ★
                            </span>
                          </span>
                        )}
                        {rev.criteria.packaging !== undefined && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60">
                            <span>{t('auctions.reviewsModal.packaging', { defaultValue: isRTL ? 'التغليف' : 'Packaging' })}:</span>
                            <span className="font-mono font-bold text-amber-500">
                              {toLocalizedDigits(rev.criteria.packaging, isRTL)} ★
                            </span>
                          </span>
                        )}
                        {rev.criteria.smoothExperience !== undefined && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60">
                            <span>{t('auctions.reviewsModal.smoothExperience', { defaultValue: isRTL ? 'السلاسة' : 'Experience' })}:</span>
                            <span className="font-mono font-bold text-amber-500">
                              {toLocalizedDigits(rev.criteria.smoothExperience, isRTL)} ★
                            </span>
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Comment (Auto BiDi alignment: Arabic on right, English on left regardless of UI language) */}
                  {rev.comment && (() => {
                    const commentIsRTL = isTextRTL(rev.comment);
                    return (
                      <div
                        dir={commentIsRTL ? 'rtl' : 'ltr'}
                        className="mt-3 text-xs sm:text-sm text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-200/60 dark:border-slate-800"
                      >
                        <p
                          className={`leading-relaxed whitespace-pre-line ${
                            commentIsRTL ? 'text-right' : 'text-left'
                          }`}
                        >
                          "{rev.comment}"
                        </p>
                      </div>
                    );
                  })()}

                  {/* Seller Reply */}
                  {rev.reply && (() => {
                    const replyIsRTL = isTextRTL(rev.reply);
                    const DynamicReplyIcon = replyIsRTL ? CornerDownLeft : CornerDownRight;

                    return (
                      <div
                        dir={replyIsRTL ? 'rtl' : 'ltr'}
                        className={`mt-2.5 p-3 rounded-xl bg-amber-500/5 dark:bg-amber-950/20 text-xs ${
                          replyIsRTL
                            ? 'mr-4 ml-0 border-r-2 border-amber-500/60 text-right'
                            : 'ml-4 mr-0 border-l-2 border-amber-500/60 text-left'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 font-bold text-amber-600 dark:text-amber-400 mb-1">
                          <DynamicReplyIcon className="w-3.5 h-3.5 shrink-0" />
                          <span>
                            {t('auctions.reviewsModal.sellerReply', {
                              defaultValue: isRTL ? 'رد الطرف الآخر:' : 'Seller Reply:',
                            })}
                          </span>
                        </div>
                        <p
                          className={`text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line ${
                            replyIsRTL ? 'text-right' : 'text-left'
                          }`}
                        >
                          "{rev.reply}"
                        </p>
                      </div>
                    );
                  })()}
                </div>
              );
            })}
          </div>
        )}

        {/* Footer Close Button */}
        <div className="flex justify-end pt-3 border-t border-slate-200/80 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/60 transition-colors cursor-pointer shadow-2xs outline-none"
          >
            {t('common:actions.close', { defaultValue: isRTL ? 'إغلاق' : 'Close' })}
          </button>
        </div>
      </div>
    </Modal>
  );
};
