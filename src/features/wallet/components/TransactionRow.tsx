import React from 'react';
import { useTranslation } from 'react-i18next';
import { Eye } from 'lucide-react';
import { TransactionTypeBadge } from './TransactionTypeBadge';
import { TransactionStatusBadge } from './TransactionStatusBadge';
import { formatPrice, formatDateTime, formatRelativeTime } from '@/utils/formatters';
import { cn } from '@/utils/cn';
import { type Transaction, getTransactionAmountConfig } from '../types/wallet.types';

export interface TransactionRowProps {
  transaction: Transaction;
  onSelect: (transaction: Transaction) => void;
}

const formatId = (id?: string | null): string => {
  if (!id) return '—';
  if (id.length <= 10) return id;
  return `${id.slice(0, 5)}...${id.slice(-4)}`;
};

export const TransactionRow: React.FC<TransactionRowProps> = ({
  transaction,
  onSelect,
}) => {
  const { t, i18n } = useTranslation('wallet');
  const isRTL = i18n.language?.startsWith('ar');

  const amountConfig = getTransactionAmountConfig(transaction.type);
  const displayId = transaction.referenceId || transaction._id;

  return (
    <>
      {/* Desktop Table Row (md and above) */}
      <tr
        onClick={() => onSelect(transaction)}
        className="hidden md:table-row hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group border-b border-slate-100 dark:border-slate-800/80"
      >
        {/* 1. Type */}
        <td className="py-4 px-4 text-center whitespace-nowrap">
          <TransactionTypeBadge type={transaction.type} size="md" />
        </td>

        {/* 2. Amount with Type-specific Color */}
        <td className="py-4 px-4 text-center whitespace-nowrap">
          <div
            className={cn(
              'font-mono font-bold text-sm tracking-tight inline-flex items-baseline justify-center gap-1',
              amountConfig.textColor
            )}
          >
            {amountConfig.sign && <span>{amountConfig.sign}</span>}
            <span>{formatPrice(transaction.amount, isRTL)}</span>
            <span className="text-xs font-sans font-semibold text-slate-400">
              {t('balance.currency')}
            </span>
          </div>
        </td>

        {/* 3. Status */}
        <td className="py-4 px-4 text-center whitespace-nowrap">
          <TransactionStatusBadge status={transaction.status} size="sm" />
        </td>

        {/* 4. Date & Time */}
        <td className="py-4 px-4 text-center whitespace-nowrap">
          <div className="text-xs font-medium text-slate-700 dark:text-slate-300">
            {formatDateTime(transaction.createdAt, isRTL)}
          </div>
          <div className="text-[11px] text-slate-400">
            {formatRelativeTime(transaction.createdAt, isRTL)}
          </div>
        </td>

        {/* 5. Transaction / Reference ID */}
        <td className="py-4 px-4 text-center whitespace-nowrap">
          <span
            dir="ltr"
            className="text-xs font-mono font-semibold px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60 inline-block shadow-2xs"
            title={displayId}
          >
            {formatId(displayId)}
          </span>
        </td>

        {/* 6. Action button */}
        <td className="py-4 px-4 text-center whitespace-nowrap">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onSelect(transaction);
            }}
            className="px-2.5 py-1.5 rounded-xl text-slate-500 hover:text-amber-500 hover:bg-amber-500/10 transition-colors cursor-pointer inline-flex items-center gap-1.5 text-xs font-semibold"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>{t('actions.details', { defaultValue: 'التفاصيل' })}</span>
          </button>
        </td>
      </tr>

      {/* Mobile Card (below md) */}
      <div
        onClick={() => onSelect(transaction)}
        className="md:hidden p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-3 cursor-pointer active:scale-[0.99] transition-transform"
      >
        {/* Top: Type Badge + Status Badge */}
        <div className="flex items-center justify-between gap-2">
          <TransactionTypeBadge type={transaction.type} size="sm" />
          <TransactionStatusBadge status={transaction.status} size="sm" />
        </div>

        {/* Middle: Amount + Date */}
        <div className="flex items-baseline justify-between gap-2 pt-1">
          <div
            className={cn(
              'font-mono font-bold text-base tracking-tight inline-flex items-baseline gap-1',
              amountConfig.textColor
            )}
          >
            {amountConfig.sign && <span>{amountConfig.sign}</span>}
            <span>{formatPrice(transaction.amount, isRTL)}</span>
            <span className="text-xs font-sans font-semibold text-slate-400">
              {t('balance.currency')}
            </span>
          </div>

          <span className="text-[11px] text-slate-400 font-medium">
            {formatRelativeTime(transaction.createdAt, isRTL)}
          </span>
        </div>

        {/* Bottom: Date format + ID & Details */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
          <span>{formatDateTime(transaction.createdAt, isRTL)}</span>

          <div className="flex items-center gap-2">
            <span dir="ltr" className="font-mono text-[10px] text-slate-400">
              {formatId(displayId)}
            </span>
            <span className="inline-flex items-center gap-1 font-semibold text-amber-600 dark:text-amber-400">
              <Eye className="w-3 h-3" />
              <span>{t('actions.details', { defaultValue: 'التفاصيل' })}</span>
            </span>
          </div>
        </div>
      </div>
    </>
  );
};

export default TransactionRow;
