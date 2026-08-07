import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const API_ROOT = "https://poduzetnik.biz/wp-json/wp/v2";
const CATEGORY_ID = 397;
const EXPECTED_COUNT = 99;
const projectRoot = process.cwd();
const mediaRoot = path.join(projectRoot, "public", "media", "articles");
const dataRoot = path.join(projectRoot, "content");

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function fetchWithRetry(url, attempts = 5) {
  let lastError;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const response = await fetch(url, {
        headers: { "User-Agent": "BitiBoljiContentMigration/1.0" },
        signal: AbortSignal.timeout(45_000),
      });

      if (!response.ok) {
        throw new Error(`${response.status} ${response.statusText}`);
      }

      return response;
    } catch (error) {
      lastError = error;
      if (attempt < attempts) await sleep(attempt * 1_000);
    }
  }

  throw new Error(`Ne mogu dohvatiti ${url}: ${lastError?.message}`);
}

function decodeHtml(value = "") {
  const named = {
    amp: "&",
    apos: "'",
    bull: "•",
    hellip: "…",
    laquo: "«",
    ldquo: "“",
    lsquo: "‘",
    nbsp: " ",
    quot: '"',
    raquo: "»",
    rdquo: "”",
    rsquo: "’",
    ndash: "–",
    mdash: "—",
  };

  return value
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCodePoint(Number.parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, number) => String.fromCodePoint(Number.parseInt(number, 10)))
    .replace(/&([a-z]+);/gi, (match, entity) => named[entity.toLowerCase()] ?? match);
}

function textFromHtml(value = "") {
  return decodeHtml(
    value
      .replace(/<!--([\s\S]*?)-->/g, " ")
      .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
      .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ")
      .replace(/<[^>]+>/g, " ")
  )
    .replace(/\s+/g, " ")
    .trim();
}

function sanitizeHtml(value = "") {
  return value
    .replace(/<!--([\s\S]*?)-->/g, "")
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<form\b[^>]*>[\s\S]*?<\/form>/gi, "")
    .replace(/<input\b[^>]*>/gi, "")
    .replace(/\son[a-z]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "")
    .replace(/\ssrcset\s*=\s*("[^"]*"|'[^']*')/gi, "")
    .replace(/\ssizes\s*=\s*("[^"]*"|'[^']*')/gi, "")
    .replace(/<iframe\b[^>]*>[\s\S]*?<\/iframe>/gi, "");
}

function canonicalUploadUrl(rawUrl) {
  if (!rawUrl) return null;

  const decoded = decodeHtml(rawUrl).replace(/^http:\/\//i, "https://");
  let parsed;

  try {
    parsed = new URL(decoded);
  } catch {
    return null;
  }

  if (!/(^|\.)poduzetnik\.biz$/i.test(parsed.hostname)) return null;
  if (!parsed.pathname.includes("/wp-content/uploads/")) return null;
  parsed.search = "";
  parsed.hash = "";
  return parsed.toString();
}

function localPathForUpload(remoteUrl) {
  const parsed = new URL(remoteUrl);
  const uploadPath = decodeURIComponent(parsed.pathname.split("/wp-content/uploads/")[1]);
  const safeParts = uploadPath
    .split("/")
    .filter(Boolean)
    .map((part) => part.replace(/[^\p{L}\p{N}._-]+/gu, "-"));

  return {
    publicPath: `/media/articles/${safeParts.join("/")}`,
    filePath: path.join(mediaRoot, ...safeParts),
  };
}

function findUploadUrls(html, featuredUrl) {
  const urls = new Set();
  const candidates = [featuredUrl];
  const attributePattern = /\b(?:src|data-src|data-lazy-src|poster)\s*=\s*["']([^"']+)["']/gi;
  let match;

  while ((match = attributePattern.exec(html)) !== null) candidates.push(match[1]);

  const cssUrlPattern = /url\(\s*["']?([^"')]+)["']?\s*\)/gi;
  while ((match = cssUrlPattern.exec(html)) !== null) candidates.push(match[1]);

  for (const candidate of candidates) {
    const canonical = canonicalUploadUrl(candidate);
    if (canonical) urls.add(canonical);
  }

  return [...urls];
}

function rewriteContentHtml(html, urlMap) {
  let content = sanitizeHtml(html);

  content = content.replace(
    /(\b(?:src|data-src|data-lazy-src|poster)\s*=\s*["'])([^"']+)(["'])/gi,
    (full, prefix, candidate, suffix) => {
      const canonical = canonicalUploadUrl(candidate);
      const local = canonical ? urlMap.get(canonical) : null;
      return local ? `${prefix}${local}${suffix}` : full;
    }
  );

  content = content.replace(/url\(\s*["']?([^"')]+)["']?\s*\)/gi, (full, candidate) => {
    const canonical = canonicalUploadUrl(candidate);
    const local = canonical ? urlMap.get(canonical) : null;
    return local ? `url('${local}')` : full;
  });

  return content
    .replace(/<a\b([^>]*?)href=["']https?:\/\/poduzetnik\.biz[^"']*["']([^>]*)>/gi, "<a$1$2>")
    .replace(/<a\b([^>]*?)target=["']_blank["']([^>]*)>/gi, '<a$1target="_blank" rel="noreferrer noopener"$2>');
}

async function fetchAllPosts() {
  const posts = [];
  let page = 1;

  while (true) {
    const url = new URL(`${API_ROOT}/posts`);
    url.searchParams.set("categories", String(CATEGORY_ID));
    url.searchParams.set("per_page", "20");
    url.searchParams.set("page", String(page));
    url.searchParams.set("orderby", "date");
    url.searchParams.set("order", "desc");
    url.searchParams.set("_embed", "1");

    const response = await fetchWithRetry(url);
    const pagePosts = await response.json();
    posts.push(...pagePosts);

    const totalPages = Number(response.headers.get("x-wp-totalpages") || 1);
    console.log(`Članci: stranica ${page}/${totalPages}, ukupno ${posts.length}`);
    if (page >= totalPages) break;
    page += 1;
  }

  return posts;
}

async function downloadImage(remoteUrl) {
  const paths = localPathForUpload(remoteUrl);
  await mkdir(path.dirname(paths.filePath), { recursive: true });

  const response = await fetchWithRetry(remoteUrl);
  const bytes = Buffer.from(await response.arrayBuffer());
  await writeFile(paths.filePath, bytes);

  return { ...paths, bytes: bytes.length };
}

async function mapWithConcurrency(items, limit, task) {
  const results = new Array(items.length);
  let nextIndex = 0;

  async function worker() {
    while (nextIndex < items.length) {
      const current = nextIndex;
      nextIndex += 1;
      results[current] = await task(items[current], current);
    }
  }

  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return results;
}

async function main() {
  await mkdir(mediaRoot, { recursive: true });
  await mkdir(dataRoot, { recursive: true });

  const sourcePosts = await fetchAllPosts();
  if (sourcePosts.length !== EXPECTED_COUNT) {
    throw new Error(`Očekivano ${EXPECTED_COUNT} članaka, pronađeno ${sourcePosts.length}.`);
  }

  const allImageUrls = new Set();
  for (const post of sourcePosts) {
    const featured = post._embedded?.["wp:featuredmedia"]?.[0]?.source_url;
    for (const url of findUploadUrls(post.content?.rendered ?? "", featured)) allImageUrls.add(url);
  }

  const imageUrls = [...allImageUrls];
  let downloadedBytes = 0;
  const imageResults = await mapWithConcurrency(imageUrls, 6, async (url, index) => {
    const result = await downloadImage(url);
    downloadedBytes += result.bytes;
    if ((index + 1) % 20 === 0 || index + 1 === imageUrls.length) {
      console.log(`Slike: ${index + 1}/${imageUrls.length}`);
    }
    return [url, result.publicPath];
  });
  const imageMap = new Map(imageResults);

  const articles = sourcePosts.map((post) => {
    const featuredRemote = canonicalUploadUrl(post._embedded?.["wp:featuredmedia"]?.[0]?.source_url);
    const cleanText = textFromHtml(post.content?.rendered ?? "");
    const sourceAuthor = String(post.acf?.ime_autora || post.yoast_head_json?.twitter_misc?.["Napisao/la"] || "Redakcija").trim();
    const description = decodeHtml(post.yoast_head_json?.description || textFromHtml(post.excerpt?.rendered ?? ""));

    return {
      id: post.id,
      slug: post.slug,
      title: decodeHtml(post.title?.rendered ?? ""),
      description,
      excerpt: description,
      date: post.date,
      modified: post.modified,
      author: "Vladimir Mihajlović",
      sourceAuthor,
      sourceUrl: post.link,
      featuredImage: featuredRemote ? imageMap.get(featuredRemote) ?? null : null,
      featuredImageAlt: decodeHtml(post._embedded?.["wp:featuredmedia"]?.[0]?.alt_text || post.acf?.featured_image_title || ""),
      readTime: Math.max(1, Math.ceil(cleanText.split(/\s+/).length / 210)),
      content: rewriteContentHtml(post.content?.rendered ?? "", imageMap),
    };
  });

  const manifest = {
    source: "https://poduzetnik.biz/biti-bolji/",
    importedAt: new Date().toISOString(),
    categoryId: CATEGORY_ID,
    articleCount: articles.length,
    imageCount: imageUrls.length,
    imageBytes: downloadedBytes,
    articles,
  };

  await writeFile(path.join(dataRoot, "articles.json"), `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
  await writeFile(
    path.join(dataRoot, "migration-report.json"),
    `${JSON.stringify({
      importedAt: manifest.importedAt,
      source: manifest.source,
      articleCount: articles.length,
      imageCount: imageUrls.length,
      imageBytes: downloadedBytes,
      newestArticle: articles[0]?.date,
      oldestArticle: articles.at(-1)?.date,
    }, null, 2)}\n`,
    "utf8"
  );

  console.log(`Gotovo: ${articles.length} članaka, ${imageUrls.length} slika, ${(downloadedBytes / 1024 / 1024).toFixed(1)} MB.`);
}

await main();
