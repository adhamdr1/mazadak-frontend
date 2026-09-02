import React from 'react';
import { Sparkles, User, LogOut } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { LanguageSwitcher } from '@/components/common/LanguageSwitcher';
import { ThemeToggle } from '@/components/common/ThemeToggle';
import { BrandLogo } from '@/components/common/BrandLogo';
import { Card } from '@/components/common/Card';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/common/Button';

export interface AuthLayoutProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({
  title,
  subtitle,
  children,
  footer,
}) => {
  const { t } = useTranslation('common');
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <div className="min-h-screen flex flex-col justify-between bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200 relative overflow-hidden">
      {/* Subtle Background Glows */}
      <div className="absolute -top-40 -start-40 w-96 h-96 bg-amber-500/10 dark:bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -end-40 w-96 h-96 bg-sky-500/10 dark:bg-sky-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <header className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between z-10">
        <BrandLogo size="md" />

        <div className="flex items-center gap-2.5">
          <LanguageSwitcher />
          <ThemeToggle />

          {isAuthenticated && user && (
            <div className="flex items-center gap-2 ms-1 ps-2 border-s border-slate-200 dark:border-slate-800">
              <div className="hidden sm:flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                <User className="w-3.5 h-3.5 text-amber-500" />
                <span>{user.firstName} {user.lastName}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={logout}
                leftIcon={<LogOut className="w-3.5 h-3.5" />}
                className="text-xs text-slate-500 hover:text-red-500 dark:hover:text-red-400"
              >
                {t('nav.logout')}
              </Button>
            </div>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 z-20 my-4">
        <div className="w-full max-w-md">
          <Card glass padding="lg" className="border-slate-200 dark:border-slate-800 shadow-2xl relative z-10">
            {/* Header Section */}
            <div className="text-center mb-6">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center justify-center gap-1.5">
                <span>{title}</span>
                <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
              </h1>
              {subtitle && (
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                  {subtitle}
                </p>
              )}
            </div>

            {/* Form / Dynamic Body */}
            <div>{children}</div>

            {/* Optional Footer */}
            {footer && (
              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/80 text-center text-xs text-slate-500 dark:text-slate-400">
                {footer}
              </div>
            )}
          </Card>
        </div>
      </main>

      {/* Global Bottom Bar */}
      <footer className="w-full py-4 text-center text-xs text-slate-400 dark:text-slate-600 relative z-0">
        <p>{t('footerCopyright')}</p>
      </footer>
    </div>
  );
};

export default AuthLayout;
