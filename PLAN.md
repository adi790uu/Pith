# PLAN.md: Pith Next Phases

  ## Summary

  Create PLAN.md at the repo root to turn the
  README’s Phase 1 status into an implementation
  roadmap for the next phases. The plan should keep
  Phase 1 as complete, then define Phase 2 through
  Phase 6 with concrete outcomes, acceptance
  criteria, and implementation order.

  ## Phase Roadmap

  - Phase 2: Persistence and Auth
      - Add real authenticated users using Clerk.
      - Connect the existing Drizzle schema to Neon/
        Postgres.

      - Replace dashboard/sample data with database-
        backed link packs and source links.

      - Add create-pack server flow from the modal,
        including validation and persisted source
        rows.

      - Acceptance: reloads preserve packs, users
        only see their packs, and create-pack works
        without local mock state.

  - Phase 3: Source Ingestion Jobs
      - Add Trigger.dev job orchestration for queued
        packs.

      - Validate URLs, fetch article pages, extract
        readable content, title, metadata, and
        possible image references.

      - Persist extracted content into
        source_links.extracted_content.

      - Update pack/job statuses through queued,
        extracting, generating, ready, and failed.

      - Acceptance: creating a pack with links starts
        a job and the dashboard/detail pages reflect
        live job progress.

  - Phase 4: AI Study Pack Generation
      - Use OpenAI agents or structured generation to
        convert extracted sources into editable
        document blocks.

      - Store generated blocks in documents.blocks.
      - Include section headings, explanations,
        summaries, examples, citations/source
        references, and diagram placeholders.

      - Acceptance: a completed pack has a structured
        notes draft visible on the pack detail page.

  - Phase 5: Editor Experience
      - Replace the static editor preview with real
        document editing.

      - Support editing text blocks, reordering
        sections, removing blocks, and regenerating
        selected blocks.

      - Preserve source visibility and citations
        while editing.

      - Acceptance: users can modify a generated
        study pack and save the edited document.

  - Phase 6: PDF Export and Storage
      - Render edited documents into polished PDFs.
      - Store generated PDFs in Blob storage.
      - Track exports in pdf_exports and enable the
        existing Export PDF button.

      - Acceptance: ready packs can export and
        download a designed PDF, with export history
        persisted.

  ## Implementation Notes

  - Keep the current UI direction: minimal, premium
    dashboard, modal-based pack creation, and
    operational pack detail pages.

  - Reuse the existing Drizzle tables first; only
    extend schema when a phase proves a missing field
    is necessary.

  - Keep status names aligned with the existing
    domain model and database enum.

  - Prefer server actions or route handlers for
    mutations, then Trigger.dev for async ingestion/
    generation work.

  - Keep local dev usable without all external
    services by documenting required env vars per
    phase.

  ## Test Plan

  - Unit-test domain validation for packs, source
    links, job statuses, and document block parsing
    once real data is introduced.

  - Add integration tests for pack creation,
    authenticated data access, and status
    transitions.

  - Add job tests with mocked fetch/extraction/OpenAI
    calls for success and failure paths.

  - Add UI tests for dashboard empty state, pack
    creation modal, pack ledger updates, pack detail
    status display, editor save flow, and PDF export
    availability.

  - Run npm run lint, npm run typecheck, and relevant
    integration tests before marking each phase
    complete.

  ## Assumptions

  - PLAN.md should be a product and engineering
    roadmap, not a detailed sprint tracker.

  - The service choices listed in README.md are the
    intended defaults: Clerk, Neon, Trigger.dev, Blob
    storage, and OpenAI.

  - Phase 2 should come before ingestion/generation
    because persistence and user ownership are
    prerequisites for reliable background jobs.

  - Existing mock/sample data should remain only as
    temporary fallback or test fixtures after
    database wiring is introduced.
