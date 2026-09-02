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
  KeyRound,
  User,
  LogOut,
  LogIn,
  UserPlus,
} from 'lucide-react';
import { BrandLogo } from '@/components/common/BrandLogo';
import { LanguageSwitcher } from '@/components/common/LanguageSwitcher';
import { ThemeToggle } from '@/components/common/ThemeToggle';
import { Button } from '@/components/common/Button';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/constants/routes.constants';
import { cn } from '@/utils/cn';

export interface NavbarProps {
  className?: string;
}

export const Navbar: React.FC<NavbarProps> = ({ className }) => {
  const { t } = useTranslation('common');
  const { t: tAuctions } = useTranslation('auctions');
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Close mobile drawer whenever location/route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  const desktopNavLinks = [
    {
      to: ROUTES.HOME,
      label: t('nav.home'),
      icon: Home,
      isActive: location.pathname === ROUTES.HOME,
    },
    {
      to: ROUTES.AUCTIONS,
      label: t('nav.auctions'),
      icon: Gavel,
      isActive: location.pathname === ROUTES.AUCTIONS || (location.pathname.startsWith('/auctions/') && location.pathname !== ROUTES.CREATE_AUCTION),
    },
    ...(isAuthenticated
      ? [
          {
            to: ROUTES.MY_AUCTIONS,
            label: tAuctions('myAuctions.title'),
            icon: Layers,
            isActive: location.pathname === ROUTES.MY_AUCTIONS,
          },
        ]
      : []),
  ];

  return (
    <>
      <header
        className={cn(
          'sticky top-0 z-40 w-full backdrop-blur-xl bg-white/80 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800/80 transition-colors duration-200 select-none',
          className
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4">
          {/* Left: Brand Logo & Desktop Nav Links */}
          <div className="flex items-center gap-6">
            <BrandLogo size="md" />

            <nav className="hidden md:flex items-center gap-1.5 text-xs font-semibold">
              {desktopNavLinks.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={cn(
                      'px-3 py-2 rounded-xl flex items-center gap-1.5 transition-all duration-150',
                      item.isActive
                        ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
                    )}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right: Desktop Actions & Mobile Trigger */}
          <div className="flex items-center gap-2.5">
            {/* Create Auction CTA (Visible on Desktop & Tablet) */}
            <Link to={ROUTES.CREATE_AUCTION} className="hidden sm:inline-block">
              <Button
                variant="accent"
                size="sm"
                leftIcon={<PlusCircle className="w-4 h-4" />}
                className="shadow-sm shadow-amber-500/20 text-xs font-bold"
              >
                {tAuctions('myAuctions.createNewButton')}
              </Button>
            </Link>

            {/* Language & Theme Controls */}
            <div className="hidden sm:flex items-center gap-2">
              <LanguageSwitcher />
              <ThemeToggle />
            </div>

            {/* Desktop Auth Controls */}
            {isAuthenticated ? (
              <div className="hidden md:flex items-center gap-2.5">
                <div className="flex items-center gap-2 text-xs font-semibold px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 text-slate-800 dark:text-slate-200">
                  <User className="w-3.5 h-3.5 text-amber-500" />
                  <span className="max-w-[120px] truncate">{user?.firstName}</span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] bg-amber-500/15 text-amber-600 dark:text-amber-400 font-mono font-bold">
                    {user?.role}
                  </span>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={logout}
                  leftIcon={<LogOut className="w-3.5 h-3.5" />}
                  className="text-xs text-slate-500 hover:text-red-500 dark:text-slate-400 dark:hover:text-red-400"
                  title={t('nav.logout')}
                >
                  {t('nav.logout')}
                </Button>
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Link to={ROUTES.LOGIN}>
                  <Button variant="ghost" size="sm" leftIcon={<LogIn className="w-3.5 h-3.5" />}>
                    {t('nav.login')}
                  </Button>
                </Link>
                <Link to={ROUTES.REGISTER}>
                  <Button
                    variant="primary"
                    size="sm"
                    leftIcon={<UserPlus className="w-3.5 h-3.5" />}
                  >
                    {t('nav.register')}
                  </Button>
                </Link>
              </div>
            )}

            {/* Mobile Hamburger Trigger */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(true)}
              aria-label="Open mobile menu"
              className="md:hidden p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Sheet Backdrop & Container */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden animate-fadeIn">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          {/* Drawer Content */}
          <aside className="fixed inset-y-0 end-0 w-80 max-w-[340px] bg-white dark:bg-slate-900 border-s border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col justify-between overflow-y-auto animate-slideInRight z-10 p-5">
            {/* Top Section: Header & Navigation Links Pinned to the Top */}
            <div className="space-y-4">
              {/* Top Bar: Brand Logo, Divider, Compact User Info & Close Button */}
              <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 dark:border-slate-800 gap-2">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <BrandLogo size="sm" />
                  {isAuthenticated && (
                    <div className="flex flex-col border-s-2 border-amber-500/40 ps-2.5 min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="font-extrabold text-[11px] leading-tight text-amber-500 truncate">
                          {user?.firstName} {user?.lastName}
                        </span>
                        <span className="px-1 py-0.2 rounded text-[8px] bg-amber-500/15 text-amber-600 dark:text-amber-400 font-mono font-bold shrink-0">
                          {user?.role}
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
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Guest Auth Banner (only shown for guests) */}
              {!isAuthenticated && (
                <div className="grid grid-cols-2 gap-2">
                  <Link to={ROUTES.LOGIN} onClick={() => setIsMobileMenuOpen(false)} className="w-full">
                    <Button variant="outline" size="sm" fullWidth leftIcon={<LogIn className="w-3.5 h-3.5" />}>
                      {t('nav.login')}
                    </Button>
                  </Link>
                  <Link to={ROUTES.REGISTER} onClick={() => setIsMobileMenuOpen(false)} className="w-full">
                    <Button variant="accent" size="sm" fullWidth leftIcon={<UserPlus className="w-3.5 h-3.5" />}>
                      {t('nav.register')}
                    </Button>
                  </Link>
                </div>
              )}

              {/* Navigation Menu (Pinned to Top, 100% Unified Styling Pattern Across All Items) */}
              <nav className="space-y-1">
                {/* 1. الرئيسية */}
                <Link
                  to={ROUTES.HOME}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-colors',
                    location.pathname === ROUTES.HOME
                      ? 'bg-amber-500 text-slate-950 shadow-sm'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80'
                  )}
                >
                  <Home className="w-4 h-4" />
                  <span>{t('nav.home')}</span>
                </Link>

                {/* 2. سوق المزادات */}
                <Link
                  to={ROUTES.AUCTIONS}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-colors',
                    location.pathname === ROUTES.AUCTIONS || (location.pathname.startsWith('/auctions/') && location.pathname !== ROUTES.CREATE_AUCTION)
                      ? 'bg-amber-500 text-slate-950 shadow-sm'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80'
                  )}
                >
                  <Gavel className="w-4 h-4" />
                  <span>{t('nav.auctions')}</span>
                </Link>

                {/* 3. إنشاء مزاد (Unified Pattern) */}
                <Link
                  to={ROUTES.CREATE_AUCTION}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-colors',
                    location.pathname === ROUTES.CREATE_AUCTION
                      ? 'bg-amber-500 text-slate-950 shadow-sm'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80'
                  )}
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>{tAuctions('myAuctions.createNewButton')}</span>
                </Link>

                {/* 4. مزاداتي */}
                {isAuthenticated && (
                  <Link
                    to={ROUTES.MY_AUCTIONS}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={cn(
                      'flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-colors',
                      location.pathname === ROUTES.MY_AUCTIONS
                        ? 'bg-amber-500 text-slate-950 shadow-sm'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80'
                    )}
                  >
                    <Layers className="w-4 h-4" />
                    <span>{tAuctions('myAuctions.title')}</span>
                  </Link>
                )}

                {/* 5. تغيير كلمة المرور */}
                {isAuthenticated && (
                  <Link
                    to={ROUTES.UPDATE_PASSWORD}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={cn(
                      'flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-colors',
                      location.pathname === ROUTES.UPDATE_PASSWORD
                        ? 'bg-amber-500 text-slate-950 shadow-sm'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80'
                    )}
                  >
                    <KeyRound className="w-4 h-4" />
                    <span>{t('home.updatePasswordLink')}</span>
                  </Link>
                )}
              </nav>
            </div>

            {/* Bottom Controls: Language & Theme & Logout */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3 mt-auto">
              <div className="flex items-center justify-between gap-3 p-2 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 ps-1">
                  {t('themeAndLanguage')}
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
                  {t('nav.logout')}
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
