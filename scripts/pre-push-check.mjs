#!/usr/bin/env node
// Pre-push hook orchestrator — must finish in <10s on Windows.
//
// Two tiers, both deterministic (filesystem/git inputs only):
//  1. File-scoped checks on files changed vs the upstream merge-base —
//     check-mode only (no --fix/--write; lint-staged already autofixed
//     them at commit time).
//  2. Repo-wide invariant gates spawned in parallel, bypassing `npm run`
//     startup overhead. Everything expensive (typed ESLint, knip,
//     depcruise arch, Jest, builds, npm audit, full-repo prettier/oxlint)
//     stays in `verify:all`/CI, which is authoritative on every push.
//
// All tool bins are Node-launchable JS entries, so we spawn
// `node <bin>` directly — no .cmd/shell quoting issues on Windows.

import { execFileSync, spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { chunkFiles } from './chunk-files.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const NODE = process.execPath;
const nm = (...parts) => path.join(ROOT, 'node_modules', ...parts);
const script = (...parts) => path.join(ROOT, ...parts);

// Mirrors the glob groups in lint-staged.config.mjs, in check mode.
const CODE_EXTS = new Set(['js', 'jsx', 'ts', 'tsx', 'mjs', 'cjs']);
const STYLE_EXTS = new Set(['css']);
const DOC_EXTS = new Set(['json', 'jsonc', 'html', 'md', 'mdx', 'yml', 'yaml']);

const FILE_TOOLS = {
  prettier: {
    bin: nm('prettier', 'bin', 'prettier.cjs'),
    checkArgs: ['--check'],
  },
  oxlint: {
    bin: nm('oxlint', 'bin', 'oxlint'),
    checkArgs: ['--deny-warnings', '-D', 'correctness', '-D', 'suspicious'],
  },
  biome: {
    bin: nm('@biomejs', 'biome', 'bin', 'biome'),
    checkArgs: ['check'],
  },
  secretlint: {
    bin: nm('secretlint', 'bin', 'secretlint.js'),
    checkArgs: [],
  },
};

function extOf(file) {
  const base = path.posix.basename(file.replaceAll('\\', '/'));
  const dot = base.lastIndexOf('.');
  return dot > 0 ? base.slice(dot + 1).toLowerCase() : '';
}

export function classifyFile(file) {
  const base = path.posix.basename(file.replaceAll('\\', '/'));
  if (base.includes('.env')) return new Set(['secretlint']);
  const ext = extOf(file);
  if (CODE_EXTS.has(ext)) {
    return new Set(['prettier', 'oxlint', 'biome', 'secretlint']);
  }
  if (STYLE_EXTS.has(ext)) return new Set(['prettier', 'biome']);
  if (DOC_EXTS.has(ext)) return new Set(['prettier', 'secretlint']);
  return new Set();
}

export function planFileChecks(files) {
  const byTool = new Map();
  for (const file of files) {
    for (const tool of classifyFile(file)) {
      const list = byTool.get(tool) ?? [];
      list.push(file);
      byTool.set(tool, list);
    }
  }
  const jobs = [];
  for (const [tool, toolFiles] of byTool) {
    const { bin, checkArgs } = FILE_TOOLS[tool];
    for (const chunk of chunkFiles(toolFiles)) {
      jobs.push({
        name: `${tool} (${chunk.length} file${chunk.length === 1 ? '' : 's'})`,
        argv: [NODE, bin, ...checkArgs, ...chunk],
      });
    }
  }
  return jobs;
}

// Repo-wide gates — all measured <5s each on Windows; run in parallel.
// Deliberately excludes anything >~5s or anything that builds.
export const REPO_GATES = [
  {
    name: 'types (tsc -b)',
    argv: [NODE, nm('typescript', 'bin', 'tsc'), '-b'],
  },
  {
    name: 'case-sensitivity',
    argv: [NODE, script('scripts', 'check-case-sensitivity.mjs')],
  },
  {
    name: 'env-vars',
    argv: [NODE, script('scripts', 'check-env-vars.mjs')],
  },
  {
    name: 'api-mocks',
    argv: [
      NODE,
      script('apps', 'job-tracker', 'scripts', 'check-api-mocks.mjs'),
    ],
  },
  {
    name: 'mock-contract',
    argv: [
      NODE,
      script('apps', 'job-tracker', 'scripts', 'check-mock-contract.mjs'),
    ],
  },
  {
    name: 'content',
    argv: [NODE, script('scripts', 'check-content.mjs')],
  },
  {
    name: 'vocab',
    argv: [NODE, script('scripts', 'check-vocab.mjs')],
  },
  {
    name: 'clones (jscpd)',
    argv: [
      NODE,
      nm('jscpd', 'run-jscpd.js'),
      'apps/professional-portfolio/src',
      'apps/professional-portfolio/e2e',
      'apps/professional-portfolio/scripts',
      'apps/job-tracker/src',
      'apps/job-tracker/e2e',
      'packages/ui',
      'scripts',
      '--min-lines',
      '5',
      '--min-tokens',
      '40',
      '--ignore',
      '**/services/api/generated/**',
      '--reporters',
      'console',
      '--exit-code',
      '1',
    ],
  },
  {
    name: 'bloat (depcruise)',
    argv: [
      NODE,
      script(
        'apps',
        'professional-portfolio',
        'scripts',
        'audit-react-bloat.mjs',
      ),
    ],
  },
];

const JOB_TIMEOUT_MS = 120_000;

function git(args) {
  return execFileSync('git', args, {
    cwd: ROOT,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'ignore'],
  }).trim();
}

export function changedFiles() {
  let base;
  try {
    const upstream = git(['rev-parse', '--abbrev-ref', '@{upstream}']);
    base = git(['merge-base', 'HEAD', upstream]);
  } catch {
    try {
      base = git(['merge-base', 'HEAD', 'origin/main']);
    } catch {
      return [];
    }
  }
  if (!base) return [];
  const out = git(['diff', '--name-only', base, 'HEAD']);
  return out
    .split('\n')
    .map((f) => f.trim())
    .filter((f) => f && existsSync(path.join(ROOT, f)));
}

function runJob(job) {
  return new Promise((resolve) => {
    const start = performance.now();
    const child = spawn(job.argv[0], job.argv.slice(1), {
      cwd: ROOT,
      windowsHide: true,
    });
    let out = '';
    child.stdout.on('data', (d) => {
      out += d;
    });
    child.stderr.on('data', (d) => {
      out += d;
    });
    const timer = setTimeout(() => child.kill(), JOB_TIMEOUT_MS);
    const done = (code) => {
      clearTimeout(timer);
      resolve({
        job,
        code,
        ms: Math.round(performance.now() - start),
        out: out.slice(-4000),
      });
    };
    child.on('error', () => done(1));
    child.on('close', (code) => done(code ?? 1));
  });
}

async function main() {
  const files = changedFiles();
  const jobs = [...REPO_GATES, ...planFileChecks(files)];
  console.log(
    `pre-push: ${files.length} changed file(s), ${jobs.length} check(s) ` +
      `(heavy gates deferred to CI verify:all)`,
  );
  const results = await Promise.all(jobs.map(runJob));
  results.sort((a, b) => a.job.name.localeCompare(b.job.name));
  let failed = 0;
  for (const r of results) {
    if (r.code === 0) {
      console.log(`ok    ${r.job.name} (${r.ms}ms)`);
    } else {
      failed += 1;
      console.log(`FAIL  ${r.job.name} (${r.ms}ms)`);
      const tail = r.out.trim().split('\n').slice(-15).join('\n');
      if (tail) console.log(tail);
    }
  }
  if (failed > 0) {
    console.log(`${failed} check(s) failed — fix before pushing`);
    process.exitCode = 1;
  } else {
    console.log('all pre-push checks passed');
  }
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href
) {
  await main();
}
