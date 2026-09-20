import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  User,
  CreditCard,
  Phone,
  Zap,
  ArrowLeft,
  ArrowRight,
  Info,
  Smartphone,
  CheckCircle2,
} from 'lucide-react';
import type { PayoutMethod, PayoutDetailsInput } from '../types/wallet.types';
import type { PayoutCategory } from './WithdrawAmountStep';
import { normalizeArabicDigits, toLocalizedDigits } from '@/utils/formatters';

const POPULAR_BANKS_MAP: Array<{ ar: string; en: string }> = [
  { ar: 'البنك الأهلي المصري', en: 'National Bank of Egypt (NBE)' },
  { ar: 'بنك مصر', en: 'Banque Misr' },
  { ar: 'البنك التجاري الدولي (CIB)', en: 'Commercial International Bank (CIB)' },
  { ar: 'بنك QNB الأهلي', en: 'QNB Alahli' },
  { ar: 'بنك الإسكندرية', en: 'Bank of Alexandria' },
  { ar: 'بنك القاهرة', en: 'Banque du Caire' },
  { ar: 'مصرف أبوظبي الإسلامي', en: 'Abu Dhabi Islamic Bank (ADIB)' },
  { ar: 'بنك فيصل الإسلامي', en: 'Faisal Islamic Bank' },
];

const BANK_MAP_AR_TO_EN: Record<string, string> = Object.fromEntries(
  POPULAR_BANKS_MAP.map((b) => [b.ar, b.en])
);

const BANK_MAP_EN_TO_AR: Record<string, string> = Object.fromEntries(
  POPULAR_BANKS_MAP.map((b) => [b.en, b.ar])
);

export interface PayoutDetailsFormProps {
  payoutCategory: PayoutCategory;
  resolvedPayoutMethod: PayoutMethod;
  onResolvedPayoutMethodChange: (method: PayoutMethod) => void;
  details: PayoutDetailsInput;
  onChangeDetails: (details: PayoutDetailsInput) => void;
  onBack: () => void;
  onNext: () => void;
  disabled?: boolean;
}

export const PayoutDetailsForm: React.FC<PayoutDetailsFormProps> = ({
  payoutCategory,
  resolvedPayoutMethod,
  onResolvedPayoutMethodChange,
  details,
  onChangeDetails,
  onBack,
  onNext,
  disabled = false,
}) => {
  const { t, i18n } = useTranslation(['wallet']);
  const isRTL = i18n.language.startsWith('ar');

  const popularBanks = POPULAR_BANKS_MAP.map((b) => (isRTL ? b.ar : b.en));

  const handleFieldChange = (field: keyof PayoutDetailsInput, value: string) => {
    onChangeDetails({
      ...details,
      [field]: value,
    });
  };

  // Auto-translate selected bank name when switching languages
  useEffect(() => {
    if (!details.bankName) return;

    if (isRTL) {
      const arName = BANK_MAP_EN_TO_AR[details.bankName];
      if (arName && arName !== details.bankName) {
        onChangeDetails({
          ...details,
          bankName: arName,
        });
      }
    } else {
      const enName = BANK_MAP_AR_TO_EN[details.bankName];
      if (enName && enName !== details.bankName) {
        onChangeDetails({
          ...details,
          bankName: enName,
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRTL]);

  // Helper to strip Egyptian country prefixes (+20, 0020, 20) when pasting
  const cleanEgyptianPhone = (raw: string): string => {
    let clean = normalizeArabicDigits(raw).replace(/[^0-9]/g, '');
    if (clean.startsWith('0020')) clean = clean.slice(4);
    else if (clean.startsWith('20') && clean.length > 11) clean = clean.slice(2);
    return clean;
  };

  // Auto-detect wallet operator
  const handleWalletPhoneChange = (raw: string) => {
    const normalized = cleanEgyptianPhone(raw);
    handleFieldChange('phoneNumber', normalized);

    if (normalized.startsWith('010')) {
      onResolvedPayoutMethodChange('VODAFONE_CASH');
    } else if (normalized.startsWith('011')) {
      onResolvedPayoutMethodChange('ETISALAT_CASH');
    } else if (normalized.startsWith('012')) {
      onResolvedPayoutMethodChange('ORANGE_CASH');
    } else if (normalized.startsWith('015')) {
      onResolvedPayoutMethodChange('WE_PAY');
    }
  };

  // Helper info for detected wallet
  const getWalletBadgeInfo = () => {
    switch (resolvedPayoutMethod) {
      case 'VODAFONE_CASH':
        return {
          name: t('wallet:withdraw.methods.vodafone', isRTL ? 'فودافون كاش' : 'Vodafone Cash'),
          badgeClass: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
        };
      case 'ORANGE_CASH':
        return {
          name: t('wallet:withdraw.methods.orange', isRTL ? 'أورنج كاش' : 'Orange Cash'),
          badgeClass: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20',
        };
      case 'ETISALAT_CASH':
        return {
          name: t('wallet:withdraw.methods.etisalat', isRTL ? 'اتصالات كاش' : 'Etisalat Cash'),
          badgeClass: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
        };
      case 'WE_PAY':
        return {
          name: t('wallet:withdraw.methods.we', isRTL ? 'وي باي' : 'WE Pay'),
          badgeClass: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
        };
      default:
        return {
          name: t('wallet:withdraw.methods.wallet', isRTL ? 'محفظة كاش' : 'Mobile Wallet'),
          badgeClass: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20',
        };
    }
  };

  // Validation checking for Next button state
  const isFormValid = () => {
    if (payoutCategory === 'BANK_ACCOUNT') {
      const hasBank = Boolean(details.bankName && details.bankName.trim().length >= 2);
      const hasHolder = Boolean(
        details.accountHolderName && details.accountHolderName.trim().length >= 3
      );
      const acc = details.accountNumber ? details.accountNumber.trim() : '';
      const iban = details.iban ? details.iban.trim().replace(/\s/g, '') : '';
      const hasAccountOrIban = acc.length >= 6 || iban.length === 29;
      return hasBank && hasHolder && hasAccountOrIban;
    }

    if (payoutCategory === 'INSTAPAY') {
      const ipa = details.ipaAddress ? details.ipaAddress.trim() : '';
      const phone = details.phoneNumber
        ? normalizeArabicDigits(details.phoneNumber.trim())
        : '';
      const hasIpaOrPhone = ipa.length >= 3 || /^01[0125][0-9]{8}$/.test(phone);
      return hasIpaOrPhone;
    }

    // Wallets
    const phone = details.phoneNumber
      ? normalizeArabicDigits(details.phoneNumber.trim()).replace(/[\s-]/g, '')
      : '';
    return /^01[0125][0-9]{8}$/.test(phone);
  };

  const walletBadge = getWalletBadgeInfo();
  const phoneVal = details.phoneNumber ? normalizeArabicDigits(details.phoneNumber) : '';
  const isRecognizedPrefix = /^01[0125]/.test(phoneVal);

  return (
    <div className="space-y-6">
      <div className="text-center sm:text-start space-y-1">
        <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white">
          {t('wallet:withdraw.fillDetailsTitle', 'بيانات وجهة استلام التحويل')}
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {t(
            'wallet:withdraw.fillDetailsSubtitle',
            'يرجى التأكد من دقة البيانات المدخلة لتجنب تأخير أو رفض التحويل المالي'
          )}
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-amber-500/60 dark:hover:border-amber-500/60 bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-sm hover:shadow-md transition-all duration-300 space-y-5">
        {/* 1. BANK ACCOUNT FIELDS */}
        {payoutCategory === 'BANK_ACCOUNT' && (
          <div className="space-y-4">
            {/* Bank Name */}
            <div className="space-y-2">
              <label
                htmlFor="bank-name-input"
                className="block text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200"
              >
                {t('wallet:withdraw.bankNameLabel', 'اسم البنك')} <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  id="bank-name-input"
                  type="text"
                  disabled={disabled}
                  value={details.bankName || ''}
                  onChange={(e) => handleFieldChange('bankName', e.target.value)}
                  placeholder={
                    isRTL ? 'مثال: البنك التجاري الدولي (CIB)' : 'e.g. Commercial International Bank'
                  }
                  className="w-full h-11 px-4 text-xs sm:text-sm bg-slate-50/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 rounded-xl outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all font-medium text-slate-900 dark:text-white"
                />
              </div>

              {/* Popular Banks Chips */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {popularBanks.map((bank) => (
                  <button
                    key={bank}
                    type="button"
                    disabled={disabled}
                    onClick={() => handleFieldChange('bankName', bank)}
                    className={`text-[11px] px-2.5 py-1 rounded-lg border transition-all duration-200 cursor-pointer ${
                      details.bankName === bank
                        ? 'bg-amber-500/10 border-amber-500 text-amber-600 dark:text-amber-400 font-bold'
                        : 'bg-slate-100/60 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 hover:border-amber-500/40 text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-700/60'
                    }`}
                  >
                    {bank}
                  </button>
                ))}
              </div>
            </div>

            {/* Account Holder Name */}
            <div className="space-y-1.5">
              <label
                htmlFor="account-holder-name-input"
                className="block text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200"
              >
                {t('wallet:withdraw.holderNameLabel', 'اسم صاحب الحساب بالكامل')} <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <User
                  className={`w-4 h-4 text-slate-400 absolute top-1/2 -translate-y-1/2 ${
                    isRTL ? 'right-3.5' : 'left-3.5'
                  }`}
                />
                <input
                  id="account-holder-name-input"
                  type="text"
                  disabled={disabled}
                  value={details.accountHolderName || ''}
                  onChange={(e) => handleFieldChange('accountHolderName', e.target.value)}
                  placeholder={
                    isRTL ? 'الاسم ثلاثي أو رباعي كما هو مسجل بالبنك' : 'Full name as on bank account'
                  }
                  className={`w-full h-11 text-xs sm:text-sm bg-slate-50/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 rounded-xl outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all font-medium text-slate-900 dark:text-white ${
                    isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'
                  }`}
                />
              </div>
            </div>

            {/* Account Number & IBAN (Either is required) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Account Number */}
              <div className="space-y-1.5">
                <label
                  htmlFor="account-number-input"
                  className="block text-xs font-bold text-slate-800 dark:text-slate-200"
                >
                  {t('wallet:withdraw.accountNumberLabel', 'رقم الحساب البنكي')}
                </label>
                <div className="relative">
                  <CreditCard
                    className={`w-4 h-4 text-slate-400 absolute top-1/2 -translate-y-1/2 ${
                      isRTL ? 'right-3.5' : 'left-3.5'
                    }`}
                  />
                  <input
                    id="account-number-input"
                    type="text"
                    inputMode="numeric"
                    disabled={disabled}
                    maxLength={20}
                    value={
                      isRTL
                        ? toLocalizedDigits(details.accountNumber || '', true)
                        : details.accountNumber || ''
                    }
                    onChange={(e) => {
                      const clean = normalizeArabicDigits(e.target.value).replace(/[^0-9]/g, '');
                      handleFieldChange('accountNumber', clean);
                    }}
                    placeholder={isRTL ? '١٠٠٠٢٣٤٥٦٧٨٩' : '100023456789'}
                    className={`w-full h-11 text-xs sm:text-sm font-mono bg-slate-50/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 rounded-xl outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all text-slate-900 dark:text-white ${
                      isRTL ? 'pr-10 pl-4 text-right' : 'pl-10 pr-4 text-left'
                    }`}
                  />
                </div>
              </div>

              {/* IBAN */}
              <div className="space-y-1.5">
                <label
                  htmlFor="iban-input"
                  className="block text-xs font-bold text-slate-800 dark:text-slate-200"
                >
                  {t(
                    'wallet:withdraw.ibanLabel',
                    isRTL ? 'رقم الآيبان (IBAN) - اختياري' : 'IBAN (Optional)'
                  )}
                </label>
                <input
                  id="iban-input"
                  type="text"
                  disabled={disabled}
                  maxLength={29}
                  value={details.iban || ''}
                  onChange={(e) =>
                    handleFieldChange('iban', e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))
                  }
                  placeholder="EG3800100001000234567890123"
                  className={`w-full h-11 px-4 text-xs sm:text-sm font-mono uppercase bg-slate-50/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 rounded-xl outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all text-slate-900 dark:text-white ${
                    isRTL ? 'text-right' : 'text-left'
                  }`}
                />
              </div>
            </div>

            <div className="flex items-center gap-2 p-3 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs border border-blue-500/20">
              <Info className="w-4 h-4 shrink-0" />
              <span>
                {t(
                  'wallet:withdraw.bankHint',
                  isRTL
                    ? 'يرجى إدخال رقم الحساب البنكي (أو رقم الآيبان IBAN إن وجد)'
                    : 'Please enter your bank account number (or IBAN if available)'
                )}
              </span>
            </div>
          </div>
        )}

        {/* 2. INSTAPAY FIELDS */}
        {payoutCategory === 'INSTAPAY' && (
          <div className="space-y-4">
            {/* IPA Address */}
            <div className="space-y-1.5">
              <label
                htmlFor="ipa-address-input"
                className="block text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200"
              >
                {t('wallet:withdraw.ipaAddressLabel', 'عنوان الدفع اللحظي (IPA)')}
              </label>
              <div className="relative">
                <Zap
                  className={`w-4 h-4 text-slate-400 absolute top-1/2 -translate-y-1/2 ${
                    isRTL ? 'right-3.5' : 'left-3.5'
                  }`}
                />
                <input
                  id="ipa-address-input"
                  type="text"
                  disabled={disabled}
                  value={details.ipaAddress || ''}
                  onChange={(e) => handleFieldChange('ipaAddress', e.target.value.trim())}
                  placeholder="username@instapay"
                  className={`w-full h-11 text-xs sm:text-sm font-mono bg-slate-50/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 rounded-xl outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all text-slate-900 dark:text-white ${
                    isRTL ? 'pr-10 pl-4 text-right' : 'pl-10 pr-4 text-left'
                  }`}
                />
              </div>
            </div>

            {/* OR Divider */}
            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-slate-200 dark:border-slate-700" />
              <span className="flex-shrink mx-4 text-xs font-bold text-slate-400 dark:text-slate-500">
                {t('wallet:withdraw.or', 'أو')}
              </span>
              <div className="flex-grow border-t border-slate-200 dark:border-slate-700" />
            </div>

            {/* InstaPay Phone Number */}
            <div className="space-y-1.5">
              <label
                htmlFor="instapay-phone-input"
                className="block text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200"
              >
                {t('wallet:withdraw.instapayPhoneLabel', 'رقم الهاتف المسجل بإنستاباي')}
              </label>
              <div className="relative">
                <Phone
                  className={`w-4 h-4 text-slate-400 absolute top-1/2 -translate-y-1/2 ${
                    isRTL ? 'right-3.5' : 'left-3.5'
                  }`}
                />
                <input
                  id="instapay-phone-input"
                  type="tel"
                  inputMode="numeric"
                  maxLength={11}
                  disabled={disabled}
                  value={
                    isRTL
                      ? toLocalizedDigits(details.phoneNumber || '', true)
                      : details.phoneNumber || ''
                  }
                  onChange={(e) => {
                    const clean = cleanEgyptianPhone(e.target.value);
                    handleFieldChange('phoneNumber', clean);
                  }}
                  placeholder={isRTL ? '٠١٠١٢٣٤٥٦٧٨' : '01012345678'}
                  className={`w-full h-11 text-xs sm:text-sm font-mono bg-slate-50/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 rounded-xl outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all text-slate-900 dark:text-white ${
                    isRTL ? 'pr-10 pl-4 text-right' : 'pl-10 pr-4 text-left'
                  }`}
                />
              </div>
            </div>

            {/* Account Holder Name (Optional) */}
            <div className="space-y-1.5">
              <label
                htmlFor="instapay-holder-name-input"
                className="block text-xs font-bold text-slate-700 dark:text-slate-300"
              >
                {t('wallet:withdraw.holderNameOptionalLabel', 'اسم المستلم (اختياري)')}
              </label>
              <input
                id="instapay-holder-name-input"
                type="text"
                disabled={disabled}
                value={details.accountHolderName || ''}
                onChange={(e) => handleFieldChange('accountHolderName', e.target.value)}
                placeholder={isRTL ? 'اسم صاحب حساب إنستاباي' : 'InstaPay account owner name'}
                className="w-full h-11 px-4 text-xs sm:text-sm bg-slate-50/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 rounded-xl outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all text-slate-900 dark:text-white"
              />
            </div>

            <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs border border-amber-500/20">
              <Info className="w-4 h-4 shrink-0" />
              <span>
                {t(
                  'wallet:withdraw.instapayHint',
                  'أدخل عنوان IPA أو رقم الهاتف المسجل في إنستاباي على الأقل'
                )}
              </span>
            </div>
          </div>
        )}

        {/* 3. MOBILE WALLETS (Auto-Detect: Vodafone, Orange, Etisalat, WE) */}
        {payoutCategory === 'MOBILE_WALLET' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="wallet-phone-input"
                  className="block text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200"
                >
                  {t('wallet:withdraw.walletPhoneLabel', 'رقم الهاتف المسجل بالمحفظة')}{' '}
                  <span className="text-rose-500">*</span>
                </label>

                {/* Operator Badge Auto-detected */}
                {isRecognizedPrefix && (
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[11px] font-bold ${walletBadge.badgeClass}`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{walletBadge.name}</span>
                  </span>
                )}
              </div>

              <div className="relative">
                <Smartphone
                  className={`w-4 h-4 text-slate-400 absolute top-1/2 -translate-y-1/2 ${
                    isRTL ? 'right-3.5' : 'left-3.5'
                  }`}
                />
                <input
                  id="wallet-phone-input"
                  type="tel"
                  inputMode="numeric"
                  maxLength={11}
                  disabled={disabled}
                  value={
                    isRTL
                      ? toLocalizedDigits(details.phoneNumber || '', true)
                      : details.phoneNumber || ''
                  }
                  onChange={(e) => {
                    const clean = normalizeArabicDigits(e.target.value).replace(/[^0-9]/g, '');
                    handleWalletPhoneChange(clean);
                  }}
                  placeholder={isRTL ? '٠١٠١٢٣٤٥٦٧٨' : '01012345678'}
                  className={`w-full h-12 text-sm sm:text-base font-mono bg-slate-50/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 rounded-xl outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all text-slate-900 dark:text-white ${
                    isRTL ? 'pr-10 pl-4 text-right' : 'pl-10 pr-4 text-left'
                  }`}
                />
              </div>

              <p className="text-[11px] text-slate-400 dark:text-slate-500">
                {isRTL
                  ? 'يدعم جميع المحافظ المصرية: ٠١٠ (فودافون)، ٠١١ (اتصالات)، ٠١٢ (أورنج)، ٠١٥ (وي)'
                  : 'Supports all Egyptian wallets: 010 (Vodafone), 011 (Etisalat), 012 (Orange), 015 (WE)'}
              </p>
            </div>

            <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs border border-emerald-500/20">
              <Info className="w-4 h-4 shrink-0" />
              <span>
                {t(
                  'wallet:withdraw.walletHint',
                  'تأكد أن المحفظة مفعلة وجاهزة لاستقبال التحويلات دون تجاوز الحد الشهري لمحفظتك'
                )}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Buttons (Back / Next) — Shown on Mobile / Tablet (< lg), moved to Sidebar on Desktop */}
      <div className="flex lg:hidden items-center gap-3 pt-2">
        <button
          type="button"
          disabled={disabled}
          onClick={onBack}
          className="h-12 px-5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-amber-500/60 dark:hover:border-amber-500/60 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs sm:text-sm transition-all duration-200 cursor-pointer flex items-center gap-2"
        >
          {isRTL ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
          <span>{t('wallet:actions.previous', isRTL ? 'السابق' : 'Previous')}</span>
        </button>

        <button
          type="button"
          disabled={!isFormValid() || disabled}
          onClick={onNext}
          className="flex-1 h-12 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-sm sm:text-base shadow-sm hover:shadow-md active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:pointer-events-none cursor-pointer group"
        >
          <span>
            {t(
              'wallet:withdraw.continueToReview',
              isRTL ? 'متابعة للمراجعة والتأكيد' : 'Continue to Review'
            )}
          </span>
          {isRTL ? (
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          ) : (
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          )}
        </button>
      </div>
    </div>
  );
};
