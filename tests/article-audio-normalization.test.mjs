import assert from "node:assert/strict";
import test from "node:test";

import { normalizeArticleSpeechText, stripPaymentDetailsBlocks } from "../lib/audio-text-normalize.ts";

test("Croatian article audio expands titles and skips noisy business suffixes", () => {
  const normalized = normalizeArticleSpeechText(
    "Prof. dr. sc. Stjepan radi s prof.Monikom i Natašom, mag. ing. agr., u BORDO Primo d.o.o., npr. na EU projektu za PBZ. IBAN: HR7823600001102436170.",
    "hr",
  );

  assert.match(normalized, /profesor doktor znanosti Stjepan/i);
  assert.match(normalized, /profesor Monikom/i);
  assert.match(normalized, /magistar inženjer agronomije/i);
  assert.match(normalized, /BORDO Primo, na primjer/i);
  assert.match(normalized, /E U projektu za P B Z/);
  assert.doesNotMatch(normalized, /podaci za uplatu/i);
  assert.doesNotMatch(normalized, /\b(?:dr|sc|prof)\.|d\.o\.o\.|IBAN/iu);
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
