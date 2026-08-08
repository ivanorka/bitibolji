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

const croatianEditorialMarkers = /\b(?:cilj|poruk|rezultat|zaklju|važn|učenic|mlad|projekt|poduzet|iskustv|znanj|obrazov|pobjed|nagrad|istak|naglas|pokaz|uspjeh|budućnost)\p{L}*/iu;

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

function speechTokens(value: string) {
  return new Set(
    decodeHtmlEntities(value)
      .toLocaleLowerCase("hr")
      .match(/[\p{L}\p{N}]{4,}/gu) ?? [],
  );
}

function hasStrongOverlap(left: string, right: string) {
  const leftTokens = speechTokens(left);
  const rightTokens = speechTokens(right);
  if (leftTokens.size < 4 || rightTokens.size < 4) return false;

  let shared = 0;
  for (const token of leftTokens) {
    if (rightTokens.has(token)) shared += 1;
  }

  return shared / Math.min(leftTokens.size, rightTokens.size) >= 0.72
    && shared / Math.max(leftTokens.size, rightTokens.size) >= 0.55;
}

function fitWholeSentences(value: string, budget: number) {
  if (value.length <= budget) return value;
  const sentences = value.match(/[^.!?…]+(?:[.!?…]+["”»]?|$)/gu) ?? [value];
  let result = "";

  for (const sentence of sentences) {
    const next = `${result} ${sentence.trim()}`.trim();
    if (next.length > budget) break;
    result = next;
  }

  return result.length >= 140 ? result : "";
}

function editorialCroatianArticleBlocks(article: Article) {
  const [, ...extractedContent] = automaticArticleBlocks(article);
  const rawContent = extractedContent.reduce<string[]>((blocks, text) => {
    const previous = blocks.at(-1);
    if (previous && /^[\p{Ll}]/u.test(decodeHtmlEntities(text)) && /[,;:]\s*$/u.test(decodeHtmlEntities(previous))) {
      blocks[blocks.length - 1] = `${previous} ${text}`;
    } else {
      blocks.push(text);
    }
    return blocks;
  }, []);
  if (rawContent.length <= 2) return [article.title, ...rawContent];

  const rawDescription = article.description.replace(/\s+/gu, " ").trim();
  const description = /(?:\.{2,}|…)$/u.test(rawDescription)
    || /\b(?:i|ili|o|od|do|u|na|za|koji|koja|koje|kako|da)\.?$/iu.test(rawDescription)
    ? ""
    : rawDescription;
  const content = rawContent
    .map((text, index) => ({ index, text: decodeHtmlEntities(text) }))
    .filter(({ text }) => !(text.length < 180 && /^[\p{Ll}]/u.test(text)))
    .filter(({ text }) => !description || !hasStrongOverlap(text, description));
  const originalLength = content.reduce((total, block) => total + block.text.length, 0);
  const targetLength = Math.min(
    originalLength,
    Math.max(850, Math.min(2_200, Math.round(originalLength * 0.5))),
  );
  const scored = content.map((block) => {
    const position = block.index / Math.max(1, rawContent.length - 1);
    let score = 1;
    if (block.index <= 1) score += 7 - block.index;
    if (position > 0.82) score += 3;
    if (/[“„"].{20,}[”"]?/u.test(block.text)) score += 4;
    if (croatianEditorialMarkers.test(block.text)) score += 2;
    if (block.text.length >= 90 && block.text.length <= 750) score += 2;
    if (block.text.length < 90) score += 0.5;
    return { ...block, score };
  }).sort((left, right) => right.score - left.score || left.index - right.index);

  const selected = new Map<number, string>();
  let selectedLength = description.length;

  for (const block of scored) {
    if (selectedLength >= targetLength) break;
    if ([...selected.values()].some((value) => hasStrongOverlap(block.text, value))) continue;

    const remaining = targetLength - selectedLength;
    const fitted = fitWholeSentences(block.text, remaining + 140);
    if (!fitted) continue;
    selected.set(block.index, fitted);
    selectedLength += fitted.length;
  }

  const selectedContent = [...selected.entries()]
    .sort(([left], [right]) => left - right)
    .map(([, text]) => text);

  return [
    article.title,
    ...(description ? [description] : []),
    ...selectedContent,
  ];
}

export function getArticleAudioText(article: Article, locale: AudioTextLocale = "hr") {
  const curated = locale === "hr" ? curatedNarrations[article.slug] : undefined;
  const blocks = curated
    ? [article.title, curated]
    : locale === "hr"
      ? editorialCroatianArticleBlocks(article)
      : automaticArticleBlocks(article);

  return normalizeSpeechBlocks(blocks, locale);
}

export function getArticleAudioNarrationMode(article: Article, locale: AudioTextLocale = "hr") {
  if (locale !== "hr") return "automatic";
  return curatedNarrations[article.slug] ? "curated" : "editorial";
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
