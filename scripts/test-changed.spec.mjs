// Tests for scripts/test-changed.mjs — run with `node --test scripts/test-changed.spec.mjs`.
import assert from 'node:assert/strict';
import test from 'node:test';

import { FULL_SUITE_FILE_THRESHOLD, planRuns } from './test-changed.mjs';

test('buckets changed files into their Jest workspace', () => {
  const { runs, unowned } = planRuns([
    'apps/job-tracker/src/app/env.ts',
    'apps/job-tracker/src/app/env.spec.ts',
    'packages/ui/components/Button.tsx',
  ]);
  assert.equal(unowned.length, 0);
  assert.equal(runs.length, 2);
  const jt = runs.find((r) => r.config.includes('job-tracker'));
  const ui = runs.find((r) => r.config.includes('packages'));
  assert.equal(jt.targets.length, 2);
  assert.equal(ui.targets.length, 1);
  assert.ok(
    jt.targets.every((t) =>
      t.replaceAll('\\', '/').includes('apps/job-tracker'),
    ),
  );
  assert.equal(jt.fullSuite, false);
});

test('files outside Jest workspaces are reported, not run', () => {
  const { runs, unowned } = planRuns([
    'docs/tooling-effectiveness.md',
    'scripts/test-changed.mjs',
    'content/projects/x.mdx',
  ]);
  assert.equal(runs.length, 0);
  assert.deepEqual(
    unowned.toSorted(),
    [
      'content/projects/x.mdx',
      'docs/tooling-effectiveness.md',
      'scripts/test-changed.mjs',
    ].toSorted(),
  );
});

test('mixed owned and unowned files still produce runs', () => {
  const { runs, unowned } = planRuns([
    'AGENTS.md',
    'apps/professional-portfolio/package.json',
  ]);
  assert.equal(runs.length, 1);
  assert.deepEqual(unowned, ['AGENTS.md']);
});

test('broad changes escalate to the workspace full suite', () => {
  const files = Array.from(
    { length: FULL_SUITE_FILE_THRESHOLD + 1 },
    (_, i) => `apps/job-tracker/src/f${i}.ts`,
  );
  const { runs } = planRuns(files);
  assert.equal(runs.length, 1);
  assert.equal(runs[0].fullSuite, true);
});

test('runs are sorted by config path for deterministic output', () => {
  const { runs } = planRuns([
    'packages/ui/a.ts',
    'apps/job-tracker/b.ts',
    'apps/professional-portfolio/c.ts',
  ]);
  const configs = runs.map((r) => r.config);
  assert.deepEqual(configs, configs.toSorted());
});
