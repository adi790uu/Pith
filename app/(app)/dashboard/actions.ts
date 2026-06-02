"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { createPack } from "@/lib/repositories/packs";

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

  revalidatePath("/dashboard");

  return { ok: true, packId: pack.id };
}
