import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  PlusCircle,
  AlertCircle,
  RotateCcw,
  Receipt,
  Ban,
} from 'lucide-react';
import { useMyWithdrawals } from '../hooks/useMyWithdrawals';
import { useCancelWithdrawal } from '../hooks/useCancelWithdrawal';
import { useWithdrawalSubscription } from '../hooks/useWithdrawalSubscription';
import { WithdrawalCard } from '../components/WithdrawalCard';
import { WithdrawalsFilterBar } from '../components/WithdrawalsFilterBar';
import { WithdrawalsSkeleton } from '../components/WithdrawalsSkeleton';
import { WithdrawalDetailsModal } from '../components/WithdrawalDetailsModal';
import { CancelWithdrawalModal } from '../components/CancelWithdrawalModal';
import { Button } from '@/components/common/Button';
import { ROUTES } from '@/constants/routes.constants';
import { getCairoDateString } from '@/utils/formatters';
import type { WithdrawalResponse } from '../types/wallet.types';

export const WithdrawalsPage: React.FC = () => {
  const { t, i18n } = useTranslation(['wallet', 'common']);
  const isRTL = i18n.language.startsWith('ar');

  // Hook 3: Real-Time Subscription (Deep Partial Merge in background)
  useWithdrawalSubscription();

  // Document Title
  useEffect(() => {
    document.title = `${t('withdrawals.pageTitle', 'سجل ومتابعة السحوبات')} | ${t(
      'common:appName',
      'مزادك'
    )}`;
  }, [t, i18n.language]);

  // Hook 1: Fetch & Manage Withdrawals
  const {
    withdrawals,
    total,
    totalPages,
    page,
    limit,
    nextPage,
    prevPage,
    filter,
    updateFilter,
    resetFilter,
    hasActiveFilters,
    isLoading,
    isError,
    refetch,
  } = useMyWithdrawals();

  // Hook 2: Cancel Withdrawal
  const { cancelWithdrawal, isPending: isCancelling } = useCancelWithdrawal();

  // Modal States
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<WithdrawalResponse | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState<boolean>(false);
  const [cancellingWithdrawal, setCancellingWithdrawal] = useState<WithdrawalResponse | null>(null);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState<boolean>(false);

  // Check if user has an active/completed withdrawal today in Cairo timezone
  const activeTodayWithdrawal = useMemo(() => {
    const todayInCairo = getCairoDateString(new Date());
    return withdrawals.find((w) => {
      const isToday = w.createdAt && getCairoDateString(w.createdAt) === todayInCairo;
      const isConsumed =
        w.status === 'PENDING' || w.status === 'PROCESSING' || w.status === 'COMPLETED';
      return isToday && isConsumed;
    });
  }, [withdrawals]);

  const handleOpenDetails = (withdrawal: WithdrawalResponse) => {
    setSelectedWithdrawal(withdrawal);
    setIsDetailsOpen(true);
  };

  const handleCloseDetails = () => {
    setIsDetailsOpen(false);
    setSelectedWithdrawal(null);
  };

  const handleOpenCancelModal = (withdrawal: WithdrawalResponse) => {
    setCancellingWithdrawal(withdrawal);
    setIsCancelModalOpen(true);
  };

  const handleCloseCancelModal = () => {
    if (isCancelling) return;
    setIsCancelModalOpen(false);
    setCancellingWithdrawal(null);
  };

  const handleConfirmCancel = async () => {
    if (!cancellingWithdrawal) return;
    try {
      await cancelWithdrawal(cancellingWithdrawal._id);
      handleCloseCancelModal();
      if (isDetailsOpen && selectedWithdrawal?._id === cancellingWithdrawal._id) {
        handleCloseDetails();
      }
    } catch {
      // Handled in hook
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 py-6 sm:py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* 1. Top Navigation Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            to={ROUTES.WALLET}
            className="inline-flex items-center gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 hover:text-amber-600 dark:hover:text-amber-400 hover:border-amber-500/50 dark:hover:border-amber-500/50 hover:bg-amber-50/40 dark:hover:bg-amber-950/20 transition-all shadow-2xs group shrink-0 select-none cursor-pointer whitespace-nowrap"
          >
            {isRTL ? (
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            ) : (
              <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
            )}
            <span>{t('withdrawals.backToWallet', 'العودة للمحفظة')}</span>
          </Link>

          {/* New Withdrawal CTA or Daily Limit Reached Badge */}
          {activeTodayWithdrawal ? (
            <div
              title={t('withdrawals.activeRequestNoticeTitle', 'لديك طلب سحب نشط اليوم')}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800/80 text-slate-400 dark:text-slate-500 text-xs sm:text-sm font-bold cursor-default select-none border border-slate-200 dark:border-slate-800"
            >
              <Ban className="w-4 h-4 text-amber-600/70 dark:text-amber-500/70" />
              <span>{t('withdrawals.limitReachedBadge', 'الحد اليومي مستنفد')}</span>
            </div>
          ) : (
            <Link
              to={ROUTES.WALLET_WITHDRAW}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs sm:text-sm font-bold shadow-md shadow-amber-500/10 active:scale-95 transition-all cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{t('withdrawals.newWithdrawal', 'طلب سحب جديد')}</span>
            </Link>
          )}
        </div>

        {/* 2. Page Header (Centered) */}
        <div className="text-center space-y-1.5 pb-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {t('withdrawals.pageTitle', 'سجل ومتابعة السحوبات')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-xl mx-auto leading-relaxed">
            {t(
              'withdrawals.pageSubtitle',
              'متابعة طلبات سحب الرصيد اللحظية وحالة التحويلات البنكية والمحافظ'
            )}
          </p>
        </div>

        {/* 3. Daily Limit Alert Notice (if user has consumed daily limit today) */}
        {activeTodayWithdrawal && (
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3.5 text-xs text-amber-900 dark:text-amber-300">
            <AlertCircle className="w-5 h-5 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
            <div className="space-y-1">
              <h4 className="font-bold text-sm text-amber-800 dark:text-amber-300">
                {t('withdrawals.activeRequestNoticeTitle', 'لديك طلب سحب نشط اليوم')}
              </h4>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-[11px] sm:text-xs">
                {activeTodayWithdrawal.status === 'COMPLETED'
                  ? t(
                      'withdrawals.activeRequestNoticeCompletedDesc',
                      'لقد أتممت طلب سحب اليوم بنجاح. مسموح بطلب واحد يومياً لسلامة العمليات، ويتجدد الحد تلقائياً عند منتصف الليل بتوقيت مصر (12:00 ص).'
                    )
                  : activeTodayWithdrawal.status === 'PROCESSING'
                  ? t(
                      'withdrawals.activeRequestNoticeProcessingDesc',
                      'طلب السحب الخاص بك قيد التحويل البنكي حالياً. مسموح بطلب واحد يومياً، ويتجدد الحد عند منتصف الليل بتوقيت مصر.'
                    )
                  : t(
                      'withdrawals.activeRequestNoticeDesc',
                      'لديك طلب سحب قيد المراجعة اليوم. مسموح بطلب واحد يومياً بتوقيت مصر. يمكنك إلغاء الطلب الحالي إذا رغبت بتعديل المبلغ أو الوجهة.'
                    )}
              </p>
            </div>
          </div>
        )}

        {/* 4. Filter Bar */}
        <WithdrawalsFilterBar
          status={filter.status}
          payoutMethod={filter.payoutMethod}
          hasActiveFilters={hasActiveFilters}
          onStatusChange={(status) => updateFilter({ status })}
          onPayoutMethodChange={(payoutMethod) => updateFilter({ payoutMethod })}
          onReset={resetFilter}
        />

        {/* 5. Main Content Area */}
        {isLoading ? (
          <WithdrawalsSkeleton count={3} />
        ) : isError ? (
          <div className="rounded-2xl border border-rose-200 dark:border-rose-900/50 bg-rose-50/50 dark:bg-rose-950/20 p-8 text-center space-y-3">
            <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
            <h3 className="font-extrabold text-sm text-rose-800 dark:text-rose-300">
              {t('withdrawals.loadFailed', 'فشل تحميل بيانات السحوبات. يرجى إعادة المحاولة.')}
            </h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              className="cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 me-1" />
              <span>{t('withdrawals.retry', 'إعادة المحاولة')}</span>
            </Button>
          </div>
        ) : withdrawals.length === 0 ? (
          /* Empty States */
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 sm:p-12 text-center space-y-4 shadow-sm">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center justify-center mx-auto">
              <Receipt className="w-7 h-7" />
            </div>

            <div className="space-y-1.5 max-w-md mx-auto">
              <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white">
                {hasActiveFilters
                  ? t('withdrawals.emptyState.noFilteredTitle', 'لا توجد طلبات مطابقة للفلتر')
                  : t('withdrawals.emptyState.noWithdrawalsTitle', 'لا توجد طلبات سحب سابقة')}
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                {hasActiveFilters
                  ? t(
                      'withdrawals.emptyState.noFilteredDesc',
                      'لم نتمكن من العثور على أي طلبات سحب تطابق الفلاتر المحددة حالياً.'
                    )
                  : t(
                      'withdrawals.emptyState.noWithdrawalsDesc',
                      'لم تقم بتقديم أي طلبات سحب حتى الآن. يمكنك سحب أرباحك ورصيدك المتاح في أي وقت بأمان.'
                    )}
              </p>
            </div>

            <div className="pt-2">
              {hasActiveFilters ? (
                <button
                  type="button"
                  onClick={resetFilter}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 hover:border-amber-500/60 active:scale-95 transition-all duration-200 cursor-pointer shadow-xs"
                >
                  <RotateCcw className="w-4 h-4 shrink-0" />
                  <span>{t('withdrawals.emptyState.resetFiltersBtn', 'مسح الفلاتر')}</span>
                </button>
              ) : (
                <Link
                  to={ROUTES.WALLET_WITHDRAW}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs sm:text-sm font-extrabold shadow-sm hover:shadow-md transition-all cursor-pointer"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>{t('withdrawals.emptyState.newWithdrawalBtn', 'طلب سحب رصيد الآن')}</span>
                </Link>
              )}
            </div>
          </div>
        ) : (
          /* Withdrawals Cards List */
          <div className="space-y-4">
            {withdrawals.map((item) => (
              <WithdrawalCard
                key={item._id}
                withdrawal={item}
                onOpenDetails={handleOpenDetails}
                onOpenCancelModal={handleOpenCancelModal}
                isCancelling={isCancelling && cancellingWithdrawal?._id === item._id}
              />
            ))}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                <span className="text-slate-500 dark:text-slate-400 font-medium">
                  {t('withdrawals.pagination.showing', 'عرض {{from}} إلى {{to}} من إجمالي {{total}} طلب', {
                    from: (page - 1) * limit + 1,
                    to: Math.min(page * limit, total),
                    total,
                  })}
                </span>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page <= 1}
                    onClick={prevPage}
                    className="cursor-pointer"
                  >
                    {isRTL ? <ArrowRight className="w-3.5 h-3.5 me-1" /> : <ArrowLeft className="w-3.5 h-3.5 me-1" />}
                    <span>{t('withdrawals.pagination.previous', 'السابق')}</span>
                  </Button>

                  <span className="px-3 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-bold font-mono text-slate-700 dark:text-slate-300">
                    {page} / {totalPages}
                  </span>

                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= totalPages}
                    onClick={nextPage}
                    className="cursor-pointer"
                  >
                    <span>{t('withdrawals.pagination.next', 'التالي')}</span>
                    {isRTL ? <ArrowLeft className="w-3.5 h-3.5 ms-1" /> : <ArrowRight className="w-3.5 h-3.5 ms-1" />}
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Details Modal */}
      <WithdrawalDetailsModal
        withdrawal={selectedWithdrawal}
        isOpen={isDetailsOpen}
        onClose={handleCloseDetails}
        onCancelRequest={(id) => {
          const item = withdrawals.find((w) => w._id === id);
          if (item) handleOpenCancelModal(item);
        }}
        isCancelling={isCancelling}
      />

      {/* Cancel Confirmation Modal */}
      <CancelWithdrawalModal
        isOpen={isCancelModalOpen}
        onClose={handleCloseCancelModal}
        onConfirm={handleConfirmCancel}
        isPending={isCancelling}
        amount={cancellingWithdrawal?.amount ?? 0}
      />
    </div>
  );
};

export default WithdrawalsPage;
