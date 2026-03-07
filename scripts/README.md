# ClearRx Scripts

Utility scripts for enriching and maintaining the ClearRx drug interaction database.

---

## fetch-openfda.mjs

### What it does

`fetch-openfda.mjs` queries the **OpenFDA Drug Labels API** for every drug
listed in `public/data/drug-db.json`.  For each drug it:

1. Searches the FDA label database by generic name (falls back to brand name
   and partial-name searches if the exact match returns nothing).
2. Extracts the `drug_interactions` section from the official prescribing
   information.
3. Scans that text for mentions of any **other** drug in our database.
4. Flags any drug pairs that appear in the FDA text but are **not yet recorded**
   in our `interactions[]` array — these are the candidates for database
   enrichment.
5. Writes a structured JSON report to `scripts/openfda-report.json`.

The OpenFDA dataset is released under the **CC0 Public Domain** license, making
it fully free for commercial use.

---

### How to run

```bash
# From the project root
node scripts/fetch-openfda.mjs
```

The script will print progress to the console and write the report when done:

```
ClearRx × OpenFDA integration
================================
Database: 35 drugs, 62 existing interaction pairs
API key:  none (standard limits)

[01/35] acetaminophen
        matched on: genericName
        interaction text: 3412 chars
        drugs mentioned:  warfarin, naproxen
...

================================
Report written to: .../scripts/openfda-report.json
Found in OpenFDA : 32/35 drugs
Potential NEW pairs discovered: 8
```

---

### OpenFDA API limits

| Tier           | Requests / minute | Requests / day |
|----------------|:-----------------:|:--------------:|
| No API key     | 240               | 120,000        |
| With API key   | 240               | Significantly higher |

The script inserts a **350 ms delay** between requests, keeping throughput at
roughly 170 req/min — safely inside the no-key ceiling.  For a 35-drug database
the full run takes under 15 seconds.

---

### How to get a free API key

1. Visit <https://open.fda.gov/apis/authentication/>
2. Register with your email address — no payment required.
3. Copy the key you receive.
4. Pass it as an environment variable when running the script:

```bash
OPENFDA_API_KEY=your_key_here node scripts/fetch-openfda.mjs
```

An API key raises the daily quota and is recommended if you plan to run the
script frequently (e.g., in a nightly CI job).

---

### Understanding the report (`openfda-report.json`)

```jsonc
{
  "generatedAt": "2026-03-08T...",
  "source": "OpenFDA Drug Labels API",
  "license": "CC0 Public Domain",
  "summary": {
    "totalDrugs": 35,
    "foundInOpenFDA": 32,
    "notFound": 3,
    "drugsNotFound": ["calcium", "fish-oil", "st-johns-wort"],
    "existingPairsInDB": 62,
    "potentialNewPairsFound": 8,
    "potentialNewPairs": ["aspirin::ibuprofen", "...]
  },
  "results": [
    {
      "drugId": "warfarin",
      "genericName": "warfarin",
      "foundInOpenFDA": true,
      "matchedOn": "genericName",
      "brandNamesInLabel": ["COUMADIN", "JANTOVEN"],
      "interactionTextLength": 5214,
      "mentionedDrugIds": ["aspirin", "ibuprofen", "fluoxetine"],
      "newPairKeys": ["fluoxetine::warfarin"],
      "interactionExcerpt": "Drugs that may increase the anticoagulant effect..."
    }
  ]
}
```

| Field | Meaning |
|---|---|
| `foundInOpenFDA` | Whether the drug was located in the FDA label database |
| `matchedOn` | Which search strategy found it (`genericName`, `brandName:Tylenol`, `partialGenericName`) |
| `mentionedDrugIds` | Other drugs from our database that appear in the FDA interaction text |
| `newPairKeys` | Pairs not yet in `drug-db.json` — primary enrichment candidates |
| `interactionExcerpt` | First 600 characters of the raw FDA interaction text |

---

### Using the report to enrich drug-db.json

1. Open `scripts/openfda-report.json` and review `summary.potentialNewPairs`.
2. For each pair key (e.g., `"fluoxetine::warfarin"`):
   - Read the `interactionExcerpt` for the relevant drugs to understand the
     clinical significance.
   - Look up the full interaction in a clinical reference (e.g., Lexicomp,
     Micromedex, or the full FDA label at
     `https://api.fda.gov/drug/label.json?search=openfda.generic_name:"warfarin"&limit=1`).
3. If the interaction is clinically relevant, add a new entry to the
   `interactions[]` array in `public/data/drug-db.json`:

```jsonc
{
  "pairKey": "fluoxetine::warfarin",
  "drug1": "fluoxetine",
  "drug2": "warfarin",
  "severity": "major",
  "description": "Fluoxetine inhibits CYP2C9, reducing warfarin metabolism and increasing bleeding risk.",
  "mechanism": "CYP2C9 inhibition",
  "management": "Monitor INR closely when starting or stopping fluoxetine.",
  "sources": ["OpenFDA label", "Clinical review"]
}
```

> **Important:** OpenFDA interaction text often references **drug classes**
> (e.g., "SSRIs", "NSAIDs") rather than individual generics.  Always validate
> that a specific pair is clinically relevant before adding it to the database.

---

### Automating database updates (optional)

You can run this script on a schedule (e.g., GitHub Actions cron) to detect
newly documented interactions as the FDA updates its label database:

```yaml
# .github/workflows/openfda-sync.yml
on:
  schedule:
    - cron: '0 3 * * 1'   # every Monday at 03:00 UTC
jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '18' }
      - run: node scripts/fetch-openfda.mjs
        env:
          OPENFDA_API_KEY: ${{ secrets.OPENFDA_API_KEY }}
      - uses: actions/upload-artifact@v4
        with:
          name: openfda-report
          path: scripts/openfda-report.json
```
