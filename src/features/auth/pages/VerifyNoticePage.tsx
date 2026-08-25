import React, { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { MailCheck, Send, ArrowRight, ArrowLeft } from 'lucide-react';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { Button } from '@/components/common/Button';
import { Alert } from '@/components/common/Alert';
import { authService } from '../services/auth.service';
import { ROUTES } from '@/constants/routes.constants';
import { getLocalizedErrorMessage, parseAppError } from '@/utils/errorHandler';

export const VerifyNoticePage: React.FC = () => {
  const { t, i18n } = useTranslation('auth');
  const location = useLocation();
  const isRTL = i18n.language.startsWith('ar');
  const email = (location.state as { email?: string })?.email || '';

  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [resendError, setResendError] = useState<string | null>(null);
  const [resendErrorCode, setResendErrorCode] = useState<string | null>(null);

  const handleResend = async () => {
    if (!email) return;
    setIsResending(true);
    setResendError(null);
    setResendErrorCode(null);
    try {
      await authService.resendConfirmationEmail(email);
      setResendSuccess(true);
    } catch (err: unknown) {
      const parsed = parseAppError(err);
      setResendErrorCode(parsed.code);
      setResendError(getLocalizedErrorMessage(err, t, 'auth'));
    } finally {
      setIsResending(false);
    }
  };

  return (
    <AuthLayout title={t('verifyNotice.title')}>
      <div className="text-center space-y-5">
        {/* Animated Icon */}
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-amber-500/10 text-amber-500 border border-amber-500/20 shadow-inner">
          <MailCheck className="w-10 h-10 animate-bounce" />
        </div>

        {/* Message */}
        <div className="space-y-2">
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            {t('verifyNotice.message')}
          </p>
          {email && (
            <div className="inline-block px-3.5 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-mono font-semibold text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
              {email}
            </div>
          )}
        </div>

        {/* Status Alerts */}
        {resendSuccess && (
          <Alert variant="success">{t('verifyNotice.resendSuccess')}</Alert>
        )}
        {resendError && (
          <Alert
            variant={resendErrorCode === 'EMAIL_ALREADY_VERIFIED' ? 'warning' : 'error'}
            action={
              resendErrorCode === 'EMAIL_ALREADY_VERIFIED' ? (
                <div className="mt-2">
                  <Link
                    to={ROUTES.LOGIN}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600 dark:text-amber-400 underline underline-offset-2 hover:opacity-80"
                  >
                    {t('login.title')} →
                  </Link>
                </div>
              ) : null
            }
          >
            {resendError}
          </Alert>
        )}

        {/* Action Buttons */}
        <div className="space-y-3 pt-2">
          {email && (
            <Button
              type="button"
              variant="outline"
              fullWidth
              size="lg"
              onClick={handleResend}
              isLoading={isResending}
              leftIcon={<Send className="w-4 h-4" />}
            >
              {t('verifyNotice.resendButton')}
            </Button>
          )}

          <Link to={ROUTES.LOGIN} className="block">
            <Button
              type="button"
              variant="accent"
              fullWidth
              size="lg"
              rightIcon={isRTL ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
            >
              {t('verifyNotice.backToLogin')}
            </Button>
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
};

export default VerifyNoticePage;
