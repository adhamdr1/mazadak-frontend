import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  X,
  User as UserIcon,
  Phone,
  MapPin,
  Calendar,
  Wallet,
  ShieldAlert,
  ShieldCheck,
  Coins,
  ExternalLink,
  Gavel,
  Receipt,
  CheckCircle2,
  Layers,
} from 'lucide-react';
import { UserAvatar } from '@/features/users';
import { Button } from '@/components/common/Button';
import { Spinner } from '@/components/common/Spinner';
import {
  formatAdminDate,
  formatAdminPhone,
  formatAdminCity,
  formatAdminCurrency,
  formatAdminNumber,
  getAuctionStatusBadge,
  getTransactionTypeLabel,
  getTransactionTypeIconConfig,
  getTransactionStatusBadge,
} from '../../utils/admin.utils';
import { useAdminUserDetails } from '../../hooks/useAdminUserDetails';
import type { User } from '../../types/admin.types';

export interface UserDetailsDrawerProps {
  userId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenAdjustBalance: (user: User, currentBalance: string | number) => void;
  onOpenBanConfirm: (user: User) => void;
}

export const UserDetailsDrawer: React.FC<UserDetailsDrawerProps> = ({
  userId,
  isOpen,
  onClose,
  onOpenAdjustBalance,
  onOpenBanConfirm,
}) => {
  const { t, i18n } = useTranslation(['admin', 'common']);
  const isRTL = i18n.language?.startsWith('ar');
  const [activeTab, setActiveTab] = useState<'overview' | 'auctions' | 'transactions'>('overview');

  const { data: details, isLoading } = useAdminUserDetails(userId);

  if (!isOpen) return null;

  const user = details?.user;
  const wallet = details?.wallet;
  const recentAuctions = details?.recentAuctions?.items || [];
  const recentTransactions = details?.recentTransactions?.items || [];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden select-none">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity duration-300"
        onClick={onClose}
      />

      <div className={`fixed inset-y-0 ${isRTL ? 'left-0' : 'right-0'} max-w-full flex pl-0`}>
        <div className="w-screen max-w-md sm:max-w-lg bg-white dark:bg-slate-900 border-s border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col">
          {/* Top Header */}
          <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-950/40">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/20">
                <UserIcon className="w-4 h-4" />
              </div>
              <div className="flex items-center gap-2.5 min-w-0 flex-wrap">
                <h3 className="font-black text-sm sm:text-base text-slate-900 dark:text-white truncate">
                  {t('users.drawer.title', { defaultValue: 'ملف المستخدم' })}
                </h3>
                <code className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200/80 dark:border-slate-700/80 select-all font-semibold shrink-0">
                  #{userId}
                </code>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Drawer Body */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 custom-scrollbar">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-24 space-y-3">
                <Spinner size="lg" />
                <p className="text-xs text-slate-400">{t('common:loading', { defaultValue: 'جاري التحميل...' })}</p>
              </div>
            ) : !user ? (
              <div className="text-center py-20 text-slate-400 text-sm">
                {t('users.drawer.notFound', { defaultValue: 'تعذر العثور على بيانات المستخدم' })}
              </div>
            ) : (
              <>
                {/* 1. User Identity & Badges */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-3xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <UserAvatar
                      firstName={user.firstName}
                      lastName={user.lastName}
                      userId={user._id}
                      size="lg"
                    />
                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-black text-base text-slate-900 dark:text-white truncate">
                          {user.firstName} {user.lastName}
                        </h4>
                        {user.isBanned ? (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                            {t('users.table.banned', { defaultValue: 'محظور' })}
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                            {t('users.table.active', { defaultValue: 'نشط' })}
                          </span>
                        )}
                        {user.role === 'ADMIN' && (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                            {t('layout.header.adminRoleBadge', { defaultValue: 'مسؤول' })}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-mono truncate">{user.email}</p>
                    </div>
                  </div>

                  <Link
                    to={`/users/${user._id}`}
                    target="_blank"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 transition-colors shrink-0 self-end sm:self-auto"
                  >
                    <span>{t('users.drawer.publicProfile', { defaultValue: 'البروفايل العام' })}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>

                {/* 2. Wallet Command Section */}
                <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/20">
                        <Wallet className="w-4 h-4" />
                      </div>
                      <span className="text-xs sm:text-sm font-black text-slate-900 dark:text-white truncate">
                        {t('users.drawer.walletDetails', { defaultValue: 'المحفظة والرصيد' })}
                      </span>
                    </div>

                    <Button
                      type="button"
                      variant="accent"
                      size="sm"
                      leftIcon={<Coins className="w-3.5 h-3.5" />}
                      onClick={() => onOpenAdjustBalance(user, wallet?.balance || '0')}
                      className="text-xs font-bold shadow-xs py-1.5 shrink-0 whitespace-nowrap"
                    >
                      {t('users.drawer.adjustBalanceBtn', { defaultValue: 'تسوية رصيد' })}
                    </Button>
                  </div>

                  <div className="grid grid-cols-3 gap-2 sm:gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                    <div className="p-2.5 sm:p-3 rounded-2xl bg-amber-50/60 dark:bg-amber-500/5 border border-amber-200/60 dark:border-amber-500/15">
                      <p className="text-[10px] font-bold text-amber-800 dark:text-amber-400/90 truncate">
                        {t('users.drawer.totalBalance', { defaultValue: 'الرصيد الكلي' })}
                      </p>
                      <p className="font-mono font-black text-xs sm:text-sm text-amber-950 dark:text-amber-300 mt-1 truncate">
                        {formatAdminCurrency(wallet?.balance || '0', undefined, isRTL)}
                      </p>
                    </div>
                    <div className="p-2.5 sm:p-3 rounded-2xl bg-emerald-50/60 dark:bg-emerald-500/5 border border-emerald-200/60 dark:border-emerald-500/15">
                      <p className="text-[10px] font-bold text-emerald-800 dark:text-emerald-400/90 truncate">
                        {t('users.drawer.availableBalance', { defaultValue: 'المتاح' })}
                      </p>
                      <p className="font-mono font-black text-xs sm:text-sm text-emerald-950 dark:text-emerald-300 mt-1 truncate">
                        {formatAdminCurrency(wallet?.availableBalance || '0', undefined, isRTL)}
                      </p>
                    </div>
                    <div className="p-2.5 sm:p-3 rounded-2xl bg-cyan-50/60 dark:bg-cyan-500/5 border border-cyan-200/60 dark:border-cyan-500/15">
                      <p className="text-[10px] font-bold text-cyan-800 dark:text-cyan-400/90 truncate">
                        {t('users.drawer.heldBalance', { defaultValue: 'المحجوز' })}
                      </p>
                      <p className="font-mono font-black text-xs sm:text-sm text-cyan-950 dark:text-cyan-300 mt-1 truncate">
                        {formatAdminCurrency(wallet?.heldBalance || '0', undefined, isRTL)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* 3. Account Metadata Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800">
                    <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-[10px] text-slate-400">{t('users.table.phone', { defaultValue: 'الهاتف' })}</p>
                      <p className="font-mono font-bold text-slate-800 dark:text-slate-200 truncate">
                        {formatAdminPhone(user.phoneNumber, isRTL)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800">
                    <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-[10px] text-slate-400">{t('users.table.location', { defaultValue: 'العنوان' })}</p>
                      <p className="font-bold text-slate-800 dark:text-slate-200 truncate">
                        {user.address
                          ? `${formatAdminCity(user.address.city, isRTL)} - ${user.address.street}`
                          : (isRTL ? 'غير محدد' : 'Not specified')}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800">
                    <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-[10px] text-slate-400">{t('users.drawer.joinedDate', { defaultValue: 'تاريخ الانضمام' })}</p>
                      <p className="font-bold text-slate-800 dark:text-slate-200 truncate">
                        {formatAdminDate(user.createdAt, i18n.language, isRTL)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800">
                    <CheckCircle2
                      className={`w-4 h-4 shrink-0 ${user.isEmailVerified ? 'text-emerald-500' : 'text-slate-400'
                        }`}
                    />
                    <div className="min-w-0">
                      <p className="text-[10px] text-slate-400">{t('users.drawer.emailStatus', { defaultValue: 'توثيق البريد' })}</p>
                      <p className="font-bold text-slate-800 dark:text-slate-200 truncate">
                        {user.isEmailVerified
                          ? t('users.table.verified', { defaultValue: 'موثق' })
                          : t('users.table.unverified', { defaultValue: 'غير موثق' })}
                      </p>
                    </div>
                  </div>
                </div>

                {/* 4. Action Banner (Ban/Unban) */}
                <div className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20">
                  <div className="flex items-center gap-2">
                    {user.isBanned ? (
                      <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <ShieldAlert className="w-4 h-4 text-rose-500" />
                    )}
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      {user.isBanned
                        ? t('users.drawer.accountCurrentlyBanned', { defaultValue: 'الحساب محظور حالياً' })
                        : t('users.drawer.accountActive', { defaultValue: 'الحساب نشط' })}
                    </span>
                  </div>

                  <Button
                    type="button"
                    variant={user.isBanned ? 'primary' : 'danger'}
                    size="sm"
                    onClick={() => onOpenBanConfirm(user)}
                    className={`text-xs font-bold py-1 ${user.isBanned ? 'bg-emerald-600 hover:bg-emerald-500 text-white' : ''}`}
                  >
                    {user.isBanned
                      ? t('users.table.unban', { defaultValue: 'إلغاء الحظر' })
                      : t('users.table.ban', { defaultValue: 'حظر المستخدم' })}
                  </Button>
                </div>

                {/* 5. Sub-tabs: Recent Auctions & Recent Transactions */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
                    <button
                      type="button"
                      onClick={() => setActiveTab('overview')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeTab === 'overview'
                          ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                          : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                        }`}
                    >
                      {t('users.drawer.tabs.overview', { defaultValue: 'نظرة عامة' })}
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('auctions')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeTab === 'auctions'
                          ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                          : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                        }`}
                    >
                      <Gavel className="w-3.5 h-3.5" />
                      <span>{t('users.drawer.tabs.auctions', { defaultValue: 'آخر المزادات' })}</span>
                      <span
                        className={`inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-[11px] font-bold font-mono transition-colors ${
                          activeTab === 'auctions'
                            ? 'bg-amber-500/25 text-amber-800 dark:text-amber-300 border border-amber-500/35'
                            : 'bg-slate-200/70 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-300/40 dark:border-slate-700/50'
                        }`}
                      >
                        {formatAdminNumber(recentAuctions.length, isRTL)}
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('transactions')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeTab === 'transactions'
                          ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                          : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                        }`}
                    >
                      <Receipt className="w-3.5 h-3.5" />
                      <span>{t('users.drawer.tabs.transactions', { defaultValue: 'آخر العمليات' })}</span>
                      <span
                        className={`inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-[11px] font-bold font-mono transition-colors ${
                          activeTab === 'transactions'
                            ? 'bg-amber-500/25 text-amber-800 dark:text-amber-300 border border-amber-500/35'
                            : 'bg-slate-200/70 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-300/40 dark:border-slate-700/50'
                        }`}
                      >
                        {formatAdminNumber(recentTransactions.length, isRTL)}
                      </span>
                    </button>
                  </div>

                  {/* Tab 1: Overview Quick Stats */}
                  {activeTab === 'overview' && (
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-1">
                        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                          <Layers className="w-4 h-4 text-amber-500" />
                          <span>{t('users.drawer.totalAuctions', { defaultValue: 'إجمالي المزادات' })}</span>
                        </div>
                        <p className="text-base font-black text-slate-900 dark:text-white font-mono">
                          {formatAdminNumber(details?.recentAuctions?.total || 0, isRTL)}
                        </p>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-1">
                        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                          <Receipt className="w-4 h-4 text-cyan-500" />
                          <span>{t('users.drawer.totalTransactionsCount', { defaultValue: 'إجمالي المعاملات' })}</span>
                        </div>
                        <p className="text-base font-black text-slate-900 dark:text-white font-mono">
                          {formatAdminNumber(details?.recentTransactions?.total || 0, isRTL)}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Tab 2: Recent Auctions List */}
                  {activeTab === 'auctions' && (
                    <div className="space-y-2.5">
                      {recentAuctions.length === 0 ? (
                        <p className="text-xs text-slate-400 text-center py-6">
                          {t('users.drawer.noAuctions', { defaultValue: 'لا توجد مزادات مسجلة لهذا المستخدم' })}
                        </p>
                      ) : (
                        recentAuctions.map((auc) => {
                          const auctionStatus = getAuctionStatusBadge(auc.status, isRTL);
                          return (
                            <Link
                              key={auc._id}
                              to={`/auctions/${auc._id}`}
                              target="_blank"
                              className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 hover:border-amber-500/40 hover:bg-slate-100/70 dark:hover:bg-slate-800/70 transition-all text-xs group gap-3"
                            >
                              <div className="min-w-0 flex-1 space-y-0.5">
                                <p className="font-bold text-slate-900 dark:text-white truncate group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                                  {auc.title}
                                </p>
                                <p className="text-[10px] text-slate-400">
                                  {formatAdminDate(auc.createdAt, i18n.language, isRTL)}
                                </p>
                              </div>
                              <div className="text-end shrink-0 flex flex-col items-end space-y-1.5">
                                <p className="font-mono font-bold text-xs sm:text-sm text-slate-800 dark:text-slate-200">
                                  {formatAdminCurrency(auc.currentPrice, undefined, isRTL)}
                                </p>
                                <span
                                  className={`inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-lg border ${auctionStatus.bgClass}`}
                                >
                                  {auctionStatus.label}
                                </span>
                              </div>
                            </Link>
                          );
                        })
                      )}
                    </div>
                  )}

                  {/* Tab 3: Recent Transactions List */}
                  {activeTab === 'transactions' && (
                    <div className="space-y-2.5">
                      {recentTransactions.length === 0 ? (
                        <p className="text-xs text-slate-400 text-center py-6">
                          {t('users.drawer.noTransactions', { defaultValue: 'لا توجد معاملات مسجلة لهذا المستخدم' })}
                        </p>
                      ) : (
                        recentTransactions.map((trx) => {
                          const iconConfig = getTransactionTypeIconConfig(trx.type);
                          const statusBadge = getTransactionStatusBadge(trx.status, isRTL);
                          return (
                            <div
                              key={trx._id}
                              className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 text-xs gap-3"
                            >
                              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                <div
                                  className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${iconConfig.bgClass}`}
                                >
                                  <Receipt className="w-4 h-4" />
                                </div>
                                <div className="min-w-0 space-y-0.5">
                                  <p className="font-bold text-slate-800 dark:text-slate-200 truncate">
                                    {getTransactionTypeLabel(trx.type, isRTL)}
                                  </p>
                                  <p className="text-[10px] text-slate-400">
                                    {formatAdminDate(trx.createdAt, i18n.language, isRTL)}
                                  </p>
                                </div>
                              </div>
                              <div className="text-end shrink-0 flex flex-col items-end space-y-1.5">
                                <p className="font-mono font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                                  {formatAdminCurrency(trx.amount, undefined, isRTL)}
                                </p>
                                <span
                                  className={`inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-lg border ${statusBadge.bgClass}`}
                                >
                                  {statusBadge.label}
                                </span>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDetailsDrawer;
