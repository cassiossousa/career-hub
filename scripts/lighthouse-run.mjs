import { execSync } from 'node:child_process';
import { resolvePlaywrightChromium } from './playwright-chromium.mjs';

function run(command, env) {
  execSync(command, { stdio: 'inherit', shell: true, env });
}

const chromePath = resolvePlaywrightChromium();
const env = { ...process.env };
if (chromePath) env.CHROME_PATH = chromePath;

run('npm run build', env);
run('npx lhci autorun', env);
