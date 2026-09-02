import React from 'react';
import { useTranslation } from 'react-i18next';
import { SearchX, RotateCcw } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { cn } from '@/utils/cn';

export interface AuctionEmptyStateProps {
  onResetFilters?: () => void;
  className?: string;
}

export const AuctionEmptyState: React.FC<AuctionEmptyStateProps> = ({
  onResetFilters,
  className,
}) => {
  const { t } = useTranslation('auctions');

  return (
    <Card
      glass
      padding="lg"
      className={cn(
        'w-full text-center py-12 px-4 border-dashed border-2 border-slate-200 dark:border-slate-800',
        className
      )}
    >
      <div className="max-w-md mx-auto space-y-4">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20 shadow-inner">
          <SearchX className="w-8 h-8" />
        </div>

        <div className="space-y-1.5">
          <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100">
            {t('browse.noResults')}
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
            {t('browse.noResultsHint')}
          </p>
        </div>

        {onResetFilters && (
          <div className="pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onResetFilters}
              leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
              className="border-amber-500/40 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10"
            >
              {t('browse.resetFilters')}
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
};

export default AuctionEmptyState;
