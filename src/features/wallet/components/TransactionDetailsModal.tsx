import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router-dom';
import {
  Copy,
  Check,
  ExternalLink,
  CreditCard,
  Hash,
  Clock,
  Layers,
  FileText,
  ShieldCheck,
  Lock,
  CheckCircle2,
  RotateCcw,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import { Modal } from '@/components/common/Modal';
import { Button } from '@/components/common/Button';
import { TransactionTypeBadge } from './TransactionTypeBadge';
import { TransactionStatusBadge } from './TransactionStatusBadge';
import { formatPrice, formatDateTime } from '@/utils/formatters';
import { ROUTES } from '@/constants/routes.constants';
import { cn } from '@/utils/cn';
import { type Transaction, type TransactionType, getTransactionAmountConfig } from '../types/wallet.types';

export interface TransactionDetailsModalProps {
  transaction: Transaction | null;
  isOpen: boolean;
  onClose: () => void;
}

export const TransactionDetailsModal: React.FC<TransactionDetailsModalProps> = ({
  transaction,
  isOpen,
  onClose,
}) => {
  const { t, i18n } = useTranslation(['wallet', 'common']);
  const location = useLocation();
  const isRTL = i18n.language?.startsWith('ar');
  const [copiedField, setCopiedField] = useState<string | null>(null);

  if (!transaction) return null;

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => {
      setCopiedField(null);
    }, 2000);
  };

  const amountConfig = getTransactionAmountConfig(transaction.type);

  // Check if user is already browsing the referenced escrow or auction page
  const isAlreadyOnReferencedPage = Boolean(
    (transaction.referenceId && location.pathname.includes(transaction.referenceId)) ||
    (location.pathname.startsWith('/escrow/') &&
      (transaction.referenceType === 'ESCROW' || transaction.referenceType === 'AUCTION'))
  );

  // Helper to get detailed financial balance impact info
  const getImpactDetails = (type: TransactionType | string) => {
    switch (type) {
      case 'HOLD':
        return {
          icon: <Lock className="w-4 h-4 text-amber-500 shrink-0" />,
          desc: t('transactions.detailsModal.impactHold'),
          containerClass: 'bg-amber-50/80 dark:bg-amber-950/30 border-amber-200/80 dark:border-amber-900/40 text-amber-900 dark:text-amber-200',
        };
      case 'RELEASE':
        return {
          icon: <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />,
          desc: t('transactions.detailsModal.impactRelease'),
          containerClass: 'bg-emerald-50/80 dark:bg-emerald-950/30 border-emerald-200/80 dark:border-emerald-900/40 text-emerald-900 dark:text-emerald-200',
        };
      case 'REFUND':
        return {
          icon: <RotateCcw className="w-4 h-4 text-blue-500 shrink-0" />,
          desc: t('transactions.detailsModal.impactRefund'),
          containerClass: 'bg-blue-50/80 dark:bg-blue-950/30 border-blue-200/80 dark:border-blue-900/40 text-blue-900 dark:text-blue-200',
        };
      case 'DEPOSIT':
        return {
          icon: <TrendingUp className="w-4 h-4 text-emerald-500 shrink-0" />,
          desc: t('transactions.detailsModal.impactDeposit'),
          containerClass: 'bg-emerald-50/80 dark:bg-emerald-950/30 border-emerald-200/80 dark:border-emerald-900/40 text-emerald-900 dark:text-emerald-200',
        };
      case 'WITHDRAW':
        return {
          icon: <TrendingDown className="w-4 h-4 text-indigo-500 shrink-0" />,
          desc: t('transactions.detailsModal.impactWithdraw'),
          containerClass: 'bg-indigo-50/80 dark:bg-indigo-950/30 border-indigo-200/80 dark:border-indigo-900/40 text-indigo-900 dark:text-indigo-200',
        };
      case 'CAPTURE':
        return {
          icon: <ShieldCheck className="w-4 h-4 text-purple-500 shrink-0" />,
          desc: t('transactions.detailsModal.impactCapture'),
          containerClass: 'bg-purple-50/80 dark:bg-purple-950/30 border-purple-200/80 dark:border-purple-900/40 text-purple-900 dark:text-purple-200',
        };
      default:
        return null;
    }
  };

  const impact = getImpactDetails(transaction.type);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('transactions.detailsModal.title')}
      size="md"
    >
      <div className="space-y-4">
        {/* Top Hero Card: Amount + Badges */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 text-center space-y-2.5">
          <div className="flex items-center justify-center gap-2">
            <TransactionTypeBadge type={transaction.type} size="md" />
            <TransactionStatusBadge status={transaction.status} size="md" />
          </div>

          <div
            className={cn(
              'text-2xl sm:text-3xl font-black font-mono tracking-tight',
              amountConfig.textColor
            )}
          >
            {amountConfig.sign && <span>{amountConfig.sign}</span>}
            <span>{formatPrice(transaction.amount, isRTL)}</span>
            <span className="text-sm font-sans font-semibold text-slate-500 ms-1.5">
              {t('balance.currency')}
            </span>
          </div>
        </div>

        {/* Financial Balance Impact Explanation Card */}
        {impact && (
          <div className={cn('p-3 rounded-xl border text-xs flex items-start gap-2.5 leading-relaxed', impact.containerClass)}>
            {impact.icon}
            <div className="space-y-0.5">
              <span className="font-bold block text-[11px]">
                {t('transactions.detailsModal.walletImpact')}
              </span>
              <p className="opacity-90">{impact.desc}</p>
            </div>
          </div>
        )}

        {/* Details Grid */}
        <div className="space-y-3 divide-y divide-slate-100 dark:divide-slate-800 text-xs">
          {/* 1. Transaction ID */}
          <div className="pt-2 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 font-medium">
              <Hash className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span>{t('transactions.detailsModal.transactionId')}</span>
            </div>
            <div className="flex items-center gap-1.5 font-mono font-semibold text-slate-800 dark:text-slate-200">
              <span className="truncate max-w-[160px] sm:max-w-[220px]">
                {transaction._id}
              </span>
              <button
                type="button"
                onClick={() => copyToClipboard(transaction._id, 'id')}
                className="p-1 rounded-md text-slate-400 hover:text-amber-500 hover:bg-amber-500/10 transition-colors cursor-pointer"
                title={t('transactions.detailsModal.copy')}
              >
                {copiedField === 'id' ? (
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          </div>

          {/* 2. Date & Time */}
          <div className="pt-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 font-medium">
              <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span>{t('transactions.detailsModal.date')}</span>
            </div>
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              {formatDateTime(transaction.createdAt, isRTL)}
            </span>
          </div>

          {/* 3. Payment Gateway Provider & Transaction ID (if present) */}
          {transaction.gatewayProvider && (
            <div className="pt-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 font-medium">
                <CreditCard className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span>{t('transactions.detailsModal.gatewayProvider')}</span>
              </div>
              <span className="px-2 py-0.5 rounded-full font-bold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
                {transaction.gatewayProvider}
              </span>
            </div>
          )}

          {transaction.gatewayTransactionId && (
            <div className="pt-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 font-medium">
                <FileText className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span>{t('transactions.detailsModal.gatewayId')}</span>
              </div>
              <div className="flex items-center gap-1.5 font-mono font-semibold text-slate-800 dark:text-slate-200">
                <span className="truncate max-w-[160px] sm:max-w-[220px]">
                  {transaction.gatewayTransactionId}
                </span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(transaction.gatewayTransactionId!, 'gateway')}
                  className="p-1 rounded-md text-slate-400 hover:text-amber-500 hover:bg-amber-500/10 transition-colors cursor-pointer"
                >
                  {copiedField === 'gateway' ? (
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>
          )}

          {/* 4. Reference Type & Action Link (Only shown when browsing from external pages like Wallet Transactions) */}
          {!isAlreadyOnReferencedPage && transaction.referenceId && (
            <div className="pt-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 font-medium">
                <Layers className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span>{t('transactions.detailsModal.reference')}</span>
              </div>
              <div className="flex items-center gap-2">
                {transaction.referenceType === 'AUCTION' && (
                  <Link
                    to={ROUTES.AUCTION_DETAIL(transaction.referenceId)}
                    onClick={onClose}
                    className="inline-flex items-center gap-1 font-semibold text-amber-600 dark:text-amber-400 hover:underline"
                  >
                    <span>{t('transactions.detailsModal.goToAuction')}</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                )}
                {transaction.referenceType === 'ESCROW' && (
                  <Link
                    to={ROUTES.ESCROW_DETAIL(transaction.referenceId)}
                    onClick={onClose}
                    className="inline-flex items-center gap-1 font-semibold text-amber-600 dark:text-amber-400 hover:underline"
                  >
                    <span>{t('transactions.detailsModal.goToEscrow')}</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                )}
                {(transaction.referenceType === 'WITHDRAWAL' || transaction.type === 'WITHDRAW') && (
                  <Link
                    to={ROUTES.WALLET_WITHDRAWALS}
                    onClick={onClose}
                    className="inline-flex items-center gap-1 font-semibold text-amber-600 dark:text-amber-400 hover:underline"
                  >
                    <span>{t('transactions.detailsModal.goToWithdrawals', 'عرض سجل السحوبات')}</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                )}
                {transaction.referenceType !== 'AUCTION' &&
                  transaction.referenceType !== 'ESCROW' &&
                  transaction.referenceType !== 'WITHDRAWAL' &&
                  transaction.type !== 'WITHDRAW' && (
                    <span className="font-mono text-slate-700 dark:text-slate-300">
                      {transaction.referenceId}
                    </span>
                  )}
              </div>
            </div>
          )}
        </div>

        {/* Close Button */}
        <div className="pt-2">
          <Button variant="outline" size="md" fullWidth onClick={onClose}>
            {t('transactions.detailsModal.close')}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default TransactionDetailsModal;

