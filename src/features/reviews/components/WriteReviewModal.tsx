import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Award, Info, Send } from 'lucide-react';
import { Modal } from '@/components/common/Modal';
import { Button } from '@/components/common/Button';
import { StarRating } from './StarRating';
import { CriteriaRatingInput } from './CriteriaRatingInput';
import { useCreateReview } from '../hooks/useCreateReview';
import { createReviewSchema } from '../schemas/createReview.schema';
import { toLocalizedDigits } from '@/utils/formatters';
import type { CreateReviewCriteriaInput } from '../types/reviews.types';

export interface WriteReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  auctionId: string;
  auctionTitle?: string;
  reviewedUserName?: string;
  onSuccess?: () => void;
}

export const WriteReviewModal: React.FC<WriteReviewModalProps> = ({
  isOpen,
  onClose,
  auctionId,
  auctionTitle,
  reviewedUserName,
  onSuccess,
}) => {
  const { t, i18n } = useTranslation(['reviews', 'common']);
  const isRTL = i18n.language === 'ar';

  const [overallRating, setOverallRating] = useState<number>(0);
  const [criteria, setCriteria] = useState<CreateReviewCriteriaInput>({});
  const [comment, setComment] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { mutate: submitReview, isPending } = useCreateReview();

  // Reset form state whenever modal opens or closes
  useEffect(() => {
    if (isOpen) {
      setOverallRating(0);
      setCriteria({});
      setComment('');
      setErrorMessage(null);
    }
  }, [isOpen]);

  const getVerbalScore = (rating: number): string => {
    switch (rating) {
      case 5:
        return t('reviews:verbal.exceptional', 'ممتاز — تجربة استثنائية وموثوقة');
      case 4:
        return t('reviews:verbal.veryGood', 'جيد جداً — صفقة ممتازة وسلسة');
      case 3:
        return t('reviews:verbal.acceptable', 'مقبول — التجربة كانت اعتيادية');
      case 2:
        return t('reviews:verbal.poor', 'سيء — واجهت بعض المشاكل غير المرضية');
      case 1:
        return t('reviews:verbal.veryPoor', 'سيء جداً — تجربة غير مقبولة على الإطلاق');
      default:
        return t('reviews:verbal.selectPrompt', 'انقر على النجوم لتحديد تقييمك العام');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Validate using Zod schema
    const validation = createReviewSchema.safeParse({
      auctionId,
      overallRating,
      criteria: Object.keys(criteria).length > 0 ? criteria : undefined,
      comment,
    });

    if (!validation.success) {
      const issue = validation.error.issues[0];
      setErrorMessage(issue ? t(issue.message, issue.message) : 'يرجى التحقق من صحة البيانات.');
      return;
    }

    submitReview(
      {
        auctionId,
        overallRating,
        criteria: Object.keys(criteria).length > 0 ? criteria : undefined,
        comment: validation.data.comment,
      },
      {
        onSuccess: () => {
          onSuccess?.();
          onClose();
        },
      }
    );
  };

  const commentCharsLeft = 500 - comment.length;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      className="max-h-[92vh] flex flex-col"
      contentClassName="overflow-y-auto max-h-[calc(92vh-85px)] custom-scrollbar"
      title={
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500 dark:text-amber-400">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
              {t('reviews:modal.writeTitle', 'كتابة تقييم للمعاملة')}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-normal">
              {t('reviews:modal.writeSubtitle', 'قيّم تجربتك مع الطرف الآخر بدقة وشفافية')}
            </p>
          </div>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-6 pt-1">
        {/* Context Information Pill */}
        {(auctionTitle || reviewedUserName) && (
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
            {auctionTitle && (
              <div className="flex items-center gap-1.5 truncate max-w-full">
                <span className="text-slate-500 dark:text-slate-400 font-medium shrink-0">
                  {t('reviews:card.auctionTitle', 'المزاد المرتبط:')}
                </span>
                <span className="font-bold text-slate-800 dark:text-slate-200 truncate">
                  {auctionTitle}
                </span>
              </div>
            )}
            {reviewedUserName && (
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="text-slate-500 dark:text-slate-400 font-medium">
                  {t('reviews:myWritten.reviewedUser', 'المستخدم المُقيَّم:')}
                </span>
                <span className="font-bold text-amber-600 dark:text-amber-400">
                  {reviewedUserName}
                </span>
              </div>
            )}
          </div>
        )}

        {/* 1. Overall Rating Hero Section */}
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-center space-y-2.5">
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
            {t('reviews:modal.overallRating', 'التقييم العام الإجمالي')}
          </label>

          <div className="flex items-center justify-center">
            <StarRating
              rating={overallRating}
              maxRating={5}
              size="xl"
              interactive={!isPending}
              onChange={(newRating) => {
                setOverallRating(newRating);
                if (errorMessage) setErrorMessage(null);
              }}
              className="py-1"
            />
          </div>

          <div className="min-h-[22px]">
            <p
              className={`text-xs sm:text-sm font-semibold transition-colors ${
                overallRating > 0
                  ? 'text-amber-600 dark:text-amber-400 font-bold'
                  : 'text-slate-400 dark:text-slate-500'
              }`}
            >
              {getVerbalScore(overallRating)}
            </p>
          </div>
        </div>

        {/* 2. Detailed Criteria Section */}
        <CriteriaRatingInput
          value={criteria}
          onChange={setCriteria}
          disabled={isPending}
        />

        {/* 3. Comment / Feedback Box */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label
              htmlFor="review-comment-textarea"
              className="text-xs font-bold text-slate-700 dark:text-slate-300"
            >
              {t('reviews:modal.commentLabel', 'رأيك وتفاصيل التجربة (اختياري)')}
            </label>
            <span
              className={`text-[11px] font-semibold tabular-nums ${
                commentCharsLeft < 0
                  ? 'text-red-500'
                  : 'text-slate-400 dark:text-slate-500'
              }`}
            >
              {toLocalizedDigits(
                t('reviews:modal.charCount', { count: comment.length }),
                isRTL
              )}
            </span>
          </div>

          <textarea
            id="review-comment-textarea"
            rows={4}
            maxLength={500}
            disabled={isPending}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder={t(
              'reviews:modal.commentPlaceholder',
              'اكتب تعليقك الصادق لمساعدة الأعضاء الآخرين (الحد الأقصى 500 حرف)...'
            )}
            className="w-full px-4 py-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all resize-none disabled:opacity-50"
          />
        </div>

        {/* 4. Blind Review Policy & Finality Notice */}
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-3 text-xs leading-relaxed text-slate-700 dark:text-slate-300">
          <Info className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold text-amber-700 dark:text-amber-400">
              {t('reviews:modal.finalNotice', 'تنبيه هام: التقييم نهائي لا يمكن تعديله بعد الإرسال، وسيخضع لنظام التقييم الأعمى لضمان العدالة للطرفين.')}
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {t(
                'reviews:card.blindNotice',
                'التقييم في مرحلة المراجعة المتبادلة وسيتم نشره تلقائياً فور تقييم الطرف الآخر أو انقضاء الـ 14 يوماً.'
              )}
            </p>
          </div>
        </div>

        {/* Error Alert if any */}
        {errorMessage && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs font-semibold text-center animate-in fade-in">
            {errorMessage}
          </div>
        )}

        {/* 5. Modal Footer Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <Button
            type="button"
            variant="outline"
            size="md"
            onClick={onClose}
            disabled={isPending}
          >
            {t('common:cancel', 'إلغاء')}
          </Button>

          <Button
            type="submit"
            variant="accent"
            size="md"
            isLoading={isPending}
            disabled={overallRating === 0 || isPending}
            leftIcon={<Send className="w-4 h-4 text-slate-950" />}
            className="shadow-md shadow-amber-500/25 font-bold px-6 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 transition-all duration-200"
          >
            {isPending
              ? t('reviews:modal.submitting', 'جارٍ الإرسال...')
              : t('reviews:modal.submit', 'إرسال التقييم')}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
