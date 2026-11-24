import path from 'node:path';
import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

// vite.config.ts runs before Vite loads .env files into import.meta.env, and
// only VITE_* vars are exposed there anyway — so API_PROXY_TARGET (a Node-side,
// non-VITE var) must be read from the env files explicitly. Empty prefix
// returns every parsed var; real shell env vars still take precedence.
export default defineConfig(({ mode }) => {
  const envDir = path.dirname(fileURLToPath(import.meta.url));
  const fileEnv = loadEnv(mode, envDir, '');
  const apiProxy = {
    '/api': {
      target:
        process.env.API_PROXY_TARGET ??
        fileEnv.API_PROXY_TARGET ??
        'http://127.0.0.1:8000',
      changeOrigin: true,
    },
  };

  return {
    plugins: [react(), tsconfigPaths()],
    server: {
      port: 5174,
      strictPort: true,
      proxy: apiProxy,
    },
    preview: {
      port: 4174,
      strictPort: true,
      proxy: apiProxy,
    },
  };
});
