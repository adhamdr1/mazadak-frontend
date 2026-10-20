import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/services/api/queryClient';
import { AppRoutes } from '@/routes/AppRoutes';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { ToastProvider } from '@/components/feedback/ToastProvider';
import { ToastContainer } from '@/components/feedback/ToastContainer';
import { SocketProvider } from '@/context/SocketContext';

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <SocketProvider>
          <BrowserRouter
            future={{
              v7_startTransition: true,
              v7_relativeSplatPath: true,
            }}
          >
            <ErrorBoundary>
              <AppRoutes />
              <ToastContainer />
            </ErrorBoundary>
          </BrowserRouter>
        </SocketProvider>
      </ToastProvider>
    </QueryClientProvider>
  );
};

export default App;