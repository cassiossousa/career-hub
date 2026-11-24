import path from 'node:path';
import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv, type Plugin } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import type { ContentEntry, ContentType } from './src/types/content';
import type { Locale } from './src/types/i18n';

const virtualModuleId = 'virtual:portfolio-content';
const resolvedVirtualModuleId = `\0${virtualModuleId}`;
const locales: Locale[] = ['en', 'pt-BR'];

type GetAllEntries = (type: ContentType, locale: string) => ContentEntry[];

function portfolioContent(getAllEntries: GetAllEntries): Plugin {
  return {
    name: 'portfolio-content',
    resolveId(id) {
      return id === virtualModuleId ? resolvedVirtualModuleId : undefined;
    },
    load(id) {
      if (id !== resolvedVirtualModuleId) return undefined;

      const content = Object.fromEntries(
        locales.map((locale) => [
          locale,
          {
            projects: getAllEntries('projects', locale),
            workExperience: getAllEntries('work-experience', locale),
          },
        ]),
      );

      return `export const content = ${JSON.stringify(content)};`;
    },
  };
}

// vite.config.ts runs before Vite loads .env files into import.meta.env, and
// only VITE_* vars are exposed there anyway — so API_PROXY_TARGET (a Node-side,
// non-VITE var) must be read from the env files explicitly. Empty prefix
// returns every parsed var; real shell env vars still take precedence.
export default defineConfig(async ({ mode }) => {
  const webRoot = path.dirname(fileURLToPath(import.meta.url));
  process.env.PORTFOLIO_ROOT = path.resolve(webRoot, '../..');
  const fileEnv = loadEnv(mode, webRoot, '');
  const apiProxy = {
    '/api': {
      target:
        process.env.API_PROXY_TARGET ??
        fileEnv.API_PROXY_TARGET ??
        'http://localhost:8000',
      changeOrigin: true,
    },
  };

  const { getAllEntries } = await import('./src/services/content');

  return {
    root: webRoot,
    base: process.env.VITE_BASE_PATH ?? '/',
    plugins: [react(), tsconfigPaths(), portfolioContent(getAllEntries)],
    server: { proxy: apiProxy },
    preview: { host: true, port: 4173, proxy: apiProxy },
  };
});
