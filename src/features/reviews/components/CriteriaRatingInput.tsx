import React from 'react';
import { useTranslation } from 'react-i18next';
import { CheckCircle2, MessageSquare, Package, ShieldCheck, X } from 'lucide-react';
import { StarRating } from './StarRating';
import { getCriteriaLabel, getCriteriaDescription } from '../utils/reviews.utils';
import type { CreateReviewCriteriaInput } from '../types/reviews.types';

export interface CriteriaRatingInputProps {
  value?: CreateReviewCriteriaInput;
  onChange: (criteria: CreateReviewCriteriaInput) => void;
  disabled?: boolean;
  className?: string;
}

const CRITERIA_KEYS: Array<{
  key: keyof CreateReviewCriteriaInput;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  { key: 'itemAccuracy', icon: CheckCircle2 },
  { key: 'communication', icon: MessageSquare },
  { key: 'packaging', icon: Package },
  { key: 'smoothExperience', icon: ShieldCheck },
];

export const CriteriaRatingInput: React.FC<CriteriaRatingInputProps> = ({
  value = {},
  onChange,
  disabled = false,
  className = '',
}) => {
  const { t } = useTranslation(['reviews', 'common']);

  const handleCriterionChange = (
    key: keyof CreateReviewCriteriaInput,
    rating: number
  ) => {
    if (disabled) return;
    onChange({
      ...value,
      [key]: rating,
    });
  };

  const handleCriterionClear = (key: keyof CreateReviewCriteriaInput) => {
    if (disabled) return;
    const next = { ...value };
    delete next[key];
    onChange(next);
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <div>
        <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
          {t('reviews:modal.detailedCriteria', 'معايير التقييم التفصيلية (اختياري)')}
        </label>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {CRITERIA_KEYS.map(({ key, icon: Icon }) => {
          const currentRating = value[key] ?? 0;
          const label = getCriteriaLabel(key, t);
          const desc = getCriteriaDescription(key, t);

          return (
            <div
              key={key}
              className={`p-3 rounded-2xl border transition-all ${
                currentRating > 0
                  ? 'bg-amber-500/5 dark:bg-amber-500/10 border-amber-500/30'
                  : 'bg-slate-50/70 dark:bg-slate-800/40 border-slate-200/70 dark:border-slate-800'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-1.5 min-w-0">
                  <Icon className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                    {label}
                  </span>
                </div>

                {currentRating > 0 && !disabled && (
                  <button
                    type="button"
                    onClick={() => handleCriterionClear(key)}
                    className="p-1 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                    title={t('common:clear', 'إلغاء التحديد')}
                    aria-label={`Clear ${label}`}
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>

              <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mb-2">
                {desc}
              </p>

              <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-700/50">
                <StarRating
                  rating={currentRating}
                  maxRating={5}
                  size="sm"
                  interactive={!disabled}
                  onChange={(rating) => handleCriterionChange(key, rating)}
                />
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 tabular-nums">
                  {currentRating > 0 ? `${currentRating}/5` : '—'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
