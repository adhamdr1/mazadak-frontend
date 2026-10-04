import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Clock,
  Sparkles,
  HelpCircle,
  RotateCcw,
} from 'lucide-react';
import { Button } from '@/components/common/Button';
import { InspectionCountdown } from '../components/InspectionCountdown';
import { EscrowInfoCard } from '../components/EscrowInfoCard';
import { EscrowAuctionCard } from '../components/EscrowAuctionCard';
import { EscrowCounterpartyCard } from '../components/EscrowCounterpartyCard';
import { ConfirmDeliveryModal } from '../components/ConfirmDeliveryModal';
import { useEscrowDetail } from '../hooks/useEscrowDetail';
import { useConfirmDelivery } from '../hooks/useConfirmDelivery';
import { useEscrowSubscription } from '../hooks/useEscrowSubscription';
import { getLocalizedErrorMessage } from '@/utils/errorHandler';
import { ROUTES } from '@/constants/routes.constants';
import { ReviewEligibilityBanner } from '@/features/reviews';

export const EscrowDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation(['escrow', 'common']);
  const isRTL = i18n.language?.startsWith('ar');

  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  // 1. Data Query & Permissions
  const {
    escrow,
    isLoading,
    isError,
    error,
    refetch,
    isBuyer,
    isSeller,
    counterpartyRole,
    counterpartyProfile,
    isCounterpartyLoading,
    canConfirmDelivery,
    canOpenDispute,
    isHeld,
  } = useEscrowDetail(id);

  // 2. Real-Time Subscription
  useEscrowSubscription(id);

  // 3. Confirm Delivery Mutation
  const { confirmDelivery, isLoading: isConfirming } = useConfirmDelivery();

  const handleConfirmDelivery = async () => {
    if (!id) return;
    try {
      await confirmDelivery(id);
      setIsConfirmModalOpen(false);
    } catch {
      // Error handled by mutation toast
    }
  };

  // Canonical URL auto-correction if accessed via auctionId
  React.useEffect(() => {
    if (id && escrow?._id && id !== escrow._id) {
      navigate(ROUTES.ESCROW_DETAIL(escrow._id), { replace: true });
    }
  }, [id, escrow?._id, navigate]);

  // Loading Skeleton State
  if (isLoading && !escrow) {
    return (
      <div className="max-w-6xl w-full mx-auto px-4 sm:px-6 py-8 space-y-6 animate-pulse">
        <div className="flex justify-between items-center">
          <div className="h-10 w-72 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
          <div className="h-10 w-36 bg-slate-200 dark:bg-slate-800 rounded-xl" />
        </div>
        <div className="h-56 bg-slate-200 dark:bg-slate-800 rounded-3xl" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-44 bg-slate-200 dark:bg-slate-800 rounded-3xl" />
          <div className="h-44 bg-slate-200 dark:bg-slate-800 rounded-3xl" />
        </div>
        <div className="h-36 bg-slate-200 dark:bg-slate-800 rounded-3xl" />
      </div>
    );
  }

  // Error or Not Found State
  if (isError || !escrow) {
    const localizedError = error
      ? getLocalizedErrorMessage(error, (key) => t(key), 'escrow')
      : null;

    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-5">
        <div className="w-16 h-16 rounded-3xl bg-rose-500/10 text-rose-600 dark:text-rose-400 mx-auto flex items-center justify-center">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            {t('detail.notFoundTitle', isRTL ? 'معاملة الضمان غير موجودة' : 'Escrow transaction not found')}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
            {localizedError ||
              t(
                'detail.notFoundDesc',
                isRTL
                  ? 'تعذر العثور على سجل الضمان المالي المطلوب، أو ربما لا تملك صلاحية الوصول إليه.'
                  : 'Could not locate this escrow transaction, or you may lack permission to view it.'
              )}
          </p>
        </div>
        <div className="flex items-center justify-center gap-3 pt-2">
          <Button
            variant="outline"
            onClick={() => refetch()}
            leftIcon={<RotateCcw className="w-4 h-4" />}
            className="font-bold rounded-xl"
          >
            {t('common:actions.retry', isRTL ? 'إعادة المحاولة' : 'Try Again')}
          </Button>
          <Button
            onClick={() => navigate(ROUTES.MY_ESCROWS)}
            className="font-bold rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950"
          >
            {t('detail.backToMyEscrows', isRTL ? 'العودة لمعاملاتي' : 'Back to My Escrows')}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8">
      {/* 1. Header Area: Title + Role Badge & Back to Transactions Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200/80 dark:border-slate-800">
        <div className="space-y-1.5 min-w-0">
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <h1 className="text-lg sm:text-2xl md:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
              {t('detail.pageTitle', isRTL ? 'تفاصيل الضمان المالي' : 'Escrow Hold Details')}
            </h1>

            {/* Dynamic Role Pill in Header */}
            {isBuyer && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full text-2xs sm:text-xs font-black bg-emerald-500/10 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 shadow-2xs shrink-0">
                <ShieldCheck className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                <span>{t('card.roleBuyer', isRTL ? 'أنت المشتري' : 'You are Buyer')}</span>
              </span>
            )}
            {isSeller && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full text-2xs sm:text-xs font-black bg-amber-500/10 dark:bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 shadow-2xs shrink-0">
                <ShieldCheck className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                <span>{t('card.roleSeller', isRTL ? 'أنت البائع' : 'You are Seller')}</span>
              </span>
            )}
          </div>

          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-3xl leading-relaxed">
            {isBuyer
              ? t(
                  'detail.buyerSubtitle',
                  isRTL
                    ? 'أنت المشتري في هذه المعاملة. أموالك محتجزة بأمان في حساب الضمان حتى فحص واستلام السلعة.'
                    : 'You are the buyer in this transaction. Your funds are secured in escrow until you inspect and accept the delivered item.'
                )
              : isSeller
              ? t(
                  'detail.sellerSubtitle',
                  isRTL
                    ? 'أنت البائع في هذه المعاملة. أموالك مضمونة وستتحرر إلى محفظتك فور تأكيد المشتري أو انتهاء مهلة الفحص.'
                    : 'You are the seller in this transaction. Funds are guaranteed and will release to your wallet once buyer confirms delivery or upon inspection expiry.'
                )
              : t(
                  'detail.generalSubtitle',
                  isRTL
                    ? 'سجل تفصيلي لحالة وأطراف معاملة الوساطة المالية المضمونة.'
                    : 'Detailed audit log and status of secured escrow intermediation.'
                )}
          </p>
        </div>

        {/* Back to Transactions Button (Matches Unified Gold Hover Pill) */}
        <Link
          to={ROUTES.MY_ESCROWS}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 hover:text-amber-600 dark:hover:text-amber-400 hover:border-amber-500/50 dark:hover:border-amber-500/50 hover:bg-amber-50/40 dark:hover:bg-amber-950/20 transition-all shadow-2xs group shrink-0 self-start sm:self-center select-none cursor-pointer whitespace-nowrap"
        >
          {isRTL ? (
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
          ) : (
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
          )}
          <span>{t('detail.backToEscrowsList', isRTL ? 'العودة لقائمة المعاملات' : 'Back to Transactions')}</span>
        </Link>
      </div>

      {/* 2. Top / 1st: Total Held Amount Card (Full Width Horizontal Command Center) */}
      <EscrowInfoCard escrow={escrow} />

      {/* 2.5: Review Eligibility / Status Banner */}
      <ReviewEligibilityBanner
        auctionId={escrow.auctionId || escrow.auction?._id || ''}
        auctionTitle={escrow.auction?.title}
        escrowStatus={escrow.status}
        isDisputed={escrow.status === 'DISPUTED'}
        showPendingNoticeWhenHeld={true}
        reviewedUserName={
          counterpartyProfile
            ? `${counterpartyProfile.firstName} ${counterpartyProfile.lastName}`
            : undefined
        }
      />

      {/* 3. 2nd: Inspection Period Countdown (Full Width when HELD) */}
      {isHeld && escrow.inspectionPeriodEndsAt && (
        <InspectionCountdown
          inspectionPeriodEndsAt={escrow.inspectionPeriodEndsAt}
          inspectionDurationHours={escrow.inspectionDurationHours}
        />
      )}

      {/* 4. 3rd: Interactive Action Toolbar (Only shown when HELD and active actions are available) */}
      {isHeld && (canConfirmDelivery || canOpenDispute) && (
        <div className="rounded-3xl p-5 sm:p-6 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
          <div className="space-y-1">
            <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>{t('detail.actionsTitle', isRTL ? 'الإجراءات المتاحة للمشتري' : 'Available Buyer Actions')}</span>
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              {t(
                'detail.actionsDesc',
                isRTL
                  ? 'إذا استلمت السلعة وفحصتها بنجاح اضغط على تأكيد الاستلام لتحرير المبلغ، أو افتح نزاعاً في حال وجود خلل.'
                  : 'If you have received and inspected the item, confirm delivery to release funds, or open a dispute if issues were encountered.'
              )}
            </p>
          </div>

          <div className="flex items-center flex-wrap gap-3">
            {canOpenDispute && (
              <Link
                to={ROUTES.OPEN_DISPUTE(escrow._id)}
                className="inline-flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-rose-600 dark:text-rose-400 bg-rose-50 hover:bg-rose-100/90 dark:bg-rose-950/40 dark:hover:bg-rose-900/50 border border-rose-200/90 dark:border-rose-900/60 active:scale-98 transition-all duration-200 cursor-pointer shadow-2xs select-none"
              >
                <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
                <span>{t('detail.openDisputeBtn', isRTL ? 'فتح نزاع مالي' : 'Open Dispute')}</span>
              </Link>
            )}

            {canConfirmDelivery && (
              <button
                type="button"
                onClick={() => setIsConfirmModalOpen(true)}
                className="inline-flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 hover:bg-emerald-100/90 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/50 border border-emerald-200/90 dark:border-emerald-900/60 active:scale-98 transition-all duration-200 cursor-pointer shadow-2xs select-none"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>{t('detail.confirmDeliveryBtn', isRTL ? 'تأكيد استلام السلعة' : 'Confirm Delivery')}</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* 5. 4th: 2-Column Responsive Grid (Auction Card + Counterparty Card) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        {/* Column 1: Associated Auction Details */}
        <EscrowAuctionCard
          auction={escrow.auction}
          auctionId={escrow.auctionId}
        />

        {/* Column 2: Counterparty User Card */}
        <EscrowCounterpartyCard
          profile={counterpartyProfile}
          role={counterpartyRole}
          isLoading={isCounterpartyLoading}
        />
      </div>

      {/* 6. 5th: Mazadak Trust Guarantees (Full-Width Horizontal 3-Column Card) */}
      <div className="group relative w-full rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-5 sm:p-7 space-y-5 shadow-sm hover:shadow-xl hover:shadow-slate-200/70 dark:shadow-[0_4px_20px_-2px_rgba(0,0,0,0.5)] dark:hover:shadow-[0_12px_35px_-5px_rgba(0,0,0,0.8),0_0_25px_rgba(245,158,11,0.18)] hover:border-amber-500/50 dark:hover:border-amber-500/50 hover:-translate-y-1 transition-all duration-300">
        <div className="flex items-center gap-3 text-slate-900 dark:text-white font-black text-sm pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 dark:bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/20">
            <Lock className="w-4.5 h-4.5" />
          </div>
          <div>
            <h4 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
              {t('detail.protectionGuaranteeTitle', isRTL ? 'ضمانات مزادك المالية' : 'Mazadak Financial Guarantees')}
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-normal">
              {isRTL
                ? 'حماية مشفرة ثلاثية المستويات لضمان حقوق كافة أطراف المزادات المكتملة'
                : 'Triple-layer encrypted protection securing all completed auction transactions'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Guarantee 1: Vault holding */}
          <div className="p-4 rounded-2xl bg-slate-50/90 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-2 hover:border-emerald-500/30 transition-colors">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <h5 className="text-xs font-black text-slate-900 dark:text-white">
              {isRTL ? 'حجز بنكي ومحفظي آمن' : 'Encrypted Vault Holding'}
            </h5>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              {t(
                'detail.guarantee1',
                isRTL
                  ? 'حجز بنكي ومحفظي آمن: لا يتم تحويل الأموال للبائع إلا بعد رضا المشتري.'
                  : 'Encrypted vault holding: Funds are never paid out until inspection passes.'
              )}
            </p>
          </div>

          {/* Guarantee 2: 7-day inspection */}
          <div className="p-4 rounded-2xl bg-slate-50/90 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-2 hover:border-amber-500/30 transition-colors">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
            <h5 className="text-xs font-black text-slate-900 dark:text-white">
              {isRTL ? 'مهلة فحص قانونية ٧ أيام' : '7-Day Inspection Window'}
            </h5>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              {t(
                'detail.guarantee2',
                isRTL
                  ? 'فترة فحص قانونية كاملة مدتها ٧ أيام للمعاينة والتأكد من مطابقة السلعة.'
                  : 'Full 7-day statutory inspection window to verify item authenticity.'
              )}
            </p>
          </div>

          {/* Guarantee 3: Dispute committee */}
          <div className="p-4 rounded-2xl bg-slate-50/90 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-2 hover:border-blue-500/30 transition-colors">
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <HelpCircle className="w-4 h-4" />
            </div>
            <h5 className="text-xs font-black text-slate-900 dark:text-white">
              {isRTL ? 'لجنة فض نزاعات رسمية' : 'Arbitration Committee'}
            </h5>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              {t(
                'detail.guarantee3',
                isRTL
                  ? 'لجنة فض نزاعات رسمية تفصل بين الطرفين وتحمي حقوق المشتري والبائع.'
                  : 'Dedicated dispute arbitration committee protecting both buyers and sellers.'
              )}
            </p>
          </div>
        </div>
      </div>

      {/* 7. Confirm Delivery Irreversible Action Modal */}
      <ConfirmDeliveryModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={handleConfirmDelivery}
        isLoading={isConfirming}
        auctionTitle={escrow.auction?.title}
        amount={escrow.amount || '0'}
      />
    </div>
  );
};

