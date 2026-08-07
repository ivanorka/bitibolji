import assert from "node:assert/strict";
import { readFile, readdir, stat } from "node:fs/promises";
import test from "node:test";

const templateRoot = new URL("../", import.meta.url);

async function render(pathname = "/") {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}-${pathname}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request(`http://localhost${pathname}`, { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("server renders the finished Biti bolji home page", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /Biti bolji/);
  assert.match(html, /ideje postaju budućnost/i);
  assert.match(html, /40k\+/);
  assert.match(html, /1000[\s\S]{0,30}ideja/i);
  assert.match(html, /Vladimir Mihajlović/);
  assert.match(html, /\/og\.png/);
  assert.doesNotMatch(html, /codex-preview|Your site is taking shape|react-loading-skeleton/i);
});

test("server renders blog archive with complete archive count", async () => {
  const response = await render("/blog");
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /Arhiva Biti Bolji/);
  assert.match(html, />99</);
  assert.match(html, /Pretraži priče/);
  assert.match(html, /Predstava/);
});

test("contact page renders an email-free contact modal", async () => {
  const response = await render("/ukljuci-se");
  assert.equal(response.status, 200);

  const html = await response.text();
  assert.match(html, /favicon\.svg/);
  assert.match(html, /Pošalji email poruku/);
  assert.match(html, /Ne trebaš upisivati svoju e-mail adresu/);
  assert.match(html, /Ime i prezime/);
  assert.match(html, /Pripremi e-mail/);
  assert.doesNotMatch(html, /type=["']email["']/i);
});

test("server renders the complete English portal", async () => {
  const homeResponse = await render("/en");
  assert.equal(homeResponse.status, 200);
  const home = await homeResponse.text();
  assert.match(home, /ideas become the future/i);
  assert.match(home, /Explore stories/);
  assert.match(home, /href="\/en\/blog"/);
  assert.match(home, />HR</);

  const blogResponse = await render("/en/blog");
  assert.equal(blogResponse.status, 200);
  const blog = await blogResponse.text();
  assert.match(blog, /Biti Bolji archive/);
  assert.match(blog, />99</);
  assert.match(blog, /Search stories/);

  const contactResponse = await render("/en/get-involved");
  assert.equal(contactResponse.status, 200);
  const contact = await contactResponse.text();
  assert.match(contact, /Send an email/);
  assert.match(contact, /You do not need to enter your email address/);
  assert.doesNotMatch(contact, /type=["']email["']/i);
});

test("server renders fully translated English articles", async () => {
  const slug = "predstava-novac-nastavlja-svoj-put-prema-ucenicima-hrvatskih-skola";
  const response = await render(`/en/blog/${slug}`);
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /Archive note/);
  assert.match(html, /View the original in Croatian/);
  assert.match(html, /All stories/);
  assert.match(html, /Financial literacy/);
});

test("content migration contains every article and localizes all images", async () => {
  const manifest = JSON.parse(await readFile(new URL("../content/articles.json", import.meta.url), "utf8"));
  const englishManifest = JSON.parse(await readFile(new URL("../content/articles-en.json", import.meta.url), "utf8"));
  assert.equal(manifest.articleCount, 99);
  assert.equal(manifest.articles.length, 99);
  assert.equal(manifest.imageCount, 267);
  assert.ok(manifest.articles.every((article) => article.featuredImage.startsWith("/media/articles/")));
  assert.ok(manifest.articles.every((article) => !article.content.includes("wp-content/uploads")));
  assert.ok(manifest.articles.every((article) => article.sourceUrl.startsWith("https://poduzetnik.biz/")));
  assert.equal(englishManifest.language, "en");
  assert.equal(englishManifest.sourceLanguage, "hr");
  assert.equal(englishManifest.articleCount, 99);
  assert.equal(englishManifest.articles.length, 99);
  assert.deepEqual(
    englishManifest.articles.map((article) => article.slug),
    manifest.articles.map((article) => article.slug),
  );
  assert.ok(englishManifest.articles.every((article) => article.featuredImage.startsWith("/media/articles/")));
  assert.ok(englishManifest.articles.every((article) => !/XQ77[0-9]+X|ZZZ[A-Z]+ZZZ|BBSEP20260807/.test(article.content)));
  assert.ok(englishManifest.articles.filter((article, index) => article.title !== manifest.articles[index].title).length > 90);

  const years = await readdir(new URL("../public/media/articles/", import.meta.url));
  assert.ok(years.length > 0);
  const og = await stat(new URL("../public/og.png", import.meta.url));
  assert.ok(og.size > 100_000);
  assert.ok(templateRoot);
});
