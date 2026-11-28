#!/usr/bin/env node
// .agents/context lifecycle hook — career-hub implementation.
// Handles SessionStart, PostCompaction, UserPromptSubmit, PostToolUse, Stop,
// and SessionEnd for the scout-maintained project context store. Always exits
// 0; any internal failure is silent so hooks never break a session.
import { execFileSync } from 'node:child_process';
import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { join } from 'node:path';

const WRITE_TOOLS = new Set(['write', 'edit', 'apply_patch', 'notebook_edit']);

const projectDir = process.env.DEVIN_PROJECT_DIR || process.cwd();
const contextDir = join(projectDir, '.agents', 'context');
const runtimeDir = join(contextDir, '.runtime');
const indexFile = join(contextDir, 'index.md');
const flagFile = join(runtimeDir, 'unsurveyed-edits');

function emit(obj) {
  process.stdout.write(`${JSON.stringify(obj)}\n`);
}

function bail() {
  process.exit(0);
}

function git(args) {
  try {
    return execFileSync('git', args, {
      cwd: projectDir,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
      timeout: 5000,
    }).trim();
  } catch {
    return null;
  }
}

// When the global dispatcher (%APPDATA%/devin/config.json) already routes to
// this script, the per-repo .devin/hooks.v1.json copy must stay silent or the
// context would be injected twice. DEVIN_CONTEXT_HOOK=global marks dispatch.
function deferToGlobal() {
  if (process.env.DEVIN_CONTEXT_HOOK === 'global') return false;
  const candidates = [
    process.env.APPDATA && join(process.env.APPDATA, 'devin', 'config.json'),
    process.env.USERPROFILE &&
      join(process.env.USERPROFILE, '.config', 'devin', 'config.json'),
    process.env.HOME &&
      join(process.env.HOME, '.config', 'devin', 'config.json'),
  ].filter(Boolean);
  for (const p of candidates) {
    try {
      const text = readFileSync(p, 'utf8');
      if (text.includes('context-hook') || text.includes('context_hook')) {
        return true;
      }
    } catch {
      // missing/unreadable config — keep checking
    }
  }
  return false;
}

function areaFiles() {
  try {
    return readdirSync(contextDir).filter(
      (f) => f.endsWith('.md') && f !== 'index.md',
    );
  } catch {
    return [];
  }
}

function lastReviewedSha(file) {
  try {
    const head = readFileSync(join(contextDir, file), 'utf8').slice(0, 4000);
    const m = head.match(/^last-reviewed:\s*([0-9a-f]{7,40})\s*$/im);
    return m ? m[1] : null;
  } catch {
    return null;
  }
}

function commitsBehind(sha) {
  const out = git(['rev-list', '--count', `${sha}..HEAD`]);
  if (out === null) return null;
  const n = Number.parseInt(out, 10);
  return Number.isNaN(n) ? null : n;
}

function staleness() {
  const head = git(['rev-parse', 'HEAD']);
  const rows = [];
  let maxBehind = 0;
  for (const f of areaFiles()) {
    const sha = lastReviewedSha(f);
    if (!sha) {
      rows.push(`- \`${f}\` — no last-reviewed marker`);
      continue;
    }
    const behind = commitsBehind(sha);
    if (behind !== null) maxBehind = Math.max(maxBehind, behind);
    rows.push(
      `- \`${f}\` — reviewed at \`${sha.slice(0, 8)}\`${
        behind === null ? '' : `, ${behind} commit(s) behind HEAD`
      }`,
    );
  }
  return { head, maxBehind, rows };
}

function handleInject(event) {
  let index;
  try {
    index = readFileSync(indexFile, 'utf8').trim();
  } catch {
    return;
  }
  const { maxBehind, rows } = staleness();
  const context = [
    '## Agent context (auto-injected from .agents/context/)',
    '',
    index,
    '',
    `Freshness (HEAD vs last scout review${maxBehind > 0 ? ` — ${maxBehind} commit(s) behind` : ''}):`,
    ...rows,
    '',
    'Protocol: read the relevant area file under .agents/context/ before editing that area. The scout refreshes these files — run /context-scout after meaningful changes; the agent is nudged automatically at turn end.',
  ].join('\n');
  emit({
    hookSpecificOutput: { hookEventName: event, additionalContext: context },
  });
}

function handlePromptSubmit() {
  const { maxBehind } = staleness();
  if (maxBehind <= 0) return;
  emit({
    hookSpecificOutput: {
      hookEventName: 'UserPromptSubmit',
      additionalContext: `Project context is ~${maxBehind} commit(s) behind HEAD. If this task changes architecture or product behavior, run /context-scout when finished.`,
    },
  });
}

function handlePostToolUse(payload) {
  if (!WRITE_TOOLS.has(payload.tool_name || '')) return;
  const filePath = String(
    payload.tool_input?.file_path ?? payload.tool_input?.path ?? '',
  ).replace(/\\/g, '/');
  if (filePath.includes('/.agents/context/')) return;
  try {
    mkdirSync(runtimeDir, { recursive: true });
    writeFileSync(flagFile, '1\n');
  } catch {
    // runtime state is best-effort
  }
}

function handleStop(payload) {
  if (payload.stop_hook_active) return;
  if (!existsSync(flagFile)) return;
  const promptId = String(payload.prompt_id || 'unknown').replace(
    /[^a-zA-Z0-9_-]/g,
    '_',
  );
  const blockedFile = join(runtimeDir, `blocked-${promptId}`);
  try {
    mkdirSync(runtimeDir, { recursive: true });
    writeFileSync(blockedFile, '1\n', { flag: 'wx' });
  } catch {
    return; // already nudged for this prompt
  }
  emit({
    decision: 'block',
    reason:
      'Code changed this session but .agents/context/ has not been scouted. Invoke the /context-scout skill (runs the scout subagent) to refresh project context before stopping. If the changes are trivial, the scout may clear the flag without content edits.',
  });
}

function handleSessionEnd() {
  try {
    rmSync(runtimeDir, { recursive: true, force: true });
  } catch {
    // best-effort cleanup
  }
}

function main() {
  let raw = '';
  try {
    raw = readFileSync(0, 'utf8');
  } catch {
    bail();
  }
  let payload = {};
  try {
    payload = JSON.parse(raw);
  } catch {
    bail();
  }
  const event = payload.hook_event_name || '';
  if (!existsSync(contextDir)) bail();
  if (deferToGlobal()) bail();

  switch (event) {
    case 'SessionStart':
    case 'PostCompaction':
      handleInject(event);
      break;
    case 'UserPromptSubmit':
      handlePromptSubmit();
      break;
    case 'PostToolUse':
      handlePostToolUse(payload);
      break;
    case 'Stop':
      handleStop(payload);
      break;
    case 'SessionEnd':
      handleSessionEnd();
      break;
    default:
      break;
  }
  bail();
}

try {
  main();
} catch {
  bail();
}
