export const env = {
  apiUrl: import.meta.env.VITE_API_URL ?? 'http://localhost:8000',
  apiKey: import.meta.env.VITE_API_KEY ?? '',
  isDev: import.meta.env.DEV,
  mockApi: import.meta.env.VITE_MOCK_API !== 'false',
} as const;
