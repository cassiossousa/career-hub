// Chunk file lists so spawned commands stay under the Windows
// command-line length limit (~8191 chars via cmd.exe). Shared by
// lint-staged.config.mjs and scripts/pre-push-check.mjs.
export const MAX_COMMAND_CHARS = 5000;

export function chunkFiles(files) {
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
