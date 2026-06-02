# Pith

Pith turns blog links into structured, editable study notes and beautifully rendered PDFs.

## Phase 1

This repository currently implements the foundation UI:

- Next.js App Router TypeScript scaffold
- Dashboard for creating multi-link packs
- Pack detail page with source list, job status, editor preview, and PDF action placeholder
- Shared domain models for packs, sources, and job steps
- Drizzle schema for the planned authenticated project database

## Phase 2 (current)

Persistence and authentication are now wired:

- Clerk authentication with sign-in, sign-up, and protected dashboard routes
- Drizzle ORM connected to Neon Postgres
- Dashboard and pack detail pages are database-backed and scoped to the signed-in user
- Create-pack server action with Zod validation and persisted source rows

## Development

```bash
npm install
npm run dev
```

Then open `http://localhost:3000/dashboard`.

### Required environment variables

Create `.env.local` at the repo root:

```bash
# Clerk — https://dashboard.clerk.com
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/dashboard
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/dashboard

# Neon — https://console.neon.tech
DATABASE_URL=postgres://...neon.tech/neondb?sslmode=require
```

### Database

Schema lives in `lib/db/schema.ts`. SQL migrations are checked in under `lib/db/migrations/`.

```bash
# Generate a new migration after editing the schema
npm run db:generate

# Apply checked-in migrations against the database in DATABASE_URL
npm run db:migrate

# Or, for fast iteration, push the current schema directly
npm run db:push
```

Phase 3 and beyond (Trigger.dev, OpenAI, Blob storage) introduce additional environment variables as those services come online.
