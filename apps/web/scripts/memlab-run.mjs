import { mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import memlabApi from '@memlab/api';
import { resolvePlaywrightChromium } from './playwright-chromium.mjs';

const WEB_ROOT = fileURLToPath(new URL('..', import.meta.url));

async function main() {
  const workDir = path.join(WEB_ROOT, '.memlab');
  mkdirSync(workDir, { recursive: true });

  const scenario = (await import('./memlab-portfolio.cjs')).default;
  const chromiumBinary = resolvePlaywrightChromium();

  const { leaks } = await memlabApi.run({
    scenario,
    workDir,
    ...(chromiumBinary ? { chromiumBinary } : {}),
  });

  console.log(`MemLab found ${leaks.length} leak cluster(s).`);
  if (leaks.length > 0) {
    console.log('Inspect retainer traces under .memlab/ for details.');
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
