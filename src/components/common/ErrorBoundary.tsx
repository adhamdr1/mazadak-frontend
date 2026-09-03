import { Component, ErrorInfo, type ReactNode } from 'react';
import i18n from 'i18next';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

export interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode | ((props: { error: Error; resetErrorBoundary: () => void }) => ReactNode);
  onReset?: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to console for monitoring
    console.error('[Mazadak ErrorBoundary Caught Exception]:', error, errorInfo);
  }

  public resetErrorBoundary = () => {
    this.props.onReset?.();
    this.setState({ hasError: false, error: null });
  };

  public render(): ReactNode {
    if (this.state.hasError) {
      if (typeof this.props.fallback === 'function' && this.state.error) {
        return this.props.fallback({
          error: this.state.error,
          resetErrorBoundary: this.resetErrorBoundary,
        });
      }

      if (this.props.fallback && typeof this.props.fallback !== 'function') {
        return this.props.fallback;
      }

      const isRtl = i18n.language?.startsWith('ar');

      return (
        <div
          dir={isRtl ? 'rtl' : 'ltr'}
          className="min-h-[60vh] w-full flex items-center justify-center p-4 sm:p-6"
        >
          <div className="max-w-lg w-full bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-8 shadow-xl border border-slate-200/80 dark:border-slate-800 text-center space-y-6">
            {/* Warning Icon with radiant background */}
            <div className="mx-auto w-16 h-16 rounded-2xl bg-amber-500/10 dark:bg-amber-500/20 border border-amber-500/20 flex items-center justify-center text-amber-500">
              <AlertTriangle className="w-8 h-8 animate-pulse" />
            </div>

            {/* Error Headlines */}
            <div className="space-y-2">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">
                {i18n.t('common:errorBoundary.title')}
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                {i18n.t('common:errorBoundary.description')}
              </p>
            </div>

            {/* Recovery Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={this.resetErrorBoundary}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20 active:scale-95 transition-all duration-200"
              >
                <RefreshCw className="w-4 h-4" />
                <span>{i18n.t('common:errorBoundary.retry')}</span>
              </button>

              <a
                href="/"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 active:scale-95 transition-all duration-200"
              >
                <Home className="w-4 h-4" />
                <span>{i18n.t('common:errorBoundary.home')}</span>
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
