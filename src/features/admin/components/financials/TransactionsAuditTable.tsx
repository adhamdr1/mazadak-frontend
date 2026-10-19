import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Search,
  X,
  Receipt,
  ArrowDownLeft,
  ArrowUpRight,
  Lock,
  Unlock,
  CheckCircle2,
  RotateCcw,
  Copy,
  Check,
  ExternalLink,
  Calendar,
  Wallet,
  Clock,
  Layers,
  Eye,
  RefreshCw,
  Gavel,
  ShieldCheck,
  Building2,
  Scale,
  ArrowRightLeft,
  Info,
} from 'lucide-react';
import { ROUTES } from '@/constants/routes.constants';
import { FilterDropdown } from '@/components/common/FilterDropdown';
import { RefreshButton } from '@/components/common/RefreshButton';
import { DateRangeFilter } from '@/components/common/DateRangeFilter';
import { Pagination } from '@/components/common/Pagination';
import { EmptyState } from '@/components/feedback/EmptyState';
import { Modal } from '@/components/common/Modal';
import {
  formatAdminCurrency,
  formatAdminDate,
  getTransactionTypeLabel,
  getTransactionStatusBadge,
  getTransactionTypeIconConfig,
  getTransactionReferenceConfig,
  getTransactionImpactDescription,
  type TransactionIconName,
  type TransactionReferenceIconName,
} from '../../utils/admin.utils';
import { getTransactionAmountConfig, type Transaction, type TransactionType, type TransactionStatus } from '@/features/wallet/types/wallet.types';
import { cn } from '@/utils/cn';

const TYPE_OPTIONS: Array<{ value: TransactionType | 'ALL'; labelAr: string; labelEn: string }> = [
  { value: 'ALL', labelAr: 'كافة أنواع العمليات', labelEn: 'All Types' },
  { value: 'DEPOSIT', labelAr: 'إيداع رصيد', labelEn: 'Deposit' },
  { value: 'WITHDRAW', labelAr: 'سحب أرباح', labelEn: 'Withdraw' },
  { value: 'HOLD', labelAr: 'حجز مؤقت (مزايدة)', labelEn: 'Bid Hold' },
  { value: 'RELEASE', labelAr: 'فك حجز (مزايدة)', labelEn: 'Bid Release' },
  { value: 'CAPTURE', labelAr: 'خصم نهائي (ضمان)', labelEn: 'Capture (Escrow)' },
  { value: 'REFUND', labelAr: 'استرداد رصيد', labelEn: 'Refund' },
  { value: 'ADMIN_CREDIT', labelAr: 'إضافة إدارية (+)', labelEn: 'Admin Credit' },
  { value: 'ADMIN_DEBIT', labelAr: 'خصم إداري (-)', labelEn: 'Admin Debit' },
];

const STATUS_OPTIONS: Array<{ value: TransactionStatus | 'ALL'; labelAr: string; labelEn: string }> = [
  { value: 'ALL', labelAr: 'كافة الحالات', labelEn: 'All Statuses' },
  { value: 'SUCCESS', labelAr: 'ناجحة', labelEn: 'Success' },
  { value: 'PENDING', labelAr: 'معلقة', labelEn: 'Pending' },
  { value: 'PROCESSING', labelAr: 'قيد التنفيذ', labelEn: 'Processing' },
  { value: 'FAILED', labelAr: 'فاشلة', labelEn: 'Failed' },
  { value: 'CANCELLED', labelAr: 'ملغية', labelEn: 'Cancelled' },
  { value: 'EXPIRED', labelAr: 'منتهية الصلاحية', labelEn: 'Expired' },
];

const renderTransactionIcon = (iconName: TransactionIconName) => {
  switch (iconName) {
    case 'ArrowDownLeft':
      return <ArrowDownLeft className="w-3.5 h-3.5 shrink-0" />;
    case 'ArrowUpRight':
      return <ArrowUpRight className="w-3.5 h-3.5 shrink-0" />;
    case 'Lock':
      return <Lock className="w-3.5 h-3.5 shrink-0" />;
    case 'Unlock':
      return <Unlock className="w-3.5 h-3.5 shrink-0" />;
    case 'CheckCircle2':
      return <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />;
    case 'RotateCcw':
      return <RotateCcw className="w-3.5 h-3.5 shrink-0" />;
    case 'Receipt':
    default:
      return <Receipt className="w-3.5 h-3.5 shrink-0" />;
  }
};

const renderReferenceIcon = (iconName: TransactionReferenceIconName) => {
  switch (iconName) {
    case 'Gavel':
      return <Gavel className="w-3 h-3 shrink-0" />;
    case 'ShieldCheck':
      return <ShieldCheck className="w-3 h-3 shrink-0" />;
    case 'Building2':
      return <Building2 className="w-3 h-3 shrink-0" />;
    case 'Scale':
      return <Scale className="w-3 h-3 shrink-0" />;
    case 'ArrowRightLeft':
    default:
      return <ArrowRightLeft className="w-3 h-3 shrink-0" />;
  }
};

export interface TransactionsAuditTableProps {
  transactions: Transaction[];
  total?: number;
  totalPages: number;
  currentPage: number;
  isLoading: boolean;
  isRefetching: boolean;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  selectedType: TransactionType | 'ALL';
  onTypeChange: (type: TransactionType | 'ALL') => void;
  selectedStatus: TransactionStatus | 'ALL';
  onStatusChange: (status: TransactionStatus | 'ALL') => void;
  startDate?: string;
  endDate?: string;
  onDateRangeChange: (range: { startDate?: string; endDate?: string }) => void;
  onPageChange: (page: number) => void;
  onRefresh: () => void;
  walletIdFilter?: string;
  onClearWalletFilter?: () => void;
}

export const TransactionsAuditTable: React.FC<TransactionsAuditTableProps> = ({
  transactions,
  total = 0,
  totalPages,
  currentPage,
  isLoading,
  isRefetching,
  searchQuery,
  onSearchChange,
  selectedType,
  onTypeChange,
  selectedStatus,
  onStatusChange,
  startDate,
  endDate,
  onDateRangeChange,
  onPageChange,
  onRefresh,
  walletIdFilter,
  onClearWalletFilter,
}) => {
  const { t, i18n } = useTranslation(['admin', 'common']);
  const isRTL = i18n.language?.startsWith('ar');

  const [localSearch, setLocalSearch] = useState(searchQuery);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [selectedTrx, setSelectedTrx] = useState<Transaction | null>(null);

  useEffect(() => {
    setLocalSearch(searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearch !== searchQuery) {
        onSearchChange(localSearch);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [localSearch, onSearchChange, searchQuery]);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => {
      setCopiedKey(null);
    }, 2000);
  };

  const handleClearFilters = () => {
    setLocalSearch('');
    onSearchChange('');
    onTypeChange('ALL');
    onStatusChange('ALL');
    onDateRangeChange({ startDate: undefined, endDate: undefined });
    if (onClearWalletFilter) {
      onClearWalletFilter();
    }
  };

  const hasActiveFilters =
    searchQuery.trim() !== '' ||
    selectedType !== 'ALL' ||
    selectedStatus !== 'ALL' ||
    Boolean(startDate || endDate) ||
    Boolean(walletIdFilter);

  return (
    <div className="space-y-4">
      {/* 1. Filter Controls Toolbar */}
      <div className="relative z-20 p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-2.5">
        <div className="flex flex-col xl:flex-row items-stretch xl:items-center gap-2 sm:gap-2.5 w-full">
          {/* Search Input: Row 1 on < xl (Full Width for spacious placeholder), Flex-1 on xl */}
          <div className="relative w-full xl:flex-1 min-w-0">
            <Search className="w-4 h-4 text-slate-400 absolute start-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              placeholder={
                t('transactions.table.searchPlaceholder', {
                  defaultValue: isRTL
                    ? 'بحث ذكي بالسيرفر برقم الهاتف، الإيميل، الاسم، أو كود العملية/المرجع...'
                    : 'Smart search by phone number, email, name, or transaction/ref ID...',
                })
              }
              className="w-full h-[38px] ps-10 pe-9 rtl:pr-10 rtl:pl-9 ltr:pl-10 ltr:pr-9 rounded-xl text-xs sm:text-sm font-semibold border transition-all duration-200 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white placeholder:text-slate-400 border-slate-200/80 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/15 focus:border-amber-500/60 shadow-2xs truncate"
            />
            {localSearch && (
              <button
                type="button"
                onClick={() => {
                  setLocalSearch('');
                  onSearchChange('');
                }}
                className="absolute end-3 top-1/2 -translate-y-1/2 p-0.5 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Controls: Row 2 on < xl (fills row width evenly), inline on xl */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-2.5 w-full xl:w-auto shrink-0">
            <div className="flex items-center gap-2 sm:gap-2.5 w-full sm:w-auto flex-1 xl:flex-initial">
              {/* Type Dropdown */}
              <div className="flex-1 min-w-0 xl:flex-initial xl:w-auto">
                <FilterDropdown
                  value={selectedType}
                  onChange={(val) => onTypeChange(val as TransactionType | 'ALL')}
                  options={TYPE_OPTIONS.map((opt) => ({
                    value: opt.value,
                    label: isRTL ? opt.labelAr : opt.labelEn,
                  }))}
                  icon={Layers}
                  allValue="ALL"
                />
              </div>

              {/* Status Dropdown */}
              <div className="flex-1 min-w-0 xl:flex-initial xl:w-auto">
                <FilterDropdown
                  value={selectedStatus}
                  onChange={(val) => onStatusChange(val as TransactionStatus | 'ALL')}
                  options={STATUS_OPTIONS.map((opt) => ({
                    value: opt.value,
                    label: isRTL ? opt.labelAr : opt.labelEn,
                  }))}
                  icon={Clock}
                  allValue="ALL"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-2.5 w-full sm:w-auto flex-1 xl:flex-initial">
              {/* Date Range Filter */}
              <div className="flex-1 min-w-0 xl:flex-initial xl:w-auto">
                <DateRangeFilter
                  startDate={startDate}
                  endDate={endDate}
                  onChange={onDateRangeChange}
                />
              </div>

              {/* Common RefreshButton */}
              <div className="shrink-0">
                <RefreshButton
                  onRefresh={onRefresh}
                  isLoading={isLoading}
                  isRefetching={isRefetching}
                  showLabelOnMobile={false}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Active Wallet Filter Tag */}
        {walletIdFilter && (
          <div className="flex items-center gap-2 pt-1 text-xs text-slate-600 dark:text-slate-300">
            <span className="font-semibold">{isRTL ? 'تصفية المحفظة:' : 'Wallet Filter:'}</span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 font-mono text-[11px] font-bold">
              <Wallet className="w-3 h-3" />
              <span>#{walletIdFilter.slice(-8).toUpperCase()}</span>
              {onClearWalletFilter && (
                <button
                  type="button"
                  onClick={onClearWalletFilter}
                  className="hover:text-amber-700 cursor-pointer"
                  title={isRTL ? 'إلغاء تصفية المحفظة' : 'Clear wallet filter'}
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </span>
          </div>
        )}

        {/* Syncing Indicator */}
        {isRefetching && (
          <div className="flex items-center justify-end text-[11px] font-bold text-amber-500 px-1 animate-pulse">
            <span className="flex items-center gap-1">
              <RefreshCw className="w-3 h-3 animate-spin" />
              {isRTL ? 'جاري مزامنة سجل المعاملات مع الخادم...' : 'Syncing audit log with server...'}
            </span>
          </div>
        )}
      </div>

      {/* 2. Main Transactions Data Table (Clean 6 Centered Columns Architecture) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-950/40 text-slate-500 dark:text-slate-400 font-bold uppercase text-[11px] sm:text-xs tracking-wider">
                <th className="py-3.5 px-4 text-center whitespace-nowrap min-w-[200px]">
                  {isRTL ? 'المعاملة والمرجع' : 'Transaction & Ref'}
                </th>
                <th className="py-3.5 px-4 text-center whitespace-nowrap min-w-[140px]">
                  {isRTL ? 'نوع العملية' : 'Transaction Type'}
                </th>
                <th className="py-3.5 px-4 text-center whitespace-nowrap min-w-[130px]">
                  {isRTL ? 'المبلغ' : 'Amount'}
                </th>
                <th className="py-3.5 px-4 text-center whitespace-nowrap min-w-[120px]">
                  {isRTL ? 'الحالة' : 'Status'}
                </th>
                <th className="py-3.5 px-4 text-center whitespace-nowrap min-w-[140px]">
                  {isRTL ? 'التاريخ والوقت' : 'Date & Time'}
                </th>
                <th className="py-3.5 px-4 text-center whitespace-nowrap min-w-[90px]">
                  {isRTL ? 'التفاصيل' : 'Details'}
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 font-normal">
              {isLoading && transactions.length === 0 ? (
                // 5 Skeleton rows matching 6 centered columns
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={`trx-skel-${i}`} className="animate-pulse">
                    <td className="py-4 px-4 text-center">
                      <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-md w-24 mx-auto mb-1.5" />
                      <div className="h-3 bg-slate-100 dark:bg-slate-800/50 rounded-md w-20 mx-auto" />
                    </td>
                    <td className="py-4 px-4 text-center">
                      <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded-xl w-28 mx-auto" />
                    </td>
                    <td className="py-4 px-4 text-center">
                      <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-md w-20 mx-auto" />
                    </td>
                    <td className="py-4 px-4 text-center">
                      <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded-xl w-20 mx-auto" />
                    </td>
                    <td className="py-4 px-4 text-center">
                      <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-md w-24 mx-auto" />
                    </td>
                    <td className="py-4 px-4 text-center">
                      <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded-xl w-10 mx-auto" />
                    </td>
                  </tr>
                ))
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 px-4 text-center">
                    <EmptyState
                      title={
                        hasActiveFilters
                          ? isRTL
                            ? 'لم يتم العثور على أي معاملات'
                            : 'No matching transactions found'
                          : isRTL
                          ? 'لا توجد معاملات مسجلة حالياً'
                          : 'No audit transactions recorded yet'
                      }
                      description={
                        hasActiveFilters
                          ? isRTL
                            ? 'جرّب تعديل مصطلحات البحث أو مسح فلاتر النوع والحالة.'
                            : 'Try adjusting your search terms or clearing type/status filters.'
                          : isRTL
                          ? 'ستظهر هنا كافة الحركات المالية والمصرفية للنظام بشكل لحظي.'
                          : 'System financial transactions will appear here in real-time.'
                      }
                      action={
                        hasActiveFilters
                          ? {
                              label: isRTL ? 'إلغاء الفلاتر' : 'Clear Filters',
                              onClick: handleClearFilters,
                            }
                          : undefined
                      }
                      icon={<Receipt className="w-10 h-10 text-slate-400 dark:text-slate-600" />}
                    />
                  </td>
                </tr>
              ) : (
                transactions.map((trx) => {
                  const typeIconConfig = getTransactionTypeIconConfig(trx.type);
                  const amountConfig = getTransactionAmountConfig(trx.type);
                  const statusBadge = getTransactionStatusBadge(trx.status, isRTL);
                  const refConfig = trx.referenceId
                    ? getTransactionReferenceConfig(trx.referenceType, isRTL)
                    : null;

                  return (
                    <tr
                      key={trx._id}
                      className="hover:bg-slate-50/70 dark:hover:bg-slate-800/30 transition-colors"
                    >
                      {/* 1. Transaction ID & Reference (Clean Styled Cards) */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <div className="flex flex-col items-center justify-center gap-1.5">
                          {/* Transaction Main ID Badge */}
                          <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80">
                            <span className="font-mono text-xs font-bold text-slate-900 dark:text-white select-all">
                              <bdi dir="ltr">#{trx._id.slice(-6).toUpperCase()}</bdi>
                            </span>
                            <button
                              type="button"
                              onClick={() => handleCopy(trx._id, `trx-${trx._id}`)}
                              title={isRTL ? 'نسخ معرف المعاملة' : 'Copy Transaction ID'}
                              className="p-0.5 text-slate-400 hover:text-amber-500 cursor-pointer transition-colors"
                            >
                              {copiedKey === `trx-${trx._id}` ? (
                                <Check className="w-3 h-3 text-emerald-500" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          </div>

                          {/* Reference Badge (Intuitive Chip with Icon & Label) */}
                          {refConfig && trx.referenceId ? (
                            <div className="inline-flex items-center">
                              {trx.referenceType === 'AUCTION' ? (
                                <Link
                                  to={ROUTES.AUCTION_DETAIL(trx.referenceId)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className={cn(
                                    'inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border transition-colors hover:underline',
                                    refConfig.bgClass
                                  )}
                                  title={isRTL ? 'معاينة صفحة المزاد في نافذة جديدة' : 'Open auction in new tab'}
                                >
                                  {renderReferenceIcon(refConfig.icon)}
                                  <span>{refConfig.label}:</span>
                                  <span className="font-mono">#{trx.referenceId.slice(-6).toUpperCase()}</span>
                                  <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                                </Link>
                              ) : trx.referenceType === 'ESCROW' ? (
                                <Link
                                  to={ROUTES.ESCROW_DETAIL(trx.referenceId)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className={cn(
                                    'inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border transition-colors hover:underline',
                                    refConfig.bgClass
                                  )}
                                  title={isRTL ? 'معاينة صفحة الضمان في نافذة جديدة' : 'Open escrow in new tab'}
                                >
                                  {renderReferenceIcon(refConfig.icon)}
                                  <span>{refConfig.label}:</span>
                                  <span className="font-mono">#{trx.referenceId.slice(-6).toUpperCase()}</span>
                                  <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                                </Link>
                              ) : (
                                <span
                                  className={cn(
                                    'inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border',
                                    refConfig.bgClass
                                  )}
                                >
                                  {renderReferenceIcon(refConfig.icon)}
                                  <span>{refConfig.label}:</span>
                                  <span className="font-mono">#{trx.referenceId.slice(-6).toUpperCase()}</span>
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-[10px] text-slate-400 font-mono italic">
                              {isRTL ? 'بدون مرجع' : 'No reference'}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* 2. Transaction Type */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center">
                          <span
                            className={cn(
                              'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl font-bold border text-[11px]',
                              typeIconConfig.bgClass
                            )}
                          >
                            {renderTransactionIcon(typeIconConfig.icon)}
                            <span>{getTransactionTypeLabel(trx.type, isRTL)}</span>
                          </span>
                        </div>
                      </td>

                      {/* 3. Amount */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <div className="flex flex-col items-center justify-center">
                          <span
                            className={cn(
                              'text-sm font-black tracking-tight font-mono',
                              amountConfig.textColor
                            )}
                          >
                            {amountConfig.sign}{' '}
                            {formatAdminCurrency(trx.amount, trx.currency, isRTL)}
                          </span>
                        </div>
                      </td>

                      {/* 4. Status Badge */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center">
                          <span
                            className={cn(
                              'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[10px] font-black border tracking-wider',
                              statusBadge.bgClass
                            )}
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-current shrink-0" />
                            <span>{statusBadge.label}</span>
                          </span>
                        </div>
                      </td>

                      {/* 5. Created Date */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                        <div className="flex items-center justify-center gap-1.5 text-slate-600 dark:text-slate-300">
                          <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{formatAdminDate(trx.createdAt, isRTL ? 'ar' : 'en', isRTL)}</span>
                        </div>
                      </td>

                      {/* 6. Action / Animated Details Eye */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center">
                          <button
                            type="button"
                            onClick={() => setSelectedTrx(trx)}
                            className="p-2 rounded-xl border border-slate-200/80 dark:border-slate-700/80 bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-amber-500 dark:hover:text-amber-400 hover:border-amber-500/40 hover:bg-amber-500/10 hover:shadow-md hover:scale-110 active:scale-95 transition-all duration-200 cursor-pointer group shadow-2xs"
                            title={isRTL ? 'عرض تفاصيل وسند التدقيق المالي' : 'View transaction audit voucher'}
                          >
                            <Eye className="w-4 h-4 transition-transform duration-200 group-hover:scale-110" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* 3. Pagination Footer */}
        {totalPages > 1 && (
          <div className="border-t border-slate-100 dark:border-slate-800 px-4 py-2">
            <Pagination
              page={currentPage}
              totalPages={totalPages}
              total={total}
              limit={10}
              onPageChange={onPageChange}
              isLoading={isLoading}
              showSummary={true}
            />
          </div>
        )}
      </div>

      {/* 4. Rich Financial Audit Voucher Modal */}
      {selectedTrx && (
        <Modal
          isOpen={!!selectedTrx}
          onClose={() => setSelectedTrx(null)}
          size="md"
          title={
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
                <Receipt className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-black text-sm text-slate-900 dark:text-white">
                  {isRTL ? 'سند التدقيق المالي' : 'Financial Audit Voucher'}
                </h3>
                <p className="text-[11px] text-slate-400 font-normal">
                  {isRTL ? 'توثيق رسمي لبيانات الحركة وتأثيرها المحاسبي' : 'Official diagnostic slip & accounting record'}
                </p>
              </div>
            </div>
          }
        >
          <div className="space-y-4 pt-2 text-xs">
            {/* 1. Voucher Hero Amount Card */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100/60 dark:from-slate-900 dark:to-slate-950 border border-slate-200/90 dark:border-slate-800 flex items-center justify-between shadow-2xs">
              <div>
                <span className="text-slate-400 block text-[11px] font-semibold mb-0.5">
                  {isRTL ? 'المبلغ المحاسبي' : 'Audit Amount'}
                </span>
                <span
                  className={cn(
                    'text-xl font-black font-mono tracking-tight',
                    getTransactionAmountConfig(selectedTrx.type).textColor
                  )}
                >
                  {getTransactionAmountConfig(selectedTrx.type).sign}{' '}
                  {formatAdminCurrency(selectedTrx.amount, selectedTrx.currency, isRTL)}
                </span>
              </div>

              <div className="flex flex-col items-end gap-1.5">
                <span
                  className={cn(
                    'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[10px] font-black border',
                    getTransactionStatusBadge(selectedTrx.status, isRTL).bgClass
                  )}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-current" />
                  <span>{getTransactionStatusBadge(selectedTrx.status, isRTL).label}</span>
                </span>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  {getTransactionTypeLabel(selectedTrx.type, isRTL)}
                </span>
              </div>
            </div>

            {/* 2. Financial Impact Description Card */}
            <div className="p-3 rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/80 dark:border-blue-900/60 flex items-start gap-2.5">
              <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <span className="font-bold text-blue-800 dark:text-blue-300 block text-[11px]">
                  {isRTL ? 'الأثر المحاسبي على الرصيد:' : 'Accounting Balance Impact:'}
                </span>
                <p className="text-[11px] text-blue-700/90 dark:text-blue-300/80 leading-relaxed">
                  {getTransactionImpactDescription(selectedTrx.type, isRTL)}
                </p>
              </div>
            </div>

            {/* 3. Full Identifier Details List */}
            <div className="divide-y divide-slate-100 dark:divide-slate-800/80 rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden bg-white dark:bg-slate-900">
              {/* Full Transaction ID */}
              <div className="p-3 flex justify-between items-center gap-2">
                <span className="text-slate-500 dark:text-slate-400 shrink-0">{isRTL ? 'معرف المعاملة:' : 'Transaction ID:'}</span>
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="font-mono font-bold select-all truncate text-slate-900 dark:text-white" title={selectedTrx._id}>
                    {selectedTrx._id}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopy(selectedTrx._id, 'modal-trx')}
                    className="p-1 rounded-md text-slate-400 hover:text-amber-500 transition-colors shrink-0"
                    title={isRTL ? 'نسخ' : 'Copy'}
                  >
                    {copiedKey === 'modal-trx' ? (
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Full Wallet ID */}
              <div className="p-3 flex justify-between items-center gap-2">
                <span className="text-slate-500 dark:text-slate-400 shrink-0">{isRTL ? 'معرف المحفظة:' : 'Wallet ID:'}</span>
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="font-mono font-bold select-all truncate text-slate-900 dark:text-white" title={selectedTrx.walletId}>
                    {selectedTrx.walletId}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopy(selectedTrx.walletId, 'modal-wallet')}
                    className="p-1 rounded-md text-slate-400 hover:text-amber-500 transition-colors shrink-0"
                    title={isRTL ? 'نسخ' : 'Copy'}
                  >
                    {copiedKey === 'modal-wallet' ? (
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Reference ID & Type */}
              {selectedTrx.referenceId && (
                <div className="p-3 flex justify-between items-center gap-2">
                  <span className="text-slate-500 dark:text-slate-400 shrink-0">
                    {isRTL ? 'المرجع المقترن:' : 'Reference Record:'}
                  </span>
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="font-mono font-bold select-all truncate text-slate-900 dark:text-white" title={selectedTrx.referenceId}>
                      {selectedTrx.referenceId}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopy(selectedTrx.referenceId || '', 'modal-ref')}
                      className="p-1 rounded-md text-slate-400 hover:text-amber-500 transition-colors shrink-0"
                      title={isRTL ? 'نسخ' : 'Copy'}
                    >
                      {copiedKey === 'modal-ref' ? (
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Gateway Provider */}
              {selectedTrx.gatewayProvider && (
                <div className="p-3 flex justify-between items-center">
                  <span className="text-slate-500 dark:text-slate-400">{isRTL ? 'بوابة الدفع:' : 'Gateway Provider:'}</span>
                  <span className="font-bold text-slate-900 dark:text-white uppercase">{selectedTrx.gatewayProvider}</span>
                </div>
              )}

              {/* Gateway Transaction ID */}
              {selectedTrx.gatewayTransactionId && (
                <div className="p-3 flex justify-between items-center gap-2">
                  <span className="text-slate-500 dark:text-slate-400 shrink-0">{isRTL ? 'معرف بوابة الدفع:' : 'Gateway Trx ID:'}</span>
                  <span className="font-mono font-bold select-all text-slate-900 dark:text-white truncate">
                    {selectedTrx.gatewayTransactionId}
                  </span>
                </div>
              )}

              {/* Timestamp */}
              <div className="p-3 flex justify-between items-center">
                <span className="text-slate-500 dark:text-slate-400">{isRTL ? 'تاريخ ووقت المعاملة:' : 'Timestamp:'}</span>
                <span className="font-mono text-slate-700 dark:text-slate-300 font-semibold">
                  {formatAdminDate(selectedTrx.createdAt, isRTL ? 'ar' : 'en', isRTL)}
                </span>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-2">
              {/* Linked External Navigation Button */}
              {selectedTrx.referenceId && selectedTrx.referenceType === 'AUCTION' ? (
                <Link
                  to={ROUTES.AUCTION_DETAIL(selectedTrx.referenceId)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 transition-colors shadow-2xs"
                >
                  <Gavel className="w-3.5 h-3.5" />
                  <span>{isRTL ? 'فتح صفحة المزاد' : 'Open Auction'}</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              ) : selectedTrx.referenceId && selectedTrx.referenceType === 'ESCROW' ? (
                <Link
                  to={ROUTES.ESCROW_DETAIL(selectedTrx.referenceId)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 transition-colors shadow-2xs"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>{isRTL ? 'فتح صفحة الضمان' : 'Open Escrow'}</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              ) : (
                <div />
              )}

              <button
                type="button"
                onClick={() => setSelectedTrx(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer shadow-2xs"
              >
                {t('common.close', { defaultValue: isRTL ? 'إغلاق' : 'Close' })}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default TransactionsAuditTable;
