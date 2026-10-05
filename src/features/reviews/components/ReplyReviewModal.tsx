import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Send, CornerDownLeft, CornerDownRight, AlertCircle, Info } from 'lucide-react';
import { Modal } from '@/components/common/Modal';
import { Button } from '@/components/common/Button';
import { StarRating } from './StarRating';
import { useReplyReview } from '../hooks/useReplyReview';
import { replyReviewSchema } from '../schemas/replyReview.schema';
import { formatRelativeTime, toLocalizedDigits } from '@/utils/formatters';
import type { Review } from '../types/reviews.types';

export interface ReplyReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  review: Review | null;
  onSuccess?: () => void;
}

export const ReplyReviewModal: React.FC<ReplyReviewModalProps> = ({
  isOpen,
  onClose,
  review,
  onSuccess,
}) => {
  const { t, i18n } = useTranslation(['reviews', 'common']);
  const isRTL = i18n.language?.startsWith('ar');

  const [replyText, setReplyText] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { mutate: submitReply, isPending } = useReplyReview();

  useEffect(() => {
    if (isOpen) {
      setReplyText('');
      setErrorMessage(null);
    }
  }, [isOpen]);

  if (!review) return null;

  const reviewerName = review.reviewer
    ? `${review.reviewer.firstName} ${review.reviewer.lastName}`.trim()
    : t('common:user', 'مستخدم مزادك');

  const CornerIcon = isRTL ? CornerDownLeft : CornerDownRight;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const validation = replyReviewSchema.safeParse({
      reviewId: review._id,
      reply: replyText,
    });

    if (!validation.success) {
      const issue = validation.error.issues[0];
      setErrorMessage(issue ? t(issue.message, issue.message) : 'يرجى التحقق من صحة الرد.');
      return;
    }

    submitReply(
      {
        reviewId: review._id,
        reply: validation.data.reply,
      },
      {
        onSuccess: () => {
          onSuccess?.();
          onClose();
        },
      }
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('reviews:modal.replyTitle', 'الرد على التقييم')}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Header Description */}
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {t(
            'reviews:modal.replySubtitle',
            'يمكنك الرد رسمياً على هذا التقييم لمرة واحدة فقط لبيان وجهة نظرك أمام مجتمع مزادك.'
          )}
        </p>

        {/* Original Review Preview Box */}
        <div className="rounded-2xl p-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 space-y-2.5">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                {t('reviews:modal.originalReview', 'التقييم الأصلي:')}
              </span>
              <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                {reviewerName}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <StarRating rating={review.overallRating} size="xs" />
              <span className="text-xs font-bold text-amber-600 dark:text-amber-400 tabular-nums">
                {toLocalizedDigits(review.overallRating.toFixed(1), isRTL)}
              </span>
            </div>
          </div>

          {review.comment ? (
            <p
              dir="auto"
              className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-normal bg-white dark:bg-slate-900/60 p-3.5 rounded-xl border border-slate-200/60 dark:border-slate-800 whitespace-pre-line text-start"
            >
              {review.comment}
            </p>
          ) : (
            <p className="text-xs text-slate-400 dark:text-slate-500 italic">
              {t('reviews:overview.ratingSummary', 'تقييم بالنجوم دون تعليق')}
            </p>
          )}

          <div className="text-[11px] text-slate-400 dark:text-slate-500 text-end tabular-nums">
            {formatRelativeTime(review.createdAt, isRTL)}
          </div>
        </div>

        {/* Reply Input Area */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label
              htmlFor="reply-textarea"
              className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5"
            >
              <CornerIcon className="w-3.5 h-3.5 text-amber-500" />
              <span>{t('reviews:modal.replyLabel', 'نص الرد الرسمي')}</span>
            </label>
            <span
              className={`text-[11px] font-semibold tabular-nums ${
                replyText.length > 500
                  ? 'text-red-500'
                  : 'text-slate-400 dark:text-slate-500'
              }`}
            >
              {toLocalizedDigits(replyText.length, isRTL)} / {toLocalizedDigits(500, isRTL)}{' '}
              {t('reviews:modal.chars', 'حرف')}
            </span>
          </div>

          <textarea
            id="reply-textarea"
            dir="auto"
            rows={4}
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            maxLength={500}
            placeholder={t(
              'reviews:modal.replyPlaceholder',
              'اكتب ردك باحترافية واحترام لتوضيح تفاصيل المعاملة (2 إلى 500 حرف)...'
            )}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 transition-all resize-none shadow-xs text-start"
          />
        </div>

        {/* Warning Note */}
        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2.5">
          <Info className="w-4 h-4 shrink-0 text-amber-500 mt-0.5" />
          <p className="leading-relaxed">
            {t(
              'reviews:modal.replyWarning',
              'تنبيه: ردك رسمي ومتاح للعامة ولا يمكن تعديله أو حذفه بعد النشر. يرجى الالتزام بالاحترام وأدبيات المنصة.'
            )}
          </p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 text-xs text-red-600 dark:text-red-400 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClose}
            disabled={isPending}
          >
            {t('reviews:modal.cancel', 'إلغاء')}
          </Button>

          <Button
            type="submit"
            variant="accent"
            size="sm"
            isLoading={isPending}
            disabled={replyText.trim().length < 2 || replyText.trim().length > 500}
            leftIcon={<Send className="w-3.5 h-3.5" />}
          >
            {t('reviews:modal.submitReply', 'نشر الرد')}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
