import { AppErrorBoundary } from '@career-hub/ui/components';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { env } from './app/env';
import { isMockApiEnabled } from './app/mockApi';
import { TranslationProvider } from './i18n/Provider';

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

async function bootstrap() {
  if (isMockApiEnabled(env)) {
    try {
      const { worker } = await import('./mocks/browser');
      // Await before render so no query can fire before the service worker
      // controls the page — required for the demo-mode no-real-API guarantee.
      // Unhandled requests must bypass: 'error' would also break static
      // assets. The /api/* catch-all handler is the real block.
      await worker.start({ onUnhandledRequest: 'bypass' });
    } catch {
      // Render anyway: without the worker, /api/* hits the SPA fallback and
      // fails — it can never reach the real API in demo mode.
    }
  }

  const rootElement = document.getElementById('root');

  if (!rootElement) {
    throw new Error('Root element #root not found');
  }

  createRoot(rootElement).render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <TranslationProvider>
          <AppErrorBoundary>
            <App />
          </AppErrorBoundary>
        </TranslationProvider>
      </QueryClientProvider>
    </StrictMode>,
  );
}

void bootstrap();
