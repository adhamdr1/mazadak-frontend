import React from 'react';
import { useTranslation } from 'react-i18next';
import { Filter, RotateCcw, Activity, Wallet } from 'lucide-react';
import { cn } from '@/utils/cn';
import { CustomSelect, type CustomSelectOption } from '@/components/common/CustomSelect';
import type { WithdrawalStatus, PayoutMethod } from '../types/wallet.types';

export interface WithdrawalsFilterBarProps {
  status?: WithdrawalStatus;
  payoutMethod?: PayoutMethod;
  hasActiveFilters: boolean;
  onStatusChange: (status?: WithdrawalStatus) => void;
  onPayoutMethodChange: (method?: PayoutMethod) => void;
  onReset: () => void;
  className?: string;
}

export const WithdrawalsFilterBar: React.FC<WithdrawalsFilterBarProps> = ({
  status,
  payoutMethod,
  hasActiveFilters,
  onStatusChange,
  onPayoutMethodChange,
  onReset,
  className,
}) => {
  const { t } = useTranslation('wallet');

  // Status Options
  const statusOptions: CustomSelectOption<string>[] = [
    { value: 'ALL', label: t('withdrawals.filters.allStatuses', 'جميع الحالات') },
    { value: 'PENDING', label: t('withdrawalStatuses.PENDING', 'قيد المراجعة') },
    { value: 'PROCESSING', label: t('withdrawalStatuses.PROCESSING', 'قيد التحويل البنكي') },
    { value: 'COMPLETED', label: t('withdrawalStatuses.COMPLETED', 'تم التحويل بنجاح') },
    { value: 'REJECTED', label: t('withdrawalStatuses.REJECTED', 'تم الرفض') },
    { value: 'CANCELLED', label: t('withdrawalStatuses.CANCELLED', 'ملغي') },
  ];

  // Payout Method Options
  const methodOptions: CustomSelectOption<string>[] = [
    { value: 'ALL', label: t('withdrawals.filters.allMethods', 'جميع الوسائل') },
    { value: 'BANK_ACCOUNT', label: t('withdraw.methods.bank', 'حساب بنكي') },
    { value: 'INSTAPAY', label: t('withdraw.methods.instapay', 'إنستاباي') },
    { value: 'VODAFONE_CASH', label: t('withdraw.methods.vodafone', 'فودافون كاش') },
    { value: 'ORANGE_CASH', label: t('withdraw.methods.orange', 'أورنج كاش') },
    { value: 'ETISALAT_CASH', label: t('withdraw.methods.etisalat', 'اتصالات كاش') },
    { value: 'WE_PAY', label: t('withdraw.methods.we', 'وي باي') },
  ];

  return (
    <div
      className={cn(
        'rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-amber-500/50 dark:hover:border-amber-500/50 bg-white dark:bg-slate-900 p-4 sm:p-5 shadow-sm hover:shadow-md transition-all duration-300 space-y-4',
        className
      )}
    >
      {/* Top Row: Title & Active Filters / Reset */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800/80">
        <div className="flex items-center gap-2 text-slate-900 dark:text-white font-extrabold text-sm">
          <Filter className="w-4 h-4 text-amber-500 shrink-0" />
          <span>{t('withdrawals.filters.title', 'تصفية السحوبات')}</span>
        </div>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 bg-amber-500/10 hover:bg-amber-500/15 border border-amber-500/25 transition-all cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{t('withdrawals.filters.reset', 'مسح الفلاتر')}</span>
          </button>
        )}
      </div>

      {/* Filter Controls Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {/* 1. Status Filter */}
        <div className="space-y-1.5">
          <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400">
            {t('withdrawals.filters.status', 'حالة الطلب')}
          </label>
          <CustomSelect
            value={status || 'ALL'}
            onChange={(val) =>
              onStatusChange(val === 'ALL' ? undefined : (val as WithdrawalStatus))
            }
            options={statusOptions}
            icon={Activity}
            className="w-full"
          />
        </div>

        {/* 2. Payout Method Filter */}
        <div className="space-y-1.5">
          <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400">
            {t('withdrawals.filters.method', 'وسيلة السحب')}
          </label>
          <CustomSelect
            value={payoutMethod || 'ALL'}
            onChange={(val) =>
              onPayoutMethodChange(val === 'ALL' ? undefined : (val as PayoutMethod))
            }
            options={methodOptions}
            icon={Wallet}
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
};

export default WithdrawalsFilterBar;
