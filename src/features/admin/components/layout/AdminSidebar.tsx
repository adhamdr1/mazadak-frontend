import React from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  LayoutDashboard,
  Users,
  Gavel,
  Scale,
  Landmark,
  Receipt,
  Home,
  User,
  X,
  LogOut,
} from 'lucide-react';
import { BrandLogo } from '@/components/common/BrandLogo';
import { LanguageSwitcher } from '@/components/common/LanguageSwitcher';
import { ThemeToggle } from '@/components/common/ThemeToggle';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/constants/routes.constants';
import { useAdminDashboardStats } from '../../hooks/useAdminDashboardStats';
import { toLocalizedDigits } from '@/utils/formatters';
import { cn } from '@/utils/cn';

export interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ isOpen, onClose }) => {
  const { t, i18n } = useTranslation(['admin', 'common']);
  const isRTL = i18n.language?.startsWith('ar');
  const location = useLocation();
  const { user, logout } = useAuth();
  const { data: stats } = useAdminDashboardStats();

  const pendingWithdrawalsCount = stats?.pendingWithdrawalsCount || 0;
  const roleLabel = isRTL ? 'مسؤول' : 'Admin';

  const navItems = [
    {
      to: ROUTES.ADMIN.DASHBOARD,
      label: t('layout.sidebar.dashboard', { ns: 'admin', defaultValue: 'لوحة التحكم' }),
      icon: LayoutDashboard,
      exact: true,
    },
    {
      to: ROUTES.ADMIN.USERS,
      label: t('layout.sidebar.users', { ns: 'admin', defaultValue: 'إدارة المستخدمين' }),
      icon: Users,
    },
    {
      to: ROUTES.ADMIN.AUCTIONS,
      label: t('layout.sidebar.auctions', { ns: 'admin', defaultValue: 'مراقبة المزادات' }),
      icon: Gavel,
    },
    {
      to: ROUTES.ADMIN.DISPUTES,
      label: t('layout.sidebar.disputes', { ns: 'admin', defaultValue: 'فض النزاعات والضمان' }),
      icon: Scale,
    },
    {
      to: ROUTES.ADMIN.FINANCIALS,
      label: t('layout.sidebar.financials', { ns: 'admin', defaultValue: 'الخزينة والسحوبات' }),
      icon: Landmark,
      badge: pendingWithdrawalsCount > 0 ? pendingWithdrawalsCount : undefined,
    },
    {
      to: ROUTES.ADMIN.TRANSACTIONS,
      label: t('layout.sidebar.transactions', { ns: 'admin', defaultValue: 'سجل المعاملات' }),
      icon: Receipt,
    },
    {
      to: ROUTES.AUCTIONS,
      label: t('layout.sidebar.marketplace', { ns: 'admin', defaultValue: 'سوق المزادات' }),
      icon: Home,
    },
    {
      to: ROUTES.PROFILE,
      label: isRTL ? 'الملف الشخصي' : 'Profile',
      icon: User,
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-xs lg:hidden transition-opacity"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Pinned Desktop & Slide-in Mobile Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 z-50 flex flex-col w-72 bg-white dark:bg-slate-950 border-slate-200/80 dark:border-slate-800/80 transition-transform duration-200 ease-out shadow-xl lg:shadow-none select-none',
          isRTL
            ? cn(
                'left-0 border-r lg:left-auto lg:right-0 lg:border-r-0 lg:border-l',
                isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
              )
            : cn(
                'right-0 border-l lg:right-auto lg:left-0 lg:border-l-0 lg:border-r',
                isOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
              )
        )}
      >
        {/* Top Header: Brand & Compact User Info */}
        <div className="flex items-center justify-between py-3 px-3.5 border-b border-slate-100 dark:border-slate-800/80 gap-2">
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <BrandLogo size="xs" to={ROUTES.AUCTIONS} />
            <div className="h-6 w-px bg-amber-500/30 shrink-0" />
            <Link
              to={ROUTES.PROFILE}
              onClick={() => onClose()}
              className="flex flex-col min-w-0 flex-1 hover:opacity-85 transition-opacity group"
            >
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="font-black text-xs leading-tight text-amber-600 dark:text-amber-400 truncate group-hover:underline">
                  {user?.firstName} {user?.lastName}
                </span>
                <span className="px-1.5 py-0.2 rounded text-[9px] bg-amber-500/15 text-amber-600 dark:text-amber-400 font-bold shrink-0">
                  {roleLabel}
                </span>
              </div>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono truncate block mt-0.5" title={user?.email}>
                {user?.email}
              </span>
            </Link>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/80 lg:hidden cursor-pointer shrink-0 transition-colors"
            aria-label="Close Sidebar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto px-4 py-2 space-y-1 custom-scrollbar">
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isItemActive = item.exact
                ? location.pathname === item.to
                : location.pathname === item.to || location.pathname.startsWith(`${item.to}/`);

              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => onClose()}
                  className={cn(
                    'flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-150',
                    isItemActive
                      ? 'bg-amber-500 text-slate-950 shadow-sm font-black'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80'
                  )}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="flex-1 truncate">{item.label}</span>

                  {item.badge !== undefined && item.badge > 0 && (
                    <span
                      className={cn(
                        'ms-auto inline-flex items-center justify-center font-black text-[10px] px-2 py-0.5 rounded-full',
                        isItemActive
                          ? 'bg-slate-950 text-amber-400'
                          : 'bg-rose-500 text-white shadow-xs'
                      )}
                    >
                      {toLocalizedDigits(item.badge, isRTL)}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer: Language, Theme & Logout */}
        <div className="p-4 space-y-2.5 mt-auto">
          {/* Controls pill */}
          <div className="flex items-center justify-between gap-3 p-2 rounded-2xl bg-slate-100/70 dark:bg-slate-900/80 border border-slate-200/60 dark:border-slate-800/80">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 ps-1">
              {t('layout.sidebar.themeAndLang', { ns: 'admin', defaultValue: isRTL ? 'اللغة والمظهر' : 'Theme & Language' })}
            </span>
            <div className="flex items-center gap-1.5">
              <LanguageSwitcher />
              <ThemeToggle />
            </div>
          </div>

          {/* Logout Action Button */}
          <button
            type="button"
            onClick={() => {
              onClose();
              logout();
            }}
            className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer border border-rose-200/80 dark:border-rose-900/40"
          >
            <LogOut className="w-4 h-4" />
            <span>{isRTL ? 'تسجيل الخروج' : 'Log Out'}</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default AdminSidebar;
