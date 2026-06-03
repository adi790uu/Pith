import { logger, task } from "@trigger.dev/sdk/v3";
import { extractArticle } from "@/lib/extraction/article";
import {
  listSourceLinksForPack,
  persistExtractedSource,
  setPackStatus,
  setSourceStatus
} from "@/lib/repositories/packs";

export type ExtractPackPayload = {
  packId: string;
};

export const extractPackSources = task({
  id: "extract-pack-sources",
  maxDuration: 600,
  run: async (payload: ExtractPackPayload) => {
    const { packId } = payload;
    logger.info("Starting source extraction", { packId });

    const sources = await listSourceLinksForPack(packId);
    if (sources.length === 0) {
      logger.warn("Pack has no sources to extract", { packId });
      await setPackStatus(packId, "draft", 0);
      return { packId, processed: 0, failed: 0 };
    }

    await setPackStatus(packId, "extracting", 12);

    let processed = 0;
    let failed = 0;
    const total = sources.length;

    for (const [index, source] of sources.entries()) {
      const progressBase = 12;
      const progressRange = 38;
      const progressBefore = Math.round(
        progressBase + (index / total) * progressRange
      );
      await setPackStatus(packId, "extracting", progressBefore);
      await setSourceStatus(source.id, "running");

      try {
        const extracted = await extractArticle(source.url);
        await persistExtractedSource({
          sourceId: source.id,
          title: extracted.title,
          extractedContent: extracted
        });
        processed += 1;
        logger.info("Extracted source", {
          packId,
          sourceId: source.id,
          wordCount: extracted.wordCount
        });
      } catch (error) {
        failed += 1;
        const message = error instanceof Error ? error.message : String(error);
        logger.error("Failed to extract source", {
          packId,
          sourceId: source.id,
          url: source.url,
          message
        });
        await setSourceStatus(source.id, "failed");
      }
    }

    if (processed === 0) {
      await setPackStatus(packId, "failed", 0);
      return { packId, processed, failed };
    }

    await setPackStatus(packId, "generating", 55);
    logger.info("Source extraction complete", { packId, processed, failed });
    return { packId, processed, failed };
  }
});
