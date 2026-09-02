import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ShieldCheck, Gavel } from 'lucide-react';
import { BrandLogo } from '@/components/common/BrandLogo';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/constants/routes.constants';

export const Footer: React.FC = () => {
  const { t } = useTranslation('common');
  const { t: tAuctions } = useTranslation('auctions');
  const { isAuthenticated } = useAuth();

  return (
    <footer className="w-full bg-white dark:bg-slate-900 border-t border-slate-200/90 dark:border-slate-800 transition-colors duration-200 mt-auto select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Col 1: Brand & Tagline */}
          <div className="md:col-span-2 space-y-3">
            <BrandLogo size="md" />
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-sm leading-relaxed">
              {t('appTagline')}. {tAuctions('myAuctions.subtitle')}.
            </p>
            <div className="flex items-center gap-3 pt-1 text-xs text-slate-400 dark:text-slate-500">
              <span className="inline-flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>{t('footer.escrowBadge')}</span>
              </span>
              <span>•</span>
              <span className="inline-flex items-center gap-1">
                <Gavel className="w-3.5 h-3.5 text-amber-500" />
                <span>{t('footer.liveBiddingBadge')}</span>
              </span>
            </div>
          </div>

          {/* Col 2: Quick Links (Clean, No Duplicates) */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-200">
              {t('footer.quickLinksTitle')}
            </h4>
            <ul className="space-y-2 text-xs text-slate-500 dark:text-slate-400">
              <li>
                <Link to={ROUTES.HOME} className="hover:text-amber-500 transition-colors">
                  {t('nav.home')}
                </Link>
              </li>
              <li>
                <Link to={ROUTES.AUCTIONS} className="hover:text-amber-500 transition-colors">
                  {t('nav.auctions')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Account & Auth Links (Clean text-only, matches Col 2) */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-200">
              {t('footer.accountLinksTitle')}
            </h4>
            <ul className="space-y-2 text-xs text-slate-500 dark:text-slate-400">
              {isAuthenticated ? (
                <>
                  <li>
                    <Link to={ROUTES.MY_AUCTIONS} className="hover:text-amber-500 transition-colors">
                      {tAuctions('myAuctions.title')}
                    </Link>
                  </li>
                  <li>
                    <Link to={ROUTES.CREATE_AUCTION} className="hover:text-amber-500 transition-colors">
                      {tAuctions('create.title')}
                    </Link>
                  </li>
                  <li>
                    <Link to={ROUTES.UPDATE_PASSWORD} className="hover:text-amber-500 transition-colors">
                      {t('home.updatePasswordLink')}
                    </Link>
                  </li>
                </>
              ) : (
                <>
                  <li>
                    <Link to={ROUTES.LOGIN} className="hover:text-amber-500 transition-colors">
                      {t('nav.login')}
                    </Link>
                  </li>
                  <li>
                    <Link to={ROUTES.REGISTER} className="hover:text-amber-500 transition-colors">
                      {t('nav.register')}
                    </Link>
                  </li>
                  <li>
                    <Link to={ROUTES.FORGOT_PASSWORD} className="hover:text-amber-500 transition-colors">
                      {t('home.forgotPasswordLink')}
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </div>
        </div>

        {/* Bottom Copyright */}
        <div className="pt-6 border-t border-slate-100 dark:border-slate-800/80 text-center text-xs text-slate-400 dark:text-slate-500">
          <span>{t('footerCopyright')}</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
