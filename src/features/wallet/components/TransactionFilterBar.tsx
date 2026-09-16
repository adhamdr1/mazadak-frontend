import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Filter,
  RotateCcw,
  Layers,
  Activity,
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { CustomSelect, type CustomSelectOption } from '@/components/common/CustomSelect';
import { CustomDateInput } from './CustomDateInput';
import type { TransactionType, TransactionStatus } from '../types/wallet.types';

export interface TransactionFilterBarProps {
  type?: TransactionType;
  status?: TransactionStatus;
  startDate?: string;
  endDate?: string;
  hasActiveFilters: boolean;
  onTypeChange: (type?: TransactionType) => void;
  onStatusChange: (status?: TransactionStatus) => void;
  onDateRangeChange: (start?: string, end?: string) => void;
  onReset: () => void;
  className?: string;
}

export const TransactionFilterBar: React.FC<TransactionFilterBarProps> = ({
  type,
  status,
  startDate,
  endDate,
  hasActiveFilters,
  onTypeChange,
  onStatusChange,
  onDateRangeChange,
  onReset,
  className,
}) => {
  const { t } = useTranslation('wallet');

  // Type Options
  const typeOptions: CustomSelectOption<string>[] = [
    { value: 'ALL', label: t('transactions.filters.allTypes') },
    { value: 'DEPOSIT', label: t('transactionTypes.DEPOSIT') },
    { value: 'WITHDRAW', label: t('transactionTypes.WITHDRAW') },
    { value: 'HOLD', label: t('transactionTypes.HOLD') },
    { value: 'RELEASE', label: t('transactionTypes.RELEASE') },
    { value: 'CAPTURE', label: t('transactionTypes.CAPTURE') },
    { value: 'REFUND', label: t('transactionTypes.REFUND') },
  ];

  // Status Options
  const statusOptions: CustomSelectOption<string>[] = [
    { value: 'ALL', label: t('transactions.filters.allStatuses') },
    { value: 'SUCCESS', label: t('transactionStatuses.SUCCESS') },
    { value: 'PENDING', label: t('transactionStatuses.PENDING') },
    { value: 'PROCESSING', label: t('transactionStatuses.PROCESSING') },
    { value: 'FAILED', label: t('transactionStatuses.FAILED') },
    { value: 'CANCELLED', label: t('transactionStatuses.CANCELLED') },
    { value: 'EXPIRED', label: t('transactionStatuses.EXPIRED') },
  ];

  const handleStartDateChange = (newStart?: string) => {
    if (!newStart) {
      onDateRangeChange(undefined, endDate);
      return;
    }
    // If new start date is after current end date, auto-sync or clear end date
    if (endDate && newStart > endDate) {
      onDateRangeChange(newStart, undefined);
    } else {
      onDateRangeChange(newStart, endDate);
    }
  };

  const handleEndDateChange = (newEnd?: string) => {
    if (!newEnd) {
      onDateRangeChange(startDate, undefined);
      return;
    }
    // If new end date is before current start date, auto-sync start date
    if (startDate && newEnd < startDate) {
      onDateRangeChange(newEnd, newEnd);
    } else {
      onDateRangeChange(startDate, newEnd);
    }
  };

  return (
    <div
      className={cn(
        'p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4',
        className
      )}
    >
      {/* Top Row: Title & Active Filters / Reset */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200 font-bold text-sm">
          <Filter className="w-4 h-4 text-amber-500" />
          <span>{t('transactions.filters.title', { defaultValue: 'تصفية المعاملات' })}</span>
        </div>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{t('transactions.filters.reset')}</span>
          </button>
        )}
      </div>

      {/* Filter Controls Grid (4 equal columns) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 items-end">
        {/* 1. Transaction Type Filter */}
        <div className="space-y-1.5">
          <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400">
            {t('transactions.filters.type')}
          </label>
          <CustomSelect
            value={type || 'ALL'}
            onChange={(val) => onTypeChange(val === 'ALL' ? undefined : (val as TransactionType))}
            options={typeOptions}
            icon={Layers}
            className="w-full"
          />
        </div>

        {/* 2. Transaction Status Filter */}
        <div className="space-y-1.5">
          <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400">
            {t('transactions.filters.status')}
          </label>
          <CustomSelect
            value={status || 'ALL'}
            onChange={(val) => onStatusChange(val === 'ALL' ? undefined : (val as TransactionStatus))}
            options={statusOptions}
            icon={Activity}
            className="w-full"
          />
        </div>

        {/* 3. Start Date Picker (DD/MM/YYYY) */}
        <CustomDateInput
          label={t('transactions.filters.startDate')}
          value={startDate}
          max={endDate}
          onChange={handleStartDateChange}
        />

        {/* 4. End Date Picker (DD/MM/YYYY) */}
        <CustomDateInput
          label={t('transactions.filters.endDate')}
          value={endDate}
          min={startDate}
          onChange={handleEndDateChange}
        />
      </div>
    </div>
  );
};

export default TransactionFilterBar;
