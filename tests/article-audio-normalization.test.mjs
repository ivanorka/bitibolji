import assert from "node:assert/strict";
import test from "node:test";

import { normalizeArticleSpeechText } from "../lib/audio-text-normalize.ts";

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
  assert.match(normalized, /podaci za uplatu navedeni su u članku/i);
  assert.doesNotMatch(normalized, /\b(?:dr|sc|prof)\.|d\.o\.o\.|IBAN/iu);
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
