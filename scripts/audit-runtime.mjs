import { execSync, spawn } from 'node:child_process';

const PORT = 4173;
const BASE_URL = `http://localhost:${PORT}`;

function run(command) {
  execSync(command, { stdio: 'inherit', shell: true });
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
      '@portfolio/web',
      '--',
      '--port',
      String(PORT),
      '--strictPort',
    ],
    { stdio: 'ignore', shell: true },
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
    '=== [1/4] Architectural boundary checks (dependency-cruiser) ===',
  );
  run('npm run check:arch');

  console.log('=== [2/4] Architecture guardrail specs (Jest) ===');
  run('npx jest apps/web/src/architecture.spec.ts --runInBand');

  console.log(
    '=== [3/4] Browser smoke & accessibility checks (Playwright + Axe) ===',
  );
  run('npx playwright test');

  console.log('=== [4/5] Memory leak detection (MemLab, production build) ===');
  run('npm run build');
  await withPreviewServer(() => run('node scripts/memlab-run.mjs'));

  console.log('=== [5/5] Core Web Vitals budgets (Lighthouse CI) ===');
  run('node scripts/lighthouse-run.mjs');

  console.log('\nAll post-generation verification layers cleared.');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
