import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import {
  Search,
  X,
  Scale,
  Calendar,
  FileText,
  Eye,
  CheckCircle2,
  Ban,
  ExternalLink,
} from 'lucide-react';
import { FilterDropdown } from '@/components/common/FilterDropdown';
import { RefreshButton } from '@/components/common/RefreshButton';
import { DateRangeFilter } from '@/components/common/DateRangeFilter';
import { Pagination } from '@/components/common/Pagination';
import { EmptyState } from '@/components/feedback/EmptyState';
import { Modal } from '@/components/common/Modal';
import { ROUTES } from '@/constants/routes.constants';
import { DisputeEvidenceGallery } from '@/features/escrow';
import {
  formatAdminDate,
  getDisputeStatusBadge,
  getDisputeReasonLabel,
  isArabicText,
} from '../../utils/admin.utils';
import type { DisputeData, DisputeStatus } from '../../types/admin.types';

const STATUS_FILTERS: Array<{ value: DisputeStatus | 'ALL'; labelAr: string; labelEn: string }> = [
  { value: 'ALL', labelAr: 'كافة النزاعات', labelEn: 'All Disputes' },
  { value: 'OPEN', labelAr: 'نزاعات مفتوحة', labelEn: 'Open' },
  { value: 'UNDER_REVIEW', labelAr: 'قيد المراجعة', labelEn: 'Under Review' },
  { value: 'RESOLVED_BUYER_REFUNDED', labelAr: 'مسترد للمشتري', labelEn: 'Buyer Refunded' },
  { value: 'RESOLVED_SELLER_PAID', labelAr: 'مصروف للبائع', labelEn: 'Seller Paid' },
  { value: 'CANCELLED', labelAr: 'ملغية', labelEn: 'Cancelled' },
];

export interface AdminDisputesTableProps {
  disputes: DisputeData[];
  total?: number;
  totalPages: number;
  currentPage: number;
  isLoading: boolean;
  isRefetching: boolean;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  selectedStatus: DisputeStatus | 'ALL';
  onStatusChange: (status: DisputeStatus | 'ALL') => void;
  startDate?: string;
  endDate?: string;
  onDateRangeChange: (range: { startDate?: string; endDate?: string }) => void;
  onPageChange: (page: number) => void;
  onRefresh: () => void;
  onResolveDispute: (dispute: DisputeData) => void;
  onMarkUnderReview?: (dispute: DisputeData) => void;
  isMarkingReview?: boolean;
}

export const AdminDisputesTable: React.FC<AdminDisputesTableProps> = ({
  disputes,
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
  onResolveDispute,
  onMarkUnderReview,
  isMarkingReview = false,
}) => {
  const { t, i18n } = useTranslation(['admin', 'common']);
  const isRTL = i18n.language?.startsWith('ar');

  const [selectedEvidenceDispute, setSelectedEvidenceDispute] = useState<DisputeData | null>(null);
  const [selectedNotesDispute, setSelectedNotesDispute] = useState<DisputeData | null>(null);

  // Close evidence modal on ESC key (only if gallery lightbox is not currently active)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        const isLightboxActive = Boolean(document.querySelector('[role="dialog"][class*="9999"]'));
        if (!isLightboxActive && selectedEvidenceDispute) {
          setSelectedEvidenceDispute(null);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedEvidenceDispute]);

  const filterOptions = STATUS_FILTERS.map((s) => ({
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
              placeholder={t('disputes.table.searchPlaceholder', {
                defaultValue: isRTL
                  ? 'بحث باسم المستخدم، معرف النزاع، المزاد، أو بيان الشكوى...'
                  : 'Search by user name, dispute ID, auction, or complaint...',
              })}
              className="w-full h-[38px] ps-10 pe-9 bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 shadow-2xs transition-all truncate"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                className="absolute end-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
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
                icon={Scale}
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

            {/* Standardized Shared Refresh Button */}
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

      {/* 2. Main High-Density Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-950/40 text-slate-500 dark:text-slate-400 font-bold uppercase text-[11px] sm:text-xs tracking-wider">
                <th className="py-3.5 px-4 text-center w-[18%] min-w-[150px] whitespace-nowrap">
                  {t('disputes.table.disputeAndAuction', { defaultValue: isRTL ? 'المزاد والنزاع' : 'Auction & Dispute' })}
                </th>
                <th className="py-3.5 px-4 text-center w-[18%] min-w-[150px] whitespace-nowrap">
                  {t('disputes.table.parties', { defaultValue: isRTL ? 'الأطراف' : 'Parties' })}
                </th>
                <th className="py-3.5 px-4 text-center w-[22%] min-w-[180px] whitespace-nowrap">
                  {t('disputes.table.reason', { defaultValue: isRTL ? 'السبب' : 'Reason' })}
                </th>
                <th className="py-3.5 px-4 text-center w-[14%] min-w-[120px] whitespace-nowrap">
                  {t('disputes.table.status', { defaultValue: isRTL ? 'الحالة' : 'Status' })}
                </th>
                <th className="py-3.5 px-4 text-center w-[13%] min-w-[110px] whitespace-nowrap">
                  {t('disputes.table.createdAt', { defaultValue: isRTL ? 'تاريخ الفتح' : 'Date Opened' })}
                </th>
                <th className="py-3.5 px-4 text-center w-[15%] min-w-[140px] whitespace-nowrap">
                  {t('disputes.table.actions', { defaultValue: isRTL ? 'الإجراءات' : 'Actions' })}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 font-normal">
              {isLoading ? (
                // Skeleton loading state
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={`dispute-skel-${i}`} className="animate-pulse">
                    <td className="py-4 px-4 text-center">
                      <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-md w-24 mx-auto mb-1.5" />
                      <div className="h-3 bg-slate-100 dark:bg-slate-800/50 rounded-md w-16 mx-auto" />
                    </td>
                    <td className="py-4 px-4 text-center">
                      <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-md w-24 mx-auto mb-1.5" />
                      <div className="h-4 bg-slate-100 dark:bg-slate-800/50 rounded-md w-24 mx-auto" />
                    </td>
                    <td className="py-4 px-4 text-center">
                      <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded-lg w-28 mx-auto mb-1" />
                      <div className="h-3 bg-slate-100 dark:bg-slate-800/50 rounded-md w-36 mx-auto" />
                    </td>
                    <td className="py-4 px-4 text-center">
                      <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded-xl w-24 mx-auto" />
                    </td>
                    <td className="py-4 px-4 text-center">
                      <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-md w-20 mx-auto" />
                    </td>
                    <td className="py-4 px-4 text-center">
                      <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded-xl w-24 mx-auto" />
                    </td>
                  </tr>
                ))
              ) : disputes.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 px-4 text-center">
                    <EmptyState
                      title={t('disputes.empty.title', {
                        defaultValue: isRTL ? 'لا توجد نزاعات حالياً' : 'No disputes found',
                      })}
                      description={t('disputes.empty.description', {
                        defaultValue: isRTL
                          ? 'لم يتم العثور على أي ملفات نزاع تطابق خيارات التصفية الحالية.'
                          : 'No dispute cases matching the current filter criteria were found.',
                      })}
                      icon={<Scale className="w-10 h-10 text-slate-400 dark:text-slate-600" />}
                    />
                  </td>
                </tr>
              ) : (
                disputes.map((dispute) => {
                  const statusBadge = getDisputeStatusBadge(dispute.status);
                  const isResolvable =
                    dispute.status === 'OPEN' || dispute.status === 'UNDER_REVIEW';

                  return (
                    <tr
                      key={dispute._id}
                      className="hover:bg-slate-50/70 dark:hover:bg-slate-800/30 transition-colors group"
                    >
                      {/* 1. Auction & Dispute Identifiers */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <div className="flex flex-col items-center justify-center gap-1">
                          <Link
                            to={ROUTES.AUCTION_DETAIL(dispute.auctionId)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 font-mono text-xs font-bold text-amber-600 dark:text-amber-400 hover:text-amber-500 hover:underline"
                            title={t('disputes.table.viewAuction', {
                              defaultValue: isRTL ? 'معاينة صفحة المزاد' : 'View auction page',
                            })}
                          >
                            <bdi dir="ltr">#{dispute.auctionId.slice(-6).toUpperCase()}</bdi>
                            <ExternalLink className="w-3 h-3 shrink-0" />
                          </Link>
                          <div className="inline-flex items-center gap-1 text-[11px] text-slate-400">
                            <span>{t('disputes.table.disputeId', { defaultValue: isRTL ? 'النزاع:' : 'Dispute:' })}</span>
                            <Link
                              to={ROUTES.DISPUTE_DETAIL(dispute._id)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-mono font-semibold text-slate-600 dark:text-slate-400 hover:text-amber-500 hover:underline inline-flex items-center gap-0.5"
                              title={t('disputes.table.viewDispute', {
                                defaultValue: isRTL ? 'معاينة صفحة تفاصيل النزاع' : 'View dispute detail page',
                              })}
                            >
                              <bdi dir="ltr">#{dispute._id.slice(-6).toUpperCase()}</bdi>
                              <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                            </Link>
                          </div>
                        </div>
                      </td>

                      {/* 2. Disputing Parties */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <div className="inline-flex flex-col items-center justify-center gap-1.5">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded-md border border-rose-500/20">
                              {t('disputes.table.claimant', { defaultValue: isRTL ? 'المدعي' : 'Claimant' })}
                            </span>
                            <Link
                              to={ROUTES.USER_PUBLIC(dispute.openedById)}
                              target="_blank"
                              className="font-mono text-xs text-slate-700 dark:text-slate-300 hover:text-amber-500 hover:underline"
                            >
                              <bdi dir="ltr">#{dispute.openedById.slice(-6).toUpperCase()}</bdi>
                            </Link>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-md border border-slate-200 dark:border-slate-700">
                              {t('disputes.table.respondent', { defaultValue: isRTL ? 'المدعى عليه' : 'Respondent' })}
                            </span>
                            <Link
                              to={ROUTES.USER_PUBLIC(dispute.againstUserId)}
                              target="_blank"
                              className="font-mono text-xs text-slate-700 dark:text-slate-300 hover:text-amber-500 hover:underline"
                            >
                              <bdi dir="ltr">#{dispute.againstUserId.slice(-6).toUpperCase()}</bdi>
                            </Link>
                          </div>
                        </div>
                      </td>

                      {/* 3. Reason & Description */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex flex-col items-center justify-center gap-1.5 max-w-[210px] mx-auto">
                          <span className="inline-block px-2.5 py-0.5 rounded-lg text-[11px] font-bold bg-slate-100 dark:bg-slate-800/80 text-slate-800 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700/60 truncate max-w-full">
                            {getDisputeReasonLabel(dispute.reason, isRTL)}
                          </span>
                          {dispute.description && (
                            <p
                              className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-full text-center font-normal"
                              title={dispute.description}
                            >
                              {dispute.description}
                            </p>
                          )}
                          {dispute.evidenceUrls && dispute.evidenceUrls.length > 0 && (
                            <button
                              type="button"
                              onClick={() => setSelectedEvidenceDispute(dispute)}
                              className="mt-0.5 inline-flex items-center gap-1 text-[11px] text-amber-600 dark:text-amber-400 hover:text-amber-500 hover:underline cursor-pointer font-bold"
                            >
                              <Eye className="w-3 h-3" />
                              <span>
                                {t('disputes.table.viewEvidence', {
                                  count: dispute.evidenceUrls.length,
                                  defaultValue: isRTL
                                    ? `الأدلة (${dispute.evidenceUrls.length})`
                                    : `Evidence (${dispute.evidenceUrls.length})`,
                                })}
                              </span>
                            </button>
                          )}
                        </div>
                      </td>

                      {/* 4. Status */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <div className="flex flex-col items-center justify-center gap-1">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[10px] font-black border ${statusBadge.bgClass}`}
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-current shrink-0" />
                            <span>{isRTL ? statusBadge.labelAr : statusBadge.labelEn}</span>
                          </span>

                          {dispute.adminDecision && (
                            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
                              {dispute.adminDecision === 'REFUND_BUYER'
                                ? (isRTL ? 'قرار: رد للمشتري' : 'Ruled: Refund Buyer')
                                : (isRTL ? 'قرار: صرف للبائع' : 'Ruled: Pay Seller')}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* 5. Created Date */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                        <div className="flex flex-col items-center justify-center gap-0.5">
                          <div className="inline-flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                            <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>
                              {formatAdminDate(dispute.createdAt, isRTL ? 'ar' : 'en', isRTL)}
                            </span>
                          </div>
                          {dispute.resolvedAt && (
                            <span className="text-[10px] text-emerald-600 dark:text-emerald-400">
                              {t('disputes.table.resolvedOn', { defaultValue: isRTL ? 'تم الحل في:' : 'Resolved on:' })}{' '}
                              {formatAdminDate(dispute.resolvedAt, isRTL ? 'ar' : 'en', isRTL)}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* 6. Actions */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5">
                          {dispute.status === 'OPEN' && onMarkUnderReview && (
                            <button
                              type="button"
                              onClick={() => onMarkUnderReview(dispute)}
                              disabled={isMarkingReview}
                              className="h-8 px-2.5 rounded-xl border border-blue-500/30 hover:border-blue-500/50 bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-bold transition-all cursor-pointer shadow-2xs flex items-center gap-1 disabled:opacity-50"
                              title={t('disputes.actions.markReview', {
                                defaultValue: isRTL ? 'بدء المراجعة الإدارية للنزاع' : 'Start dispute administrative review',
                              })}
                            >
                              <Search className="w-3.5 h-3.5" />
                              <span>{t('disputes.actions.startReview', { defaultValue: isRTL ? 'بدء الفحص' : 'Start Review' })}</span>
                            </button>
                          )}

                          {isResolvable ? (
                            <button
                              type="button"
                              onClick={() => onResolveDispute(dispute)}
                              className="h-8 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-98 text-slate-950 font-bold text-xs transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
                              title={t('disputes.actions.resolve', {
                                defaultValue: isRTL ? 'حسم النزاع وإصدار القرار الإداري' : 'Resolve dispute and issue decision',
                              })}
                            >
                              <Scale className="w-3.5 h-3.5" />
                              <span>{t('disputes.actions.resolve', { defaultValue: isRTL ? 'حسم النزاع' : 'Resolve' })}</span>
                            </button>
                          ) : dispute.status === 'CANCELLED' ? (
                            <span
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60"
                              title={t('disputes.actions.cancelledTooltip', { defaultValue: isRTL ? 'تم إلغاء النزاع بواسطة صاحب الشكوى' : 'Dispute cancelled by claimant' })}
                            >
                              <Ban className="w-3.5 h-3.5 text-slate-400" />
                              <span>{t('disputes.actions.cancelled', { defaultValue: isRTL ? 'ملغي' : 'Cancelled' })}</span>
                            </span>
                          ) : (
                            <div className="flex items-center justify-center gap-1.5 flex-wrap">
                              <span
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200/80 dark:border-emerald-800/60"
                                title={t('disputes.actions.settledTooltip', { defaultValue: isRTL ? 'تم الفصل في النزاع وتنفيذ التسوية المالية' : 'Dispute resolved & financial settlement executed' })}
                              >
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400 shrink-0" />
                                <span>{t('disputes.actions.settled', { defaultValue: isRTL ? 'تم الفصل' : 'Settled' })}</span>
                              </span>
                              {dispute.adminNotes && (
                                <button
                                  type="button"
                                  onClick={() => setSelectedNotesDispute(dispute)}
                                  className="h-7 px-2 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 text-[11px] font-bold inline-flex items-center gap-1 transition-all cursor-pointer shadow-2xs"
                                  title={t('disputes.actions.viewNotes', { defaultValue: isRTL ? 'عرض تقرير وملاحظات الإدارة' : 'View admin resolution notes' })}
                                >
                                  <FileText className="w-3 h-3" />
                                  <span>{isRTL ? 'الملاحظات' : 'Notes'}</span>
                                </button>
                              )}
                            </div>
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

      {/* 4. Evidence Preview Lightbox Modal */}
      {selectedEvidenceDispute && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-amber-500" />
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base flex items-center gap-1.5">
                  <span>{t('disputes.evidenceModal.title', { defaultValue: isRTL ? 'أدلة ومستندات النزاع' : 'Dispute Evidence Documents' })}</span>
                  <bdi dir="ltr">#{selectedEvidenceDispute._id.slice(-6).toUpperCase()}</bdi>
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedEvidenceDispute(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg cursor-pointer"
                title={t('common:actions.close', { defaultValue: isRTL ? 'إغلاق' : 'Close' })}
                aria-label={t('common:actions.close', { defaultValue: isRTL ? 'إغلاق' : 'Close' })}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                <span className="font-semibold block text-slate-800 dark:text-slate-200 mb-1">
                  {t('disputes.evidenceModal.statement', { defaultValue: isRTL ? 'بيان الشكوى:' : 'Claim Statement:' })}
                </span>
                {selectedEvidenceDispute.description}
              </p>

              <div className="max-h-80 overflow-y-auto p-1">
                <DisputeEvidenceGallery
                  evidenceUrls={selectedEvidenceDispute.evidenceUrls || []}
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedEvidenceDispute(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold cursor-pointer transition-colors"
              >
                {t('common:actions.close', { defaultValue: isRTL ? 'إغلاق' : 'Close' })}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. Resolution Notes Viewer Modal */}
      {selectedNotesDispute && (
        <Modal
          isOpen={!!selectedNotesDispute}
          onClose={() => setSelectedNotesDispute(null)}
          title={
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-amber-500 shrink-0" />
              <span className="font-bold text-sm sm:text-base text-slate-900 dark:text-slate-100">
                {t('disputes.notesModal.title', {
                  defaultValue: isRTL ? 'حيثيات وتقرير قرار فض النزاع' : 'Dispute Resolution Audit Report',
                })}
              </span>
            </div>
          }
          size="md"
        >
          <div className="space-y-4">
            {/* Header summary info */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">{isRTL ? 'معرف النزاع:' : 'Dispute ID:'}</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">
                  #{selectedNotesDispute._id.slice(-8).toUpperCase()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">{isRTL ? 'القرار الإداري الصادر:' : 'Issued Verdict:'}</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  {selectedNotesDispute.adminDecision === 'REFUND_BUYER'
                    ? (isRTL ? 'رد كامل المبلغ للمشتري' : 'Full Refund to Buyer')
                    : (isRTL ? 'تحرير وصرف المبلغ للبائع' : 'Release Payment to Seller')}
                </span>
              </div>
              {selectedNotesDispute.resolvedAt && (
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">{isRTL ? 'تاريخ الحسم:' : 'Resolved At:'}</span>
                  <span className="font-mono text-slate-700 dark:text-slate-300">
                    {formatAdminDate(selectedNotesDispute.resolvedAt, isRTL ? 'ar' : 'en', isRTL)}
                  </span>
                </div>
              )}
            </div>

            {/* Notes content */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                {isRTL ? 'نص تقرير وملاحظات الإدارة التوثيقية:' : 'Administrative Findings & Reasoning:'}
              </label>
              {(() => {
                const notes = selectedNotesDispute.adminNotes || (isRTL ? 'لا توجد ملاحظات مدونة' : 'No notes recorded');
                const isArabic = isArabicText(notes);
                return (
                  <div
                    dir={isArabic ? 'rtl' : 'ltr'}
                    className={`p-4 rounded-xl bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/20 text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap select-text ${
                      isArabic ? 'text-right' : 'text-left'
                    }`}
                  >
                    {notes}
                  </div>
                );
              })()}
            </div>

            {/* Footer link to public dispute detail */}
            <div className="pt-2 flex items-center justify-between">
              <Link
                to={ROUTES.DISPUTE_DETAIL(selectedNotesDispute._id)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-amber-600 dark:text-amber-400 hover:underline inline-flex items-center gap-1 font-semibold"
              >
                <span>{isRTL ? 'معاينة صفحة النزاع بالكامل' : 'Open Full Dispute Page'}</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
              <button
                type="button"
                onClick={() => setSelectedNotesDispute(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold cursor-pointer transition-colors"
              >
                {t('common:actions.close', { defaultValue: isRTL ? 'إغلاق' : 'Close' })}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
