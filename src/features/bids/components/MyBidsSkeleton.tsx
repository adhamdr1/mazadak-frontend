import React from 'react';

export const MyBidsSkeleton: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {Array.from({ length: 6 }).map((_, idx) => (
        <div
          key={idx}
          className="rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 p-5 space-y-4 animate-pulse"
        >
          {/* Top thumbnail + info */}
          <div className="flex items-start gap-3.5">
            <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl bg-slate-200 dark:bg-slate-800 shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="flex justify-between items-center gap-2">
                <div className="h-3.5 bg-slate-200 dark:bg-slate-800 rounded-md w-16" />
                <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded-full w-20" />
              </div>
              <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-lg w-full" />
              <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded-md w-1/3" />
            </div>
          </div>

          {/* Pricing grid */}
          <div className="grid grid-cols-2 gap-2.5 p-3 rounded-2xl bg-slate-100/70 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60">
            <div className="space-y-1.5">
              <div className="h-2.5 bg-slate-200 dark:bg-slate-700 rounded w-12" />
              <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-20" />
            </div>
            <div className="space-y-1.5 border-s border-slate-200 dark:border-slate-700 ps-3">
              <div className="h-2.5 bg-slate-200 dark:bg-slate-700 rounded w-12" />
              <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-20" />
            </div>
          </div>

          {/* Timestamp */}
          <div className="flex justify-between items-center pt-1">
            <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-24" />
            <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-16" />
          </div>

          {/* Button CTA */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
            <div className="h-9 bg-slate-200 dark:bg-slate-800 rounded-xl w-full" />
          </div>
        </div>
      ))}
    </div>
  );
};

export default MyBidsSkeleton;
