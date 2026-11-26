import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import {
  appScript,
  JOB_TRACKER_ROOT,
  mswHandlers,
  runNodeScript,
  tempFixtureDir,
  tsSource,
} from './scriptGate';

const SCRIPT = appScript('check-api-mocks.mjs');

function makeFixtureApp(
  root: string,
  callsSource: string,
  handlersSource: string,
) {
  const srcDir = path.join(root, 'src');
  const mocksDir = path.join(srcDir, 'mocks');
  mkdirSync(mocksDir, { recursive: true });
  writeFileSync(path.join(srcDir, 'calls.ts'), callsSource);
  writeFileSync(path.join(mocksDir, 'handlers.ts'), handlersSource);
}

function runCheck(appRoot: string) {
  return runNodeScript(SCRIPT, [`--app-root=${appRoot}`]);
}

const apiClientCalls = (...calls: string[]) =>
  tsSource("import { apiClient } from './client';", ...calls);

describe('check:api-mocks gate', () => {
  const fixtureRoot = tempFixtureDir('api-mocks-gate-');

  it('passes on the real app (every apiClient call has a handler)', () => {
    const result = runCheck(JOB_TRACKER_ROOT);
    expect(result.status).toBe(0);
    expect(result.stdout).toContain('all mocked');
  }, 30000);

  it('fails when an apiClient call has no matching MSW handler', () => {
    makeFixtureApp(
      fixtureRoot(),
      apiClientCalls(
        "void apiClient.get('/api/jobs');",
        "void apiClient.get('/api/unguarded');",
      ),
      mswHandlers("http.get('/api/jobs', () => null)"),
    );
    const result = runCheck(fixtureRoot());
    expect(result.status).toBe(1);
    expect(result.stderr).toContain('endpoints without MSW handlers');
    expect(result.stderr).toContain('/api/unguarded');
  });

  it('fails on dynamic (non-literal) apiClient URLs', () => {
    makeFixtureApp(
      fixtureRoot(),
      apiClientCalls(
        'declare const url: string;',
        "void apiClient.get('/api/jobs');",
        'void apiClient.get(url);',
      ),
      mswHandlers("http.get('/api/*', () => null)"),
    );
    const result = runCheck(fixtureRoot());
    expect(result.status).toBe(1);
    expect(result.stderr).toContain('non-literal URLs');
  });

  it('fails when the scanner finds no apiClient calls at all', () => {
    makeFixtureApp(
      fixtureRoot(),
      tsSource('export const nothing = 1;'),
      tsSource('export {};'),
    );
    const result = runCheck(fixtureRoot());
    expect(result.status).toBe(1);
    expect(result.stderr).toContain('no apiClient calls found');
  });
});
