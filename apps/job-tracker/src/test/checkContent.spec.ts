import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import {
  REPO_ROOT,
  repoScript,
  runNodeScript,
  tempFixtureDir,
} from './scriptGate';

const SCRIPT = repoScript('check-content.mjs');

const I18N_SOURCE = `export const LOCALES = ['en', 'pt-BR'] as const;\n`;

function writeFile(root: string, rel: string, content: string) {
  const target = path.join(root, rel);
  mkdirSync(path.dirname(target), { recursive: true });
  writeFileSync(target, content);
}

function makeFixture(root: string) {
  writeFile(root, 'apps/professional-portfolio/src/types/i18n.ts', I18N_SOURCE);
}

function writeProject(root: string, name: string, frontmatter: string) {
  writeFile(
    root,
    `content/projects/${name}`,
    `---\n${frontmatter}---\n\nBody text.\n`,
  );
}

function writeWorkEntry(
  root: string,
  slug: string,
  locale: string | null,
  frontmatter: string,
) {
  const suffix = locale === null ? '' : `.${locale}`;
  writeFile(
    root,
    `content/work-experience/${slug}${suffix}.mdx`,
    `---\n${frontmatter}---\n\nBody text.\n`,
  );
}

const VALID_PROJECT = 'title: demo\n';
const VALID_WORK = 'company: Acme\nrole: Engineer\nstart: Jan 2024\n';

function runContentCheck(root: string) {
  return runNodeScript(SCRIPT, ['--root', root]);
}

function makeValidFixture(root: string) {
  makeFixture(root);
  writeProject(root, 'demo.mdx', VALID_PROJECT);
  writeWorkEntry(root, 'acme', null, VALID_WORK);
  writeWorkEntry(root, 'acme', 'pt-BR', VALID_WORK);
}

function expectContentViolation(root: string, message: string) {
  const result = runContentCheck(root);
  expect(result.status).not.toBe(0);
  expect(result.stderr).toContain(message);
}

describe('check:content gate', () => {
  const fixtureRoot = tempFixtureDir('content-gate-');

  it('passes on the real repo content tree', () => {
    const result = runContentCheck(REPO_ROOT);
    expect(result.status).toBe(0);
    expect(result.stdout).toContain('Content check OK');
  });

  it('passes on a minimal valid fixture', () => {
    const root = fixtureRoot();
    makeValidFixture(root);

    const result = runContentCheck(root);
    expect(result.status).toBe(0);
    expect(result.stdout).toContain('Content check OK');
  });

  it('fails when a project misses the required title field', () => {
    const root = fixtureRoot();
    makeFixture(root);
    writeProject(root, 'untitled.mdx', 'featured: true\n');

    expectContentViolation(root, 'missing required field "title"');
  });

  it('fails when work-experience lacks a locale pair', () => {
    const root = fixtureRoot();
    makeFixture(root);
    writeWorkEntry(root, 'acme', null, VALID_WORK);

    expectContentViolation(root, 'missing pt-BR translation');
  });

  it('fails when a localized file has no base (en) file', () => {
    const root = fixtureRoot();
    makeFixture(root);
    writeWorkEntry(root, 'acme', 'pt-BR', VALID_WORK);

    expectContentViolation(root, 'missing base (en) file');
  });

  it('fails on an empty content body', () => {
    const root = fixtureRoot();
    makeFixture(root);
    writeFile(
      root,
      'content/projects/empty.mdx',
      '---\ntitle: empty\n---\n\n   \n',
    );

    expectContentViolation(root, 'empty content body');
  });

  it('fails on an unknown locale suffix', () => {
    const root = fixtureRoot();
    makeValidFixture(root);
    writeWorkEntry(root, 'acme', 'fr', VALID_WORK);

    expectContentViolation(root, 'unknown locale "fr"');
  });

  it('fails when a project file carries a locale suffix', () => {
    const root = fixtureRoot();
    makeValidFixture(root);
    writeFile(
      root,
      'content/projects/demo.pt-BR.mdx',
      `---\n${VALID_PROJECT}---\n\nBody.\n`,
    );

    expectContentViolation(root, 'locale suffix not allowed');
  });

  it('fails on malformed frontmatter', () => {
    const root = fixtureRoot();
    makeFixture(root);
    writeFile(
      root,
      'content/projects/broken.mdx',
      '---\ntitle: [unclosed\n---\n\nBody.\n',
    );

    expectContentViolation(root, 'frontmatter parse failed');
  });
});
