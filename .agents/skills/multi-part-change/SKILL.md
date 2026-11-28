---
name: multi-part-change
description: Orchestrates any change spanning more than one workspace, app, package, or the frontend-backend API contract — enforces one agent per part, contract-first sequencing, and per-part verification. Load at planning start whenever a task may touch career-hub workspaces AND/OR the job-tracker-api backend.
---

# Multi-Part Change Orchestration

One agent works on exactly ONE part of the codebase at a time. When a change
crosses a part boundary — multiple workspaces/apps/packages, or the
frontend↔backend contract — decompose it and spawn one agent per part so each
keeps focused context. The orchestrator owns decomposition, sequencing, and
cross-part integration; part agents own only their slice.

## When this applies

- The task touches two or more rows of the parts map below, OR
- It changes the API contract between `job-tracker-api` and the frontends.

Work confined to a single part proceeds normally under that part's own
AGENTS.md and skills — this skill adds nothing there.

## The parts map

| Part              | Path (career-hub unless noted)                                            | Owns                                                                   | Contract surface                                                                                                                                    |
| ----------------- | ------------------------------------------------------------------------- | ---------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| Portfolio app     | `apps/professional-portfolio`                                             | Public portfolio SPA                                                   | Hand-typed fetch of public `GET /api/portfolio/languages` (`src/services/portfolio/languages.ts`)                                                   |
| Job tracker app   | `apps/job-tracker`                                                        | Tracker SPA + MSW mocks (`src/mocks/`)                                 | Generated client `src/services/api/generated/openapi.ts` + `contract/openapi.json`; every `apiClient` call needs an MSW handler (`check:api-mocks`) |
| Shared UI package | `packages/ui` (`@career-hub/ui`)                                          | Components, theme, i18n, testkit — raw TS source, no build             | None — consumed as source by both apps                                                                                                              |
| Backend API       | `job-tracker-api` (sibling repo, whole repo is one part)                  | FastAPI app, services, domain, infrastructure, Alembic, `openapi.json` | Owns the contract source of truth                                                                                                                   |
| Contract seam     | `job-tracker-api/openapi.json` → `apps/job-tracker/contract/openapi.json` | Generated artifacts only                                               | `npm run sync:api-contract --workspace job-tracker`; `check:api-contract` verifies freshness                                                        |
| Repo-root tooling | `career-hub/scripts/`, `content/projects/`                                | Cross-workspace gates, GitHub-synced MDX                               | Assign to the part that owns the gated surface                                                                                                      |

## Core rules

1. **One agent, one part.** An agent's write scope is exactly one row of the
   parts map. If the work requires edits in two parts, decompose and spawn one
   agent per part — never let a single agent carry both contexts.
2. **Contract changes are sequenced, never negotiated implicitly.** The
   backend agent lands the API surface + committed `openapi.json` first. Then
   the contract-sync step runs (`sync:api-contract`) — it may be its own agent
   or the job-tracker agent's first task. Generated files
   (`contract/openapi.json`, `src/services/api/generated/openapi.ts`) are NEVER
   hand-edited. Frontend feature agents start only after synced artifacts
   exist.
3. **`packages/ui` lands before its consumers.** If an app change needs a
   new shared component, the ui-package agent lands first; app agents consume
   the published source contract.
4. **Ordering:** backend → contract sync → job-tracker app → portfolio app.
   Portfolio is only in scope when the public `portfolio/languages` shape
   changes — it has no codegen, so its agent must re-verify the hand-written
   guard `isPortfolioLanguageView` in `src/services/portfolio/languages.ts`.
5. **Decomposition artifact.** Before spawning, the orchestrator writes a
   per-part brief: allowed paths, contract delta (endpoints/fields added,
   changed, removed), dependencies on other parts' outputs, and the part's
   verification commands.
6. **Handoff report.** Each agent ends by reporting: files touched, contract
   deltas introduced, gate results, and anything the next part must know. The
   orchestrator — not any single agent — owns cross-part integration
   verification.
7. **Verification per part** (run inside that part's repo/workspace):
   - Backend (`job-tracker-api`): `uv run python scripts/verify_all.py`; add
     `scripts/audit_deep.py` when runtime/deploy files are touched and
     `scripts/check_mutation_diff.py` for domain/services logic changes.
   - Job tracker app: `npm run check:types` (root `tsc -b` covers all
     workspaces), focused Jest specs via
     `npx jest --config apps/job-tracker/jest.config.cjs --runInBand <specs>`,
     `npm run check:api-contract --workspace job-tracker`, and
     `check:api-mocks` coverage whenever API calls change.
   - Portfolio app: same typecheck plus focused Jest specs; e2e/visual
     baselines only when rendered output changes (see its AGENTS.md ritual).
   - `packages/ui`: `npm run test --workspace @career-hub/ui` plus root
     `npm run check:types`.
   - Orchestrator final: `npx lint-staged` over all touched files;
     `npm run verify:push` when the change is broad enough to warrant it.
8. **Anti-patterns (instant rejection):**
   - One agent editing two parts.
   - A frontend agent hand-editing generated contract files.
   - Contract shape inferred by reading backend code instead of the synced
     `openapi.json`.
   - Spawning frontend agents before contract artifacts are regenerated.
   - A part agent running another part's gates as a substitute for its own.
   - One agent interleaving edits across parts in a single pass.

## Single-agent fallback

Spawning one agent per part is the preferred way to keep contexts separate,
but subagents are not always available — they may be disabled, the host may
lack `run_subagent`/MCP orchestration tools, or the runtime may only offer a
single agent. When multiple parts are needed and you cannot spawn agents:

- Work strictly sequentially: ONE part at a time, start to finish — edits,
  that part's verification gates, and its handoff report — before touching
  the next part.
- Never interleave edits across parts in the same working pass.
- You are both orchestrator and part agent: still write the per-part brief,
  still sequence contract changes backend-first, and still run the
  orchestrator's cross-part integration verification at the end.
- Before starting each part, re-orient from that part's own sources — its
  AGENTS.md, its `.agents/context/` area file, and the parts map — instead of
  carrying the previous part's context forward. Finish one context fully,
  then load the next.

## Mirror notice

This file is mirrored byte-identically at
`career-hub/.agents/skills/multi-part-change/SKILL.md` and
`job-tracker-api/.agents/skills/multi-part-change/SKILL.md`. Any edit must be
applied to BOTH copies in the same change.
