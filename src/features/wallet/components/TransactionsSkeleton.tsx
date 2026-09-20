import React from 'react';

export const TransactionsSkeleton: React.FC = () => {
  return (
    <>
      {/* Desktop Table Skeletons */}
      <div className="hidden md:block overflow-hidden rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="p-4 flex items-center justify-between gap-4 animate-pulse">
              <div className="w-24 h-6 rounded-full bg-slate-200 dark:bg-slate-800" />
              <div className="w-28 h-6 rounded-lg bg-slate-200 dark:bg-slate-800" />
              <div className="w-20 h-6 rounded-full bg-slate-200 dark:bg-slate-800" />
              <div className="w-32 h-5 rounded-md bg-slate-200 dark:bg-slate-800" />
              <div className="w-16 h-5 rounded-md bg-slate-200 dark:bg-slate-800" />
              <div className="w-12 h-6 rounded-md bg-slate-200 dark:bg-slate-800" />
            </div>
          ))}
        </div>
      </div>

      {/* Mobile Card Skeletons */}
      <div className="md:hidden space-y-3">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-3 animate-pulse"
          >
            <div className="flex items-center justify-between">
              <div className="w-20 h-5 rounded-full bg-slate-200 dark:bg-slate-800" />
              <div className="w-16 h-5 rounded-full bg-slate-200 dark:bg-slate-800" />
            </div>
            <div className="flex items-baseline justify-between pt-1">
              <div className="w-28 h-6 rounded-lg bg-slate-200 dark:bg-slate-800" />
              <div className="w-14 h-4 rounded-md bg-slate-200 dark:bg-slate-800" />
            </div>
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between">
              <div className="w-32 h-4 rounded-md bg-slate-200 dark:bg-slate-800" />
              <div className="w-12 h-4 rounded-md bg-slate-200 dark:bg-slate-800" />
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default TransactionsSkeleton;
