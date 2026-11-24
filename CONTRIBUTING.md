# Contributing

Thanks for contributing to career-hub. This file is for humans; `AGENTS.md` is the engineering constitution for AI agents working in this repo — read it first, it defines the rules, gates, and definition of done that apply to every change.

## Setup

```bash
nvm use          # Node version pinned in .nvmrc (24)
npm ci           # clean install of all workspaces
npx playwright install chromium   # one-time, for e2e/memlab/lighthouse
```

Requirements: Node >= 22.12 (see `engines` in `package.json`), npm 11.x.

## Repository layout

npm workspaces monorepo:

- `apps/professional-portfolio` — Vite + React portfolio (public)
- `apps/job-tracker` — Vite + React job tracker (demo mode by default in prod)
- `packages/ui` — `@career-hub/ui`, private shared component library (raw TS source, no build step)
- `scripts/` — cross-workspace gates; `apps/*/scripts/` — app-local gates

## Daily commands

```bash
npm run dev                  # portfolio dev server
npm run dev:job-tracker      # job tracker dev server
npm run test                 # all Jest suites
npm run test:e2e             # Playwright e2e (both apps)
npm run verify:all           # full CI-equivalent gate
npm run audit:deep           # verify:all + browser/memlab/lighthouse runtime checks
```

See `AGENTS.md` for the targeted definition of done — routine changes do not require `verify:all` locally; CI runs it on every push/PR.

## Commits and PRs

- Conventional commits: `feat:`, `fix:`, `chore:`, `docs:`, `test:` (see `git log`).
- Keep PRs small and focused.
- PRs that change render-affecting files must include regenerated visual baselines in the same PR.
- Do not add dependencies without discussion — see the "no unapproved dependencies" rule in `AGENTS.md`.

## Agent skills

AI-agent skills live in `.agents/skills/` — the single canonical location. See the skills table in `AGENTS.md` for when each applies.

## Documentation

- `AGENTS.md` — rules, boundaries, gates, definition of done
- `docs/tooling-effectiveness.md` — living audit of which gates earn their runtime
- `.agents/skills/` — agent skills (clean-frontend-change, test-falsification, ui-ux-guidelines)
