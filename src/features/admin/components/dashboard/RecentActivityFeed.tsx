import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Activity, ArrowUpRight, Receipt, Clock, RefreshCw } from 'lucide-react';
import { ROUTES } from '@/constants/routes.constants';
import { useAdminTransactions } from '../../hooks/useAdminTransactions';
import {
  formatAdminCurrency,
  formatAdminDate,
  getTransactionTypeLabel,
  getTransactionStatusBadge,
} from '../../utils/admin.utils';
import { getTransactionAmountConfig } from '@/features/wallet/types/wallet.types';
import { cn } from '@/utils/cn';

export const RecentActivityFeed: React.FC = () => {
  const { t, i18n } = useTranslation(['admin', 'common']);
  const isRTL = i18n.language?.startsWith('ar');

  const { data, isLoading, isError, refetch } = useAdminTransactions({ page: 1, limit: 6 });
  const transactions = data?.items || [];

  return (
    <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/80 shadow-2xs overflow-hidden">
      {/* Feed Header */}
      <div className="flex items-center justify-between p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-blue-500/15 text-blue-500 dark:text-blue-400 border border-blue-500/30">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-black text-slate-900 dark:text-white tracking-tight">
              {t('dashboard.recentActivity.title', {
                ns: 'admin',
                defaultValue: 'آخر العمليات والأنشطة',
              })}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              {t('dashboard.recentActivity.description', {
                ns: 'admin',
                defaultValue: 'أحدث الحركات المالية في المحافظ',
              })}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => refetch()}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title={t('common.retry', { ns: 'common', defaultValue: 'تحديث' })}
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <Link
            to={ROUTES.ADMIN.TRANSACTIONS}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors border border-slate-200 dark:border-slate-700"
          >
            <span>{t('dashboard.recentActivity.viewAll', { ns: 'admin', defaultValue: 'عرض الكل' })}</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Feed Content */}
      <div className="p-4 sm:p-6">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-14 bg-slate-100 dark:bg-slate-800/60 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : isError ? (
          <div className="text-center py-8 text-slate-500 dark:text-slate-400 text-xs space-y-2">
            <p>{t('common.error', { ns: 'admin', defaultValue: 'حدث خطأ أثناء جلب المعاملات' })}</p>
            <button
              type="button"
              onClick={() => refetch()}
              className="px-3 py-1 text-xs text-amber-500 font-bold hover:underline cursor-pointer"
            >
              {t('common.retry', { ns: 'common', defaultValue: 'إعادة المحاولة' })}
            </button>
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-10 text-slate-400 text-xs space-y-1">
            <Receipt className="w-8 h-8 text-slate-400 dark:text-slate-600 mx-auto mb-2" />
            <p>{t('dashboard.recentActivity.empty', { ns: 'admin', defaultValue: 'لا توجد معاملات حديثة مسجلة حالياً.' })}</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
            {transactions.map((txn) => {
              const amountConfig = getTransactionAmountConfig(txn.type);
              const typeLabel = getTransactionTypeLabel(txn.type, isRTL);
              const statusBadge = getTransactionStatusBadge(txn.status, isRTL);

              return (
                <div
                  key={txn._id}
                  className="flex items-center justify-between py-3 px-2 hover:bg-slate-50 dark:hover:bg-slate-800/40 rounded-xl transition-colors gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 shrink-0">
                      <Receipt className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {typeLabel}
                      </p>
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>{formatAdminDate(txn.createdAt, isRTL ? 'ar' : 'en', isRTL)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right rtl:text-left shrink-0">
                    <p className={cn('text-xs sm:text-sm font-black tracking-tight', amountConfig.textColor)}>
                      {amountConfig.sign} {formatAdminCurrency(txn.amount, undefined, isRTL)}
                    </p>
                    <span
                      className={cn(
                        'inline-block text-[10px] font-bold px-1.5 py-0.5 rounded border mt-0.5',
                        statusBadge.bgClass
                      )}
                    >
                      {statusBadge.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default RecentActivityFeed;
