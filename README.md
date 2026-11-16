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

## Deployment

- `apps/web` is deployed on Vercel. Set `NEXT_PUBLIC_SITE_ENV=production` only
  in Vercel's Production environment and redeploy for the live `lambtech.us`
  site to be indexable. Keep the variable unset or non-production in Vercel
  Preview and QA environments so they remain non-indexable.
- `apps/api` is deployed separately on DigitalOcean. Its deployment does not
  control the website's metadata, robots policy, sitemap, or indexing state.

## Production security configuration

- The public web application is a Vercel deployment. Configure only public
  frontend values there: `NEXT_PUBLIC_SITE_ENV=production`,
  `NEXT_PUBLIC_API_BASE_URL`, and `NEXT_PUBLIC_MEDIA_BASE_URL`. Never put
  database or email credentials in Vercel public variables.
- The DigitalOcean API requires `NODE_ENV=production`, `PORT`,
  `PUBLIC_WEB_ORIGINS`, `PUBLIC_LEAD_SOURCE_SITE_ORIGINS`, `DATABASE_URL`, and
  `MIGRATION_DATABASE_URL`. The separate email worker also requires
  `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, and `LEADS_NOTIFICATION_TO`.
- Use a dedicated LAMBTECH database role with only the application privileges
  it needs; use a separate migration role for `MIGRATION_DATABASE_URL`. Require
  TLS in both PostgreSQL URLs and never disable certificate verification.
- Run the API and worker as separate DigitalOcean processes. Restrict database
  ingress to their private network or fixed deployment egress, and maintain
  tested backups and recovery procedures outside this repository.

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
