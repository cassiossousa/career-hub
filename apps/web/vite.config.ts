import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import type { Locale } from './src/types/i18n';
import type { ContentEntry, ContentType } from './src/types/content';

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

export default defineConfig(async () => {
  const webRoot = path.dirname(fileURLToPath(import.meta.url));
  process.env.PORTFOLIO_ROOT = path.resolve(webRoot, '../..');

  const { getAllEntries } = await import('./src/services/content');

  return {
    root: webRoot,
    base: process.env.VITE_BASE_PATH ?? '/',
    plugins: [react(), portfolioContent(getAllEntries)],
  };
});
