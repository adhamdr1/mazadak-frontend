import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import {
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
  ArrowLeft,
  Lock,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { escrowService } from '@/features/escrow/services/escrow.service';
import { useEscrowSubscription } from '@/features/escrow/hooks/useEscrowSubscription';
import { QUERY_KEYS } from '@/constants/queryKeys.constants';
import { ROUTES } from '@/constants/routes.constants';
import { formatPrice, formatRelativeTime } from '@/utils/formatters';
import { cn } from '@/utils/cn';

export interface EscrowBannerProps {
  auctionId: string;
  className?: string;
}

export const EscrowBanner: React.FC<EscrowBannerProps> = ({ auctionId, className }) => {
  const { t, i18n } = useTranslation(['escrow', 'common']);
  const isRTL = i18n.language?.startsWith('ar');
  const { user } = useAuth();

  // 1. Fetch Escrow for this Auction
  const { data: escrow, isLoading } = useQuery({
    queryKey: QUERY_KEYS.ESCROW.BY_AUCTION(auctionId),
    queryFn: () => escrowService.getEscrowByAuction(auctionId),
    enabled: Boolean(auctionId),
    staleTime: 1000 * 30, // 30s
  });

  // 2. Real-time Live Subscription
  useEscrowSubscription(escrow?._id);

  // If loading or no escrow exists yet, don't render banner
  if (isLoading || !escrow) {
    return null;
  }

  const currentUserId = user?._id;
  const isBuyer = Boolean(currentUserId && escrow.buyerId === currentUserId);
  const isSeller = Boolean(currentUserId && escrow.sellerId === currentUserId);
  const isParticipant = isBuyer || isSeller;

  const isHeld = escrow.status === 'HELD';
  const isReleased = escrow.status === 'RELEASED';
  const isRefunded = escrow.status === 'REFUNDED';
  const isDisputed = escrow.status === 'DISPUTED';

  const formattedAmount = `${formatPrice(Number(escrow.amount), isRTL)} ${t('currency.egp', 'ج.م')}`;

  // State 1: Active Dispute Banner
  if (isDisputed) {
    return (
      <div
        className={cn(
          'rounded-2xl p-4 sm:p-5 bg-gradient-to-r from-rose-500/10 via-rose-500/5 to-transparent border border-rose-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm animate-fadeIn',
          className
        )}
      >
        <div className="flex items-start gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-rose-500/15 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 border border-rose-500/20">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-black text-rose-700 dark:text-rose-400">
                {t('detail.disputeActiveTitle', isRTL ? 'يوجد نزاع مالي مفتوح' : 'Active Financial Dispute')}
              </span>
              <span className="px-2 py-0.5 rounded-full text-3xs font-black bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/20">
                {t('status.DISPUTED', isRTL ? 'معلّق بالتحكيم' : 'Under Arbitration')}
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              {t(
                'detail.disputeActiveDesc',
                isRTL
                  ? 'المعاملة قيد المراجعة والتحقيق من قبل إدارة مزادك للبت في قرار التسوية لحماية الطرفين.'
                  : 'Transaction is undergoing arbitration review by the committee.'
              )}
            </p>
          </div>
        </div>

        {escrow.disputeId ? (
          <Link
            to={ROUTES.DISPUTE_DETAIL(escrow.disputeId)}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-rose-700 dark:text-rose-300 bg-white dark:bg-slate-900 border border-rose-300 dark:border-rose-900/60 hover:bg-rose-50 dark:hover:bg-rose-950/40 shadow-2xs transition-all shrink-0 cursor-pointer select-none"
          >
            <span>{t('detail.viewDisputeDetails', isRTL ? 'عرض ملف النزاع' : 'View Dispute File')}</span>
            {isRTL ? <ArrowLeft className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
          </Link>
        ) : (
          <Link
            to={ROUTES.ESCROW_DETAIL(escrow._id)}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-rose-700 dark:text-rose-300 bg-white dark:bg-slate-900 border border-rose-300 dark:border-rose-900/60 hover:bg-rose-50 dark:hover:bg-rose-950/40 shadow-2xs transition-all shrink-0 cursor-pointer select-none"
          >
            <span>{t('card.viewDetails', isRTL ? 'عرض التفاصيل' : 'View Details')}</span>
            {isRTL ? <ArrowLeft className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
          </Link>
        )}
      </div>
    );
  }

  // State 2: Funds Held in Escrow (Inspection Period Active)
  if (isHeld) {
    return (
      <div
        className={cn(
          'rounded-2xl p-4 sm:p-5 bg-gradient-to-r from-amber-500/15 via-amber-500/5 to-transparent border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm animate-fadeIn',
          className
        )}
      >
        <div className="flex items-start gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/25">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs sm:text-sm font-black text-slate-900 dark:text-white">
                {isBuyer
                  ? t('card.securedAmount', isRTL ? 'أموالك محتجزة بأمان في الضمان' : 'Funds Secured in Escrow')
                  : isSeller
                    ? t('card.roleSeller', isRTL ? 'مبلغ المزاد محتجز بضمان مؤكد' : 'Auction Amount Secured')
                    : t('detail.protectionType', isRTL ? 'معاملة محمية بنظام الضمان المالي' : 'Secured Escrow Transaction')}
              </span>
              <span className="px-2 py-0.5 rounded-full text-3xs font-black bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/25">
                <Lock className="w-2.5 h-2.5 inline me-1" />
                {formattedAmount}
              </span>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              {isBuyer
                ? t(
                  'detail.buyerSubtitle',
                  isRTL
                    ? 'أموالك محتجزة بأمان حتى تفحص وتستلم السلعة. يمكنك تأكيد الاستلام أو فتح نزاع.'
                    : 'Funds are securely held in escrow until you inspect and accept the delivered item.'
                )
                : isSeller
                  ? t(
                    'detail.sellerSubtitle',
                    isRTL
                      ? 'أموالك مضمونة وستتحرر لمحفظتك فور تأكيد المشتري أو انتهاء مهلة الـ 7 أيام.'
                      : 'Funds are secured and will release to your wallet once buyer confirms delivery or inspection window ends.'
                  )
                  : t(
                    'card.inspectionDays',
                    { days: 7, defaultValue: isRTL ? 'مهلة فحص ومعاينة 7 أيام مفعلة' : '7-day inspection window active' }
                  )}
            </p>

            {escrow.inspectionPeriodEndsAt && (
              <div className="flex items-center gap-1.5 text-3xs font-bold text-amber-700 dark:text-amber-300 pt-0.5">
                <Clock className="w-3 h-3 text-amber-500 shrink-0" />
                <span>
                  {t('openDispute.inspectionWindowActive', isRTL ? 'مهلة المعاينة سارية حتى:' : 'Inspection valid until:')}{' '}
                  {formatRelativeTime(escrow.inspectionPeriodEndsAt, isRTL)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Action Button */}
        {isParticipant && (
          <Link
            to={ROUTES.ESCROW_DETAIL(escrow._id)}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-900 dark:text-white bg-white dark:bg-slate-900 border border-amber-500/40 hover:bg-amber-50 dark:hover:bg-amber-950/30 shadow-2xs transition-all shrink-0 cursor-pointer select-none"
          >
            <span>{t('card.viewDetails', isRTL ? 'عرض تفاصيل الضمان' : 'View Escrow Details')}</span>
            {isRTL ? <ArrowLeft className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
          </Link>
        )}
      </div>
    );
  }

  // State 3: Released to Seller
  if (isReleased) {
    return (
      <div
        className={cn(
          'rounded-2xl p-4 sm:p-5 bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent border border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm animate-fadeIn',
          className
        )}
      >
        <div className="flex items-start gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/20">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div className="space-y-1 min-w-0">
            <span className="text-xs sm:text-sm font-black text-emerald-800 dark:text-emerald-300 block">
              {t('detail.releasedTitle', isRTL ? 'تم تحرير مبلغ الضمان للبائع' : 'Escrow Funds Released to Seller')}
            </span>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              {t(
                'card.releasedNotice',
                isRTL
                  ? 'تم تسليم السلعة وتحرير المبلغ للبائع بنجاح واكتمال المعاملة.'
                  : 'Item delivery confirmed and payment released to seller.'
              )}
            </p>
          </div>
        </div>

        {isParticipant && (
          <Link
            to={ROUTES.ESCROW_DETAIL(escrow._id)}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-emerald-800 dark:text-emerald-300 bg-white dark:bg-slate-900 border border-emerald-300 dark:border-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 shadow-2xs transition-all shrink-0 cursor-pointer select-none"
          >
            <span>{t('card.viewDetails', isRTL ? 'سجل المعاملة' : 'Audit Record')}</span>
            {isRTL ? <ArrowLeft className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
          </Link>
        )}
      </div>
    );
  }

  // State 4: Refunded to Buyer
  if (isRefunded) {
    return (
      <div
        className={cn(
          'rounded-2xl p-4 sm:p-5 bg-gradient-to-r from-blue-500/10 via-blue-500/5 to-transparent border border-blue-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm animate-fadeIn',
          className
        )}
      >
        <div className="flex items-start gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-blue-500/15 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-500/20">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div className="space-y-1 min-w-0">
            <span className="text-xs sm:text-sm font-black text-blue-800 dark:text-blue-300 block">
              {t('detail.refundedTitle', isRTL ? 'تم استرداد المبلغ للمشتري' : 'Escrow Amount Refunded to Buyer')}
            </span>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              {t(
                'card.refundedNotice',
                isRTL
                  ? 'تم استرداد المبلغ بالكامل إلى محفظة المشتري.'
                  : 'Full transaction amount has been refunded to buyer wallet.'
              )}
            </p>
          </div>
        </div>

        {isParticipant && (
          <Link
            to={ROUTES.ESCROW_DETAIL(escrow._id)}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-blue-800 dark:text-blue-300 bg-white dark:bg-slate-900 border border-blue-300 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-950/40 shadow-2xs transition-all shrink-0 cursor-pointer select-none"
          >
            <span>{t('card.viewDetails', isRTL ? 'سجل المعاملة' : 'Audit Record')}</span>
            {isRTL ? <ArrowLeft className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
          </Link>
        )}
      </div>
    );
  }

  return null;
};
