import eslintReact from '@eslint-react/eslint-plugin';
import { defineConfig, globalIgnores } from 'eslint/config';
import checkFile from 'eslint-plugin-check-file';
import jest from 'eslint-plugin-jest';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import newWithError from 'eslint-plugin-new-with-error';
import noBarrelFiles from 'eslint-plugin-no-barrel-files';
import noRelativeImportPaths from 'eslint-plugin-no-relative-import-paths';
import playwright from 'eslint-plugin-playwright';
import reactHooks from 'eslint-plugin-react-hooks';
import reactYouMightNotNeedAnEffect from 'eslint-plugin-react-you-might-not-need-an-effect';
import regexp from 'eslint-plugin-regexp';
import security from 'eslint-plugin-security';
import sonarjs from 'eslint-plugin-sonarjs';
import tseslint from 'typescript-eslint';

const STORAGE_MESSAGE =
  'Use storageGetItem/storageSetItem from app/storage — raw Web Storage throws when disabled.';

const BANNED_FIELD_WRAPPER_SELECTOR = {
  selector:
    "JSXOpeningElement[name.name='RequiredField'], JSXOpeningElement[name.name='NullableField']",
  message:
    'RequiredField/NullableField are banned — use EntryField (required prop, emptyToNull for nullable values) or BoundFields req/nul/num spec flags.',
};

const APP_SOURCE_FILES = [
  'apps/*/src/**/*.{ts,tsx}',
  'packages/ui/**/*.{ts,tsx}',
];

const eslintConfig = defineConfig([
  ...tseslint.configs.recommended,
  {
    // Register every plugin globally so `<plugin>/*` eslint-disable
    // directives resolve in any file — including zones where a plugin's
    // rules are intentionally scoped (e2e, specs, test helpers). Without
    // this, a disable comment outside a plugin's files scope fails with
    // "Definition for rule ... was not found".
    plugins: {
      '@eslint-react': eslintReact,
      'react-you-might-not-need-an-effect': reactYouMightNotNeedAnEffect,
      'jsx-a11y': jsxA11y,
      'react-hooks': reactHooks,
      sonarjs,
      'check-file': checkFile,
      'no-barrel-files': noBarrelFiles,
      jest,
      playwright,
      regexp,
      'new-with-error': newWithError,
      'no-relative-import-paths': noRelativeImportPaths,
      security,
    },
  },
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
    ignores: [
      'apps/*/src/services/**',
      'apps/*/src/**/*.spec.ts',
      'apps/*/src/test/**',
    ],
    rules: {
      ...security.configs.recommended.rules,
      'security/detect-object-injection': 'off',
    },
  },
  {
    files: APP_SOURCE_FILES,
    ...eslintReact.configs['recommended-type-checked'],
    // Plugin is registered globally above — redeclaring it here is a
    // "Cannot redefine plugin" config error.
    plugins: {},
  },
  {
    files: APP_SOURCE_FILES,
    ...reactYouMightNotNeedAnEffect.configs.recommended,
    plugins: {},
  },
  {
    files: ['apps/*/src/**/*.tsx', 'packages/ui/**/*.tsx'],
    ...jsxA11y.flatConfigs.recommended,
    plugins: {},
  },
  {
    files: APP_SOURCE_FILES,
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
    files: ['apps/*/e2e/**/*.ts', 'apps/*/playwright.config.ts'],
    ...playwright.configs['flat/recommended'],
    plugins: {},
  },
  {
    files: [
      'apps/*/src/**/*.spec.ts',
      'apps/*/src/**/*.spec.tsx',
      'apps/*/src/test/**/*.ts',
    ],
    ...jest.configs['flat/recommended'],
    plugins: {},
  },
  {
    files: ['apps/*/src/**/*.spec.ts', 'apps/*/src/**/*.spec.tsx'],
    rules: {
      'jest/no-disabled-tests': 'error',
      'jest/no-focused-tests': 'error',
      'jest/expect-expect': [
        'error',
        {
          assertFunctionNames: [
            'expect',
            'expectContrast',
            'expectChipLabelContrast',
            'expectNotFoundError',
            'expectStandardEntry',
            'expectErrorWithRetry',
            'expectJobTitlesRendered',
            'expectApiErrorCode',
            'waitForQuerySuccess',
            'saveAndExpectSuccess',
            'renderJobListLoaded',
            'fc.assert',
          ],
        },
      ],
      'jest/no-conditional-expect': 'error',
      'jest/valid-expect': 'error',
    },
  },
  {
    files: APP_SOURCE_FILES,
    rules: {
      ...regexp.configs['flat/recommended'].rules,
      'new-with-error/new-with-error': 'error',
      'no-relative-import-paths/no-relative-import-paths': [
        'error',
        { allowSameFolder: true, allowedDepth: 2, prefix: '@' },
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
        BANNED_FIELD_WRAPPER_SELECTOR,
      ],
    },
  },
  {
    // Specs and e2e must not re-declare production parsing/business-rule
    // patterns — import the constant from source instead (AGENTS.md §2).
    files: ['**/*.spec.ts', '**/*.spec.tsx', 'apps/*/e2e/**/*.ts'],
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector: 'VariableDeclarator > Literal[regex]',
          message:
            "Don't re-declare parsing/business-rule patterns in tests — import the constant from source.",
        },
        {
          selector: 'VariableDeclarator > NewExpression[callee.name="RegExp"]',
          message:
            "Don't re-declare parsing/business-rule patterns in tests — import the constant from source.",
        },
        BANNED_FIELD_WRAPPER_SELECTOR,
      ],
    },
  },
  {
    // src specs additionally keep the Web Storage ban. no-restricted-syntax
    // is replaced, not merged, for files matched by multiple blocks, so the
    // selectors are re-declared here alongside the pattern ban.
    files: ['apps/*/src/**/*.spec.ts', 'apps/*/src/**/*.spec.tsx'],
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
        {
          selector: 'VariableDeclarator > Literal[regex]',
          message:
            "Don't re-declare parsing/business-rule patterns in tests — import the constant from source.",
        },
        {
          selector: 'VariableDeclarator > NewExpression[callee.name="RegExp"]',
          message:
            "Don't re-declare parsing/business-rule patterns in tests — import the constant from source.",
        },
        BANNED_FIELD_WRAPPER_SELECTOR,
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
  {
    // .cjs files are CommonJS by definition — require() is the module system,
    // not an import-style violation.
    files: ['**/*.cjs'],
    rules: { '@typescript-eslint/no-require-imports': 'off' },
  },
  globalIgnores([
    '**/dist/**',
    '**/build/**',
    '**/.vercel/**',
    '**/.stryker-tmp/**',
    '**/coverage/**',
    // Generated MSW worker — not hand-written source.
    'apps/*/public/**',
    // Generated from the backend OpenAPI spec — do not hand-edit.
    'apps/job-tracker/src/services/api/generated/**',
  ]),
]);

export default eslintConfig;
