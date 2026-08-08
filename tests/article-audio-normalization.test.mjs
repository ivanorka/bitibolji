import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import {
  normalizeArticleSpeechText,
  stripNonNarrativeBlocks,
  stripPaymentDetailsBlocks,
} from "../lib/audio-text-normalize.ts";

test("Croatian article audio expands titles and skips noisy business suffixes", () => {
  const normalized = normalizeArticleSpeechText(
    "Prof. dr. sc. Stjepan radi s prof.Monikom i Natašom, mag. ing. agr., u BORDO Primo d.o.o., npr. na EU projektu za PBZ. IBAN: HR7823600001102436170.",
    "hr",
  );

  assert.match(normalized, /profesor doktor znanosti Stjepan/i);
  assert.match(normalized, /profesor Monikom/i);
  assert.match(normalized, /magistar inženjer agronomije/i);
  assert.match(normalized, /BORDO Primo, na primjer/i);
  assert.match(normalized, /e u projektu za pe be ze/i);
  assert.doesNotMatch(normalized, /podaci za uplatu/i);
  assert.doesNotMatch(normalized, /\b(?:dr|sc|prof)\.|d\.o\.o\.|IBAN/iu);
});

test("article audio omits captions, contact details, photo credits, and support calls", () => {
  const filtered = stripNonNarrativeBlocks(`
    <p>Predstava mladima približava odgovorno upravljanje novcem.</p>
    <figure><img src="novac.jpg"><figcaption>Predstava je održana u školskoj dvorani.</figcaption></figure>
    <p>Foto: Iva Fotograf</p>
    <p>Javite nam se na bitibolji4@gmail.com ili broj 091 123 4567.</p>
    <p>Pozivamo vas da podržite ovaj projekt kako bi stigao u još škola.</p>
    <p>Glavna poruka članka ostaje dostupna slušateljima.</p>
  `);

  assert.match(filtered, /odgovorno upravljanje novcem/);
  assert.match(filtered, /Glavna poruka članka/);
  assert.doesNotMatch(filtered, /figcaption|školskoj dvorani|Iva Fotograf|bitibolji4|091|podržite ovaj projekt/i);
});

test("the first ten newest Croatian articles have curated spoken scripts", async () => {
  const articleManifest = JSON.parse(await readFile(new URL("../content/articles.json", import.meta.url), "utf8"));
  const narrationManifest = JSON.parse(await readFile(new URL("../content/audio-narrations.json", import.meta.url), "utf8"));
  const newestSlugs = [...articleManifest.articles]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 10)
    .map((article) => article.slug);

  assert.equal(narrationManifest.version, "curated-hr-v1");
  assert.deepEqual(Object.keys(narrationManifest.narrations), newestSlugs);
  for (const narration of Object.values(narrationManifest.narrations)) {
    assert.ok(narration.length > 700);
    assert.doesNotMatch(narration, /IBAN|SWIFT|bitibolji4@|https?:\/\/|\b\d+\b/i);
  }
});

test("article audio omits payment-detail blocks without removing surrounding content", () => {
  const filtered = stripPaymentDetailsBlocks(`
    <p>Projekt podržavaju brojne tvrtke i donatori.</p>
    <p>Uplata na račun udruge, IBAN: HR7823600001102436170, SWIFT: ZABAHR2X.</p>
    <p>Predstava zatim nastavlja put prema školama.</p>
  `);

  assert.match(filtered, /brojne tvrtke i donatori/);
  assert.match(filtered, /nastavlja put prema školama/);
  assert.doesNotMatch(filtered, /IBAN|SWIFT|HR7823600001102436170|ZABAHR2X/);
});

test("article audio also omits payment details nested in a quote", () => {
  const filtered = stripPaymentDetailsBlocks(`
    <figure><blockquote><p>Vaša podrška nam je važna.</p><cite>Podaci za uplatu, IBAN: HR7823600001102436170.</cite></blockquote></figure>
    <p>Ostatak članka ostaje dostupan.</p>
  `);

  assert.match(filtered, /Ostatak članka ostaje dostupan/);
  assert.doesNotMatch(filtered, /podrška nam je važna|IBAN|HR7823600001102436170/i);
});

test("English article audio expands academic and general abbreviations", () => {
  const normalized = normalizeArticleSpeechText(
    "Prof. Ph.D. Maria and M.Sc. John work at PBZ d.d., i.e. on an EU AI project in the USA.",
    "en",
  );

  assert.match(normalized, /Professor Maria/);
  assert.match(normalized, /Master of Science John/);
  assert.match(normalized, /P B Z, that is/);
  assert.match(normalized, /European Union artificial intelligence project in the United States/);
  assert.doesNotMatch(normalized, /Ph\.D\.|M\.Sc\.|d\.d\.|i\.e\./);
});
