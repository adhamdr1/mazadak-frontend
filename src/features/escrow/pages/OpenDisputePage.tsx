import React from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  ShieldAlert,
  Clock,
  Gavel,
  FileText,
  HelpCircle,
  RotateCcw,
  Lock,
  ExternalLink,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/common/Button';
import { CustomSelect } from '@/components/common/CustomSelect';
import { AutoResizeTextarea } from '@/components/common/AutoResizeTextarea';
import { EvidenceUploader } from '../components/EvidenceUploader';
import { useEscrowDetail } from '../hooks/useEscrowDetail';
import { useOpenDispute } from '../hooks/useOpenDispute';
import {
  openDisputeSchema,
  type OpenDisputeFormData,
  DISPUTE_REASONS_ENUM,
} from '../schemas/openDispute.schema';
import { formatPrice, toLocalizedDigits, formatRelativeTime } from '@/utils/formatters';
import { getLocalizedErrorMessage } from '@/utils/errorHandler';
import { ROUTES } from '@/constants/routes.constants';

export const OpenDisputePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation(['escrow', 'common']);
  const isRTL = i18n.language?.startsWith('ar');

  // 1. Fetch Escrow & Permissions
  const {
    escrow,
    isLoading: isEscrowLoading,
    isError: isEscrowError,
    error: escrowError,
    refetch,
    isBuyer,
    isHeld,
    isWithinInspectionPeriod,
  } = useEscrowDetail(id);

  // 2. Open Dispute Mutation
  const { openDispute, isLoading: isSubmitting } = useOpenDispute();

  // 3. Form Setup
  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<OpenDisputeFormData>({
    resolver: zodResolver(openDisputeSchema),
    defaultValues: {
      reason: undefined,
      description: '',
      evidenceUrls: [],
    },
    mode: 'onTouched',
  });

  const watchedDescription = watch('description') || '';

  // 4. Form Submit Handler
  const onSubmit = async (data: OpenDisputeFormData) => {
    if (!escrow || !escrow.auctionId) return;

    try {
      await openDispute({
        auctionId: escrow.auctionId,
        reason: data.reason,
        description: data.description,
        evidenceUrls: data.evidenceUrls && data.evidenceUrls.length > 0 ? data.evidenceUrls : undefined,
      });

      // Redirect back to Escrow detail page
      navigate(ROUTES.ESCROW_DETAIL(escrow._id), { replace: true });
    } catch {
      // Handled by hook toast
    }
  };

  // Loading Skeleton State
  if (isEscrowLoading && !escrow) {
    return (
      <div className="max-w-4xl w-full mx-auto px-4 sm:px-6 py-8 space-y-6 animate-pulse">
        <div className="flex justify-between items-center">
          <div className="h-8 w-64 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
          <div className="h-9 w-36 bg-slate-200 dark:bg-slate-800 rounded-xl" />
        </div>
        <div className="h-40 bg-slate-200 dark:bg-slate-800 rounded-3xl" />
        <div className="h-96 bg-slate-200 dark:bg-slate-800 rounded-3xl" />
      </div>
    );
  }

  // Not Found or Error State
  if (isEscrowError || !escrow) {
    const localizedError = escrowError
      ? getLocalizedErrorMessage(escrowError, (key) => t(key), 'escrow')
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
                  ? 'تعذر العثور على سجل الضمان المالي المطلوب لفتح نزاع.'
                  : 'Could not locate the escrow transaction to open a dispute.'
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

  // Security Guards: Buyer check, HELD status check, inspection period check
  if (!isBuyer) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-5">
        <div className="w-16 h-16 rounded-3xl bg-amber-500/10 text-amber-600 dark:text-amber-400 mx-auto flex items-center justify-center">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            {t('openDispute.notBuyerError', isRTL ? 'غير مصرح لك بفتح نزاع' : 'Unauthorized to Open Dispute')}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
            {t(
              'openDispute.notBuyerError',
              isRTL
                ? 'عذراً، يحق للمشتري فقط في هذه المعاملة فتح نزاع مالي خلال فترة الفحص والمعاينة.'
                : 'Only the designated buyer in this transaction can initiate a formal dispute.'
            )}
          </p>
        </div>
        <Button
          onClick={() => navigate(ROUTES.ESCROW_DETAIL(escrow._id))}
          className="font-bold rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950"
        >
          {t('openDispute.backToEscrow', isRTL ? 'العودة لتفاصيل الضمان' : 'Back to Escrow Details')}
        </Button>
      </div>
    );
  }

  if (!isHeld) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-5">
        <div className="w-16 h-16 rounded-3xl bg-amber-500/10 text-amber-600 dark:text-amber-400 mx-auto flex items-center justify-center">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            {t('errors.ESCROW_INVALID_STATUS', isRTL ? 'حالة الضمان لا تسمح بفتح نزاع' : 'Escrow Status Ineligible')}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
            {t(
              'openDispute.notHeldError',
              isRTL
                ? 'لا يمكن فتح نزاع لأن حالة الضمان ليست محتجزة (HELD).'
                : 'Disputes can only be opened when escrow is actively in HELD status.'
            )}
          </p>
        </div>
        <Button
          onClick={() => navigate(ROUTES.ESCROW_DETAIL(escrow._id))}
          className="font-bold rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950"
        >
          {t('openDispute.backToEscrow', isRTL ? 'العودة لتفاصيل الضمان' : 'Back to Escrow Details')}
        </Button>
      </div>
    );
  }

  if (!isWithinInspectionPeriod) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-5">
        <div className="w-16 h-16 rounded-3xl bg-rose-500/10 text-rose-600 dark:text-rose-400 mx-auto flex items-center justify-center">
          <Clock className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            {t('openDispute.inspectionWindowExpired', isRTL ? 'انتهت مهلة الفحص والمعاينة' : 'Inspection Period Expired')}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
            {t(
              'openDispute.expiredWindowError',
              isRTL
                ? 'انتهت فترة الـ 7 أيام المسموح بها لفتح النزاع، وسيتم تحرير المبلغ للبائع.'
                : 'The 7-day inspection window has passed. Funds are scheduled for automatic release.'
            )}
          </p>
        </div>
        <Button
          onClick={() => navigate(ROUTES.ESCROW_DETAIL(escrow._id))}
          className="font-bold rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950"
        >
          {t('openDispute.backToEscrow', isRTL ? 'العودة لتفاصيل الضمان' : 'Back to Escrow Details')}
        </Button>
      </div>
    );
  }

  // Reason select options mapping
  const reasonOptions = DISPUTE_REASONS_ENUM.map((reasonKey) => ({
    value: reasonKey,
    label: t(`reasons.${reasonKey}`, reasonKey),
  }));

  return (
    <div className="max-w-4xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8 animate-fadeIn">
      {/* 1. Header Area */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200/80 dark:border-slate-800">
        <div className="space-y-1.5 min-w-0">
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            {t('openDispute.pageTitle', isRTL ? 'فتح نزاع مالي' : 'Open Financial Dispute')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed">
            {t(
              'openDispute.subtitle',
              isRTL
                ? 'إذا واجهتك مشكلة في استلام أو مطابقة السلعة، يمكنك فتح نزاع قبل انتهاء مهلة المعاينة لتجميد المبلغ وفصل لجنة التحكيم.'
                : 'If you encounter any issues with item delivery or condition, you may open a formal dispute before inspection window ends to freeze funds for committee review.'
            )}
          </p>
        </div>

        {/* Back Link Button */}
        <Link
          to={ROUTES.ESCROW_DETAIL(escrow._id)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 hover:text-amber-600 dark:hover:text-amber-400 hover:border-amber-500/50 dark:hover:border-amber-500/50 hover:bg-amber-50/40 dark:hover:bg-amber-950/20 transition-all shadow-2xs group shrink-0 self-start sm:self-center select-none"
        >
          {isRTL ? (
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
          ) : (
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
          )}
          <span>{t('openDispute.backToEscrow', isRTL ? 'العودة لتفاصيل الضمان' : 'Back to Escrow Details')}</span>
        </Link>
      </div>

      {/* 2. Escrow & Auction Brief Banner with Clickable Auction Link */}
      <div className="group rounded-3xl p-5 sm:p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-amber-500/60 dark:hover:border-amber-500/50 text-slate-900 dark:text-white shadow-md hover:shadow-xl hover:shadow-slate-200/70 dark:shadow-[0_4px_20px_-2px_rgba(0,0,0,0.5)] dark:hover:shadow-[0_12px_35px_-5px_rgba(0,0,0,0.8),0_0_25px_rgba(245,158,11,0.18)] flex flex-col md:flex-row md:items-center justify-between gap-5 transition-all duration-300">
        <div className="flex items-center gap-4 min-w-0">
          {/* Clickable Auction Thumbnail */}
          <Link
            to={ROUTES.AUCTION_DETAIL(escrow.auctionId)}
            target="_blank"
            rel="noopener noreferrer"
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0 border border-slate-200/90 dark:border-slate-700/80 shadow-xs relative group hover:ring-2 hover:ring-amber-500/50 transition-all block cursor-pointer"
            title={t('openDispute.auctionInfo', isRTL ? 'عرض صفحة المزاد' : 'View Auction')}
          >
            {escrow.auction?.images?.[0] ? (
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

          {/* Title & Metadata */}
          <div className="space-y-1 min-w-0">
            <div>
              <span className="text-[10px] sm:text-xs font-semibold text-amber-700 dark:text-amber-400 bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/20 px-2 py-0.5 rounded-md inline-block">
                {t('openDispute.auctionInfo', isRTL ? 'المزاد المرتبط' : 'Associated Auction')}
              </span>
            </div>
            <div>
              <Link
                to={ROUTES.AUCTION_DETAIL(escrow.auctionId)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 max-w-full text-base sm:text-lg font-black truncate text-slate-900 dark:text-white hover:text-amber-600 dark:hover:text-amber-400 transition-colors group/link"
                title={t('openDispute.auctionInfo', isRTL ? 'عرض صفحة المزاد' : 'View Auction')}
              >
                <span className="truncate">{escrow.auction?.title || t('card.unknownAuction', isRTL ? 'مزاد مكتمل' : 'Completed Auction')}</span>
                <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover/link:text-amber-500 transition-colors shrink-0" />
              </Link>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-600 dark:text-slate-300 select-text">
              <span className="flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>
                  {t('openDispute.heldAmount', isRTL ? 'المبلغ المحتجز:' : 'Secured Amount:')}{' '}
                  <strong className="text-emerald-600 dark:text-emerald-400 font-black text-sm">
                    {formatPrice(Number(escrow.amount), isRTL)} {t('currency.egp', 'ج.م')}
                  </strong>
                </span>
              </span>
            </div>
          </div>
        </div>

        {/* Inspection Deadline Pill */}
        <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 shrink-0 text-xs shadow-2xs">
          <Clock className="w-4 h-4 text-amber-500 shrink-0" />
          <div className="space-y-0.5">
            <span className="text-3xs text-slate-500 dark:text-slate-400 block font-medium">
              {t('openDispute.inspectionWindowActive', isRTL ? 'مهلة الفحص سارية حتى' : 'Inspection Window Active Until')}
            </span>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
              {formatRelativeTime(escrow.inspectionPeriodEndsAt, isRTL)}
            </span>
          </div>
        </div>
      </div>

      {/* 3. Main Form Container */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-amber-500/60 dark:hover:border-amber-500/50 p-5 sm:p-8 shadow-md hover:shadow-xl hover:shadow-slate-200/70 dark:shadow-[0_4px_20px_-2px_rgba(0,0,0,0.5)] dark:hover:shadow-[0_12px_35px_-5px_rgba(0,0,0,0.8),0_0_25px_rgba(245,158,11,0.18)] space-y-6 transition-all duration-300">
          {/* Section Header */}
          <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100 dark:border-slate-800 text-slate-900 dark:text-white font-bold text-base">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-500/20">
              <FileText className="w-4 h-4" />
            </div>
            <h2>{t('openDispute.sectionTitle', isRTL ? 'تفاصيل وموضوع النزاع' : 'Dispute & Claim Details')}</h2>
          </div>

          {/* 1. Dispute Reason CustomSelect (Full Width) */}
          <div className="space-y-2">
            <label className="block text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
              {t('openDispute.reasonLabel', isRTL ? 'نوع المشكلة أو سبب النزاع' : 'Dispute Reason / Issue Type')}{' '}
              <span className="text-rose-500">*</span>
            </label>

            <Controller
              name="reason"
              control={control}
              render={({ field }) => (
                <div className="space-y-1.5 w-full">
                  <CustomSelect
                    options={reasonOptions}
                    value={field.value || ''}
                    onChange={(val) => field.onChange(val)}
                    placeholder={t('openDispute.reasonPlaceholder', isRTL ? 'اختر سبب النزاع...' : 'Select dispute reason...')}
                    className={errors.reason ? 'w-full border-rose-500 ring-1 ring-rose-500/30' : 'w-full'}
                    menuClassName="w-full"
                  />
                  {errors.reason && (
                    <p className="text-xs text-rose-500 font-medium">
                      {t(errors.reason.message as string, isRTL ? 'يرجى اختيار سبب النزاع' : 'Reason is required')}
                    </p>
                  )}
                </div>
              )}
            />
          </div>

          {/* 2. Problem Description AutoResizeTextarea */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
                {t('openDispute.descriptionLabel', isRTL ? 'شرح وتفاصيل المشكلة' : 'Detailed Problem Description')}{' '}
                <span className="text-rose-500">*</span>
              </label>
              <span className="text-2xs text-slate-400 font-medium">
                {t('openDispute.charactersCount', {
                  count: toLocalizedDigits(watchedDescription.length, isRTL),
                  max: toLocalizedDigits(1000, isRTL),
                  defaultValue: `${toLocalizedDigits(watchedDescription.length, isRTL)} / ${toLocalizedDigits(1000, isRTL)}`,
                })}
              </span>
            </div>

            <div className="space-y-1.5">
              <AutoResizeTextarea
                {...register('description')}
                minRows={4}
                maxRows={12}
                maxLength={1000}
                hasError={!!errors.description}
                placeholder={t(
                  'openDispute.descriptionPlaceholder',
                  isRTL
                    ? 'يرجى كتابة شرح وافٍ ومفصل للمشكلة التي واجهتها، مع ذكر تفاصيل السلعة المستلمة...'
                    : 'Please provide a comprehensive explanation of the issue encountered...'
                )}
                className="rounded-2xl"
              />
              {errors.description && (
                <p className="text-xs text-rose-500 font-medium">
                  {t(errors.description.message as string, isRTL ? 'يرجى كتابة وصف وافٍ للمشكلة' : 'Description is required')}
                </p>
              )}
            </div>
          </div>

          {/* 3. Evidence Uploader */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <Controller
              name="evidenceUrls"
              control={control}
              render={({ field }) => (
                <EvidenceUploader
                  value={field.value}
                  onChange={(urls) => field.onChange(urls)}
                  maxImages={5}
                  disabled={isSubmitting}
                  error={errors.evidenceUrls ? t(errors.evidenceUrls.message as string) : undefined}
                />
              )}
            />
          </div>
        </div>

        {/* 4. What Happens Next Guidance Card */}
        <div className="rounded-3xl p-5 sm:p-6 bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 hover:border-amber-500/60 dark:hover:border-amber-500/50 space-y-4 shadow-sm hover:shadow-xl hover:shadow-slate-200/70 dark:shadow-[0_4px_20px_-2px_rgba(0,0,0,0.5)] dark:hover:shadow-[0_12px_35px_-5px_rgba(0,0,0,0.8),0_0_25px_rgba(245,158,11,0.18)] transition-all duration-300">
          <h4 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-amber-500" />
            <span>{t('openDispute.whatHappensNextTitle', isRTL ? 'ماذا يحدث بعد فتح النزاع؟' : 'What happens after opening a dispute?')}</span>
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-amber-500/60 dark:hover:border-amber-500/50 hover:shadow-md dark:hover:shadow-[0_4px_20px_-2px_rgba(245,158,11,0.12)] shadow-2xs space-y-2 transition-all duration-300">
              <span className="w-6 h-6 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-black flex items-center justify-center">
                {toLocalizedDigits(1, isRTL)}
              </span>
              <h5 className="text-xs font-black text-slate-900 dark:text-white">
                {t('openDispute.step1Title', isRTL ? 'تجميد فوري لمبلغ الضمان' : 'Instant Fund Freeze')}
              </h5>
              <p className="text-2xs text-slate-500 dark:text-slate-400 leading-relaxed">
                {t(
                  'openDispute.step1Desc',
                  isRTL
                    ? 'يتم إيقاف التحرير التلقائي للبائع وتجميد الرصيد في حساب وسيط آمن.'
                    : 'Automatic fund release is paused, securing funds in escrow.'
                )}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-amber-500/60 dark:hover:border-amber-500/50 hover:shadow-md dark:hover:shadow-[0_4px_20px_-2px_rgba(245,158,11,0.12)] shadow-2xs space-y-2 transition-all duration-300">
              <span className="w-6 h-6 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-black flex items-center justify-center">
                {toLocalizedDigits(2, isRTL)}
              </span>
              <h5 className="text-xs font-black text-slate-900 dark:text-white">
                {t('openDispute.step2Title', isRTL ? 'مراجعة لجنة التحكيم' : 'Arbitration Review')}
              </h5>
              <p className="text-2xs text-slate-500 dark:text-slate-400 leading-relaxed">
                {t(
                  'openDispute.step2Desc',
                  isRTL
                    ? 'يقوم فريق متخصص بمراجعة الأدلة وتفاصيل المزاد والتواصل مع الطرفين.'
                    : 'Dispute committee investigates evidence and auction details.'
                )}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-amber-500/60 dark:hover:border-amber-500/50 hover:shadow-md dark:hover:shadow-[0_4px_20px_-2px_rgba(245,158,11,0.12)] shadow-2xs space-y-2 transition-all duration-300">
              <span className="w-6 h-6 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-black flex items-center justify-center">
                {toLocalizedDigits(3, isRTL)}
              </span>
              <h5 className="text-xs font-black text-slate-900 dark:text-white">
                {t('openDispute.step3Title', isRTL ? 'البت في القرار النهائي' : 'Binding Resolution')}
              </h5>
              <p className="text-2xs text-slate-500 dark:text-slate-400 leading-relaxed">
                {t(
                  'openDispute.step3Desc',
                  isRTL
                    ? 'يتم إصدار قرار إما برد المبلغ للمشتري أو تحريره للبائع خلال ٢٤-٤٨ ساعة.'
                    : 'A final binding settlement is issued within 24-48 hours.'
                )}
              </p>
            </div>
          </div>
        </div>

        {/* 5. Action Buttons */}
        <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-end gap-3 pt-2">
          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => navigate(ROUTES.ESCROW_DETAIL(escrow._id))}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-200 bg-white hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700/80 hover:text-amber-600 dark:hover:text-amber-400 hover:border-amber-500/50 dark:hover:border-amber-500/50 border border-slate-300 dark:border-slate-700 active:scale-98 transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed select-none shadow-2xs"
          >
            {isRTL ? (
              <ArrowRight className="w-4 h-4 shrink-0" />
            ) : (
              <ArrowLeft className="w-4 h-4 shrink-0" />
            )}
            <span>{t('openDispute.cancelBtn', isRTL ? 'إلغاء وتراجع' : 'Cancel & Go Back')}</span>
          </button>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-rose-600 dark:text-rose-400 bg-rose-50 hover:bg-rose-100/90 dark:bg-rose-950/30 dark:hover:bg-rose-900/40 border border-rose-200/90 dark:border-rose-900/60 active:scale-98 transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed select-none shadow-2xs"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                <span>{t('openDispute.submitting', isRTL ? 'جاري إرسال النزاع...' : 'Submitting dispute...')}</span>
              </>
            ) : (
              <span>{t('openDispute.submitBtn', isRTL ? 'إرسال وتأكيد فتح النزاع' : 'Submit Dispute')}</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
