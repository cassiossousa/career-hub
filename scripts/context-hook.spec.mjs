// Tests for scripts/context-hook.mjs — run with `node --test scripts/context-hook.spec.mjs`.
// Each case builds a fixture project dir with .agents/context/ and drives the
// hook with a stdin JSON payload, asserting on stdout/exit code/filesystem.
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const SCRIPT = join(
  dirname(fileURLToPath(import.meta.url)),
  'context-hook.mjs',
);

function makeProject({ withContext = true, withIndex = true } = {}) {
  const dir = mkdtempSync(join(tmpdir(), 'ctx-hook-'));
  if (withContext) {
    mkdirSync(join(dir, '.agents', 'context'), { recursive: true });
    if (withIndex) {
      writeFileSync(
        join(dir, '.agents', 'context', 'index.md'),
        '# Index\n\n| file | area |\n|---|---|\n| jobs.md | jobs |\n',
      );
      writeFileSync(
        join(dir, '.agents', 'context', 'jobs.md'),
        '---\narea: jobs\nlast-reviewed: deadbeefdeadbeefdeadbeefdeadbeefdeadbeef\n---\n\n# Jobs\n',
      );
    }
  }
  return dir;
}

function runHook(dir, payload, extraEnv = {}) {
  const res = spawnSync(process.execPath, [SCRIPT], {
    input: JSON.stringify(payload),
    encoding: 'utf8',
    env: {
      ...process.env,
      DEVIN_PROJECT_DIR: dir,
      DEVIN_CONTEXT_HOOK: 'global',
      ...extraEnv,
    },
    timeout: 15000,
  });
  return {
    status: res.status,
    stdout: (res.stdout || '').trim(),
    stderr: res.stderr || '',
  };
}

function parseStdout(out) {
  return out ? JSON.parse(out.split('\n')[0]) : null;
}

// Simulates an edit outside .agents/context — sets the unsurveyed-edits flag.
function editSourceFile(dir) {
  runHook(dir, {
    hook_event_name: 'PostToolUse',
    tool_name: 'edit',
    tool_input: { file_path: join(dir, 'src', 'foo.ts') },
  });
}

test('no-ops silently outside a context project', () => {
  const dir = makeProject({ withContext: false });
  try {
    const r = runHook(dir, {
      hook_event_name: 'SessionStart',
      session_id: 's1',
    });
    assert.equal(r.status, 0);
    assert.equal(r.stdout, '');
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('SessionStart injects index and freshness rows', () => {
  const dir = makeProject();
  try {
    const r = runHook(dir, {
      hook_event_name: 'SessionStart',
      session_id: 's1',
    });
    assert.equal(r.status, 0);
    const out = parseStdout(r.stdout);
    assert.equal(out.hookSpecificOutput.hookEventName, 'SessionStart');
    const ctx = out.hookSpecificOutput.additionalContext;
    assert.match(ctx, /Agent context/);
    assert.match(ctx, /jobs\.md/);
    // fixture dir is not a git repo -> no crash, no behind-count
    assert.doesNotMatch(ctx, /NaN/);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('PostCompaction re-injects with its own event name', () => {
  const dir = makeProject();
  try {
    const r = runHook(dir, {
      hook_event_name: 'PostCompaction',
      session_id: 's1',
    });
    const out = parseStdout(r.stdout);
    assert.equal(out.hookSpecificOutput.hookEventName, 'PostCompaction');
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('PostToolUse flags writes outside .agents/context only', () => {
  const dir = makeProject();
  try {
    const inside = runHook(dir, {
      hook_event_name: 'PostToolUse',
      tool_name: 'edit',
      tool_input: { file_path: join(dir, '.agents', 'context', 'jobs.md') },
    });
    assert.equal(inside.stdout, '');
    assert.equal(
      existsSync(
        join(dir, '.agents', 'context', '.runtime', 'unsurveyed-edits'),
      ),
      false,
    );

    const outside = runHook(dir, {
      hook_event_name: 'PostToolUse',
      tool_name: 'write',
      tool_input: { file_path: join(dir, 'src', 'foo.ts') },
    });
    assert.equal(outside.status, 0);
    assert.equal(
      existsSync(
        join(dir, '.agents', 'context', '.runtime', 'unsurveyed-edits'),
      ),
      true,
    );

    const readOnly = runHook(dir, {
      hook_event_name: 'PostToolUse',
      tool_name: 'read',
      tool_input: { file_path: join(dir, 'src', 'foo.ts') },
    });
    assert.equal(readOnly.stdout, '');
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('Stop blocks once per prompt when flag is set', () => {
  const dir = makeProject();
  try {
    editSourceFile(dir);
    const first = runHook(dir, {
      hook_event_name: 'Stop',
      session_id: 's1',
      prompt_id: 'p1',
      stop_hook_active: false,
    });
    const out = parseStdout(first.stdout);
    assert.equal(out.decision, 'block');
    assert.match(out.reason, /context-scout/);

    // second stop attempt for the same prompt is allowed through
    const second = runHook(dir, {
      hook_event_name: 'Stop',
      session_id: 's1',
      prompt_id: 'p1',
      stop_hook_active: false,
    });
    assert.equal(second.stdout, '');

    // a new prompt gets nudged again while the flag persists
    const third = runHook(dir, {
      hook_event_name: 'Stop',
      session_id: 's1',
      prompt_id: 'p2',
      stop_hook_active: false,
    });
    assert.equal(parseStdout(third.stdout).decision, 'block');

    // stop_hook_active always allows
    const active = runHook(dir, {
      hook_event_name: 'Stop',
      session_id: 's1',
      prompt_id: 'p3',
      stop_hook_active: true,
    });
    assert.equal(active.stdout, '');
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('Stop is silent without the unsurveyed-edits flag', () => {
  const dir = makeProject();
  try {
    const r = runHook(dir, {
      hook_event_name: 'Stop',
      session_id: 's1',
      prompt_id: 'p1',
      stop_hook_active: false,
    });
    assert.equal(r.stdout, '');
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('UserPromptSubmit warns only when context is stale', () => {
  const dir = makeProject();
  try {
    // not a git repo -> staleness() finds no measurable behind count -> silent
    const r = runHook(dir, {
      hook_event_name: 'UserPromptSubmit',
      prompt: 'hello',
    });
    assert.equal(r.stdout, '');
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('SessionEnd clears runtime state', () => {
  const dir = makeProject();
  try {
    editSourceFile(dir);
    assert.equal(
      existsSync(
        join(dir, '.agents', 'context', '.runtime', 'unsurveyed-edits'),
      ),
      true,
    );
    runHook(dir, { hook_event_name: 'SessionEnd', session_id: 's1' });
    assert.equal(
      existsSync(join(dir, '.agents', 'context', '.runtime')),
      false,
    );
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('defers to global hook when DEVIN_CONTEXT_HOOK is unset and global config exists', () => {
  const dir = makeProject();
  try {
    // Simulate "global installed": point APPDATA at a fixture config containing
    // the context-hook marker, and do NOT set DEVIN_CONTEXT_HOOK.
    const fakeAppData = mkdtempSync(join(tmpdir(), 'ctx-appdata-'));
    mkdirSync(join(fakeAppData, 'devin'), { recursive: true });
    writeFileSync(
      join(fakeAppData, 'devin', 'config.json'),
      JSON.stringify({
        hooks: { Stop: [{ command: 'node context-hook.mjs' }] },
      }),
    );
    const env = {
      ...process.env,
      DEVIN_PROJECT_DIR: dir,
      APPDATA: fakeAppData,
    };
    delete env.DEVIN_CONTEXT_HOOK;
    const res = spawnSync(process.execPath, [SCRIPT], {
      input: JSON.stringify({
        hook_event_name: 'SessionStart',
        session_id: 's1',
      }),
      encoding: 'utf8',
      env,
      timeout: 15000,
    });
    assert.equal(res.status, 0);
    // With a global config containing 'context-hook' and no global env flag,
    // the repo copy must stay silent.
    assert.equal((res.stdout || '').trim(), '');
    rmSync(fakeAppData, { recursive: true, force: true });
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
