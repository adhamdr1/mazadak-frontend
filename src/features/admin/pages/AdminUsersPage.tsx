import React, { useState, useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Users } from 'lucide-react';
import { toLocalizedDigits } from '@/utils/formatters';
import { useAdminUsers } from '../hooks/useAdminUsers';
import { useAdminToggleBan } from '../hooks/useAdminToggleBan';
import { AdminUsersTable } from '../components/users/AdminUsersTable';
import { UserDetailsDrawer } from '../components/users/UserDetailsDrawer';
import { AdjustBalanceModal } from '../components/users/AdjustBalanceModal';
import { BanUserConfirmModal } from '../components/users/BanUserConfirmModal';
import type { User, UserRole, UsersFilterInput } from '../types/admin.types';

export const AdminUsersPage: React.FC = () => {
  const { t, i18n } = useTranslation(['admin', 'common']);
  const isRTL = i18n.language?.startsWith('ar');
  const [searchParams, setSearchParams] = useSearchParams();

  // 1. URL Query Params synchronization
  const currentPage = useMemo(() => {
    const p = parseInt(searchParams.get('usersPage') || '1', 10);
    return isNaN(p) || p < 1 ? 1 : p;
  }, [searchParams]);

  const searchQuery = searchParams.get('search') || '';
  const selectedRole = (searchParams.get('role') as UserRole | 'ALL') || 'ALL';
  const selectedBanStatus = (searchParams.get('banned') as 'ALL' | 'ACTIVE' | 'BANNED') || 'ALL';
  const selectedVerification = (searchParams.get('verified') as 'ALL' | 'VERIFIED' | 'UNVERIFIED') || 'ALL';
  const sortOrder = (searchParams.get('sortOrder') as 'DESC' | 'ASC') || 'DESC';

  const updateParam = useCallback(
    (key: string, value: string | null, resetPage = true) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          if (value && value !== 'ALL' && value.trim() !== '') {
            next.set(key, value);
          } else {
            next.delete(key);
          }
          if (resetPage && key !== 'usersPage') {
            next.delete('usersPage');
          }
          return next;
        },
        { replace: true }
      );
    },
    [setSearchParams]
  );

  // 2. Build GraphQL UsersFilterInput based on active state
  const filterInput: UsersFilterInput = useMemo(() => {
    const f: UsersFilterInput = {
      sort: {
        field: 'CREATED_AT',
        order: sortOrder,
      },
    };

    if (searchQuery.trim()) {
      f.search = searchQuery.trim();
    }
    if (selectedRole === 'USER' || selectedRole === 'ADMIN') {
      f.role = selectedRole;
    }
    if (selectedBanStatus === 'ACTIVE') {
      f.isBanned = false;
    } else if (selectedBanStatus === 'BANNED') {
      f.isBanned = true;
    }
    if (selectedVerification === 'VERIFIED') {
      f.isEmailVerified = true;
    } else if (selectedVerification === 'UNVERIFIED') {
      f.isEmailVerified = false;
    }

    return f;
  }, [searchQuery, selectedRole, selectedBanStatus, selectedVerification, sortOrder]);

  // 3. Data fetching hook
  const {
    data: usersData,
    isLoading,
    isRefetching,
    refetch,
  } = useAdminUsers({
    page: currentPage,
    limit: 10,
    filter: filterInput,
  });

  const users = usersData?.items || [];
  const total = usersData?.total || 0;
  const totalPages = usersData?.totalPages || 1;

  // 4. Modal and Drawer states
  const [selectedDrawerUserId, setSelectedDrawerUserId] = useState<string | null>(null);
  const [adjustBalanceUser, setAdjustBalanceUser] = useState<{ user: User; balance?: number | string } | null>(null);
  const [banConfirmUser, setBanConfirmUser] = useState<User | null>(null);

  // 5. Ban toggle mutation
  const { mutate: toggleBan, isPending: isBanPending } = useAdminToggleBan();

  const handleConfirmBanToggle = () => {
    if (!banConfirmUser) return;
    toggleBan(banConfirmUser._id, {
      onSuccess: () => {
        setBanConfirmUser(null);
      },
    });
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {t('users.pageTitle', { defaultValue: 'إدارة المستخدمين' })}
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/20">
              {toLocalizedDigits(total, isRTL)}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            {t('users.pageDesc', {
              defaultValue: 'استعراض الحسابات المسجلة، فحص المحافظ، تعديل الأرصدة يدوياً، وإدارة إجراءات الحظر.',
            })}
          </p>
        </div>
      </div>

      {/* Main Users Table */}
      <AdminUsersTable
        users={users}
        total={total}
        totalPages={totalPages}
        currentPage={currentPage}
        isLoading={isLoading}
        isRefetching={isRefetching}
        searchQuery={searchQuery}
        onSearchChange={(q) => updateParam('search', q)}
        selectedRole={selectedRole}
        onRoleChange={(r) => updateParam('role', r)}
        selectedBanStatus={selectedBanStatus}
        onBanStatusChange={(s) => updateParam('banned', s)}
        selectedVerification={selectedVerification}
        onVerificationChange={(v) => updateParam('verified', v)}
        sortOrder={sortOrder}
        onSortOrderToggle={() => updateParam('sortOrder', sortOrder === 'DESC' ? 'ASC' : 'DESC', false)}
        onPageChange={(p) => updateParam('usersPage', String(p), false)}
        onRefresh={() => refetch()}
        onViewDetails={(u) => setSelectedDrawerUserId(u._id)}
        onAdjustBalance={(u) => setAdjustBalanceUser({ user: u, balance: 0 })}
        onToggleBan={(u) => setBanConfirmUser(u)}
      />

      {/* Slide-over User Details Drawer */}
      <UserDetailsDrawer
        userId={selectedDrawerUserId}
        isOpen={Boolean(selectedDrawerUserId)}
        onClose={() => setSelectedDrawerUserId(null)}
        onOpenAdjustBalance={(u, bal) => setAdjustBalanceUser({ user: u, balance: bal })}
        onOpenBanConfirm={(u) => setBanConfirmUser(u)}
      />

      {/* Adjust Balance Modal */}
      <AdjustBalanceModal
        isOpen={Boolean(adjustBalanceUser)}
        onClose={() => setAdjustBalanceUser(null)}
        user={adjustBalanceUser?.user || null}
        currentBalance={adjustBalanceUser?.balance || 0}
        onSuccess={() => refetch()}
      />

      {/* Ban / Unban Confirm Modal */}
      <BanUserConfirmModal
        isOpen={Boolean(banConfirmUser)}
        onClose={() => setBanConfirmUser(null)}
        onConfirm={handleConfirmBanToggle}
        isLoading={isBanPending}
        isBanned={Boolean(banConfirmUser?.isBanned)}
        user={banConfirmUser}
        userName={banConfirmUser ? `${banConfirmUser.firstName} ${banConfirmUser.lastName}` : ''}
        userEmail={banConfirmUser?.email}
      />
    </div>
  );
};

export default AdminUsersPage;
