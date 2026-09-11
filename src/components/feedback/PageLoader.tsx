import React from 'react';

/**
 * Temporary PageLoader fallback for React.lazy Suspense boundaries.
 * Will be upgraded to full aesthetic version in Phase 3B.
 */
export const PageLoader: React.FC = () => {
  return (
    <div
      className="flex items-center justify-center min-h-[60vh] w-full bg-slate-50 dark:bg-slate-950"
      role="status"
      aria-label="Loading page"
    >
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    </div>
  );
};

export default PageLoader;
