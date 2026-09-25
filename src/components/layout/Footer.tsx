import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ShieldCheck, Lock, Gavel, Code2 } from 'lucide-react';
import { BrandLogo } from '@/components/common/BrandLogo';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/constants/routes.constants';

export const Footer: React.FC = () => {
  const { t, i18n } = useTranslation(['common', 'auctions', 'bids']);
  const { t: tAuctions } = useTranslation('auctions');
  const { t: tBids } = useTranslation('bids');
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const isRTL = i18n.language?.startsWith('ar');

  const handleHomeClick = () => {
    if (location.pathname === ROUTES.HOME) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <footer className="w-full bg-white dark:bg-slate-900 border-t border-slate-200/90 dark:border-slate-800 transition-colors duration-200 mt-auto select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-6 sm:space-y-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {/* Col 1: Brand, Platform Bio & Developer Credit */}
          <div className="order-1 col-span-2 lg:col-span-1 lg:order-1 space-y-2.5">
            <BrandLogo size="md" />
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm leading-relaxed">
              {isRTL
                ? 'منصة مزادك هي منصة مزادات رقمية حية تتيح المزايدة المباشرة في الوقت الفعلي مع نظام وساطة وضمان مالي محكم لحماية البائع والمشتري.'
                : 'Mazadak is a premier live digital auction platform featuring real-time bidding with secure escrow protection for buyers and sellers.'}
            </p>

            {/* Developer Credit */}
            <div className="pt-1 flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500 font-medium">
              <Code2 className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span>
                {isRTL ? 'تطوير' : 'Developed by'}{' '}
                <strong className="text-slate-800 dark:text-slate-200 font-bold">
                  {isRTL ? 'أدهم محمد' : 'Adham Mohamed'}
                </strong>
              </span>
            </div>
          </div>

          {/* Col 2: Auctions & Bids Links */}
          <div className="order-2 col-span-1 lg:col-span-1 lg:order-2 space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-200">
              {t('footer.auctionsTitle')}
            </h4>
            <ul className="space-y-2 text-xs text-slate-500 dark:text-slate-400">
              <li>
                <Link
                  to={ROUTES.HOME}
                  onClick={handleHomeClick}
                  className="hover:text-amber-500 transition-colors"
                >
                  {t('nav.home')}
                </Link>
              </li>
              <li>
                <Link to={ROUTES.AUCTIONS} className="hover:text-amber-500 transition-colors">
                  {t('nav.auctions')}
                </Link>
              </li>
              {isAuthenticated && (
                <>
                  <li>
                    <Link to={ROUTES.MY_AUCTIONS} className="hover:text-amber-500 transition-colors">
                      {tAuctions('myAuctions.title')}
                    </Link>
                  </li>
                  <li>
                    <Link to={ROUTES.MY_BIDS} className="hover:text-amber-500 transition-colors">
                      {tBids('pageTitle')}
                    </Link>
                  </li>
                  <li>
                    <Link to={ROUTES.MY_ESCROWS} className="hover:text-amber-500 transition-colors">
                      {t('nav.myEscrows')}
                    </Link>
                  </li>
                  <li>
                    <Link to={ROUTES.CREATE_AUCTION} className="hover:text-amber-500 transition-colors">
                      {tAuctions('create.title')}
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </div>

          {/* Col 3: Trust & Protection (Opposite Auctions on half-screen, Column 4 on full-screen) */}
          <div className="order-3 col-span-1 lg:col-span-1 lg:order-4 space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-200">
              {t('footer.trustTitle')}
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-500 dark:text-slate-400">
              <li className="flex items-start gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                <span>{t('footer.trustEscrow')}</span>
              </li>
              <li className="flex items-start gap-2">
                <Lock className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                <span>{t('footer.trustPayments')}</span>
              </li>
              <li className="flex items-start gap-2">
                <Gavel className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                <span>{t('footer.trustFairPlay')}</span>
              </li>
            </ul>
          </div>

          {/* Col 4: Account & Security (Column 3 on full-screen desktop, after Auctions) */}
          <div className="order-4 col-span-2 sm:col-span-1 lg:col-span-1 lg:order-3 space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-200">
              {t('footer.accountTitle')}
            </h4>
            <ul className="space-y-2 text-xs text-slate-500 dark:text-slate-400">
              {isAuthenticated ? (
                <>
                  <li>
                    <Link to={ROUTES.WALLET} className="hover:text-amber-500 transition-colors">
                      {t('footer.wallet')}
                    </Link>
                  </li>
                  <li>
                    <Link to={ROUTES.WALLET_WITHDRAWALS} className="hover:text-amber-500 transition-colors">
                      {t('footer.withdrawals')}
                    </Link>
                  </li>
                  <li>
                    <Link to={ROUTES.WALLET_TRANSACTIONS} className="hover:text-amber-500 transition-colors">
                      {t('footer.transactions')}
                    </Link>
                  </li>
                  <li>
                    <Link to={ROUTES.UPDATE_PASSWORD} className="hover:text-amber-500 transition-colors">
                      {t('footer.updatePassword')}
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
                      {t('footer.forgotPassword')}
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </div>
        </div>

        {/* Bottom Copyright */}
        <div className="pt-5 border-t border-slate-100 dark:border-slate-800/80 text-center text-xs text-slate-400 dark:text-slate-500">
          <span>{t('footerCopyright')}</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
