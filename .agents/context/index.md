# Agent context — career-hub

npm workspaces monorepo for a personal career presence: a public portfolio SPA, a job-tracker SPA, and a shared UI package. Backend API lives in the sibling repo `job-tracker-api` (FastAPI + Postgres). This index is auto-injected into agent sessions; freshness is tracked per file via the `last-reviewed` frontmatter SHA.

## Area files

| File                 | Area                          | What it covers                                                                                                                                             |
| -------------------- | ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `monorepo.md`        | repo root                     | Gate tiers (lint-staged → verify:push → CI verify:all → audit:deep), scripts/, content pipeline, deploy topology, agent tooling (.agents/, .devin/, hooks) |
| `portfolio-app.md`   | `apps/professional-portfolio` | Public Vite+React portfolio — MDX-synced projects, i18n en/pt-BR, visual regression ritual, must stay publicly accessible                                  |
| `job-tracker-app.md` | `apps/job-tracker`            | Tracker SPA — demo/live data mode safety boundary, MSW contract, generated OpenAPI client synced from job-tracker-api                                      |
| `ui-package.md`      | `packages/ui`                 | `@career-hub/ui` shared component library — raw TS source contract, exports map, testkit                                                                   |

## Protocol

- Before editing an area, read its file here — it captures product purpose, architecture, invariants, and pitfalls that the AGENTS.md rules don't.
- After meaningful changes, run `/context-scout` (scout subagent, `.agents/agents/SCOUT.md`) or let the stop-hook nudge handle it. The scout may only write under `.agents/context/`.
- These files orient; they never replace `AGENTS.md` rules, `.agents/skills/`, or `docs/` audits. No secrets or env values belong here.
