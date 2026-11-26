import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import {
  appScript,
  JOB_TRACKER_ROOT,
  mswHandlers,
  runNodeScript,
  tempFixtureDir,
} from './scriptGate';

const SCRIPT = appScript('check-mock-contract.mjs');

const OPENAPI = JSON.stringify({
  paths: {
    '/api/jobs': { get: {}, post: {} },
    '/api/jobs/{id}': { get: {}, patch: {} },
  },
});

function makeFixtureApp(root: string, handlersSource: string) {
  const mocksDir = path.join(root, 'src', 'mocks');
  const contractDir = path.join(root, 'contract');
  mkdirSync(mocksDir, { recursive: true });
  mkdirSync(contractDir, { recursive: true });
  writeFileSync(path.join(mocksDir, 'handlers.ts'), handlersSource);
  writeFileSync(path.join(contractDir, 'openapi.json'), OPENAPI);
}

function runCheck(appRoot: string) {
  return runNodeScript(SCRIPT, [`--app-root=${appRoot}`]);
}

const JOB_ROUTES = [
  "http.get('/api/jobs', () => null)",
  "http.get('/api/jobs/:id', () => null)",
];

describe('check:mock-contract gate', () => {
  const fixtureRoot = tempFixtureDir('mock-contract-gate-');

  it('passes on the real app (every handler matches a contract route)', () => {
    const result = runCheck(JOB_TRACKER_ROOT);
    expect(result.status).toBe(0);
    expect(result.stdout).toContain('all match contract/openapi.json');
  }, 30000);

  it('passes when MSW :param segments align with OpenAPI {param} segments', () => {
    makeFixtureApp(fixtureRoot(), mswHandlers(...JOB_ROUTES));
    const result = runCheck(fixtureRoot());
    expect(result.status).toBe(0);
  });

  it('fails when a handler mocks a route absent from openapi.json', () => {
    makeFixtureApp(
      fixtureRoot(),
      mswHandlers(...JOB_ROUTES, "http.delete('/api/ghost/:id', () => null)"),
    );
    const result = runCheck(fixtureRoot());
    expect(result.status).toBe(1);
    expect(result.stderr).toContain('no matching openapi.json route');
    expect(result.stderr).toContain('/api/ghost');
  });

  it('fails when the method is not in the contract for that path', () => {
    makeFixtureApp(
      fixtureRoot(),
      mswHandlers("http.delete('/api/jobs', () => null)"),
    );
    const result = runCheck(fixtureRoot());
    expect(result.status).toBe(1);
    expect(result.stderr).toContain('DELETE /api/jobs');
  });
});
