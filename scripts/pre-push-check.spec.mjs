// Tests for scripts/pre-push-check.mjs — run with
// `node --test scripts/pre-push-check.spec.mjs`.
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import { chunkFiles, MAX_COMMAND_CHARS } from './chunk-files.mjs';
import { classifyFile, planFileChecks, REPO_GATES } from './pre-push-check.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const toolOf = (job) => path.basename(job.argv[1]);

test('classifyFile routes each file kind to the right tools', () => {
  assert.deepEqual(
    [...classifyFile('apps/job-tracker/src/app/foo.ts')].toSorted(),
    ['biome', 'oxlint', 'prettier', 'secretlint'],
  );
  assert.deepEqual([...classifyFile('docs/guide.md')].toSorted(), [
    'prettier',
    'secretlint',
  ]);
  assert.deepEqual(
    [...classifyFile('apps/job-tracker/src/styles.css')].toSorted(),
    ['biome', 'prettier'],
  );
  assert.deepEqual(
    [...classifyFile('apps/job-tracker/.env.local')],
    ['secretlint'],
  );
});

test('falsification: unknown extensions produce no file checks', () => {
  assert.equal(classifyFile('assets/logo.png').size, 0);
  assert.equal(classifyFile('content/projects/x.mdx').size > 0, true);
  assert.deepEqual(planFileChecks(['assets/logo.png']), []);
});

test('planFileChecks emits check-mode commands, never autofix', () => {
  const jobs = planFileChecks([
    'apps/job-tracker/src/app/foo.ts',
    'apps/job-tracker/src/app/bar.tsx',
    'docs/guide.md',
  ]);
  const tools = new Set(jobs.map(toolOf));
  assert.ok(tools.has('prettier.cjs'));
  assert.ok(tools.has('oxlint'));
  assert.ok(tools.has('biome'));
  assert.ok(tools.has('secretlint.js'));
  for (const job of jobs) {
    assert.ok(!job.argv.includes('--write'), `${job.name} must not write`);
    assert.ok(!job.argv.includes('--fix'), `${job.name} must not fix`);
    assert.ok(job.argv[0].endsWith('node') || job.argv[0].includes('node'));
  }
});

test('chunkFiles splits lists at the command-line budget', () => {
  const files = Array.from(
    { length: 200 },
    (_, i) => `apps/job-tracker/src/feature-${i}/component-name.ts`,
  );
  const chunks = chunkFiles(files);
  assert.ok(chunks.length > 1);
  for (const chunk of chunks) {
    assert.ok(chunk.join(' ').length <= MAX_COMMAND_CHARS);
  }
  assert.deepEqual(chunkFiles([]), []);
});

test('REPO_GATES have unique names and every path exists', () => {
  const names = REPO_GATES.map((g) => g.name);
  assert.equal(new Set(names).size, names.length);
  for (const gate of REPO_GATES) {
    for (const arg of gate.argv.slice(1)) {
      const isPath =
        path.isAbsolute(arg) || /^(scripts|apps|packages)[/\\]/.test(arg);
      if (isPath) {
        assert.ok(
          existsSync(path.isAbsolute(arg) ? arg : path.join(ROOT, arg)),
          `${gate.name}: missing ${arg}`,
        );
      }
    }
  }
});

test('falsification: no repo gate builds or runs the heavy checks', () => {
  const joined = REPO_GATES.map((g) => g.argv.join(' ')).join('\n');
  for (const banned of ['vite', 'build', 'knip', 'eslint', 'jest']) {
    assert.ok(
      !joined.includes(banned),
      `pre-push gate must not invoke ${banned} (deferred to CI)`,
    );
  }
});
