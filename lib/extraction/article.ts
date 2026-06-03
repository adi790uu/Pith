import * as cheerio from "cheerio";
import type { Element } from "domhandler";

export type ExtractedImage = {
  url: string;
  alt?: string;
};

export type ExtractedArticle = {
  url: string;
  title: string;
  byline?: string;
  siteName?: string;
  description?: string;
  publishedAt?: string;
  content: string;
  excerpt: string;
  wordCount: number;
  language?: string;
  images: ExtractedImage[];
  extractedAt: string;
};

const FETCH_TIMEOUT_MS = 15_000;
const MAX_BYTES = 4 * 1024 * 1024;
const USER_AGENT =
  "Mozilla/5.0 (compatible; PithBot/0.1; +https://pith.local/bot)";
const NON_CONTENT_TAGS = [
  "script",
  "style",
  "noscript",
  "iframe",
  "svg",
  "form",
  "nav",
  "header",
  "footer",
  "aside",
  "button",
  "input"
];

export function isFetchableUrl(input: string): boolean {
  try {
    const parsed = new URL(input);
    return parsed.protocol === "https:" || parsed.protocol === "http:";
  } catch {
    return false;
  }
}

async function fetchHtml(url: string): Promise<string> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      redirect: "follow",
      headers: {
        "user-agent": USER_AGENT,
        accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "accept-language": "en-US,en;q=0.9"
      }
    });

    if (!response.ok) {
      throw new Error(`Fetch failed with status ${response.status}`);
    }

    const contentType = response.headers.get("content-type") ?? "";
    if (!/text\/html|application\/xhtml/i.test(contentType)) {
      throw new Error(`Unsupported content-type: ${contentType || "unknown"}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      return await response.text();
    }

    const chunks: Uint8Array[] = [];
    let received = 0;
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      if (value) {
        received += value.byteLength;
        if (received > MAX_BYTES) {
          await reader.cancel();
          throw new Error(`Document exceeds ${MAX_BYTES} bytes`);
        }
        chunks.push(value);
      }
    }

    const buffer = new Uint8Array(received);
    let offset = 0;
    for (const chunk of chunks) {
      buffer.set(chunk, offset);
      offset += chunk.byteLength;
    }
    return new TextDecoder("utf-8").decode(buffer);
  } finally {
    clearTimeout(timer);
  }
}

function pickMeta(
  $: cheerio.CheerioAPI,
  selectors: string[]
): string | undefined {
  for (const selector of selectors) {
    const value = $(selector).attr("content")?.trim();
    if (value) return value;
  }
  return undefined;
}

function resolveUrl(base: string, candidate?: string): string | undefined {
  if (!candidate) return undefined;
  try {
    return new URL(candidate, base).toString();
  } catch {
    return undefined;
  }
}

function scoreNode(
  $: cheerio.CheerioAPI,
  node: Element
): number {
  const element = $(node);
  const text = element.text().trim();
  if (text.length < 200) return 0;

  const paragraphCount = element.find("p").length;
  const linkText = element.find("a").text().length;
  const textLength = text.length;
  const linkDensity = textLength === 0 ? 1 : linkText / textLength;

  const classId = `${element.attr("class") ?? ""} ${element.attr("id") ?? ""}`;
  const positiveBoost = /(article|content|main|post|story|body|entry)/i.test(
    classId
  )
    ? 80
    : 0;
  const negativePenalty = /(comment|sidebar|footer|nav|share|promo|ad-)/i.test(
    classId
  )
    ? 80
    : 0;

  return paragraphCount * 12 + textLength / 80 + positiveBoost - negativePenalty - linkDensity * 200;
}

function pickArticleRoot($: cheerio.CheerioAPI): cheerio.Cheerio<Element> {
  const direct = $("article").first();
  if (direct.length > 0 && direct.text().trim().length > 200) {
    return direct;
  }

  let bestNode: Element | null = null;
  let bestScore = -Infinity;

  $("article, main, section, div").each((_, node) => {
    const score = scoreNode($, node);
    if (score > bestScore) {
      bestScore = score;
      bestNode = node;
    }
  });

  if (bestNode) {
    return $(bestNode);
  }

  return $("body");
}

function cleanRoot(root: cheerio.Cheerio<Element>) {
  root.find(NON_CONTENT_TAGS.join(",")).remove();
}

function extractParagraphs(
  root: cheerio.Cheerio<Element>
): string[] {
  const blocks: string[] = [];
  root.find("p, h1, h2, h3, h4, li, blockquote, pre").each((_, node) => {
    const text = root
      .find(node)
      .add(node)
      .first()
      .text()
      .replace(/\s+/g, " ")
      .trim();
    if (text.length > 0) {
      blocks.push(text);
    }
  });
  return blocks;
}

function extractImages(
  $: cheerio.CheerioAPI,
  root: cheerio.Cheerio<Element>,
  baseUrl: string
): ExtractedImage[] {
  const seen = new Set<string>();
  const images: ExtractedImage[] = [];
  root.find("img").each((_, node) => {
    const element = $(node);
    const src =
      element.attr("src") ??
      element.attr("data-src") ??
      element.attr("data-original");
    const resolved = resolveUrl(baseUrl, src);
    if (!resolved || seen.has(resolved)) return;
    seen.add(resolved);
    images.push({
      url: resolved,
      alt: element.attr("alt")?.trim() || undefined
    });
  });
  return images.slice(0, 10);
}

export async function extractArticle(url: string): Promise<ExtractedArticle> {
  if (!isFetchableUrl(url)) {
    throw new Error(`Unsupported URL: ${url}`);
  }

  const html = await fetchHtml(url);
  const $ = cheerio.load(html);

  const docTitle =
    pickMeta($, [
      'meta[property="og:title"]',
      'meta[name="twitter:title"]'
    ]) ??
    $("title").first().text().trim() ??
    url;

  const description = pickMeta($, [
    'meta[property="og:description"]',
    'meta[name="twitter:description"]',
    'meta[name="description"]'
  ]);

  const siteName = pickMeta($, ['meta[property="og:site_name"]']);
  const byline = pickMeta($, [
    'meta[name="author"]',
    'meta[property="article:author"]'
  ]);
  const publishedAt = pickMeta($, [
    'meta[property="article:published_time"]',
    'meta[name="article:published_time"]',
    'meta[name="date"]'
  ]);
  const language = $("html").attr("lang") || undefined;

  const root = pickArticleRoot($);
  cleanRoot(root);
  const paragraphs = extractParagraphs(root);
  const content = paragraphs.join("\n\n");
  const wordCount = content.split(/\s+/).filter(Boolean).length;
  const excerpt =
    description ??
    paragraphs[0]?.slice(0, 280) ??
    content.slice(0, 280);

  const images = extractImages($, root, url);
  const heroImage = pickMeta($, [
    'meta[property="og:image"]',
    'meta[name="twitter:image"]'
  ]);
  const resolvedHero = resolveUrl(url, heroImage);
  if (resolvedHero && !images.some((img) => img.url === resolvedHero)) {
    images.unshift({ url: resolvedHero });
  }

  if (wordCount < 40) {
    throw new Error("Could not extract enough readable content from page");
  }

  return {
    url,
    title: docTitle.length > 0 ? docTitle : url,
    byline,
    siteName,
    description,
    publishedAt,
    content,
    excerpt,
    wordCount,
    language,
    images: images.slice(0, 8),
    extractedAt: new Date().toISOString()
  };
}
