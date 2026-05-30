# ClearRx Data Integrity & Risk-First Expansion — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make ClearRx's data claims match reality — revive orphaned pharmacist content, prevent "no data = safe" misreading, add ~24 high-interaction-risk drugs with sourced-only interactions, and install a validation gate so none of it can silently regress.

**Architecture:** Static-export Next.js 16 app; data is JSON in `public/data/` fetched at runtime. `drug-db.json` is the single source of truth; `drug-search-index.json` + `version.json` are derived by `scripts/`. All changes are additive: new wiring, new data, hardened scripts, honest copy. No runtime-architecture change.

**Tech Stack:** Next.js 16, React 19, TypeScript 5, Tailwind v4, Fuse.js, Cytoscape.js. Node CommonJS scripts (`.cjs`) + one ESM script (`.mjs`). **No unit-test framework exists and none is added** (YAGNI; user did not request one). Verification uses: `node scripts/validate-db.cjs` (the data gate — real runnable verification), `npx tsc --noEmit`, `npm run build`, and manual `npm run dev` browser checks for UI wiring.

**Execution order (hybrid, per approved spec §5):**
1. Task 1 — WS-C authoring (new drug records + curation list), no canonical write yet
2. Tasks 2–4 — WS-A safety net (theoretical enum, version-aware scripts, validate-db gate)
3. Tasks 5–6 — WS-C integration (expand-db write + index rebuild + gate)
4. Task 7 — WS-B (revive pharmacist content)
5. Tasks 8–9 — WS-D (degree-0 framing, source/pharmacist badges, copy honesty)

Spec: `docs/plans/2026-05-31-clearrx-data-integrity-design.md`

---

## File Structure

**Created:**
- `scripts/curation-list.json` — hand-authored new drugs + class-rule interaction pairs (Task 1)
- `scripts/expand-db.cjs` — reads curation-list + openfda-report, appends to drug-db, re-sorts, writes back (Task 5)
- `scripts/validate-db.cjs` — *rewritten* into an exit-coded gate (Task 4; file already exists as report-only)

**Modified:**
- `src/types/drug.ts` — add `"theoretical"` to `EvidenceLevel` (Task 2); add `Explanation` interface (Task 7)
- `scripts/rebuild-search-index.cjs` — read version from drug-db, not hard-coded `2.0.0` (Task 3)
- `scripts/merge-db.cjs` — read version from drug-db (Task 3; relic, but de-staled for consistency)
- `public/data/drug-db.json` — new drugs + sourced interactions, version bump (Task 5)
- `public/data/drug-search-index.json`, `public/data/version.json` — regenerated (Task 6)
- `src/lib/interaction-engine.ts` — add `getExplanation()` (Task 7)
- `src/app/page.tsx` — inject explanation into modal (Task 7)
- `src/components/InteractionModal.tsx` — source badge + pharmacist-note badge (Tasks 7, 9)
- `src/components/ResultsPanel.tsx` — degree-0 coverage warning (Task 8)
- `src/app/about/page.tsx`, `src/app/faq/page.tsx`, `src/app/page.tsx` — copy honesty (Task 9)

---

## Task 1: WS-C authoring — new drug records + curation list

No canonical-DB write. Produces a reviewable artifact only.

**Files:**
- Create: `scripts/curation-list.json`

- [ ] **Step 1: Define the curation-list shape**

Create `scripts/curation-list.json` with two arrays. `drugs` follows the `Drug` interface
(`src/types/drug.ts:61-83`); omit unknown optional fields (do NOT guess). `classRulePairs`
are interactions justified by an explicit documented class rule (these become `source:"bundle"`).

```json
{
  "drugs": [
    {
      "id": "morphine",
      "genericName": "morphine",
      "brandNames": ["MS Contin", "Kadian"],
      "categories": ["opioid"],
      "interactionRiskScore": 8,
      "inBundle": true,
      "deaSchedule": "II",
      "otcRx": "rx",
      "mechanismClass": "opioid-agonist"
    }
  ],
  "classRulePairs": [
    {
      "pairKey": "gemfibrozil::simvastatin",
      "drugA_id": "gemfibrozil",
      "drugB_id": "simvastatin",
      "severity": "serious",
      "mechanism": "Gemfibrozil inhibits the glucuronidation and OATP1B1-mediated hepatic uptake of statins, markedly raising statin exposure and rhabdomyolysis risk.",
      "evidenceLevel": "established",
      "source": "bundle",
      "managementStrategy": "avoid",
      "monitoringParameters": ["CK", "muscle symptoms"],
      "lastReviewed": "2026-05-31",
      "classRuleBasis": "Fibrate-statin myopathy; gemfibrozil contraindicated/avoid with most statins per FDA labeling."
    }
  ]
}
```

Note `classRuleBasis` is a required justification field on every `classRulePairs` entry
(stripped before merge in Task 5; it exists so the anti-fabrication review can verify a
named basis). `pairKey` MUST equal `[drugA_id, drugB_id].sort().join("::")`.

- [ ] **Step 2: Author the ~24 new drug records**

Add records for the candidates in spec §4: opioids (morphine, fentanyl, codeine, methadone,
buprenorphine), NSAIDs (meloxicam, celecoxib, ketorolac, diclofenac), corticosteroids
(dexamethasone, methylprednisolone, prednisolone), fibrates (gemfibrozil, fenofibrate),
nitrate (isosorbide), MAOI (selegiline), OTC (pseudoephedrine, dextromethorphan), ezetimibe.
Each: id (lowercase, hyphenated), genericName, brandNames, categories (must use existing
`DrugCategory` union values — `src/types/drug.ts:1-43`), interactionRiskScore (0-10),
inBundle:true, otcRx, mechanismClass. Add Tier-3 fields only when confidently known.

⚠️ If any candidate needs a `DrugCategory` not yet in the union (e.g. `nitrate`, `fibrate`),
STOP and add it to the union in `src/types/drug.ts:1-43` as part of this step — an invalid
category string would pass JSON but break type intent. `fibrate` and `nitrate` are NOT in the
current union; they MUST be added. (Verify against the union before writing.)

- [ ] **Step 3: Author class-rule interaction pairs**

For interactions that are textbook class rules (not dependent on OpenFDA text), add
`classRulePairs` entries. Minimum set: gemfibrozil/fenofibrate ↔ each statin (6 statins present);
isosorbide ↔ sildenafil/tadalafil (contraindicated); selegiline/phenelzine ↔ serotonergic drugs
already present (SSRIs/SNRIs/tramadol/dextromethorphan); pseudoephedrine ↔ MAOIs. Every entry
needs `classRuleBasis`. Do NOT add CYP/label-dependent pairs here — those come from OpenFDA in Task 5.

- [ ] **Step 4: Validate the curation list is well-formed JSON and self-consistent**

Run:
```bash
cd /Users/macmini/coding/clearrx
node -e '
const c=require("./scripts/curation-list.json");
const newIds=new Set(c.drugs.map(d=>d.id));
const db=require("./public/data/drug-db.json");
const existing=new Set(db.drugs.map(d=>d.id));
let bad=0;
c.drugs.forEach(d=>{ if(existing.has(d.id)){console.log("DUP existing drug:",d.id);bad++;} });
c.classRulePairs.forEach(p=>{
  const k=[p.drugA_id,p.drugB_id].sort().join("::");
  if(k!==p.pairKey){console.log("pairKey mismatch:",p.pairKey,"expected",k);bad++;}
  if(!p.classRuleBasis){console.log("missing classRuleBasis:",p.pairKey);bad++;}
  [p.drugA_id,p.drugB_id].forEach(id=>{ if(!existing.has(id)&&!newIds.has(id)){console.log("unknown drug in pair:",id,"("+p.pairKey+")");bad++;} });
});
console.log(bad===0?"CURATION LIST OK ("+c.drugs.length+" drugs, "+c.classRulePairs.length+" class pairs)":"FOUND "+bad+" PROBLEMS");
process.exit(bad===0?0:1);
'
```
Expected: `CURATION LIST OK (...)`, exit 0. Fix any reported problems before continuing.

- [ ] **Step 5: Commit**

```bash
git add scripts/curation-list.json src/types/drug.ts
git commit -m "feat(data): author new drug records + class-rule curation list (WS-C authoring)"
```

---

## Task 2: WS-A — add `theoretical` to EvidenceLevel (issue C)

**Files:**
- Modify: `src/types/drug.ts:46`

- [ ] **Step 1: Confirm the data actually uses it**

Run:
```bash
cd /Users/macmini/coding/clearrx
node -e 'const d=require("./public/data/drug-db.json");const ev={};d.interactions.forEach(i=>ev[i.evidenceLevel]=(ev[i.evidenceLevel]||0)+1);console.log(ev);'
```
Expected: output includes `theoretical: 7` (the drift this fixes).

- [ ] **Step 2: Edit the union**

In `src/types/drug.ts:46`, change:
```ts
export type EvidenceLevel = "established" | "probable" | "suspected";
```
to:
```ts
export type EvidenceLevel = "established" | "probable" | "suspected" | "theoretical";
```

- [ ] **Step 3: Verify types still compile**

Run: `npx tsc --noEmit`
Expected: exit 0, no errors.

- [ ] **Step 4: Commit**

```bash
git add src/types/drug.ts
git commit -m "fix(types): add theoretical to EvidenceLevel union (data already uses it)"
```

---

## Task 3: WS-A — de-stale version in scripts (issue E)

Scripts hard-code `version: "2.0.0"`; running them would downgrade the live 3.0.0 DB.

**Files:**
- Modify: `scripts/rebuild-search-index.cjs:22-30`
- Modify: `scripts/merge-db.cjs:241-246`

- [ ] **Step 1: Fix rebuild-search-index.cjs**

In `scripts/rebuild-search-index.cjs`, the `version` object is hard-coded. Replace the
hard-coded version/updated write so it reads from the DB already loaded as `db`:
```js
// version.json now mirrors drug-db.json (no hard-coded version)
const version = {
  version: db.version,
  updated: db.lastUpdated,
};
```
And update the final log line to `console.log('Version updated to', db.version);`.

- [ ] **Step 2: Fix merge-db.cjs**

In `scripts/merge-db.cjs`, the `finalDB` object hard-codes `version: '2.0.0'` and
`lastUpdated: '2026-03-08'`. This script is a relic (reads non-existent `temp/db_*.json`)
and is NOT used by this plan, but de-stale it for safety: change those two literals to read
from the loaded `orig` object:
```js
  version: orig.version,
  lastUpdated: orig.lastUpdated,
```
(Leave the rest of the relic untouched — out of scope to revive it.)

- [ ] **Step 3: Verify rebuild script is non-destructive to version**

Run:
```bash
cd /Users/macmini/coding/clearrx
cp public/data/version.json /tmp/version.bak.json
node scripts/rebuild-search-index.cjs
node -e 'const v=require("./public/data/version.json");console.log(v.version==="3.0.0"?"VERSION PRESERVED 3.0.0":"FAIL: "+v.version);'
```
Expected: `VERSION PRESERVED 3.0.0` (previously this would have written 2.0.0).
Then restore if index changed unexpectedly: `git checkout public/data/version.json public/data/drug-search-index.json` (the real regen happens in Task 6).

- [ ] **Step 4: Commit**

```bash
git add scripts/rebuild-search-index.cjs scripts/merge-db.cjs
git commit -m "fix(scripts): read version from drug-db instead of hard-coded 2.0.0 (no silent downgrade)"
```

---

## Task 4: WS-A — turn validate-db.cjs into an exit-coded gate (issue F)

**Files:**
- Modify (rewrite): `scripts/validate-db.cjs`

- [ ] **Step 1: Write a corrupted-fixture test first (test-first for the gate)**

Create a throwaway corrupt DB and assert the (not-yet-written) gate rejects it. Run:
```bash
cd /Users/macmini/coding/clearrx
mkdir -p /tmp/clearrx-fixtures
node -e '
const db=require("./public/data/drug-db.json");
const bad=JSON.parse(JSON.stringify(db));
bad.interactions.push({pairKey:"zzz::aaa",drugA_id:"nonexistent",drugB_id:"warfarin",severity:"explode",mechanism:"x",evidenceLevel:"made-up",source:"bundle",lastReviewed:"2026-05-31"});
require("fs").writeFileSync("/tmp/clearrx-fixtures/bad-db.json",JSON.stringify(bad));
console.log("fixture written");
'
```
Expected: `fixture written`. (This fixture has a dangling ref, invalid severity, invalid evidenceLevel, and unsorted pairKey.)

- [ ] **Step 2: Rewrite validate-db.cjs as a gate**

Replace `scripts/validate-db.cjs` entirely. It must accept an optional path arg
(default `../public/data/drug-db.json`), keep the existing human-readable report, then run
checks and `process.exit(1)` if any fail:

```js
#!/usr/bin/env node
'use strict';
const fs = require('fs');
const path = require('path');

const dbPath = process.argv[2]
  ? path.resolve(process.argv[2])
  : path.join(__dirname, '../public/data/drug-db.json');
const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

const VALID_SEVERITY = new Set(['contraindicated', 'serious', 'moderate', 'minor', 'none']);
const VALID_EVIDENCE = new Set(['established', 'probable', 'suspected', 'theoretical']);
const VALID_SOURCE = new Set(['bundle', 'openfda', 'derived']);

const errors = [];
const ids = new Set();
db.drugs.forEach((d) => {
  if (ids.has(d.id)) errors.push(`duplicate drug id: ${d.id}`);
  ids.add(d.id);
  if (typeof d.interactionRiskScore !== 'number' || d.interactionRiskScore < 0 || d.interactionRiskScore > 10)
    errors.push(`riskScore out of 0-10: ${d.id} (${d.interactionRiskScore})`);
});

const pairKeys = new Set();
db.interactions.forEach((i) => {
  if (!ids.has(i.drugA_id)) errors.push(`dangling drugA_id: ${i.drugA_id} (${i.pairKey})`);
  if (!ids.has(i.drugB_id)) errors.push(`dangling drugB_id: ${i.drugB_id} (${i.pairKey})`);
  const expect = [i.drugA_id, i.drugB_id].sort().join('::');
  if (i.pairKey !== expect) errors.push(`pairKey != sorted(A,B): ${i.pairKey} expected ${expect}`);
  if (i.drugA_id === i.drugB_id) errors.push(`self-pair: ${i.pairKey}`);
  if (pairKeys.has(i.pairKey)) errors.push(`duplicate pairKey: ${i.pairKey}`);
  pairKeys.add(i.pairKey);
  if (!VALID_SEVERITY.has(i.severity)) errors.push(`invalid severity: ${i.severity} (${i.pairKey})`);
  if (!VALID_EVIDENCE.has(i.evidenceLevel)) errors.push(`invalid evidenceLevel: ${i.evidenceLevel} (${i.pairKey})`);
  if (!VALID_SOURCE.has(i.source)) errors.push(`invalid source: ${i.source} (${i.pairKey})`);
});

console.log('=== VALIDATION ===');
console.log('File:', dbPath);
console.log('Drugs:', db.drugs.length, '| Interactions:', db.interactions.length);
const sev = {};
db.interactions.forEach((i) => { sev[i.severity] = (sev[i.severity] || 0) + 1; });
console.log('By severity:', JSON.stringify(sev));

if (errors.length) {
  console.error(`\n❌ ${errors.length} ERROR(S):`);
  errors.slice(0, 50).forEach((e) => console.error('  -', e));
  process.exit(1);
}
console.log('\n✅ All integrity checks passed.');
process.exit(0);
```

- [ ] **Step 3: Verify the gate REJECTS the bad fixture**

Run: `node scripts/validate-db.cjs /tmp/clearrx-fixtures/bad-db.json; echo "exit=$?"`
Expected: prints `❌` errors (dangling, invalid severity, invalid evidenceLevel, pairKey mismatch) and `exit=1`.

- [ ] **Step 4: Verify the gate ACCEPTS the real DB**

Run: `node scripts/validate-db.cjs; echo "exit=$?"`
Expected: `✅ All integrity checks passed.` and `exit=0`.

- [ ] **Step 5: Commit**

```bash
git add scripts/validate-db.cjs
git commit -m "feat(scripts): make validate-db an exit-coded integrity gate (WS-A/F)"
```

---

## Task 5: WS-C integration — expand-db write path

**Files:**
- Create: `scripts/expand-db.cjs`
- Modify: `public/data/drug-db.json` (via script)

- [ ] **Step 1: Merge new drug records into drug-db.json, then run OpenFDA discovery**

`scripts/fetch-openfda.mjs` reads its drug list from `public/data/drug-db.json` at runtime
(confirmed: it does `const db = JSON.parse(...drug-db.json); const drugs = db.drugs;`). So the
new drug records must be written into the DB first for discovery to target them.

⚠️ **This step mutates `drug-db.json` (drugs only, no interactions yet).** This is an
intentional intermediate state. It is NOT committed on its own — the commit happens at Task 5
Step 6 after interactions are added and the gate passes. If you abort between here and Step 6,
recover with `git checkout public/data/drug-db.json` and restart Task 5.

```bash
cd /Users/macmini/coding/clearrx
node -e '
const fs=require("fs");
const db=require("./public/data/drug-db.json");
const c=require("./scripts/curation-list.json");
const ids=new Set(db.drugs.map(d=>d.id));
c.drugs.forEach(d=>{ if(!ids.has(d.id)) db.drugs.push(d); });
db.drugs.sort((a,b)=>a.id.localeCompare(b.id));
fs.writeFileSync("./public/data/drug-db.json",JSON.stringify(db,null,2));
console.log("drugs merged for discovery:",db.drugs.length);
'
node scripts/fetch-openfda.mjs
```
Expected: drug count rises by ~24; `scripts/openfda-report.json` regenerated with new
`potentialNewPairs`. (Drug records are now in the DB; interactions are NOT yet — that is Step 3.)

**If OpenFDA is unreachable or returns nothing** (network failure, rate limit, or
`potentialNewPairs: []`): that is acceptable. The expansion proceeds with class-rule pairs only
(Task 1's `classRulePairs`); skip the `openfdaConfirmedPairs` work in Step 3 and note in the
Task 5 commit message that OpenFDA discovery yielded no confirmed pairs. The drug records and
class-rule interactions alone still constitute a valid, fully-sourced expansion.

- [ ] **Step 2: Write expand-db.cjs**

Create `scripts/expand-db.cjs` that merges sourced interactions only:
```js
#!/usr/bin/env node
'use strict';
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
const dbPath = path.join(root, 'public/data/drug-db.json');

const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
const curation = JSON.parse(fs.readFileSync(path.join(__dirname, 'curation-list.json'), 'utf8'));
const ids = new Set(db.drugs.map((d) => d.id));
const existingPairs = new Set(db.interactions.map((i) => i.pairKey));

let added = 0;

// 1) class-rule pairs (strip the justification field before storing)
curation.classRulePairs.forEach((p) => {
  if (existingPairs.has(p.pairKey)) return;
  if (!ids.has(p.drugA_id) || !ids.has(p.drugB_id)) return;
  const { classRuleBasis, ...entry } = p; // eslint-disable-line no-unused-vars
  db.interactions.push(entry);
  existingPairs.add(p.pairKey);
  added++;
});

// 2) OpenFDA-evidenced pairs — ONLY those the operator has confirmed and listed
//    in curation-list.openfdaConfirmedPairs[] (a curated allowlist, NOT the raw report).
(curation.openfdaConfirmedPairs || []).forEach((p) => {
  if (existingPairs.has(p.pairKey)) return;
  if (!ids.has(p.drugA_id) || !ids.has(p.drugB_id)) return;
  db.interactions.push({ ...p, source: 'openfda' });
  existingPairs.add(p.pairKey);
  added++;
});

db.interactions.sort((a, b) => a.pairKey.localeCompare(b.pairKey));
db.drugs.sort((a, b) => a.id.localeCompare(b.id));
db.version = '3.1.0';
db.lastUpdated = '2026-05-31';

fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
console.log(`expand-db: added ${added} interactions | total ${db.interactions.length} | version ${db.version}`);
```

- [ ] **Step 3: Curate OpenFDA-confirmed pairs into the allowlist**

Review `scripts/openfda-report.json` `potentialNewPairs`. For each pair that is clinically
real (validate the specific generic↔generic, not a class-name match per `scripts/README.md`),
add an entry to a new `openfdaConfirmedPairs` array in `scripts/curation-list.json` with full
`DrugInteraction` fields (pairKey sorted, mechanism grounded in the label excerpt,
evidenceLevel honest, lastReviewed "2026-05-31"). Pairs you cannot confirm are NOT added.
This is the anti-fabrication checkpoint (memory `feedback_subagent_fabrication_risk`):
**every** stored interaction traces to a label excerpt or a `classRuleBasis`.

- [ ] **Step 4: Run the expansion**

Run: `node scripts/expand-db.cjs`
Expected: `expand-db: added N interactions | total ... | version 3.1.0`.

- [ ] **Step 5: Anti-fabrication grep — every new pair has a basis**

Run:
```bash
cd /Users/macmini/coding/clearrx
node -e '
const c=require("./scripts/curation-list.json");
const cls=new Set(c.classRulePairs.map(p=>p.pairKey));
const ofda=new Set((c.openfdaConfirmedPairs||[]).map(p=>p.pairKey));
const db=require("./public/data/drug-db.json");
let unsourced=0;
db.interactions.forEach(i=>{
  if((i.source==="bundle"||i.source==="openfda") && i.lastReviewed==="2026-05-31"){
    if(!cls.has(i.pairKey)&&!ofda.has(i.pairKey)){console.log("NEW PAIR WITHOUT BASIS:",i.pairKey);unsourced++;}
  }
});
console.log(unsourced===0?"ALL NEW PAIRS TRACE TO A BASIS":"FOUND "+unsourced+" UNSOURCED");
process.exit(unsourced===0?0:1);
'
```
Expected: `ALL NEW PAIRS TRACE TO A BASIS`, exit 0.

- [ ] **Step 6: Commit**

```bash
git add scripts/expand-db.cjs scripts/curation-list.json scripts/openfda-report.json public/data/drug-db.json
git commit -m "feat(data): expand DB with ~24 risk-first drugs + sourced interactions (WS-C integration)"
```

---

## Task 6: WS-C integration — regenerate index + run gate

**Files:**
- Modify: `public/data/drug-search-index.json`, `public/data/version.json` (via script)

- [ ] **Step 1: Rebuild the search index (now version-aware from Task 3)**

Run: `node scripts/rebuild-search-index.cjs`
Expected: `Search index rebuilt: ~221 entries` and `Version updated to 3.1.0`.

- [ ] **Step 2: Verify index ↔ db sync**

Run:
```bash
cd /Users/macmini/coding/clearrx
node -e '
const db=require("./public/data/drug-db.json");
const idx=require("./public/data/drug-search-index.json");
const dids=new Set(db.drugs.map(d=>d.id)), iids=new Set(idx.map(e=>e.id));
const a=[...dids].filter(x=>!iids.has(x)), b=[...iids].filter(x=>!dids.has(x));
console.log("db count",db.drugs.length,"| idx count",idx.length);
console.log(a.length===0&&b.length===0?"INDEX IN SYNC":"OUT OF SYNC db-only:"+a+" idx-only:"+b);
'
```
Expected: counts equal, `INDEX IN SYNC`.

- [ ] **Step 3: Run the integrity gate**

Run: `node scripts/validate-db.cjs; echo "exit=$?"`
Expected: `✅ All integrity checks passed.`, `exit=0`.

- [ ] **Step 4: Verify build still passes**

Run: `npx tsc --noEmit && npm run build`
Expected: tsc exit 0; Next build completes (static export to `out/`).

- [ ] **Step 5: Commit**

```bash
git add public/data/drug-search-index.json public/data/version.json
git commit -m "chore(data): regenerate search index + version for 3.1.0 expansion"
```

---

## Task 7: WS-B — revive orphaned pharmacist content (bug A)

`explanations.json` (15 entries) is fetched by nobody; `InteractionModal.plainEnglish` is
never passed. Wire it through.

**Files:**
- Modify: `src/types/drug.ts` (add `Explanation`)
- Modify: `src/lib/interaction-engine.ts` (add `getExplanation`)
- Modify: `src/app/page.tsx` (fetch + inject)
- Modify: `src/components/InteractionModal.tsx` (pharmacist-note badge)

- [ ] **Step 1: Add the Explanation type**

In `src/types/drug.ts`, after the `DrugInteraction` interface, add:
```ts
export interface Explanation {
  pairKey: string;
  plainEnglish: string;
  lastReviewed: string;
  reviewedBy: string;
}
```

- [ ] **Step 2: Add getExplanation() to interaction-engine.ts**

In `src/lib/interaction-engine.ts`, mirror the `getDatabase()` cache pattern (lines 4-11):
```ts
let explanations: Record<string, Explanation> | null = null;

export async function getExplanation(pairKey: string): Promise<Explanation | undefined> {
  if (!explanations) {
    const res = await fetch("/data/explanations.json");
    explanations = await res.json();
  }
  return explanations![pairKey];
}
```
Add `Explanation` to the type import at the top of the file.

- [ ] **Step 3: Wire it into page.tsx**

In `src/app/page.tsx`: import `getExplanation`; add state
`const [activeExplanation, setActiveExplanation] = useState<string | undefined>(undefined);`.
When an interaction is selected (the `setSelectedInteraction` paths — `handleEdgeClick` and
ResultsPanel's `onSelectInteraction`), also resolve its explanation. Simplest: add an effect:
```tsx
useEffect(() => {
  if (selectedInteraction) {
    getExplanation(selectedInteraction.pairKey).then((e) => setActiveExplanation(e?.plainEnglish));
  } else {
    setActiveExplanation(undefined);
  }
}, [selectedInteraction]);
```
Then pass it: `<InteractionModal interaction={selectedInteraction} plainEnglish={activeExplanation} ... />`
(the prop already exists at `InteractionModal.tsx:50` and renders at lines 146-152).

- [ ] **Step 4: Verify wiring in the running app**

Run: `npm run dev` then open `http://localhost:3000/?drugs=aspirin,warfarin`. Click the
aspirin+warfarin interaction. Expected: the pharmacist plain-English paragraph (from
`explanations.json`) appears in the modal. (This pair has an explanation entry — confirmed.)
Stop dev server after confirming.

- [ ] **Step 5: Commit**

```bash
git add src/types/drug.ts src/lib/interaction-engine.ts src/app/page.tsx
git commit -m "fix(ux): wire orphaned pharmacist explanations into interaction modal (WS-B/A)"
```

---

## Task 8: WS-D 3a — degree-0 coverage warning (issue H)

Prevent "all safe ✓" when a selected drug simply has no data.

**Files:**
- Modify: `src/components/ResultsPanel.tsx` (props + green-panel guard)
- Modify: `src/app/page.tsx` (pass selected drug ids + degree-0 set)

- [ ] **Step 1: Compute the degree-0 set once, in the engine**

In `src/lib/interaction-engine.ts`, add:
```ts
export async function getZeroCoverageIds(): Promise<Set<string>> {
  const { drugs, interactions } = await getDatabase();
  const covered = new Set<string>();
  interactions.filter((i) => i.severity !== "none").forEach((i) => {
    covered.add(i.drugA_id);
    covered.add(i.drugB_id);
  });
  return new Set(drugs.filter((d) => !covered.has(d.id)).map((d) => d.id));
}
```
This is the exact predicate from the spec: degree 0 = zero interactions with severity ≠ none, across the whole DB.

- [ ] **Step 2: Thread selected-drug coverage into ResultsPanel**

In `src/app/page.tsx`, resolve the zero-coverage set (once, via effect/state) and compute which
*currently selected* drugs are degree-0:
```tsx
const [zeroCovSelected, setZeroCovSelected] = useState<string[]>([]);
useEffect(() => {
  getZeroCoverageIds().then((zc) => {
    setZeroCovSelected(selectedDrugs.filter((d) => zc.has(d.id)).map((d) => d.name));
  });
}, [selectedDrugs]);
```
Pass `lowCoverageDrugs={zeroCovSelected}` to both `<ResultsPanel>` instances (lines 133, 146).

- [ ] **Step 3: Add the prop + guard in ResultsPanel**

In `src/components/ResultsPanel.tsx`: add `lowCoverageDrugs?: string[];` to `Props` (line 5-8).
At the `allSafe` block (line 276 `if (allSafe) {`), change the condition so the green panel only
shows when there are no significant interactions AND no low-coverage selected drugs:
```tsx
const hasLowCoverage = (lowCoverageDrugs?.length ?? 0) > 0;
if (allSafe && !hasLowCoverage) {
  // existing green "all safe" panel
}
if (allSafe && hasLowCoverage) {
  // NEW: amber coverage-warning panel
  // "No known interactions found in our database for {lowCoverageDrugs.join(', ')}.
  //  This is different from 'no interactions exist.' We may not yet have data for these medications."
}
```
Reuse the existing panel's layout/inline-style idiom (it uses inline styles, not Tailwind utilities — match it). Use an amber/caution color (e.g. `var(--severity-moderate)` if defined, else `#DD6B20`), not green.

- [ ] **Step 4: Verify in the running app**

Run `npm run dev`. Open `http://localhost:3000/?drugs=lansoprazole,loratadine` (both degree-0).
Expected: the amber coverage warning naming both drugs — NOT the green "all safe" panel.
Then open `?drugs=aspirin,warfarin` and confirm normal interaction results still render. Stop dev server.

- [ ] **Step 5: Commit**

```bash
git add src/lib/interaction-engine.ts src/app/page.tsx src/components/ResultsPanel.tsx
git commit -m "fix(ux): show coverage warning instead of 'all safe' for zero-data drugs (WS-D/H)"
```

---

## Task 9: WS-D 3b — source/pharmacist badges + copy honesty (issues B, A)

**Files:**
- Modify: `src/components/InteractionModal.tsx` (source badge + pharmacist-note badge)
- Modify: `src/app/about/page.tsx`, `src/app/faq/page.tsx`, `src/app/page.tsx` (copy)

- [ ] **Step 1: Add source badge to InteractionModal**

In `src/components/InteractionModal.tsx`, near the existing `evidenceLevel` badge (line 134-136),
add a source badge mapping `interaction.source`:
```tsx
const SOURCE_LABEL: Record<string, string> = { bundle: "Curated", derived: "Class-based", openfda: "FDA label" };
```
Render `SOURCE_LABEL[interaction.source]` in the same monospace badge style as the evidence line.

- [ ] **Step 2: Add a "Pharmacist's note" badge when plainEnglish is present**

The plain-English block (lines 146-153) renders when `plainEnglish` is set (wired in Task 7).
Add a small "Pharmacist's note" label/badge above that block so the reviewed content is
visibly distinguished from auto-compiled mechanism text.

- [ ] **Step 3: Honest copy — about page**

In `src/app/about/page.tsx`, find claims implying *every* interaction is pharmacist-written/
reviewed (e.g. around line 145-152, "plain-English explanations", "interaction explanations are…").
Reframe to the neutral positioning: the database is **compiled from FDA labels and clinical
literature**, with **key pairs** carrying a pharmacist's plain-language note. Keep Jay's real
credentials/E-E-A-T; remove any per-interaction "reviewed by a pharmacist" overclaim.
Direction stays FROM ClearRx TO the reader.

- [ ] **Step 4: Honest copy — faq + hero**

In `src/app/faq/page.tsx` and the `src/app/page.tsx` hero (line ~70, "Written by a licensed
pharmacist."), adjust the same way: accurate about authorship/compilation, no claim that all
1,266 interactions are individually pharmacist-reviewed. Hero can become e.g. "Compiled from FDA
labels & clinical literature — with pharmacist plain-language notes on key pairs."

- [ ] **Step 5: Verify no overclaim remains + build**

Run:
```bash
cd /Users/macmini/coding/clearrx
grep -rniE "every interaction|all interactions|each interaction.*(review|written by)|reviewed by a (licensed )?pharmacist" src/app src/components || echo "NO PER-INTERACTION OVERCLAIM FOUND"
npx tsc --noEmit && npm run build
```
Expected: no overclaiming matches (or only acceptable context you've verified); tsc exit 0; build completes.

- [ ] **Step 6: Commit**

```bash
git add src/components/InteractionModal.tsx src/app/about/page.tsx src/app/faq/page.tsx src/app/page.tsx
git commit -m "feat(ux): source + pharmacist-note badges; honest DB-compilation copy (WS-D/B)"
```

---

## Final verification (definition of done, spec §7)

- [ ] **Step 1: Full gate + build**

Run:
```bash
cd /Users/macmini/coding/clearrx
node scripts/validate-db.cjs; echo "gate exit=$?"
npx tsc --noEmit; echo "tsc exit=$?"
npm run build
```
Expected: gate exit 0, tsc exit 0, build completes.

- [ ] **Step 2: Manual smoke (running app)**

`npm run dev`, then verify:
- `?drugs=aspirin,warfarin` → pharmacist note renders in modal; source badge shows.
- `?drugs=lansoprazole,loratadine` → amber coverage warning, not green "all safe".
- a new drug (e.g. `?drugs=gemfibrozil,simvastatin`) → the class-rule interaction shows.

- [ ] **Step 3: Confirm drug count + sourcing**

Run:
```bash
node -e 'const d=require("./public/data/drug-db.json");const s={};d.interactions.forEach(i=>s[i.source]=(s[i.source]||0)+1);console.log("drugs",d.drugs.length,"interactions",d.interactions.length,"sources",JSON.stringify(s));'
```
Expected: ~221 drugs; sources include `openfda` and/or new `bundle` entries; every new pair traceable (Task 5 Step 5 already proved this).
