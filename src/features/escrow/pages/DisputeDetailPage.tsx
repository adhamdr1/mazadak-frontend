import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ShieldAlert,
  ArrowRight,
  ArrowLeft,
  AlertTriangle,
  RotateCcw,
  ExternalLink,
  Calendar,
  Lock,
  FileText,
  Gavel,
  User,
  Tag,
  Copy,
  Check,
  Scale,
  Star,
  MapPin,
} from 'lucide-react';
import { Button } from '@/components/common/Button';
import { DisputeStatusBadge } from '../components/DisputeStatusBadge';
import { DisputeEvidenceGallery } from '../components/DisputeEvidenceGallery';
import { DisputeAdminResolutionCard } from '../components/DisputeAdminResolutionCard';
import { CancelDisputeModal } from '../components/CancelDisputeModal';
import { useDisputeDetail } from '../hooks/useDisputeDetail';
import { useCancelDispute } from '../hooks/useCancelDispute';
import { useDisputeSubscription } from '../hooks/useDisputeSubscription';
import { formatPrice, formatDateTime, toLocalizedDigits } from '@/utils/formatters';
import { getLocalizedErrorMessage } from '@/utils/errorHandler';
import { ROUTES } from '@/constants/routes.constants';

export const DisputeDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation(['escrow', 'common']);
  const isRTL = i18n.language?.startsWith('ar');

  const [copiedId, setCopiedId] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);

  // 1. Fetch Dispute & Related Entities
  const {
    dispute,
    escrow,
    isLoading,
    isError,
    error,
    refetch,
    isOpener,
    isAgainstUser,
    openerProfile,
    againstUserProfile,
    isOpenerProfileLoading,
    isAgainstUserProfileLoading,
    canCancel,
  } = useDisputeDetail(id);

  // 2. Real-Time Subscription
  useDisputeSubscription(id);

  // 3. Cancel Dispute Mutation
  const { cancelDispute, isLoading: isCancelling } = useCancelDispute();

  const handleConfirmCancel = async () => {
    if (!id) return;
    try {
      await cancelDispute(id);
      setIsCancelModalOpen(false);
    } catch {
      // Handled by hook toast
    }
  };

  const handleCopyId = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!id) return;
    navigator.clipboard.writeText(id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  // Loading Skeleton
  if (isLoading && !dispute) {
    return (
      <div className="max-w-5xl w-full mx-auto px-4 sm:px-6 py-8 space-y-6 animate-pulse">
        <div className="flex justify-between items-center">
          <div className="h-9 w-64 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
          <div className="h-9 w-36 bg-slate-200 dark:bg-slate-800 rounded-xl" />
        </div>
        <div className="h-44 bg-slate-200 dark:bg-slate-800 rounded-3xl" />
        <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-3xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="h-36 bg-slate-200 dark:bg-slate-800 rounded-3xl" />
          <div className="h-36 bg-slate-200 dark:bg-slate-800 rounded-3xl" />
        </div>
      </div>
    );
  }

  // Not Found / Error State
  if (isError || !dispute) {
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
            {t('disputeDetail.notFoundTitle', isRTL ? 'سجل النزاع غير موجود' : 'Dispute record not found')}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
            {localizedError ||
              t(
                'disputeDetail.notFoundDesc',
                isRTL
                  ? 'تعذر العثور على ملف النزاع المالي المطلوب، أو ربما لا تملك صلاحية الوصول إليه.'
                  : 'Could not locate this dispute record or you lack permission to view it.'
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

  const cleanId = String(dispute._id || '');
  const formattedId =
    cleanId.length > 12
      ? `DIS-${cleanId.slice(0, 5)}...${cleanId.slice(-4)}`
      : cleanId
        ? `DIS-${cleanId}`
        : '—';

  const formattedCreatedAt = dispute.createdAt
    ? formatDateTime(dispute.createdAt, isRTL, { dateStyle: 'medium', timeStyle: 'short' })
    : '—';

  const escrowAmount = escrow?.amount
    ? `${formatPrice(Number(escrow.amount), isRTL)} ${t('currency.egp', 'ج.م')}`
    : null;

  // Determine roles of Claimant and Respondent cleanly
  const isClaimantBuyer =
    escrow?.buyerId && dispute?.openedById
      ? escrow.buyerId === dispute.openedById
      : true;

  const claimantRoleText = isClaimantBuyer
    ? t('disputeDetail.roleBuyer', isRTL ? 'المشتري' : 'Buyer')
    : t('disputeDetail.roleSeller', isRTL ? 'البائع' : 'Seller');

  const respondentRoleText = isClaimantBuyer
    ? t('disputeDetail.roleSeller', isRTL ? 'البائع' : 'Seller')
    : t('disputeDetail.roleBuyer', isRTL ? 'المشتري' : 'Buyer');

  const openerRating = Number(openerProfile?.ratingStats?.averageRating || 0);
  const openerReviewsCount = Number(openerProfile?.ratingStats?.totalReviews || 0);

  const againstRating = Number(againstUserProfile?.ratingStats?.averageRating || 0);
  const againstReviewsCount = Number(againstUserProfile?.ratingStats?.totalReviews || 0);

  return (
    <div className="max-w-5xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8 animate-fadeIn">
      {/* 1. Top Header Area (Title & User Role on Unified Row) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200/80 dark:border-slate-800">
        <div className="space-y-1.5 min-w-0">
          <div className="flex items-center gap-2.5 sm:gap-3 flex-nowrap">
            <h1 className="text-base sm:text-xl md:text-2xl font-black tracking-tight text-slate-900 dark:text-white shrink-0 whitespace-nowrap">
              {t('disputeDetail.pageTitle', isRTL ? 'تفاصيل النزاع المالي' : 'Financial Dispute Details')}
            </h1>

            {/* Clean User Role Pill in Same Header Row */}
            {isOpener && (
              <span className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full text-2xs sm:text-xs font-black bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/30 shadow-2xs whitespace-nowrap shrink-0">
                <ShieldAlert className="w-3 sm:w-3.5 h-3 sm:h-3.5 shrink-0" />
                <span>{t('disputeDetail.youAreOpener', isRTL ? 'أنت مقدم النزاع (الشاكي)' : 'You are Claimant')}</span>
              </span>
            )}
            {isAgainstUser && (
              <span className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full text-2xs sm:text-xs font-black bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/30 shadow-2xs whitespace-nowrap shrink-0">
                <Scale className="w-3 sm:w-3.5 h-3 sm:h-3.5 shrink-0" />
                <span>{t('disputeDetail.youAreRespondent', isRTL ? 'أنت الطرف المشكو في حقه' : 'You are Respondent')}</span>
              </span>
            )}
          </div>

          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed">
            {t(
              'disputeDetail.subtitle',
              isRTL
                ? 'ملف النزاع المالي ومستندات التحكيم لحماية حقوق الطرفين.'
                : 'Financial dispute file and arbitration documents securing party rights.'
            )}
          </p>
        </div>

        {/* Back Link Button */}
        <Link
          to={escrow?._id ? ROUTES.ESCROW_DETAIL(escrow._id) : ROUTES.MY_ESCROWS}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 hover:text-amber-600 dark:hover:text-amber-400 hover:border-amber-500/50 dark:hover:border-amber-500/50 hover:bg-amber-50/40 dark:hover:bg-amber-950/20 transition-all shadow-2xs group shrink-0 self-start sm:self-center select-none cursor-pointer whitespace-nowrap"
        >
          {isRTL ? (
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
          ) : (
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
          )}
          <span>
            {escrow?._id
              ? t('openDispute.backToEscrow', isRTL ? 'العودة لتفاصيل الضمان' : 'Back to Escrow')
              : t('detail.backToMyEscrows', isRTL ? 'العودة لمعاملاتي' : 'Back to My Escrows')}
          </span>
        </Link>
      </div>

      {/* 2. Hero Dispute Overview Card (Follows EscrowInfoCard Pattern with Single Clean Amount) */}
      <div className="group relative w-full rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-5 sm:p-7 space-y-6 shadow-sm hover:shadow-xl hover:shadow-slate-200/70 dark:shadow-[0_4px_20px_-2px_rgba(0,0,0,0.5)] dark:hover:shadow-[0_12px_35px_-5px_rgba(0,0,0,0.8),0_0_25px_rgba(245,158,11,0.18)] hover:border-amber-500/50 dark:hover:border-amber-500/50 hover:-translate-y-1 transition-all duration-300">
        {/* Header with Arbitration Title & Status Badge */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100 dark:border-slate-800/90">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 dark:bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/20">
              <Scale className="w-6 h-6" />
            </div>

            <div className="space-y-0.5">
              <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                {t('disputeDetail.arbitrationFileTitle', isRTL ? 'ملف التحكيم وفض النزاعات' : 'Arbitration & Dispute File')}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                {t('disputeDetail.arbitrationFileSubtitle', isRTL ? 'المعاملة قيد نظر لجنة التحكيم لفض النزاع' : 'Transaction currently under arbitration review')}
              </p>
            </div>
          </div>

          <div className="self-start sm:self-auto shrink-0">
            <DisputeStatusBadge status={dispute.status} size="lg" />
          </div>
        </div>

        {/* Structured 4-Column Audit Grid (Harmonious Rhythm & Height) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4 text-xs">
          {/* 1. Dispute Reference ID */}
          <div className="p-4 rounded-2xl bg-slate-50/90 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-1.5 hover:border-slate-200 dark:hover:border-slate-700 transition-colors flex flex-col justify-between">
            <span className="text-slate-400 dark:text-slate-500 font-bold block text-[11px]">
              {t('disputeDetail.disputeId', isRTL ? 'معرّف النزاع' : 'Dispute ID')}
            </span>
            <div className="flex items-center justify-between gap-2">
              <span className="font-mono font-bold text-slate-800 dark:text-slate-200 text-xs truncate" dir="ltr">
                {formattedId}
              </span>
              <button
                type="button"
                onClick={handleCopyId}
                title={cleanId}
                className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-white dark:bg-slate-700/80 text-slate-600 dark:text-slate-300 hover:text-amber-600 dark:hover:text-amber-400 border border-slate-200 dark:border-slate-600 text-[10px] font-bold transition-all cursor-pointer shadow-2xs hover:scale-105 active:scale-95 shrink-0"
              >
                {copiedId ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-500" />
                    <span className="text-emerald-600 dark:text-emerald-400">{t('card.copied', 'تم النسخ')}</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>{t('common:actions.copy', 'نسخ')}</span>
                  </>
                )}
              </button>
            </div>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 block font-medium">
              {t('disputeDetail.disputeIdSubtext', isRTL ? 'نزاع مالي موثق' : 'Official Dispute Record')}
            </span>
          </div>

          {/* 2. Dispute Creation Date */}
          <div className="p-4 rounded-2xl bg-slate-50/90 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-1.5 hover:border-slate-200 dark:hover:border-slate-700 transition-colors flex flex-col justify-between">
            <span className="text-slate-400 dark:text-slate-500 font-bold block text-[11px]">
              {t('disputeDetail.openedAtLabel', isRTL ? 'تاريخ فتح النزاع' : 'Opened Date')}
            </span>
            <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200">
              <Calendar className="w-4 h-4 text-amber-500 shrink-0" />
              <span className="truncate">{formattedCreatedAt}</span>
            </div>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 block font-medium">
              {t('disputeDetail.openedAtSubtext', isRTL ? 'إحالة للتحكيم المالي' : 'Referred to Arbitration')}
            </span>
          </div>

          {/* 3. Primary Dispute Reason (Readable, No Cutoff) */}
          <div className="p-4 rounded-2xl bg-slate-50/90 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-1.5 hover:border-slate-200 dark:hover:border-slate-700 transition-colors flex flex-col justify-between">
            <span className="text-slate-400 dark:text-slate-500 font-bold block text-[11px]">
              {t('disputeDetail.reasonLabel', isRTL ? 'نوع المشكلة أو سبب النزاع' : 'Dispute Reason')}
            </span>
            <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200">
              <Tag className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span className="text-xs leading-snug break-words">
                {t(`reasons.${dispute.reason}`, dispute.reason)}
              </span>
            </div>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 block font-medium">
              {t('disputeDetail.reasonSubtext', isRTL ? 'السبب المسجل من الشاكي' : 'Initiator Claim Reason')}
            </span>
          </div>

          {/* 4. Disputed Escrow Hold (Single Clean Prominent Display) */}
          <div className="p-4 rounded-2xl bg-slate-50/90 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-1.5 hover:border-slate-200 dark:hover:border-slate-700 transition-colors flex flex-col justify-between">
            <span className="text-slate-400 dark:text-slate-500 font-bold block text-[11px]">
              {t('disputeDetail.securedAmount', isRTL ? 'المبلغ المتنازع عليه' : 'Disputed Amount')}
            </span>
            <div className="flex items-center gap-1.5 font-bold text-emerald-600 dark:text-emerald-400 font-mono text-sm sm:text-base">
              <Lock className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span>{escrowAmount || '—'}</span>
            </div>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 block font-medium">
              {t('disputeDetail.amountSubtext', isRTL ? 'محتجز بخزنة الضمان' : 'Secured in Escrow Vault')}
            </span>
          </div>
        </div>
      </div>

      {/* 3. Associated Auction Item Card (Interactive Signature Hover) */}
      <div className="group relative rounded-3xl p-5 sm:p-6 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 hover:border-amber-500/50 dark:hover:border-amber-500/50 hover:shadow-xl hover:shadow-slate-200/70 dark:shadow-[0_4px_20px_-2px_rgba(0,0,0,0.5)] dark:hover:shadow-[0_12px_35px_-5px_rgba(0,0,0,0.8),0_0_25px_rgba(245,158,11,0.18)] hover:-translate-y-1 transition-all duration-300 flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="flex items-center gap-4 min-w-0">
          {/* Clickable Auction Thumbnail */}
          <Link
            to={ROUTES.AUCTION_DETAIL(dispute.auctionId)}
            target="_blank"
            rel="noopener noreferrer"
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0 border border-slate-200/90 dark:border-slate-700/80 shadow-xs relative group hover:ring-2 hover:ring-amber-500/50 transition-all block cursor-pointer"
            title={t('openDispute.auctionInfo', isRTL ? 'عرض صفحة المزاد' : 'View Auction')}
          >
            {escrow?.auction?.images?.[0] ? (
              <img
                src={escrow.auction.images[0]}
                alt={escrow.auction.title || 'Auction'}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-400">
                <Gavel className="w-6 h-6" />
              </div>
            )}
          </Link>

          {/* Title & Links */}
          <div className="space-y-1.5 min-w-0">
            <div>
              <span className="text-[10px] sm:text-xs font-semibold text-amber-700 dark:text-amber-400 bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/20 px-2 py-0.5 rounded-md inline-block">
                {t('openDispute.auctionInfo', isRTL ? 'المزاد المرتبط' : 'Associated Auction')}
              </span>
            </div>
            <div>
              <Link
                to={ROUTES.AUCTION_DETAIL(dispute.auctionId)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 max-w-full text-base sm:text-lg font-black truncate text-slate-900 dark:text-white hover:text-amber-600 dark:hover:text-amber-400 transition-colors group/link"
                title={t('openDispute.auctionInfo', isRTL ? 'عرض صفحة المزاد' : 'View Auction')}
              >
                <span className="truncate">{escrow?.auction?.title || t('card.unknownAuction', isRTL ? 'مزاد مكتمل' : 'Completed Auction')}</span>
                <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover/link:text-amber-500 transition-colors shrink-0" />
              </Link>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
              {escrow?._id && (
                <Link
                  to={ROUTES.ESCROW_DETAIL(escrow._id)}
                  className="hover:text-amber-600 dark:hover:text-amber-400 hover:underline inline-flex items-center gap-1 font-semibold text-xs"
                >
                  <Lock className="w-3 h-3 text-amber-500" />
                  <span>{t('disputeDetail.viewEscrowRecord', isRTL ? 'عرض سجل الضمان المالي' : 'View Escrow Record')}</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 4. Admin Resolution Card (if resolved) */}
      {dispute.adminDecision && (
        <DisputeAdminResolutionCard
          decision={dispute.adminDecision}
          notes={dispute.adminNotes}
          resolvedAt={dispute.resolvedAt}
        />
      )}

      {/* 5. Dispute Reason & Detailed Claim Description (Interactive Signature Hover) */}
      <div className="group relative rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-5 sm:p-7 shadow-sm hover:shadow-xl hover:shadow-slate-200/70 dark:shadow-[0_4px_20px_-2px_rgba(0,0,0,0.5)] dark:hover:shadow-[0_12px_35px_-5px_rgba(0,0,0,0.8),0_0_25px_rgba(245,158,11,0.18)] hover:border-amber-500/50 dark:hover:border-amber-500/50 hover:-translate-y-1 transition-all duration-300 space-y-5">
        <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100 dark:border-slate-800 text-slate-900 dark:text-white font-bold text-base">
          <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-500/20">
            <FileText className="w-4 h-4" />
          </div>
          <h2>{t('openDispute.sectionTitle', isRTL ? 'تفاصيل النزاع' : 'Dispute Details')}</h2>
        </div>

        {/* Claim Description Box */}
        <div className="space-y-2">
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
            {t('openDispute.descriptionLabel', isRTL ? 'شرح وتفاصيل المشكلة' : 'Detailed Problem Description')}
          </span>
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-50/90 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-slate-800 dark:text-slate-200 text-sm leading-relaxed whitespace-pre-wrap select-text">
            {dispute.description}
          </div>
        </div>

        {/* Evidence Gallery */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
          <DisputeEvidenceGallery evidenceUrls={dispute.evidenceUrls || []} />
        </div>
      </div>

      {/* 6. Transaction Parties Cards (2 Columns with Clean Non-Redundant Headers) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Party 1: Claimant (Initiator) */}
        <div className="group relative rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-5 sm:p-6 shadow-sm hover:shadow-xl hover:shadow-slate-200/70 dark:shadow-[0_4px_20px_-2px_rgba(0,0,0,0.5)] dark:hover:shadow-[0_12px_35px_-5px_rgba(0,0,0,0.8),0_0_25px_rgba(245,158,11,0.18)] hover:border-amber-500/50 dark:hover:border-amber-500/50 hover:-translate-y-1 transition-all duration-300 space-y-4">
          <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
              {t('disputeDetail.claimantParty', isRTL ? 'مقدم النزاع (الشاكي)' : 'Dispute Initiator')}
            </span>

            <div className="flex items-center gap-1.5">
              <span className="text-2xs font-bold px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/20">
                {claimantRoleText}
              </span>
              {isOpener && (
                <span className="text-2xs font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                  {t('disputeDetail.youBadge', isRTL ? 'أنت' : 'You')}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-black text-sm flex items-center justify-center shrink-0 border border-slate-200 dark:border-slate-700">
                {isOpenerProfileLoading ? (
                  '...'
                ) : openerProfile?.firstName ? (
                  `${openerProfile.firstName.charAt(0)}${openerProfile.lastName?.charAt(0) || ''}`.toUpperCase()
                ) : (
                  <User className="w-5 h-5 text-slate-400" />
                )}
              </div>

              <div className="min-w-0 space-y-1">
                <span className="font-bold text-sm text-slate-900 dark:text-white block truncate">
                  {openerProfile ? `${openerProfile.firstName} ${openerProfile.lastName}` : t('counterparty.anonymousUser', isRTL ? 'مستخدم' : 'User')}
                </span>
                <div className="flex items-center flex-wrap gap-2 text-2xs text-slate-500 dark:text-slate-400">
                  {openerProfile?.city && (
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      <span>{openerProfile.city}</span>
                    </span>
                  )}
                  {openerRating > 0 && !isNaN(openerRating) && (
                    <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400 font-bold">
                      <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                      <span>{toLocalizedDigits(openerRating.toFixed(1), isRTL)}</span>
                      <span className="text-slate-400 font-normal">
                        ({toLocalizedDigits(openerReviewsCount, isRTL)})
                      </span>
                    </span>
                  )}
                </div>
              </div>
            </div>

            {openerProfile?.id && (
              <Link
                to={ROUTES.USER_PUBLIC(openerProfile.id)}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-amber-500 text-slate-700 dark:text-slate-300 hover:text-slate-950 text-xs font-bold transition-all shadow-2xs shrink-0 cursor-pointer"
              >
                <span>{t('counterparty.viewProfile', isRTL ? 'الملف الشخصي' : 'Profile')}</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
            )}
          </div>
        </div>

        {/* Party 2: Opposing Party (Respondent) */}
        <div className="group relative rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-5 sm:p-6 shadow-sm hover:shadow-xl hover:shadow-slate-200/70 dark:shadow-[0_4px_20px_-2px_rgba(0,0,0,0.5)] dark:hover:shadow-[0_12px_35px_-5px_rgba(0,0,0,0.8),0_0_25px_rgba(245,158,11,0.18)] hover:border-amber-500/50 dark:hover:border-amber-500/50 hover:-translate-y-1 transition-all duration-300 space-y-4">
          <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
              {t('disputeDetail.respondentParty', isRTL ? 'الطرف المشكو في حقه' : 'Opposing Party')}
            </span>

            <div className="flex items-center gap-1.5">
              <span className="text-2xs font-bold px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
                {respondentRoleText}
              </span>
              {isAgainstUser && (
                <span className="text-2xs font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                  {t('disputeDetail.youBadge', isRTL ? 'أنت' : 'You')}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-black text-sm flex items-center justify-center shrink-0 border border-slate-200 dark:border-slate-700">
                {isAgainstUserProfileLoading ? (
                  '...'
                ) : againstUserProfile?.firstName ? (
                  `${againstUserProfile.firstName.charAt(0)}${againstUserProfile.lastName?.charAt(0) || ''}`.toUpperCase()
                ) : (
                  <User className="w-5 h-5 text-slate-400" />
                )}
              </div>

              <div className="min-w-0 space-y-1">
                <span className="font-bold text-sm text-slate-900 dark:text-white block truncate">
                  {againstUserProfile
                    ? `${againstUserProfile.firstName} ${againstUserProfile.lastName}`
                    : t('counterparty.anonymousUser', isRTL ? 'مستخدم' : 'User')}
                </span>
                <div className="flex items-center flex-wrap gap-2 text-2xs text-slate-500 dark:text-slate-400">
                  {againstUserProfile?.city && (
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      <span>{againstUserProfile.city}</span>
                    </span>
                  )}
                  {againstRating > 0 && !isNaN(againstRating) && (
                    <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400 font-bold">
                      <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                      <span>{toLocalizedDigits(againstRating.toFixed(1), isRTL)}</span>
                      <span className="text-slate-400 font-normal">
                        ({toLocalizedDigits(againstReviewsCount, isRTL)})
                      </span>
                    </span>
                  )}
                </div>
              </div>
            </div>

            {againstUserProfile?.id && (
              <Link
                to={ROUTES.USER_PUBLIC(againstUserProfile.id)}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-amber-500 text-slate-700 dark:text-slate-300 hover:text-slate-950 text-xs font-bold transition-all shadow-2xs shrink-0 cursor-pointer"
              >
                <span>{t('counterparty.viewProfile', isRTL ? 'الملف الشخصي' : 'Profile')}</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* 7. Action Toolbar (Only for Opener if status is OPEN or UNDER_REVIEW) */}
      {canCancel && (
        <div className="group relative rounded-3xl p-5 sm:p-6 bg-gradient-to-r from-rose-500/10 via-rose-500/5 to-transparent border border-rose-500/30 hover:border-rose-500/50 hover:shadow-xl hover:shadow-slate-200/70 dark:shadow-[0_4px_20px_-2px_rgba(0,0,0,0.5)] dark:hover:shadow-[0_12px_35px_-5px_rgba(0,0,0,0.8),0_0_25px_rgba(245,158,11,0.18)] hover:-translate-y-1 transition-all duration-300 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-0.5">
            <h4 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white">
              {t('disputeDetail.cancelDisputeTitle', isRTL ? 'هل تم حل النزاع بالتراضي؟' : 'Resolved amicably?')}
            </h4>
            <p className="text-2xs sm:text-xs text-slate-500 dark:text-slate-400">
              {t(
                'disputeDetail.cancelDisputeDesc',
                isRTL
                  ? 'بصفتك صاحب الشكوى، يمكنك إلغاء النزاع في أي وقت لإعادة المعاملة لحالتها واستكمال إجراءات الضمان.'
                  : 'As the claimant, you can cancel this dispute at any time to resume normal escrow release.'
              )}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsCancelModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-rose-600 dark:text-rose-400 bg-rose-50 hover:bg-rose-100/90 dark:bg-rose-950/40 dark:hover:bg-rose-900/50 border border-rose-200/90 dark:border-rose-900/60 active:scale-98 transition-all duration-200 cursor-pointer shadow-2xs select-none shrink-0"
          >
            <RotateCcw className="w-4 h-4" />
            <span>{t('disputeDetail.cancelDisputeBtn', isRTL ? 'إلغاء النزاع بالتراضي' : 'Cancel Dispute Amicably')}</span>
          </button>
        </div>
      )}

      {/* Cancel Dispute Confirmation Modal */}
      <CancelDisputeModal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        onConfirm={handleConfirmCancel}
        isLoading={isCancelling}
      />
    </div>
  );
};
