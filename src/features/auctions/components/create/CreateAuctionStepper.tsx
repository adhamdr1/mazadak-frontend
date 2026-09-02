import React from 'react';
import { useTranslation } from 'react-i18next';
import { FileText, Image as ImageIcon, Check } from 'lucide-react';
import { cn } from '@/utils/cn';
import type { CreateAuctionStep } from '../../hooks/useCreateAuction';

export interface CreateAuctionStepperProps {
  currentStep: CreateAuctionStep;
  onStepClick?: (step: CreateAuctionStep) => void;
  className?: string;
}

export const CreateAuctionStepper: React.FC<CreateAuctionStepperProps> = ({
  currentStep,
  onStepClick,
  className,
}) => {
  const { t } = useTranslation('auctions');

  const steps = [
    {
      number: 1 as CreateAuctionStep,
      title: t('create.step1Title'),
      subtitle: t('create.step1Subtitle'),
      icon: FileText,
    },
    {
      number: 2 as CreateAuctionStep,
      title: t('create.step2Title'),
      subtitle: t('create.step2Subtitle'),
      icon: ImageIcon,
    },
  ];

  return (
    <div className={cn('w-full', className)}>
      <div className="grid grid-cols-2 gap-3 sm:gap-6">
        {steps.map((stepItem) => {
          const isActive = currentStep === stepItem.number;
          const isCompleted = currentStep > stepItem.number;
          const Icon = stepItem.icon;

          return (
            <div
              key={stepItem.number}
              onClick={() => {
                if (isCompleted && onStepClick) {
                  onStepClick(stepItem.number);
                }
              }}
              className={cn(
                'relative p-3.5 sm:p-4 rounded-2xl border transition-all duration-200 flex items-center gap-3',
                isActive &&
                  'bg-white dark:bg-slate-900 border-amber-500 dark:border-amber-500 shadow-md shadow-amber-500/10',
                isCompleted &&
                  'bg-white/90 dark:bg-slate-900/90 border-emerald-500/50 dark:border-emerald-500/50 cursor-pointer hover:border-emerald-500 dark:hover:border-emerald-500',
                !isActive &&
                  !isCompleted &&
                  'bg-slate-100/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 opacity-70'
              )}
            >
              {/* Step Icon Badge */}
              <div
                className={cn(
                  'w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 border transition-colors',
                  isActive && 'bg-amber-500 text-slate-950 border-amber-500 shadow-sm',
                  isCompleted && 'bg-emerald-500 text-white border-emerald-500',
                  !isActive &&
                    !isCompleted &&
                    'bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-300 dark:border-slate-700'
                )}
              >
                {isCompleted ? <Check className="w-5 h-5 stroke-[2.5]" /> : <Icon className="w-5 h-5" />}
              </div>

              {/* Step Info */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span
                    className={cn(
                      'text-[11px] sm:text-xs font-bold uppercase tracking-wider',
                      isActive && 'text-amber-600 dark:text-amber-400',
                      isCompleted && 'text-emerald-600 dark:text-emerald-400',
                      !isActive && !isCompleted && 'text-slate-400 dark:text-slate-500'
                    )}
                  >
                    {stepItem.number === 1 ? t('create.step1Indicator') : t('create.step2Indicator')}
                  </span>
                </div>
                <h3
                  className={cn(
                    'text-xs sm:text-sm font-bold truncate mt-0.5',
                    isActive && 'text-slate-900 dark:text-white',
                    !isActive && 'text-slate-600 dark:text-slate-400'
                  )}
                >
                  {stepItem.title}
                </h3>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CreateAuctionStepper;
