# Repository Guidelines

## Project Structure & Module Organization
This repository is a Next.js App Router project.
- `app/`: application routes, layout, global styles, and page components (for example `app/page.tsx`, `app/layout.tsx`).
- `public/`: static assets served directly (SVGs, icons, images).
- `docs/`: product and architecture reference docs.
- Root config: `next.config.ts`, `tsconfig.json`, `eslint.config.mjs`, `postcss.config.mjs`.
- `.trunk/trunk.yaml`: shared linting and security checks used in CI/local quality runs.

Use the `@/*` import alias from `tsconfig.json` for internal modules when paths get deep.

## Build, Test, and Development Commands
Prefer `pnpm` (lockfile is `pnpm-lock.yaml`).
- `pnpm dev`: start local dev server on `http://localhost:3000`.
- `pnpm build`: create production build (also validates type/lint-integrated build constraints).
- `pnpm start`: run the built app.
- `pnpm lint`: run ESLint (Next.js core-web-vitals + TypeScript rules).
- `trunk check`: run repository-wide linters/security checks (ESLint, Prettier, markdownlint, osv-scanner, etc.).

## Coding Style & Naming Conventions
- Language: TypeScript (`strict` enabled) and React function components.
- Indentation: 2 spaces; follow existing formatting in `app/*.tsx`.
- Components: `PascalCase`; hooks/utilities: `camelCase`; route files follow Next.js conventions (`page.tsx`, `layout.tsx`).
- Keep modules small and colocate route-specific UI inside the corresponding `app/` segment.
- Run `pnpm lint` (and `trunk check` when available) before opening a PR.

## Testing Guidelines
There is currently no dedicated test framework configured in `package.json`.
- Minimum gate for changes: `pnpm lint` and `pnpm build` must pass.
- If you add tests, prefer colocated `*.test.ts`/`*.test.tsx` files or `__tests__/` near the feature.
- Focus coverage on critical rendering logic, data transforms, and regression-prone behavior.

## Commit & Pull Request Guidelines
Git history currently uses simple descriptive subjects (example: `Initial commit from Create Next App`).
- Write concise, imperative commit subjects (about 50-72 chars).
- Keep commits scoped to one logical change.
- PRs should include: summary, affected paths, validation commands run, and screenshots for UI updates.
- Link related issues/tasks and note any follow-up work explicitly.
