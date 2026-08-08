import { readFile } from "node:fs/promises";

const baseURL = new URL(process.argv[2] || process.env.AUDIO_BASE_URL || "https://bitibolji.orka.solutions");
const manifest = JSON.parse(await readFile(new URL("../content/articles.json", import.meta.url), "utf8"));
const operation = process.argv.includes("--verify") ? "verify" : "seed";
const startAt = Math.max(1, Number.parseInt(process.env.AUDIO_START || "1", 10));
const endAt = Math.min(manifest.articles.length, Number.parseInt(process.env.AUDIO_END || String(manifest.articles.length), 10));
const selectedArticles = manifest.articles.slice(startAt - 1, endAt);
const results = [];

for (const [relativeIndex, article] of selectedArticles.entries()) {
  const index = startAt + relativeIndex;
  const metaURL = new URL(`/api/audio-persist/hr/${encodeURIComponent(article.slug)}`, baseURL);
  metaURL.searchParams.set("voice", "vlado");
  metaURL.searchParams.set("meta", "1");
  const metaResponse = await fetch(metaURL);
  if (!metaResponse.ok) throw new Error(`${article.slug}: metadata returned ${metaResponse.status}`);
  const metadata = await metaResponse.json();

  for (let part = 0; part < metadata.parts; part += 1) {
    const audioURL = new URL(metaURL);
    audioURL.searchParams.delete("meta");
    audioURL.searchParams.set("part", String(part));
    audioURL.searchParams.set("v", metadata.version);
    audioURL.searchParams.set("persist", operation);
    const response = await fetch(audioURL);
    if (!response.ok) {
      const details = await response.text();
      throw new Error(`${article.slug}: audio returned ${response.status} ${details.slice(0, 300)}`);
    }

    const storage = response.headers.get("x-audio-storage") || "missing-header";
    if (operation === "verify" && storage !== "netlify-blobs") {
      throw new Error(`${article.slug}: expected netlify-blobs, received ${storage}`);
    }
    await response.arrayBuffer();
    results.push({ characters: metadata.characters, part, slug: article.slug, storage });
  }

  process.stdout.write(`[${index}/${manifest.articles.length}] ${article.slug} — ${results.at(-1).storage}\n`);
}

const storageCounts = Object.fromEntries(
  Object.entries(Object.groupBy(results, (result) => result.storage))
    .map(([storage, entries]) => [storage, entries.length]),
);
console.log(JSON.stringify({
  articles: selectedArticles.length,
  audioFiles: results.length,
  characters: results.reduce((total, result) => total + result.characters, 0),
  operation,
  storageCounts,
}, null, 2));
