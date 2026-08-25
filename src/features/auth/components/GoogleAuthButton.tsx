import React from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useTranslation } from 'react-i18next';
import { cn } from '@/utils/cn';

export interface GoogleAuthButtonProps {
  onSuccess?: (idToken: string) => void;
  onError?: () => void;
  isLoading?: boolean;
  label?: string;
  className?: string;
}

export const GoogleAuthButton: React.FC<GoogleAuthButtonProps> = ({
  onSuccess,
  onError,
  isLoading = false,
  label,
  className,
}) => {
  const { t } = useTranslation('auth');
  const buttonText = label || t('login.googleButton');

  return (
    <div className={cn('relative w-full overflow-hidden rounded-xl group', className)}>
      {/* Visual Custom Designed Premium Button */}
      <button
        type="button"
        disabled={isLoading}
        className={cn(
          'w-full flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-xl text-sm font-medium transition-all duration-200',
          'border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900',
          'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/80',
          'shadow-sm group-hover:border-slate-300 dark:group-hover:border-slate-700 active:scale-[0.99]',
          isLoading && 'opacity-60 pointer-events-none'
        )}
      >
        <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
          />
        </svg>
        <span>{buttonText}</span>
      </button>

      {/* Invisible Overlay of Official Google Sign-In Provider (Guarantees Valid ID Token JWT) */}
      <div className="absolute inset-0 opacity-0 overflow-hidden cursor-pointer z-10 scale-150 origin-center">
        <GoogleLogin
          onSuccess={(credentialResponse) => {
            if (credentialResponse.credential && onSuccess) {
              onSuccess(credentialResponse.credential);
            }
          }}
          onError={onError}
          theme="outline"
          size="large"
          width="400"
        />
      </div>
    </div>
  );
};

export default GoogleAuthButton;
