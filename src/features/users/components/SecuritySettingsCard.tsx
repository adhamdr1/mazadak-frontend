import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  KeyRound,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  Lock,
  CheckCircle2,
} from 'lucide-react';
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
  const { t, i18n } = useTranslation(['users', 'common']);
  const isRTL = i18n.language?.startsWith('ar');
  const isGoogle = user.authProvider === 'GOOGLE';

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Primary Authentication Method */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 lg:p-9 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
        <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
          <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Lock className="w-4 h-4 text-amber-500" />
            <span>{t('security.title', 'إعدادات الأمان وتسجيل الدخول')}</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {t('security.description', 'إدارة وسيلة الدخول وتحديث كلمة المرور لحماية حسابك')}
          </p>
        </div>

        {isGoogle ? (
          /* Google SSO Verified Card */
          <div className="rounded-2xl bg-gradient-to-r from-blue-500/10 via-indigo-500/5 to-transparent border border-blue-500/20 p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0 shadow-sm">
                <svg className="w-6 h-6" viewBox="0 0 24 24">
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
                <h4 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <span>{t('security.googleTitle', 'تسجيل الدخول عبر Google')}</span>
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed max-w-lg">
                  {t('security.googleDesc', 'حسابك موثق ومحمي عبر خدمة تسجيل الدخول الموحد من Google.')}
                </p>
              </div>
            </div>

            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold text-xs border border-blue-500/20 shrink-0 self-start sm:self-center">
              <ShieldCheck className="w-4 h-4" />
              <span>{t('security.googleSecured', 'محمي وموثق')}</span>
            </span>
          </div>
        ) : (
          /* Standard Local Password Security Card */
          <div className="rounded-3xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/90 dark:border-slate-800 p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-5 transition-all hover:border-amber-500/40">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0 shadow-2xs">
                <KeyRound className="w-6 h-6" />
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="font-black text-sm sm:text-base text-slate-900 dark:text-white">
                    {t('security.passwordStatusTitle', 'كلمة المرور')}
                  </h4>
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>{isRTL ? 'نشطة ومحمية' : 'Active & Protected'}</span>
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md leading-relaxed">
                  {t('security.passwordStatusDesc', 'تحديث كلمة المرور بانتظام يضمن الحماية القصوى لبياناتك ومحفظتك المالية.')}
                </p>
              </div>
            </div>

            <Link
              to={ROUTES.UPDATE_PASSWORD}
              className="group inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 hover:text-amber-600 dark:hover:text-amber-400 hover:border-amber-500/50 hover:bg-amber-50/40 dark:hover:bg-amber-950/20 transition-all shadow-xs shrink-0 self-start sm:self-center select-none cursor-pointer whitespace-nowrap"
            >
              <KeyRound className="w-4 h-4 text-amber-500 transition-transform group-hover:rotate-12" />
              <span>{t('security.changePasswordButton', 'تغيير كلمة المرور')}</span>
              {isRTL ? (
                <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
              ) : (
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
              )}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default SecuritySettingsCard;
