import { and, desc, eq, inArray } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { linkPacks, sourceLinks } from "@/lib/db/schema";
import {
  type JobStep,
  type JobStepStatus,
  type LinkPack,
  type LinkPackStatus,
  type SourceLink,
  phaseOneJobSteps
} from "@/lib/domain/packs";

const TERMINAL_PACK_STATUSES: LinkPackStatus[] = ["ready", "failed", "draft"];

export function isTerminalPackStatus(status: LinkPackStatus): boolean {
  return TERMINAL_PACK_STATUSES.includes(status);
}

type LinkPackRow = typeof linkPacks.$inferSelect;
type SourceLinkRow = typeof sourceLinks.$inferSelect;

function mapSourceLink(row: SourceLinkRow): SourceLink {
  return {
    id: row.id,
    url: row.url,
    title: row.title ?? undefined,
    status: row.status,
    addedAt: row.createdAt.toISOString()
  };
}

function deriveJobSteps(pack: LinkPackRow, sources: SourceLinkRow[]): JobStep[] {
  const hasSources = sources.length > 0;
  const allDone = hasSources && sources.every((source) => source.status === "done");

  return phaseOneJobSteps.map((step, index) => {
    if (pack.status === "ready" || allDone) {
      return { ...step, status: "done" };
    }
    if (pack.status === "failed") {
      return { ...step, status: index === 0 ? "failed" : "pending" };
    }
    if (pack.status === "queued" && index === 0) {
      return { ...step, status: "running" };
    }
    if (pack.status === "extracting") {
      if (index === 0) return { ...step, status: "done" };
      if (index === 1) return { ...step, status: "running" };
    }
    if (pack.status === "generating") {
      if (index <= 1) return { ...step, status: "done" };
      if (index === 2) return { ...step, status: "running" };
    }
    return { ...step };
  });
}

function mapPack(pack: LinkPackRow, sources: SourceLinkRow[]): LinkPack {
  return {
    id: pack.id,
    userId: pack.userId,
    title: pack.title,
    description: pack.description ?? undefined,
    status: pack.status,
    progress: pack.progress,
    sourceLinks: sources.map(mapSourceLink),
    jobSteps: deriveJobSteps(pack, sources),
    createdAt: pack.createdAt.toISOString(),
    updatedAt: pack.updatedAt.toISOString()
  };
}

export async function listPacksForUser(userId: string): Promise<LinkPack[]> {
  const packs = await db
    .select()
    .from(linkPacks)
    .where(eq(linkPacks.userId, userId))
    .orderBy(desc(linkPacks.createdAt));

  if (packs.length === 0) {
    return [];
  }

  const sources = await db
    .select()
    .from(sourceLinks)
    .where(
      inArray(
        sourceLinks.linkPackId,
        packs.map((pack) => pack.id)
      )
    );

  const sourcesByPack = new Map<string, SourceLinkRow[]>();
  for (const source of sources) {
    const list = sourcesByPack.get(source.linkPackId) ?? [];
    list.push(source);
    sourcesByPack.set(source.linkPackId, list);
  }

  return packs.map((pack) => mapPack(pack, sourcesByPack.get(pack.id) ?? []));
}

export async function getPackForUser(
  packId: string,
  userId: string
): Promise<LinkPack | null> {
  const [pack] = await db
    .select()
    .from(linkPacks)
    .where(and(eq(linkPacks.id, packId), eq(linkPacks.userId, userId)))
    .limit(1);

  if (!pack) {
    return null;
  }

  const sources = await db
    .select()
    .from(sourceLinks)
    .where(eq(sourceLinks.linkPackId, pack.id));

  return mapPack(pack, sources);
}

export type CreatePackInput = {
  userId: string;
  title: string;
  description?: string;
  urls: string[];
};

export async function getPackById(packId: string): Promise<LinkPack | null> {
  const [pack] = await db
    .select()
    .from(linkPacks)
    .where(eq(linkPacks.id, packId))
    .limit(1);

  if (!pack) return null;

  const sources = await db
    .select()
    .from(sourceLinks)
    .where(eq(sourceLinks.linkPackId, pack.id));

  return mapPack(pack, sources);
}

export async function listSourceLinksForPack(
  packId: string
): Promise<Array<{ id: string; url: string }>> {
  const rows = await db
    .select({ id: sourceLinks.id, url: sourceLinks.url })
    .from(sourceLinks)
    .where(eq(sourceLinks.linkPackId, packId));
  return rows;
}

export async function setPackStatus(
  packId: string,
  status: LinkPackStatus,
  progress?: number
): Promise<void> {
  await db
    .update(linkPacks)
    .set({
      status,
      ...(typeof progress === "number" ? { progress } : {}),
      updatedAt: new Date()
    })
    .where(eq(linkPacks.id, packId));
}

export async function setSourceStatus(
  sourceId: string,
  status: JobStepStatus
): Promise<void> {
  await db
    .update(sourceLinks)
    .set({ status })
    .where(eq(sourceLinks.id, sourceId));
}

export async function persistExtractedSource(input: {
  sourceId: string;
  title?: string;
  extractedContent: unknown;
}): Promise<void> {
  await db
    .update(sourceLinks)
    .set({
      status: "done",
      title: input.title,
      extractedContent: input.extractedContent
    })
    .where(eq(sourceLinks.id, input.sourceId));
}

export async function createPack(input: CreatePackInput): Promise<LinkPack> {
  const hasLinks = input.urls.length > 0;
  const status = hasLinks ? "queued" : "draft";
  const progress = hasLinks ? 8 : 0;

  const [pack] = await db
    .insert(linkPacks)
    .values({
      userId: input.userId,
      title: input.title,
      description: input.description,
      status,
      progress
    })
    .returning();

  let insertedSources: SourceLinkRow[] = [];
  if (hasLinks) {
    insertedSources = await db
      .insert(sourceLinks)
      .values(
        input.urls.map((url) => ({
          linkPackId: pack.id,
          url
        }))
      )
      .returning();
  }

  return mapPack(pack, insertedSources);
}
