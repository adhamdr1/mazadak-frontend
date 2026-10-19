import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import {
  Search,
  X,
  ExternalLink,
  ShieldCheck,
  RotateCcw,
  Clock,
  Calendar,
  CheckCircle2,
  Scale,
  FileText,
} from 'lucide-react';
import { FilterDropdown } from '@/components/common/FilterDropdown';
import { RefreshButton } from '@/components/common/RefreshButton';
import { DateRangeFilter } from '@/components/common/DateRangeFilter';
import { Pagination } from '@/components/common/Pagination';
import { EmptyState } from '@/components/feedback/EmptyState';
import { Modal } from '@/components/common/Modal';
import { ROUTES } from '@/constants/routes.constants';
import {
  formatAdminCurrency,
  formatAdminDate,
  getEscrowStatusBadge,
  formatEscrowReleaseReason,
  isArabicText,
} from '../../utils/admin.utils';
import type { EscrowData, EscrowStatus } from '../../types/admin.types';

const ESCROW_STATUS_FILTERS: Array<{
  value: EscrowStatus | 'ALL';
  labelAr: string;
  labelEn: string;
}> = [
  { value: 'ALL', labelAr: 'كافة معاملات الضمان', labelEn: 'All Escrows' },
  { value: 'HELD', labelAr: 'محجوز بالأمانات', labelEn: 'Held in Escrow' },
  { value: 'RELEASED', labelAr: 'محرر للبائع', labelEn: 'Released to Seller' },
  { value: 'REFUNDED', labelAr: 'مسترد للمشتري', labelEn: 'Refunded to Buyer' },
];

export interface AdminEscrowsTableProps {
  escrows: EscrowData[];
  total?: number;
  totalPages: number;
  currentPage: number;
  isLoading: boolean;
  isRefetching: boolean;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  selectedStatus: EscrowStatus | 'ALL';
  onStatusChange: (status: EscrowStatus | 'ALL') => void;
  startDate?: string;
  endDate?: string;
  onDateRangeChange: (range: { startDate?: string; endDate?: string }) => void;
  onPageChange: (page: number) => void;
  onRefresh: () => void;
  onReleaseEscrow?: (escrowId: string, reason?: string) => Promise<void>;
  onRefundEscrow?: (escrowId: string, reason?: string) => Promise<void>;
  isProcessingAction?: boolean;
}

export const AdminEscrowsTable: React.FC<AdminEscrowsTableProps> = ({
  escrows,
  total,
  totalPages,
  currentPage,
  isLoading,
  isRefetching,
  searchQuery,
  onSearchChange,
  selectedStatus,
  onStatusChange,
  startDate,
  endDate,
  onDateRangeChange,
  onPageChange,
  onRefresh,
}) => {
  const { t, i18n } = useTranslation(['admin', 'common']);
  const isRTL = i18n.language?.startsWith('ar');

  const [selectedEscrowNotes, setSelectedEscrowNotes] = React.useState<EscrowData | null>(null);

  // Render escrows directly from server response (only active DISPUTED escrows belong in the Disputes table when browsing ALL)
  const displayEscrows = React.useMemo(
    () => (selectedStatus === 'ALL' ? escrows.filter((e) => e.status !== 'DISPUTED') : escrows),
    [escrows, selectedStatus]
  );

  const filterOptions = ESCROW_STATUS_FILTERS.map((s) => ({
    value: s.value,
    label: isRTL ? s.labelAr : s.labelEn,
  }));

  return (
    <div className="space-y-4">
      {/* 1. Header Filter Controls */}
      <div className="relative z-20 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-3 sm:p-4 shadow-xs">
        <div className="flex flex-col xl:flex-row items-stretch xl:items-center gap-2 sm:gap-2.5 w-full">
          {/* Search Input: Row 1 on < xl (Full Width for spacious placeholder), Flex-1 on xl */}
          <div className="relative w-full xl:flex-1 min-w-0">
            <Search className="w-4 h-4 text-slate-400 absolute start-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={t('escrow.table.searchPlaceholder', {
                defaultValue: isRTL
                  ? 'بحث باسم المستخدم، معرف الضمان، المزاد، أو سبب الصرف...'
                  : 'Search by user name, escrow ID, auction, or release reason...',
              })}
              className="w-full h-[38px] ps-10 pe-9 bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 shadow-2xs transition-all truncate"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                className="absolute end-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
                aria-label={t('common:actions.clear', { defaultValue: isRTL ? 'مسح' : 'Clear' })}
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Controls: Row 2 on < xl (fills row width evenly), inline on xl */}
          <div className="flex items-center gap-2 sm:gap-2.5 w-full xl:w-auto flex-nowrap shrink-0">
            {/* Standardized Reusable Filter Dropdown */}
            <div className="flex-1 min-w-0 xl:flex-initial xl:w-auto">
              <FilterDropdown
                value={selectedStatus}
                onChange={onStatusChange}
                options={filterOptions}
                icon={ShieldCheck}
                allValue="ALL"
              />
            </div>

            {/* Date Range Filter */}
            <div className="flex-1 min-w-0 xl:flex-initial xl:w-auto">
              <DateRangeFilter
                startDate={startDate}
                endDate={endDate}
                onChange={onDateRangeChange}
              />
            </div>

            {/* Refresh Button */}
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

      {/* 2. Main Standardized Centered Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-950/40 text-slate-500 dark:text-slate-400 font-bold uppercase text-[11px] sm:text-xs tracking-wider">
                <th className="py-3.5 px-4 text-center w-[20%] min-w-[150px] whitespace-nowrap">
                  {t('escrow.table.escrowAndAuction', { defaultValue: isRTL ? 'المزاد والضمان' : 'Auction & Escrow' })}
                </th>
                <th className="py-3.5 px-4 text-center w-[20%] min-w-[150px] whitespace-nowrap">
                  {t('escrow.table.parties', { defaultValue: isRTL ? 'الأطراف' : 'Parties' })}
                </th>
                <th className="py-3.5 px-4 text-center w-[18%] min-w-[120px] whitespace-nowrap">
                  {t('escrow.table.amount', { defaultValue: isRTL ? 'قيمة الضمان' : 'Escrow Amount' })}
                </th>
                <th className="py-3.5 px-4 text-center w-[20%] min-w-[140px] whitespace-nowrap">
                  {t('escrow.table.inspectionPeriod', { defaultValue: isRTL ? 'مهلة الفحص والتاريخ' : 'Timeline & Inspection' })}
                </th>
                <th className="py-3.5 px-4 text-center w-[22%] min-w-[150px] whitespace-nowrap">
                  {t('escrow.table.actions', { defaultValue: isRTL ? 'الحالة والمتابعة' : 'Status & Follow-up' })}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 font-normal">
              {isLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={`escrow-skel-${i}`} className="animate-pulse">
                    <td className="py-4 px-4 text-center">
                      <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-md w-28 mx-auto mb-1.5" />
                      <div className="h-3 bg-slate-100 dark:bg-slate-800/50 rounded-md w-20 mx-auto" />
                    </td>
                    <td className="py-4 px-4 text-center">
                      <div className="h-3.5 bg-slate-200 dark:bg-slate-800 rounded-md w-24 mx-auto mb-1.5" />
                      <div className="h-3.5 bg-slate-100 dark:bg-slate-800/50 rounded-md w-24 mx-auto" />
                    </td>
                    <td className="py-4 px-4 text-center">
                      <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded-md w-20 mx-auto" />
                    </td>
                    <td className="py-4 px-4 text-center">
                      <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-md w-24 mx-auto mb-1" />
                      <div className="h-3 bg-slate-100 dark:bg-slate-800/50 rounded-md w-16 mx-auto" />
                    </td>
                    <td className="py-4 px-4 text-center">
                      <div className="h-7 bg-slate-200 dark:bg-slate-800 rounded-full w-24 mx-auto" />
                    </td>
                  </tr>
                ))
              ) : displayEscrows.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 px-4 text-center">
                    <EmptyState
                      title={t('escrow.empty.title', { defaultValue: isRTL ? 'لا توجد معاملات ضمان' : 'No Escrow Contracts Found' })}
                      description={t('escrow.empty.description', {
                        defaultValue: isRTL
                          ? 'لم يتم العثور على أي معاملات ضمان مالي تطابق خيارات التصفية.'
                          : 'There are no escrow contracts matching the selected filter criteria.',
                      })}
                      icon={<ShieldCheck className="w-10 h-10 text-slate-400 dark:text-slate-600" />}
                    />
                  </td>
                </tr>
              ) : (
                displayEscrows.map((escrow) => {
                  const releaseInfo = formatEscrowReleaseReason(escrow.releaseReason, isRTL);
                  const hasDispute = Boolean(escrow.disputeId || releaseInfo.isDispute);

                  return (
                    <tr
                      key={escrow._id}
                      className="hover:bg-slate-50/70 dark:hover:bg-slate-800/30 transition-colors group"
                    >
                      {/* 1. Auction & Escrow Identifiers (Clean: strictly Auction + Escrow ID) */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <div className="flex flex-col items-center justify-center gap-1">
                          <Link
                            to={ROUTES.AUCTION_DETAIL(escrow.auctionId)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 font-mono text-xs font-bold text-amber-600 dark:text-amber-400 hover:text-amber-500 hover:underline"
                            title={t('escrow.table.viewAuction', {
                              defaultValue: isRTL ? 'معاينة صفحة المزاد' : 'View auction page',
                            })}
                          >
                            <bdi dir="ltr">#{escrow.auctionId.slice(-6).toUpperCase()}</bdi>
                            <ExternalLink className="w-3 h-3 shrink-0" />
                          </Link>
                          <div className="inline-flex items-center gap-1 text-[11px] text-slate-400">
                            <span>{t('escrow.table.escrowId', { defaultValue: isRTL ? 'الضمان:' : 'Escrow:' })}</span>
                            <Link
                              to={ROUTES.ESCROW_DETAIL(escrow._id)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-mono font-semibold text-slate-600 dark:text-slate-400 hover:text-amber-500 hover:underline inline-flex items-center gap-0.5"
                              title={t('escrow.table.viewEscrow', {
                                defaultValue: isRTL ? 'معاينة صفحة الضمان المالي' : 'View escrow record',
                              })}
                            >
                              <bdi dir="ltr">#{escrow._id.slice(-6).toUpperCase()}</bdi>
                              <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                            </Link>
                          </div>
                        </div>
                      </td>

                      {/* 2. Parties: Buyer & Seller */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <div className="inline-flex flex-col items-center justify-center gap-1.5">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded-md border border-blue-500/20">
                              {t('escrow.table.buyer', { defaultValue: isRTL ? 'المشتري' : 'Buyer' })}
                            </span>
                            <Link
                              to={ROUTES.USER_PUBLIC(escrow.buyerId)}
                              target="_blank"
                              className="font-mono text-xs text-slate-700 dark:text-slate-300 hover:text-amber-500 hover:underline"
                            >
                              <bdi dir="ltr">#{escrow.buyerId.slice(-6).toUpperCase()}</bdi>
                            </Link>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-md border border-emerald-500/20">
                              {t('escrow.table.seller', { defaultValue: isRTL ? 'البائع' : 'Seller' })}
                            </span>
                            <Link
                              to={ROUTES.USER_PUBLIC(escrow.sellerId)}
                              target="_blank"
                              className="font-mono text-xs text-slate-700 dark:text-slate-300 hover:text-amber-500 hover:underline"
                            >
                              <bdi dir="ltr">#{escrow.sellerId.slice(-6).toUpperCase()}</bdi>
                            </Link>
                          </div>
                        </div>
                      </td>

                      {/* 3. Escrow Amount (Clean currency without icon) */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap font-bold text-slate-900 dark:text-slate-100 text-xs sm:text-sm">
                        <span>{formatAdminCurrency(escrow.amount, escrow.currency || 'EGP', isRTL)}</span>
                      </td>

                      {/* 4. Timeline & Dates */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                        <div className="flex flex-col items-center justify-center gap-1">
                          <div className="inline-flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                            <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>
                              {formatAdminDate(escrow.createdAt, isRTL ? 'ar' : 'en', isRTL)}
                            </span>
                          </div>

                          {escrow.status === 'HELD' && escrow.inspectionPeriodEndsAt ? (
                            <div className="inline-flex items-center gap-1 text-[10px] text-amber-600 dark:text-amber-400 font-sans">
                              <Clock className="w-3 h-3 shrink-0" />
                              <span>
                                {t('escrow.table.inspectionEnds', { defaultValue: isRTL ? 'تنتهي المهلة:' : 'Inspection ends:' })}{' '}
                                {formatAdminDate(escrow.inspectionPeriodEndsAt, isRTL ? 'ar' : 'en', isRTL)}
                              </span>
                            </div>
                          ) : escrow.status === 'RELEASED' && escrow.releasedAt ? (
                            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-sans">
                              {t('escrow.table.releasedOn', { defaultValue: isRTL ? 'محرر في:' : 'Released on:' })}{' '}
                              {formatAdminDate(escrow.releasedAt, isRTL ? 'ar' : 'en', isRTL)}
                            </span>
                          ) : escrow.status === 'REFUNDED' && escrow.refundedAt ? (
                            <span className="text-[10px] text-blue-600 dark:text-blue-400 font-sans">
                              {t('escrow.table.refundedOn', { defaultValue: isRTL ? 'استُرد في:' : 'Refunded on:' })}{' '}
                              {formatAdminDate(escrow.refundedAt, isRTL ? 'ar' : 'en', isRTL)}
                            </span>
                          ) : null}
                        </div>
                      </td>

                      {/* 5. Status & Follow-up (Single Column: Status Chip + Clean Reason/Notes Button) */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <div className="flex flex-col items-center justify-center gap-1">
                          {escrow.status === 'RELEASED' ? (
                            <span
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200/80 dark:border-emerald-800/60"
                              title={t('escrow.actions.releasedTooltip', {
                                defaultValue: isRTL
                                  ? 'تم تحرير أموال الضمان وإيداعها في محفظة البائع'
                                  : 'Funds released and disbursed to seller wallet',
                              })}
                            >
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400 shrink-0" />
                              <span>{t('escrow.actions.released', { defaultValue: isRTL ? 'محرر للبائع' : 'Released' })}</span>
                            </span>
                          ) : escrow.status === 'REFUNDED' ? (
                            <span
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border border-blue-200/80 dark:border-blue-800/60"
                              title={t('escrow.actions.refundedTooltip', {
                                defaultValue: isRTL
                                  ? 'تم إرجاع أموال الضمان بالكامل إلى محفظة المشتري'
                                  : 'Funds refunded to buyer wallet',
                              })}
                            >
                              <RotateCcw className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                              <span>{t('escrow.actions.refunded', { defaultValue: isRTL ? 'مسترد للمشتري' : 'Refunded' })}</span>
                            </span>
                          ) : escrow.status === 'DISPUTED' ? (
                            <span
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-200/80 dark:border-rose-800/60"
                              title={t('escrow.actions.disputedTooltip', {
                                defaultValue: isRTL
                                  ? 'الضمان المالي معلق حالياً بسبب نزاع مفتوح بين الطرفين'
                                  : 'Escrow is currently suspended due to an open dispute',
                              })}
                            >
                              <Scale className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                              <span>{isRTL ? 'محل نزاع' : 'Disputed'}</span>
                            </span>
                          ) : (
                            <span
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium text-amber-700 dark:text-amber-400 bg-amber-500/10 border border-amber-500/20"
                              title={t('escrow.actions.holdingTooltip', {
                                defaultValue: isRTL
                                  ? 'أموال الضمان محجوزة بانتظار استلام المشتري أو انقضاء مهلة الفحص'
                                  : 'Funds held pending buyer confirmation or inspection expiry',
                              })}
                            >
                              <Clock className="w-3.5 h-3.5 text-amber-500" />
                              <span>{isRTL ? 'محجوز بالأمانات' : 'Held in Escrow'}</span>
                            </span>
                          )}

                          {/* Sub-item: Single [الملاحظات] button IF dispute/notes, OR release reason label */}
                          {hasDispute ? (
                            <button
                              type="button"
                              onClick={() => setSelectedEscrowNotes(escrow)}
                              className="h-6 px-2 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 text-[10px] font-bold inline-flex items-center gap-1 transition-all cursor-pointer shadow-2xs mt-0.5"
                              title={t('disputes.actions.viewNotes', {
                                defaultValue: isRTL ? 'عرض تقرير وملاحظات الإدارة' : 'View admin resolution notes',
                              })}
                            >
                              <FileText className="w-3 h-3" />
                              <span>{isRTL ? 'الملاحظات' : 'Notes'}</span>
                            </button>
                          ) : escrow.releaseReason ? (
                            <span
                              className="text-[10px] text-slate-500 dark:text-slate-400 font-medium text-center leading-tight px-1"
                              title={releaseInfo.label}
                            >
                              {releaseInfo.label}
                            </span>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* 3. Shared Standard Pagination */}
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

      {/* 4. Escrow Resolution & Findings Notes Modal */}
      {selectedEscrowNotes && (() => {
        const modalReleaseInfo = formatEscrowReleaseReason(selectedEscrowNotes.releaseReason, isRTL);
        const statusConfig = getEscrowStatusBadge(selectedEscrowNotes.status);
        const noteText =
          modalReleaseInfo.notes ||
          (modalReleaseInfo.label !== '—'
            ? modalReleaseInfo.label
            : isRTL
            ? 'لا توجد ملاحظات مدونة'
            : 'No notes recorded');
        const isArabicNote = isArabicText(noteText);

        return (
          <Modal
            isOpen={!!selectedEscrowNotes}
            onClose={() => setSelectedEscrowNotes(null)}
            title={
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-amber-500 shrink-0" />
                <span className="font-bold text-sm sm:text-base text-slate-900 dark:text-slate-100">
                  {isRTL ? 'حيثيات وتقرير تسوية الضمان المالي' : 'Escrow Resolution Audit Report'}
                </span>
              </div>
            }
            size="md"
          >
            <div className="space-y-4">
              {/* Header summary info */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">{isRTL ? 'معرف الضمان:' : 'Escrow ID:'}</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">
                    #{selectedEscrowNotes._id.slice(-8).toUpperCase()}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500">{isRTL ? 'المزاد المرتبط:' : 'Linked Auction:'}</span>
                  <Link
                    to={ROUTES.AUCTION_DETAIL(selectedEscrowNotes.auctionId)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono font-bold text-amber-600 dark:text-amber-400 hover:underline inline-flex items-center gap-1"
                  >
                    <span>#{selectedEscrowNotes.auctionId.slice(-8).toUpperCase()}</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500">{isRTL ? 'قيمة مبلغ الضمان:' : 'Escrow Amount:'}</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100">
                    {formatAdminCurrency(selectedEscrowNotes.amount, selectedEscrowNotes.currency || 'EGP', isRTL)}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500">{isRTL ? 'نتيجة التسوية المالية:' : 'Financial Settlement:'}</span>
                  <span
                    className={`font-bold ${
                      selectedEscrowNotes.status === 'RELEASED'
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : selectedEscrowNotes.status === 'REFUNDED'
                        ? 'text-blue-600 dark:text-blue-400'
                        : 'text-amber-600 dark:text-amber-400'
                    }`}
                  >
                    {isRTL ? statusConfig.labelAr : statusConfig.labelEn}
                  </span>
                </div>

                {selectedEscrowNotes.releasedAt && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">{isRTL ? 'تاريخ التحرير:' : 'Released At:'}</span>
                    <span className="font-mono text-slate-700 dark:text-slate-300">
                      {formatAdminDate(selectedEscrowNotes.releasedAt, isRTL ? 'ar' : 'en', isRTL)}
                    </span>
                  </div>
                )}

                {selectedEscrowNotes.refundedAt && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">{isRTL ? 'تاريخ الاسترداد:' : 'Refunded At:'}</span>
                    <span className="font-mono text-slate-700 dark:text-slate-300">
                      {formatAdminDate(selectedEscrowNotes.refundedAt, isRTL ? 'ar' : 'en', isRTL)}
                    </span>
                  </div>
                )}
              </div>

              {/* Notes content with dynamic text-direction and alignment */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                  {isRTL ? 'نص تقرير وملاحظات الإدارة التوثيقية:' : 'Administrative Findings & Reasoning:'}
                </label>
                <div
                  dir={isArabicNote ? 'rtl' : 'ltr'}
                  className={`p-4 rounded-xl bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/20 text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap select-text ${
                    isArabicNote ? 'text-right' : 'text-left'
                  }`}
                >
                  {noteText}
                </div>
              </div>

              {/* Footer actions matching AdminDisputesTable */}
              <div className="pt-2 flex items-center justify-between">
                {selectedEscrowNotes.disputeId ? (
                  <Link
                    to={ROUTES.DISPUTE_DETAIL(selectedEscrowNotes.disputeId)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-amber-600 dark:text-amber-400 hover:underline inline-flex items-center gap-1 font-semibold"
                  >
                    <span>{isRTL ? 'معاينة صفحة النزاع بالكامل' : 'Open Full Dispute Page'}</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                ) : (
                  <Link
                    to={ROUTES.ESCROW_DETAIL(selectedEscrowNotes._id)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-amber-600 dark:text-amber-400 hover:underline inline-flex items-center gap-1 font-semibold"
                  >
                    <span>{isRTL ? 'معاينة صفحة الضمان بالكامل' : 'Open Full Escrow Page'}</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                )}
                <button
                  type="button"
                  onClick={() => setSelectedEscrowNotes(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold cursor-pointer transition-colors"
                >
                  {t('common:actions.close', { defaultValue: isRTL ? 'إغلاق' : 'Close' })}
                </button>
              </div>
            </div>
          </Modal>
        );
      })()}
    </div>
  );
};
