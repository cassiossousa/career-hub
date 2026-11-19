import { execSync, spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const REPO_ROOT = fileURLToPath(new URL('../../..', import.meta.url));
const PORT = 4173;
const skipBuild = process.argv.includes('--skip-build');
const BASE_URL = `http://localhost:${PORT}`;

function run(command) {
  execSync(command, { stdio: 'inherit', shell: true, cwd: REPO_ROOT });
}

async function waitForServer(url, timeoutMs = 60_000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const res = await fetch(url);
      if (res.ok) return;
    } catch {
      // server not ready yet
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error(`Server at ${url} did not become ready in ${timeoutMs}ms`);
}

function killProcessTree(child) {
  if (process.platform === 'win32' && child.pid) {
    try {
      execSync(`taskkill /PID ${child.pid} /T /F`, { stdio: 'ignore' });
    } catch {
      // process already exited
    }
    return;
  }
  child.kill();
}

async function withPreviewServer(fn) {
  const server = spawn(
    'npm',
    [
      'run',
      'start',
      '--workspace',
      'professional-portfolio',
      '--',
      '--port',
      String(PORT),
      '--strictPort',
    ],
    { stdio: 'ignore', shell: true, cwd: REPO_ROOT },
  );

  try {
    await waitForServer(BASE_URL);
    fn();
  } finally {
    killProcessTree(server);
  }
}

async function main() {
  console.log(
    '=== [1/5] Architectural boundary checks (dependency-cruiser) ===',
  );
  run('npm run check:arch');

  console.log('=== [2/5] Architecture guardrail specs (Jest) ===');
  run(
    'npx jest --config apps/professional-portfolio/jest.config.cjs src/architecture.spec.ts --runInBand',
  );

  console.log(
    '=== [3/5] Browser smoke & accessibility checks (Playwright + Axe) ===',
  );
  run(
    'npx playwright test --config apps/professional-portfolio/playwright.config.ts',
  );

  console.log('=== [4/5] Memory leak detection (MemLab, production build) ===');
  // --skip-build reuses an existing dist/ (e.g. right after `npm run build` or
  // `verify:all`) instead of compiling a second time.
  if (skipBuild) {
    console.log('Skipping build (--skip-build); reusing existing dist/.');
  } else {
    run('npm run build');
  }
  await withPreviewServer(() =>
    run('node apps/professional-portfolio/scripts/memlab-run.mjs'),
  );

  console.log('=== [5/5] Core Web Vitals budgets (Lighthouse CI) ===');
  // dist/ was already built for the MemLab step — skip the duplicate build.
  run(
    'node apps/professional-portfolio/scripts/lighthouse-run.mjs --skip-build',
  );

  console.log('\nAll post-generation verification layers cleared.');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
