import { execFileSync } from 'node:child_process';
import { readdirSync } from 'node:fs';
import path from 'node:path';

// Git on Windows/macOS is case-insensitive by default, so a committed
// `provider.tsx` can coexist with imports of `./Provider` locally while
// breaking on case-sensitive Linux CI. This check fails when the tracked
// filename's casing differs from what is actually on disk.

const tracked = execFileSync('git', ['ls-files'], { encoding: 'utf8' })
  .split(/\r?\n/)
  .filter(Boolean);

const mismatches = [];

for (const file of tracked) {
  const dir = path.dirname(file);
  const base = path.basename(file);
  let entries;
  try {
    entries = readdirSync(dir);
  } catch {
    continue; // deleted file — git status handles that
  }
  const onDisk = entries.find(
    (entry) => entry.toLowerCase() === base.toLowerCase(),
  );
  if (onDisk && onDisk !== base) {
    mismatches.push(`${file} (on disk: ${path.join(dir, onDisk)})`);
  }
}

if (mismatches.length > 0) {
  console.error(
    'Case-sensitivity mismatch between git index and working tree:\n' +
      mismatches.map((m) => `  ${m}`).join('\n') +
      '\n\nFix with: git mv <old> <new> so the tracked casing matches disk.',
  );
  process.exit(1);
}

console.log(`Case check OK (${tracked.length} tracked files).`);
