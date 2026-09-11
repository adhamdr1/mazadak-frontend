import React from 'react';
import { PackageOpen } from 'lucide-react';
import { Button, type ButtonVariant } from '@/components/common/Button';
import { cn } from '@/utils/cn';

export interface EmptyStateAction {
  label: string;
  onClick: () => void;
  variant?: ButtonVariant;
  icon?: React.ReactNode;
  isLoading?: boolean;
}

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: EmptyStateAction;
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const SIZE_VARIANTS = {
  sm: {
    wrapper: 'py-8 px-4',
    iconWrapper: 'w-12 h-12 text-slate-400 dark:text-slate-500',
    iconSize: 'w-6 h-6',
    title: 'text-base font-semibold',
    description: 'text-xs max-w-xs',
  },
  md: {
    wrapper: 'py-12 px-6',
    iconWrapper: 'w-16 h-16 text-slate-400 dark:text-slate-500',
    iconSize: 'w-8 h-8',
    title: 'text-lg font-bold',
    description: 'text-sm max-w-md',
  },
  lg: {
    wrapper: 'py-16 px-8',
    iconWrapper: 'w-20 h-20 text-slate-400 dark:text-slate-500',
    iconSize: 'w-10 h-10',
    title: 'text-xl sm:text-2xl font-bold',
    description: 'text-sm sm:text-base max-w-lg',
  },
};

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  secondaryAction,
  size = 'md',
  className,
}) => {
  const sizeStyles = SIZE_VARIANTS[size] || SIZE_VARIANTS.md;

  return (
    <div
      role="region"
      aria-label={title}
      className={cn(
        'flex flex-col items-center justify-center text-center rounded-2xl',
        'border border-dashed border-slate-200 dark:border-slate-800',
        'bg-slate-50/50 dark:bg-slate-900/30 backdrop-blur-xs transition-all duration-200',
        sizeStyles.wrapper,
        className
      )}
    >
      {/* Icon with Ambient Glow */}
      <div className="relative mb-4 flex items-center justify-center">
        <div className="absolute inset-0 rounded-full bg-amber-500/10 dark:bg-amber-500/15 blur-lg transform scale-125" />
        <div
          className={cn(
            'relative flex items-center justify-center rounded-2xl',
            'bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700/60',
            sizeStyles.iconWrapper
          )}
        >
          {icon ? (
            React.isValidElement(icon) ? (
              React.cloneElement(icon as React.ReactElement<{ className?: string }>, {
                className: cn(sizeStyles.iconSize, (icon as React.ReactElement<{ className?: string }>).props?.className),
              })
            ) : (
              icon
            )
          ) : (
            <PackageOpen className={sizeStyles.iconSize} />
          )}
        </div>
      </div>

      {/* Title */}
      <h3 className={cn('text-slate-900 dark:text-slate-100 mb-1.5', sizeStyles.title)}>
        {title}
      </h3>

      {/* Description */}
      {description && (
        <p className={cn('text-slate-500 dark:text-slate-400 leading-relaxed mb-6', sizeStyles.description)}>
          {description}
        </p>
      )}

      {/* Action Buttons */}
      {(action || secondaryAction) && (
        <div className="flex flex-wrap items-center justify-center gap-3">
          {action && (
            <Button
              variant={action.variant || 'primary'}
              size={size === 'sm' ? 'sm' : 'md'}
              onClick={action.onClick}
              isLoading={action.isLoading}
              leftIcon={action.icon}
            >
              {action.label}
            </Button>
          )}

          {secondaryAction && (
            <button
              type="button"
              onClick={secondaryAction.onClick}
              className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-amber-500 dark:hover:text-amber-400 underline underline-offset-4 transition-colors"
            >
              {secondaryAction.label}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default EmptyState;
