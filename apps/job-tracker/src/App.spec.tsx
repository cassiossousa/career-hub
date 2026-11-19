import { QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import App from './App';
import { TranslationProvider } from './i18n/Provider';
import { createTestQueryClient } from './test/TestUtils';

function AppProviders({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={createTestQueryClient()}>
      <TranslationProvider>{children}</TranslationProvider>
    </QueryClientProvider>
  );
}

describe('App', () => {
  afterEach(() => {
    window.history.pushState({}, '', '/');
  });

  it('renders the dashboard route with layout', async () => {
    window.history.pushState({}, '', '/');
    render(<App />, { wrapper: AppProviders });
    expect(await screen.findByText('Job Tracker')).toBeInTheDocument();
    expect(
      await screen.findByText('Total Jobs', {}, { timeout: 10000 }),
    ).toBeInTheDocument();
  }, 30000);

  it('renders the not-found state for unknown routes', () => {
    window.history.pushState({}, '', '/definitely-not-a-route');
    render(<App />, { wrapper: AppProviders });
    expect(screen.getByText('Page not found.')).toBeInTheDocument();
  });
});
