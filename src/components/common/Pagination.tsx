import React from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { toLocalizedDigits } from '@/utils/formatters';
import { cn } from '@/utils/cn';

export interface PaginationProps {
  page: number;
  totalPages: number;
  total?: number;
  limit?: number;
  hasNextPage?: boolean;
  hasPreviousPage?: boolean;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
  showSummary?: boolean;
  className?: string;
}

export const Pagination: React.FC<PaginationProps> = ({
  page,
  totalPages,
  total,
  limit,
  hasNextPage,
  hasPreviousPage,
  onPageChange,
  isLoading = false,
  showSummary = true,
  className,
}) => {
  const { t, i18n } = useTranslation('common');
  const isRTL = i18n.language?.startsWith('ar');

  if (totalPages <= 1) return null;

  const canGoPrev = hasPreviousPage !== undefined ? hasPreviousPage : page > 1;
  const canGoNext = hasNextPage !== undefined ? hasNextPage : page < totalPages;

  const PrevIcon = isRTL ? ChevronRight : ChevronLeft;
  const NextIcon = isRTL ? ChevronLeft : ChevronRight;

  const effectiveLimit = limit || (total && totalPages ? Math.ceil(total / totalPages) : 12);
  const hasItemCounts = total !== undefined && total > 0;
  const fromItem = hasItemCounts ? Math.min((page - 1) * effectiveLimit + 1, total) : 0;
  const toItem = hasItemCounts ? Math.min(page * effectiveLimit, total) : 0;

  return (
    <div
      className={cn(
        'flex flex-col sm:flex-row items-center justify-between gap-4 py-4 px-2 select-none',
        !hasItemCounts && 'justify-center',
        className
      )}
    >
      {/* Optional Item Count Summary (e.g. Showing 1 to 10 of 45) */}
      {showSummary && hasItemCounts && (
        <div className="text-xs text-slate-500 dark:text-slate-400 font-medium text-center sm:text-start">
          {t('pagination.showing', {
            from: toLocalizedDigits(fromItem, isRTL),
            to: toLocalizedDigits(toItem, isRTL),
            total: toLocalizedDigits(total, isRTL),
            defaultValue: isRTL
              ? `عرض ${toLocalizedDigits(fromItem, true)} إلى ${toLocalizedDigits(toItem, true)} من إجمالي ${toLocalizedDigits(total, true)}`
              : `Showing ${fromItem} to ${toItem} of ${total}`,
          })}
        </div>
      )}

      {/* Page Controls: Previous, Page X of Y, Next */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page - 1)}
          disabled={!canGoPrev || isLoading}
          leftIcon={<PrevIcon className="w-4 h-4" />}
          className="border-slate-200 dark:border-slate-800 text-xs font-semibold px-3 py-1.5"
        >
          {t('pagination.previous', { defaultValue: isRTL ? 'السابق' : 'Previous' })}
        </Button>

        <span className="text-xs font-semibold px-2 py-1 text-slate-700 dark:text-slate-300 font-mono">
          {t('pagination.pageOf', {
            current: toLocalizedDigits(page, isRTL),
            total: toLocalizedDigits(totalPages, isRTL),
            defaultValue: `${toLocalizedDigits(page, isRTL)} / ${toLocalizedDigits(totalPages, isRTL)}`,
          })}
        </span>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page + 1)}
          disabled={!canGoNext || isLoading}
          rightIcon={<NextIcon className="w-4 h-4" />}
          className="border-slate-200 dark:border-slate-800 text-xs font-semibold px-3 py-1.5"
        >
          {t('pagination.next', { defaultValue: isRTL ? 'التالي' : 'Next' })}
        </Button>
      </div>
    </div>
  );
};

export default Pagination;
