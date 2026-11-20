import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { HttpResponse, http } from 'msw';
import type { ReactElement, ReactNode } from 'react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { TranslationProvider } from '../i18n/Provider';
import { server } from '../mocks/server';

export function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
}

let activeQueryClient: QueryClient;
let activeRoute = '/';

function TestProviders({ children }: { children: ReactNode }) {
  const router = createMemoryRouter([{ path: '*', element: <>{children}</> }], {
    initialEntries: [activeRoute],
  });
  return (
    <QueryClientProvider client={activeQueryClient}>
      <TranslationProvider>
        <RouterProvider router={router} />
      </TranslationProvider>
    </QueryClientProvider>
  );
}

export function renderWithProviders(
  ui: ReactElement,
  options?: { route?: string },
): ReturnType<typeof render> & { queryClient: QueryClient } {
  activeQueryClient = createTestQueryClient();
  activeRoute = options?.route ?? '/';
  const result = render(ui, { wrapper: TestProviders });
  return Object.assign(result, { queryClient: activeQueryClient });
}

export function ApiTestWrapper({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={createTestQueryClient()}>
      {children}
    </QueryClientProvider>
  );
}

type MockMethod = 'get' | 'post' | 'put' | 'patch' | 'delete';

const mockMethodHandlers = {
  get: http.get,
  post: http.post,
  put: http.put,
  patch: http.patch,
  delete: http.delete,
} as const;

export function mockApiJson(
  method: MockMethod,
  path: string,
  body: Parameters<typeof HttpResponse.json>[0],
  status = 200,
) {
  server.use(
    mockMethodHandlers[method](path, () => HttpResponse.json(body, { status })),
  );
}

export async function expectErrorWithRetry(message: string) {
  expect(await screen.findByText(message)).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: /retry/i }));
}

export function expectJobTitlesRendered() {
  expect(
    screen.getAllByText(/Frontend|Backend|Fullstack/).length,
  ).toBeGreaterThan(0);
}

export async function waitForQuerySuccess(isReady: () => boolean) {
  await waitFor(
    () => {
      expect(isReady()).toBe(true);
    },
    { timeout: 8000 },
  );
}
