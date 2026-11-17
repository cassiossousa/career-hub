import { existsSync, mkdirSync, readdirSync } from 'node:fs';
import { homedir } from 'node:os';
import path from 'node:path';
import memlabApi from '@memlab/api';

function resolvePlaywrightChromium() {
  const browsersDir = path.join(homedir(), 'AppData', 'Local', 'ms-playwright');
  if (!existsSync(browsersDir)) return undefined;

  const candidates = readdirSync(browsersDir)
    .filter((entry) => entry.startsWith('chromium-'))
    .toSorted()
    .toReversed();

  for (const dir of candidates) {
    for (const sub of ['chrome-win', 'chrome-win64']) {
      const binary = path.join(browsersDir, dir, sub, 'chrome.exe');
      if (existsSync(binary)) return binary;
    }
  }
  return undefined;
}

async function main() {
  const workDir = path.resolve('.memlab');
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
