import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { getAllEntries } from './src/services/content';
import type { Locale } from './src/types/i18n';

const virtualModuleId = 'virtual:portfolio-content';
const resolvedVirtualModuleId = `\0${virtualModuleId}`;
const locales: Locale[] = ['en', 'pt-BR'];

function portfolioContent(): Plugin {
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

export default defineConfig({
  plugins: [react(), portfolioContent()],
});
