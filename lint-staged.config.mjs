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

export default {
  [codeFiles[0]]: (files) => [
    ...chunkFiles(files).map(
      (chunk) =>
        `oxlint --fix --deny-warnings -D correctness -D suspicious ${chunk.join(' ')}`,
    ),
    ...chunkFiles(files).map((chunk) => `eslint --fix ${chunk.join(' ')}`),
    ...chunkFiles(files).map(
      (chunk) => `biome check --write ${chunk.join(' ')}`,
    ),
    ...chunkFiles(files).map((chunk) => `prettier --write ${chunk.join(' ')}`),
  ],
  [styleFiles[0]]: (files) => [
    ...chunkFiles(files).map(
      (chunk) => `biome check --write ${chunk.join(' ')}`,
    ),
    ...chunkFiles(files).map((chunk) => `prettier --write ${chunk.join(' ')}`),
  ],
  [docFiles[0]]: (files) =>
    chunkFiles(files).map((chunk) => `prettier --write ${chunk.join(' ')}`),
};
