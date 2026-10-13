import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, Mail, LogOut, AlertTriangle, ExternalLink } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { ROUTES } from '@/constants/routes.constants';

export const BannedAccountPage: React.FC = () => {
  const { t, i18n } = useTranslation(['auth', 'common']);
  const isRTL = i18n.language?.startsWith('ar');
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await logout();
    navigate(ROUTES.LOGIN, { replace: true });
  };

  const supportSubject = encodeURIComponent(
    isRTL
      ? `طلب مراجعة التماس حساب محظور - ${user?.email || ''}`
      : `Account Suspension Appeal - ${user?.email || ''}`
  );
  const supportBody = encodeURIComponent(
    isRTL
      ? `مرحباً فريق دعم مزادك،\n\nأود تقديم طلب مراجعة والتماس بخصوص إيقاف حسابي (${user?.email || ''}).\nمعرف الحساب: ${user?._id || ''}\n\nالتفاصيل:\n`
      : `Hello Mazadak Support Team,\n\nI would like to appeal the suspension of my account (${user?.email || ''}).\nAccount ID: ${user?._id || ''}\n\nDetails:\n`
  );

  const gmailComposeUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=support@mazadak.com&su=${supportSubject}&body=${supportBody}`;

  return (
    <div className="flex-1 flex items-center justify-center p-4 sm:p-6 py-12 sm:py-20 animate-in fade-in duration-200">
      <Card
        glass
        padding="lg"
        className="max-w-xl w-full text-center space-y-6 sm:space-y-7 shadow-2xl border-rose-500/20 dark:border-rose-500/30"
      >
        {/* 1. Header Shield & Status Badge */}
        <div className="space-y-3">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-rose-500/10 text-rose-500 border border-rose-500/25 shadow-lg shadow-rose-500/10">
            <ShieldAlert className="w-10 h-10 animate-pulse" />
          </div>

          <div className="flex items-center justify-center">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black tracking-wide bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/25">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>{t('banned.badge', { defaultValue: 'حساب محظور إدارياً' })}</span>
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            {t('banned.title', { defaultValue: 'تم إيقاف هذا الحساب' })}
          </h1>

          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-lg mx-auto">
            {t('banned.message', {
              defaultValue:
                'تم تعليق هذا الحساب من قِبل إدارة المنصة نتيجة مخالفة شروط الاستخدام أو سياسات الأمان الخاصة بمنصة مزادك.',
            })}
          </p>
        </div>

        {/* 2. Account Details & Frozen Notice */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 text-start space-y-2 text-xs">
          <div className="flex items-center justify-between font-medium text-slate-500 dark:text-slate-400">
            <span>{t('banned.accountEmail', { defaultValue: 'البريد الإلكتروني:' })}</span>
            <span className="font-mono font-bold text-slate-900 dark:text-white truncate max-w-[220px]">
              {user?.email || '—'}
            </span>
          </div>

          {user?._id && (
            <div className="flex items-center justify-between font-medium text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800">
              <span>{t('banned.accountId', { defaultValue: 'معرف الحساب:' })}</span>
              <span className="font-mono text-[11px] text-slate-700 dark:text-slate-300 truncate max-w-[220px]">
                {user._id}
              </span>
            </div>
          )}

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-amber-700 dark:text-amber-400 font-medium leading-relaxed">
            {t('banned.frozenNotice', {
              defaultValue: 'تم تجميد كافة عمليات المزايدة والبيع والرصيد المالي المرتبط بهذا الحساب.',
            })}
          </div>
        </div>

        {/* 3. Support & Appeal Box */}
        <div className="p-4 rounded-2xl bg-rose-500/5 dark:bg-rose-950/20 border border-rose-500/20 text-start space-y-2 text-xs">
          <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200">
            <Mail className="w-4 h-4 text-rose-500 shrink-0" />
            <span>{t('banned.appealInfo', { defaultValue: 'للتواصل مع فريق الدعم والامتثال لتقديم طلب التماس ومراجعة:' })}</span>
          </div>

          <a
            href={gmailComposeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 font-mono font-bold text-xs text-rose-600 dark:text-rose-400 hover:underline underline-offset-2 break-all"
          >
            <span>support@mazadak.com</span>
            <ExternalLink className="w-3.5 h-3.5 shrink-0" />
          </a>
        </div>

        {/* 4. Actions: Contact Support & Sign Out */}
        <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
          <a
            href={gmailComposeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:flex-1"
          >
            <Button
              type="button"
              variant="accent"
              size="lg"
              fullWidth
              leftIcon={<Mail className="w-4 h-4" />}
            >
              {t('banned.contactSupport', { defaultValue: 'مراسلة فريق الدعم' })}
            </Button>
          </a>

          <Button
            type="button"
            variant="outline"
            size="lg"
            fullWidth
            onClick={handleSignOut}
            leftIcon={<LogOut className="w-4 h-4" />}
            className="sm:w-auto"
          >
            {t('banned.signOut', { defaultValue: 'تسجيل الخروج' })}
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default BannedAccountPage;
