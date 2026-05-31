# Pith

Pith turns blog links into structured, editable study notes and beautifully rendered PDFs.

## Phase 1

This repository currently implements the foundation UI:

- Next.js App Router TypeScript scaffold
- Dashboard for creating multi-link packs
- Pack detail page with source list, job status, editor preview, and PDF action placeholder
- Shared domain models for packs, sources, and job steps
- Drizzle schema for the planned authenticated project database

The app runs in dev mode without external service keys. Clerk, Neon, Trigger.dev, Blob storage, OpenAI agents, ingestion, generation, editing, and PDF rendering are planned follow-up phases.

## Development

```bash
npm install
npm run dev
```

Then open `http://localhost:3000/dashboard`.
