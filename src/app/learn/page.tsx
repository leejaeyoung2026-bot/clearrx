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
  },
  {
    slug: "metformin-alcohol",
    title: "Metformin and Alcohol: What Diabetic Patients Need to Know",
    summary: "Why alcohol and metformin are a risky combination, and what the evidence actually says.",
  },
  {
    slug: "grapefruit-drug-interactions",
    title: "Grapefruit and Medications: The CYP3A4 Enzyme Story",
    summary: "Why a glass of grapefruit juice can triple the blood level of certain medications.",
  },
  {
    slug: "warfarin-ibuprofen",
    title: "Warfarin and Ibuprofen: Why This Sends Thousands to the ER",
    summary: "The two-pronged mechanism that makes warfarin + ibuprofen one of the most dangerous drug pairs.",
  },
  {
    slug: "blood-pressure-medication-combinations",
    title: "Blood Pressure Medications You Should Never Combine",
    summary: "Which antihypertensive combinations cause dangerous additive effects, and safer alternatives.",
  },
  {
    slug: "common-drug-pairs",
    title: "10 Most Commonly Checked Drug Pairs — What You Need to Know",
    summary: "The 10 most frequently searched drug interaction pairs explained with severity ratings and practical advice.",
  },
  {
    slug: "serotonin-syndrome",
    title: "Serotonin Syndrome: The Hidden Risk of Combining Antidepressants",
    summary: "Which drug combinations trigger serotonin syndrome, how to recognize the symptoms, and why it is often missed.",
  },
  {
    slug: "statin-interactions",
    title: "Statin Drug Interactions: What Every Cholesterol Patient Should Know",
    summary: "How CYP3A4 inhibitors affect statin levels, which statins are safest, and when rhabdomyolysis risk spikes.",
  },
  {
    slug: "nsaid-safety-guide",
    title: "NSAIDs and Your Stomach: A Safety Guide",
    summary: "NSAID risks including GI bleeding, kidney concerns, who should avoid them, and safer alternatives.",
  },
  {
    slug: "antibiotic-food-interactions",
    title: "Antibiotics and Food: What Your Pharmacist Wants You to Know",
    summary: "How dairy, calcium, and alcohol affect antibiotic absorption, with practical timing tips.",
  },
  {
    slug: "medication-timing-guide",
    title: "When to Take Your Medications: Timing Matters More Than You Think",
    summary: "Morning vs evening dosing, with/without food, spacing medications, and common timing mistakes.",
  },
  {
    slug: "polypharmacy-elderly",
    title: "Polypharmacy in the Elderly: Managing Multiple Medications Safely",
    summary: "Why seniors face higher drug interaction risks, dangerous combinations to watch for, and practical strategies for safer medication management.",
  },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "Drug Interaction Learning Hub",
  description:
    "Evidence-based articles about drug interactions, written by a licensed pharmacist.",
  url: "https://clearrx.vibed-lab.com/learn",
  isPartOf: {
    "@type": "WebSite",
    name: "ClearRx",
    url: "https://clearrx.vibed-lab.com",
  },
  mainEntity: {
    "@type": "ItemList",
    numberOfItems: ARTICLES.length,
    itemListElement: ARTICLES.map((a, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `https://clearrx.vibed-lab.com/learn/${a.slug}`,
      name: a.title,
    })),
  },
};

export default function LearnPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
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
    </>
  );
}
