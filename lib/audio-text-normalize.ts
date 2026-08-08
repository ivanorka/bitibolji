export type AudioTextLocale = "hr" | "en";

export const AUDIO_TEXT_NORMALIZATION_VERSION = "spoken-editorial-v2";

type SpeechReplacement = readonly [pattern: RegExp, replacement: string];

const corporateSuffix = /(?:,\s*)?(?:j\.\s*d\.\s*o\.\s*o\.|d\.\s*o\.\s*o\.|d\.\s*d\.\s*d\.|d\.\s*d\.)/giu;
const ibanWithAccount = /\bIBAN\s*:?[\s\u00a0]*[A-Z]{2}[\s\u00a0]*\d(?:[\d\s\u00a0]{10,32})\b/giu;
const contentBlock = /<(blockquote|cite|p|li|tr|td|pre)\b[^>]*>[\s\S]*?<\/\1>/giu;
const paymentDetailsMarker = /\b(?:IBAN|SWIFT|BIC|poziv\s+na\s+broj|model\s+plaćanja|payment\s+reference|account\s+number)\b/iu;
const figcaptionBlock = /<figcaption\b[^>]*>[\s\S]*?<\/figcaption>/giu;
const narrativeBlock = /<(p|li|cite|address|h[1-6])\b[^>]*>[\s\S]*?<\/\1>/giu;
const contactDetailsMarker = /(?:mailto:|tel:|\b[\w.+-]+@[\w.-]+\.[\p{L}]{2,}\b|\b(?:kontakt|contact)\s*:?\s*\+?\d)/iu;
const photoCreditMarker = /^\s*(?:<[^>]+>\s*)*(?:foto|photo|fotografija|snimio|snimila)\s*:/iu;
const supportCallMarker = /\b(?:projekt\s+možete\s+podržati|pozivamo\s+(?:i\s+)?vas[^.!?]{0,260}\b(?:podrž|donir)\p{L}*|donirajte\s+(?:projektu|udruzi)|(?:donacij\p{L}*|sponzorstv\p{L}*)\s+možete\s+uplatiti|uplat\p{L}*\s+(?:na|za)|žiro\s+račun|vaša\s+podrška\s+nam|support\s+this\s+project)\b/iu;

const croatianReplacements: SpeechReplacement[] = [
  [/\b1000\s+ideja\b/giu, "tisuću ideja"],
  [/\bord\.\s*prof\.\s*dr\.\s*art\./giu, "redoviti profesor doktor umjetnosti"],
  [/\bred\.\s*prof\.\s*dr\.\s*art\./giu, "redoviti profesor doktor umjetnosti"],
  [/\bizv\.\s*prof\.\s*dr\.\s*sc\./giu, "izvanredni profesor doktor znanosti"],
  [/\bdoc\.\s*dr\.\s*sc\./giu, "docent doktor znanosti"],
  [/\bprof\.\s*dr\.\s*sc\./giu, "profesor doktor znanosti"],
  [/\bdr\.\s*sc\./giu, "doktor znanosti"],
  [/\bmr\.\s*sc\./giu, "magistar znanosti"],
  [/\bdr\.\s*art\./giu, "doktor umjetnosti"],
  [/\bmag\.\s*art\./giu, "magistar umjetnosti"],
  [/\buniv\.\s*spec\.\s*oec\./giu, "sveučilišni specijalist ekonomije"],
  [/\bdipl\.\s*oec\./giu, "diplomirani ekonomist"],
  [/\bdipl\.\s*ing\./giu, "diplomirani inženjer"],
  [/\bmag\.\s*ing\.\s*agr\./giu, "magistar inženjer agronomije"],
  [/\bing\.\s*agr\./giu, "inženjer agronomije"],
  [/\bmag\.\s*oec\./giu, "magistar ekonomije"],
  [/\bmag\.\s*ing\./giu, "magistar inženjer"],
  [/\bdr\.\s*med\./giu, "doktor medicine"],
  [/\bizv\.\s*prof\./giu, "izvanredni profesor"],
  [/\bred\.\s*prof\./giu, "redoviti profesor"],
  [/\bprof\./giu, "profesor"],
  [/\bdoc\./giu, "docent"],
  [/\bdr\./giu, "doktor"],
  [/\bmr\./giu, "magistar"],
  [/\bing\./giu, "inženjer"],
  [/\bnpr\./giu, "na primjer"],
  [/\btj\./giu, "to jest"],
  [/\bitd\./giu, "i tako dalje"],
  [/\bi\s+sl\./giu, "i slično"],
  [/\bbr\./giu, "broj"],
];

const englishReplacements: SpeechReplacement[] = [
  [/\b(?:ord\.\s*|red\.\s*)?prof\.\s*(?:dr\.\s*(?:sc|art)\.|Ph\.\s*D\.)/giu, "Professor"],
  [/\bPh\.\s*D\./giu, "Doctor of Philosophy"],
  [/\bM\.\s*Sc\./giu, "Master of Science"],
  [/\bmag\.\s*art\./giu, "Master of Arts"],
  [/\bdipl\.\s*oec\./giu, "graduate economist"],
  [/\bdipl\.\s*ing\./giu, "graduate engineer"],
  [/\bing\.\s*agr\./giu, "agricultural engineer"],
  [/\bdr\.\s*(?:med|honey)\./giu, "medical doctor"],
  [/\bProf\./giu, "Professor"],
  [/\bDr\./giu, "Doctor"],
  [/\bMr\./gu, "Mister"],
  [/\bing\./giu, "engineer"],
  [/\bord\./giu, ""],
  [/\bi\.\s*e\./giu, "that is"],
  [/\be\.\s*g\./giu, "for example"],
  [/\ba\.\s*m\./giu, "A M"],
  [/\bp\.\s*m\./giu, "P M"],
];

const croatianTerms: Record<string, string> = {
  AI: "umjetna inteligencija",
  BICRO: "Bikro",
  BOSQAR: "Boskar",
  EBRD: "e be er de",
  EU: "e u",
  FAZOS: "Fazos",
  FER: "Fer",
  FSB: "ef es be",
  HAMAG: "Hamag",
  HANFA: "Hanfa",
  HGK: "ha ge ka",
  HNB: "ha en be",
  HNK: "ha en ka",
  HRT: "ha er te",
  HT: "ha te",
  INA: "Ina",
  IT: "informacijske tehnologije",
  MBA: "em be a",
  OPG: "o pe ge",
  OTP: "o te pe",
  OŠ: "Osnovna škola",
  PBZ: "pe be ze",
  PMF: "pe em ef",
  RH: "er ha",
  SAD: "Sjedinjene Američke Države",
  SŠ: "Srednja škola",
  STEM: "stem",
  TV: "televizija",
  UK: "Ujedinjeno Kraljevstvo",
  UX: "ju eks",
  SWOT: "svot",
  "3D": "tri de",
  "4P": "četiri pe",
};

const englishTerms: Record<string, string> = {
  AI: "artificial intelligence",
  EBRD: "E B R D",
  EU: "European Union",
  HRK: "Croatian kuna",
  INA: "Ina",
  IT: "information technology",
  OTP: "O T P",
  PBZ: "P B Z",
  STEM: "stem",
  TV: "television",
  UK: "United Kingdom",
  USA: "United States",
  UX: "U X",
};

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");
}

function replaceTerms(value: string, terms: Record<string, string>) {
  return Object.entries(terms).reduce((text, [term, spoken]) => text.replace(
    new RegExp(`(?<![\\p{L}\\p{N}])${escapeRegExp(term)}(?![\\p{L}\\p{N}])`, "gu"),
    spoken,
  ), value);
}

export function stripPaymentDetailsBlocks(value: string) {
  return value.replace(contentBlock, (block) => paymentDetailsMarker.test(block) ? " " : block);
}

export function stripNonNarrativeBlocks(value: string) {
  return stripPaymentDetailsBlocks(value)
    .replace(figcaptionBlock, " ")
    .replace(narrativeBlock, (block) => {
      const plainText = block.replace(/<[^>]+>/gu, " ").replace(/\s+/gu, " ").trim();
      return contactDetailsMarker.test(block)
        || photoCreditMarker.test(plainText)
        || supportCallMarker.test(plainText)
        ? " "
        : block;
    });
}

export function normalizeArticleSpeechText(value: string, locale: AudioTextLocale) {
  const replacements = locale === "en" ? englishReplacements : croatianReplacements;
  const terms = locale === "en" ? englishTerms : croatianTerms;
  let normalized = value.normalize("NFC")
    .replace(/(\p{L}\.)(?=\p{Lu})/gu, "$1 ")
    .replace(/\s+([,.;:!?])/gu, "$1")
    .replace(ibanWithAccount, "")
    .replace(corporateSuffix, "");

  for (const [pattern, replacement] of replacements) {
    normalized = normalized.replace(pattern, replacement);
  }

  return replaceTerms(normalized, terms)
    .replace(/\(\s*\)/gu, "")
    .replace(/\s+([,.;:!?])/gu, "$1")
    .replace(/([,;:])(?=[.!?])/gu, "")
    .replace(/\s+/gu, " ")
    .trim();
}
