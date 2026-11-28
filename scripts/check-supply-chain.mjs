import { readFileSync } from 'node:fs';
import path from 'node:path';
import { ROOT } from './repo-root.mjs';

// On-demand supply-chain audit of package-lock.json: every resolved tarball
// must come from the npm registry over HTTPS with an integrity hash, and no
// git/file/http dependencies may appear. Packages with install scripts are
// listed for manual review (reported, not failed — several legit deps use
// them). NOT wired into verify:* — run manually or in a dedicated security
// job. Usage: node scripts/check-supply-chain.mjs [--lockfile <path>]

const lockfileArgIndex = process.argv.indexOf('--lockfile');
const LOCKFILE =
  lockfileArgIndex === -1
    ? path.join(ROOT, 'package-lock.json')
    : path.resolve(process.argv[lockfileArgIndex + 1] ?? '.');

const REGISTRY_PREFIX = 'https://registry.npmjs.org/';

function audit(lockfilePath) {
  const lock = JSON.parse(readFileSync(lockfilePath, 'utf8'));
  const packages = lock.packages ?? {};

  const violations = [];
  const installScripts = [];

  for (const [key, entry] of Object.entries(packages).toSorted(([a], [b]) =>
    a.localeCompare(b),
  )) {
    if (key === '') continue; // root project entry
    if (!key.includes('node_modules/')) continue; // workspace packages
    if (entry.link === true) continue; // workspace symlinks carry no tarball

    const name = key.replace(/^.*node_modules\//, '');

    if (entry.resolved === undefined) {
      violations.push(`${name}: no "resolved" URL (non-registry dependency?)`);
      continue;
    }
    if (!entry.resolved.startsWith(REGISTRY_PREFIX)) {
      violations.push(
        `${name}: resolved from non-registry URL ${entry.resolved}`,
      );
      continue;
    }
    if (typeof entry.integrity !== 'string' || entry.integrity === '') {
      violations.push(`${name}: registry tarball missing "integrity" hash`);
    }
    if (entry.hasInstallScript === true) {
      installScripts.push(name);
    }
  }

  return { violations, installScripts };
}

const { violations, installScripts } = audit(LOCKFILE);

for (const name of installScripts) {
  console.log(`install-script: ${name} (review manually)`);
}

if (violations.length > 0) {
  for (const violation of violations) {
    console.error(`Supply-chain check FAILED: ${violation}`);
  }
  console.error(
    `Supply-chain check failed with ${violations.length} issue(s).`,
  );
  process.exit(1);
}

console.log(
  `Supply-chain check OK: ${installScripts.length} install-script package(s) noted.`,
);
