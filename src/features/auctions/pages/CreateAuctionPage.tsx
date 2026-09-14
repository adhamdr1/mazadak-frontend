import React from 'react';
import { useTranslation } from 'react-i18next';
import { useCreateAuction } from '../hooks/useCreateAuction';
import { CreateAuctionStepper } from '../components/create/CreateAuctionStepper';
import { Step1DetailsPricing } from '../components/create/Step1DetailsPricing';
import { Step2MediaPreview } from '../components/create/Step2MediaPreview';

export const CreateAuctionPage: React.FC = () => {
  const { t } = useTranslation('auctions');

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
    <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8">

      {/* Page Title & Subtitle (Centered) */}
      <div className="space-y-1.5 text-center max-w-xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
          {t('create.title')}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
          {t('create.subtitle')}
        </p>
      </div>

      {/* Progress Stepper */}
      <CreateAuctionStepper
        currentStep={step}
        onStepClick={(targetStep) => {
          if (targetStep === 1) goToStep1();
          if (targetStep === 2 && step >= 2) setStep(2);
        }}
      />

      {/* Step 1: Details & Pricing */}
      {step === 1 && (
        <Step1DetailsPricing
          form={form}
          onNext={goToStep2}
        />
      )}

      {/* Step 2: Media & Summary Preview */}
      {step === 2 && (
        <Step2MediaPreview
          formData={watchedValues}
          images={images}
          isUploading={isUploading}
          uploadError={uploadError}
          isPending={isPending}
          errorMessage={errorMessage}
          onFilesSelected={handleFiles}
          onRemoveImage={removeImage}
          onSetCoverImage={setCoverImage}
          onBack={goToStep1}
          onSubmit={onSubmit}
          imagesError={errors.images?.message as string | undefined}
        />
      )}
    </div>
  );
};

export default CreateAuctionPage;
