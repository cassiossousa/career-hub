import { existsSync, readdirSync } from 'node:fs';
import { homedir } from 'node:os';
import path from 'node:path';

const SUBDIRS = {
  win32: ['chrome-win', 'chrome-win64'],
  linux: ['chrome-linux', 'chrome-linux64'],
  darwin: ['chrome-mac', 'chrome-mac-arm64', 'chrome-mac-x64'],
};

const BINARY_NAMES = {
  win32: 'chrome.exe',
  linux: 'chrome',
  darwin: 'Chromium.app/Contents/MacOS/Chromium',
};

function playwrightBrowsersDir() {
  if (process.platform === 'win32') {
    return path.join(homedir(), 'AppData', 'Local', 'ms-playwright');
  }
  return path.join(homedir(), '.cache', 'ms-playwright');
}

export function resolvePlaywrightChromium() {
  const browsersDir = playwrightBrowsersDir();
  if (!existsSync(browsersDir)) return undefined;

  const subdirs = SUBDIRS[process.platform] ?? SUBDIRS.linux;
  const binaryName = BINARY_NAMES[process.platform] ?? BINARY_NAMES.linux;

  const candidates = readdirSync(browsersDir)
    .filter((entry) => entry.startsWith('chromium-'))
    .toSorted()
    .toReversed();

  for (const dir of candidates) {
    for (const sub of subdirs) {
      const binary = path.join(browsersDir, dir, sub, binaryName);
      if (existsSync(binary)) return binary;
    }
  }
  return undefined;
}
