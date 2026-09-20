import React, { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { RefreshCw, AlertCircle } from 'lucide-react';
import { useWallet } from '../hooks/useWallet';
import { BalanceOverviewSection } from '../components/BalanceOverviewSection';
import { WalletActionButtons } from '../components/WalletActionButtons';
import { RecentTransactions } from '../components/RecentTransactions';
import { Button } from '@/components/common/Button';
import { useToast } from '@/components/feedback/useToast';
import { QUERY_KEYS } from '@/constants/queryKeys.constants';

export const WalletPage: React.FC = () => {
  const { t, i18n } = useTranslation(['wallet', 'common']);
  const [searchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { wallet, isLoading, error, refetch } = useWallet();
  const processedReturnRef = useRef(false);

  // Set document title
  useEffect(() => {
    document.title = `${t('wallet:pageTitle')} | ${t('common:appName', 'مزادك')}`;
  }, [t, i18n.language]);

  // Handle Return from Paymob Gateway (?success=true / ?success=false)
  useEffect(() => {
    if (processedReturnRef.current) return;

    const successParam = searchParams.get('success');
    if (successParam !== null) {
      processedReturnRef.current = true;

      if (successParam === 'true') {
        toast.success(t('wallet:notifications.depositSuccessDesc'), {
          title: t('wallet:notifications.depositSuccessTitle'),
        });

        // 1. Immediate Cache Invalidation
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.WALLET.MY_WALLET });
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.WALLET.TRANSACTIONS] });

        // 2. Safety Fallback Refetch after 1000ms
        const timer = setTimeout(() => {
          refetch();
          queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.WALLET.TRANSACTIONS] });
        }, 1000);

        // 3. Clean up URL
        window.history.replaceState({}, '', window.location.pathname);

        return () => clearTimeout(timer);
      } else if (successParam === 'false') {
        toast.error(t('wallet:notifications.depositFailedDesc'), {
          title: t('wallet:notifications.depositFailedTitle'),
        });

        window.history.replaceState({}, '', window.location.pathname);
      }
    }
  }, [searchParams, queryClient, refetch, t, toast]);

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 py-6 sm:py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Page Header: Pure Typography, Clean Alignment */}
        <div className="flex items-center justify-between gap-4 border-b border-slate-200/70 dark:border-slate-800 pb-4 sm:pb-5">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {t('wallet:pageTitle')}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              {t('wallet:pageSubtitle')}
            </p>
          </div>

          {/* Refresh Button with distinct hover border and orange icon */}
          <button
            type="button"
            onClick={() => refetch()}
            disabled={isLoading}
            title={t('wallet:actions.refresh', 'تحديث البيانات')}
            aria-label="Refresh wallet data"
            className="group p-2.5 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-amber-500 dark:hover:border-amber-500 hover:bg-amber-500/10 dark:hover:bg-amber-500/15 hover:shadow-md active:scale-95 transition-all duration-200 shadow-sm disabled:opacity-50"
          >
            <RefreshCw
              className={`w-4.5 h-4.5 text-amber-500 transition-transform group-hover:rotate-180 duration-500 ${isLoading ? 'animate-spin' : ''}`}
            />
          </button>
        </div>

        {/* Error Banner if Query Failed */}
        {error && (
          <div className="rounded-2xl border border-rose-200 dark:border-rose-900/50 bg-rose-50/80 dark:bg-rose-950/40 p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />
              <p className="text-sm text-rose-700 dark:text-rose-300">
                {t('wallet:errors.loadFailed')}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              className="border-rose-300 text-rose-700 hover:bg-rose-100 dark:border-rose-800 dark:text-rose-300 dark:hover:bg-rose-900/50 shrink-0"
            >
              {t('wallet:errors.retry')}
            </Button>
          </div>
        )}

        {/* 1. Balances Overview Section (3 Equal Cards Side-by-Side) */}
        <BalanceOverviewSection wallet={wallet} isLoading={isLoading} />

        {/* 2. Quick Action Buttons Grid (3 Equal Full-Width Buttons) */}
        <WalletActionButtons />

        {/* 3. Recent Transactions Widget */}
        <RecentTransactions />
      </div>
    </div>
  );
};
