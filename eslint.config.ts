import eslintReact from '@eslint-react/eslint-plugin';
import { defineConfig, globalIgnores } from 'eslint/config';
import checkFile from 'eslint-plugin-check-file';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import noBarrelFiles from 'eslint-plugin-no-barrel-files';
import reactHooks from 'eslint-plugin-react-hooks';
import reactYouMightNotNeedAnEffect from 'eslint-plugin-react-you-might-not-need-an-effect';
import security from 'eslint-plugin-security';
import sonarjs from 'eslint-plugin-sonarjs';
import tseslint from 'typescript-eslint';

const STORAGE_MESSAGE =
  'Use storageGetItem/storageSetItem from app/storage — raw Web Storage throws when disabled.';

const APP_SOURCE_FILES = [
  'apps/*/src/**/*.{ts,tsx}',
  'packages/ui/**/*.{ts,tsx}',
];

const eslintConfig = defineConfig([
  ...tseslint.configs.recommended,
  {
    files: APP_SOURCE_FILES,
    extends: [tseslint.configs.strictTypeChecked],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    files: APP_SOURCE_FILES,
    ignores: ['apps/*/src/services/**', 'apps/*/src/**/*.spec.ts'],
    plugins: { security },
    rules: {
      ...security.configs.recommended.rules,
      'security/detect-object-injection': 'off',
    },
  },
  {
    files: APP_SOURCE_FILES,
    ...eslintReact.configs['recommended-type-checked'],
  },
  {
    files: APP_SOURCE_FILES,
    ...reactYouMightNotNeedAnEffect.configs.recommended,
  },
  {
    files: ['apps/*/src/**/*.tsx', 'packages/ui/**/*.tsx'],
    ...jsxA11y.flatConfigs.recommended,
  },
  {
    files: APP_SOURCE_FILES,
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
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: '@mui/icons-material',
              message:
                'Use direct path imports, e.g. @mui/icons-material/Check — the root import pulls the entire icon pack into the bundle.',
            },
          ],
        },
      ],
    },
  },
  {
    files: APP_SOURCE_FILES,
    ignores: ['apps/*/src/app/storage.ts'],
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
    files: ['apps/*/src/app/storage.spec.ts'],
    rules: { 'no-restricted-syntax': 'off' },
  },
  {
    files: ['apps/*/src/i18n/locales/*.ts'],
    rules: { 'check-file/filename-naming-convention': 'off' },
  },
  {
    files: ['apps/*/src/main.tsx'],
    rules: { 'check-file/filename-naming-convention': 'off' },
  },
  {
    // Package entry points are the package's public API surface — re-export
    // barrels are the intended pattern there, unlike inside app source.
    files: ['packages/ui/**/index.ts'],
    rules: { 'no-barrel-files/no-barrel-files': 'off' },
  },
  globalIgnores([
    '**/dist/**',
    '**/build/**',
    '**/.stryker-tmp/**',
    '**/coverage/**',
    // Generated MSW worker — not hand-written source.
    'apps/*/public/**',
  ]),
]);

export default eslintConfig;
