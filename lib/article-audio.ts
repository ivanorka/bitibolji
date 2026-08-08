import { createHash } from "node:crypto";

import narrationManifest from "@/content/audio-narrations.json";
import type { Article } from "@/lib/articles";
import {
  AUDIO_TEXT_NORMALIZATION_VERSION,
  type AudioTextLocale,
  normalizeArticleSpeechText,
  stripNonNarrativeBlocks,
} from "@/lib/audio-text-normalize";

export type AudioVoiceProfile = "vlado";

const MAX_CHUNK_LENGTH = 8_500;
const AUDIO_PIPELINE_VERSION = "elevenlabs-v4-spoken-editorial";
const AUDIO_NARRATION_VERSION = narrationManifest.version;

const voiceSettings = {
  stability: 0.52,
  similarity_boost: 0.8,
  style: 0.05,
  use_speaker_boost: true,
  speed: 0.97,
} as const;

const curatedNarrations = narrationManifest.narrations as Record<string, string>;

const namedEntities: Record<string, string> = {
  amp: "&",
  apos: "'",
  bull: " • ",
  gt: ">",
  hellip: "…",
  laquo: "“",
  ldquo: "“",
  lsquo: "‘",
  lt: "<",
  mdash: "—",
  nbsp: " ",
  ndash: "–",
  quot: '"',
  raquo: "”",
  rdquo: "”",
  rsquo: "’",
};

function decodeHtmlEntities(value: string) {
  return value
    .replace(/&#x([0-9a-f]+);/giu, (_, hex: string) => String.fromCodePoint(Number.parseInt(hex, 16)))
    .replace(/&#([0-9]+);/gu, (_, decimal: string) => String.fromCodePoint(Number.parseInt(decimal, 10)))
    .replace(/&([a-z]+);/giu, (entity, name: string) => namedEntities[name.toLocaleLowerCase()] ?? entity);
}

function normalizeSpeechBlocks(blocks: string[], locale: AudioTextLocale) {
  const seen = new Set<string>();

  return blocks
    .map((block) => normalizeArticleSpeechText(decodeHtmlEntities(block), locale))
    .map((block) => {
      if (!block || /[.!?…]["'’”»]?$/u.test(block)) return block;
      return /["'’”»]$/u.test(block) ? block.replace(/(["'’”»])$/u, ".$1") : `${block}.`;
    })
    .filter((block) => {
      if (!block) return false;
      const duplicateKey = block.toLocaleLowerCase(locale === "hr" ? "hr" : "en")
        .replace(/[^\p{L}\p{N}]+/gu, " ")
        .trim();
      if (!duplicateKey || seen.has(duplicateKey)) return false;
      seen.add(duplicateKey);
      return true;
    })
    .join("\n\n")
    .replace(/\s+([,.;:!?])/gu, "$1")
    .replace(/\.{2,}/gu, ".")
    .trim();
}

function automaticArticleBlocks(article: Article) {
  const blockSeparator = "\u0001";
  const content = stripNonNarrativeBlocks(article.content)
    .replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/giu, " ")
    .replace(/<(?:br\s*\/?>|hr\b[^>]*\/?>|\/(?:p|div|h[1-6]|li|blockquote|cite|figure))>/giu, blockSeparator)
    .replace(/<[^>]+>/gu, " ")
    .split(blockSeparator)
    .map((block) => block.replace(/\s+/gu, " ").trim())
    .filter(Boolean);

  return [article.title, ...content];
}

export function getArticleAudioText(article: Article, locale: AudioTextLocale = "hr") {
  const curated = locale === "hr" ? curatedNarrations[article.slug] : undefined;
  const blocks = curated ? [article.title, curated] : automaticArticleBlocks(article);

  return normalizeSpeechBlocks(blocks, locale);
}

export function getArticleAudioNarrationMode(article: Article, locale: AudioTextLocale = "hr") {
  return locale === "hr" && curatedNarrations[article.slug] ? "curated" : "automatic";
}

function splitLongText(value: string, maxLength: number) {
  const chunks: string[] = [];
  let remaining = value.trim();

  while (remaining.length > maxLength) {
    const candidate = remaining.slice(0, maxLength + 1);
    const sentenceBreak = Math.max(
      candidate.lastIndexOf(". "),
      candidate.lastIndexOf("! "),
      candidate.lastIndexOf("? "),
    );
    const paragraphBreak = candidate.lastIndexOf("; ");
    const wordBreak = candidate.lastIndexOf(" ");
    const breakAt = sentenceBreak > maxLength * 0.55
      ? sentenceBreak + 1
      : paragraphBreak > maxLength * 0.7
        ? paragraphBreak + 1
        : wordBreak;

    if (breakAt <= 0) break;
    chunks.push(remaining.slice(0, breakAt).trim());
    remaining = remaining.slice(breakAt).trim();
  }

  if (remaining) chunks.push(remaining);
  return chunks;
}

export function getArticleAudioChunks(article: Article, locale: AudioTextLocale = "hr") {
  return splitLongText(getArticleAudioText(article, locale), MAX_CHUNK_LENGTH);
}

export function getArticleAudioVersion(article: Article, locale: AudioTextLocale = "hr") {
  const fingerprint = [
    AUDIO_PIPELINE_VERSION,
    AUDIO_TEXT_NORMALIZATION_VERSION,
    AUDIO_NARRATION_VERSION,
    locale,
    getArticleAudioText(article, locale),
    process.env.ELEVENLABS_MODEL_ID || "eleven_multilingual_v2",
    process.env.ELEVENLABS_VLADO_VOICE_ID || "",
    JSON.stringify(voiceSettings),
  ].join("\u0000");

  return createHash("sha256").update(fingerprint).digest("hex").slice(0, 16);
}

export function getElevenLabsVoiceSettings() {
  return voiceSettings;
}

export function getElevenLabsVoiceId() {
  return process.env.ELEVENLABS_VLADO_VOICE_ID;
}

export function isElevenLabsAudioReady() {
  return Boolean(
    process.env.ELEVENLABS_API_KEY
    && process.env.ELEVENLABS_VLADO_VOICE_ID
  );
}
