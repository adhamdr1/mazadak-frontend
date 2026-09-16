import React from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { toLocalizedDigits } from '@/utils/formatters';
import { cn } from '@/utils/cn';

export interface TransactionsPaginationProps {
  page: number;
  totalPages: number;
  total: number;
  limit: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  onPageChange: (page: number) => void;
  className?: string;
}

export const TransactionsPagination: React.FC<TransactionsPaginationProps> = ({
  page,
  totalPages,
  total,
  limit,
  hasNextPage,
  hasPreviousPage,
  onPageChange,
  className,
}) => {
  const { t, i18n } = useTranslation('wallet');
  const isRTL = i18n.language?.startsWith('ar');

  if (totalPages <= 1) return null;

  const fromItem = Math.min((page - 1) * limit + 1, total);
  const toItem = Math.min(page * limit, total);

  const PrevIcon = isRTL ? ChevronRight : ChevronLeft;
  const NextIcon = isRTL ? ChevronLeft : ChevronRight;

  return (
    <div
      className={cn(
        'flex flex-col sm:flex-row items-center justify-between gap-4 py-4 px-2 select-none',
        className
      )}
    >
      {/* Showing item X to Y of Z */}
      <div className="text-xs text-slate-500 dark:text-slate-400 font-medium text-center sm:text-start">
        {t('transactions.pagination.showing', {
          from: toLocalizedDigits(fromItem, isRTL),
          to: toLocalizedDigits(toItem, isRTL),
          total: toLocalizedDigits(total, isRTL),
          defaultValue: `عرض ${toLocalizedDigits(fromItem, isRTL)} إلى ${toLocalizedDigits(toItem, isRTL)} من ${toLocalizedDigits(total, isRTL)} معاملة`,
        })}
      </div>

      {/* Page Selector & Buttons */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page - 1)}
          disabled={!hasPreviousPage}
          leftIcon={<PrevIcon className="w-4 h-4" />}
          className="border-slate-200 dark:border-slate-800 text-xs font-semibold px-3 py-1.5"
        >
          {t('transactions.pagination.previous', { defaultValue: 'السابق' })}
        </Button>

        <span className="text-xs font-semibold px-2 py-1 text-slate-700 dark:text-slate-300 font-mono">
          {t('transactions.pagination.pageOf', {
            current: toLocalizedDigits(page, isRTL),
            total: toLocalizedDigits(totalPages, isRTL),
            defaultValue: `${toLocalizedDigits(page, isRTL)} / ${toLocalizedDigits(totalPages, isRTL)}`,
          })}
        </span>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page + 1)}
          disabled={!hasNextPage}
          rightIcon={<NextIcon className="w-4 h-4" />}
          className="border-slate-200 dark:border-slate-800 text-xs font-semibold px-3 py-1.5"
        >
          {t('transactions.pagination.next', { defaultValue: 'التالي' })}
        </Button>
      </div>
    </div>
  );
};

export default TransactionsPagination;
