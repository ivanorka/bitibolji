import { createHash } from "node:crypto";

import type { Article } from "@/lib/articles";
import {
  AUDIO_TEXT_NORMALIZATION_VERSION,
  type AudioTextLocale,
  normalizeArticleSpeechText,
  stripPaymentDetailsBlocks,
} from "@/lib/audio-text-normalize";

export type AudioVoiceProfile = "vlado" | "mirjana";

const MAX_CHUNK_LENGTH = 8_500;
const AUDIO_PIPELINE_VERSION = "elevenlabs-v3";

const voiceSettings = {
  vlado: { stability: 0.58, similarity_boost: 0.82, style: 0.12, use_speaker_boost: true, speed: 0.96 },
  mirjana: { stability: 0.54, similarity_boost: 0.82, style: 0.16, use_speaker_boost: true, speed: 0.98 },
} as const;

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

function articleText(article: Article, locale: AudioTextLocale) {
  const content = stripPaymentDetailsBlocks(article.content)
    .replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/giu, " ")
    .replace(/<(?:br\s*\/?>|\/(?:p|div|h[1-6]|li|blockquote|figcaption|figure))>/giu, ". ")
    .replace(/<[^>]+>/gu, " ");

  return normalizeArticleSpeechText(decodeHtmlEntities(`${article.title}. ${content}`), locale)
    .replace(/\s+([,.;:!?])/gu, "$1")
    .replace(/\.{2,}/gu, ".")
    .replace(/\s+/gu, " ")
    .trim();
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
  return splitLongText(articleText(article, locale), MAX_CHUNK_LENGTH);
}

export function getArticleAudioVersion(article: Article, locale: AudioTextLocale = "hr") {
  const fingerprint = [
    AUDIO_PIPELINE_VERSION,
    AUDIO_TEXT_NORMALIZATION_VERSION,
    locale,
    articleText(article, locale),
    process.env.ELEVENLABS_MODEL_ID || "eleven_multilingual_v2",
    process.env.ELEVENLABS_VLADO_VOICE_ID || "",
    process.env.ELEVENLABS_MIRJANA_VOICE_ID || "",
    JSON.stringify(voiceSettings),
  ].join("\u0000");

  return createHash("sha256").update(fingerprint).digest("hex").slice(0, 16);
}

export function getElevenLabsVoiceSettings(profile: AudioVoiceProfile) {
  return voiceSettings[profile];
}

export function getElevenLabsVoiceId(profile: AudioVoiceProfile) {
  return profile === "vlado"
    ? process.env.ELEVENLABS_VLADO_VOICE_ID
    : process.env.ELEVENLABS_MIRJANA_VOICE_ID;
}

export function isElevenLabsAudioReady() {
  return Boolean(
    process.env.ELEVENLABS_API_KEY
    && process.env.ELEVENLABS_VLADO_VOICE_ID
    && process.env.ELEVENLABS_MIRJANA_VOICE_ID,
  );
}
