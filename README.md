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
---

Your post content here.
```

If frontmatter is omitted, the title is inferred from the filename.

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
- `npm run test` – run the test suite with coverage
- `npm run test:ci` – run tests with coverage enforcement (used in CI)
- `npm run test:watch` – run tests in watch mode
- `npm run verify` – run type checking, linting, formatting, and tests
