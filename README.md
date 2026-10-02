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

## Scripts

- `npm run dev` – start the development server
- `npm run build` – build for production
- `npm run preview` – preview the production build
- `npm run generate-routes` – regenerate the TanStack Router route tree
- `npm run lint` / `npm run format` – run Biome
- `npm run test` – run the unit test suite with coverage
- `npm run test:ci` – run unit tests with coverage enforcement (used in CI)
- `npm run test:watch` – run unit tests in watch mode
- `npm run test:e2e:acceptance` – run the Playwright acceptance e2e suite against a local production preview
- `npm run test:e2e:smoke` – run the Playwright smoke e2e suite against a local production preview
- `npm run test:e2e:regression` – run the acceptance e2e suite against a live URL (`REGRESSION_BASE_URL`)
- `npm run verify` – run type checking, linting, formatting, and unit tests

## CI Workflows

- **Verify** (`verify.yml`) — runs on pull requests. It runs the `verify` job (type checking, Biome, unit tests) and the `acceptance` e2e job in parallel.
- **Smoke Tests** (`smoke.yml`) — runs on pushes to `main`. This is the pre-deploy smoke test that Railway waits on before deploying.
- **Regression Tests** (`regression.yml`) — runs on a schedule (08:00 and 20:00 UTC) and via `workflow_dispatch` against the live production site. Set the `REGRESSION_BASE_URL` repository variable to the deployed URL.

## E2E Browser

The Playwright suites run against a local [Lightpanda](https://lightpanda.io/) browser over CDP instead of launching Chromium. Lightpanda is started automatically in global setup (`e2e/fixtures/globalSetup.ts`) and the `browser` fixture in `e2e/fixtures/test.ts` connects Playwright with `chromium.connectOverCDP("ws://127.0.0.1:9222")`.

Download the Lightpanda binary before running e2e tests for the first time:

```bash
npx lightpanda install
```

The binary is cached at `~/.cache/lightpanda-node/lightpanda`.

## Dependency Management

TanStack dependencies (`@tanstack/react-router`, `@tanstack/react-start`) are pinned to exact versions in `package.json` to keep builds reproducible. Upgrade them deliberately rather than floating on `latest`:

1. Check the latest TanStack releases.
2. Update the pinned versions in `package.json`.
3. Run `npm install` and `npm run verify`.
4. Review the release notes for breaking changes before merging.
