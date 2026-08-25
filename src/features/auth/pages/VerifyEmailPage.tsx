import React, { useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CheckCircle2, XCircle, ArrowRight, ArrowLeft } from 'lucide-react';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { Button } from '@/components/common/Button';
import { Spinner } from '@/components/common/Spinner';
import { Alert } from '@/components/common/Alert';
import { useVerifyEmail } from '../hooks/useVerifyEmail';
import { ROUTES } from '@/constants/routes.constants';

export const VerifyEmailPage: React.FC = () => {
  const { t, i18n } = useTranslation('auth');
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const isRTL = i18n.language.startsWith('ar');

  const hasRequestedRef = React.useRef(false);
  const { verifyEmail, isLoading, isSuccess, isError, error } = useVerifyEmail();

  useEffect(() => {
    if (token && !hasRequestedRef.current) {
      hasRequestedRef.current = true;
      verifyEmail(token);
    }
  }, [token, verifyEmail]);

  return (
    <AuthLayout title={t('verifyEmail.title')}>
      <div className="text-center space-y-6">
        {!token ? (
          <div className="space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-500/10 text-red-500">
              <XCircle className="w-8 h-8" />
            </div>
            <Alert variant="error">{t('verifyEmail.errorMessage')}</Alert>
            <Link to={ROUTES.LOGIN} className="block pt-2">
              <Button variant="accent" fullWidth size="lg">
                {t('verifyEmail.goToLogin')}
              </Button>
            </Link>
          </div>
        ) : isLoading ? (
          <div className="py-8 space-y-4">
            <Spinner size="lg" className="text-amber-500 mx-auto" />
            <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
              {t('verifyEmail.verifying')}
            </p>
          </div>
        ) : isSuccess ? (
          <div className="space-y-5">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 shadow-inner">
              <CheckCircle2 className="w-10 h-10 animate-bounce" />
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {t('verifyEmail.successTitle')}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {t('verifyEmail.successMessage')}
              </p>
            </div>

            <Link to={ROUTES.LOGIN} className="block pt-2">
              <Button
                type="button"
                variant="accent"
                fullWidth
                size="lg"
                rightIcon={isRTL ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
              >
                {t('verifyEmail.goToLogin')}
              </Button>
            </Link>
          </div>
        ) : isError ? (
          <div className="space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-500/10 text-red-500">
              <XCircle className="w-8 h-8" />
            </div>
            <Alert variant="error">{error || t('verifyEmail.errorMessage')}</Alert>
            <Link to={ROUTES.LOGIN} className="block pt-2">
              <Button variant="outline" fullWidth size="lg">
                {t('verifyEmail.goToLogin')}
              </Button>
            </Link>
          </div>
        ) : null}
      </div>
    </AuthLayout>
  );
};

export default VerifyEmailPage;
