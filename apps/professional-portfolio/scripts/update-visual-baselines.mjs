import { execFileSync, spawn } from 'node:child_process';
import { copyFileSync, mkdtempSync, readdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

// Regenerates visual-regression baselines for BOTH canonical environments:
//   1. host platform (win32 locally) via `playwright test visual --update-snapshots`
//   2. linux inside mcr.microsoft.com/playwright:v1.65.1-noble — the same image
//      CI's e2e job runs in (baselines are only valid in their environment).
// See AGENTS.md §3 for the baseline rules.
//
// Usage: node apps/professional-portfolio/scripts/update-visual-baselines.mjs [--local-only]

const scriptDir = fileURLToPath(new URL('.', import.meta.url));
const APP_DIR = resolve(scriptDir, '..');
const ROOT = resolve(APP_DIR, '..', '..');
const SNAPSHOT_DIR = join(APP_DIR, 'e2e', 'visual.spec.ts-snapshots');
const PLAYWRIGHT_IMAGE = 'mcr.microsoft.com/playwright:v1.65.1-noble';
const CONTAINER_NAME = `career-hub-visual-baselines-${process.pid}`;
const LOCAL_ONLY = process.argv.includes('--local-only');

const EXCLUDES = [
  'node_modules',
  '.git',
  'dist',
  '.memlab',
  '.lighthouseci',
  'test-results',
  'playwright-report',
  '.stryker-tmp',
  'coverage',
];

function run(cmd, args, options = {}) {
  console.log(`\n$ ${cmd} ${args.join(' ')}`);
  execFileSync(cmd, args, {
    cwd: ROOT,
    stdio: 'inherit',
    shell: process.platform === 'win32',
    ...options,
  });
}

function docker(args, options = {}) {
  return execFileSync('docker', args, {
    cwd: ROOT,
    encoding: 'utf8',
    ...options,
  });
}

// Streams `tar -cf - <repo>` into `docker cp - <container>:/src`.
function copyRepoIntoContainer(container) {
  return new Promise((resolvePromise, rejectPromise) => {
    docker(['exec', container, 'mkdir', '-p', '/src']);
    const tarArgs = [
      '-cf',
      '-',
      ...EXCLUDES.flatMap((e) => ['--exclude', e]),
      '.',
    ];
    const tar = spawn('tar', tarArgs, { cwd: ROOT });
    const cp = spawn('docker', ['cp', '-', `${container}:/src`], {
      cwd: ROOT,
    });
    tar.stdout.pipe(cp.stdin);
    tar.stderr.pipe(process.stderr);
    cp.stderr.pipe(process.stderr);
    cp.on('close', (code) => {
      tar.kill();
      if (code === 0) {
        resolvePromise();
      } else {
        rejectPromise(new Error(`docker cp exited ${code}`));
      }
    });
    tar.on('error', rejectPromise);
    cp.on('error', rejectPromise);
  });
}

async function regenerateLinuxBaselines() {
  console.log('\n=== Linux baselines (Playwright Docker image) ===');
  docker(['rm', '-f', CONTAINER_NAME], { stdio: 'ignore' });
  try {
    docker([
      'run',
      '-d',
      '--name',
      CONTAINER_NAME,
      PLAYWRIGHT_IMAGE,
      'tail',
      '-f',
      '/dev/null',
    ]);
    await copyRepoIntoContainer(CONTAINER_NAME);
    docker([
      'exec',
      CONTAINER_NAME,
      'bash',
      '-lc',
      'cd /src && npm ci --ignore-scripts && npx playwright test --config apps/professional-portfolio/playwright.config.ts visual --update-snapshots',
    ]);

    // Pull only the linux-suffixed snapshots back — win32 files inside the
    // container are the committed copies and must not be overwritten.
    const tmp = mkdtempSync(join(tmpdir(), 'visual-baselines-'));
    try {
      const remoteDir =
        '/src/apps/professional-portfolio/e2e/visual.spec.ts-snapshots';
      docker(['cp', `${CONTAINER_NAME}:${remoteDir}`, tmp]);
      const copied = readdirSync(tmp)
        .filter((f) => f.endsWith('-linux.png'))
        .map((f) => join(tmp, f));
      for (const file of copied) {
        copyFileSync(file, join(SNAPSHOT_DIR, file.split(/[\\/]/).pop()));
        console.log(`updated ${file.split(/[\\/]/).pop()}`);
      }
      if (copied.length === 0) {
        throw new Error('No *-linux.png snapshots found in container output');
      }
    } finally {
      rmSync(tmp, { recursive: true, force: true });
    }
  } finally {
    docker(['rm', '-f', CONTAINER_NAME], { stdio: 'ignore' });
  }
}

async function main() {
  console.log('=== Host-platform baselines ===');
  run('npx', [
    'playwright',
    'test',
    '--config',
    'apps/professional-portfolio/playwright.config.ts',
    'visual',
    '--update-snapshots',
  ]);

  if (!LOCAL_ONLY) {
    await regenerateLinuxBaselines();
  } else {
    console.log('\n(--local-only: skipped linux baselines)');
  }

  console.log('\nDone. Review the diff images, then commit the baselines.');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
