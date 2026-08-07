# Biti bolji by Vladimir

Samostalni portal Udruge Biti Bolji i Vladimira Mihajlovića. Portal donosi priču
projekta, načine uključivanja i potpunu arhivu sadržaja koji je prethodno živio u
kategoriji Biti bolji na portalu Poduzetnik.

## Sadržaj

- naslovnica s programima, rezultatima i najnovijim pričama
- pretraživa arhiva 99 članaka
- 267 lokalno pohranjenih slika iz članaka
- pojedinačne stranice članaka s izvornim potpisom i poveznicom na izvor
- stranice O projektu i Uključi se
- Open Graph naslovnica za dijeljenje

## Lokalni rad

Potreban je Node.js 22.13 ili noviji.

```bash
npm install
npm run dev
```

Produkcijska provjera:

```bash
npm test
```

## Osvježavanje arhive

Skripta dohvaća sve članke iz WordPress kategorije `Biti bolji`, preuzima
naslovne i umetnute slike te prepisuje reference na lokalne datoteke.

```bash
node scripts/import-poduzetnik.mjs
```

Rezultat migracije nalazi se u `content/migration-report.json`.
