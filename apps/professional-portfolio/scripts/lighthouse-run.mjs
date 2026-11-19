import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { resolvePlaywrightChromium } from './playwright-chromium.mjs';

const WEB_ROOT = fileURLToPath(new URL('..', import.meta.url));

function run(command, env) {
  execSync(command, { stdio: 'inherit', shell: true, env, cwd: WEB_ROOT });
}

const chromePath = resolvePlaywrightChromium();
const env = { ...process.env };
if (chromePath) env.CHROME_PATH = chromePath;

if (!process.argv.includes('--skip-build')) {
  run('npm run build', env);
}
run('npx lhci autorun', env);
