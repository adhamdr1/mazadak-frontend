import React from 'react';
import { cn } from '@/utils/cn';

export interface EscrowsSkeletonProps {
  count?: number;
  className?: string;
}

export const EscrowsSkeleton: React.FC<EscrowsSkeletonProps> = ({
  count = 3,
  className,
}) => {
  return (
    <div className={cn('space-y-4', className)}>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-5 shadow-sm animate-pulse"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start sm:items-center gap-4 flex-1 min-w-0">
              {/* Thumbnail */}
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-slate-200 dark:bg-slate-800 flex-shrink-0" />

              {/* Text lines */}
              <div className="flex-1 min-w-0 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-24 h-5 rounded-full bg-slate-200 dark:bg-slate-800" />
                  <div className="w-20 h-5 rounded-full bg-slate-200/60 dark:bg-slate-800/60" />
                </div>
                <div className="w-48 sm:w-64 h-5 rounded-md bg-slate-200 dark:bg-slate-800" />
                <div className="w-32 h-3.5 rounded-md bg-slate-200/60 dark:bg-slate-800/60" />
              </div>
            </div>

            {/* Price and action */}
            <div className="w-full sm:w-auto flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-3">
              <div className="space-y-1">
                <div className="w-16 h-3 rounded-md bg-slate-200/60 dark:bg-slate-800/60" />
                <div className="w-24 h-6 rounded-md bg-slate-200 dark:bg-slate-800" />
              </div>
              <div className="w-28 h-8 rounded-xl bg-slate-200 dark:bg-slate-800" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
