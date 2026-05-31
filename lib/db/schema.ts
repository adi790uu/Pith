import {
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid
} from "drizzle-orm/pg-core";

export const linkPackStatus = pgEnum("link_pack_status", [
  "draft",
  "queued",
  "extracting",
  "generating",
  "ready",
  "failed"
]);

export const jobStepStatus = pgEnum("job_step_status", [
  "pending",
  "running",
  "done",
  "failed"
]);

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull(),
  name: text("name"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
});

export const linkPacks = pgTable("link_packs", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  title: text("title").notNull(),
  description: text("description"),
  status: linkPackStatus("status").default("draft").notNull(),
  progress: integer("progress").default(0).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull()
});

export const sourceLinks = pgTable("source_links", {
  id: uuid("id").defaultRandom().primaryKey(),
  linkPackId: uuid("link_pack_id")
    .notNull()
    .references(() => linkPacks.id),
  url: text("url").notNull(),
  title: text("title"),
  status: jobStepStatus("status").default("pending").notNull(),
  extractedContent: jsonb("extracted_content"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
});

export const jobRuns = pgTable("job_runs", {
  id: uuid("id").defaultRandom().primaryKey(),
  linkPackId: uuid("link_pack_id")
    .notNull()
    .references(() => linkPacks.id),
  providerRunId: text("provider_run_id"),
  status: linkPackStatus("status").default("queued").notNull(),
  steps: jsonb("steps").notNull(),
  error: text("error"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull()
});

export const documents = pgTable("documents", {
  id: uuid("id").defaultRandom().primaryKey(),
  linkPackId: uuid("link_pack_id")
    .notNull()
    .references(() => linkPacks.id),
  blocks: jsonb("blocks").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull()
});

export const pdfExports = pgTable("pdf_exports", {
  id: uuid("id").defaultRandom().primaryKey(),
  linkPackId: uuid("link_pack_id")
    .notNull()
    .references(() => linkPacks.id),
  fileUrl: text("file_url").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
});
