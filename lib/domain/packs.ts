import { z } from "zod";

export const linkPackStatusSchema = z.enum([
  "draft",
  "queued",
  "extracting",
  "generating",
  "ready",
  "failed"
]);

export const jobStepStatusSchema = z.enum(["pending", "running", "done", "failed"]);

export const sourceLinkSchema = z.object({
  id: z.string(),
  url: z.string().url(),
  title: z.string().optional(),
  status: jobStepStatusSchema,
  addedAt: z.string()
});

export const jobStepSchema = z.object({
  id: z.string(),
  label: z.string(),
  status: jobStepStatusSchema,
  detail: z.string()
});

export const linkPackSchema = z.object({
  id: z.string(),
  userId: z.string(),
  title: z.string().min(1),
  description: z.string().optional(),
  status: linkPackStatusSchema,
  progress: z.number().min(0).max(100),
  sourceLinks: z.array(sourceLinkSchema),
  jobSteps: z.array(jobStepSchema),
  createdAt: z.string(),
  updatedAt: z.string()
});

export type LinkPackStatus = z.infer<typeof linkPackStatusSchema>;
export type JobStepStatus = z.infer<typeof jobStepStatusSchema>;
export type SourceLink = z.infer<typeof sourceLinkSchema>;
export type JobStep = z.infer<typeof jobStepSchema>;
export type LinkPack = z.infer<typeof linkPackSchema>;

export const phaseOneJobSteps: JobStep[] = [
  {
    id: "validate",
    label: "Validate sources",
    status: "pending",
    detail: "Confirm submitted blog links are reachable and supported."
  },
  {
    id: "extract",
    label: "Extract article content",
    status: "pending",
    detail: "Capture readable text, headings, metadata, and candidate images."
  },
  {
    id: "plan",
    label: "Plan notes structure",
    status: "pending",
    detail: "Create the learning path, section outline, and diagram plan."
  },
  {
    id: "draft",
    label: "Draft editable notes",
    status: "pending",
    detail: "Generate rich editable blocks for review before PDF export."
  },
  {
    id: "export",
    label: "Prepare PDF export",
    status: "pending",
    detail: "Render the final report layout and export history."
  }
];

export const samplePacks: LinkPack[] = [
  {
    id: "pack-ai-agents",
    userId: "dev-user",
    title: "AI Agent Architecture Research",
    description: "A study pack for planning agent workflows, tools, memory, and evaluation.",
    status: "generating",
    progress: 56,
    sourceLinks: [
      {
        id: "src-1",
        url: "https://openai.github.io/openai-agents-js/",
        title: "OpenAI Agents SDK TypeScript",
        status: "done",
        addedAt: "2026-05-31T08:00:00.000Z"
      },
      {
        id: "src-2",
        url: "https://vercel.com/kb/guide/ai-agents",
        title: "AI Agents on Vercel",
        status: "running",
        addedAt: "2026-05-31T08:04:00.000Z"
      }
    ],
    jobSteps: [
      { ...phaseOneJobSteps[0], status: "done" },
      { ...phaseOneJobSteps[1], status: "running" },
      phaseOneJobSteps[2],
      phaseOneJobSteps[3],
      phaseOneJobSteps[4]
    ],
    createdAt: "2026-05-31T08:00:00.000Z",
    updatedAt: "2026-05-31T08:16:00.000Z"
  },
  {
    id: "pack-distributed-systems",
    userId: "dev-user",
    title: "Distributed Systems Primer",
    description: "Consensus, replication, queues, and failure modes explained from long-form posts.",
    status: "ready",
    progress: 100,
    sourceLinks: [
      {
        id: "src-3",
        url: "https://example.com/consensus",
        title: "Consensus Basics",
        status: "done",
        addedAt: "2026-05-29T10:30:00.000Z"
      },
      {
        id: "src-4",
        url: "https://example.com/queues",
        title: "Queue Design Patterns",
        status: "done",
        addedAt: "2026-05-29T10:32:00.000Z"
      }
    ],
    jobSteps: phaseOneJobSteps.map((step) => ({ ...step, status: "done" })),
    createdAt: "2026-05-29T10:30:00.000Z",
    updatedAt: "2026-05-29T11:10:00.000Z"
  }
];

export function getStatusLabel(status: LinkPackStatus) {
  const labels: Record<LinkPackStatus, string> = {
    draft: "Draft",
    queued: "Queued",
    extracting: "Extracting",
    generating: "Generating",
    ready: "Ready",
    failed: "Failed"
  };

  return labels[status];
}
