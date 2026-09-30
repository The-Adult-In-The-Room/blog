# Agent Guide

This file contains advice for AI agents working in the `blog` repository.

## Project Overview

- **Stack**: React 19, TypeScript 7, TanStack Router + TanStack Start, Tailwind CSS v4, Vite, Vitest, Biome.
- **Runtime**: Node.js >= 24.

## Before You Start

- Run `npm install` if `node_modules` is missing.
- Use the `#/` path alias for imports from `src/`.

## Verification

Always run the full verification pipeline before considering work complete:

```bash
npm run verify
```

This runs `tsc`, `biome ci`, and `vitest run`.

For coverage specifically:

```bash
npm test -- --run
```

The project enforces **95% coverage thresholds** for statements, branches, functions, and lines on the included source tree. Routes, generated files, and pure presentation UI are excluded from the gate.

## Formatting and Linting

- The project uses **Biome**, not ESLint/Prettier.
- The repo keeps **tab indentation** and **double quotes**. Do not switch to single quotes or 2-space indentation.
- Auto-fix formatting and import ordering with:

  ```bash
  npm run fix
  ```

  or

  ```bash
  npx biome check --write <paths...>
  ```

- Do not manually re-order imports; let Biome handle it.

## Type Checking

- Run `npx tsc --noEmit` to check types.
- Prefer `import type` when importing only types.

## Testing

- Tests live next to the files they test (e.g., `foo.ts` → `foo.test.ts`).
- Use **Vitest** with `happy-dom` and **React Testing Library** (`@testing-library/react`, `@testing-library/user-event`).
- Mock `fetch`, `localStorage`, and `matchMedia` with `vi.fn()` and `vi.stubGlobal` when needed.
- Prefer `userEvent` over `fireEvent` for interaction tests.
- Do not chase 100% coverage with nonsense tests. Cover meaningful behavior and edge cases.

### Playwright / E2E

- E2E specs live in `e2e/acceptance/` and `e2e/smoke/`.
- Import `test` and `expect` from `../fixtures/test`, not from `@playwright/test` directly.
- Use fixture-injected Page Objects (`homePage`, `projectsPage`, `aboutPage`, `navigation`, `themeToggle`).
- Page objects live in `e2e/pages/` and encapsulate all selectors and page interactions.
- Never use raw `page.getByTestId`, `page.getByLabel`, or similar direct locator calls inside spec files.
- Write e2e specs with **Gherkin-style** `describe` and `test` names:
  - Use `GIVEN ...` for `test.describe` blocks (shared context).
  - Use `WHEN ... THEN ...` for `test` block names (scenario under test).
- Use `test.step` to break multi-step acceptance tests into explicit Given / When / Then boundaries so the report output shows each step.
- Add or update acceptance tests for any new user-facing behavior or changed happy paths.
- Run `npm run test:e2e:acceptance` and `npm run test:e2e:smoke` when the change touches pages, navigation, or theme behavior.

## Code Organization

- **Constants**: Runtime constants belong in `src/constants/` (not `src/types/`).
- **Types**: Type definitions belong in `src/types/`.
- **Components**: Use PascalCase for component files and directories.
- **UI components**: Keep Shadcn/UI components in `src/components/ui/` and test their variants/interactions.

## Git

- **Never manage git history.** The user always handles commits, amends, rebases, resets, branch creation, merges, and pushes.
- Do not run `git commit`, `git push`, `git rebase`, `git reset`, `git cherry-pick`, `git merge`, or any other git mutation unless the user explicitly asks for it.
- Do not create empty commits or amend failed commits.
- Do not offer to commit, amend, squash, or otherwise rewrite history, even if a previous commit already exists on the branch or if changes appear to have been committed accidentally.
- It is fine to read git state (e.g., `git status`, `git diff`, `git log`) for context, but treat git history as read-only.

## Common Pitfalls

- Avoid adding runtime values (consts/enums) to `.d.ts` files.
- Keep `index.ts` files as thin barrels when possible.
- Do not add new dependencies without updating `package.json` and running `npm install`.
- Do not add files or directories to the coverage exclude list to hide untested code.
- The `@/*` path alias has been removed; use `#/*` for all internal imports.

## Useful Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run verify` | Run typecheck, lint, and tests |
| `npm test -- --run` | Run tests with coverage |
| `npm run test:e2e:acceptance` | Run Playwright acceptance suite |
| `npm run test:e2e:smoke` | Run Playwright smoke suite |
| `npm run fix` | Auto-fix Biome issues |
| `npx tsc --noEmit` | Type-check only |
