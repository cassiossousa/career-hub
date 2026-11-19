import eslintReact from '@eslint-react/eslint-plugin';
import { defineConfig, globalIgnores } from 'eslint/config';
import checkFile from 'eslint-plugin-check-file';
import noBarrelFiles from 'eslint-plugin-no-barrel-files';
import reactHooks from 'eslint-plugin-react-hooks';
import reactYouMightNotNeedAnEffect from 'eslint-plugin-react-you-might-not-need-an-effect';
import security from 'eslint-plugin-security';
import sonarjs from 'eslint-plugin-sonarjs';
import tseslint from 'typescript-eslint';

const STORAGE_MESSAGE =
  'Use storageGetItem/storageSetItem from app/storage — raw Web Storage throws when disabled.';

const eslintConfig = defineConfig([
  ...tseslint.configs.recommended,
  {
    files: ['apps/professional-portfolio/src/**/*.{ts,tsx}'],
    extends: [tseslint.configs.strictTypeChecked],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    files: ['apps/professional-portfolio/src/**/*.{ts,tsx}'],
    ignores: [
      'apps/professional-portfolio/src/services/**',
      'apps/professional-portfolio/src/**/*.spec.ts',
    ],
    plugins: { security },
    rules: {
      ...security.configs.recommended.rules,
      'security/detect-object-injection': 'off',
    },
  },
  {
    files: ['apps/professional-portfolio/src/**/*.{ts,tsx}'],
    ...eslintReact.configs['recommended-type-checked'],
  },
  {
    files: ['apps/professional-portfolio/src/**/*.{ts,tsx}'],
    ...reactYouMightNotNeedAnEffect.configs.recommended,
  },
  {
    files: ['apps/professional-portfolio/src/**/*.{ts,tsx}'],
    plugins: {
      'react-hooks': reactHooks,
      sonarjs,
      'check-file': checkFile,
      'no-barrel-files': noBarrelFiles,
    },
    rules: {
      ...reactHooks.configs['recommended-latest'].rules,
      'sonarjs/cognitive-complexity': ['error', 10],
      '@typescript-eslint/restrict-template-expressions': [
        'error',
        { allowNumber: true },
      ],
      'check-file/filename-naming-convention': [
        'error',
        {
          '**/*.tsx': 'PASCAL_CASE',
          '**/*.ts': 'CAMEL_CASE',
        },
        { ignoreMiddleExtensions: true },
      ],
      'no-barrel-files/no-barrel-files': 'error',
    },
  },
  {
    files: ['apps/professional-portfolio/src/**/*.{ts,tsx}'],
    ignores: ['apps/professional-portfolio/src/app/storage.ts'],
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector:
            "MemberExpression[object.name='localStorage'], MemberExpression[object.name='sessionStorage']",
          message: STORAGE_MESSAGE,
        },
        {
          selector:
            "MemberExpression[property.name='localStorage'], MemberExpression[property.name='sessionStorage']",
          message: STORAGE_MESSAGE,
        },
      ],
    },
  },
  {
    // The storage spec must touch raw Web Storage to simulate disabled/quota
    // storage — that failure path is untestable through the wrapper itself.
    files: ['apps/professional-portfolio/src/app/storage.spec.ts'],
    rules: { 'no-restricted-syntax': 'off' },
  },
  {
    files: ['apps/professional-portfolio/src/i18n/locales/*.ts'],
    rules: { 'check-file/filename-naming-convention': 'off' },
  },
  {
    files: ['apps/professional-portfolio/src/main.tsx'],
    rules: { 'check-file/filename-naming-convention': 'off' },
  },
  globalIgnores([
    '**/dist/**',
    '**/build/**',
    '**/.stryker-tmp/**',
    '**/coverage/**',
  ]),
]);

export default eslintConfig;
