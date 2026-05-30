# ClearRx — Data Integrity & Risk-First Expansion — Design Document

> Date: 2026-05-31
> Author: Jay (Licensed Pharmacist, Senior Pharmaceutical Researcher)
> Status: DRAFT — pending review
> Repo: https://github.com/leejaeyoung2026-bot/clearrx.git

---

## 1. Background & Problem Statement

ClearRx ships a static-export Next.js app whose data lives in `public/data/` and is
fetched at runtime. The single source of truth is `drug-db.json`
(`{version, lastUpdated, drugs[], interactions[]}`); `drug-search-index.json` and
`version.json` are derived from it by scripts in `scripts/`.

A read-only audit (2026-05-31) found the **structural** integrity is clean:

- 0 dangling interaction→drug references
- 0 pairKey sort/order errors, 0 duplicate pairKeys, 0 self-pairs
- search index 197/197 in sync, no name/genericName drift
- 0 missing required fields, all `interactionRiskScore` within 0–10

The problem is **not corruption — it is the absence of guarantees, plus several
trust/semantic gaps**. The database is clean by discipline, not by enforcement.

### Confirmed issues (evidence-based, severity-ordered)

| ID | Issue | Evidence |
|----|-------|----------|
| **A** | Pharmacist plain-English content is fully orphaned | `explanations.json` (15 entries) is fetched by no source file; `InteractionModal.plainEnglish` prop is never passed (`grep "plainEnglish=" src/` → 0). `interactions[]` carry 0 inline `plainEnglish`. The site advertises "plain-English written by a licensed pharmacist" but renders **zero**. |
| **B** | Source dilution vs. review claim | 945/1266 interactions (75%) are `source:"derived"`, batch-generated in the 2026-04 197-drug expansion. `managementStrategy` + `effectDirection` present in **derived 945/945, bundle 0/321** → automated layer. Content is pharmacologically plausible (class-effect templates: 12 mechanism prefixes reused 5–27×), but not individually pharmacist-reviewed — contradicting the "every interaction reviewed" copy. |
| **C** | Type drift | `evidenceLevel:"theoretical"` exists in 7 interactions, but `EvidenceLevel` union = `established\|probable\|suspected` (no `theoretical`). Runtime `fetch`-cast hides it from the type checker. |
| **E** | Build scripts are stale | `merge-db.cjs` and `rebuild-search-index.cjs` hard-code `version: "2.0.0"` on write (current DB is 3.0.0). Running them as documented would silently **downgrade** version and overwrite `lastUpdated`. `merge-db.cjs` also reads non-existent `temp/db_*.json`. |
| **F** | Validation is not a gate | `validate-db.cjs` only prints a report; it never sets a non-zero exit code. No CI. Nothing prevents A–E from recurring on the next expansion. |
| **H** | "No data" rendered as "safe" | 15 drugs have degree 0 (no non-`none` interactions): e.g. `lansoprazole`, `rabeprazole` (same PPI class as `omeprazole`, whose clopidogrel interaction is a flagship), `pioglitazone`, `famotidine`, antihistamines. Selecting only these shows the green "all safe ✓" panel — conflating data absence with risk absence. |

### Coverage analysis (why "shallow")

- 197 drugs, 1266 interactions, density 6.6% of 19,306 possible pairs.
- Degree distribution: **0: 15 drugs**, 1–2: 24, 3–5: 26, 6–10: 35, 11–20: 58, 21+: 39. Mean degree 12.9, max 54.
- Category composition is thick on chronic disease (antihypertensive 27, antidiabetic 17, antidepressant 16) but **thin on high-interaction-risk classes**: opioid 3, nsaid 3, corticosteroid 1, anticoagulant 4, antiplatelet 2, and **fibrate 0** (gemfibrozil/fenofibrate — a textbook statin-rhabdomyolysis interaction class — entirely absent).

## 2. Goals & Non-Goals

### Goals
1. **Honesty**: make the site's claims match the data ("neutral DB-compilation" positioning).
2. **Revive** the orphaned pharmacist content (fix the wiring bug).
3. **Prevent** "no data = safe" misreading for low-coverage drugs.
4. **Expand** ~24 high-interaction-risk drugs (197 → ~221), adding only interaction
   pairs that have a real source — never fabricated.
5. **Install a safety net** (validation gate + de-staled scripts) so the expansion
   cannot reintroduce A–F.

### Non-Goals (explicit YAGNI)
- **D** — unifying the dual CYP representation (`metabolism[]` vs legacy `cypSubstrate/Inhibitor/Inducer[]`, 48 drugs carry both). Separate session.
- **G** — wiring the 14 collected-but-unused Tier-3 fields into the UI. Separate session.
- **GitHub Actions CI** — local `validate-db` gate only this round.
- Full pharmacist re-review of the 945 derived interactions — resolved by positioning, not by re-review.

## 3. Guiding Principle — "Expansion = 13× review"

Each new drug averages ~13 potential pairs against the existing 196. 24 new drugs
≈ ~300 candidate pairs. Naïvely generating all of them would reproduce the issue-B
fabrication risk. Therefore the **hard rule** for all new interaction data:

> A new interaction pair is created **only** when it has a real basis — an OpenFDA
> label mention or an explicit, documented class rule. The `source` field is set
> honestly (`openfda` / `bundle`). When no basis exists, the pair is **left out**
> (not filled with plausible text). Only pairs that pass the `validate-db` gate are
> merged. A drug legitimately having few interactions is an acceptable outcome.

This is why "expansion" and "data integrity" are one piece of work, not two.

## 4. New Drug Candidates (~24, risk-first)

Only drugs **not already** in the 197. Ordered by clinical interaction importance.

| Class (current→after) | New candidates | Why high-risk |
|---|---|---|
| Opioid (3→8) | morphine, fentanyl, codeine, methadone, buprenorphine | CNS + respiratory depression core; methadone adds QT prolongation. Top-prescribed yet near-empty. |
| NSAID (3→7) | meloxicam, celecoxib, ketorolac, diclofenac | Bleeding/renal; celecoxib (COX-2) and ketorolac (high-risk) do not generalize from the class. |
| Corticosteroid (1→4) | dexamethasone, methylprednisolone, prednisolone | dexamethasone is a strong CYP3A4 inducer (large omission impact). |
| Fibrate (0→2) | gemfibrozil, fenofibrate | Statin co-administration → rhabdomyolysis. Class currently absent entirely. |
| Nitrate (0→1) | isosorbide (mono/dinitrate) | Absolute contraindication with PDE5 inhibitors (sildenafil/tadalafil already present) — fatal hypotension. |
| MAOI (reinforce) | selegiline | Only phenelzine present; serotonin/tyramine crisis. |
| OTC high-risk | pseudoephedrine, dextromethorphan | MAOI hypertensive crisis / serotonin; OTC so taken unknowingly. |
| Antilipid (adjunct) | ezetimibe | Frequent statin co-prescription. |

Total ≈ 24 → **197 + 24 = ~221 drugs**.

**Intentionally excluded this round:** hydromorphone/tapentadol (opioid class covered),
niacin/hydralazine (lower frequency), 1st-gen antihistamines (class-generalizable).

Final exact list is confirmed at implementation start; additions/removals are a
pharmacist judgment call and do not change the architecture.

## 5. Workstreams (dependency-ordered)

Order rationale: install the safety net first, then the low-risk wiring fix, then the
risk-bearing expansion (protected by the net), then UI/positioning.

### WS-A — Trust infrastructure (the expansion's safety net)
- **C**: add `"theoretical"` to the `EvidenceLevel` union in `src/types/drug.ts`
  (data already uses it; 7 interactions become type-valid).
- **F**: convert `scripts/validate-db.cjs` into a true gate — exit code 1 when any of:
  dangling drug reference, duplicate pairKey, pairKey ≠ sorted(drugA,drugB), self-pair,
  invalid `severity` enum, invalid `evidenceLevel` enum, drug id collision,
  `interactionRiskScore` out of 0–10. Keep the existing human-readable report output.
- **E**: in `merge-db.cjs` and `rebuild-search-index.cjs`, replace the hard-coded
  `"2.0.0"` with the version read from `drug-db.json` (re-running must never downgrade).
  Note the `temp/db_*.json` path in `merge-db.cjs` is a one-off relic; this round uses a
  documented expansion path (see WS-C) rather than relying on `merge-db.cjs`'s relic inputs.

**Verify:** `node scripts/validate-db.cjs` exits 0 on the current clean DB; a
deliberately corrupted copy exits 1 with a clear message.

### WS-B — Revive pharmacist content (fixes bug A)
- Add `getExplanation(pairKey): Promise<Explanation | undefined>` to
  `src/lib/interaction-engine.ts` — fetch `/data/explanations.json` once, module-cache
  it (same pattern as `getDatabase`). Define an `Explanation` type
  (`{pairKey, plainEnglish, lastReviewed, reviewedBy}`) in `src/types/drug.ts`.
- In `src/app/page.tsx`, when opening the modal for a pairKey, look up the explanation
  and pass it to `InteractionModal`'s existing `plainEnglish` prop (and surface
  `reviewedBy` as a "Pharmacist's note" badge — see WS-D).
- No schema change to `explanations.json`; it stays a separate bonus layer.

**Verify:** selecting a covered pair (e.g. aspirin + warfarin) renders the plain-English
text in the modal — confirmed by running the app, not just by code inspection.

### WS-C — Risk-first drug expansion (protected by WS-A gate)
1. Add the ~24 new drug records to `drug-db.json` (full `Drug` shape: id, genericName,
   brandNames, categories, interactionRiskScore, otcRx, plus Tier-3 metadata where known;
   unknown optional fields omitted, not guessed).
2. Run `scripts/fetch-openfda.mjs` (re-targeted to include the new drugs **and** the
   existing degree-0/low-coverage drugs) to discover label-evidenced pairs.
3. Create new interaction entries **only** for pairs with a real basis:
   - OpenFDA label mention → `source:"openfda"`, mechanism grounded in the label excerpt.
   - Explicit documented class rule (e.g. fibrate↔statin, nitrate↔PDE5) → `source:"bundle"`.
   - No basis → not created.
   - `lastReviewed` set to the work date; `evidenceLevel` chosen honestly.
4. Bump `drug-db.json` `version`/`lastUpdated`.
5. Run `scripts/rebuild-search-index.cjs` (now version-aware per WS-A) to regenerate
   `drug-search-index.json` and `version.json`.
6. Run the WS-A `validate-db` gate; only a passing DB is committed.

**Anti-fabrication control (memory `feedback_subagent_fabrication_risk`):** if any part
of step 3 is delegated to a subagent, the subagent must cite the OpenFDA excerpt or the
named class rule for every pair; a post-step `grep`/review confirms no pair lacks a
`source` basis. Pairs without citations are dropped, not kept.

**Verify:** every newly added interaction has `source` ∈ {openfda, bundle} with a
traceable basis; `validate-db` exits 0; `npm run build` passes.

### WS-D — Framing + positioning honesty
- **3a (framing, fabrication-risk 0):** in `src/components/ResultsPanel.tsx`, the
  "all safe ✓" green panel must NOT show when any selected drug is low-coverage
  (degree 0 in the loaded DB). Instead show: *"No known interactions found in our
  database for [drug(s)] — this is different from 'no interactions exist.'"* naming the
  low-coverage drug(s). The low-coverage set is computed from the loaded data at runtime,
  not hard-coded.
- **source badge:** add a `source` badge to `InteractionModal` next to the existing
  `evidenceLevel` badge — `bundle→"Curated"`, `derived→"Class-based"`, `openfda→"FDA label"`.
- **Pharmacist's note badge:** when an explanation exists (WS-B), show a
  "Pharmacist's note" badge with the text.
- **copy honesty:** in `src/app/about/page.tsx`, `src/app/faq/page.tsx`, and
  `src/app/page.tsx` hero, replace claims that imply *every* interaction is
  pharmacist-written/reviewed with neutral phrasing: *"A drug-interaction database
  compiled from FDA labels and clinical literature; key pairs include a pharmacist's
  plain-language note."* Keep author E-E-A-T (Jay is a real licensed pharmacist) without
  overclaiming per-interaction review. Direction stays FROM ClearRx TO the user;
  exact wording adapts to each file's surrounding context.

**Verify:** selecting only a degree-0 drug shows the coverage warning (not "all safe");
source badges render; about/faq/hero contain no "every interaction reviewed" overclaim.

## 6. Data Flow (unchanged; wiring added)

```
drug-db.json ──fetch──> interaction-engine ──> useInteractionChecker ──> page
explanations.json ─[WS-B new wiring]─> getExplanation ──> InteractionModal   ← the severed line A
scripts: fetch-openfda → (curate, source-tagged) → drug-db.json
         → rebuild-search-index (version-aware, WS-A/E)
         → validate-db (exit-coded gate, WS-A/F)  ← must pass before commit
```

No change to the runtime architecture (static export + client-side fetch + pair lookup).
All changes are additive wiring, data, scripts, and copy.

## 7. Success Criteria (definition of done)

1. **WS-A**: `validate-db.cjs` exits 0 on clean DB, exits 1 on corrupted DB; scripts no
   longer downgrade version; `EvidenceLevel` includes `theoretical` and `tsc` is clean.
2. **WS-B**: a sampled covered pair renders pharmacist plain-English in the modal
   (verified by running the app).
3. **WS-C**: ~221 drugs; every new interaction carries a `source` with a traceable basis
   (OpenFDA excerpt or named class rule); `validate-db` exits 0.
4. **WS-D**: a degree-0 drug selected alone shows the coverage warning, not "all safe";
   source badges render; no per-interaction overclaim remains in about/faq/hero.
5. **Build**: `npm run build` passes; 0 type errors.

## 8. Risks & Mitigations

- **Fabrication during WS-C** → the §3 hard rule + WS-A gate + citation grep.
- **OpenFDA returns class names not generics** (per `scripts/README.md`) → human/pharmacist
  validation that a specific generic pair is relevant before adding; unconfirmed pairs dropped.
- **Copy honesty under-corrects or over-corrects** → reviewed against the "neutral DB
  compilation" positioning; author E-E-A-T retained, per-interaction review claims removed.
- **Scope creep into D/G** → explicitly non-goal; defer.
