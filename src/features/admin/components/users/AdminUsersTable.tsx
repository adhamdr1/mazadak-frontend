import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Search,
  X,
  ShieldCheck,
  ShieldAlert,
  Coins,
  UserCheck,
  Crown,
  Eye,
  ArrowUpDown,
} from 'lucide-react';
import { RefreshButton } from '@/components/common/RefreshButton';
import { DateRangeFilter } from '@/components/common/DateRangeFilter';
import { UserAvatar } from '@/features/users';
import { Pagination } from '@/components/common/Pagination';
import { formatAdminDate, formatAdminCity, formatAdminPhone } from '../../utils/admin.utils';
import type { User, UserRole } from '../../types/admin.types';

export interface AdminUsersTableProps {
  users: User[];
  total?: number;
  totalPages: number;
  currentPage: number;
  isLoading: boolean;
  isRefetching: boolean;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  selectedRole?: UserRole | 'ALL';
  onRoleChange: (role: UserRole | 'ALL') => void;
  selectedBanStatus?: 'ALL' | 'ACTIVE' | 'BANNED';
  onBanStatusChange: (status: 'ALL' | 'ACTIVE' | 'BANNED') => void;
  selectedVerification?: 'ALL' | 'VERIFIED' | 'UNVERIFIED';
  onVerificationChange: (status: 'ALL' | 'VERIFIED' | 'UNVERIFIED') => void;
  startDate?: string;
  endDate?: string;
  onDateRangeChange: (range: { startDate?: string; endDate?: string }) => void;
  sortOrder: 'DESC' | 'ASC';
  onSortOrderToggle: () => void;
  onPageChange: (page: number) => void;
  onRefresh: () => void;
  onViewDetails: (user: User) => void;
  onAdjustBalance: (user: User) => void;
  onToggleBan: (user: User) => void;
}

export const AdminUsersTable: React.FC<AdminUsersTableProps> = ({
  users,
  total,
  totalPages,
  currentPage,
  isLoading,
  isRefetching,
  searchQuery,
  onSearchChange,
  selectedRole = 'ALL',
  onRoleChange,
  selectedBanStatus = 'ALL',
  onBanStatusChange,
  selectedVerification = 'ALL',
  onVerificationChange,
  startDate,
  endDate,
  onDateRangeChange,
  sortOrder,
  onSortOrderToggle,
  onPageChange,
  onRefresh,
  onViewDetails,
  onAdjustBalance,
  onToggleBan,
}) => {
  const { t, i18n } = useTranslation(['admin', 'common']);
  const isRTL = i18n.language?.startsWith('ar');

  return (
    <div className="space-y-4">
      {/* 1. Control & Filter Command Toolbar */}
      <div className="relative z-20 bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-4">
        {/* Top bar: Search + Date Range + Sort + Refresh */}
        <div className="flex flex-col xl:flex-row items-stretch xl:items-center gap-2 sm:gap-2.5 w-full">
          {/* Direct Reactive Search Bar: Row 1 on < xl (Full Width for spacious placeholder), Flex-1 on xl */}
          <div className="relative w-full xl:flex-1 min-w-0">
            <Search className="w-4 h-4 text-slate-400 absolute start-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={t('users.filters.searchPlaceholder', {
                defaultValue: isRTL
                  ? 'بحث بالاسم، البريد الإلكتروني، أو رقم الهاتف...'
                  : 'Search by name, email, or phone number...',
              })}
              className="w-full ps-10 pe-10 py-2.5 rounded-2xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all truncate"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                className="absolute end-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Controls: Row 2 on < xl (fills row width evenly), inline on xl */}
          <div className="flex items-center gap-2 sm:gap-2.5 w-full xl:w-auto flex-nowrap shrink-0">
            {/* Date Range Filter */}
            <div className="flex-1 min-w-0 xl:flex-initial xl:w-auto">
              <DateRangeFilter
                startDate={startDate}
                endDate={endDate}
                onChange={onDateRangeChange}
              />
            </div>

            {/* Sort Toggle */}
            <button
              type="button"
              onClick={onSortOrderToggle}
              className="flex-1 min-w-0 xl:flex-initial xl:w-auto inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 hover:border-amber-500/50 hover:text-amber-600 dark:hover:text-amber-400 transition-colors cursor-pointer shrink-0 shadow-2xs"
            >
              <ArrowUpDown className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span className="truncate">
                {sortOrder === 'DESC'
                  ? t('users.filters.newest', { defaultValue: isRTL ? 'الأحدث أولاً' : 'Newest First' })
                  : t('users.filters.oldest', { defaultValue: isRTL ? 'الأقدم أولاً' : 'Oldest First' })}
              </span>
            </button>

            {/* Standardized Shared Refresh Button */}
            <div className="shrink-0">
              <RefreshButton
                onRefresh={onRefresh}
                isLoading={isLoading}
                isRefetching={isRefetching}
                label={t('common:refresh', { defaultValue: isRTL ? 'تحديث' : 'Refresh' })}
                showLabelOnMobile={false}
              />
            </div>
          </div>
        </div>

        {/* Filter Pills Segment (Full-width 3-group grid, no truncation, responsive pill sizes) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800/80 text-xs">
          {/* Role Filter Group */}
          <div className="grid grid-cols-3 gap-0.5 sm:gap-1 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/40">
            <button
              type="button"
              onClick={() => onRoleChange('ALL')}
              className={`py-1.5 px-1 sm:px-1.5 text-center rounded-xl font-bold transition-colors duration-150 whitespace-nowrap cursor-pointer select-none text-[11px] sm:text-xs border outline-none ${
                selectedRole === 'ALL'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white border-slate-200 dark:border-slate-700 shadow-2xs'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-700/50'
              }`}
            >
              {t('users.filters.allRoles', { defaultValue: isRTL ? 'الكل' : 'All' })}
            </button>
            <button
              type="button"
              onClick={() => onRoleChange('USER')}
              className={`py-1.5 px-1 sm:px-1.5 text-center rounded-xl font-bold transition-colors duration-150 whitespace-nowrap cursor-pointer select-none text-[11px] sm:text-xs border outline-none ${
                selectedRole === 'USER'
                  ? 'bg-blue-500/10 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border-blue-500/35 shadow-2xs'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-700/50'
              }`}
            >
              {t('users.filters.roleUser', { defaultValue: isRTL ? 'مستخدم' : 'User' })}
            </button>
            <button
              type="button"
              onClick={() => onRoleChange('ADMIN')}
              className={`py-1.5 px-1 sm:px-1.5 text-center rounded-xl font-bold transition-colors duration-150 whitespace-nowrap cursor-pointer select-none text-[11px] sm:text-xs border outline-none ${
                selectedRole === 'ADMIN'
                  ? 'bg-amber-500/10 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border-amber-500/35 shadow-2xs'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-700/50'
              }`}
            >
              {t('users.filters.roleAdmin', { defaultValue: isRTL ? 'مسؤول' : 'Admin' })}
            </button>
          </div>

          {/* Status Filter Group */}
          <div className="grid grid-cols-3 gap-0.5 sm:gap-1 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/40">
            <button
              type="button"
              onClick={() => onBanStatusChange('ALL')}
              className={`py-1.5 px-1 sm:px-1.5 text-center rounded-xl font-bold transition-colors duration-150 whitespace-nowrap cursor-pointer select-none text-[11px] sm:text-xs border outline-none ${
                selectedBanStatus === 'ALL'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white border-slate-200 dark:border-slate-700 shadow-2xs'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-700/50'
              }`}
            >
              {t('users.filters.allStatuses', { defaultValue: isRTL ? 'الكل' : 'All' })}
            </button>
            <button
              type="button"
              onClick={() => onBanStatusChange('ACTIVE')}
              className={`py-1.5 px-1 sm:px-1.5 text-center rounded-xl font-bold transition-colors duration-150 whitespace-nowrap cursor-pointer select-none text-[11px] sm:text-xs border outline-none ${
                selectedBanStatus === 'ACTIVE'
                  ? 'bg-emerald-500/10 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-500/35 shadow-2xs'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-700/50'
              }`}
            >
              {t('users.filters.statusActive', { defaultValue: isRTL ? 'نشط' : 'Active' })}
            </button>
            <button
              type="button"
              onClick={() => onBanStatusChange('BANNED')}
              className={`py-1.5 px-1 sm:px-1.5 text-center rounded-xl font-bold transition-colors duration-150 whitespace-nowrap cursor-pointer select-none text-[11px] sm:text-xs border outline-none ${
                selectedBanStatus === 'BANNED'
                  ? 'bg-rose-500/10 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border-rose-500/35 shadow-2xs'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-700/50'
              }`}
            >
              {t('users.filters.statusBanned', { defaultValue: isRTL ? 'محظور' : 'Banned' })}
            </button>
          </div>

          {/* Email Verification Filter Group */}
          <div className="grid grid-cols-3 gap-0.5 sm:gap-1 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/40">
            <button
              type="button"
              onClick={() => onVerificationChange('ALL')}
              className={`py-1.5 px-1 sm:px-1.5 text-center rounded-xl font-bold transition-colors duration-150 whitespace-nowrap cursor-pointer select-none text-[11px] sm:text-xs border outline-none ${
                selectedVerification === 'ALL'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white border-slate-200 dark:border-slate-700 shadow-2xs'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-700/50'
              }`}
            >
              {t('users.filters.allVerifications', { defaultValue: isRTL ? 'الكل' : 'All' })}
            </button>
            <button
              type="button"
              onClick={() => onVerificationChange('VERIFIED')}
              className={`py-1.5 px-1 sm:px-1.5 text-center rounded-xl font-bold transition-colors duration-150 whitespace-nowrap cursor-pointer select-none text-[11px] sm:text-xs border outline-none ${
                selectedVerification === 'VERIFIED'
                  ? 'bg-emerald-500/10 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-500/35 shadow-2xs'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-700/50'
              }`}
            >
              {t('users.filters.verified', { defaultValue: isRTL ? 'موثق' : 'Verified' })}
            </button>
            <button
              type="button"
              onClick={() => onVerificationChange('UNVERIFIED')}
              className={`py-1.5 px-1 sm:px-1.5 text-center rounded-xl font-bold transition-colors duration-150 whitespace-nowrap cursor-pointer select-none text-[11px] sm:text-xs border outline-none ${
                selectedVerification === 'UNVERIFIED'
                  ? 'bg-amber-500/10 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border-amber-500/35 shadow-2xs'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-700/50'
              }`}
            >
              {t('users.filters.unverified', { defaultValue: isRTL ? 'غير موثق' : 'Unverified' })}
            </button>
          </div>
        </div>
      </div>

      {/* 2. High-Density Users Data Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-950/40 text-slate-500 dark:text-slate-400 font-bold uppercase text-[11px] tracking-wider">
                <th className="py-3.5 px-4 text-center w-[26%] min-w-[210px]">
                  {t('users.table.user', { defaultValue: 'المستخدم' })}
                </th>
                <th className="py-3.5 px-4 text-center w-[12%] min-w-[100px] whitespace-nowrap">
                  {t('users.table.role', { defaultValue: 'الرتبة' })}
                </th>
                <th className="py-3.5 px-4 text-center w-[12%] min-w-[100px] whitespace-nowrap">
                  {t('users.table.status', { defaultValue: 'الحالة' })}
                </th>
                <th className="py-3.5 px-4 text-center w-[12%] min-w-[100px] whitespace-nowrap">
                  {t('users.table.emailVerified', { defaultValue: 'التوثيق' })}
                </th>
                <th className="py-3.5 px-4 text-center w-[15%] min-w-[130px]">
                  {t('users.table.contact', { defaultValue: 'الاتصال والموقع' })}
                </th>
                <th className="py-3.5 px-4 text-center w-[13%] min-w-[120px] whitespace-nowrap">
                  {t('users.table.joinedAt', { defaultValue: 'تاريخ الانضمام' })}
                </th>
                <th className="py-3.5 px-4 text-center w-[10%] min-w-[100px] whitespace-nowrap">
                  {t('users.table.actions', { defaultValue: 'الإجراءات' })}
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 font-normal">
              {isLoading ? (
                // Skeletons
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="py-4 ps-6 pe-4 text-start">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-800 shrink-0" />
                        <div className="space-y-1.5 text-start">
                          <div className="w-24 h-3.5 bg-slate-200 dark:bg-slate-800 rounded" />
                          <div className="w-32 h-2.5 bg-slate-200 dark:bg-slate-800 rounded" />
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <div className="w-16 h-5 bg-slate-200 dark:bg-slate-800 rounded-xl mx-auto" />
                    </td>
                    <td className="py-4 px-4 text-center">
                      <div className="w-16 h-5 bg-slate-200 dark:bg-slate-800 rounded-xl mx-auto" />
                    </td>
                    <td className="py-4 px-4 text-center">
                      <div className="w-16 h-5 bg-slate-200 dark:bg-slate-800 rounded-xl mx-auto" />
                    </td>
                    <td className="py-4 px-4 text-center space-y-1">
                      <div className="w-24 h-3 bg-slate-200 dark:bg-slate-800 rounded mx-auto" />
                      <div className="w-16 h-2.5 bg-slate-200 dark:bg-slate-800 rounded mx-auto" />
                    </td>
                    <td className="py-4 px-4 text-center">
                      <div className="w-20 h-3.5 bg-slate-200 dark:bg-slate-800 rounded mx-auto" />
                    </td>
                    <td className="py-4 px-4 text-center">
                      <div className="w-16 h-8 bg-slate-200 dark:bg-slate-800 rounded mx-auto" />
                    </td>
                  </tr>
                ))
              ) : users.length === 0 ? (
                // Empty State
                <tr>
                  <td colSpan={7} className="text-center py-16 text-slate-400 space-y-2">
                    <UserCheck className="w-8 h-8 text-slate-300 dark:text-slate-700 mx-auto" />
                    <p className="font-bold text-sm text-slate-700 dark:text-slate-300">
                      {t('users.table.emptyTitle', { defaultValue: 'لم يتم العثور على أي مستخدمين' })}
                    </p>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto">
                      {t('users.table.emptyDesc', { defaultValue: 'جرب تغيير معايير البحث أو تصفية الحالات للحصول على نتائج.' })}
                    </p>
                  </td>
                </tr>
              ) : (
                // Rows
                users.map((u) => {
                  const isUserAdmin = u.role === 'ADMIN';

                  return (
                    <tr
                      key={u._id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors group"
                    >
                      {/* 1. User Identity (Start-aligned, avatar and texts in single straight column) */}
                      <td className="py-3.5 ps-6 pe-4 text-start">
                        <div className="flex items-center gap-3">
                          <div className="shrink-0">
                            <UserAvatar
                              firstName={u.firstName}
                              lastName={u.lastName}
                              userId={u._id}
                              size="md"
                            />
                          </div>
                          <div className="min-w-0 text-start">
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-slate-900 dark:text-white truncate">
                                {u.firstName} {u.lastName}
                              </span>
                              {u.authProvider === 'GOOGLE' && (
                                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 shrink-0">
                                  Google
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] font-mono text-slate-500 dark:text-slate-400 truncate mt-0.5" title={u.email}>
                              {u.email}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* 2. Role */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center">
                          {isUserAdmin ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[10px] font-black bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                              <Crown className="w-3 h-3 shrink-0" />
                              <span>{isRTL ? 'مسؤول' : 'ADMIN'}</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-xl text-[10px] font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/25">
                              <span>{isRTL ? 'مستخدم' : 'USER'}</span>
                            </span>
                          )}
                        </div>
                      </td>

                      {/* 3. Status (Active / Banned) */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center">
                          {u.isBanned ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[10px] font-black bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                              <span>{t('users.table.banned', { defaultValue: 'محظور' })}</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[10px] font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                              <span>{t('users.table.active', { defaultValue: 'نشط' })}</span>
                            </span>
                          )}
                        </div>
                      </td>

                      {/* 4. Verification */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center">
                          {u.isEmailVerified ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[10px] font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25">
                              <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                              <span>{t('users.table.verified', { defaultValue: 'موثق' })}</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[10px] font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/25">
                              <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                              <span>{t('users.table.unverified', { defaultValue: 'غير موثق' })}</span>
                            </span>
                          )}
                        </div>
                      </td>

                      {/* 5. Contact & City */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="space-y-0.5 text-center">
                          <p className="font-mono text-xs text-slate-700 dark:text-slate-300 truncate">
                            {formatAdminPhone(u.phoneNumber, isRTL)}
                          </p>
                          <p className="text-[10px] text-slate-400 truncate">
                            {formatAdminCity(u.address?.city, isRTL)}
                          </p>
                        </div>
                      </td>

                      {/* 6. Joined At */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-center text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                        {formatAdminDate(u.createdAt, i18n.language, isRTL)}
                      </td>

                      {/* 7. Action Buttons */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        {isUserAdmin ? (
                          <span
                            className="text-slate-400 dark:text-slate-600 font-bold select-none text-base inline-block"
                            title={t('users.table.adminProtected', {
                              defaultValue: isRTL ? 'حساب مسؤول محمي' : 'Protected Administrator',
                            })}
                          >
                            —
                          </span>
                        ) : (
                          <div className="flex items-center justify-center gap-1.5">
                            {/* Quick Drawer */}
                            <button
                              type="button"
                              onClick={() => onViewDetails(u)}
                              className="p-1.5 rounded-xl text-slate-600 dark:text-slate-300 hover:text-amber-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                              title={t('users.table.viewProfile', { defaultValue: 'عرض التفاصيل' })}
                            >
                              <Eye className="w-4 h-4" />
                            </button>

                            {/* Adjust Balance */}
                            <button
                              type="button"
                              onClick={() => onAdjustBalance(u)}
                              className="p-1.5 rounded-xl text-amber-600 dark:text-amber-400 hover:bg-amber-500/10 transition-colors cursor-pointer"
                              title={t('users.table.adjustBalance', { defaultValue: 'تسوية رصيد' })}
                            >
                              <Coins className="w-4 h-4" />
                            </button>

                            {/* Ban / Unban Toggle */}
                            <button
                              type="button"
                              onClick={() => onToggleBan(u)}
                              className={`p-1.5 rounded-xl transition-colors cursor-pointer ${
                                u.isBanned
                                  ? 'text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10'
                                  : 'text-rose-600 dark:text-rose-400 hover:bg-rose-500/10'
                              }`}
                              title={u.isBanned ? t('users.table.unban') : t('users.table.ban')}
                            >
                              {u.isBanned ? <ShieldCheck className="w-4 h-4" /> : <ShieldAlert className="w-4 h-4" />}
                            </button>
                          </div>
                        )}
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
    </div>
  );
};

export default AdminUsersTable;
