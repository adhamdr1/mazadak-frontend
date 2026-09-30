import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Menu,
  X,
  PlusCircle,
  Home,
  Gavel,
  Layers,
  TrendingUp,
  ShieldCheck,
  Wallet,
  Receipt,
  History,
  KeyRound,
  User,
  LogOut,
  LogIn,
  UserPlus,
  MessageSquare,
} from 'lucide-react';
import { BrandLogo } from '@/components/common/BrandLogo';
import { LanguageSwitcher } from '@/components/common/LanguageSwitcher';
import { ThemeToggle } from '@/components/common/ThemeToggle';
import { Button } from '@/components/common/Button';
import { useAuth } from '@/hooks/useAuth';
import { useUnreadChatRoomsCount } from '@/features/chat';
import { ROUTES } from '@/constants/routes.constants';
import { toLocalizedDigits } from '@/utils/formatters';
import { cn } from '@/utils/cn';

export interface NavbarProps {
  className?: string;
}

export const Navbar: React.FC<NavbarProps> = ({ className }) => {
  const { t, i18n } = useTranslation('common');
  const isRTL = i18n.language?.startsWith('ar');
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const { unreadRoomsCount } = useUnreadChatRoomsCount();

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Close drawer whenever location/route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  // Lock body scroll when drawer menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMenuOpen]);

  // Translated Role string
  const roleLabel =
    user?.role === 'ADMIN'
      ? isRTL
        ? 'مسؤول'
        : 'Admin'
      : isRTL
        ? 'مستخدم'
        : 'User';

  // Desktop top navbar links
  const desktopTopLinks = [
    {
      to: ROUTES.HOME,
      label: t('nav.home', 'الرئيسية'),
      icon: Home,
      isActive: location.pathname === ROUTES.HOME,
    },
    {
      to: ROUTES.AUCTIONS,
      label: t('nav.auctions', 'المزادات'),
      icon: Gavel,
      isActive:
        location.pathname === ROUTES.AUCTIONS ||
        (location.pathname.startsWith('/auctions/') &&
          location.pathname !== ROUTES.CREATE_AUCTION),
    },
    {
      to: ROUTES.CREATE_AUCTION,
      label: t('nav.createAuction', 'إنشاء مزاد'),
      icon: PlusCircle,
      isActive: location.pathname === ROUTES.CREATE_AUCTION,
    },
    ...(isAuthenticated
      ? [
          {
            to: ROUTES.MY_AUCTIONS,
            label: t('nav.myAuctions', 'مزاداتي'),
            icon: Layers,
            isActive: location.pathname === ROUTES.MY_AUCTIONS,
          },
          {
            to: ROUTES.MESSAGES,
            label: t('nav.messages', 'الرسائل'),
            icon: MessageSquare,
            isActive: location.pathname.startsWith('/messages'),
            badge: unreadRoomsCount,
          },
        ]
      : []),
  ];

  // Complete unified list for the slide-over sidebar drawer (100% consistent styling)
  const drawerLinks = [
    {
      to: ROUTES.HOME,
      label: t('nav.home', 'الرئيسية'),
      icon: Home,
      isActive: location.pathname === ROUTES.HOME,
    },
    {
      to: ROUTES.AUCTIONS,
      label: t('nav.auctions', 'سوق المزادات'),
      icon: Gavel,
      isActive:
        location.pathname === ROUTES.AUCTIONS ||
        (location.pathname.startsWith('/auctions/') &&
          location.pathname !== ROUTES.CREATE_AUCTION),
    },
    {
      to: ROUTES.CREATE_AUCTION,
      label: t('nav.createAuction', 'إنشاء مزاد'),
      icon: PlusCircle,
      isActive: location.pathname === ROUTES.CREATE_AUCTION,
    },
    ...(isAuthenticated
      ? [
          {
            to: ROUTES.MY_AUCTIONS,
            label: t('nav.myAuctions', 'مزاداتي'),
            icon: Layers,
            isActive: location.pathname === ROUTES.MY_AUCTIONS,
          },
          {
            to: ROUTES.MY_BIDS,
            label: t('nav.myBids', 'مزايداتي'),
            icon: TrendingUp,
            isActive: location.pathname === ROUTES.MY_BIDS,
          },
          {
            to: ROUTES.MY_ESCROWS,
            label: t('nav.myEscrows', 'معاملات الضمان'),
            icon: ShieldCheck,
            isActive:
              location.pathname.startsWith('/my-escrows') ||
              location.pathname.startsWith('/escrow/') ||
              location.pathname.startsWith('/disputes/'),
          },
          {
            to: ROUTES.MESSAGES,
            label: t('nav.messages', 'الرسائل'),
            icon: MessageSquare,
            isActive: location.pathname.startsWith('/messages'),
            badge: unreadRoomsCount,
          },
          {
            to: ROUTES.WALLET,
            label: t('nav.wallet', 'المحفظة والرصيد'),
            icon: Wallet,
            isActive: location.pathname === ROUTES.WALLET,
          },
          {
            to: ROUTES.WALLET_WITHDRAWALS,
            label: t('nav.withdrawals', 'سجل السحوبات'),
            icon: History,
            isActive: location.pathname === ROUTES.WALLET_WITHDRAWALS,
          },
          {
            to: ROUTES.WALLET_TRANSACTIONS,
            label: t('nav.transactions', 'سجل المعاملات'),
            icon: Receipt,
            isActive: location.pathname === ROUTES.WALLET_TRANSACTIONS,
          },
          {
            to: ROUTES.UPDATE_PASSWORD,
            label: t('home.updatePasswordLink', 'تغيير كلمة المرور'),
            icon: KeyRound,
            isActive: location.pathname === ROUTES.UPDATE_PASSWORD,
          },
        ]
      : []),
  ];

  return (
    <>
      <header
        className={cn(
          'sticky top-0 z-40 w-full backdrop-blur-xl bg-white/85 dark:bg-slate-950/85 border-b border-slate-200/90 dark:border-slate-800/80 transition-colors duration-200 select-none',
          className
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4">
          {/* Left: Brand Logo & Desktop Top Navigation Links */}
          <div className="flex items-center gap-6">
            <BrandLogo size="md" />

            <nav className="hidden md:flex items-center gap-1 text-xs font-semibold">
              {desktopTopLinks.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => {
                      if (item.to === ROUTES.HOME && location.pathname === ROUTES.HOME) {
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }
                    }}
                    className={cn(
                      'px-3 py-2 rounded-xl flex items-center gap-2 transition-all duration-150',
                      item.isActive
                        ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 font-bold border border-amber-500/20'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>

                    {/* WhatsApp-style Live Unread Counter Badge */}
                    {item.badge !== undefined && item.badge > 0 && (
                      <span
                        className={cn(
                          'inline-flex items-center justify-center font-black text-[10px] leading-none',
                          'px-1.5 py-0.5 min-w-[18px] h-[18px] rounded-full',
                          'bg-amber-500 text-slate-950 shadow-xs shadow-amber-500/40',
                          'animate-in zoom-in-75 duration-200 shrink-0'
                        )}
                        aria-label={`${item.badge} unread chats`}
                      >
                        {toLocalizedDigits(item.badge, isRTL)}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right: Language/Theme Controls & Menu Trigger */}
          <div className="flex items-center gap-2.5">
            {/* Language & Theme Controls (Desktop quick access) */}
            <div className="hidden sm:flex items-center gap-1.5">
              <LanguageSwitcher />
              <ThemeToggle />
            </div>

            {/* User Account / Menu Trigger Button (Desktop & Mobile) */}
            {isAuthenticated ? (
              <button
                type="button"
                onClick={() => setIsMenuOpen(true)}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-2xl bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-800/80 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 text-slate-800 dark:text-slate-200 transition-all cursor-pointer shadow-2xs group"
                title={user?.firstName}
                aria-label="Open Menu"
              >
                <div className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center text-xs font-bold">
                  {user?.firstName?.charAt(0) || <User className="w-3.5 h-3.5" />}
                </div>
                <span className="hidden lg:inline-block text-xs font-bold max-w-[100px] truncate">
                  {user?.firstName}
                </span>
                <span className="hidden sm:inline-block px-1.5 py-0.2 rounded text-[9px] bg-amber-500/15 text-amber-600 dark:text-amber-400 font-bold">
                  {roleLabel}
                </span>
                <Menu className="w-4 h-4 text-slate-500 group-hover:text-amber-500 transition-colors shrink-0" />
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <Link to={ROUTES.LOGIN} className="hidden sm:inline-block">
                  <Button variant="ghost" size="sm" leftIcon={<LogIn className="w-3.5 h-3.5" />}>
                    {t('nav.login', 'دخول')}
                  </Button>
                </Link>
                <Link to={ROUTES.REGISTER} className="hidden sm:inline-block">
                  <Button variant="primary" size="sm" leftIcon={<UserPlus className="w-3.5 h-3.5" />}>
                    {t('nav.register', 'تسجيل جديد')}
                  </Button>
                </Link>
                <button
                  type="button"
                  onClick={() => setIsMenuOpen(true)}
                  aria-label="Open Menu"
                  className="sm:hidden p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
                >
                  <Menu className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Slide-over Sidebar Drawer (100% Unified Design & Ordered List) */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 animate-in fade-in duration-200">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-950/75 backdrop-blur-xs transition-opacity cursor-pointer"
            onClick={() => setIsMenuOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer Panel */}
          <aside
            className={cn(
              'fixed inset-y-0 end-0 w-80 max-w-[340px] bg-white dark:bg-slate-900 border-s border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col justify-between overflow-y-auto z-10 p-5',
              'animate-in slide-in-from-right rtl:slide-in-from-left duration-250'
            )}
          >
            {/* Top Section */}
            <div className="space-y-4">
              {/* Drawer Top Header */}
              <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 dark:border-slate-800 gap-2">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <BrandLogo size="sm" />
                  {isAuthenticated && (
                    <div className="flex flex-col border-s-2 border-amber-500/40 ps-2.5 min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="font-extrabold text-[11px] leading-tight text-amber-500 truncate">
                          {user?.firstName} {user?.lastName}
                        </span>
                        <span className="px-1 py-0.2 rounded text-[8px] bg-amber-500/15 text-amber-600 dark:text-amber-400 font-bold shrink-0">
                          {roleLabel}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono truncate block">
                        {user?.email}
                      </span>
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => setIsMenuOpen(false)}
                  className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors shrink-0 cursor-pointer"
                  aria-label="Close menu"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Guest Auth Banner */}
              {!isAuthenticated && (
                <div className="grid grid-cols-2 gap-2">
                  <Link to={ROUTES.LOGIN} onClick={() => setIsMenuOpen(false)} className="w-full">
                    <Button variant="outline" size="sm" fullWidth leftIcon={<LogIn className="w-3.5 h-3.5" />}>
                      {t('nav.login', 'دخول')}
                    </Button>
                  </Link>
                  <Link to={ROUTES.REGISTER} onClick={() => setIsMenuOpen(false)} className="w-full">
                    <Button variant="accent" size="sm" fullWidth leftIcon={<UserPlus className="w-3.5 h-3.5" />}>
                      {t('nav.register', 'تسجيل جديد')}
                    </Button>
                  </Link>
                </div>
              )}

              {/* Unified Continuous List (Exact same amber active & hover styling across all links) */}
              <nav className="space-y-1">
                {drawerLinks.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      onClick={() => {
                        setIsMenuOpen(false);
                        if (item.to === ROUTES.HOME && location.pathname === ROUTES.HOME) {
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }
                      }}
                      className={cn(
                        'flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-colors',
                        item.isActive
                          ? 'bg-amber-500 text-slate-950 shadow-sm'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80'
                      )}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span>{item.label}</span>

                      {/* Live Counter Badge inside Drawer List */}
                      {item.badge !== undefined && item.badge > 0 && (
                        <span
                          className={cn(
                            'ms-auto inline-flex items-center justify-center font-black text-[10px] px-2 py-0.5 rounded-full',
                            item.isActive
                              ? 'bg-slate-950 text-amber-400'
                              : 'bg-amber-500 text-slate-950 shadow-xs'
                          )}
                        >
                          {toLocalizedDigits(item.badge, isRTL)}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Bottom Controls: Language, Theme & Logout */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3 mt-auto">
              <div className="flex items-center justify-between gap-3 p-2 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 ps-1">
                  {t('themeAndLanguage', 'المظهر واللغة')}
                </span>
                <div className="flex items-center gap-2">
                  <LanguageSwitcher />
                  <ThemeToggle />
                </div>
              </div>

              {isAuthenticated && (
                <Button
                  variant="ghost"
                  size="md"
                  fullWidth
                  onClick={logout}
                  leftIcon={<LogOut className="w-4 h-4 text-red-500" />}
                  className="text-red-600 dark:text-red-400 hover:bg-red-500/10 font-bold text-xs"
                >
                  {t('nav.logout', 'تسجيل الخروج')}
                </Button>
              )}
            </div>
          </aside>
        </div>
      )}
    </>
  );
};

export default Navbar;
