# LAMBTECH LLC website

Production monorepo foundation for the LAMBTECH LLC corporate website.

## Stack

- Next.js App Router
- React
- TypeScript
- Tailwind CSS
- ESLint
- pnpm

## Structure

- `apps/web` — Next.js corporate website frontend.
- `apps/api` — reserved for a future NestJS backend; not part of this foundation.
- `index.html` and `index2.html` — local visual reference prototypes, not application source.

## Commands

```bash
pnpm dev
pnpm typecheck
pnpm lint
pnpm build
```

## Repository notes

- Workspace commands delegate to `@lambtech/web`; application source lives in `apps/web/src/app`.
- Future NestJS, Prisma, PostgreSQL, media, and internationalization work are intentionally outside this foundation.
