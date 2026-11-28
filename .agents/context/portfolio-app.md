---
area: portfolio-app
paths: apps/professional-portfolio/
last-reviewed: 4a46e82b5ce1fc0b687075005aa050b7b49a384f
---

# apps/professional-portfolio

## Product purpose

The public face of the owner's professional presence: a Vite + React SPA (MUI 9, Emotion) presenting work experience, projects, and resume content to recruiters/visitors. It must stay publicly accessible — it is the portfolio, not an authenticated app. i18n is English + pt-BR with dictionaries that must stay in sync; e2e exercises both locales. All user-facing strings come from dictionaries — never hard-code.

## Layout & boundaries

- `src/app/` — theme, `routePaths` constants, wiring. `src/app/storage.ts` is the ONLY Web Storage module (raw access throws when storage disabled).
- `src/features/<domain>/` — `home`, `projects`, `resume`, `work-experience`. Feature isolation is enforced twice: `check:arch` (dependency-cruiser) AND `src/architecture.spec.ts` (no sibling-feature imports; `src/components/` can't import features/services).
- `src/services/`, `src/i18n/`, `src/types/`, `src/test/` — shared infrastructure.
- `content/projects/*.mdx` at REPO ROOT — GitHub-synced project content (`npm run sync:projects`); `sync:projects:check` fails when stale. Only this app renders it.
- One hand-typed backend touchpoint: `src/services/portfolio/languages.ts` fetches public `GET /api/portfolio/languages` from job-tracker-api — no codegen; the `isPortfolioLanguageView` type guard must be re-verified when that shape changes (see `multi-part-change` skill).

## Gates that bite here

- **Visual regression is the strictest ritual in the repo.** `e2e/visual.spec.ts` baselines are platform-suffixed (`*-win32.png` local, `*-linux.png` inside the Playwright container). Baseline changes land in the same PR as the visual change; pixel-neutral refactors use the `no-visual-change` commit marker. `/projects` is excluded (upstream MDX churn). `npm run update:visual-baselines` is the full ritual.
- **Bundle budget:** 150 kB JS / 20 kB CSS gzip + `.bundle-baseline.json` delta ratchet (>5 kB growth fails; intentional growth needs `--update-baseline` in the same PR).
- **`audit:deep`** is portfolio-scoped: arch spec → Playwright (smoke/WCAG AA/resilience/visual) → memlab leak check on the production build → Lighthouse budgets (perf ≥0.75, a11y ≥0.9, CLS ≤0.1).
- Coverage: single package-wide `global` Jest floor; Stryker `check:mutate:core` covers `services/`, `types/`, `i18n/dictionaries.ts`, `app/storage.ts`, `app/routePaths.ts` (break < 85 fails).
- Jest-level a11y: `@career-hub/ui/testkit`'s `expectNoA11yViolations` (axe-core; `color-contrast` off under jsdom) is applied to component specs (e.g. ProjectDetails) — complements, never replaces, the e2e axe audit.

## Pitfalls

- tsconfig does NOT yet enforce `noUncheckedIndexedAccess`/`exactOptionalPropertyTypes` (alignment pending — see `docs/tooling-effectiveness.md`); code must still be written as if it did.
- e2e specs live in `e2e/` and are excluded from Jest — don't add Jest-importable helpers there.
- Never add Vercel Deployment Protection or commit `VITE_*` values.
