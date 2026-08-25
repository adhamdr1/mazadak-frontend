import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Home, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { LanguageSwitcher } from '@/components/common/LanguageSwitcher';
import { ThemeToggle } from '@/components/common/ThemeToggle';
import { ROUTES } from '@/constants/routes.constants';

export const UnauthorizedPage: React.FC = () => {
  const { t } = useTranslation('common');

  return (
    <div className="min-h-screen flex flex-col justify-between bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-4 sm:p-6">
      <header className="w-full max-w-7xl mx-auto flex justify-end gap-2">
        <LanguageSwitcher />
        <ThemeToggle />
      </header>

      <main className="flex items-center justify-center">
        <Card glass padding="lg" className="max-w-md w-full text-center space-y-6 shadow-2xl">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-red-500/10 text-red-500 border border-red-500/20 shadow-inner">
            <ShieldAlert className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <span className="text-5xl font-black text-red-500 block">{t('unauthorized.code')}</span>
            <h1 className="text-xl sm:text-2xl font-bold">{t('unauthorized.title')}</h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              {t('unauthorized.message')}
            </p>
          </div>

          <Link to={ROUTES.HOME} className="block pt-2">
            <Button variant="accent" fullWidth size="lg" leftIcon={<Home className="w-4 h-4" />}>
              {t('unauthorized.backHome')}
            </Button>
          </Link>
        </Card>
      </main>

      <footer className="text-center text-xs text-slate-400 dark:text-slate-600">
        © {new Date().getFullYear()} Mazadak Platform
      </footer>
    </div>
  );
};

export default UnauthorizedPage;
