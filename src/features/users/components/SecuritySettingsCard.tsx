import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  KeyRound,
  ShieldCheck,
  ExternalLink,
  Lock,
} from 'lucide-react';
import { Button } from '@/components/common/Button';
import { ROUTES } from '@/constants/routes.constants';
import type { FullUser } from '../types/users.types';
import type { User } from '@/features/auth/types/auth.types';

export interface SecuritySettingsCardProps {
  user: FullUser | User;
  className?: string;
}

export const SecuritySettingsCard: React.FC<SecuritySettingsCardProps> = ({
  user,
  className = '',
}) => {
  const { t } = useTranslation('users');
  const isGoogle = user.authProvider === 'GOOGLE';

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Primary Authentication Method */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 lg:p-9 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-6">
        <div className="border-b border-slate-100 dark:border-slate-800/80 pb-3.5">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Lock className="w-4 h-4 text-amber-500" />
            <span>{t('security.title')}</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {t('security.description')}
          </p>
        </div>

        {isGoogle ? (
          /* Google SSO Verified Card */
          <div className="rounded-2xl bg-gradient-to-r from-blue-500/10 via-indigo-500/5 to-transparent border border-blue-500/20 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0 shadow-2xs">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                  <span>{t('security.googleTitle')}</span>
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed max-w-lg">
                  {t('security.googleDesc')}
                </p>
              </div>
            </div>

            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold text-xs border border-blue-500/20 shrink-0 self-start sm:self-center">
              <ShieldCheck className="w-4 h-4" />
              <span>{t('security.googleSecured')}</span>
            </span>
          </div>
        ) : (
          /* Standard Local Password Security Card */
          <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                <KeyRound className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                  {t('security.passwordStatusTitle')}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md">
                  {t('security.passwordStatusDesc')}
                </p>
              </div>
            </div>

            <Link to={ROUTES.UPDATE_PASSWORD}>
              <Button
                variant="outline"
                size="sm"
                leftIcon={<KeyRound className="w-4 h-4" />}
                rightIcon={<ExternalLink className="w-3.5 h-3.5" />}
                className="shrink-0"
              >
                {t('security.changePasswordButton')}
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};
