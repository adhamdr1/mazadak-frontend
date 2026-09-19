import React from 'react';
import { useTranslation } from 'react-i18next';
import { Check, Coins, UserCheck, ShieldCheck } from 'lucide-react';

export interface WithdrawStepIndicatorProps {
  currentStep: number;
  onStepClick?: (step: number) => void;
  maxAccessibleStep?: number;
}

interface StepItem {
  id: number;
  labelKey: string;
  defaultLabel: string;
  icon: React.ElementType;
}

const STEPS: StepItem[] = [
  { id: 1, labelKey: 'withdraw.steps.amountAndMethod', defaultLabel: 'المبلغ والوسيلة', icon: Coins },
  { id: 2, labelKey: 'withdraw.steps.details', defaultLabel: 'بيانات التحويل', icon: UserCheck },
  { id: 3, labelKey: 'withdraw.steps.confirm', defaultLabel: 'المراجعة والتأكيد', icon: ShieldCheck },
];

export const WithdrawStepIndicator: React.FC<WithdrawStepIndicatorProps> = ({
  currentStep,
  onStepClick,
  maxAccessibleStep = currentStep,
}) => {
  const { t } = useTranslation(['wallet']);

  return (
    <div className="w-full py-1">
      {/* Desktop / Tablet Stepper */}
      <div className="flex items-start">
        {STEPS.map((step, index) => {
          const isCompleted = step.id < currentStep;
          const isCurrent = step.id === currentStep;
          const isClickable = onStepClick && step.id <= maxAccessibleStep && !isCurrent;
          const IconComponent = step.icon;

          return (
            <React.Fragment key={step.id}>
              {/* Step Circle & Label */}
              <div className="relative flex flex-col items-center shrink-0">
                <button
                  type="button"
                  disabled={!isClickable}
                  onClick={() => isClickable && onStepClick(step.id)}
                  className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm transition-all duration-300 z-10 shrink-0 ${
                    isCurrent
                      ? 'bg-amber-500 text-slate-950 ring-4 ring-amber-500/30 shadow-md scale-105'
                      : isCompleted
                      ? 'bg-amber-500 text-slate-950 border-2 border-amber-500 shadow-2xs cursor-pointer hover:bg-amber-600 active:scale-95'
                      : 'bg-white dark:bg-slate-900 text-slate-400 dark:text-slate-600 border-2 border-slate-200 dark:border-slate-800 cursor-default'
                  }`}
                  title={t(`wallet:${step.labelKey}`, step.defaultLabel)}
                >
                  {isCompleted ? (
                    <Check className="w-5 h-5 stroke-[2.5]" />
                  ) : (
                    <IconComponent className="w-5 h-5" />
                  )}
                </button>

                <span
                  className={`mt-2 text-[11px] sm:text-xs font-bold transition-colors hidden sm:block whitespace-nowrap text-center ${
                    isCurrent
                      ? 'text-slate-900 dark:text-white font-extrabold'
                      : isCompleted
                      ? 'text-slate-700 dark:text-slate-300'
                      : 'text-slate-400 dark:text-slate-600'
                  }`}
                >
                  {t(`wallet:${step.labelKey}`, step.defaultLabel)}
                </span>
              </div>

              {/* Connecting Segment Line (ONLY between steps, never after the last step) */}
              {index < STEPS.length - 1 && (
                <div className="flex-1 h-0.5 mx-2 sm:mx-4 bg-slate-200 dark:bg-slate-800 relative overflow-hidden rounded-full self-start mt-5 sm:mt-5.5">
                  <div
                    className={`h-full bg-gradient-to-r from-amber-500 to-amber-600 transition-all duration-500 ${
                      currentStep > step.id ? 'w-full' : 'w-0'
                    }`}
                  />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Mobile Step Title */}
      <div className="mt-3 text-center sm:hidden">
        <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
          {t('wallet:withdraw.stepOf', {
            step: currentStep,
            total: 3,
            defaultValue: `الخطوة ${currentStep} من 3`,
          })}
          :
        </span>{' '}
        <span className="text-xs font-extrabold text-slate-900 dark:text-white">
          {t(
            `wallet:${STEPS[currentStep - 1]?.labelKey}`,
            STEPS[currentStep - 1]?.defaultLabel
          )}
        </span>
      </div>
    </div>
  );
};
