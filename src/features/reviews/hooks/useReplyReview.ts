import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { reviewsService } from '../services/reviews.service';
import { useToast } from '@/components/feedback/useToast';
import { QUERY_KEYS } from '@/constants/queryKeys.constants';
import type { Review, ReplyReviewInput } from '../types/reviews.types';

export function useReplyReview() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { t } = useTranslation('reviews');

  return useMutation<Pick<Review, '_id' | 'reply' | 'repliedAt'>, Error, ReplyReviewInput>({
    mutationFn: (input: ReplyReviewInput) => reviewsService.replyToReview(input),
    onSuccess: () => {
      // Invalidate reviews cache so the new reply is reflected immediately
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.REVIEWS.ALL });

      toast.success(
        t('reviews:messages.replyCreatedSuccess', 'تم نشر ردك على التقييم بنجاح.')
      );
    },
    onError: (err) => {
      const msg = err.message || '';
      let errorText = t('reviews:errors.DEFAULT_ERROR', 'حدث خطأ غير متوقع أثناء معالجة التقييم.');

      if (msg.includes('REPLY_ALREADY_EXISTS')) {
        errorText = t('reviews:errors.REPLY_ALREADY_EXISTS', 'لقد قمت بالرد على هذا التقييم مسبقاً.');
      } else if (msg.includes('REVIEW_REPLY_FORBIDDEN')) {
        errorText = t('reviews:errors.REVIEW_REPLY_FORBIDDEN', 'غير مصرح لك بالرد على هذا التقييم.');
      } else if (msg.includes('REVIEW_NOT_FOUND')) {
        errorText = t('reviews:errors.REVIEW_NOT_FOUND', 'التقييم المطلوب غير موجود.');
      } else if (msg) {
        errorText = msg;
      }

      toast.error(errorText);
    },
  });
}
