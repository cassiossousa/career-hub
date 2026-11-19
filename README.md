---

title: professional-portfolio
repo: https://github.com/cassiossousa/career-hub
demo: https://professional-portfolio-mu-gray.vercel.app
featured: true
category: fullstack
technologies:

- React
- TypeScript
- Tailwind
- Vite
- Jest
  summary:
- Developer portfolio built with React, TypeScript, and Vite
- Automatically generates a resume filled with highlighted GitHub projects' metadata
- Browser-based resume printing and PDF export
  highlights:
- Automated resume generation
- Accessible, responsive UI
- GitHub-driven project metadata

---

# Professional Portfolio

Developer portfolio built with React, TypeScript, and Vite. Project and work experience data is bundled from MDX content at build time.

## Project Summary

- Built a developer portfolio with React, TypeScript, and Vite.
- Implemented automatic resume generation from project metadata stored in repositories.
- Added a browser-printable resume that can be saved as PDF.

## Tech Stack

### Core

- Vite
- TypeScript
- React
- TailwindCSS

### Testing

- Jest

### Tooling

- ESLint
- Prettier

## Architecture Highlights

- GitHub repositories act as the single source of truth for project metadata.
- Resume pages are dynamically generated from structured project data.
- Resume content is generated from bundled project and work experience metadata.

## Workspace Structure

- `apps/professional-portfolio` contains the React/Vite portfolio website.
- `apps/job-tracker` contains the React/Vite job tracker app (work in progress).
- `content` contains the MDX data bundled into the portfolio at build time.
- `scripts` contains repository maintenance tools such as GitHub project sync.
- `apps/*` and `packages/*` are npm workspace boundaries for future API,
  background-worker, and shared packages.

Each app is a static frontend deployed as its own Vercel project (Root
Directory = `apps/<app>`). Database access, job-application submissions, and
scheduled jobs will require server-capable hosting and should live outside
the web bundles.

## Key Features

- Automatic resume generation from project metadata
- Multi-language support
- Accessible and responsive UI
- Dynamic project listing

## Quality

- Unit tests with Jest
- Component tests with @testing-library
- Type-safe codebase with TypeScript
- Linting with ESLint, Oxlint, and Biome
- `npm run verify:all` runs lint, formatting, type, test, build, dead-code, React-bloat, and architecture checks
- Pre-commit hooks fix and format staged files with Oxlint, Biome, and Prettier.
- Pre-push hooks run TypeScript, Knip, React-bloat, and architecture checks.
- Pull-request CI runs incremental Stryker mutation tests on changed source files.

## Demo

https://professional-portfolio-mu-gray.vercel.app

## Repository

https://github.com/cassiossousa/career-hub

## Development

```bash
npm install
npm run dev
npm run dev:job-tracker
```

Project metadata is bundled from `content/` during the Vite build. To refresh
GitHub-sourced project metadata, run `npm run sync:projects` before building.

The Vite dev server proxies `/api` to `http://localhost:8000` by default;
override with `API_PROXY_TARGET`. The backend API lives in a separate
repository.
