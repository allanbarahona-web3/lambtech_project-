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

## API local

El API se ejecuta con `pnpm dev:api` en `http://localhost:3001/v1`.
Su configuración local vive en `apps/api/.env` (ignorado por Git) y ya
incluye los valores seguros de desarrollo para CORS y PostgreSQL local. Antes
de iniciar los endpoints que persisten datos, crea la base `lambtech`, ajusta
`DATABASE_URL` y `MIGRATION_DATABASE_URL` si hace falta, y aplica las
migraciones de Prisma. El correo mediante Resend es opcional: configura
`RESEND_API_KEY`, `RESEND_FROM_EMAIL` y `LEADS_NOTIFICATION_TO` juntos para
activarlo.

## Repository notes

- Workspace commands delegate to `@lambtech/web`; application source lives in `apps/web/src/app`.
- Future NestJS, Prisma, PostgreSQL, media, and internationalization work are intentionally outside this foundation.
