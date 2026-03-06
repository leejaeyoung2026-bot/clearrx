# ClearRx — Design Document

> Date: 2026-03-07
> Author: Jay (Licensed Pharmacist, Senior Pharmaceutical Researcher)
> Status: APPROVED — ready for implementation planning
> Repo: https://github.com/leejaeyoung2026-bot/clearrx.git

---

## 1. Product Overview

**Name:** ClearRx
**Tagline:** *"Know before you swallow."*
**Domain:** `clearrx.vibed-lab.com`
**Repository:** `D:/coding/clearrx/` (standalone, mirrors existing subdomain pattern)

### What It Does
Users enter 2–10 medications they currently take. The app shows a visual network diagram — the **Interaction Map** — with drugs as nodes and interactions as colored edges. Severity: serious / moderate / minor / none. Each interaction comes with a plain-English explanation written by a licensed pharmacist. Users can share via URL, download a PNG, or export a "Bring to your doctor" PDF.

### Why It's Different from Drugs.com
- Clean, single-purpose UI (no ad clutter above the fold)
- Network visualization (graph, not a table)
- Plain-English explanations — not FDA label copy
- No login, no data sent to server (100% client-side)
- Author is a licensed pharmacist (E-E-A-T vs. anonymous content farms)

### Primary Goal
Google AdSense approval → sustained ad revenue.
Target vertical: Health/Pharmaceutical — **$14–$24 RPM** (one of the highest-paying categories).

---

## 2. Architecture Decision

### Repo Structure
```
D:/coding/clearrx/          ← new Next.js 15 repo
clearrx.vibed-lab.com       ← Vercel separate project
```

Consistent with existing pattern:
- `D:/coding/AI_conference_assistant` → `vora.vibed-lab.com`
- `D:/coding/PK-analyzer` → `pk.vibed-lab.com`
- `D:/coding/Backtesting` → `bt.vibed-lab.com`
- `D:/coding/clearrx` → `clearrx.vibed-lab.com` ✅

### Tech Stack
- **Framework:** Next.js 15, `output: "export"` (static HTML, Vercel)
- **Styling:** Tailwind CSS v4
- **Fonts:** DM Serif Display + DM Sans + DM Mono (match vibed-lab)
- **Graph library:** Cytoscape.js (better touch/click events than D3 for this use case)
- **Search:** Fuse.js (fuzzy matching for drug name typos)
- **PDF export:** jsPDF + html2canvas (client-side, no server)
- **PNG export:** html2canvas → PNG download
- **Analytics:** Google Analytics GA4 (existing G-6WTB59J1FT)
- **Ads:** Google AdSense (ca-pub-6874320463657568)

### Data Architecture
**Strategy: Hybrid — Static JSON Bundle + OpenFDA API fallback**

| File | Content | Gzip Size |
|------|---------|-----------|
| `drug-search-index.json` | 200 drug names + aliases | ~15 KB |
| `drug-db.json` | 200 drugs + ~1,500 interaction pairs | ~42 KB |
| `explanations.json` | Plain-English text for top 100 pairs | ~40 KB |
| **Total on first load** | | **~57 KB gzip (~16 KB brotli)** |

- **Fuzzy search:** Fuse.js, debounce 120ms, threshold 0.35 (handles "metaprolol", "lipator", etc.)
- **OpenFDA fallback:** `GET /drug/label.json?search=openfda.generic_name:"[name]"` for drugs not in bundle
- **Data freshness:** Service Worker stale-while-revalidate; `/data/version.json` check on load; auto-updates JSON without app rebuild
- **Pair key format:** `makePairKey(a, b) = [a, b].sort().join("::")` (canonical, order-independent)

### TypeScript Core Interfaces
```typescript
interface Drug {
  id: string;
  genericName: string;
  brandNames: string[];
  categories: DrugCategory[];
  interactionRiskScore: number;   // 0-10, drives node size in graph
  cypInhibitor?: string[];
  cypSubstrate?: string[];
  inBundle: boolean;
}

interface DrugInteraction {
  pairKey: string;               // "aspirin::warfarin"
  drugA_id: string;
  drugB_id: string;
  severity: "contraindicated" | "serious" | "moderate" | "minor" | "none";
  mechanism: string;             // 1-2 sentence pharmacological explanation
  plainEnglish?: string;         // 150-250 word patient text
  clinicalNote?: string;
  evidenceLevel: "established" | "probable" | "suspected";
  source: "bundle" | "openfda" | "derived";
  monitoringParameters?: string[];
  lastReviewed: string;
}
```

---

## 3. UX Design

### 3 Core Principles
1. **Calm Confidence** — Health anxiety is real. No red alert banners, no alarming language. Serious interactions presented in warm coral, not panic red.
2. **Progressive Disclosure** — Summary first, details on tap. Never show 47 warnings at once.
3. **Earned Simplicity** — Complex pharmacology, simple interface. Smart users, not simplified users.

### User Flow
```
Landing (search bar immediately visible, no scroll required)
  ↓
Drug input → Fuse.js autocomplete (min 2 chars, debounce 120ms)
  → chips appear; "Check Interactions" button activates at 2+ drugs
  ↓
Check Interactions clicked
  → client-side JSON lookup + OpenFDA fallback if needed
  → Interaction Map renders (Cytoscape.js force-directed layout)
  → Results Panel populates alongside
  ↓
User taps/clicks edge → Interaction Detail Modal
  (severity badge + plain-English explanation + "Add to Doctor Report")
  ↓
Share button → Share Modal
  (Copy Link / Share on X / Download PNG / Download PDF)
```

### Mobile Strategy
**List-first on mobile, graph on demand.**

- `< 640px`: Results accordion only (colored dot indicators per severity). "View Map" FAB → fullscreen Cytoscape overlay.
- `640–1023px`: Stacked, map on top (40vh), list below.
- `≥ 1024px`: Side-by-side — map (right) + results (left).

Rationale: Network graphs on 390px screens are unreadable. List view carries 100% of critical information. Graph remains available for users who want the visual overview.

### Empty & Edge States
| State | Behavior |
|-------|----------|
| 0 drugs | Landing hero IS the empty state — search bar prominently shown |
| 1 drug | CTA disabled with label "Add 1 more medication" |
| Duplicate drug | Autocomplete shows "already added" (gray check) |
| Unknown drug | Fuzzy suggestions + "Tell us what's missing" link (Formspree) |
| All safe result | Sage green check, full gray graph still shown (proves tool ran), PDF still offered |
| 10 drugs | Soft amber toast warning. Hard limit at 15 with modal explanation + Poison Control reference |

---

## 4. Visual Design

### Sub-Brand Color System
ClearRx inherits vibed-lab's base palette and adds a Teal-Slate accent:

| Token | Light | Dark |
|-------|-------|------|
| `--rx-accent` | `#2E7D7A` | `#3DA8A4` |
| `--rx-accent-mid` | `#4A9B97` | `#5BBDB9` |
| `--rx-accent-light` | `#D4EDEC` | `#0D2E2D` |

Severity colors (consistent across both modes):

| Severity | Color | Hex |
|----------|-------|-----|
| Serious | Warm Crimson | `#B83232` |
| Moderate | Burnt Amber | `#B86B1A` |
| Minor | Olive | `#7A8C2E` |
| None | Ink Faint | `#9A9490` |

### Headline
**"Know before you swallow."** — DM Serif Display, `clamp(3rem, 6vw, 6.5rem)`, italic second line in teal-slate.

### Drug Input
- Search field: 1px rule border → teal on focus, DM Sans 0.95rem
- Autocomplete dropdown: teal-bordered card, `#D4EDEC` hover fill
- Chips: `#D4EDEC` background, `1px #4A9B97` border, DM Mono 0.72rem, no border-radius (editorial)
- CTA: `#2E7D7A` background, disabled shows `#DDD9CF` with label change (never hidden)

### Interaction Map (Cytoscape.js)
- **Nodes:** White circles, `r=24` rest / `r=28` hover, `1.5px teal border`, DM Mono 8px label
- **Node size scales with** `interactionRiskScore` (warfarin = large hub)
- **Edges by severity:**

| Severity | Color | Width | Style |
|----------|-------|-------|-------|
| Serious | `#B83232` | 2.5px | Solid |
| Moderate | `#B86B1A` | 2px | Solid |
| Minor | `#7A8C2E` | 1.5px | Dashed |
| None | `#9A9490` | 1px | Dashed |

- **Click target:** Transparent 16px-wide invisible stroke on each edge (fat hit area for mobile)
- **Entry animation:** Nodes animate in from center, spread over 600ms ease-out

### Interaction Detail Modal
- Top 4px severity color strip
- Severity badge (uppercase mono, severity-colored background)
- Drug pair headline: DM Serif Display
- Summary (italic, left-bordered by severity color)
- 3 sections: Mechanism / Clinical Effect / Management
- "Add to Doctor Report" CTA + "I understand this risk" ghost button
- Backdrop blur 4px, click-outside closes, Escape key closes

### Shareable PNG Export (1200×630px)
- Paper background `#F2EFE7`, top 6px teal stripe
- Left (60%): drug chips + severity summary in DM Serif + "ClearRx" wordmark
- Right (40%): mini Cytoscape graph at 300px
- Bottom bar: `clearrx.vibed-lab.com` + "Reviewed by Jay, Licensed Pharmacist"

### Pharmacist Credibility Section (below tool)
- Pull quote in DM Serif italic, left-bordered teal stripe
- Stat: "125,000 deaths annually from drug interactions" (bolded)
- Jay's avatar (32px "J" initial, teal fill) + credential line
- Medical disclaimer in dashed-border box (amber dot prefix, NOT red)

---

## 5. Site Architecture & AdSense Strategy

### Page Structure
```
clearrx.vibed-lab.com/
  /                          Main tool + 700-900 words static content below
  /learn                     Educational hub index
  /learn/[slug]              Articles (10 pre-launch, 800+ words each)
  /about                     Jay's credentials page
  /privacy                   AdSense-compliant (DoubleClick disclosure)
  /contact
  /check/[drug-a]-[drug-b]  Phase 2: 50 static drug-pair pages
```

### Static Content on Tool Page (critical for AdSense)
Below the interactive tool, 700–900 words of crawlable content:
1. "How to Use ClearRx" (~120 words)
2. "What Drug Interactions Actually Are" (~200 words, Jay explains PK vs PD)
3. "When to Be Concerned" (~150 words, severity framework)
4. "From the Pharmacist — Why I Built This" (~150 words, Jay's story)
5. "Recent from Learn Hub" (3 article links)
6. Medical Disclaimer (full text, see below)

### Ad Placement (3 Units)
| Unit | Location | Format | Reason |
|------|----------|--------|--------|
| 1 | Tool page, after Learn Hub links | `display` responsive | Task-complete state, non-blocking |
| 2 | `/learn/[slug]` article midpoint | `in-article` fluid | Highest viewability in long-form |
| 3 | `/learn` hub, after 3rd article card | `in-feed` fluid | Low intrusion, matches card layout |

**Never:** Above the tool, between input and result, inside the graph container, sticky overlay.

### Schema Markup
- **Tool page:** `SoftwareApplication` + `MedicalWebPage` (two separate JSON-LD blocks)
- **Article pages:** `MedicalWebPage` (primary) + `FAQPage` (for list-format articles) + `BreadcrumbList`
- **All pages:** `reviewedBy` with Jay's pharmacist credentials + `lastReviewed` date

### Medical Disclaimer (exact text — use verbatim)
> The information provided by ClearRx is for educational and informational purposes only. It is not intended to substitute for professional medical advice, diagnosis, or treatment. Always consult a qualified healthcare provider, pharmacist, or physician before making any changes to your medications or medical regimen.
>
> Drug interaction information is provided for general awareness. The absence of an interaction in this tool does not guarantee that no interaction exists.
>
> ClearRx does not store, process, or transmit any medication information you enter. All interaction checks are performed locally in your browser.
>
> Jay is a licensed pharmacist and senior pharmaceutical researcher. Content on this site reflects professional knowledge and is reviewed for accuracy, but does not constitute a pharmacist-patient relationship or formal clinical consultation.
>
> If you believe you are experiencing a drug interaction emergency, call 911 or contact Poison Control at 1-800-222-1222 (US).

---

## 6. Pre-Launch Content Plan

### 10 Articles (write in this order)

| # | Title | Target Keyword | CPM Range |
|---|-------|---------------|-----------|
| 1 | What Is a Drug Interaction? A Pharmacist Explains | what is a drug interaction | $14–20 |
| 2 | I Built a Drug Interaction Checker as a Pharmacist | drug interaction checker | $16–22 |
| 3 | Metformin and Alcohol: What Diabetic Patients Need to Know | metformin alcohol interaction | $22–35 |
| 4 | Grapefruit and Medications: The CYP3A4 Enzyme Story | grapefruit drug interaction | $16–24 |
| 5 | Warfarin and Ibuprofen: Why This Sends Thousands to the ER | warfarin ibuprofen interaction | $18–28 |
| 6 | Blood Pressure Medications You Should Never Combine | blood pressure medication combinations | $25–40 |
| 7 | St. John's Wort and Antidepressants | St John's Wort antidepressant interaction | $20–32 |
| 8 | Aspirin and Blood Thinners | aspirin blood thinner interaction | $22–34 |
| 9 | Serotonin Syndrome: The Drug Interaction Emergency That Looks Like the Flu | serotonin syndrome drug interactions | $18–28 |
| 10 | Supplements Are Drugs Too: 7 Dangerous Interactions | supplement drug interaction | $20–30 |

Each article: 800+ words, author byline, `MedicalWebPage` schema, references (PMIDs), medical disclaimer, 2+ internal links.

### Timeline
- **Week 1–3:** Build site + write 10 articles
- **Week 4:** Apply to AdSense (55–65% probability)
- **Week 8:** Reapply if rejected (70–80% probability)
- **Month 2–3:** Build 10 priority `/check/` static pages, expand to 25 articles

---

## 7. Phase 2 — Static Drug Pair Pages

Top 10 `/check/[slug]` pages (after AdSense approval):

| Page | Search Volume | CPM |
|------|--------------|-----|
| `/check/warfarin-ibuprofen` | 8–12K/mo | $18–28 |
| `/check/lisinopril-ibuprofen` | 10–15K/mo | $22–30 |
| `/check/metformin-alcohol` | 15–22K/mo | $22–35 |
| `/check/atorvastatin-grapefruit` | 7–11K/mo | $20–28 |
| `/check/sertraline-tramadol` | 5–8K/mo | $18–26 |
| `/check/clopidogrel-omeprazole` | 6–9K/mo | $22–32 |
| `/check/levothyroxine-calcium` | 8–12K/mo | $20–28 |
| `/check/fluoxetine-tramadol` | 4–7K/mo | $18–25 |
| `/check/warfarin-vitamin-k` | 5–8K/mo | $18–26 |
| `/check/lisinopril-potassium` | 6–10K/mo | $22–30 |

---

## 8. MVP Scope (First Sprint)

### Must-Have
- Drug search with Fuse.js autocomplete
- Interaction Map (Cytoscape.js, desktop default)
- Results accordion (mobile default + desktop fallback)
- Interaction Detail modal with plain-English text
- "All safe" green state
- URL-encoded shareable link
- PNG download (html2canvas)
- PDF export (jsPDF)
- Dark mode (ThemeProvider, warm palette)
- Mobile-first responsive layout
- Jay's pharmacist credibility section
- Medical disclaimer
- `/about`, `/privacy`, `/contact` pages
- 700–900 words of static educational content below the tool
- `ads.txt` in `/public`

### Out of Scope for MVP
- `/learn` articles (write separately, after site is built)
- `/check/[slug]` static pages (Phase 2)
- Service Worker / offline mode
- Email alerts
- "Green Stack" gamification badge
- Drug request "Tell us what's missing" form

---

## 9. Revenue Projection

| Timeline | Monthly Visitors | RPM | Monthly Revenue |
|----------|-----------------|-----|-----------------|
| Month 1–2 (post-approval) | 2,000–5,000 | $16 | $32–$80 |
| Month 3–6 | 5,000–15,000 | $18 | $90–$270 |
| Month 6–12 | 15,000–40,000 | $20 | $300–$800 |
| Year 2 (w/ `/check/` pages) | 40,000–100,000 | $22 | $880–$2,200/mo |
