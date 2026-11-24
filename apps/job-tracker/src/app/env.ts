export type DataMode = 'demo' | 'live';

const isDev = import.meta.env.DEV;
const apiUrl = import.meta.env.VITE_API_URL ?? '';
const apiKey = import.meta.env.VITE_API_KEY ?? '';

function resolveDataMode(): DataMode {
  if (isDev) {
    return import.meta.env.VITE_MOCK_API === 'false' ? 'live' : 'demo';
  }
  const liveConfigured =
    import.meta.env.VITE_DATA_MODE === 'live' && apiUrl !== '' && apiKey !== '';
  return liveConfigured ? 'live' : 'demo';
}

export const env = {
  apiUrl,
  apiKey,
  isDev,
  dataMode: resolveDataMode(),
} as const;
