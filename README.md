# Raymond Cox's Blog

A barebones blog built with TanStack Start, React, and Tailwind CSS.

## Getting Started

```bash
npm install
npm run dev
```

The dev server starts on port 3000 by default.

## Writing Posts

Add Markdown files to the `content/` directory:

```
content/
  1_hello-world.md
  2_another-post.md
```

Files are sorted by `date` frontmatter (newest first), then by title. The post title and slug are generated from the filename by stripping the optional numeric prefix; slugs are kebab-case and titles are title-case.

### Optional Frontmatter

```markdown
---
title: Hello World
date: 2026-09-28
slug: hello-world
excerpt: A short summary of the post.
draft: true
---

Your post content here.
```

If frontmatter is omitted, the title is inferred from the filename. Set `draft: true` to hide a post from production builds while keeping it visible in development for preview.

## Building for Production

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

## Testing Strategy

This project follows **Acceptance Test Driven Development (ATDD)** and **Behavior Driven Development (BDD)**. Specifications are written as executable behaviors using Gherkin-style language so that tests read like requirements and failures point directly to broken behavior.

- **Unit tests** use `GIVEN ...` describe blocks and `WHEN ... THEN ...` test names to specify isolated behaviors of components, utilities, loaders, and schemas.
- **E2E tests** use `GIVEN ...` describe blocks and `WHEN ... THEN ...` test names. Multi-step acceptance tests are further broken down with Playwright's `test.step` so the report shows each Given / When / Then boundary.

The project uses four test layers. Unit tests run fast and isolated; acceptance tests exercise full happy paths against fixture content; smoke tests verify the production build against the deployed site; regression tests verify the deployed site on a scheduled cadence.

| Suite | Runner | Scope | Data source | Runs on | When it runs | Command |
| --- | --- | --- | --- | --- | --- | --- |
| Unit | Vitest + React Testing Library | Components, utilities, loaders, schemas | Mocked | — | Every PR | `npm run test:ci` |
| Acceptance | Playwright | Full happy paths: navigation, tags, posts, feeds | Fixture content (`e2e/fixtures/content/`) | Local preview | Every PR | `npm run test:e2e:acceptance` |
| Smoke | Playwright | App loads, pages render, no runtime errors | Live content | Deployed URL | Every push to `main` | `SMOKE_BASE_URL=https://... npm run test:e2e:smoke` |
| Regression | Playwright | Deployed site works end-to-end | Live content | Deployed URL | Twice daily + manual | `REGRESSION_BASE_URL=https://... npm run test:e2e:regression` |

Acceptance builds the app (`npm run build`) before starting the local preview server and points it at the fixture content in `e2e/fixtures/content/` via `BLOG_CONTENT_DIR`. Smoke and regression do not build or start a local server — they target the deployed URL. Unit tests enforce **95% coverage** on the included source tree.

### E2E Suite Organization

Playwright configs live under `e2e/`:

- `playwright.config.ts` — acceptance + regression. Uses a local preview when `REGRESSION_BASE_URL` is not set; otherwise connects to the deployed URL.
- `playwright.smoke.config.ts` — smoke tests. Requires `SMOKE_BASE_URL` and runs against the deployed site.

Specs live in `e2e/acceptance/`, `e2e/smoke/`, and `e2e/regression/`.

### E2E Browser

The Playwright suites run against a local [Lightpanda](https://lightpanda.io/) browser over CDP instead of launching Chromium. Lightpanda is started automatically in global setup (`e2e/fixtures/globalSetup.ts`) and the `browser` fixture in `e2e/fixtures/test.ts` connects Playwright with `chromium.connectOverCDP("ws://127.0.0.1:9222")`.

Download the Lightpanda binary before running e2e tests for the first time:

```bash
npx lightpanda install
```

The binary is cached at `~/.cache/lightpanda-node/lightpanda`.

### Page Object Model

All Playwright specs use a Page Object Model (POM) layer via `e2e/fixtures/test`:

- Page objects live in `e2e/pages/` and encapsulate selectors and common interactions.
- Specs import `test` and `expect` from `../fixtures/test` and destructure the POMs they need (`feedsPage`, `homePage`, `notFoundPage`, `postPage`, `tagsPage`).
- Direct locator calls such as `page.getByTestId`, `page.getByLabel`, and `page.getByRole` belong inside page objects, not in spec files.
- When adding a new page or interaction, create or extend a page object and expose locators or methods through the fixture.

### Definition of Done

A change is complete when:

- `npm run verify` passes (typecheck, Biome lint/format, unit tests).
- Unit tests maintain 95% coverage on the included source tree.
- Acceptance tests cover any new user-facing behavior or changed happy paths (`npm run test:e2e:acceptance`).
- Page Object Models are used for all Playwright interactions; no raw selectors in spec files.
- Smoke tests pass against the deployed site when the change affects page load or deployed behavior (`SMOKE_BASE_URL=https://... npm run test:e2e:smoke`).
- Documentation is updated if the change affects user-facing behavior.

## Scripts

- `npm run dev` — start the development server
- `npm run build` — build for production
- `npm run preview` — preview the production build
- `npm run generate-routes` — regenerate the TanStack Router route tree
- `npm run lint` / `npm run format` — run Biome
- `npm run test` — run the unit test suite with coverage
- `npm run test:ci` — run unit tests with coverage enforcement (used in CI)
- `npm run test:watch` — run unit tests in watch mode
- `npm run test:e2e:acceptance` — run the Playwright acceptance suite against a local production preview
- `npm run test:e2e:smoke` — run the Playwright smoke suite against `SMOKE_BASE_URL`
- `npm run test:e2e:regression` — run the Playwright regression suite against `REGRESSION_BASE_URL` or the local preview
- `npm run verify` — run type checking, linting, formatting, and unit tests

## CI Workflows

- **Verify** (`verify.yml`) — runs on pull requests. It runs the `verify` job (type checking, Biome, unit tests) and the `acceptance` e2e job in parallel.
- **Deploy + Smoke Tests** (`deploy.yml`) — runs on pushes to `main`. The workflow deploys to Railway, runs smoke tests against the new deployment, and rolls back if the smoke tests fail.
- **Regression Tests** (`regression.yml`) — runs on a schedule (08:00 and 20:00 UTC) and via `workflow_dispatch` against the live production site. Set the `REGRESSION_BASE_URL` repository variable to the deployed URL.

## Dependency Management

TanStack dependencies (`@tanstack/react-router`, `@tanstack/react-start`) are pinned to exact versions in `package.json` to keep builds reproducible. Upgrade them deliberately rather than floating on `latest`:

1. Check the latest TanStack releases.
2. Update the pinned versions in `package.json`.
3. Run `npm install` and `npm run verify`.
4. Review the release notes for breaking changes before merging.
