import React from 'react';

export interface ReviewSkeletonProps {
  count?: number;
  className?: string;
}

export const ReviewSkeleton: React.FC<ReviewSkeletonProps> = ({
  count = 3,
  className = '',
}) => {
  return (
    <div className={`space-y-4 ${className}`}>
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs animate-pulse"
        >
          {/* Header row: avatar + name/date + rating */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800/60">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-slate-200 dark:bg-slate-800 shrink-0" />
              <div className="space-y-2">
                <div className="h-4 w-32 bg-slate-200 dark:bg-slate-800 rounded" />
                <div className="h-3 w-20 bg-slate-100 dark:bg-slate-850 rounded" />
              </div>
            </div>

            <div className="h-7 w-20 bg-slate-200 dark:bg-slate-800 rounded-xl" />
          </div>

          {/* Comment body skeleton */}
          <div className="mt-4 space-y-2.5">
            <div className="h-3.5 w-full bg-slate-100 dark:bg-slate-800 rounded" />
            <div className="h-3.5 w-5/6 bg-slate-100 dark:bg-slate-800 rounded" />
            <div className="h-3.5 w-2/3 bg-slate-100 dark:bg-slate-800 rounded" />
          </div>

          {/* Mini pills skeleton */}
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/40 flex gap-2">
            <div className="h-6 w-28 bg-slate-100 dark:bg-slate-800 rounded-lg" />
            <div className="h-6 w-32 bg-slate-100 dark:bg-slate-800 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
};
