// Chunk staged file lists so spawned commands stay under the Windows
// command-line length limit (~8191 chars via cmd.exe).
const MAX_COMMAND_CHARS = 5000;

function chunkFiles(files) {
  const chunks = [];
  let current = [];
  let length = 0;
  for (const file of files) {
    if (current.length > 0 && length + file.length + 1 > MAX_COMMAND_CHARS) {
      chunks.push(current);
      current = [];
      length = 0;
    }
    current.push(file);
    length += file.length + 1;
  }
  if (current.length > 0) chunks.push(current);
  return chunks;
}

const codeFiles = ['*.{js,jsx,ts,tsx,mjs,cjs}'];
const styleFiles = ['*.css'];
const docFiles = ['*.{json,jsonc,html,md,mdx,yml,yaml}'];

// Keep in sync with .oxlintrc.json `ignorePatterns` and biome.json
// `files.includes`: both tools exit non-zero when every input file is
// ignored, which breaks commits that only touch excluded files (e.g. the
// generated API contract). Prettier is unaffected and still sees all files.
const OXLINT_IGNORED_PATTERNS = [
  /(^|\/)public\//,
  /(^|\/)services\/api\/generated\//,
];
const BIOME_IGNORED_PATTERNS = [
  /(^|\/)dist(\/|$)/,
  /(^|\/)mockServiceWorker\.js$/,
  /(^|\/)services\/api\/generated(\/|$)/,
];

const matchesAny = (file, patterns) =>
  patterns.some((pattern) => pattern.test(file));

export default {
  [codeFiles[0]]: (files) => {
    const oxlintFiles = files.filter(
      (file) => !matchesAny(file, OXLINT_IGNORED_PATTERNS),
    );
    const biomeFiles = files.filter(
      (file) => !matchesAny(file, BIOME_IGNORED_PATTERNS),
    );
    return [
      ...chunkFiles(oxlintFiles).map(
        (chunk) =>
          `oxlint --fix --deny-warnings -D correctness -D suspicious ${chunk.join(' ')}`,
      ),
      // Typed ESLint (strictTypeChecked) costs ~30s per invocation — it stays in
      // `npm run lint` / CI. Pre-commit keeps only fast tools (industry-standard
      // hooks-autofix, CI-enforces model).
      ...chunkFiles(biomeFiles).map(
        (chunk) => `biome check --write ${chunk.join(' ')}`,
      ),
      ...chunkFiles(files).map(
        (chunk) => `prettier --write ${chunk.join(' ')}`,
      ),
    ];
  },
  [styleFiles[0]]: (files) => {
    const biomeFiles = files.filter(
      (file) => !matchesAny(file, BIOME_IGNORED_PATTERNS),
    );
    return [
      ...chunkFiles(biomeFiles).map(
        (chunk) => `biome check --write ${chunk.join(' ')}`,
      ),
      ...chunkFiles(files).map(
        (chunk) => `prettier --write ${chunk.join(' ')}`,
      ),
    ];
  },
  [docFiles[0]]: (files) =>
    chunkFiles(files).map((chunk) => `prettier --write ${chunk.join(' ')}`),
};
