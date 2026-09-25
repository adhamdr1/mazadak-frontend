import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  Lock,
  CheckCircle2,
  RotateCcw,
  AlertTriangle,
  Layers,
  Sparkles,
  RefreshCw,
  HelpCircle,
  Clock,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react';
import { Button } from '@/components/common/Button';
import { Pagination } from '@/components/common/Pagination';
import { EmptyState } from '@/components/feedback/EmptyState';
import { EscrowCard } from '../components/EscrowCard';
import { EscrowsSkeleton } from '../components/EscrowsSkeleton';
import { useMyEscrows, type EscrowStatusFilter } from '../hooks/useMyEscrows';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/constants/routes.constants';
import { toLocalizedDigits } from '@/utils/formatters';
import { cn } from '@/utils/cn';

interface TabItem {
  id: EscrowStatusFilter;
  labelKey: string;
  defaultLabel: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const MyEscrowsPage: React.FC = () => {
  const { t, i18n } = useTranslation(['escrow', 'common']);
  const isRTL = i18n.language?.startsWith('ar');
  const { user } = useAuth();
  const navigate = useNavigate();

  const {
    escrows,
    total,
    totalPages,
    page,
    statusFilter,
    setPage,
    setStatusFilter,
    isLoading,
    isError,
    refetch,
  } = useMyEscrows();

  const tabs: TabItem[] = [
    {
      id: 'ALL',
      labelKey: 'myEscrows.tabs.ALL',
      defaultLabel: 'كافة المعاملات',
      icon: Layers,
    },
    {
      id: 'HELD',
      labelKey: 'myEscrows.tabs.HELD',
      defaultLabel: 'محتجز بالضمان',
      icon: Lock,
    },
    {
      id: 'RELEASED',
      labelKey: 'myEscrows.tabs.RELEASED',
      defaultLabel: 'تم التحرير',
      icon: CheckCircle2,
    },
    {
      id: 'REFUNDED',
      labelKey: 'myEscrows.tabs.REFUNDED',
      defaultLabel: 'مسترد',
      icon: RotateCcw,
    },
    {
      id: 'DISPUTED',
      labelKey: 'myEscrows.tabs.DISPUTED',
      defaultLabel: 'نزاعات مفتوحة',
      icon: AlertTriangle,
    },
  ];

  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight;

  return (
    <div className="max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8">
      {/* 1. Header Section: Title, Subtitle, CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1.5 flex-1 min-w-0">
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            {t('myEscrows.title', 'معاملات الضمان')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed">
            {t(
              'myEscrows.subtitle',
              'إدارة ومتابعة مبالغ المزادات المحتجزة كوسيط آمن بين المشتري والبائع حتى اكتمال المعاينة والتسليم.'
            )}
          </p>
        </div>

        {/* Action Button: Explore Auctions */}
        <Link
          to={ROUTES.AUCTIONS}
          className={cn(
            'group relative inline-flex items-center justify-center gap-2.5 px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-black flex-shrink-0',
            'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950',
            'shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 hover:scale-[1.02] active:scale-[0.98]',
            'transition-all duration-300 w-full sm:w-auto overflow-hidden select-none'
          )}
        >
          <Sparkles className="w-4 h-4 text-slate-950 animate-pulse" />
          <span>{t('myEscrows.browseAuctions', 'استكشف المزادات')}</span>
          <ArrowIcon className="w-4 h-4 transition-transform group-hover:translate-x-1 rtl:group-hover:-translate-x-1" />
        </Link>
      </div>

      {/* 2. Filter Tabs (Strictly Single Row - Fluid Responsive Scaling) */}
      <div className="grid grid-cols-5 gap-1 sm:gap-1.5 md:gap-2 w-full pb-3 border-b border-slate-200/80 dark:border-slate-800">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = statusFilter === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setStatusFilter(tab.id)}
              title={t(tab.labelKey, { defaultValue: tab.defaultLabel })}
              className={cn(
                'w-full flex items-center justify-center gap-1 sm:gap-1.5 md:gap-2',
                'px-1 sm:px-2 md:px-3 py-1.5 sm:py-2 md:py-2.5 rounded-xl sm:rounded-2xl',
                'text-[10px] sm:text-xs md:text-sm font-bold transition-all duration-200 select-none cursor-pointer min-w-0',
                isActive
                  ? 'bg-amber-500 text-slate-950 shadow-sm sm:shadow-md shadow-amber-500/25 font-black'
                  : 'bg-slate-100 hover:bg-slate-200/80 text-slate-700 dark:bg-slate-800/80 dark:hover:bg-slate-800 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60'
              )}
            >
              <Icon className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 flex-shrink-0" />
              <span className="truncate">{t(tab.labelKey, { defaultValue: tab.defaultLabel })}</span>
              {isActive && total > 0 && (
                <span className="px-1 sm:px-1.5 py-0.5 rounded-md text-[8px] sm:text-[10px] font-black tracking-tight bg-black/15 text-slate-950 shrink-0">
                  {toLocalizedDigits(total, isRTL)}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* 3. Content Area */}
      {isLoading ? (
        <EscrowsSkeleton count={3} />
      ) : isError ? (
        <div className="rounded-3xl border border-rose-200 dark:border-rose-900/50 bg-rose-50/50 dark:bg-rose-950/20 p-8 text-center space-y-4">
          <AlertTriangle className="w-10 h-10 text-rose-500 mx-auto" />
          <div className="space-y-1">
            <div className="text-base font-black text-rose-900 dark:text-rose-200">
              {t('myEscrows.errorTitle', 'تعذر تحميل سجل الضمانات')}
            </div>
            <p className="text-xs sm:text-sm text-rose-700 dark:text-rose-400 max-w-md mx-auto">
              {t('myEscrows.errorMessage', 'يرجى التحقق من اتصالك بالإنترنت والمحاولة مجدداً.')}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            leftIcon={<RefreshCw className="w-4 h-4" />}
            className="font-bold border-rose-300 dark:border-rose-800"
          >
            {t('common:actions.retry', isRTL ? 'إعادة المحاولة' : 'Try Again')}
          </Button>
        </div>
      ) : escrows.length === 0 ? (
        <EmptyState
          icon={<ShieldCheck className="w-10 h-10 text-amber-500" />}
          title={t('myEscrows.empty.title', 'لا توجد معاملات ضمان حالياً')}
          description={
            statusFilter === 'ALL'
              ? t(
                  'myEscrows.empty.descAll',
                  'عند فوزك بمزاد أو اكتمال بيع مزادك، ستظهر جميع المعاملات المحمية بنظام الضمان المالي هنا.'
                )
              : t(
                  'myEscrows.empty.descFilter',
                  'لا توجد معاملات ضمان مطابقة للتصنيف المحدد.'
                )
          }
          action={{
            label: t('myEscrows.empty.action', 'تصفح المزادات الحية'),
            onClick: () => {
              navigate(ROUTES.AUCTIONS);
            },
          }}
        />
      ) : (
        <div className="space-y-4">
          {escrows.map((escrow) => (
            <EscrowCard
              key={escrow._id}
              escrow={escrow}
              currentUserId={user?._id}
            />
          ))}

          {/* 4. Pagination Component (Displayed when totalPages > 1) */}
          {totalPages > 1 && (
            <div className="pt-6 flex justify-center">
              <Pagination
                page={page}
                totalPages={totalPages}
                total={total}
                limit={10}
                onPageChange={setPage}
                showSummary={true}
              />
            </div>
          )}
        </div>
      )}

      {/* 5. Trust & Info Footer Banner (With Orange Hover Border in Both Light and Dark Mode) */}
      <div className="group rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 hover:border-amber-500 dark:hover:border-amber-500 hover:shadow-xl hover:shadow-amber-500/10 p-6 sm:p-8 space-y-6 shadow-sm transition-all duration-300">
        <div className="flex items-start sm:items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 group-hover:bg-amber-500/20 transition-colors flex items-center justify-center flex-shrink-0 shadow-sm shadow-amber-500/10">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base sm:text-lg font-black tracking-tight text-slate-900 dark:text-white">
              {t('myEscrows.banner.title', 'كيف يحميك نظام الضمان المالي في مزادك؟')}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed max-w-3xl">
              {t(
                'myEscrows.banner.body',
                'يتم حجز قيمة المزاد فور انتهائه في حساب وسيط آمن. يملك المشتري ٧ أيام لمعاينة وفحص السلعة، وبعدها يتحرر المبلغ تلقائياً لمحفظة البائع ما لم يتم فتح نزاع مالي.'
              )}
            </p>
          </div>
        </div>

        {/* Centered 3 Pillars with Icons and Labels */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-6 border-t border-slate-100 dark:border-slate-800 text-center">
          <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-center space-y-2 group-hover:border-amber-500/20 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Lock className="w-5 h-5" />
            </div>
            <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
              {t('myEscrows.banner.point1', 'حجز الأموال بشكل مشفر ومؤمن')}
            </span>
          </div>

          <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-center space-y-2 group-hover:border-amber-500/20 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
              {t('myEscrows.banner.point2', 'مهلة فحص كاملة لمدة ٧ أيام')}
            </span>
          </div>

          <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-center space-y-2 group-hover:border-amber-500/20 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <HelpCircle className="w-5 h-5" />
            </div>
            <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
              {t('myEscrows.banner.point3', 'إمكانية فتح نزاع مباشر عند وجود خلل')}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
