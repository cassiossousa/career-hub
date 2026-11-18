import { defineConfig, globalIgnores } from 'eslint/config';
import security from 'eslint-plugin-security';
import tseslint from 'typescript-eslint';

const eslintConfig = defineConfig([
  ...tseslint.configs.recommended,
  {
    files: ['apps/web/src/**/*.{ts,tsx}'],
    ignores: ['apps/web/src/services/**', 'apps/web/src/**/*.spec.ts'],
    plugins: { security },
    rules: {
      ...security.configs.recommended.rules,
      'security/detect-object-injection': 'off',
    },
  },
  globalIgnores(['**/dist/**', '**/build/**']),
]);

export default eslintConfig;
