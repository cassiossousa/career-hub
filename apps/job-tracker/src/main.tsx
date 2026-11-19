import { AppErrorBoundary } from '@career-hub/ui/components';
import { ThemeProvider } from '@mui/material/styles';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { env } from './app/env';
import { appTheme } from './app/theme';
import { TranslationProvider } from './i18n/Provider';
import { worker } from './mocks/browser';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Stale chunk after a deploy must reload, not white-screen (ChunkLoadError).
window.addEventListener('vite:preloadError', () => {
  window.location.reload();
});

if (env.isDev && env.mockApi) {
  void worker.start({ onUnhandledRequest: 'bypass' });
}

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element #root not found');
}

createRoot(rootElement).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={appTheme}>
        <TranslationProvider>
          <AppErrorBoundary>
            <App />
          </AppErrorBoundary>
        </TranslationProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </StrictMode>,
);
