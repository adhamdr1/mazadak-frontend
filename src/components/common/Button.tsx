import React from 'react';
import { Link, type LinkProps } from 'react-router-dom';
import { cn } from '@/utils/cn';
import { Spinner } from './Spinner';

export type ButtonVariant = 'primary' | 'accent' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface BaseButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  className?: string;
  children?: React.ReactNode;
  disabled?: boolean;
}

export type ButtonAsButtonProps = BaseButtonProps &
  Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, keyof BaseButtonProps> & {
    to?: never;
  };

export type ButtonAsLinkProps = BaseButtonProps &
  Omit<LinkProps, keyof BaseButtonProps | 'to'> & {
    to: string;
  };

export type ButtonProps = ButtonAsButtonProps | ButtonAsLinkProps;

export const Button = React.forwardRef<HTMLButtonElement | HTMLAnchorElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      fullWidth = false,
      leftIcon,
      rightIcon,
      disabled,
      children,
      ...rest
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 outline-none focus:outline-none focus:ring-0 ring-0 focus-visible:outline-none disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] select-none';

    const variantStyles: Record<ButtonVariant, string> = {
      primary:
        'bg-slate-900 text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white shadow-sm',
      accent:
        'bg-amber-500 text-slate-950 font-semibold hover:bg-amber-400 shadow-md shadow-amber-500/20',
      outline:
        'border border-slate-300 dark:border-slate-700 bg-transparent text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60',
      ghost:
        'bg-transparent text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800',
      danger:
        'bg-red-600 text-white hover:bg-red-700 shadow-sm',
    };

    const sizeStyles: Record<ButtonSize, string> = {
      sm: 'text-xs px-3 py-1.5 gap-1.5',
      md: 'text-sm px-4 py-2.5 gap-2',
      lg: 'text-base px-6 py-3.5 gap-2.5',
    };

    const isInteractive = !disabled && !isLoading;
    const classes = cn(
      baseStyles,
      variantStyles[variant],
      sizeStyles[size],
      fullWidth && 'w-full',
      !isInteractive && 'opacity-50 pointer-events-none cursor-not-allowed',
      className
    );

    const content = (
      <>
        {isLoading && <Spinner size={size === 'lg' ? 'md' : 'sm'} className="shrink-0" />}
        {!isLoading && leftIcon && <span className="inline-flex shrink-0">{leftIcon}</span>}
        <span className="truncate">{children}</span>
        {!isLoading && rightIcon && <span className="inline-flex shrink-0">{rightIcon}</span>}
      </>
    );

    if ('to' in rest && rest.to) {
      const { to, onClick, ...linkRest } = rest as ButtonAsLinkProps;
      return (
        <Link
          ref={ref as React.ForwardedRef<HTMLAnchorElement>}
          to={to}
          aria-disabled={!isInteractive}
          onClick={(e) => {
            if (!isInteractive) {
              e.preventDefault();
              return;
            }
            onClick?.(e);
          }}
          className={classes}
          {...linkRest}
        >
          {content}
        </Link>
      );
    }

    return (
      <button
        ref={ref as React.ForwardedRef<HTMLButtonElement>}
        disabled={!isInteractive}
        className={classes}
        {...(rest as ButtonAsButtonProps)}
      >
        {content}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
