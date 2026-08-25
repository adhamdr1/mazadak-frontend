import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Mail, CheckCircle2, RefreshCw, ArrowRight, ArrowLeft } from 'lucide-react';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { Input } from '@/components/common/Input';
import { Button } from '@/components/common/Button';
import { Alert } from '@/components/common/Alert';
import { Spinner } from '@/components/common/Spinner';
import { useReactivate } from '../hooks/useReactivate';
import { ROUTES } from '@/constants/routes.constants';

export const ReactivatePage: React.FC = () => {
  const { t, i18n } = useTranslation('auth');
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const isRTL = i18n.language.startsWith('ar');

  const hasRequestedRef = React.useRef(false);
  const [email, setEmail] = useState('');
  const {
    requestReactivation,
    isRequesting,
    isRequestSuccess,
    requestedEmail,
    confirmReactivation,
    isConfirming,
    isConfirmSuccess,
    error,
  } = useReactivate();

  useEffect(() => {
    if (token && !hasRequestedRef.current) {
      hasRequestedRef.current = true;
      confirmReactivation(token);
    }
  }, [token, confirmReactivation]);

  const handleRequestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      requestReactivation(email.trim());
    }
  };

  return (
    <AuthLayout
      title={t('reactivate.title')}
      subtitle={!isRequestSuccess && !token ? t('reactivate.subtitle') : undefined}
    >
      {token ? (
        <div className="text-center space-y-5">
          {isConfirming ? (
            <div className="py-8 space-y-4">
              <Spinner size="lg" className="text-amber-500 mx-auto" />
              <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                {t('reactivate.confirming')}
              </p>
            </div>
          ) : isConfirmSuccess ? (
            <div className="space-y-5">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 shadow-inner">
                <CheckCircle2 className="w-10 h-10 animate-bounce" />
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  {t('reactivate.confirmSuccessTitle')}
                </h3>
              </div>

              <Link to={ROUTES.LOGIN} className="block pt-2">
                <Button
                  type="button"
                  variant="accent"
                  fullWidth
                  size="lg"
                  rightIcon={isRTL ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
                >
                  {t('reactivate.goToLogin')}
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              <Alert variant="error">{error || t('errors.INVALID_OR_EXPIRED_TOKEN')}</Alert>
              <Link to={ROUTES.LOGIN} className="block pt-2">
                <Button variant="outline" fullWidth size="lg">
                  {t('reactivate.goToLogin')}
                </Button>
              </Link>
            </div>
          )}
        </div>
      ) : isRequestSuccess ? (
        <div className="text-center space-y-5">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 shadow-inner">
            <CheckCircle2 className="w-10 h-10 animate-bounce" />
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {t('reactivate.successTitle')}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {t('reactivate.successMessage')}
            </p>
            {requestedEmail && (
              <div className="inline-block px-3.5 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-mono font-semibold text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
                {requestedEmail}
              </div>
            )}
          </div>

          <Link to={ROUTES.LOGIN} className="block pt-2">
            <Button
              type="button"
              variant="accent"
              fullWidth
              size="lg"
              rightIcon={isRTL ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
            >
              {t('reactivate.goToLogin')}
            </Button>
          </Link>
        </div>
      ) : (
        <form onSubmit={handleRequestSubmit} className="space-y-4" noValidate>
          {error && <Alert variant="error">{error}</Alert>}

          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            label={t('reactivate.emailLabel')}
            placeholder={t('reactivate.emailPlaceholder')}
            leftIcon={<Mail className="w-4 h-4" />}
            required
            autoComplete="email"
          />

          <Button
            type="submit"
            variant="accent"
            size="lg"
            fullWidth
            isLoading={isRequesting}
            leftIcon={<RefreshCw className="w-4 h-4" />}
            className="mt-2"
          >
            {t('reactivate.submitButton')}
          </Button>

          <div className="pt-2 text-center text-xs">
            <Link
              to={ROUTES.LOGIN}
              className="font-medium text-slate-600 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 hover:underline underline-offset-2 inline-flex items-center gap-1"
            >
              {isRTL ? <ArrowRight className="w-3.5 h-3.5" /> : <ArrowLeft className="w-3.5 h-3.5" />}
              <span>{t('verifyNotice.backToLogin')}</span>
            </Link>
          </div>
        </form>
      )}
    </AuthLayout>
  );
};

export default ReactivatePage;
