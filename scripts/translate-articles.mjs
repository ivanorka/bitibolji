import { readFile, writeFile } from "node:fs/promises";

const sourcePath = new URL("../content/articles.json", import.meta.url);
const outputPath = new URL("../content/articles-en.json", import.meta.url);
const reportPath = new URL("../content/translation-report.json", import.meta.url);
const separator = "\n[[[BBSEP20260807]]]\n";
const maxBatchCharacters = 2_500;

const source = JSON.parse(await readFile(sourcePath, "utf8"));
const translated = structuredClone(source);
const targets = [];

function protectBrandTerms(value) {
  return value
    .replace(/Biti Bolji/gi, "XQ7720X")
    .replace(/Poduzetnik/g, "XQ7719X")
    .replace(/\bVlado\b/g, "XQ7721X");
}

function restoreBrandTerms(value) {
  return value
    .replace(/XQ7720X/gi, "Biti Bolji")
    .replace(/XQ7719X/gi, "Poduzetnik")
    .replace(/XQ7721X/gi, "Vlado");
}

function escapeHtmlText(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function escapeHtmlAttribute(value) {
  return escapeHtmlText(value).replaceAll('"', "&quot;");
}

function addTarget(sourceText, apply, kind = "plain") {
  if (!sourceText || !/[\p{L}]/u.test(sourceText)) return;

  const leading = sourceText.match(/^\s*/u)?.[0] ?? "";
  const trailing = sourceText.match(/\s*$/u)?.[0] ?? "";
  const text = sourceText.slice(leading.length, sourceText.length - trailing.length);
  const textWithoutEntities = text.replace(/&(?:#[0-9]+|#x[0-9a-f]+|[a-z]+);/giu, "");
  if (!text || !/[\p{L}]/u.test(textWithoutEntities)) return;

  targets.push({ text, kind, apply: (value) => apply(`${leading}${value}${trailing}`) });
}

for (const article of translated.articles) {
  for (const field of ["title", "description", "excerpt", "featuredImageAlt"]) {
    addTarget(article[field], (value) => { article[field] = value; });
  }

  const tokens = article.content.split(/(<[^>]+>)/g);
  for (let index = 0; index < tokens.length; index += 1) {
    const token = tokens[index];

    if (!token.startsWith("<")) {
      addTarget(token, (value) => { tokens[index] = value; }, "html");
      continue;
    }

    const attributes = [...token.matchAll(/\b(alt|title)=(['"])(.*?)\2/giu)];
    for (const match of attributes) {
      const originalAttribute = match[0];
      const attributeName = match[1];
      const quote = match[2];
      const attributeValue = match[3];
      addTarget(attributeValue, (value) => {
        const replacement = `${attributeName}=${quote}${value}${quote}`;
        tokens[index] = tokens[index].replace(originalAttribute, replacement);
      }, "attribute");
    }
  }

  article.content = tokens;
}

const batches = [];
let currentBatch = [];
let currentLength = 0;

for (let index = 0; index < targets.length; index += 1) {
  const protectedText = protectBrandTerms(targets[index].text);
  const addedLength = protectedText.length + (currentBatch.length ? separator.length : 0);
  if (currentBatch.length && currentLength + addedLength > maxBatchCharacters) {
    batches.push(currentBatch);
    currentBatch = [];
    currentLength = 0;
  }
  currentBatch.push({ index, text: protectedText });
  currentLength += protectedText.length + (currentBatch.length > 1 ? separator.length : 0);
}
if (currentBatch.length) batches.push(currentBatch);

async function requestTranslation(text, attempt = 1) {
  const endpoint = new URL("https://translate.googleapis.com/translate_a/single");
  endpoint.searchParams.set("client", "gtx");
  endpoint.searchParams.set("sl", "hr");
  endpoint.searchParams.set("tl", "en");
  endpoint.searchParams.set("dt", "t");
  endpoint.searchParams.set("q", text);

  try {
    const response = await fetch(endpoint, { signal: AbortSignal.timeout(30_000) });
    if (!response.ok) throw new Error(`Translation request failed with ${response.status}`);
    const payload = await response.json();
    return payload[0].map((part) => part[0]).join("");
  } catch (error) {
    if (attempt >= 5) throw error;
    await new Promise((resolve) => setTimeout(resolve, attempt * 1_000));
    return requestTranslation(text, attempt + 1);
  }
}

async function translateBatch(batch) {
  const joined = batch.map((item) => item.text).join(separator);
  const output = await requestTranslation(joined);
  const parts = output.split(/\s*\[\[\[BBSEP20260807\]\]\]\s*/u);

  if (parts.length === batch.length) {
    return Promise.all(parts.map((part, index) => part.trim() ? part : requestTranslation(batch[index].text)));
  }
  return Promise.all(batch.map((item) => requestTranslation(item.text)));
}

const results = new Array(targets.length);
let nextBatch = 0;

async function worker() {
  while (nextBatch < batches.length) {
    const batchIndex = nextBatch;
    nextBatch += 1;
    const batch = batches[batchIndex];
    const outputs = await translateBatch(batch);
    outputs.forEach((output, index) => {
      results[batch[index].index] = restoreBrandTerms(output.trim());
    });
    process.stdout.write(`\rTranslated ${batchIndex + 1}/${batches.length} batches`);
  }
}

await Promise.all(Array.from({ length: 4 }, () => worker()));
process.stdout.write("\n");

for (let index = 0; index < targets.length; index += 1) {
  let value = results[index];
  if (!value) throw new Error(`Missing translation for target ${index}`);
  if (targets[index].kind === "html") value = escapeHtmlText(value);
  if (targets[index].kind === "attribute") value = escapeHtmlAttribute(value);
  targets[index].apply(value);
}

for (const article of translated.articles) {
  article.content = article.content.join("");
}

translated.language = "en";
translated.sourceLanguage = "hr";
translated.translatedAt = new Date().toISOString();

const report = {
  sourceLanguage: "hr",
  targetLanguage: "en",
  articleCount: translated.articles.length,
  translatedTextSegments: targets.length,
  batches: batches.length,
  generatedAt: translated.translatedAt,
};

await writeFile(outputPath, `${JSON.stringify(translated, null, 2)}\n`);
await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`);
console.log(`Saved ${translated.articles.length} translated articles.`);
