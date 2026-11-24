import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

export interface FixtureRepo {
  dir: string;
  run: (args: string[]) => string;
  write: (file: string, content?: string) => void;
  commit: (message?: string) => void;
  dispose: () => void;
}

/** Throwaway git repo for gate-script specs — never touches the real index. */
export function makeFixtureRepo(): FixtureRepo {
  const dir = mkdtempSync(path.join(tmpdir(), 'gate-repo-'));
  const run = (args: string[]) =>
    execFileSync('git', args, { cwd: dir, encoding: 'utf8' });
  run(['init', '-b', 'main']);
  run(['config', 'user.email', 'gate-spec@example.com']);
  run(['config', 'user.name', 'gate-spec']);
  return {
    dir,
    run,
    write(file, content = 'export {};\n') {
      const full = path.join(dir, file);
      mkdirSync(path.dirname(full), { recursive: true });
      writeFileSync(full, content);
    },
    commit(message = 'fixture') {
      run(['add', '-A']);
      run(['commit', '-m', message]);
    },
    dispose() {
      rmSync(dir, { recursive: true, force: true });
    },
  };
}

/** Points refs/remotes/origin/main at HEAD so `origin/main..HEAD` diffs work. */
export function pointOriginMainAtHead(repo: FixtureRepo) {
  repo.run(['update-ref', 'refs/remotes/origin/main', 'HEAD']);
}
