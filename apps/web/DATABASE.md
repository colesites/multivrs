# Multivrs — Data Architecture

Two databases, one ORM. Read this before touching data-layer code.

## Neon (PostgreSQL) — system of record

The **main relational database**. Source of truth for all durable, transactional
domain data:

- Users
- Organizations
- Courses
- Lessons
- Enrollments
- Subscriptions
- Invoices
- Certificates
- Roles & Permissions
- Payments

Connection string: `DATABASE_URL` (Neon pooled connection, `apps/web/.env.local`).

## Convex — real-time layer

The **real-time backend**. Holds derived/ephemeral state that needs live
push to clients — never the source of truth for domain data:

- Real-time updates
- Live presence
- Notifications
- Activity feeds
- Live dashboards
- WebSocket-like behavior without managing WebSockets

Lives in `packages/backend` (`@repo/backend`). Connection: `NEXT_PUBLIC_CONVEX_URL`.

## Prisma — the ORM

**Prisma is the type-safe data-access layer for Neon.** All reads/writes to
PostgreSQL go through Prisma — do not write raw SQL or a second client.

- Schema: `apps/web/prisma/schema.prisma`
- Client singleton: `apps/web/src/lib/prisma.ts` (uses `@prisma/adapter-pg` + `pg.Pool`)
- Config: `apps/web/prisma.config.ts`

> Convex has its own schema/validators (`packages/backend/convex/schema.ts`) and is
> **not** accessed through Prisma.

## How they stay in sync

Neon is written first (via Prisma / Better Auth). Relevant changes are pushed to
Convex from **Better Auth database hooks** (`apps/web/src/lib/auth/hooks.ts` →
`apps/web/src/lib/convex-sync.ts`), which call Convex mutations (e.g.
`api.users.syncUser`). Convex sync is best-effort: a failure is logged and
retried but must never block the Neon write.

**Rule of thumb:** durable/transactional → Neon via Prisma; live/real-time →
Convex, fed from Neon.
