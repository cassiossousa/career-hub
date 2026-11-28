import { chunkFiles } from './scripts/chunk-files.mjs';

const codeFiles = ['*.{js,jsx,ts,tsx,mjs,cjs}'];
const styleFiles = ['*.css'];
const docFiles = ['*.{json,jsonc,html,md,mdx,yml,yaml}'];

export default {
  [codeFiles[0]]: (files) => [
    ...chunkFiles(files).map(
      (chunk) =>
        `oxlint --fix --deny-warnings -D correctness -D suspicious ${chunk.join(' ')}`,
    ),
    // Typed ESLint (strictTypeChecked) costs ~30s per invocation — it stays in
    // `npm run lint` / CI. Pre-commit keeps only fast tools (industry-standard
    // hooks-autofix, CI-enforces model).
    ...chunkFiles(files).map(
      (chunk) => `biome check --write ${chunk.join(' ')}`,
    ),
    ...chunkFiles(files).map((chunk) => `prettier --write ${chunk.join(' ')}`),
    ...chunkFiles(files).map((chunk) => `secretlint ${chunk.join(' ')}`),
  ],
  [styleFiles[0]]: (files) => [
    ...chunkFiles(files).map(
      (chunk) => `biome check --write ${chunk.join(' ')}`,
    ),
    ...chunkFiles(files).map((chunk) => `prettier --write ${chunk.join(' ')}`),
  ],
  [docFiles[0]]: (files) => [
    ...chunkFiles(files).map((chunk) => `prettier --write ${chunk.join(' ')}`),
    ...chunkFiles(files).map((chunk) => `secretlint ${chunk.join(' ')}`),
  ],
  '*.env*': (files) =>
    chunkFiles(files).map((chunk) => `secretlint ${chunk.join(' ')}`),
};
