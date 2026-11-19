// Simulates Vercel's workspace-scoped install + build for an app in a clean
// temp copy of the repo (no node_modules, no dist, no .git). Catches missing
// workspace deps like @career-hub/ui before they hit a deploy.
// Usage: node scripts/check-workspace-install.mjs [app-name]
import { execFileSync } from 'node:child_process';
import { cpSync, existsSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const APP = process.argv[2] ?? 'job-tracker';
const APP_DIR = path.join(ROOT, 'apps', APP);

if (!existsSync(APP_DIR)) {
  console.error(`Unknown app workspace: ${APP}`);
  process.exit(1);
}

const tmp = mkdtempSync(path.join(tmpdir(), 'career-hub-vercel-'));
console.log(`Clean-copy install check for "${APP}" in ${tmp}`);

try {
  // Mirror what Vercel sees: manifests, lockfile, and the workspace sources.
  cpSync(path.join(ROOT, 'package.json'), path.join(tmp, 'package.json'));
  cpSync(
    path.join(ROOT, 'package-lock.json'),
    path.join(tmp, 'package-lock.json'),
  );
  // The lockfile references every workspace, so mirror all of apps/ —
  // Vercel checks out the full repo too.
  cpSync(path.join(ROOT, 'apps'), path.join(tmp, 'apps'), {
    recursive: true,
    filter: (src) =>
      !src.includes('node_modules') &&
      !src.includes(`${path.sep}dist${path.sep}`) &&
      !src.includes(`${path.sep}.vercel${path.sep}`),
  });
  cpSync(path.join(ROOT, 'packages'), path.join(tmp, 'packages'), {
    recursive: true,
    filter: (src) =>
      !src.includes('node_modules') &&
      !src.includes(`${path.sep}dist${path.sep}`),
  });
  // professional-portfolio's vite config reads MDX content from the repo-root
  // content/ dir at build time — Vercel checks out the full repo, so mirror it.
  const contentDir = path.join(ROOT, 'content');
  if (existsSync(contentDir)) {
    cpSync(contentDir, path.join(tmp, 'content'), { recursive: true });
  }

  const npm = (args) =>
    execFileSync('npm', args, { cwd: tmp, stdio: 'inherit', shell: true });

  npm([
    'install',
    '--workspace',
    APP,
    '--include-workspace-root=false',
    '--no-audit',
    '--no-fund',
  ]);
  npm(['run', 'build', '--workspace', APP]);
  console.log(`Workspace-scoped install + build OK for ${APP}`);
} finally {
  rmSync(tmp, { recursive: true, force: true });
}
