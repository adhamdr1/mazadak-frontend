import React, { useState } from 'react';
import { Star } from 'lucide-react';

export interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  interactive?: boolean;
  onChange?: (newRating: number) => void;
  showValue?: boolean;
  precision?: 'full' | 'half';
  className?: string;
  id?: string;
}

const SIZE_CONFIG = {
  xs: { iconSize: 'w-3 h-3', textSize: 'text-xs', gap: 'gap-0.5' },
  sm: { iconSize: 'w-4 h-4', textSize: 'text-xs', gap: 'gap-1' },
  md: { iconSize: 'w-5 h-5', textSize: 'text-sm', gap: 'gap-1.5' },
  lg: { iconSize: 'w-6 h-6', textSize: 'text-base', gap: 'gap-2' },
  xl: { iconSize: 'w-8 h-8', textSize: 'text-lg', gap: 'gap-2.5' },
};

export const StarRating: React.FC<StarRatingProps> = ({
  rating,
  maxRating = 5,
  size = 'md',
  interactive = false,
  onChange,
  showValue = false,
  className = '',
  id,
}) => {
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  const displayRating = interactive && hoverRating !== null ? hoverRating : rating;
  const { iconSize, textSize, gap } = SIZE_CONFIG[size];

  const handleClick = (starIndex: number) => {
    if (!interactive || !onChange) return;
    onChange(starIndex);
  };

  const handleMouseEnter = (starIndex: number) => {
    if (!interactive) return;
    setHoverRating(starIndex);
  };

  const handleMouseLeave = () => {
    if (!interactive) return;
    setHoverRating(null);
  };

  return (
    <div
      id={id}
      className={`inline-flex items-center ${gap} select-none ${className}`}
      onMouseLeave={handleMouseLeave}
      role={interactive ? 'radiogroup' : 'img'}
      aria-label={`Rating: ${rating} out of ${maxRating}`}
    >
      <div className={`flex items-center ${gap}`}>
        {Array.from({ length: maxRating }, (_, index) => {
          const starNumber = index + 1;
          // Calculate fill percentage for this star:
          // 0 = empty, 1 = full, between 0 and 1 = partial (e.g. 0.5)
          const fillFraction = Math.max(0, Math.min(1, displayRating - index));
          const fillPercentage = Math.round(fillFraction * 100);

          return (
            <button
              key={starNumber}
              type="button"
              disabled={!interactive}
              onClick={() => handleClick(starNumber)}
              onMouseEnter={() => handleMouseEnter(starNumber)}
              className={`relative inline-flex items-center justify-center p-0.5 rounded transition-transform duration-150 ${
                interactive
                  ? 'cursor-pointer hover:scale-110 focus:outline-none focus:ring-1 focus:ring-amber-400'
                  : 'cursor-default pointer-events-none'
              }`}
              aria-label={`${starNumber} star${starNumber > 1 ? 's' : ''}`}
            >
              {/* Background empty star */}
              <Star
                className={`${iconSize} text-slate-300 dark:text-slate-700 transition-colors`}
                strokeWidth={1.5}
              />

              {/* Overlapping filled star with dynamic width clipping */}
              {fillPercentage > 0 && (
                <div
                  className="absolute inset-0 overflow-hidden flex items-center p-0.5"
                  style={{ width: `${fillPercentage}%` }}
                >
                  <Star
                    className={`${iconSize} fill-amber-400 text-amber-400 shrink-0 drop-shadow-sm transition-colors`}
                    strokeWidth={1.5}
                  />
                </div>
              )}
            </button>
          );
        })}
      </div>

      {showValue && (
        <span
          className={`font-bold tabular-nums text-slate-800 dark:text-slate-100 ${textSize} ms-1`}
        >
          {rating > 0 ? rating.toFixed(1) : '0.0'}
        </span>
      )}
    </div>
  );
};
