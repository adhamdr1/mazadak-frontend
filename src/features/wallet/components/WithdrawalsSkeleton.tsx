import React from 'react';
import { cn } from '@/utils/cn';

export interface WithdrawalsSkeletonProps {
  count?: number;
  className?: string;
}

export const WithdrawalsSkeleton: React.FC<WithdrawalsSkeletonProps> = ({
  count = 3,
  className,
}) => {
  return (
    <div className={cn('space-y-4', className)}>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-sm space-y-5 animate-pulse"
        >
          {/* Header Row */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3.5 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-800" />
              <div className="space-y-1.5">
                <div className="w-28 h-4 rounded-md bg-slate-200 dark:bg-slate-800" />
                <div className="w-20 h-3 rounded-md bg-slate-200/60 dark:bg-slate-800/60" />
              </div>
            </div>
            <div className="w-24 h-6 rounded-full bg-slate-200 dark:bg-slate-800" />
          </div>

          {/* Details & Amounts Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1">
              <div className="w-20 h-3 rounded-md bg-slate-200/60 dark:bg-slate-800/60" />
              <div className="w-24 h-5 rounded-md bg-slate-200 dark:bg-slate-800" />
            </div>
            <div className="space-y-1">
              <div className="w-16 h-3 rounded-md bg-slate-200/60 dark:bg-slate-800/60" />
              <div className="w-20 h-5 rounded-md bg-slate-200 dark:bg-slate-800" />
            </div>
            <div className="space-y-1">
              <div className="w-20 h-3 rounded-md bg-slate-200/60 dark:bg-slate-800/60" />
              <div className="w-28 h-6 rounded-md bg-slate-200 dark:bg-slate-800" />
            </div>
          </div>

          {/* Footer Action Bar */}
          <div className="pt-2 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
            <div className="w-36 h-4 rounded-md bg-slate-200/60 dark:bg-slate-800/60" />
            <div className="w-24 h-8 rounded-xl bg-slate-200 dark:bg-slate-800" />
          </div>
        </div>
      ))}
    </div>
  );
};

export default WithdrawalsSkeleton;
