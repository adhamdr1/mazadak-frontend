import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Users,
  Gavel,
  DollarSign,
  Clock,
  RefreshCw,
  ShieldAlert,
  AlertTriangle,
} from 'lucide-react';
import { ROUTES } from '@/constants/routes.constants';
import { useAdminDashboardStats } from '../hooks/useAdminDashboardStats';
import { useAdminTreasuryStats } from '../hooks/useAdminTreasuryStats';
import { StatKpiCard } from '../components/dashboard/StatKpiCard';
import { TreasuryKpiCard } from '../components/dashboard/TreasuryKpiCard';
import { RecentActivityFeed } from '../components/dashboard/RecentActivityFeed';
import { formatAdminCurrency, formatAdminNumber } from '../utils/admin.utils';
import { toLocalizedDigits } from '@/utils/formatters';

export const AdminDashboardPage: React.FC = () => {
  const { t, i18n } = useTranslation(['admin', 'common']);
  const isRTL = i18n.language?.startsWith('ar');

  const {
    data: stats,
    isLoading: isStatsLoading,
    isRefetching: isStatsRefetching,
    refetch: refetchStats,
    dataUpdatedAt,
  } = useAdminDashboardStats();

  const {
    data: treasury,
    isLoading: isTreasuryLoading,
    refetch: refetchTreasury,
  } = useAdminTreasuryStats();

  const handleRefreshAll = () => {
    refetchStats();
    refetchTreasury();
  };

  const rawLastUpdated = dataUpdatedAt
    ? new Date(dataUpdatedAt).toLocaleTimeString(isRTL ? 'ar-EG' : 'en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })
    : '';
  const lastUpdatedTime = toLocalizedDigits(rawLastUpdated, isRTL);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* 1. Page Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            {t('dashboard.title', { ns: 'admin', defaultValue: 'لوحة التحكم' })}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">
            {t('dashboard.subtitle', {
              ns: 'admin',
              defaultValue: 'نظرة شاملة ولحظية على نشاط المنصة، الأداء المالي، والعمليات',
            })}
          </p>
        </div>

        <div className="flex flex-col items-start sm:items-end gap-1 shrink-0 self-start sm:self-auto">
          <button
            type="button"
            onClick={handleRefreshAll}
            disabled={isStatsLoading || isStatsRefetching}
            className="group inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 hover:bg-amber-500/10 dark:hover:bg-amber-500/15 hover:text-amber-600 dark:hover:text-amber-400 hover:border-amber-500/50 dark:hover:border-amber-500/40 border border-slate-200/80 dark:border-slate-800 shadow-2xs hover:shadow-xs transition-all duration-200 disabled:opacity-50 cursor-pointer active:scale-95"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 text-amber-500 group-hover:text-amber-400 transition-transform duration-500 group-hover:rotate-180 ${
                isStatsRefetching ? 'animate-spin' : ''
              }`}
            />
            <span>{t('dashboard.refreshStats', { ns: 'admin', defaultValue: 'تحديث البيانات' })}</span>
          </button>

          {lastUpdatedTime && (
            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono inline-flex items-center justify-start sm:justify-end gap-1 px-1 select-none">
              <Clock className="w-2.5 h-2.5 text-slate-400 dark:text-slate-500 shrink-0" />
              <span>{t('dashboard.lastUpdated', { ns: 'admin', defaultValue: 'آخر تحديث' })}: {lastUpdatedTime}</span>
            </span>
          )}
        </div>
      </div>

      {/* 2. Core Operational KPIs Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Users */}
        <StatKpiCard
          title={t('dashboard.kpis.totalUsers', { ns: 'admin', defaultValue: 'إجمالي المستخدمين' })}
          value={formatAdminNumber(stats?.totalUsers, isRTL)}
          subtitle={`${formatAdminNumber(stats?.verifiedUsers, isRTL)} ${isRTL ? 'حساب موثق' : 'verified'}`}
          icon={Users}
          variant="cyan"
          isLoading={isStatsLoading}
          href={ROUTES.ADMIN.USERS}
        />

        {/* Active Auctions */}
        <StatKpiCard
          title={t('dashboard.kpis.activeAuctions', { ns: 'admin', defaultValue: 'المزادات النشطة' })}
          value={formatAdminNumber(stats?.activeAuctions, isRTL)}
          subtitle={`${formatAdminNumber(stats?.completedAuctions, isRTL)} ${isRTL ? 'مكتمل' : 'completed'} • ${formatAdminNumber(stats?.cancelledAuctions, isRTL)} ${isRTL ? 'ملغي' : 'cancelled'}`}
          icon={Gavel}
          variant="gold"
          isLoading={isStatsLoading}
          href={ROUTES.ADMIN.AUCTIONS}
        />

        {/* Today's Revenue */}
        <StatKpiCard
          title={t('dashboard.kpis.todaysRevenue', { ns: 'admin', defaultValue: 'إيرادات اليوم' })}
          value={formatAdminCurrency(stats?.todaysRevenue, undefined, isRTL)}
          subtitle={`${t('dashboard.kpis.collectedFees', { ns: 'admin', defaultValue: 'إجمالي الرسوم' })}: ${formatAdminCurrency(stats?.totalCollectedFees, undefined, isRTL)}`}
          icon={DollarSign}
          variant="emerald"
          isLoading={isStatsLoading}
          href={ROUTES.ADMIN.FINANCIALS}
        />

        {/* Pending Withdrawals */}
        <StatKpiCard
          title={t('dashboard.kpis.pendingWithdrawals', {
            ns: 'admin',
            defaultValue: 'طلبات السحب المعلقة',
          })}
          value={formatAdminNumber(stats?.pendingWithdrawalsCount, isRTL)}
          subtitle={formatAdminCurrency(stats?.pendingWithdrawalsAmount, undefined, isRTL)}
          icon={Clock}
          variant={stats && stats.pendingWithdrawalsCount > 0 ? 'rose' : 'slate'}
          isLoading={isStatsLoading}
          href={ROUTES.ADMIN.FINANCIALS}
        />
      </div>

      {/* 3. Treasury & Platform Liquidity Overview */}
      <TreasuryKpiCard treasury={treasury} isLoading={isTreasuryLoading} />

      {/* 4. Bottom Section: Recent Activities & Operations Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Recent Activity Feed (2 Cols) */}
        <div className="lg:col-span-2">
          <RecentActivityFeed />
        </div>

        {/* Right: Operational Summary Card (1 Col) */}
        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/80 shadow-2xs p-6 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-800/80">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-purple-500/15 text-purple-500 dark:text-purple-400 border border-purple-500/30">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white tracking-tight">
                  {isRTL ? 'حالة العمليات والأمان' : 'Operations & Security'}
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                  {isRTL ? 'المراقبة المستمرة للأموال والبيانات' : 'Real-time platform safeguards'}
                </p>
              </div>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400">{isRTL ? 'إجمالي المعاملات المنفذة' : 'Total Transactions'}</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {formatAdminNumber(stats?.totalTransactions, isRTL)}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400">{isRTL ? 'إجمالي المبالغ المصروفة' : 'Total Completed Payouts'}</span>
                <span className="font-bold text-emerald-500">
                  {formatAdminCurrency(stats?.totalCompletedPayouts, undefined, isRTL)}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400">{isRTL ? 'إجمالي أرصدة المستخدمين' : 'Total User Balances'}</span>
                <span className="font-bold text-amber-500">
                  {formatAdminCurrency(stats?.totalWalletBalance, undefined, isRTL)}
                </span>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 text-xs flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 shrink-0 text-amber-500 mt-0.5" />
            <p className="leading-relaxed">
              {isRTL
                ? 'لوحة الإدارة تعمل في وضع الأمان المالي الكامل. جميع الإجراءات مسجلة وموثقة في سجل التدقيق.'
                : 'Admin dashboard operates under strict auditing. All actions are logged and permanently timestamped.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
