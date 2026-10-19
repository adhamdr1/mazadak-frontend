import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Search,
  X,
  CreditCard,
  Building2,
  Smartphone,
  CheckCircle2,
  Clock,
  Ban,
  FileImage,
  Copy,
  Check,
  ExternalLink,
  RefreshCw,
  User,
  Calendar,
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
  formatAdminBankName,
  getWithdrawalStatusBadge,
  getPayoutMethodConfig,
  isArabicText,
} from '../../utils/admin.utils';
import { toLocalizedDigits } from '@/utils/formatters';
import type {
  WithdrawalResponse,
  WithdrawalStatus,
  PayoutMethod,
} from '../../types/admin.types';
import { cn } from '@/utils/cn';

const STATUS_OPTIONS: Array<{ value: WithdrawalStatus | 'ALL'; labelAr: string; labelEn: string }> = [
  { value: 'ALL', labelAr: 'كافة الحالات', labelEn: 'All Statuses' },
  { value: 'PENDING', labelAr: 'معلق بانتظار الإجراء', labelEn: 'Pending' },
  { value: 'PROCESSING', labelAr: 'قيد المعالجة المصرفية', labelEn: 'Processing' },
  { value: 'COMPLETED', labelAr: 'مكتمل ومصروف', labelEn: 'Completed' },
  { value: 'REJECTED', labelAr: 'مرفوض', labelEn: 'Rejected' },
  { value: 'CANCELLED', labelAr: 'ملغي من المستخدم', labelEn: 'Cancelled' },
];

const METHOD_OPTIONS: Array<{ value: PayoutMethod | 'ALL'; labelAr: string; labelEn: string }> = [
  { value: 'ALL', labelAr: 'كافة الوسائل', labelEn: 'All Methods' },
  { value: 'INSTAPAY', labelAr: 'انستاباي (InstaPay)', labelEn: 'InstaPay' },
  { value: 'BANK_ACCOUNT', labelAr: 'حساب بنكي', labelEn: 'Bank Account' },
  { value: 'VODAFONE_CASH', labelAr: 'فودافون كاش', labelEn: 'Vodafone Cash' },
  { value: 'ORANGE_CASH', labelAr: 'أورنج كاش', labelEn: 'Orange Cash' },
  { value: 'ETISALAT_CASH', labelAr: 'اتصالات كاش', labelEn: 'Etisalat Cash' },
  { value: 'WE_PAY', labelAr: 'وي باي (WE Pay)', labelEn: 'WE Pay' },
];

export interface WithdrawalsTableProps {
  withdrawals: WithdrawalResponse[];
  total?: number;
  totalPages: number;
  currentPage: number;
  isLoading: boolean;
  isRefetching: boolean;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  selectedStatus: WithdrawalStatus | 'ALL';
  onStatusChange: (status: WithdrawalStatus | 'ALL') => void;
  selectedMethod: PayoutMethod | 'ALL';
  onMethodChange: (method: PayoutMethod | 'ALL') => void;
  startDate?: string;
  endDate?: string;
  onDateRangeChange: (range: { startDate?: string; endDate?: string }) => void;
  onPageChange: (page: number) => void;
  onRefresh: () => void;
  onStartProcessing: (requestId: string) => Promise<unknown>;
  isStartingProcessing: boolean;
  onOpenCompleteModal: (item: WithdrawalResponse) => void;
  onOpenRejectModal: (item: WithdrawalResponse) => void;
}

export const WithdrawalsTable: React.FC<WithdrawalsTableProps> = ({
  withdrawals,
  total = 0,
  totalPages,
  currentPage,
  isLoading,
  isRefetching,
  searchQuery,
  onSearchChange,
  selectedStatus,
  onStatusChange,
  selectedMethod,
  onMethodChange,
  startDate,
  endDate,
  onDateRangeChange,
  onPageChange,
  onRefresh,
  onStartProcessing,
  isStartingProcessing,
  onOpenCompleteModal,
  onOpenRejectModal,
}) => {
  const { t, i18n } = useTranslation(['admin', 'common']);
  const isRTL = i18n.language?.startsWith('ar');

  const [localSearch, setLocalSearch] = useState(searchQuery);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [selectedReceipt, setSelectedReceipt] = useState<{ url: string; ref?: string | null } | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);

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

  const handleStartProcessingClick = async (requestId: string) => {
    try {
      setProcessingId(requestId);
      await onStartProcessing(requestId);
    } finally {
      setProcessingId(null);
    }
  };

  const handleClearFilters = () => {
    setLocalSearch('');
    onSearchChange('');
    onStatusChange('ALL');
    onMethodChange('ALL');
    onDateRangeChange({ startDate: undefined, endDate: undefined });
  };

  const hasActiveFilters =
    searchQuery.trim() !== '' ||
    selectedStatus !== 'ALL' ||
    selectedMethod !== 'ALL' ||
    Boolean(startDate || endDate);

  return (
    <div className="space-y-4">
      {/* 1. Filter & Search Controls Bar */}
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
                isRTL
                  ? 'بحث بالسيرفر بالاسم، الهاتف، الآيبان، الحساب، أو المعرف...'
                  : 'Server search by recipient, phone, IBAN, account, or ID...'
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
              {/* Status Dropdown */}
              <div className="flex-1 min-w-0 xl:flex-initial xl:w-auto">
                <FilterDropdown
                  value={selectedStatus}
                  onChange={(val) => onStatusChange(val as WithdrawalStatus | 'ALL')}
                  options={STATUS_OPTIONS.map((opt) => ({
                    value: opt.value,
                    label: isRTL ? opt.labelAr : opt.labelEn,
                  }))}
                  icon={Clock}
                  allValue="ALL"
                />
              </div>

              {/* Method Dropdown */}
              <div className="flex-1 min-w-0 xl:flex-initial xl:w-auto">
                <FilterDropdown
                  value={selectedMethod}
                  onChange={(val) => onMethodChange(val as PayoutMethod | 'ALL')}
                  options={METHOD_OPTIONS.map((opt) => ({
                    value: opt.value,
                    label: isRTL ? opt.labelAr : opt.labelEn,
                  }))}
                  icon={Building2}
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

        {/* Syncing Status Indicator if actively refetching */}
        {isRefetching && (
          <div className="flex items-center justify-end text-[11px] font-bold text-amber-500 px-1 animate-pulse">
            <span className="flex items-center gap-1">
              <RefreshCw className="w-3 h-3 animate-spin" />
              {isRTL ? 'جاري مزامنة السجلات مع الخادم...' : 'Syncing records with server...'}
            </span>
          </div>
        )}
      </div>

      {/* 2. Main Data Table with Center Column Architecture */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-950/40 text-slate-500 dark:text-slate-400 font-bold uppercase text-[11px] sm:text-xs tracking-wider">
                <th className="py-3.5 px-4 text-center whitespace-nowrap">
                  {isRTL ? 'المستخدم والطلب' : 'User & Request'}
                </th>
                <th className="py-3.5 px-4 text-center whitespace-nowrap">
                  {isRTL ? 'وسيلة التحويل' : 'Payout Method'}
                </th>
                <th className="py-3.5 px-4 text-center whitespace-nowrap">
                  {isRTL ? 'المبلغ الصافي' : 'Net Disbursal'}
                </th>
                <th className="py-3.5 px-4 text-center whitespace-nowrap">
                  {isRTL ? 'بيانات التحويل' : 'Transfer Details'}
                </th>
                <th className="py-3.5 px-4 text-center whitespace-nowrap">
                  {isRTL ? 'حالة الطلب' : 'Status'}
                </th>
                <th className="py-3.5 px-4 text-center whitespace-nowrap">
                  {isRTL ? 'تاريخ التقديم' : 'Date Opened'}
                </th>
                <th className="py-3.5 px-4 text-center whitespace-nowrap">
                  {isRTL ? 'الإجراء الإداري' : 'Action'}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 font-normal">
              {isLoading && withdrawals.length === 0 ? (
                // 5 Skeleton rows matching 7 centered columns (no layout shift / flashing)
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={`withdrawal-skel-${i}`} className="animate-pulse">
                    <td className="py-4 px-4 text-center">
                      <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-md w-20 mx-auto mb-1.5" />
                      <div className="h-3 bg-slate-100 dark:bg-slate-800/50 rounded-md w-28 mx-auto" />
                    </td>
                    <td className="py-4 px-4 text-center">
                      <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded-xl w-24 mx-auto" />
                    </td>
                    <td className="py-4 px-4 text-center">
                      <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-md w-24 mx-auto mb-1" />
                      <div className="h-3 bg-slate-100 dark:bg-slate-800/50 rounded-md w-16 mx-auto" />
                    </td>
                    <td className="py-4 px-4 text-center">
                      <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-md w-32 mx-auto mb-1" />
                      <div className="h-3 bg-slate-100 dark:bg-slate-800/50 rounded-md w-20 mx-auto" />
                    </td>
                    <td className="py-4 px-4 text-center">
                      <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded-xl w-20 mx-auto" />
                    </td>
                    <td className="py-4 px-4 text-center">
                      <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-md w-24 mx-auto" />
                    </td>
                    <td className="py-4 px-4 text-center">
                      <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded-xl w-28 mx-auto" />
                    </td>
                  </tr>
                ))
              ) : withdrawals.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 px-4 text-center">
                    <EmptyState
                      title={
                        hasActiveFilters
                          ? isRTL
                            ? 'لم يتم العثور على أي طلبات سحب'
                            : 'No matching withdrawal requests found'
                          : isRTL
                          ? 'لا توجد طلبات سحب حالياً'
                          : 'No withdrawal requests recorded'
                      }
                      description={
                        hasActiveFilters
                          ? isRTL
                            ? 'جرّب تعديل مصطلحات البحث أو تغيير فلاتر الحالة ووسيلة الصرف.'
                            : 'Try adjusting your search terms or clearing status/method filters.'
                          : isRTL
                          ? 'ستظهر هنا كافة طلبات سحب الأرباح فور تقديم المستخدمين لطلبات جديدة.'
                          : 'User withdrawal payout requests will appear here in real-time.'
                      }
                      action={
                        hasActiveFilters
                          ? {
                              label: isRTL ? 'إلغاء الفلاتر' : 'Clear Filters',
                              onClick: handleClearFilters,
                            }
                          : undefined
                      }
                    />
                  </td>
                </tr>
              ) : (
                withdrawals.map((item) => {
                  const statusBadge = getWithdrawalStatusBadge(item.status);
                  const methodConfig = getPayoutMethodConfig(item.payoutMethod, isRTL);
                  const details = item.payoutDetails;
                  const isProcessingThis = processingId === item._id && isStartingProcessing;

                  return (
                    <tr
                      key={item._id}
                      className="hover:bg-slate-50/70 dark:hover:bg-slate-800/30 transition-colors"
                    >
                      {/* 1. User & Request */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <div className="flex flex-col items-center justify-center gap-1">
                          <span className="font-mono text-xs font-bold text-slate-900 dark:text-white select-all">
                            <bdi dir="ltr">#{item._id.slice(-6).toUpperCase()}</bdi>
                          </span>
                          <Link
                            to={ROUTES.USER_PUBLIC(item.userId)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] text-slate-600 dark:text-slate-400 hover:text-amber-500 hover:underline max-w-[150px] truncate"
                            title={isRTL ? 'معاينة الملف الشخصي للمستخدم' : 'View user public profile'}
                          >
                            <User className="w-3 h-3 text-slate-400 shrink-0" />
                            <span className="truncate">
                              {details?.accountHolderName || `#${item.userId.slice(-6).toUpperCase()}`}
                            </span>
                            <ExternalLink className="w-2.5 h-2.5 opacity-60 shrink-0" />
                          </Link>
                        </div>
                      </td>

                      {/* 2. Payout Method */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center">
                          <span
                            className={cn(
                              'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl font-bold border text-[11px]',
                              methodConfig.badgeClass
                            )}
                          >
                            {methodConfig.type === 'BANK' && <Building2 className="w-3.5 h-3.5 shrink-0" />}
                            {methodConfig.type === 'INSTAPAY' && <CreditCard className="w-3.5 h-3.5 shrink-0" />}
                            {methodConfig.type === 'WALLET' && <Smartphone className="w-3.5 h-3.5 shrink-0" />}
                            <span>{methodConfig.label}</span>
                          </span>
                        </div>
                      </td>

                      {/* 3. Net & Gross Amount */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <div className="flex flex-col items-center justify-center gap-0.5">
                          <span className="text-sm font-black text-emerald-600 dark:text-emerald-400 tracking-tight">
                            {formatAdminCurrency(item.netAmount, item.currency, isRTL)}
                          </span>
                          <span className="text-[10px] font-semibold text-slate-400">
                            {isRTL ? 'الأصل:' : 'Gross:'} {formatAdminCurrency(item.amount, item.currency, isRTL)}
                            {Number(item.fee) > 0 && ` (${isRTL ? 'رسوم' : 'fee'}: ${formatAdminCurrency(item.fee, item.currency, isRTL)})`}
                          </span>
                        </div>
                      </td>

                      {/* 4. Bank / Account Details */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <div className="flex flex-col items-center justify-center gap-1 mx-auto whitespace-nowrap text-center">
                          {details?.bankName && (
                            <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 whitespace-nowrap">
                              {formatAdminBankName(details.bankName, isRTL)}
                            </span>
                          )}

                          {details?.iban && (
                            <div className="flex items-center justify-center gap-1.5 text-[11px] font-mono text-slate-600 dark:text-slate-400 whitespace-nowrap">
                              <span className="select-all whitespace-nowrap font-mono tracking-wider">
                                {details.iban}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleCopy(details.iban || '', `iban-${item._id}`)}
                                title={isRTL ? 'نسخ الآيبان' : 'Copy IBAN'}
                                className="p-0.5 text-slate-400 hover:text-amber-500 shrink-0 cursor-pointer transition-colors"
                              >
                                {copiedKey === `iban-${item._id}` ? (
                                  <Check className="w-3 h-3 text-emerald-500" />
                                ) : (
                                  <Copy className="w-3 h-3" />
                                )}
                              </button>
                            </div>
                          )}

                          {details?.accountNumber && !details?.iban && (
                            <div className="flex items-center justify-center gap-1.5 text-[11px] font-mono text-slate-600 dark:text-slate-400 whitespace-nowrap">
                              <span className="select-all whitespace-nowrap">
                                <span className="text-slate-400 font-sans">{isRTL ? 'حساب: ' : 'Acc: '}</span>
                                {toLocalizedDigits(details.accountNumber, isRTL)}
                              </span>
                              <button
                                type="button"
                                onClick={() =>
                                  handleCopy(details.accountNumber || '', `acc-${item._id}`)
                                }
                                title={isRTL ? 'نسخ رقم الحساب' : 'Copy Account Number'}
                                className="p-0.5 text-slate-400 hover:text-amber-500 shrink-0 cursor-pointer transition-colors"
                              >
                                {copiedKey === `acc-${item._id}` ? (
                                  <Check className="w-3 h-3 text-emerald-500" />
                                ) : (
                                  <Copy className="w-3 h-3" />
                                )}
                              </button>
                            </div>
                          )}

                          {details?.ipaAddress && (
                            <div className="flex items-center justify-center gap-1.5 text-[11px] font-mono font-bold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                              <span className="select-all whitespace-nowrap font-mono">
                                {details.ipaAddress}
                              </span>
                              <button
                                type="button"
                                onClick={() =>
                                  handleCopy(details.ipaAddress || '', `ipa-${item._id}`)
                                }
                                title={isRTL ? 'نسخ عنوان انستاباي' : 'Copy IPA'}
                                className="p-0.5 text-slate-400 hover:text-emerald-500 shrink-0 cursor-pointer transition-colors"
                              >
                                {copiedKey === `ipa-${item._id}` ? (
                                  <Check className="w-3 h-3 text-emerald-500" />
                                ) : (
                                  <Copy className="w-3 h-3" />
                                )}
                              </button>
                            </div>
                          )}

                          {details?.phoneNumber && (
                            <div className="flex items-center justify-center gap-1.5 text-[11px] font-mono text-slate-600 dark:text-slate-400 whitespace-nowrap">
                              <span className="select-all whitespace-nowrap" dir="ltr">
                                {toLocalizedDigits(details.phoneNumber, isRTL)}
                              </span>
                              <button
                                type="button"
                                onClick={() =>
                                  handleCopy(details.phoneNumber || '', `phone-${item._id}`)
                                }
                                title={isRTL ? 'نسخ رقم الهاتف' : 'Copy Phone'}
                                className="p-0.5 text-slate-400 hover:text-amber-500 shrink-0 cursor-pointer transition-colors"
                              >
                                {copiedKey === `phone-${item._id}` ? (
                                  <Check className="w-3 h-3 text-emerald-500" />
                                ) : (
                                  <Copy className="w-3 h-3" />
                                )}
                              </button>
                            </div>
                          )}

                          {!details?.bankName &&
                            !details?.accountNumber &&
                            !details?.iban &&
                            !details?.ipaAddress &&
                            !details?.phoneNumber && (
                              <span className="text-slate-400 text-xs">—</span>
                            )}
                        </div>
                      </td>

                      {/* 5. Status Badge & Details */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <div className="flex flex-col items-center justify-center gap-1">
                          <span
                            className={cn(
                              'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[10px] font-black border tracking-wider',
                              statusBadge.bgClass
                            )}
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-current shrink-0" />
                            <span>{isRTL ? statusBadge.labelAr : statusBadge.labelEn}</span>
                          </span>

                          {item.adminReference && (
                            <span className="text-[10px] font-mono text-slate-400">
                              {isRTL ? 'مرجع:' : 'Ref:'} {item.adminReference}
                            </span>
                          )}

                          {item.receiptUrl && (
                            <button
                              type="button"
                              onClick={() =>
                                setSelectedReceipt({
                                  url: item.receiptUrl || '',
                                  ref: item.adminReference,
                                })
                              }
                              className="text-[10px] font-bold text-amber-500 hover:underline inline-flex items-center gap-0.5 cursor-pointer"
                            >
                              <FileImage className="w-3 h-3" />
                              <span>{isRTL ? 'عرض الإيصال' : 'View receipt'}</span>
                            </button>
                          )}

                          {item.rejectionReason && (
                            <div
                              dir={isArabicText(item.rejectionReason) ? 'rtl' : 'ltr'}
                              className="text-[10px] text-rose-500/90 line-clamp-1 italic max-w-[140px] text-center"
                              title={item.rejectionReason}
                            >
                              {item.rejectionReason}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* 6. Created Date */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                        <div className="flex items-center justify-center gap-1.5 text-slate-600 dark:text-slate-300">
                          <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{formatAdminDate(item.createdAt, isRTL ? 'ar' : 'en', isRTL)}</span>
                        </div>
                      </td>

                      {/* 7. Administrative Actions */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5">
                          {item.status === 'PENDING' && (
                            <>
                              <button
                                type="button"
                                onClick={() => handleStartProcessingClick(item._id)}
                                disabled={isProcessingThis}
                                className={cn(
                                  'h-8 px-3 rounded-xl border border-blue-500/30 hover:border-blue-500/50',
                                  'bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400',
                                  'text-xs font-bold transition-all cursor-pointer shadow-2xs',
                                  'inline-flex items-center gap-1.5 disabled:opacity-50 active:scale-98'
                                )}
                              >
                                {isProcessingThis ? (
                                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-500" />
                                ) : (
                                  <Clock className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                                )}
                                <span>{isRTL ? 'بدء المعالجة' : 'Process'}</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => onOpenRejectModal(item)}
                                className="h-8 px-2.5 rounded-xl border border-rose-500/30 hover:border-rose-500/50 bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-bold transition-all cursor-pointer shadow-2xs inline-flex items-center gap-1 active:scale-98"
                              >
                                <Ban className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                                <span>{isRTL ? 'رفض' : 'Reject'}</span>
                              </button>
                            </>
                          )}

                          {item.status === 'PROCESSING' && (
                            <>
                              <button
                                type="button"
                                onClick={() => onOpenCompleteModal(item)}
                                className={cn(
                                  'h-8 px-3 rounded-xl border border-emerald-500/30 hover:border-emerald-500/50',
                                  'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400',
                                  'text-xs font-bold transition-all cursor-pointer shadow-2xs',
                                  'inline-flex items-center gap-1.5 active:scale-98'
                                )}
                              >
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                                <span>{isRTL ? 'إتمام وصرف' : 'Disburse'}</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => onOpenRejectModal(item)}
                                className="h-8 px-2.5 rounded-xl border border-rose-500/30 hover:border-rose-500/50 bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-bold transition-all cursor-pointer shadow-2xs inline-flex items-center gap-1 active:scale-98"
                              >
                                <Ban className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                                <span>{isRTL ? 'رفض' : 'Reject'}</span>
                              </button>
                            </>
                          )}

                          {item.status === 'COMPLETED' && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200/80 dark:border-emerald-800/60">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400 shrink-0" />
                              <span>{isRTL ? 'تم الصرف' : 'Disbursed'}</span>
                            </span>
                          )}

                          {item.status === 'REJECTED' && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60">
                              <Ban className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                              <span>{isRTL ? 'طلب مرفوض' : 'Rejected'}</span>
                            </span>
                          )}

                          {item.status === 'CANCELLED' && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60">
                              <span>{isRTL ? 'ملغي من المستخدم' : 'Cancelled'}</span>
                            </span>
                          )}
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

      {/* 4. Receipt Image Viewer Modal */}
      {selectedReceipt && (
        <Modal
          isOpen={!!selectedReceipt}
          onClose={() => setSelectedReceipt(null)}
          size="lg"
          title={
            <div className="flex items-center gap-2">
              <FileImage className="w-5 h-5 text-amber-500" />
              <span>{isRTL ? 'إيصال التحويل المصرفي' : 'Bank Transfer Receipt'}</span>
            </div>
          }
        >
          <div className="space-y-3 pt-2">
            {selectedReceipt.ref && (
              <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-900 border text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
                {isRTL ? 'رقم المرجع المصرفي:' : 'Bank Reference:'} {selectedReceipt.ref}
              </div>
            )}
            <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950 max-h-[70vh] flex items-center justify-center">
              <img
                src={selectedReceipt.url}
                alt="Receipt Full Preview"
                className="max-h-[65vh] w-auto object-contain rounded-xl"
              />
            </div>
            <div className="flex justify-between items-center pt-2">
              <a
                href={selectedReceipt.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-amber-600 dark:text-amber-400 hover:bg-amber-500/10 transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>{isRTL ? 'فتح الصورة بالحجم الكامل' : 'Open full resolution'}</span>
              </a>
              <button
                type="button"
                onClick={() => setSelectedReceipt(null)}
                className="px-4 py-1.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 transition-colors"
              >
                {t('common.close', { defaultValue: 'إغلاق' })}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default WithdrawalsTable;
