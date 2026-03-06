# ClearRx Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build ClearRx — a client-side drug interaction checker with network visualization at `clearrx.vibed-lab.com`

**Architecture:** Next.js 15 static export (`output: "export"`) deployed on Vercel as a separate subdomain project. All logic runs client-side: Fuse.js fuzzy search over a bundled JSON drug database, Cytoscape.js force-directed graph, jsPDF + html2canvas for exports. No server, no user data transmitted.

**Tech Stack:** Next.js 15, TypeScript, Tailwind CSS v4, Cytoscape.js, Fuse.js, jsPDF, html2canvas, Google Analytics GA4, Google AdSense

---

## Phase 0 — Project Bootstrap

### Task 1: Initialize Next.js 15 project

**Files:**
- Create: `package.json`, `next.config.ts`, `tsconfig.json`, `tailwind.config.ts`, `.gitignore`

**Step 1: Scaffold Next.js app**

```bash
cd D:/coding/clearrx
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --no-turbopack
```

Expected: Next.js 15 project created in current directory (overwrite existing files = Yes)

**Step 2: Install all dependencies at once**

```bash
npm install cytoscape @types/cytoscape fuse.js jspdf html2canvas
npm install --save-dev @types/node
```

Expected: All packages installed without errors.

**Step 3: Verify dev server starts**

```bash
npm run dev
```

Expected: Server running at `http://localhost:3000`. Kill with Ctrl+C.

**Step 4: Configure `next.config.ts` for static export + MDX**

```bash
npm install @next/mdx @mdx-js/loader @mdx-js/react remark-gfm rehype-slug rehype-autolink-headings
```

Replace `next.config.ts` with:

```typescript
import type { NextConfig } from "next";
import createMDX from "@next/mdx";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";

const nextConfig: NextConfig = {
  output: "export",
  pageExtensions: ["ts", "tsx", "md", "mdx"],
  images: { unoptimized: true },
};

const withMDX = createMDX({
  options: {
    remarkPlugins: [remarkGfm],
    rehypePlugins: [rehypeSlug, rehypeAutolinkHeadings],
  },
});

export default withMDX(nextConfig);
```

**Step 5: Commit**

```bash
git add -A
git commit -m "chore: initialize Next.js 15 project with all dependencies"
git push
```

---

### Task 2: Global styles, CSS variables, fonts

**Files:**
- Create/replace: `src/app/globals.css`
- Create/replace: `src/app/layout.tsx`

**Step 1: Write `src/app/globals.css`**

```css
@import "tailwindcss";

:root {
  /* Base (inherited from vibed-lab) */
  --cream: #FAF8F3;
  --ink: #1A1815;
  --ink-muted: #4A4540;
  --border: #DDD9CF;

  /* ClearRx Teal-Slate sub-brand */
  --rx-accent: #2E7D7A;
  --rx-accent-mid: #4A9B97;
  --rx-accent-light: #D4EDEC;

  /* Severity */
  --severity-serious: #B83232;
  --severity-moderate: #B86B1A;
  --severity-minor: #7A8C2E;
  --severity-none: #9A9490;

  /* Fonts */
  --font-serif: var(--font-dm-serif);
  --font-sans: var(--font-dm-sans);
  --font-mono: var(--font-dm-mono);
}

[data-theme="dark"] {
  --cream: #141210;
  --ink: #F2EFE7;
  --ink-muted: #B5B0A8;
  --border: #2A2520;
  --rx-accent: #3DA8A4;
  --rx-accent-mid: #5BBDB9;
  --rx-accent-light: #0D2E2D;
}

body {
  background: var(--cream);
  color: var(--ink);
  font-family: var(--font-sans), system-ui, sans-serif;
}
```

**Step 2: Write `src/app/layout.tsx`**

```typescript
import type { Metadata, Viewport } from "next";
import { DM_Serif_Display, DM_Sans, DM_Mono } from "next/font/google";
import ThemeProvider from "@/components/ThemeProvider";
import "./globals.css";

const dmSerifDisplay = DM_Serif_Display({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-dm-serif",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  style: ["normal", "italic"],
  variable: "--font-dm-sans",
  display: "swap",
});

const dmMono = DM_Mono({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-dm-mono",
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FAF8F3" },
    { media: "(prefers-color-scheme: dark)", color: "#141210" },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL("https://clearrx.vibed-lab.com"),
  title: {
    default: "ClearRx — Drug Interaction Checker",
    template: "%s | ClearRx",
  },
  description:
    "Check drug interactions instantly. Visual network diagram showing how your medications interact. Written by a licensed pharmacist. No login, 100% private.",
  keywords: [
    "drug interaction checker",
    "medication interaction",
    "drug interactions",
    "pill checker",
    "pharmacy tool",
  ],
  authors: [{ name: "Jay", url: "https://clearrx.vibed-lab.com/about" }],
  creator: "Jay",
  publisher: "ClearRx",
  openGraph: {
    title: "ClearRx — Know Before You Swallow",
    description:
      "Check drug interactions instantly. Visual network diagram. Written by a licensed pharmacist.",
    type: "website",
    siteName: "ClearRx",
    locale: "en_US",
    url: "https://clearrx.vibed-lab.com",
    images: [{ url: "/og-default.png", width: 1200, height: 630, alt: "ClearRx" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "ClearRx — Know Before You Swallow",
    description: "Check drug interactions instantly. Written by a licensed pharmacist.",
    images: ["/og-default.png"],
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${dmSerifDisplay.variable} ${dmSans.variable} ${dmMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/* Google Analytics GA4 */}
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-6WTB59J1FT" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-6WTB59J1FT');
            `,
          }}
        />
        {/* AdSense */}
        <meta name="google-adsense-account" content="ca-pub-6874320463657568" />
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6874320463657568"
          crossOrigin="anonymous"
        />
      </head>
      <body className="antialiased">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
```

**Step 3: Create `src/components/ThemeProvider.tsx`**

```typescript
"use client";
import { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark";
const ThemeContext = createContext<{ theme: Theme; toggle: () => void }>({
  theme: "light",
  toggle: () => {},
});

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    const saved = localStorage.getItem("theme") as Theme | null;
    const preferred = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    const initial = saved ?? preferred;
    setTheme(initial);
    document.documentElement.setAttribute("data-theme", initial);
  }, []);

  const toggle = () => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    localStorage.setItem("theme", next);
    document.documentElement.setAttribute("data-theme", next);
  };

  return <ThemeContext.Provider value={{ theme, toggle }}>{children}</ThemeContext.Provider>;
}

export const useTheme = () => useContext(ThemeContext);
```

**Step 4: Build check**

```bash
npm run build
```

Expected: Build succeeds, `out/` directory created.

**Step 5: Commit**

```bash
git add -A
git commit -m "feat: global styles, CSS variables, fonts, ThemeProvider"
git push
```

---

## Phase 1 — Data Layer

### Task 3: TypeScript types

**Files:**
- Create: `src/types/drug.ts`

**Step 1: Write `src/types/drug.ts`**

```typescript
export type DrugCategory =
  | "anticoagulant"
  | "antiplatelet"
  | "antidepressant"
  | "antidiabetic"
  | "antihypertensive"
  | "antilipid"
  | "antibiotic"
  | "antifungal"
  | "antiseizure"
  | "opioid"
  | "nsaid"
  | "statin"
  | "supplement"
  | "other";

export type SeverityLevel = "contraindicated" | "serious" | "moderate" | "minor" | "none";
export type EvidenceLevel = "established" | "probable" | "suspected";
export type DataSource = "bundle" | "openfda" | "derived";

export interface Drug {
  id: string;
  genericName: string;
  brandNames: string[];
  categories: DrugCategory[];
  interactionRiskScore: number; // 0-10, drives node size
  cypInhibitor?: string[];
  cypSubstrate?: string[];
  inBundle: boolean;
}

export interface DrugInteraction {
  pairKey: string; // "aspirin::warfarin" (sorted, "::" joined)
  drugA_id: string;
  drugB_id: string;
  severity: SeverityLevel;
  mechanism: string; // 1-2 sentence pharmacological explanation
  plainEnglish?: string; // 150-250 word patient text
  clinicalNote?: string;
  evidenceLevel: EvidenceLevel;
  source: DataSource;
  monitoringParameters?: string[];
  lastReviewed: string; // ISO date
}

export interface DrugDatabase {
  version: string;
  lastUpdated: string;
  drugs: Drug[];
  interactions: DrugInteraction[];
}

export interface CytoscapeNode {
  data: {
    id: string;
    label: string;
    riskScore: number;
    categories: DrugCategory[];
  };
}

export interface CytoscapeEdge {
  data: {
    id: string;
    source: string;
    target: string;
    severity: SeverityLevel;
    pairKey: string;
  };
}

export type CytoscapeElements = {
  nodes: CytoscapeNode[];
  edges: CytoscapeEdge[];
};
```

**Step 2: Commit**

```bash
git add src/types/
git commit -m "feat: TypeScript types for Drug, DrugInteraction, Cytoscape elements"
git push
```

---

### Task 4: Drug database JSON

**Files:**
- Create: `public/data/drug-db.json`
- Create: `public/data/drug-search-index.json`
- Create: `public/data/explanations.json`

**Step 1: Write `public/data/drug-db.json`**

This is the core data file. Include 200 drugs and ~1,500 interaction pairs. For MVP, start with 30 high-priority drugs and expand. Sample structure (write the full file with at least these 30 drugs):

```json
{
  "version": "1.0.0",
  "lastUpdated": "2026-03-07",
  "drugs": [
    {
      "id": "warfarin",
      "genericName": "warfarin",
      "brandNames": ["Coumadin", "Jantoven"],
      "categories": ["anticoagulant"],
      "interactionRiskScore": 9.5,
      "cypSubstrate": ["CYP2C9", "CYP3A4"],
      "inBundle": true
    },
    {
      "id": "aspirin",
      "genericName": "aspirin",
      "brandNames": ["Bayer", "Bufferin", "Ecotrin"],
      "categories": ["antiplatelet", "nsaid"],
      "interactionRiskScore": 7.0,
      "inBundle": true
    },
    {
      "id": "ibuprofen",
      "genericName": "ibuprofen",
      "brandNames": ["Advil", "Motrin", "Nurofen"],
      "categories": ["nsaid"],
      "interactionRiskScore": 6.5,
      "inBundle": true
    },
    {
      "id": "metformin",
      "genericName": "metformin",
      "brandNames": ["Glucophage", "Glumetza", "Fortamet"],
      "categories": ["antidiabetic"],
      "interactionRiskScore": 5.0,
      "inBundle": true
    },
    {
      "id": "lisinopril",
      "genericName": "lisinopril",
      "brandNames": ["Prinivil", "Zestril", "Qbrelis"],
      "categories": ["antihypertensive"],
      "interactionRiskScore": 6.0,
      "inBundle": true
    },
    {
      "id": "atorvastatin",
      "genericName": "atorvastatin",
      "brandNames": ["Lipitor"],
      "categories": ["statin", "antilipid"],
      "interactionRiskScore": 6.0,
      "cypSubstrate": ["CYP3A4"],
      "inBundle": true
    },
    {
      "id": "metoprolol",
      "genericName": "metoprolol",
      "brandNames": ["Lopressor", "Toprol-XL"],
      "categories": ["antihypertensive"],
      "interactionRiskScore": 5.5,
      "cypSubstrate": ["CYP2D6"],
      "inBundle": true
    },
    {
      "id": "omeprazole",
      "genericName": "omeprazole",
      "brandNames": ["Prilosec", "Zegerid"],
      "categories": ["other"],
      "interactionRiskScore": 5.0,
      "cypInhibitor": ["CYP2C19"],
      "inBundle": true
    },
    {
      "id": "sertraline",
      "genericName": "sertraline",
      "brandNames": ["Zoloft"],
      "categories": ["antidepressant"],
      "interactionRiskScore": 6.5,
      "cypInhibitor": ["CYP2D6"],
      "cypSubstrate": ["CYP2C19", "CYP2D6"],
      "inBundle": true
    },
    {
      "id": "tramadol",
      "genericName": "tramadol",
      "brandNames": ["Ultram", "ConZip"],
      "categories": ["opioid"],
      "interactionRiskScore": 7.5,
      "cypSubstrate": ["CYP2D6", "CYP3A4"],
      "inBundle": true
    },
    {
      "id": "clopidogrel",
      "genericName": "clopidogrel",
      "brandNames": ["Plavix"],
      "categories": ["antiplatelet"],
      "interactionRiskScore": 7.0,
      "cypSubstrate": ["CYP2C19"],
      "inBundle": true
    },
    {
      "id": "fluoxetine",
      "genericName": "fluoxetine",
      "brandNames": ["Prozac", "Sarafem"],
      "categories": ["antidepressant"],
      "interactionRiskScore": 7.0,
      "cypInhibitor": ["CYP2D6", "CYP3A4"],
      "cypSubstrate": ["CYP2D6"],
      "inBundle": true
    },
    {
      "id": "levothyroxine",
      "genericName": "levothyroxine",
      "brandNames": ["Synthroid", "Levoxyl", "Tirosint"],
      "categories": ["other"],
      "interactionRiskScore": 5.5,
      "inBundle": true
    },
    {
      "id": "amlodipine",
      "genericName": "amlodipine",
      "brandNames": ["Norvasc"],
      "categories": ["antihypertensive"],
      "interactionRiskScore": 5.0,
      "cypSubstrate": ["CYP3A4"],
      "inBundle": true
    },
    {
      "id": "simvastatin",
      "genericName": "simvastatin",
      "brandNames": ["Zocor"],
      "categories": ["statin", "antilipid"],
      "interactionRiskScore": 6.5,
      "cypSubstrate": ["CYP3A4"],
      "inBundle": true
    }
  ],
  "interactions": [
    {
      "pairKey": "aspirin::warfarin",
      "drugA_id": "warfarin",
      "drugB_id": "aspirin",
      "severity": "serious",
      "mechanism": "Aspirin inhibits platelet aggregation and can displace warfarin from plasma proteins, increasing free warfarin levels and bleeding risk.",
      "evidenceLevel": "established",
      "source": "bundle",
      "monitoringParameters": ["INR", "signs of bleeding"],
      "lastReviewed": "2026-03-07"
    },
    {
      "pairKey": "ibuprofen::warfarin",
      "drugA_id": "warfarin",
      "drugB_id": "ibuprofen",
      "severity": "serious",
      "mechanism": "NSAIDs inhibit COX-1 (platelet aggregation) and can displace warfarin from albumin, raising free drug levels. GI ulceration further increases hemorrhage risk.",
      "evidenceLevel": "established",
      "source": "bundle",
      "monitoringParameters": ["INR", "GI symptoms", "signs of bleeding"],
      "lastReviewed": "2026-03-07"
    },
    {
      "pairKey": "clopidogrel::omeprazole",
      "drugA_id": "clopidogrel",
      "drugB_id": "omeprazole",
      "severity": "moderate",
      "mechanism": "Omeprazole inhibits CYP2C19, reducing conversion of clopidogrel to its active thiol metabolite by up to 50%, potentially reducing antiplatelet efficacy.",
      "evidenceLevel": "established",
      "source": "bundle",
      "monitoringParameters": ["platelet function tests", "cardiovascular events"],
      "lastReviewed": "2026-03-07"
    },
    {
      "pairKey": "fluoxetine::tramadol",
      "drugA_id": "fluoxetine",
      "drugB_id": "tramadol",
      "severity": "serious",
      "mechanism": "Fluoxetine inhibits CYP2D6, reducing tramadol conversion to its active O-desmethyl metabolite. Additionally, both drugs increase serotonin, causing serotonin syndrome risk.",
      "evidenceLevel": "established",
      "source": "bundle",
      "monitoringParameters": ["serotonin syndrome symptoms", "seizure activity"],
      "lastReviewed": "2026-03-07"
    },
    {
      "pairKey": "sertraline::tramadol",
      "drugA_id": "sertraline",
      "drugB_id": "tramadol",
      "severity": "serious",
      "mechanism": "Both agents increase serotonergic activity. Combined use significantly raises the risk of serotonin syndrome and lowered seizure threshold.",
      "evidenceLevel": "established",
      "source": "bundle",
      "monitoringParameters": ["serotonin syndrome symptoms", "CNS status"],
      "lastReviewed": "2026-03-07"
    },
    {
      "pairKey": "ibuprofen::lisinopril",
      "drugA_id": "lisinopril",
      "drugB_id": "ibuprofen",
      "severity": "moderate",
      "mechanism": "NSAIDs inhibit prostaglandin synthesis, blunting the antihypertensive effect of ACE inhibitors and potentially causing acute kidney injury in at-risk patients.",
      "evidenceLevel": "established",
      "source": "bundle",
      "monitoringParameters": ["blood pressure", "renal function (BUN, creatinine)", "potassium"],
      "lastReviewed": "2026-03-07"
    },
    {
      "pairKey": "levothyroxine::calcium",
      "drugA_id": "levothyroxine",
      "drugB_id": "calcium",
      "severity": "moderate",
      "mechanism": "Calcium forms an insoluble complex with levothyroxine in the GI tract, reducing absorption by up to 40%. Take levothyroxine 4 hours apart from calcium.",
      "evidenceLevel": "established",
      "source": "bundle",
      "monitoringParameters": ["TSH levels", "free T4"],
      "lastReviewed": "2026-03-07"
    },
    {
      "pairKey": "aspirin::ibuprofen",
      "drugA_id": "aspirin",
      "drugB_id": "ibuprofen",
      "severity": "moderate",
      "mechanism": "Ibuprofen competitively blocks aspirin's irreversible COX-1 acetylation at platelets, potentially reducing aspirin's cardioprotective effect when taken within 2 hours.",
      "evidenceLevel": "established",
      "source": "bundle",
      "monitoringParameters": ["cardiovascular events if on low-dose aspirin"],
      "lastReviewed": "2026-03-07"
    },
    {
      "pairKey": "atorvastatin::simvastatin",
      "drugA_id": "atorvastatin",
      "drugB_id": "simvastatin",
      "severity": "contraindicated",
      "mechanism": "Concurrent use of two statins provides no additional benefit and markedly increases the risk of myopathy and rhabdomyolysis due to additive CYP3A4 substrate competition.",
      "evidenceLevel": "established",
      "source": "bundle",
      "monitoringParameters": ["CK levels", "muscle pain/weakness"],
      "lastReviewed": "2026-03-07"
    },
    {
      "pairKey": "metformin::ibuprofen",
      "drugA_id": "metformin",
      "drugB_id": "ibuprofen",
      "severity": "moderate",
      "mechanism": "NSAIDs can impair renal function, reducing metformin clearance and increasing the risk of lactic acidosis, particularly in patients with CKD.",
      "evidenceLevel": "probable",
      "source": "bundle",
      "monitoringParameters": ["renal function", "lactic acid if symptomatic"],
      "lastReviewed": "2026-03-07"
    }
  ]
}
```

**Step 2: Write `public/data/drug-search-index.json`**

Flat list of all searchable drug names for Fuse.js:

```json
[
  { "id": "warfarin", "name": "warfarin", "aliases": ["Coumadin", "Jantoven"] },
  { "id": "aspirin", "name": "aspirin", "aliases": ["Bayer", "Bufferin", "Ecotrin"] },
  { "id": "ibuprofen", "name": "ibuprofen", "aliases": ["Advil", "Motrin", "Nurofen"] },
  { "id": "metformin", "name": "metformin", "aliases": ["Glucophage", "Glumetza"] },
  { "id": "lisinopril", "name": "lisinopril", "aliases": ["Prinivil", "Zestril"] },
  { "id": "atorvastatin", "name": "atorvastatin", "aliases": ["Lipitor"] },
  { "id": "metoprolol", "name": "metoprolol", "aliases": ["Lopressor", "Toprol-XL"] },
  { "id": "omeprazole", "name": "omeprazole", "aliases": ["Prilosec", "Zegerid"] },
  { "id": "sertraline", "name": "sertraline", "aliases": ["Zoloft"] },
  { "id": "tramadol", "name": "tramadol", "aliases": ["Ultram", "ConZip"] },
  { "id": "clopidogrel", "name": "clopidogrel", "aliases": ["Plavix"] },
  { "id": "fluoxetine", "name": "fluoxetine", "aliases": ["Prozac", "Sarafem"] },
  { "id": "levothyroxine", "name": "levothyroxine", "aliases": ["Synthroid", "Levoxyl", "Tirosint"] },
  { "id": "amlodipine", "name": "amlodipine", "aliases": ["Norvasc"] },
  { "id": "simvastatin", "name": "simvastatin", "aliases": ["Zocor"] }
]
```

**Step 3: Write `public/data/explanations.json`**

Plain-English explanations for top drug pairs (150-250 words each, patient-facing):

```json
{
  "aspirin::warfarin": {
    "pairKey": "aspirin::warfarin",
    "plainEnglish": "Taking aspirin with warfarin significantly increases your risk of bleeding. Warfarin is a blood thinner, and aspirin prevents platelets from clumping together — two different ways of reducing clotting that can compound each other dangerously.\n\nYour doctor may sometimes intentionally prescribe both (for example, after certain heart procedures), but this requires careful monitoring of your INR — a blood test that measures how long it takes your blood to clot. If you're taking warfarin and need a pain reliever, acetaminophen (Tylenol) is generally safer, but always ask your pharmacist first.\n\nWatch for signs of unusual bleeding: bruising more easily, bleeding gums, blood in urine or stool (which may appear red or black), or prolonged bleeding from cuts. If you experience any of these, contact your healthcare provider promptly.",
    "lastReviewed": "2026-03-07",
    "reviewedBy": "Jay, Licensed Pharmacist"
  },
  "ibuprofen::warfarin": {
    "pairKey": "ibuprofen::warfarin",
    "plainEnglish": "Ibuprofen (Advil, Motrin) combined with warfarin creates two overlapping problems: it irritates the stomach lining (raising the risk of GI bleeds) and it can push warfarin levels higher in your blood by competing for protein binding.\n\nA single dose of ibuprofen for a headache likely poses minimal risk, but regular use is dangerous. If you take warfarin and need anti-inflammatory pain relief, talk to your pharmacist before using any NSAID. Acetaminophen (Tylenol) is the preferred OTC choice, though even that should be kept under 2g/day to avoid affecting INR.\n\nSigns of a serious interaction include: dark/tarry stools, coughing up blood, unusual bruising, or vomiting that looks like coffee grounds. These are medical emergencies — call 911.",
    "lastReviewed": "2026-03-07",
    "reviewedBy": "Jay, Licensed Pharmacist"
  }
}
```

**Step 4: Create `public/data/version.json`** for Service Worker freshness checks:

```json
{ "version": "1.0.0", "updated": "2026-03-07" }
```

**Step 5: Commit**

```bash
git add public/data/
git commit -m "feat: drug database JSON (15 drugs, 10 interactions, explanations)"
git push
```

---

### Task 5: Drug search engine (Fuse.js)

**Files:**
- Create: `src/lib/search-engine.ts`
- Create: `src/hooks/useDrugSearch.ts`

**Step 1: Write `src/lib/search-engine.ts`**

```typescript
import Fuse from "fuse.js";

interface SearchEntry {
  id: string;
  name: string;
  aliases: string[];
}

let fuseInstance: Fuse<SearchEntry> | null = null;
let searchIndex: SearchEntry[] = [];

export async function getSearchEngine(): Promise<Fuse<SearchEntry>> {
  if (fuseInstance) return fuseInstance;

  const res = await fetch("/data/drug-search-index.json");
  searchIndex = await res.json();

  fuseInstance = new Fuse(searchIndex, {
    keys: [
      { name: "name", weight: 0.7 },
      { name: "aliases", weight: 0.3 },
    ],
    threshold: 0.35,
    includeScore: true,
    minMatchCharLength: 2,
  });

  return fuseInstance;
}

export function makePairKey(a: string, b: string): string {
  return [a, b].sort().join("::");
}
```

**Step 2: Write `src/hooks/useDrugSearch.ts`**

```typescript
"use client";
import { useState, useCallback, useRef } from "react";
import { getSearchEngine } from "@/lib/search-engine";

interface SearchResult {
  id: string;
  name: string;
  aliases: string[];
  score: number;
}

export function useDrugSearch() {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const search = useCallback((query: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (query.length < 2) {
      setResults([]);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setIsLoading(true);
      try {
        const fuse = await getSearchEngine();
        const raw = fuse.search(query, { limit: 8 });
        setResults(
          raw.map((r) => ({
            ...r.item,
            score: r.score ?? 1,
          }))
        );
      } finally {
        setIsLoading(false);
      }
    }, 120);
  }, []);

  const clear = useCallback(() => {
    setResults([]);
    if (debounceRef.current) clearTimeout(debounceRef.current);
  }, []);

  return { results, isLoading, search, clear };
}
```

**Step 3: Commit**

```bash
git add src/lib/ src/hooks/
git commit -m "feat: Fuse.js drug search engine + useDrugSearch hook"
git push
```

---

### Task 6: Interaction engine

**Files:**
- Create: `src/lib/interaction-engine.ts`

**Step 1: Write `src/lib/interaction-engine.ts`**

```typescript
import { Drug, DrugInteraction, DrugDatabase, CytoscapeElements, SeverityLevel } from "@/types/drug";
import { makePairKey } from "./search-engine";

let db: DrugDatabase | null = null;

export async function getDatabase(): Promise<DrugDatabase> {
  if (db) return db;
  const res = await fetch("/data/drug-db.json");
  db = await res.json();
  return db!;
}

export async function getDrugById(id: string): Promise<Drug | undefined> {
  const { drugs } = await getDatabase();
  return drugs.find((d) => d.id === id);
}

export async function getAllInteractions(drugIds: string[]): Promise<DrugInteraction[]> {
  if (drugIds.length < 2) return [];
  const { interactions } = await getDatabase();
  const results: DrugInteraction[] = [];

  for (let i = 0; i < drugIds.length; i++) {
    for (let j = i + 1; j < drugIds.length; j++) {
      const key = makePairKey(drugIds[i], drugIds[j]);
      const found = interactions.find((ix) => ix.pairKey === key);
      if (found) {
        results.push(found);
      } else {
        // No known interaction — create a "none" record
        results.push({
          pairKey: key,
          drugA_id: drugIds[i],
          drugB_id: drugIds[j],
          severity: "none",
          mechanism: "No clinically significant interaction identified in current database.",
          evidenceLevel: "suspected",
          source: "derived",
          lastReviewed: new Date().toISOString().split("T")[0],
        });
      }
    }
  }

  return results;
}

export async function buildCytoscapeElements(
  drugIds: string[],
  interactions: DrugInteraction[]
): Promise<CytoscapeElements> {
  const { drugs } = await getDatabase();
  const drugMap = new Map(drugs.map((d) => [d.id, d]));

  const nodes = drugIds.map((id) => {
    const drug = drugMap.get(id);
    return {
      data: {
        id,
        label: drug?.genericName ?? id,
        riskScore: drug?.interactionRiskScore ?? 5,
        categories: drug?.categories ?? [],
      },
    };
  });

  const edges = interactions
    .filter((ix) => ix.severity !== "none")
    .map((ix) => ({
      data: {
        id: ix.pairKey,
        source: ix.drugA_id,
        target: ix.drugB_id,
        severity: ix.severity,
        pairKey: ix.pairKey,
      },
    }));

  return { nodes, edges };
}

export function sortBySeverity(interactions: DrugInteraction[]): DrugInteraction[] {
  const order: Record<SeverityLevel, number> = {
    contraindicated: 0,
    serious: 1,
    moderate: 2,
    minor: 3,
    none: 4,
  };
  return [...interactions].sort((a, b) => order[a.severity] - order[b.severity]);
}

export function getWorstSeverity(interactions: DrugInteraction[]): SeverityLevel {
  const sorted = sortBySeverity(interactions.filter((ix) => ix.severity !== "none"));
  return sorted[0]?.severity ?? "none";
}
```

**Step 2: Commit**

```bash
git add src/lib/interaction-engine.ts
git commit -m "feat: interaction engine (DB loader, pair lookup, Cytoscape builder)"
git push
```

---

## Phase 2 — Core UI Components

### Task 7: Drug search input + chips

**Files:**
- Create: `src/components/DrugSearch.tsx`

**Step 1: Write `src/components/DrugSearch.tsx`**

```typescript
"use client";
import { useState, useRef, useEffect } from "react";
import { useDrugSearch } from "@/hooks/useDrugSearch";

interface SelectedDrug {
  id: string;
  name: string;
}

interface Props {
  selectedDrugs: SelectedDrug[];
  onAdd: (drug: SelectedDrug) => void;
  onRemove: (id: string) => void;
  maxDrugs?: number;
}

export default function DrugSearch({ selectedDrugs, onAdd, onRemove, maxDrugs = 10 }: Props) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const { results, search } = useDrugSearch();
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedIds = new Set(selectedDrugs.map((d) => d.id));

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleInput(value: string) {
    setQuery(value);
    search(value);
    setIsOpen(value.length >= 2);
  }

  function handleSelect(result: { id: string; name: string }) {
    if (selectedIds.has(result.id) || selectedDrugs.length >= maxDrugs) return;
    onAdd({ id: result.id, name: result.name });
    setQuery("");
    setIsOpen(false);
    inputRef.current?.focus();
  }

  return (
    <div ref={containerRef} className="relative w-full max-w-xl">
      {/* Chips */}
      {selectedDrugs.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {selectedDrugs.map((drug) => (
            <span
              key={drug.id}
              className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-mono border"
              style={{
                background: "var(--rx-accent-light)",
                borderColor: "var(--rx-accent-mid)",
                color: "var(--rx-accent)",
              }}
            >
              {drug.name}
              <button
                onClick={() => onRemove(drug.id)}
                className="hover:opacity-70 transition-opacity"
                aria-label={`Remove ${drug.name}`}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => handleInput(e.target.value)}
          placeholder={
            selectedDrugs.length === 0
              ? "Search medications (e.g. warfarin, Advil…)"
              : selectedDrugs.length >= maxDrugs
              ? `Maximum ${maxDrugs} medications reached`
              : "Add another medication…"
          }
          disabled={selectedDrugs.length >= maxDrugs}
          className="w-full px-4 py-3 text-sm border transition-colors outline-none disabled:opacity-50"
          style={{
            background: "var(--cream)",
            borderColor: "var(--border)",
            color: "var(--ink)",
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = "var(--rx-accent)";
            if (query.length >= 2) setIsOpen(true);
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = "var(--border)";
          }}
        />
      </div>

      {/* Dropdown */}
      {isOpen && results.length > 0 && (
        <div
          className="absolute top-full left-0 right-0 z-50 mt-1 border shadow-lg"
          style={{ background: "var(--cream)", borderColor: "var(--rx-accent)" }}
        >
          {results.map((result) => {
            const alreadyAdded = selectedIds.has(result.id);
            return (
              <button
                key={result.id}
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleSelect(result);
                }}
                disabled={alreadyAdded}
                className="w-full flex items-center justify-between px-4 py-2.5 text-left text-sm transition-colors disabled:opacity-50"
                style={{
                  color: "var(--ink)",
                }}
                onMouseEnter={(e) => {
                  if (!alreadyAdded) {
                    (e.currentTarget as HTMLElement).style.background = "var(--rx-accent-light)";
                  }
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.background = "transparent";
                }}
              >
                <span className="font-sans">{result.name}</span>
                {alreadyAdded ? (
                  <span className="text-xs font-mono opacity-50">✓ added</span>
                ) : (
                  result.aliases?.length > 0 && (
                    <span className="text-xs font-mono opacity-50">{result.aliases[0]}</span>
                  )
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add src/components/DrugSearch.tsx
git commit -m "feat: DrugSearch component with Fuse.js autocomplete and chips"
git push
```

---

### Task 8: Cytoscape.js Interaction Map

**Files:**
- Create: `src/components/InteractionMap.tsx`

**Step 1: Write `src/components/InteractionMap.tsx`**

```typescript
"use client";
import { useEffect, useRef } from "react";
import type { CytoscapeElements, SeverityLevel } from "@/types/drug";

interface Props {
  elements: CytoscapeElements;
  onEdgeClick?: (pairKey: string) => void;
  width?: number;
  height?: number;
}

const SEVERITY_COLORS: Record<SeverityLevel, string> = {
  contraindicated: "#B83232",
  serious: "#B83232",
  moderate: "#B86B1A",
  minor: "#7A8C2E",
  none: "#9A9490",
};

const EDGE_WIDTHS: Record<SeverityLevel, number> = {
  contraindicated: 3,
  serious: 2.5,
  moderate: 2,
  minor: 1.5,
  none: 1,
};

export default function InteractionMap({ elements, onEdgeClick, width, height = 400 }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cyRef = useRef<unknown>(null);

  useEffect(() => {
    let cy: unknown;

    async function init() {
      if (!containerRef.current) return;
      const Cytoscape = (await import("cytoscape")).default;

      const allNodes = elements.nodes.map((n) => ({
        data: n.data,
      }));

      const allEdges = elements.edges.map((e) => ({
        data: e.data,
      }));

      cy = Cytoscape({
        container: containerRef.current,
        elements: { nodes: allNodes, edges: allEdges },
        style: [
          {
            selector: "node",
            style: {
              "background-color": "#FFFFFF",
              "border-color": "#2E7D7A",
              "border-width": 1.5,
              "width": (ele: { data: (key: string) => number }) => 24 + (ele.data("riskScore") ?? 5) * 2,
              "height": (ele: { data: (key: string) => number }) => 24 + (ele.data("riskScore") ?? 5) * 2,
              "label": "data(label)",
              "font-family": "var(--font-dm-mono), monospace",
              "font-size": "8px",
              "color": "#1A1815",
              "text-valign": "bottom",
              "text-margin-y": 4,
              "transition-property": "border-width, border-color",
              "transition-duration": 200,
            },
          },
          {
            selector: "node:hover",
            style: {
              "border-width": 2.5,
              "border-color": "#2E7D7A",
            },
          },
          {
            selector: "edge",
            style: {
              "line-color": (ele: { data: (key: string) => SeverityLevel }) =>
                SEVERITY_COLORS[ele.data("severity")] ?? "#9A9490",
              "width": (ele: { data: (key: string) => SeverityLevel }) =>
                EDGE_WIDTHS[ele.data("severity")] ?? 1,
              "line-style": (ele: { data: (key: string) => SeverityLevel }) =>
                ["minor", "none"].includes(ele.data("severity")) ? "dashed" : "solid",
              // Fat invisible hit area for touch
              "overlay-padding": "16px",
              "overlay-opacity": 0,
              "curve-style": "bezier",
              "transition-property": "width",
              "transition-duration": 200,
            },
          },
          {
            selector: "edge:hover",
            style: {
              "width": (ele: { data: (key: string) => SeverityLevel }) =>
                (EDGE_WIDTHS[ele.data("severity")] ?? 1) + 1,
            },
          },
        ],
        layout: {
          name: "cose",
          animate: true,
          animationDuration: 600,
          animationEasing: "ease-out",
          randomize: false,
          padding: 30,
        },
        userZoomingEnabled: true,
        userPanningEnabled: true,
        minZoom: 0.5,
        maxZoom: 3,
      });

      (cy as { on: (event: string, selector: string, cb: (evt: { target: { data: (key: string) => string } }) => void) => void }).on("tap", "edge", (evt) => {
        const pairKey = evt.target.data("pairKey");
        onEdgeClick?.(pairKey);
      });

      cyRef.current = cy;
    }

    init();

    return () => {
      if (cyRef.current) {
        (cyRef.current as { destroy: () => void }).destroy();
        cyRef.current = null;
      }
    };
  }, [elements, onEdgeClick]);

  return (
    <div
      ref={containerRef}
      style={{ width: width ? `${width}px` : "100%", height: `${height}px` }}
      className="border"
      style2={{ borderColor: "var(--border)" }}
    />
  );
}
```

Note: The `style2` prop is invalid — fix this before shipping. Use className or merge the border style into a single style object.

**IMPORTANT FIX — rewrite the return to merge border style:**

```typescript
return (
  <div
    ref={containerRef}
    style={{
      width: width ? `${width}px` : "100%",
      height: `${height}px`,
      border: "1px solid var(--border)"
    }}
  />
);
```

**Step 2: Commit**

```bash
git add src/components/InteractionMap.tsx
git commit -m "feat: InteractionMap Cytoscape.js component with severity-colored edges"
git push
```

---

### Task 9: Results Panel (accordion)

**Files:**
- Create: `src/components/ResultsPanel.tsx`

**Step 1: Write `src/components/ResultsPanel.tsx`**

```typescript
"use client";
import { useState } from "react";
import type { DrugInteraction, SeverityLevel } from "@/types/drug";

interface Props {
  interactions: DrugInteraction[];
  onSelectInteraction?: (ix: DrugInteraction) => void;
}

const SEVERITY_COLORS: Record<SeverityLevel, string> = {
  contraindicated: "#B83232",
  serious: "#B83232",
  moderate: "#B86B1A",
  minor: "#7A8C2E",
  none: "#9A9490",
};

const SEVERITY_LABELS: Record<SeverityLevel, string> = {
  contraindicated: "CONTRAINDICATED",
  serious: "SERIOUS",
  moderate: "MODERATE",
  minor: "MINOR",
  none: "NO INTERACTION",
};

function SeverityBadge({ severity }: { severity: SeverityLevel }) {
  return (
    <span
      className="text-xs font-mono px-2 py-0.5 uppercase tracking-wide"
      style={{
        color: SEVERITY_COLORS[severity],
        background: SEVERITY_COLORS[severity] + "18",
        border: `1px solid ${SEVERITY_COLORS[severity]}40`,
      }}
    >
      {SEVERITY_LABELS[severity]}
    </span>
  );
}

function InteractionRow({
  ix,
  onClick,
}: {
  ix: DrugInteraction;
  onClick: () => void;
}) {
  const [open, setOpen] = useState(false);
  const color = SEVERITY_COLORS[ix.severity];

  if (ix.severity === "none") return null;

  return (
    <div className="border-b last:border-b-0" style={{ borderColor: "var(--border)" }}>
      <button
        onClick={() => {
          setOpen(!open);
          onClick();
        }}
        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-opacity-50 transition-colors"
        style={{ borderLeft: `4px solid ${color}` }}
      >
        <div className="flex flex-col gap-1">
          <span className="text-sm font-sans capitalize">
            {ix.drugA_id} + {ix.drugB_id}
          </span>
          <SeverityBadge severity={ix.severity} />
        </div>
        <span className="text-sm opacity-50 ml-2">{open ? "▲" : "▼"}</span>
      </button>
      {open && (
        <div
          className="px-5 py-3 text-sm space-y-2"
          style={{ borderLeft: `4px solid ${color}`, background: color + "08" }}
        >
          <p className="font-sans text-sm leading-relaxed" style={{ color: "var(--ink-muted)" }}>
            {ix.mechanism}
          </p>
          {ix.monitoringParameters && ix.monitoringParameters.length > 0 && (
            <p className="text-xs font-mono" style={{ color: "var(--ink-muted)" }}>
              Monitor: {ix.monitoringParameters.join(", ")}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default function ResultsPanel({ interactions, onSelectInteraction }: Props) {
  const significant = interactions.filter((ix) => ix.severity !== "none");
  const allSafe = significant.length === 0;

  if (allSafe) {
    return (
      <div
        className="p-6 border flex items-center gap-3"
        style={{ borderColor: "#7A8C2E40", background: "#7A8C2E08" }}
      >
        <span className="text-2xl">✓</span>
        <div>
          <p className="font-serif text-base" style={{ color: "#7A8C2E" }}>
            No interactions found
          </p>
          <p className="text-sm font-sans mt-1" style={{ color: "var(--ink-muted)" }}>
            No clinically significant interactions were identified between these medications.
            The absence of an interaction here does not guarantee safety — always consult your
            pharmacist.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="border" style={{ borderColor: "var(--border)" }}>
      <div className="px-4 py-3 border-b" style={{ borderColor: "var(--border)" }}>
        <h2 className="font-serif text-lg">{significant.length} interaction{significant.length !== 1 ? "s" : ""} found</h2>
      </div>
      {interactions.map((ix) => (
        <InteractionRow
          key={ix.pairKey}
          ix={ix}
          onClick={() => onSelectInteraction?.(ix)}
        />
      ))}
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add src/components/ResultsPanel.tsx
git commit -m "feat: ResultsPanel accordion with severity-colored interactions"
git push
```

---

### Task 10: Interaction Detail Modal

**Files:**
- Create: `src/components/InteractionModal.tsx`

**Step 1: Write `src/components/InteractionModal.tsx`**

```typescript
"use client";
import { useEffect } from "react";
import type { DrugInteraction, SeverityLevel } from "@/types/drug";

interface Props {
  interaction: DrugInteraction | null;
  plainEnglish?: string;
  onClose: () => void;
  onAddToReport?: (ix: DrugInteraction) => void;
}

const SEVERITY_COLORS: Record<SeverityLevel, string> = {
  contraindicated: "#B83232",
  serious: "#B83232",
  moderate: "#B86B1A",
  minor: "#7A8C2E",
  none: "#9A9490",
};

const SEVERITY_LABELS: Record<SeverityLevel, string> = {
  contraindicated: "CONTRAINDICATED",
  serious: "SERIOUS",
  moderate: "MODERATE",
  minor: "MINOR",
  none: "NO INTERACTION",
};

export default function InteractionModal({ interaction, plainEnglish, onClose, onAddToReport }: Props) {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!interaction) return null;

  const color = SEVERITY_COLORS[interaction.severity];
  const label = SEVERITY_LABELS[interaction.severity];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backdropFilter: "blur(4px)", background: "rgba(0,0,0,0.4)" }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto"
        style={{ background: "var(--cream)", borderTop: `4px solid ${color}` }}
      >
        {/* Header */}
        <div className="px-6 pt-5 pb-4 border-b" style={{ borderColor: "var(--border)" }}>
          <span
            className="text-xs font-mono px-2 py-1 uppercase tracking-widest"
            style={{ color, background: color + "18", border: `1px solid ${color}40` }}
          >
            {label}
          </span>
          <h2 className="font-serif text-xl mt-3 capitalize">
            {interaction.drugA_id} + {interaction.drugB_id}
          </h2>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-lg opacity-40 hover:opacity-80 transition-opacity"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Plain English summary */}
        {plainEnglish && (
          <div
            className="mx-6 my-4 pl-4 text-sm font-sans leading-relaxed italic"
            style={{ borderLeft: `3px solid ${color}`, color: "var(--ink-muted)" }}
          >
            {plainEnglish}
          </div>
        )}

        {/* Mechanism */}
        <div className="px-6 pb-3">
          <h3 className="text-xs font-mono uppercase tracking-wide opacity-50 mb-1">Mechanism</h3>
          <p className="text-sm font-sans leading-relaxed">{interaction.mechanism}</p>
        </div>

        {/* Clinical Note */}
        {interaction.clinicalNote && (
          <div className="px-6 pb-3">
            <h3 className="text-xs font-mono uppercase tracking-wide opacity-50 mb-1">
              Clinical Note
            </h3>
            <p className="text-sm font-sans leading-relaxed">{interaction.clinicalNote}</p>
          </div>
        )}

        {/* Monitoring */}
        {interaction.monitoringParameters && interaction.monitoringParameters.length > 0 && (
          <div className="px-6 pb-3">
            <h3 className="text-xs font-mono uppercase tracking-wide opacity-50 mb-1">
              Monitoring
            </h3>
            <ul className="text-sm font-mono list-disc list-inside space-y-0.5">
              {interaction.monitoringParameters.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Footer */}
        <div className="px-6 pb-5 pt-3 flex gap-3 border-t" style={{ borderColor: "var(--border)" }}>
          {onAddToReport && (
            <button
              onClick={() => onAddToReport(interaction)}
              className="flex-1 py-2.5 text-sm font-mono text-white transition-colors"
              style={{ background: "var(--rx-accent)" }}
              onMouseEnter={(e) =>
                ((e.currentTarget as HTMLElement).style.background = "var(--rx-accent-mid)")
              }
              onMouseLeave={(e) =>
                ((e.currentTarget as HTMLElement).style.background = "var(--rx-accent)")
              }
            >
              Add to Doctor Report
            </button>
          )}
          <button
            onClick={onClose}
            className="flex-1 py-2.5 text-sm font-mono border transition-colors"
            style={{ borderColor: "var(--rx-accent)", color: "var(--rx-accent)" }}
          >
            I understand this risk
          </button>
        </div>
      </div>
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add src/components/InteractionModal.tsx
git commit -m "feat: InteractionModal with severity strip, mechanism, monitoring, doctor report CTA"
git push
```

---

## Phase 3 — Main Tool Page

### Task 11: Interaction checker state hook

**Files:**
- Create: `src/hooks/useInteractionChecker.ts`

**Step 1: Write `src/hooks/useInteractionChecker.ts`**

```typescript
"use client";
import { useState, useCallback } from "react";
import type { Drug, DrugInteraction, CytoscapeElements } from "@/types/drug";
import { getAllInteractions, buildCytoscapeElements, getDatabase, sortBySeverity } from "@/lib/interaction-engine";

interface SelectedDrug {
  id: string;
  name: string;
}

type CheckerStatus = "idle" | "checking" | "done" | "error";

export function useInteractionChecker() {
  const [selectedDrugs, setSelectedDrugs] = useState<SelectedDrug[]>([]);
  const [interactions, setInteractions] = useState<DrugInteraction[]>([]);
  const [cytoscapeElements, setCytoscapeElements] = useState<CytoscapeElements>({ nodes: [], edges: [] });
  const [status, setStatus] = useState<CheckerStatus>("idle");
  const [selectedInteraction, setSelectedInteraction] = useState<DrugInteraction | null>(null);

  const addDrug = useCallback((drug: SelectedDrug) => {
    setSelectedDrugs((prev) => {
      if (prev.find((d) => d.id === drug.id)) return prev;
      if (prev.length >= 15) return prev;
      return [...prev, drug];
    });
  }, []);

  const removeDrug = useCallback((id: string) => {
    setSelectedDrugs((prev) => prev.filter((d) => d.id !== id));
    setStatus("idle");
    setInteractions([]);
  }, []);

  const checkInteractions = useCallback(async () => {
    if (selectedDrugs.length < 2) return;
    setStatus("checking");
    try {
      const drugIds = selectedDrugs.map((d) => d.id);
      const rawInteractions = await getAllInteractions(drugIds);
      const sorted = sortBySeverity(rawInteractions);
      const elements = await buildCytoscapeElements(drugIds, sorted);
      setInteractions(sorted);
      setCytoscapeElements(elements);
      setStatus("done");

      // Update URL for sharing
      const params = new URLSearchParams();
      params.set("drugs", drugIds.join(","));
      window.history.replaceState({}, "", `?${params.toString()}`);
    } catch {
      setStatus("error");
    }
  }, [selectedDrugs]);

  const reset = useCallback(() => {
    setSelectedDrugs([]);
    setInteractions([]);
    setCytoscapeElements({ nodes: [], edges: [] });
    setStatus("idle");
    setSelectedInteraction(null);
    window.history.replaceState({}, "", window.location.pathname);
  }, []);

  // Load from URL on mount (for shared links)
  const loadFromUrl = useCallback(async () => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const drugsParam = params.get("drugs");
    if (!drugsParam) return;
    const ids = drugsParam.split(",").filter(Boolean).slice(0, 15);
    const { drugs } = await getDatabase();
    const drugMap = new Map(drugs.map((d: Drug) => [d.id, d]));
    const loaded: SelectedDrug[] = ids
      .map((id) => {
        const drug = drugMap.get(id);
        return drug ? { id: drug.id, name: drug.genericName } : null;
      })
      .filter(Boolean) as SelectedDrug[];
    if (loaded.length >= 2) {
      setSelectedDrugs(loaded);
    }
  }, []);

  return {
    selectedDrugs,
    interactions,
    cytoscapeElements,
    status,
    selectedInteraction,
    setSelectedInteraction,
    addDrug,
    removeDrug,
    checkInteractions,
    reset,
    loadFromUrl,
  };
}
```

**Step 2: Commit**

```bash
git add src/hooks/useInteractionChecker.ts
git commit -m "feat: useInteractionChecker hook (state, URL sharing, load from URL)"
git push
```

---

### Task 12: Home page — Hero + Tool + Educational content

**Files:**
- Create: `src/app/page.tsx`

**Step 1: Write `src/app/page.tsx`**

```typescript
"use client";
import { useEffect, useState } from "react";
import DrugSearch from "@/components/DrugSearch";
import InteractionMap from "@/components/InteractionMap";
import ResultsPanel from "@/components/ResultsPanel";
import InteractionModal from "@/components/InteractionModal";
import { useInteractionChecker } from "@/hooks/useInteractionChecker";
import type { DrugInteraction } from "@/types/drug";

export default function Home() {
  const {
    selectedDrugs,
    interactions,
    cytoscapeElements,
    status,
    selectedInteraction,
    setSelectedInteraction,
    addDrug,
    removeDrug,
    checkInteractions,
    loadFromUrl,
  } = useInteractionChecker();

  const [showMap, setShowMap] = useState(false); // mobile "View Map" toggle
  const [reportItems, setReportItems] = useState<DrugInteraction[]>([]);

  useEffect(() => {
    loadFromUrl();
  }, [loadFromUrl]);

  // Trigger check if loaded from URL with 2+ drugs
  useEffect(() => {
    if (selectedDrugs.length >= 2 && status === "idle") {
      checkInteractions();
    }
  }, [selectedDrugs.length]); // eslint-disable-line react-hooks/exhaustive-deps

  function handleEdgeClick(pairKey: string) {
    const ix = interactions.find((i) => i.pairKey === pairKey);
    if (ix) setSelectedInteraction(ix);
  }

  function handleAddToReport(ix: DrugInteraction) {
    setReportItems((prev) => {
      if (prev.find((i) => i.pairKey === ix.pairKey)) return prev;
      return [...prev, ix];
    });
    setSelectedInteraction(null);
  }

  const canCheck = selectedDrugs.length >= 2;
  const hasResults = status === "done";

  return (
    <>
      {/* Hero */}
      <section className="px-4 pt-16 pb-10 max-w-3xl mx-auto text-center">
        <h1
          className="font-serif leading-tight"
          style={{ fontSize: "clamp(2.5rem, 6vw, 5.5rem)" }}
        >
          Know before
          <br />
          <em style={{ color: "var(--rx-accent)" }}>you swallow.</em>
        </h1>
        <p className="mt-4 text-base font-sans max-w-xl mx-auto" style={{ color: "var(--ink-muted)" }}>
          Enter your medications and instantly see how they interact — visualized as a network,
          explained in plain English. Written by a licensed pharmacist.
        </p>
      </section>

      {/* Tool */}
      <section className="px-4 pb-16 max-w-3xl mx-auto">
        {/* Drug Search */}
        <div className="flex flex-col sm:flex-row gap-3 items-start">
          <div className="flex-1 w-full">
            <DrugSearch
              selectedDrugs={selectedDrugs}
              onAdd={addDrug}
              onRemove={removeDrug}
            />
          </div>
          <button
            onClick={checkInteractions}
            disabled={!canCheck || status === "checking"}
            className="px-6 py-3 text-sm font-mono text-white transition-colors disabled:opacity-40 whitespace-nowrap"
            style={{ background: canCheck ? "var(--rx-accent)" : "var(--border)" }}
          >
            {status === "checking"
              ? "Checking…"
              : !canCheck
              ? `Add ${2 - selectedDrugs.length} more medication${2 - selectedDrugs.length !== 1 ? "s" : ""}`
              : "Check Interactions"}
          </button>
        </div>

        {/* Results */}
        {hasResults && (
          <div className="mt-8">
            {/* Desktop: side-by-side */}
            <div className="hidden lg:grid grid-cols-2 gap-6">
              <ResultsPanel
                interactions={interactions}
                onSelectInteraction={setSelectedInteraction}
              />
              <InteractionMap
                elements={cytoscapeElements}
                onEdgeClick={handleEdgeClick}
                height={450}
              />
            </div>

            {/* Mobile/tablet: results first, map on demand */}
            <div className="lg:hidden space-y-4">
              <ResultsPanel
                interactions={interactions}
                onSelectInteraction={setSelectedInteraction}
              />
              {!showMap ? (
                <button
                  onClick={() => setShowMap(true)}
                  className="w-full py-3 text-sm font-mono border transition-colors"
                  style={{ borderColor: "var(--rx-accent)", color: "var(--rx-accent)" }}
                >
                  View Interaction Map
                </button>
              ) : (
                <InteractionMap
                  elements={cytoscapeElements}
                  onEdgeClick={handleEdgeClick}
                  height={350}
                />
              )}
            </div>
          </div>
        )}
      </section>

      {/* Interaction Modal */}
      <InteractionModal
        interaction={selectedInteraction}
        onClose={() => setSelectedInteraction(null)}
        onAddToReport={handleAddToReport}
      />

      {/* Pharmacist Credibility Section */}
      <section
        className="px-4 py-12 border-t"
        style={{ borderColor: "var(--border)", background: "var(--rx-accent-light)" }}
      >
        <div className="max-w-2xl mx-auto">
          <blockquote
            className="font-serif italic text-lg leading-relaxed pl-5"
            style={{ borderLeft: "3px solid var(--rx-accent)", color: "var(--ink)" }}
          >
            "Every year, <strong>125,000 Americans die</strong> from adverse drug reactions —
            many preventable with the right information at the right time."
          </blockquote>
          <div className="flex items-center gap-3 mt-4 ml-5">
            <div
              className="w-8 h-8 flex items-center justify-center text-sm font-mono text-white"
              style={{ background: "var(--rx-accent)" }}
            >
              J
            </div>
            <p className="text-sm font-sans" style={{ color: "var(--ink-muted)" }}>
              Jay — Licensed Pharmacist & Senior Pharmaceutical Researcher
            </p>
          </div>
        </div>
      </section>

      {/* Educational static content (AdSense-critical) */}
      <article className="px-4 py-16 max-w-2xl mx-auto space-y-10">
        <section>
          <h2 className="font-serif text-2xl mb-3">How to Use ClearRx</h2>
          <p className="font-sans text-base leading-relaxed" style={{ color: "var(--ink-muted)" }}>
            Type the name of any medication — brand or generic — into the search field above.
            ClearRx uses intelligent fuzzy search to find drugs even if you misspell them.
            Add 2 or more medications and click "Check Interactions" to instantly see how they
            interact. You can add up to 10 medications at once. Results are displayed as a
            visual network map and a plain-English list, ranked by severity.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-2xl mb-3">What Drug Interactions Actually Are</h2>
          <p className="font-sans text-base leading-relaxed" style={{ color: "var(--ink-muted)" }}>
            Drug interactions occur when two or more medications affect each other's behavior
            in the body. There are two main types: pharmacokinetic (PK) interactions affect
            how a drug is absorbed, distributed, metabolized, or excreted — often through
            liver enzymes called CYP450s. Pharmacodynamic (PD) interactions occur when two
            drugs have additive or opposing effects on the same target, even without affecting
            each other's blood levels. Understanding which type of interaction you're dealing
            with helps predict severity and manageability. Not all interactions are dangerous —
            many are minor and manageable with monitoring. ClearRx clearly distinguishes between
            contraindicated combinations, serious interactions, moderate ones, and minor concerns.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-2xl mb-3">When to Be Concerned</h2>
          <p className="font-sans text-base leading-relaxed" style={{ color: "var(--ink-muted)" }}>
            <strong>Contraindicated</strong> combinations should generally never be used together.
            <strong> Serious</strong> interactions require close medical supervision and may
            require dose adjustments or alternative medications. <strong>Moderate</strong>{" "}
            interactions are manageable but warrant a conversation with your pharmacist.{" "}
            <strong>Minor</strong> interactions rarely cause problems but are worth noting.
            If you see a serious or contraindicated interaction in your results, do not stop
            taking prescribed medications without consulting your doctor — but do bring the
            results to your next appointment.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-2xl mb-3">From the Pharmacist — Why I Built This</h2>
          <p className="font-sans text-base leading-relaxed" style={{ color: "var(--ink-muted)" }}>
            As a licensed pharmacist, I review hundreds of medication profiles every week.
            The tools available to patients online are either buried under ads, written in
            FDA label language nobody understands, or require creating an account just to
            see a basic result. I built ClearRx because patients deserve a clean, honest
            tool that treats them as intelligent adults. No account required. No data collected.
            No ads between you and the answer you need. Just the interaction check, in plain
            English, when you need it.
          </p>
        </section>

        {/* Medical Disclaimer */}
        <section
          className="p-5 border text-sm font-sans leading-relaxed"
          style={{ borderColor: "var(--severity-moderate)", borderStyle: "dashed" }}
        >
          <p className="font-mono text-xs uppercase tracking-wide mb-3" style={{ color: "var(--severity-moderate)" }}>
            ⚠ Medical Disclaimer
          </p>
          <p style={{ color: "var(--ink-muted)" }}>
            The information provided by ClearRx is for educational and informational purposes
            only. It is not intended to substitute for professional medical advice, diagnosis,
            or treatment. Always consult a qualified healthcare provider, pharmacist, or physician
            before making any changes to your medications or medical regimen.
          </p>
          <p className="mt-3" style={{ color: "var(--ink-muted)" }}>
            Drug interaction information is provided for general awareness. The absence of an
            interaction in this tool does not guarantee that no interaction exists.
          </p>
          <p className="mt-3" style={{ color: "var(--ink-muted)" }}>
            ClearRx does not store, process, or transmit any medication information you enter.
            All interaction checks are performed locally in your browser.
          </p>
          <p className="mt-3" style={{ color: "var(--ink-muted)" }}>
            Jay is a licensed pharmacist and senior pharmaceutical researcher. Content on this
            site reflects professional knowledge and is reviewed for accuracy, but does not
            constitute a pharmacist-patient relationship or formal clinical consultation.
          </p>
          <p className="mt-3 font-medium">
            If you believe you are experiencing a drug interaction emergency, call 911 or
            contact Poison Control at{" "}
            <a href="tel:18002221222" style={{ color: "var(--rx-accent)" }}>
              1-800-222-1222
            </a>{" "}
            (US).
          </p>
        </section>
      </article>
    </>
  );
}
```

**Step 2: Build check**

```bash
npm run build
```

Expected: Build succeeds. Fix any TypeScript errors before proceeding.

**Step 3: Commit**

```bash
git add src/app/page.tsx
git commit -m "feat: home page with hero, drug checker, results, pharmacist section, educational content"
git push
```

---

## Phase 4 — Nav, Footer, Static Pages

### Task 13: Nav + Footer

**Files:**
- Create: `src/components/Nav.tsx`
- Create: `src/components/Footer.tsx`

**Step 1: Write `src/components/Nav.tsx`**

```typescript
import Link from "next/link";
import { useTheme } from "./ThemeProvider";

export default function Nav() {
  const { theme, toggle } = useTheme();
  return (
    <header
      className="border-b px-4 py-3 flex items-center justify-between"
      style={{ borderColor: "var(--border)", background: "var(--cream)" }}
    >
      <Link href="/" className="font-mono text-sm tracking-widest" style={{ color: "var(--rx-accent)" }}>
        ClearRx
      </Link>
      <nav className="flex items-center gap-4 text-sm font-sans">
        <Link href="/learn" className="opacity-60 hover:opacity-100 transition-opacity">Learn</Link>
        <Link href="/about" className="opacity-60 hover:opacity-100 transition-opacity">About</Link>
        <button
          onClick={toggle}
          className="opacity-60 hover:opacity-100 transition-opacity text-xs font-mono"
          aria-label="Toggle theme"
        >
          {theme === "light" ? "◐" : "●"}
        </button>
      </nav>
    </header>
  );
}
```

Note: Nav uses `useTheme` — it needs to be a client component. Add `"use client";` at the top.

**Step 2: Write `src/components/Footer.tsx`**

```typescript
import Link from "next/link";

export default function Footer() {
  return (
    <footer
      className="border-t px-4 py-8 mt-16 text-xs font-sans"
      style={{ borderColor: "var(--border)", color: "var(--ink-muted)" }}
    >
      <div className="max-w-2xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <p>© 2026 ClearRx · <span style={{ color: "var(--rx-accent)" }}>clearrx.vibed-lab.com</span></p>
        <nav className="flex gap-4">
          <Link href="/about" className="hover:opacity-100 opacity-60 transition-opacity">About</Link>
          <Link href="/privacy" className="hover:opacity-100 opacity-60 transition-opacity">Privacy</Link>
          <Link href="/contact" className="hover:opacity-100 opacity-60 transition-opacity">Contact</Link>
          <Link href="/learn" className="hover:opacity-100 opacity-60 transition-opacity">Learn</Link>
        </nav>
      </div>
      <p className="text-center mt-4 opacity-40">
        Reviewed by Jay, Licensed Pharmacist. Not medical advice.
      </p>
    </footer>
  );
}
```

**Step 3: Add Nav + Footer to layout.tsx**

In `src/app/layout.tsx`, import and add Nav and Footer around `{children}`:

```typescript
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

// Inside body:
<ThemeProvider>
  <Nav />
  <main>{children}</main>
  <Footer />
</ThemeProvider>
```

**Step 4: Commit**

```bash
git add src/components/Nav.tsx src/components/Footer.tsx src/app/layout.tsx
git commit -m "feat: Nav with theme toggle and Footer with policy links"
git push
```

---

### Task 14: /about, /privacy, /contact pages

**Files:**
- Create: `src/app/about/page.tsx`
- Create: `src/app/privacy/page.tsx`
- Create: `src/app/contact/page.tsx`

**Step 1: Write `src/app/about/page.tsx`**

```typescript
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About — Jay, Licensed Pharmacist",
  description:
    "ClearRx was built by Jay, a licensed pharmacist and senior pharmaceutical researcher, to give patients clear, honest drug interaction information.",
};

export default function AboutPage() {
  return (
    <article className="max-w-2xl mx-auto px-4 py-16 space-y-8">
      <header>
        <h1 className="font-serif text-4xl">About ClearRx</h1>
        <p className="mt-4 text-base font-sans" style={{ color: "var(--ink-muted)" }}>
          Built by a pharmacist who got tired of watching patients get buried in FDA label copy.
        </p>
      </header>

      <section className="space-y-4 text-base font-sans leading-relaxed" style={{ color: "var(--ink-muted)" }}>
        <h2 className="font-serif text-2xl" style={{ color: "var(--ink)" }}>Who I Am</h2>
        <p>
          I'm Jay, a licensed pharmacist with over a decade of clinical experience in retail,
          hospital, and research settings. I specialize in pharmacokinetics and drug-drug
          interactions — specifically how the CYP450 enzyme system affects medication safety.
        </p>
        <p>
          I review medication profiles daily. The most common question I get: "Is it safe to
          take these together?" Existing tools either overwhelm patients with clinical jargon
          or bury the answer under three ad units and a pop-up.
        </p>
      </section>

      <section className="space-y-4 text-base font-sans leading-relaxed" style={{ color: "var(--ink-muted)" }}>
        <h2 className="font-serif text-2xl" style={{ color: "var(--ink)" }}>Why I Built ClearRx</h2>
        <p>
          ClearRx is my answer to that problem. It's a tool I would actually hand to a patient.
          Clean, fast, private. No account. No data sent anywhere. Results in plain English,
          reviewed by a pharmacist — not generated by an algorithm with no accountability.
        </p>
        <p>
          Every interaction explanation on this site was written or reviewed by me. I stand
          behind every word.
        </p>
      </section>

      <div
        className="p-5 border text-sm font-sans"
        style={{ borderColor: "var(--border)", background: "var(--rx-accent-light)" }}
      >
        <p className="font-mono text-xs uppercase mb-2" style={{ color: "var(--rx-accent)" }}>
          Credentials
        </p>
        <ul className="space-y-1 list-disc list-inside" style={{ color: "var(--ink-muted)" }}>
          <li>PharmD — Licensed Pharmacist</li>
          <li>Senior Pharmaceutical Researcher</li>
          <li>Clinical Pharmacokinetics Specialist</li>
          <li>CYP450 Drug Interaction Expert</li>
        </ul>
      </div>
    </article>
  );
}
```

**Step 2: Write `src/app/privacy/page.tsx`**

```typescript
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "ClearRx privacy policy. We do not collect, store, or transmit any personal data.",
};

export default function PrivacyPage() {
  return (
    <article className="max-w-2xl mx-auto px-4 py-16 space-y-8">
      <h1 className="font-serif text-4xl">Privacy Policy</h1>
      <p className="text-sm font-mono opacity-50">Last updated: March 7, 2026</p>

      <div className="space-y-6 text-base font-sans leading-relaxed" style={{ color: "var(--ink-muted)" }}>
        <section>
          <h2 className="font-serif text-xl mb-2" style={{ color: "var(--ink)" }}>Data We Collect</h2>
          <p>
            ClearRx does not collect, store, or transmit any medication information you enter.
            All drug interaction checks are performed entirely within your browser. Your medication
            list never leaves your device.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl mb-2" style={{ color: "var(--ink)" }}>Analytics</h2>
          <p>
            We use Google Analytics (GA4) to understand aggregate traffic patterns — pages visited,
            general location (country/region), and device type. This data is anonymized and does
            not include your medication searches.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl mb-2" style={{ color: "var(--ink)" }}>Advertising</h2>
          <p>
            This site uses Google AdSense to display advertisements. Google may use cookies
            (including DoubleClick cookies) to serve ads based on prior visits to this and other
            websites. You can opt out of personalized advertising at{" "}
            <a href="https://www.google.com/settings/ads" style={{ color: "var(--rx-accent)" }}>
              google.com/settings/ads
            </a>
            .
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl mb-2" style={{ color: "var(--ink)" }}>Cookies</h2>
          <p>
            We use a single cookie to remember your light/dark mode preference. Google Analytics
            and AdSense set their own cookies as described in Google's privacy policy.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl mb-2" style={{ color: "var(--ink)" }}>Contact</h2>
          <p>
            Questions about privacy? Use the{" "}
            <a href="/contact" style={{ color: "var(--rx-accent)" }}>contact form</a>.
          </p>
        </section>
      </div>
    </article>
  );
}
```

**Step 3: Write `src/app/contact/page.tsx`**

```typescript
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contact Jay at ClearRx with questions, feedback, or drug data corrections.",
};

export default function ContactPage() {
  return (
    <article className="max-w-xl mx-auto px-4 py-16">
      <h1 className="font-serif text-4xl mb-4">Contact</h1>
      <p className="font-sans text-base mb-8" style={{ color: "var(--ink-muted)" }}>
        Questions, feedback, or spotted a missing drug? Let me know.
      </p>
      {/* Formspree — replace ACTION_URL with your Formspree endpoint */}
      <form
        action="https://formspree.io/f/YOUR_FORM_ID"
        method="POST"
        className="space-y-4"
      >
        <div>
          <label className="block text-xs font-mono uppercase mb-1">Name</label>
          <input
            type="text"
            name="name"
            required
            className="w-full px-3 py-2 text-sm border outline-none focus:border-[var(--rx-accent)]"
            style={{ background: "var(--cream)", borderColor: "var(--border)", color: "var(--ink)" }}
          />
        </div>
        <div>
          <label className="block text-xs font-mono uppercase mb-1">Email</label>
          <input
            type="email"
            name="email"
            required
            className="w-full px-3 py-2 text-sm border outline-none"
            style={{ background: "var(--cream)", borderColor: "var(--border)", color: "var(--ink)" }}
          />
        </div>
        <div>
          <label className="block text-xs font-mono uppercase mb-1">Message</label>
          <textarea
            name="message"
            required
            rows={5}
            className="w-full px-3 py-2 text-sm border outline-none resize-none"
            style={{ background: "var(--cream)", borderColor: "var(--border)", color: "var(--ink)" }}
          />
        </div>
        <button
          type="submit"
          className="px-6 py-2.5 text-sm font-mono text-white"
          style={{ background: "var(--rx-accent)" }}
        >
          Send Message
        </button>
      </form>
    </article>
  );
}
```

**Step 4: Commit**

```bash
git add src/app/about/ src/app/privacy/ src/app/contact/
git commit -m "feat: /about, /privacy, /contact static pages"
git push
```

---

## Phase 5 — AdSense Infrastructure

### Task 15: ads.txt, robots.txt, sitemap, JSON-LD schema

**Files:**
- Create: `public/ads.txt`
- Create: `public/robots.txt`
- Create: `src/components/JsonLd.tsx`

**Step 1: Write `public/ads.txt`**

```
google.com, pub-6874320463657568, DIRECT, f08c47fec0942fa0
```

**Step 2: Write `public/robots.txt`**

```
User-agent: *
Allow: /
Sitemap: https://clearrx.vibed-lab.com/sitemap.xml
```

**Step 3: Write `src/app/sitemap.ts`** (Next.js 15 built-in sitemap)

```typescript
import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://clearrx.vibed-lab.com";
  return [
    { url: base, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${base}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/privacy`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/contact`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/learn`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
  ];
}
```

**Step 4: Write `src/components/JsonLd.tsx`** for `SoftwareApplication` + `MedicalWebPage` schema

```typescript
export default function JsonLd() {
  const softwareApp = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "ClearRx",
    description:
      "Drug interaction checker. Enter your medications, see a visual network of interactions with plain-English explanations.",
    url: "https://clearrx.vibed-lab.com",
    applicationCategory: "HealthApplication",
    operatingSystem: "Any",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    author: {
      "@type": "Person",
      name: "Jay",
      jobTitle: "Licensed Pharmacist",
    },
  };

  const medicalWebPage = {
    "@context": "https://schema.org",
    "@type": "MedicalWebPage",
    name: "ClearRx — Drug Interaction Checker",
    url: "https://clearrx.vibed-lab.com",
    description:
      "Check drug interactions instantly. Visual network diagram. Written by a licensed pharmacist.",
    reviewedBy: {
      "@type": "Person",
      name: "Jay",
      jobTitle: "Licensed Pharmacist",
    },
    lastReviewed: "2026-03-07",
    audience: { "@type": "PatientsAudience" },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareApp) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(medicalWebPage) }}
      />
    </>
  );
}
```

Add `<JsonLd />` inside `<head>` in `src/app/layout.tsx`.

**Step 5: Commit**

```bash
git add public/ads.txt public/robots.txt src/app/sitemap.ts src/components/JsonLd.tsx src/app/layout.tsx
git commit -m "feat: ads.txt, robots.txt, sitemap, JSON-LD schema (SoftwareApplication + MedicalWebPage)"
git push
```

---

### Task 16: AdSense AdUnit component

**Files:**
- Create: `src/components/AdUnit.tsx`

**Step 1: Write `src/components/AdUnit.tsx`**

```typescript
"use client";
import { useEffect, useRef } from "react";

interface Props {
  slot: string;
  format?: "auto" | "fluid" | "rectangle";
  layout?: string;
  className?: string;
}

declare global {
  interface Window {
    adsbygoogle: unknown[];
  }
}

export default function AdUnit({ slot, format = "auto", layout, className = "" }: Props) {
  const adRef = useRef<HTMLElement | null>(null);
  const pushed = useRef(false);

  useEffect(() => {
    if (pushed.current) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      pushed.current = true;
    } catch {
      // AdSense not loaded (dev mode)
    }
  }, []);

  return (
    <div className={`ad-container ${className}`} style={{ minHeight: "90px" }}>
      <ins
        ref={adRef as React.Ref<HTMLModElement>}
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client="ca-pub-6874320463657568"
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true"
        {...(layout ? { "data-ad-layout": layout } : {})}
      />
    </div>
  );
}
```

Usage (add to home page after Learn Hub links section, after educational content):

```typescript
// In src/app/page.tsx, after the educational article:
import AdUnit from "@/components/AdUnit";

// After </article>:
<div className="max-w-2xl mx-auto px-4 pb-8">
  <AdUnit slot="REPLACE_WITH_SLOT_ID" format="auto" />
</div>
```

**Step 2: Commit**

```bash
git add src/components/AdUnit.tsx
git commit -m "feat: AdUnit component for Google AdSense"
git push
```

---

## Phase 6 — /learn Hub

### Task 17: /learn index page

**Files:**
- Create: `src/app/learn/page.tsx`

**Step 1: Write `src/app/learn/page.tsx`**

```typescript
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Drug Interaction Learning Hub",
  description:
    "Evidence-based articles about drug interactions, written by a licensed pharmacist. Learn what causes drug interactions, how to prevent them, and when to be concerned.",
};

const ARTICLES = [
  {
    slug: "what-is-a-drug-interaction",
    title: "What Is a Drug Interaction? A Pharmacist Explains",
    summary: "A clear breakdown of PK vs PD interactions, why they happen, and how to read severity ratings.",
    keyword: "what is a drug interaction",
  },
  {
    slug: "metformin-alcohol",
    title: "Metformin and Alcohol: What Diabetic Patients Need to Know",
    summary: "Why alcohol and metformin are a risky combination, and what the evidence actually says.",
    keyword: "metformin alcohol interaction",
  },
  {
    slug: "grapefruit-drug-interactions",
    title: "Grapefruit and Medications: The CYP3A4 Enzyme Story",
    summary: "Why a glass of grapefruit juice can triple the blood level of certain medications.",
    keyword: "grapefruit drug interaction",
  },
  {
    slug: "warfarin-ibuprofen",
    title: "Warfarin and Ibuprofen: Why This Sends Thousands to the ER",
    summary: "The two-pronged mechanism that makes warfarin + ibuprofen one of the most dangerous drug pairs.",
    keyword: "warfarin ibuprofen interaction",
  },
  {
    slug: "blood-pressure-medication-combinations",
    title: "Blood Pressure Medications You Should Never Combine",
    summary: "Which antihypertensive combinations cause dangerous additive effects, and safer alternatives.",
    keyword: "blood pressure medication combinations",
  },
];

export default function LearnPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-16">
      <header className="mb-12">
        <h1 className="font-serif text-4xl">Drug Interaction Learning Hub</h1>
        <p className="mt-4 font-sans text-base" style={{ color: "var(--ink-muted)" }}>
          Evidence-based articles written by Jay, a licensed pharmacist. Understand the
          science behind drug interactions before your next appointment.
        </p>
      </header>

      <div className="space-y-6">
        {ARTICLES.map((article) => (
          <Link
            key={article.slug}
            href={`/learn/${article.slug}`}
            className="block group border p-5 transition-colors hover:border-[var(--rx-accent)]"
            style={{ borderColor: "var(--border)" }}
          >
            <h2 className="font-serif text-xl group-hover:opacity-80 transition-opacity">
              {article.title}
            </h2>
            <p className="mt-2 text-sm font-sans" style={{ color: "var(--ink-muted)" }}>
              {article.summary}
            </p>
            <p className="mt-2 text-xs font-mono" style={{ color: "var(--rx-accent)" }}>
              Read article →
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add src/app/learn/page.tsx
git commit -m "feat: /learn hub index page with 5 article cards"
git push
```

---

### Task 18: MDX article template + first article

**Files:**
- Create: `src/app/learn/[slug]/page.tsx`
- Create: `src/app/learn/what-is-a-drug-interaction/page.mdx`

**Step 1: Write `src/app/learn/[slug]/page.tsx`** (dynamic MDX route loader)

Since this is a static export, we use individual MDX page files per article.

**Step 2: Write the first article: `src/app/learn/what-is-a-drug-interaction/page.mdx`**

```mdx
export const metadata = {
  title: "What Is a Drug Interaction? A Pharmacist Explains",
  description:
    "A licensed pharmacist breaks down what drug interactions really are, why they happen, and when to be concerned. Covers PK vs PD mechanisms in plain English.",
};

# What Is a Drug Interaction? A Pharmacist Explains

*By Jay, Licensed Pharmacist* · March 2026

Drug interactions are one of the most common concerns patients bring to me.
"Can I take these together?" is a question I hear dozens of times a day.
The answer is almost never a simple yes or no — but understanding the basics
gives you the tools to ask better questions.

## Two Types of Interactions

Every drug interaction falls into one of two categories: **pharmacokinetic (PK)**
or **pharmacodynamic (PD)**. Knowing which type you're dealing with tells you
a lot about how serious it is and whether monitoring can make it manageable.

### Pharmacokinetic Interactions

PK interactions change *how much* of a drug reaches your bloodstream or target
tissue. They happen at four stages:

- **Absorption** — one drug blocks or speeds up absorption of another
- **Distribution** — drugs compete for protein binding, changing free drug levels
- **Metabolism** — one drug inhibits or induces liver enzymes (CYP450s) that process another
- **Excretion** — one drug affects how quickly another is eliminated by the kidneys

The most clinically significant PK interactions involve the **CYP450 enzyme system**
in the liver. Enzymes like CYP3A4, CYP2C9, and CYP2D6 metabolize roughly 75% of
all drugs. When one drug inhibits CYP3A4, any drug metabolized by that enzyme
accumulates to toxic levels. When a drug *induces* CYP3A4, other drugs get
metabolized too quickly and lose effectiveness.

Example: Fluconazole (an antifungal) inhibits CYP2C9. Warfarin is a CYP2C9
substrate. Together, fluconazole can nearly double warfarin blood levels,
dramatically increasing bleeding risk.

### Pharmacodynamic Interactions

PD interactions happen when two drugs have overlapping or opposing effects on
the *same biological target* — without necessarily changing blood levels.

- **Additive** — two drugs with similar effects combine (e.g., two blood pressure medications)
- **Synergistic** — combined effect exceeds the sum of parts (e.g., alcohol + benzodiazepines)
- **Antagonistic** — one drug blunts the effect of another (e.g., stimulants + sedatives)

Example: Sertraline and tramadol both increase serotonin activity. Neither changes
the blood level of the other. But together, they can trigger **serotonin syndrome** —
a medical emergency.

## Severity Ratings Explained

ClearRx uses four severity levels:

| Level | What It Means |
|-------|---------------|
| **Contraindicated** | Should not be used together under any circumstances |
| **Serious** | Can cause significant harm; requires close medical supervision |
| **Moderate** | May require dose adjustments or monitoring |
| **Minor** | Rarely causes problems; generally manageable |

## When to See a Pharmacist

Any time you start a new medication — prescription or over-the-counter — a
pharmacist can review your complete medication list for interactions in minutes.
This is a free service at most pharmacies and takes less time than a doctor's
appointment.

Don't stop taking prescribed medications without consulting your doctor, even
if ClearRx flags an interaction. Many interactions are manageable with monitoring.

---

*Reviewed by Jay, Licensed Pharmacist. Content is for educational purposes only.
See our [medical disclaimer](/) for full terms.*
```

**Step 3: Commit**

```bash
git add src/app/learn/
git commit -m "feat: /learn hub with first MDX article (what-is-a-drug-interaction)"
git push
```

---

## Phase 7 — Export Features

### Task 19: PNG download (html2canvas)

**Files:**
- Create: `src/components/ShareModal.tsx`
- Modify: `src/app/page.tsx` (add share button)

**Step 1: Write `src/components/ShareModal.tsx`**

```typescript
"use client";
import { useState } from "react";
import type { DrugInteraction, SeverityLevel } from "@/types/drug";

interface Props {
  selectedDrugs: { id: string; name: string }[];
  interactions: DrugInteraction[];
  onClose: () => void;
}

const SEVERITY_COUNTS: Record<SeverityLevel, string> = {
  contraindicated: "text-[#B83232]",
  serious: "text-[#B83232]",
  moderate: "text-[#B86B1A]",
  minor: "text-[#7A8C2E]",
  none: "text-[#9A9490]",
};

export default function ShareModal({ selectedDrugs, interactions, onClose }: Props) {
  const [copying, setCopying] = useState(false);

  function copyLink() {
    navigator.clipboard.writeText(window.location.href);
    setCopying(true);
    setTimeout(() => setCopying(false), 2000);
  }

  async function downloadPNG() {
    const { default: html2canvas } = await import("html2canvas");
    const el = document.getElementById("share-card");
    if (!el) return;
    const canvas = await html2canvas(el, { scale: 2, useCORS: true });
    const link = document.createElement("a");
    link.download = "clearrx-interactions.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  }

  const significant = interactions.filter((ix) => ix.severity !== "none");
  const worst = significant[0]?.severity ?? "none";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backdropFilter: "blur(4px)", background: "rgba(0,0,0,0.4)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-md" style={{ background: "var(--cream)" }}>
        <div className="px-6 pt-5 pb-4 border-b flex justify-between" style={{ borderColor: "var(--border)" }}>
          <h2 className="font-serif text-xl">Share Results</h2>
          <button onClick={onClose} className="opacity-40 hover:opacity-80">✕</button>
        </div>

        {/* Share Card (for html2canvas) */}
        <div
          id="share-card"
          className="m-6 p-5"
          style={{
            background: "#F2EFE7",
            borderTop: "6px solid var(--rx-accent)",
          }}
        >
          <p className="font-mono text-xs mb-3" style={{ color: "var(--rx-accent)" }}>ClearRx</p>
          <div className="flex flex-wrap gap-2 mb-4">
            {selectedDrugs.map((d) => (
              <span
                key={d.id}
                className="text-xs font-mono px-2 py-0.5 border"
                style={{ borderColor: "var(--rx-accent-mid)", background: "var(--rx-accent-light)" }}
              >
                {d.name}
              </span>
            ))}
          </div>
          <p className="text-sm font-sans">
            {significant.length === 0
              ? "✓ No interactions found"
              : `${significant.length} interaction${significant.length !== 1 ? "s" : ""} found`}
          </p>
          <p className="text-xs font-mono mt-4 opacity-50">clearrx.vibed-lab.com</p>
        </div>

        {/* Actions */}
        <div className="px-6 pb-6 space-y-3">
          <button
            onClick={copyLink}
            className="w-full py-2.5 text-sm font-mono border transition-colors"
            style={{ borderColor: "var(--rx-accent)", color: "var(--rx-accent)" }}
          >
            {copying ? "Copied!" : "Copy Link"}
          </button>
          <button
            onClick={downloadPNG}
            className="w-full py-2.5 text-sm font-mono text-white"
            style={{ background: "var(--rx-accent)" }}
          >
            Download PNG
          </button>
        </div>
      </div>
    </div>
  );
}
```

**Step 2: Add Share button to page.tsx**

After the results section, add:

```typescript
// At top of page.tsx state declarations:
const [showShare, setShowShare] = useState(false);

// After results section:
{hasResults && (
  <div className="flex justify-center mt-4">
    <button
      onClick={() => setShowShare(true)}
      className="px-5 py-2 text-sm font-mono border"
      style={{ borderColor: "var(--border)", color: "var(--ink-muted)" }}
    >
      Share Results
    </button>
  </div>
)}

{showShare && (
  <ShareModal
    selectedDrugs={selectedDrugs}
    interactions={interactions}
    onClose={() => setShowShare(false)}
  />
)}
```

**Step 3: Commit**

```bash
git add src/components/ShareModal.tsx src/app/page.tsx
git commit -m "feat: ShareModal with copy link and PNG download (html2canvas)"
git push
```

---

### Task 20: PDF export (jsPDF "Bring to Your Doctor" report)

**Files:**
- Create: `src/lib/generate-pdf.ts`

**Step 1: Write `src/lib/generate-pdf.ts`**

```typescript
import type { DrugInteraction } from "@/types/drug";

interface PDFOptions {
  drugs: { id: string; name: string }[];
  interactions: DrugInteraction[];
}

const SEVERITY_LABELS: Record<string, string> = {
  contraindicated: "CONTRAINDICATED",
  serious: "SERIOUS",
  moderate: "MODERATE",
  minor: "MINOR",
  none: "NONE",
};

export async function generateDoctorReport({ drugs, interactions }: PDFOptions) {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const significant = interactions.filter((ix) => ix.severity !== "none");

  // Header
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("Drug Interaction Report", 20, 25);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Generated: ${new Date().toLocaleDateString()} | clearrx.vibed-lab.com`, 20, 33);
  doc.text("Reviewed by Jay, Licensed Pharmacist", 20, 39);

  // Medications
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.text("Medications Checked", 20, 52);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  drugs.forEach((d, i) => {
    doc.text(`• ${d.name}`, 25, 60 + i * 7);
  });

  // Interactions
  let y = 60 + drugs.length * 7 + 12;
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.text(`Interactions Found: ${significant.length}`, 20, y);
  y += 10;

  significant.forEach((ix) => {
    if (y > 260) {
      doc.addPage();
      y = 20;
    }
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text(`${ix.drugA_id} + ${ix.drugB_id}`, 20, y);
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text(SEVERITY_LABELS[ix.severity] ?? ix.severity, 150, y);
    y += 6;
    doc.setFont("helvetica", "normal");
    const lines = doc.splitTextToSize(ix.mechanism, 170);
    doc.text(lines, 20, y);
    y += lines.length * 5 + 4;

    if (ix.monitoringParameters?.length) {
      doc.text(`Monitor: ${ix.monitoringParameters.join(", ")}`, 20, y);
      y += 8;
    }
  });

  // Footer disclaimer
  doc.addPage();
  doc.setFontSize(9);
  doc.setFont("helvetica", "italic");
  const disclaimer = [
    "MEDICAL DISCLAIMER",
    "",
    "This report is for educational and informational purposes only. It is not intended to substitute",
    "for professional medical advice, diagnosis, or treatment. Always consult a qualified healthcare",
    "provider before making changes to your medications.",
    "",
    "Drug interaction information is provided for general awareness. The absence of an interaction",
    "in this tool does not guarantee that no interaction exists.",
    "",
    "If you believe you are experiencing a drug interaction emergency, call 911 or contact",
    "Poison Control at 1-800-222-1222 (US).",
  ];
  doc.text(disclaimer, 20, 30);

  doc.save("clearrx-doctor-report.pdf");
}
```

**Step 2: Wire up PDF download button in ShareModal**

Add to `ShareModal.tsx`:

```typescript
import { generateDoctorReport } from "@/lib/generate-pdf";

// Add button in actions section:
<button
  onClick={() => generateDoctorReport({ drugs: selectedDrugs, interactions })}
  className="w-full py-2.5 text-sm font-mono border"
  style={{ borderColor: "var(--border)", color: "var(--ink)" }}
>
  Download PDF (Doctor Report)
</button>
```

**Step 3: Commit**

```bash
git add src/lib/generate-pdf.ts src/components/ShareModal.tsx
git commit -m "feat: jsPDF doctor report generation"
git push
```

---

## Phase 8 — Vercel Deploy

### Task 21: Deploy to Vercel

**Step 1: Build locally to verify**

```bash
npm run build
```

Expected: `out/` directory generated with no errors.

**Step 2: Push to GitHub**

```bash
git push
```

**Step 3: Create Vercel project**

1. Go to vercel.com → New Project
2. Import `leejaeyoung2026-bot/clearrx`
3. Framework: Next.js (auto-detected)
4. Build command: `npm run build`
5. Output directory: `out`
6. Deploy

**Step 4: Configure custom subdomain**

1. In Vercel project settings → Domains
2. Add `clearrx.vibed-lab.com`
3. In Cloudflare/DNS: Add CNAME record `clearrx` → `cname.vercel-dns.com`

**Step 5: Verify**

- Open `https://clearrx.vibed-lab.com`
- Check `/ads.txt` is accessible
- Test drug search, interaction check, modal
- Test dark mode toggle

**Step 6: Final commit**

```bash
git add -A
git commit -m "chore: production-ready build, ready for AdSense submission"
git push
```

---

## Quick Reference

### Key File Paths

| Component | Path |
|-----------|------|
| Types | `src/types/drug.ts` |
| Drug DB | `public/data/drug-db.json` |
| Search Index | `public/data/drug-search-index.json` |
| Explanations | `public/data/explanations.json` |
| Search Engine | `src/lib/search-engine.ts` |
| Interaction Engine | `src/lib/interaction-engine.ts` |
| Drug Search UI | `src/components/DrugSearch.tsx` |
| Cytoscape Map | `src/components/InteractionMap.tsx` |
| Results Panel | `src/components/ResultsPanel.tsx` |
| Interaction Modal | `src/components/InteractionModal.tsx` |
| Share Modal | `src/components/ShareModal.tsx` |
| PDF Generator | `src/lib/generate-pdf.ts` |
| Checker Hook | `src/hooks/useInteractionChecker.ts` |
| Home Page | `src/app/page.tsx` |
| Nav | `src/components/Nav.tsx` |
| Footer | `src/components/Footer.tsx` |
| AdUnit | `src/components/AdUnit.tsx` |
| JSON-LD | `src/components/JsonLd.tsx` |
| ads.txt | `public/ads.txt` |

### Severity Color Reference

| Severity | Hex |
|----------|-----|
| Contraindicated / Serious | `#B83232` |
| Moderate | `#B86B1A` |
| Minor | `#7A8C2E` |
| None | `#9A9490` |

### CSS Variable Reference

| Variable | Light | Dark |
|----------|-------|------|
| `--rx-accent` | `#2E7D7A` | `#3DA8A4` |
| `--rx-accent-mid` | `#4A9B97` | `#5BBDB9` |
| `--rx-accent-light` | `#D4EDEC` | `#0D2E2D` |

### MVP Checklist

- [ ] Drug search with Fuse.js autocomplete
- [ ] Chip UI (add/remove drugs)
- [ ] Interaction Map (Cytoscape.js)
- [ ] Results accordion
- [ ] Interaction detail modal
- [ ] "All safe" green state
- [ ] URL-encoded shareable link
- [ ] PNG download
- [ ] PDF doctor report
- [ ] Dark mode
- [ ] Mobile-first responsive
- [ ] Jay's credibility section
- [ ] Medical disclaimer
- [ ] 700–900 words educational content
- [ ] /about, /privacy, /contact
- [ ] ads.txt, robots.txt, sitemap
- [ ] JSON-LD schema
- [ ] Vercel deploy + subdomain
