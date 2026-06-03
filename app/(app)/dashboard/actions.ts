"use server";

import { revalidatePath } from "next/cache";
import { tasks } from "@trigger.dev/sdk/v3";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { createPack, setPackStatus } from "@/lib/repositories/packs";
import type { extractPackSources } from "@/trigger/extract-pack";

const createPackInputSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200),
  description: z
    .string()
    .trim()
    .max(2000)
    .optional()
    .transform((value) => (value && value.length > 0 ? value : undefined)),
  urls: z
    .array(z.string().trim().url("Each link must be a valid URL"))
    .max(20, "At most 20 links per pack")
});

export type CreatePackInput = z.input<typeof createPackInputSchema>;

export type CreatePackResult =
  | { ok: true; packId: string }
  | { ok: false; error: string };

async function enqueueExtraction(packId: string): Promise<void> {
  if (!process.env.TRIGGER_SECRET_KEY) {
    console.warn(
      "TRIGGER_SECRET_KEY not set — pack will stay in queued state until extraction runs."
    );
    return;
  }
  try {
    await tasks.trigger<typeof extractPackSources>("extract-pack-sources", {
      packId
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Failed to enqueue extraction job", { packId, message });
    await setPackStatus(packId, "failed");
  }
}

export async function createPackAction(
  input: CreatePackInput
): Promise<CreatePackResult> {
  const parsed = createPackInputSchema.safeParse(input);

  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input"
    };
  }

  const user = await getCurrentUser();

  const pack = await createPack({
    userId: user.id,
    title: parsed.data.title,
    description: parsed.data.description,
    urls: parsed.data.urls
  });

  if (parsed.data.urls.length > 0) {
    await enqueueExtraction(pack.id);
  }

  revalidatePath("/dashboard");

  return { ok: true, packId: pack.id };
}
