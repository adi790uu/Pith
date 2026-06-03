# Pith

Pith turns blog links into structured, editable study notes and beautifully rendered PDFs.

## Phase 1

Foundation UI: Next.js App Router scaffold, dashboard, pack detail, Drizzle schema, shared domain models.

## Phase 2

Persistence and authentication wired:

- Clerk authentication with sign-in, sign-up, and protected dashboard routes
- Drizzle ORM connected to Neon Postgres
- Dashboard and pack detail pages are database-backed and scoped to the signed-in user
- Create-pack server action with Zod validation and persisted source rows

## Phase 3 (current)

Source ingestion via Trigger.dev:

- `extract-pack-sources` Trigger.dev task fetches each URL, parses readable content, title, metadata, and image references
- Extracted payload persisted on `source_links.extracted_content`
- Pack status transitions through `queued → extracting → generating` (or `failed`) as the job runs
- Dashboard and pack detail poll for live status while a pack is in a non-terminal state

## Development

```bash
npm install
npm run dev
# In a second terminal (Phase 3+), start the Trigger.dev dev runner:
npx trigger.dev@latest dev
```

Then open `http://localhost:3000/dashboard`.

### Required environment variables

Create `.env.local` at the repo root:

```bash
# Clerk — https://dashboard.clerk.com
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Neon — https://console.neon.tech
DATABASE_URL=postgres://...neon.tech/neondb?sslmode=require

# Trigger.dev — https://cloud.trigger.dev
TRIGGER_SECRET_KEY=tr_dev_...
TRIGGER_PROJECT_REF=proj_...
```

If `TRIGGER_SECRET_KEY` is unset, the create-pack action skips enqueueing and the pack stays `queued`. Set it and run `npx trigger.dev@latest dev` for ingestion to actually run.

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

### Trigger.dev

Tasks live in `trigger/` and are registered through `trigger.config.ts`. `TRIGGER_PROJECT_REF` should match the project you created at https://cloud.trigger.dev.

```bash
# Run tasks locally (watches for changes)
npx trigger.dev@latest dev

# Deploy tasks to the production environment
npx trigger.dev@latest deploy
```

Phase 4 and beyond (OpenAI generation, editing, Blob storage, PDF export) will introduce additional environment variables as those services come online.
