import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Bot,
  Zap,
  ShieldCheck,
  Trash2,
  AlertCircle,
  TrendingUp,
  Wallet,
  Lock,
  Coins,
  ChevronRight,
  Edit3,
  CheckCircle2,
  Sparkles,
  ArrowUpCircle,
  Info,
} from 'lucide-react';
import { Modal } from '@/components/common/Modal';
import { Button } from '@/components/common/Button';
import { Spinner } from '@/components/common/Spinner';
import { useAutoBid } from '../hooks/useAutoBid';
import { useLiveBids } from '../hooks/useLiveBids';
import { useAuth } from '@/hooks/useAuth';
import { createAutoBidSchema, type AutoBidFormData } from '../schemas/autoBid.schema';
import { formatPrice, toLocalizedDigits, normalizeArabicDigits } from '@/utils/formatters';
import { ROUTES } from '@/constants/routes.constants';
import type { Auction } from '@/features/auctions/types/auctions.types';

export interface AutoBidModalProps {
  isOpen: boolean;
  onClose: () => void;
  auction: Auction;
}

export const AutoBidModal: React.FC<AutoBidModalProps> = ({
  isOpen,
  onClose,
  auction,
}) => {
  const { t, i18n } = useTranslation('bids');
  const isRTL = i18n.language?.startsWith('ar');
  const navigate = useNavigate();
  const { user } = useAuth();

  const {
    autoBid,
    wallet,
    isWalletLoading,
    isLoading,
    isSetting,
    isCancelling,
    setAutoBid,
    cancelAutoBid,
    refetch,
    refetchWallet,
  } = useAutoBid(auction._id);

  const { isLeadingBidder } = useLiveBids(auction._id);

  const [isEditingCeiling, setIsEditingCeiling] = useState(false);
  const [rawAmount, setRawAmount] = useState<string>('');
  const prevIsOpen = useRef(false);

  const currentPriceNum = parseFloat(auction.currentPrice || auction.startingPrice || '0');
  const minIncrementNum = parseFloat(auction.minimumBidIncrement || '50');
  const minAllowedCeiling = currentPriceNum + minIncrementNum;

  const isActuallyActive = Boolean(autoBid && String(autoBid.status).toUpperCase() === 'ACTIVE');

  const wasExhausted = Boolean(
    autoBid &&
    (autoBid.status === 'EXHAUSTED' ||
      (autoBid.status !== 'ACTIVE' && parseFloat(autoBid.maxAmount) < currentPriceNum))
  );

  const isUserLeading = Boolean(
    isLeadingBidder || (user && auction.winnerId && user._id === auction.winnerId)
  );

  // The actual amount already held from this user's wallet for THIS auction
  // is their current winning bid amount (if they are leading), NOT the auto-bid ceiling.
  const existingHoldOnThisAuction = isUserLeading ? currentPriceNum : 0;

  const availableNum = parseFloat(wallet?.availableBalance || '0');
  const heldNum = parseFloat(wallet?.heldBalance || '0');
  const totalNum = parseFloat(wallet?.balance || '0');
  const currentMaxNum = parseFloat(rawAmount || '0');

  const requiredDelta = Math.max(0, currentMaxNum - existingHoldOnThisAuction);
  const isInsufficientAvailable =
    !isWalletLoading &&
    Boolean(wallet) &&
    currentMaxNum > 0 &&
    requiredDelta > availableNum;
  const deficit = Math.max(0, requiredDelta - availableNum);

  const hasDeltaSavings =
    isUserLeading &&
    existingHoldOnThisAuction > 0 &&
    currentMaxNum > existingHoldOnThisAuction &&
    requiredDelta <= availableNum &&
    requiredDelta > 0;

  const {
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<AutoBidFormData>({
    resolver: zodResolver(createAutoBidSchema(minAllowedCeiling)),
    defaultValues: {
      auctionId: auction._id,
      maxAmount: minAllowedCeiling,
    },
  });

  // Effect 1: Reset on modal open
  useEffect(() => {
    if (isOpen && !prevIsOpen.current) {
      setIsEditingCeiling(false);
      refetch();
      refetchWallet?.();
    }
    prevIsOpen.current = isOpen;
  }, [isOpen, refetch, refetchWallet]);

  // Effect 2: Initialize form values once autoBid data arrives
  useEffect(() => {
    if (!isOpen) return;
    if (isEditingCeiling) return;

    const initialVal = isActuallyActive && autoBid
      ? autoBid.maxAmount
      : minAllowedCeiling.toString();

    setRawAmount(String(initialVal));
    setValue('auctionId', auction._id);
    setValue('maxAmount', parseFloat(String(initialVal)), { shouldValidate: false });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoBid, isOpen, isActuallyActive, minAllowedCeiling, auction._id]);

  const handleStartEditing = () => {
    const nextVal = Math.max(Number(autoBid?.maxAmount || 0), minAllowedCeiling);
    setRawAmount(nextVal.toString());
    setValue('maxAmount', nextVal, { shouldValidate: true });
    setIsEditingCeiling(true);
  };

  const onSubmit = async (data: AutoBidFormData) => {
    try {
      await setAutoBid(Number(data.maxAmount));
      setIsEditingCeiling(false);
      onClose();
    } catch {
      // Error handled by hook toast
    }
  };

  const handleCancelAutoBid = async () => {
    try {
      await cancelAutoBid();
      onClose();
    } catch {
      // Error handled by hook toast
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const normalized = normalizeArabicDigits(raw).replace(/[^0-9.]/g, '');
    const parts = normalized.split('.');
    const sanitized = parts.length > 2 ? `${parts[0]}.${parts.slice(1).join('')}` : normalized;
    setRawAmount(sanitized);
    const numericVal = sanitized ? parseFloat(sanitized) : 0;
    setValue('maxAmount', numericVal, { shouldValidate: true });
  };

  const handleQuickAdd = (increment: number) => {
    const currentVal = Number(rawAmount) || minAllowedCeiling;
    const nextVal = currentVal + increment;
    setRawAmount(nextVal.toString());
    setValue('maxAmount', nextVal, { shouldValidate: true });
  };

  const displayAmount = isRTL && rawAmount ? toLocalizedDigits(rawAmount, true) : rawAmount;

  const presetIncrements = [
    minIncrementNum * 1,
    minIncrementNum * 2,
    minIncrementNum * 5,
    minIncrementNum * 10,
  ];

  const showSpinner = isLoading && autoBid === undefined;
  const showActiveCard = !showSpinner && isActuallyActive && autoBid && !isEditingCeiling;
  const showSetupForm = !showSpinner && !showActiveCard;

  const walletBar = wallet ? (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-700/80 bg-slate-50 dark:bg-slate-800/50 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-200/80 dark:border-slate-700/60">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-200">
          <Wallet className="w-3.5 h-3.5 text-amber-500" />
          <span>{t('autoBid.walletSummary.title')}</span>
        </div>
        <button
          type="button"
          onClick={() => { onClose(); navigate(ROUTES.WALLET_DEPOSIT); }}
          className="text-[11px] font-bold text-amber-600 dark:text-amber-400 hover:underline inline-flex items-center gap-0.5"
        >
          <span>{t('autoBid.walletSummary.depositButton')}</span>
          <ChevronRight className={`w-3 h-3 ${isRTL ? 'rotate-180' : ''}`} />
        </button>
      </div>
      <div className="grid grid-cols-3 divide-x divide-slate-200 dark:divide-slate-700/60 rtl:divide-x-reverse">
        <div className="p-3 flex flex-col items-center gap-1">
          <div className="flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
            <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 truncate max-w-[5rem] text-center">
              {t('autoBid.walletSummary.available')}
            </span>
          </div>
          <span className="text-sm font-black font-mono text-emerald-800 dark:text-emerald-300">
            {formatPrice(availableNum, isRTL)}
          </span>
        </div>
        <div className="p-3 flex flex-col items-center gap-1">
          <div className="flex items-center gap-1">
            <Lock className="w-3 h-3 text-amber-500" />
            <span className="text-[10px] font-semibold text-amber-700 dark:text-amber-400 truncate max-w-[5rem] text-center">
              {t('autoBid.walletSummary.held')}
            </span>
          </div>
          <span className="text-sm font-black font-mono text-amber-800 dark:text-amber-300">
            {formatPrice(heldNum, isRTL)}
          </span>
        </div>
        <div className="p-3 flex flex-col items-center gap-1">
          <div className="flex items-center gap-1">
            <Coins className="w-3 h-3 text-slate-500 dark:text-slate-400" />
            <span className="text-[10px] font-semibold text-slate-600 dark:text-slate-400">
              {t('autoBid.walletSummary.total')}
            </span>
          </div>
          <span className="text-sm font-black font-mono text-slate-800 dark:text-slate-200">
            {formatPrice(totalNum, isRTL)}
          </span>
        </div>
      </div>
    </div>
  ) : null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="md"
      contentClassName="max-h-[85vh] overflow-y-auto px-5 sm:px-6 py-4"
      title={
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-600/10 text-amber-500 flex items-center justify-center border border-amber-500/30 shadow-sm flex-shrink-0">
            <Bot className="w-4 h-4 stroke-[2.2]" />
          </div>
          <div className="text-start min-w-0">
            <span className="text-sm sm:text-base font-black text-slate-900 dark:text-white block leading-tight">
              {t('autoBid.modalTitle')}
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 block truncate font-medium mt-0.5">
              {auction.title}
            </span>
          </div>
        </div>
      }
    >
      <div className="space-y-3 w-full">

        {/* LOADING */}
        {showSpinner && (
          <div className="flex flex-col items-center justify-center py-14 space-y-3">
            <Spinner size="md" className="text-amber-500" />
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {t('autoBid.updating')}
            </span>
          </div>
        )}

        {/* STATE 1: ACTIVE CARD */}
        {showActiveCard && (
          <div className="space-y-3 w-full animate-in fade-in zoom-in-95 duration-200">
            <div className="relative overflow-hidden rounded-2xl border border-emerald-500/30 dark:border-emerald-500/40 bg-gradient-to-br from-emerald-50 via-white to-teal-50 dark:from-emerald-950/50 dark:via-slate-900 dark:to-teal-950/30 shadow-sm">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/10 to-teal-400/5 pointer-events-none" />
              <div className="relative p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-2.5 w-2.5 flex-shrink-0">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                    </span>
                    <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-300">
                      <ShieldCheck className="w-3.5 h-3.5 flex-shrink-0" />
                      <span className="text-xs font-black uppercase tracking-wider">{t('status.ACTIVE')}</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-700/80 dark:text-emerald-400/80 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 flex-shrink-0">
                    #{autoBid._id.slice(-6)}
                  </span>
                </div>
                <div className="text-start">
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold block mb-1">
                    {t('autoBid.currentMax')}
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black font-mono text-emerald-800 dark:text-emerald-300 leading-none">
                      {formatPrice(autoBid.maxAmount, isRTL)}
                    </span>
                    <span className="text-sm font-bold text-emerald-700/70 dark:text-emerald-400/70">
                      {t('currency.symbol')}
                    </span>
                  </div>
                </div>
                <div className="flex items-start gap-2 text-[11px] text-emerald-800/90 dark:text-emerald-300/90 bg-emerald-500/10 dark:bg-emerald-500/15 p-2.5 rounded-xl border border-emerald-500/20">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{t('autoBid.modalDescription')}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <Button
                type="button"
                variant="accent"
                size="md"
                fullWidth
                onClick={handleStartEditing}
                leftIcon={<Edit3 className="w-4 h-4 stroke-[2.2]" />}
                className="font-bold shadow-sm"
              >
                {t('autoBid.editCeiling')}
              </Button>
              <Button
                type="button"
                variant="danger"
                size="md"
                fullWidth
                onClick={handleCancelAutoBid}
                isLoading={isCancelling}
                disabled={isCancelling}
                leftIcon={<Trash2 className="w-4 h-4" />}
                className="font-bold"
              >
                {t('autoBid.cancelButton')}
              </Button>
            </div>

            {walletBar}
          </div>
        )}

        {/* STATE 2: SETUP / EDIT FORM */}
        {showSetupForm && (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 w-full animate-in fade-in duration-150">

            {isActuallyActive && autoBid && (
              <div className="flex items-center justify-between p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-300/60 dark:border-amber-500/30">
                <div className="flex items-center gap-2 min-w-0">
                  <Edit3 className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                  <span className="text-xs font-semibold text-amber-900 dark:text-amber-200 truncate">
                    {t('autoBid.currentMax')}:{' '}
                    <strong className="font-mono font-black">
                      {formatPrice(autoBid.maxAmount, isRTL)} {t('currency.symbol')}
                    </strong>
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsEditingCeiling(false)}
                  className="text-[11px] font-bold text-amber-600 dark:text-amber-400 hover:underline flex-shrink-0 ms-2"
                >
                  {t('common:cancel')}
                </button>
              </div>
            )}

            {wasExhausted && autoBid && !isActuallyActive && (
              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-300/60 dark:border-amber-500/30 flex items-start gap-2">
                <AlertCircle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
                <span className="text-[11px] text-amber-900 dark:text-amber-200 leading-relaxed">
                  {t('autoBid.previousExhaustedNotice', {
                    amount: `${formatPrice(autoBid.maxAmount, isRTL)} ${t('currency.symbol')}`,
                  })}
                </span>
              </div>
            )}

            {!isActuallyActive && !wasExhausted && (
              <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80">
                <div className="w-7 h-7 rounded-lg bg-amber-500/15 flex items-center justify-center flex-shrink-0">
                  <Info className="w-3.5 h-3.5 text-amber-500" />
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                  {t('autoBid.modalDescription')}
                </p>
              </div>
            )}

            {/* Main form card */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-800/60 overflow-hidden shadow-sm">
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-700/60 bg-slate-50/80 dark:bg-slate-800/80">
                <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 text-xs font-semibold">
                  <TrendingUp className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                  <span>{t('autoBid.minAllowedCeilingLabel')}</span>
                </div>
                <span className="font-mono font-black text-xs text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/25">
                  ≥ {formatPrice(minAllowedCeiling, isRTL)} {t('currency.symbol')}
                </span>
              </div>

              <div className="p-4 space-y-4">
                {/* Quick increments */}
                <div className="space-y-2">
                  <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block">
                    {t('form.labels.quickIncrements')}
                  </span>
                  <div className="grid grid-cols-4 gap-1.5">
                    {presetIncrements.map((inc) => (
                      <button
                        key={inc}
                        type="button"
                        onClick={() => handleQuickAdd(inc)}
                        className="py-2 px-1 rounded-lg border border-slate-200 dark:border-slate-600/80 bg-white dark:bg-slate-700/60 hover:border-amber-400 dark:hover:border-amber-500 hover:bg-amber-50 dark:hover:bg-amber-500/10 hover:text-amber-700 dark:hover:text-amber-300 text-slate-700 dark:text-slate-300 font-bold font-mono text-[11px] transition-all duration-150 cursor-pointer text-center active:scale-95"
                      >
                        +{formatPrice(inc, isRTL)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Input */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="auto-bid-max-amount"
                    className="text-xs font-bold text-slate-700 dark:text-slate-200 block"
                  >
                    {t('form.labels.maxAmount')}
                  </label>
                  <div className="relative">
                    <input
                      id="auto-bid-max-amount"
                      type="text"
                      inputMode="decimal"
                      value={displayAmount}
                      onChange={handleInputChange}
                      className={`w-full h-12 px-4 pe-16 rounded-xl border bg-white dark:bg-slate-900/80 text-slate-900 dark:text-white font-mono font-bold text-base outline-none transition-all duration-150 shadow-sm ${
                        errors.maxAmount
                          ? 'border-red-400 dark:border-red-500 focus:ring-2 focus:ring-red-500/20'
                          : 'border-slate-300 dark:border-slate-600 focus:border-amber-500 dark:focus:border-amber-400 focus:ring-2 focus:ring-amber-500/20'
                      }`}
                      placeholder={`≥ ${formatPrice(minAllowedCeiling, isRTL)}`}
                    />
                    <span className="absolute end-3 top-1/2 -translate-y-1/2 text-[11px] font-bold text-slate-400 dark:text-slate-500 pointer-events-none select-none bg-slate-50 dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-600/60">
                      {t('currency.symbol')}
                    </span>
                  </div>
                  {errors.maxAmount && (
                    <div className="flex items-center gap-1 text-red-500 dark:text-red-400 text-xs mt-1">
                      <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>{t(errors.maxAmount.message as string)}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Delta reassurance */}
            {hasDeltaSavings && !isInsufficientAvailable && (
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-300/60 dark:border-emerald-500/30">
                <ArrowUpCircle className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                <span className="text-xs text-emerald-800 dark:text-emerald-300 leading-relaxed">
                  {t('autoBid.walletSummary.deltaReassurance', {
                    delta: `${formatPrice(requiredDelta, isRTL)} ${t('currency.symbol')}`,
                    held: `${formatPrice(existingHoldOnThisAuction, isRTL)} ${t('currency.symbol')}`,
                  })}
                </span>
              </div>
            )}

            {/* Insufficient balance */}
            {isInsufficientAvailable && (
              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-300/60 dark:border-red-500/30 space-y-1.5">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                  <div className="text-xs text-red-900 dark:text-red-300 space-y-1">
                    <p className="leading-relaxed">
                      {t('autoBid.walletSummary.insufficientNotice', {
                        amount: `${formatPrice(currentMaxNum, isRTL)} ${t('currency.symbol')}`,
                        available: `${formatPrice(availableNum, isRTL)} ${t('currency.symbol')}`,
                        held: `${formatPrice(heldNum, isRTL)} ${t('currency.symbol')}`,
                      })}
                    </p>
                    <p className="font-bold text-red-700 dark:text-red-400">
                      {t('autoBid.walletSummary.depositRequired', {
                        deficit: `${formatPrice(deficit, isRTL)} ${t('currency.symbol')}`,
                      })}
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        navigate(ROUTES.WALLET_DEPOSIT);
                      }}
                      className="mt-2 text-xs font-bold text-amber-700 dark:text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-xl px-3 py-1.5 transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <Wallet className="w-3.5 h-3.5 text-amber-500" />
                      <span>{t('autoBid.walletSummary.depositButton', { defaultValue: 'إيداع رصيد الآن' })}</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Buttons */}
            <div className="flex items-center gap-2.5 pt-1">
              <Button
                type="submit"
                variant="accent"
                size="md"
                fullWidth
                isLoading={isSetting || isLoading}
                disabled={isSetting || isLoading || isInsufficientAvailable}
                leftIcon={<Zap className="w-4 h-4 stroke-[2.2]" />}
                className="font-bold shadow-sm"
              >
                {isActuallyActive ? t('autoBid.editCeiling') : t('autoBid.setupButton')}
              </Button>
              {isActuallyActive && isEditingCeiling && (
                <Button
                  type="button"
                  variant="outline"
                  size="md"
                  onClick={() => setIsEditingCeiling(false)}
                  className="flex-shrink-0"
                >
                  {t('common:cancel')}
                </Button>
              )}
            </div>

            {/* Wallet bar */}
            {walletBar}

            {isWalletLoading && !wallet && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60">
                <Spinner size="sm" className="text-amber-500" />
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {t('autoBid.walletSummary.title')}...
                </span>
              </div>
            )}
          </form>
        )}
      </div>
    </Modal>
  );
};

export default AutoBidModal;
