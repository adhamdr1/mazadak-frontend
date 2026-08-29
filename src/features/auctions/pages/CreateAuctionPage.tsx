import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Gavel,
  User,
  LogOut,
} from 'lucide-react';
import { useCreateAuction } from '../hooks/useCreateAuction';
import { CreateAuctionStepper } from '../components/create/CreateAuctionStepper';
import { Step1DetailsPricing } from '../components/create/Step1DetailsPricing';
import { Step2MediaPreview } from '../components/create/Step2MediaPreview';
import { LanguageSwitcher } from '@/components/common/LanguageSwitcher';
import { ThemeToggle } from '@/components/common/ThemeToggle';
import { Button } from '@/components/common/Button';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/constants/routes.constants';

export const CreateAuctionPage: React.FC = () => {
  const { t } = useTranslation('auctions');
  const { t: tCommon } = useTranslation('common');
  const { user, logout } = useAuth();

  const {
    form,
    step,
    setStep,
    goToStep1,
    goToStep2,
    watchedValues,
    images,
    isUploading,
    uploadError,
    handleFiles,
    removeImage,
    setCoverImage,
    onSubmit,
    isPending,
    errorMessage,
    errors,
  } = useCreateAuction();

  return (
    <div className="min-h-screen flex flex-col justify-between bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      {/* Top Navbar */}
      <header className="sticky top-0 z-30 w-full bg-white/95 dark:bg-slate-950/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4">
          {/* Brand Logo */}
          <Link to={ROUTES.HOME} className="flex items-center gap-2 group shrink-0">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center border border-amber-500/20 group-hover:scale-105 transition-transform">
              <Gavel className="w-5 h-5" />
            </div>
            <span className="text-lg font-black tracking-tight text-slate-900 dark:text-white">
              {tCommon('appName')}
            </span>
          </Link>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold">
            <Link
              to={ROUTES.HOME}
              className="text-slate-600 dark:text-slate-400 hover:text-amber-500 transition-colors"
            >
              {tCommon('nav.home')}
            </Link>
            <Link
              to={ROUTES.AUCTIONS}
              className="text-slate-600 dark:text-slate-400 hover:text-amber-500 transition-colors"
            >
              {t('title')}
            </Link>
            <Link
              to={ROUTES.MY_AUCTIONS}
              className="text-slate-600 dark:text-slate-400 hover:text-amber-500 transition-colors"
            >
              {t('myAuctions.title')}
            </Link>
          </nav>

          {/* User & Settings Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            <LanguageSwitcher />
            <ThemeToggle />

            <div className="flex items-center gap-2">
              <div className="hidden lg:flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                <User className="w-3.5 h-3.5 text-amber-500" />
                <span>{user?.firstName}</span>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={logout}
                leftIcon={<LogOut className="w-3.5 h-3.5" />}
                className="text-xs text-slate-500 hover:text-red-500"
              >
                {tCommon('nav.logout')}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8">
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <Link to={ROUTES.HOME} className="hover:text-amber-500 transition-colors">
            {tCommon('nav.home')}
          </Link>
          <span>/</span>
          <Link to={ROUTES.AUCTIONS} className="hover:text-amber-500 transition-colors">
            {t('title')}
          </Link>
          <span>/</span>
          <span className="text-slate-800 dark:text-slate-200 font-semibold">
            {t('create.title')}
          </span>
        </nav>

        {/* Page Header */}
        <div className="space-y-1.5">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            {t('create.title')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            {t('create.subtitle')}
          </p>
        </div>

        {/* 2-Step Interactive Stepper */}
        <CreateAuctionStepper
          currentStep={step}
          onStepClick={(targetStep) => setStep(targetStep)}
        />

        {/* Wizard Form View */}
        {step === 1 && (
          <Step1DetailsPricing
            form={form}
            onNext={goToStep2}
          />
        )}

        {step === 2 && (
          <Step2MediaPreview
            formData={watchedValues}
            images={images}
            isUploading={isUploading}
            uploadError={uploadError}
            errorMessage={errorMessage}
            isPending={isPending}
            onFilesSelected={handleFiles}
            onRemoveImage={removeImage}
            onSetCoverImage={setCoverImage}
            onBack={goToStep1}
            onSubmit={onSubmit}
            imagesError={errors.images?.message as string | undefined}
          />
        )}
      </main>

      {/* Global Footer */}
      <footer className="w-full border-t border-slate-200 dark:border-slate-800 py-6 text-center text-xs text-slate-400 dark:text-slate-600 mt-12">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span>{tCommon('footerCopyright')}</span>
          <div className="flex items-center gap-4 text-xs font-medium">
            <Link to={ROUTES.HOME} className="hover:text-amber-500 transition-colors">
              {tCommon('nav.home')}
            </Link>
            <Link to={ROUTES.AUCTIONS} className="hover:text-amber-500 transition-colors">
              {t('title')}
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default CreateAuctionPage;
