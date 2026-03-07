import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Drug Interaction Glossary",
  description:
    "Plain-English definitions of common drug interaction terms — CYP450 enzymes, pharmacokinetics, severity levels, and more. Written by a licensed pharmacist.",
};

interface GlossaryTerm {
  term: string;
  definition: string;
}

const TERMS: GlossaryTerm[] = [
  {
    term: "Absorption",
    definition:
      "The process by which a drug moves from where you take it (usually your stomach or intestines) into your bloodstream. How quickly and completely a drug is absorbed affects how fast it starts working. Food, antacids, and other medications can speed up or slow down absorption.",
  },
  {
    term: "ADME",
    definition:
      "An abbreviation for the four stages a drug goes through in your body: Absorption, Distribution, Metabolism, and Excretion. Pharmacists use ADME to understand how a drug travels through your system and where interactions with other medications can occur.",
  },
  {
    term: "Adverse Drug Reaction",
    definition:
      "An unwanted or harmful effect caused by a medication when it is used at the normal dose. Adverse reactions range from mild (like a rash or upset stomach) to severe (like liver damage or a dangerous drop in blood pressure). Drug interactions can increase the risk of adverse reactions.",
  },
  {
    term: "Agonist",
    definition:
      "A drug that activates a specific receptor in your body to produce an effect. For example, morphine is an agonist at opioid receptors, which is why it reduces pain. When two agonists target the same receptor, their combined effect can be stronger than either drug alone.",
  },
  {
    term: "Antagonist",
    definition:
      "A drug that blocks a receptor, preventing it from being activated. Antagonists essentially cancel out the effect of an agonist. For example, naloxone is an opioid antagonist used to reverse overdoses. Taking an agonist and an antagonist for the same receptor together can reduce or eliminate the benefit of one or both drugs.",
  },
  {
    term: "Bioavailability",
    definition:
      "The percentage of a drug dose that actually reaches your bloodstream in active form. A drug given by IV injection has 100% bioavailability because it goes directly into the blood. Pills taken by mouth usually have lower bioavailability because some of the drug is broken down before it reaches your bloodstream.",
  },
  {
    term: "Clearance",
    definition:
      "The rate at which your body removes a drug from your bloodstream. Clearance happens mainly through the liver (metabolism) and kidneys (excretion). When another drug slows clearance, the first drug builds up in your body and may reach dangerous levels.",
  },
  {
    term: "Contraindication",
    definition:
      "A specific situation or condition in which a drug should not be used because the risks clearly outweigh the benefits. For example, a drug that causes bleeding may be contraindicated in patients already on blood thinners. Contraindicated drug combinations should generally be avoided entirely.",
  },
  {
    term: "CYP450 (Cytochrome P450)",
    definition:
      "A family of enzymes in your liver that break down the majority of medications. Different CYP450 enzymes (like CYP3A4, CYP2D6, and CYP2C19) handle different drugs. Many drug interactions happen because one medication speeds up or slows down a CYP450 enzyme that another medication depends on for breakdown.",
  },
  {
    term: "Distribution",
    definition:
      "The process by which a drug spreads from your bloodstream into your body's tissues and organs. Some drugs stay mostly in the blood, while others spread widely into fat, muscle, or the brain. Drug interactions can change distribution by competing for the same protein carriers in the blood.",
  },
  {
    term: "Dose-Response Relationship",
    definition:
      "The connection between the amount of a drug you take and the effect it produces. Higher doses generally produce stronger effects — both beneficial and harmful. Drug interactions can shift this relationship, making a normal dose act like a higher dose (if the interacting drug slows its breakdown) or a lower dose (if the interacting drug speeds up its elimination).",
  },
  {
    term: "Drug-Food Interaction",
    definition:
      "A change in how a medication works caused by food, beverages, or dietary supplements. Common examples include calcium in dairy products reducing antibiotic absorption, grapefruit juice inhibiting CYP3A4 enzymes, and vitamin K in leafy greens opposing warfarin's blood-thinning effect. Timing medications around meals can often prevent these interactions.",
  },
  {
    term: "Drug-Drug Interaction",
    definition:
      "A change in the way a medication works when it is taken with another medication. One drug may increase or decrease the effect of the other, or the combination may cause new side effects that neither drug causes alone. This is the core concept behind everything ClearRx checks for.",
  },
  {
    term: "Efficacy",
    definition:
      "How well a drug works at producing its intended effect under ideal conditions. A drug with high efficacy is very effective at treating the condition it is prescribed for. Drug interactions can reduce efficacy, meaning your medication may not work as well as expected.",
  },
  {
    term: "Enzyme Induction",
    definition:
      "When a drug causes your body to produce more of a specific CYP450 enzyme. This speeds up the breakdown of other drugs that rely on that enzyme, which can lower their blood levels and make them less effective. For example, the antibiotic rifampin is a powerful enzyme inducer that can make birth control pills less effective.",
  },
  {
    term: "Enzyme Inhibition",
    definition:
      "When a drug slows down or blocks a specific CYP450 enzyme. This causes other drugs broken down by that enzyme to build up in your body, potentially reaching toxic levels. For example, grapefruit juice inhibits CYP3A4, which is why it interacts with many common medications.",
  },
  {
    term: "Excretion",
    definition:
      "The final stage of a drug's journey through your body, where the drug or its breakdown products are removed, usually through the kidneys (into urine) or the liver (into bile and then stool). Kidney disease can slow excretion and cause drugs to accumulate.",
  },
  {
    term: "First-Pass Effect",
    definition:
      "The process by which a drug taken by mouth is partially broken down by the liver before it ever reaches the rest of your body. This is why the dose of some oral medications is much higher than the dose that would be needed if given by injection. Drugs that inhibit the enzymes involved in first-pass metabolism can dramatically increase another drug's blood levels.",
  },
  {
    term: "Half-Life",
    definition:
      "The amount of time it takes for the concentration of a drug in your blood to drop by half. A drug with a short half-life leaves your body quickly and may need to be taken multiple times a day. A drug with a long half-life stays in your system longer, which means interactions can persist even after you stop taking one of the drugs.",
  },
  {
    term: "Hepatic Metabolism",
    definition:
      "The breakdown of drugs by enzymes in your liver. The liver is the primary site where most medications are chemically transformed into inactive forms that your body can eliminate. Most drug-drug interactions that ClearRx identifies involve hepatic metabolism, specifically the CYP450 enzyme system.",
  },
  {
    term: "Interaction Severity",
    definition:
      "A rating that describes how dangerous a drug interaction is likely to be. ClearRx uses three levels: Serious (potentially life-threatening, generally avoid the combination), Moderate (may require dose changes or monitoring), and Minor (unlikely to cause significant harm for most people). Severity ratings help you prioritize which interactions to discuss with your healthcare provider first.",
  },
  {
    term: "NSAID (Nonsteroidal Anti-Inflammatory Drug)",
    definition:
      "A class of medications that reduce pain, inflammation, and fever by blocking enzymes (COX-1 and COX-2) that produce prostaglandins. Common NSAIDs include ibuprofen, naproxen, and aspirin. NSAIDs carry risks of GI bleeding and kidney damage, especially when combined with blood thinners, ACE inhibitors, or other NSAIDs.",
  },
  {
    term: "Over-the-Counter (OTC)",
    definition:
      "Medications available without a prescription. Many OTC drugs — including NSAIDs, antacids, antihistamines, and decongestants — can interact with prescription medications. Patients often forget to mention OTC drugs to their doctor or pharmacist, which is why ClearRx includes them in its interaction database.",
  },
  {
    term: "Mechanism-Based Inhibition",
    definition:
      "A type of enzyme inhibition that is irreversible \u2014 the drug permanently deactivates the enzyme it binds to. Your body must produce entirely new enzyme molecules to recover, which can take days. This makes the interaction effect last much longer than the inhibiting drug itself stays in your system.",
  },
  {
    term: "Metabolism",
    definition:
      "The chemical process by which your body breaks down a drug into different compounds (called metabolites), usually to make it easier to eliminate. Most metabolism occurs in the liver. When another drug interferes with this process, the original drug can build up or be eliminated too quickly.",
  },
  {
    term: "P-glycoprotein",
    definition:
      "A protein pump found in your intestines, liver, kidneys, and brain that actively pushes certain drugs out of cells. P-glycoprotein acts like a bouncer, limiting how much of a drug gets into your bloodstream or brain. Some drugs can inhibit or induce P-glycoprotein, changing the absorption and distribution of other medications.",
  },
  {
    term: "Pharmacodynamics (PD)",
    definition:
      "The study of what a drug does to your body. Pharmacodynamics covers how a drug produces its effects, including which receptors it targets, how it changes cell function, and what therapeutic or side effects result. Pharmacodynamic interactions occur when two drugs act on the same target or produce overlapping effects.",
  },
  {
    term: "Pharmacokinetics (PK)",
    definition:
      "The study of what your body does to a drug \u2014 how it is absorbed, distributed, metabolized, and excreted (ADME). Pharmacokinetic interactions occur when one drug changes the blood levels of another by affecting any of these four processes. Most of the interactions ClearRx identifies are pharmacokinetic.",
  },
  {
    term: "Polypharmacy",
    definition:
      "The use of multiple medications at the same time, typically defined as five or more. Polypharmacy is common in older adults and people with chronic conditions. The more medications you take, the higher the chance of drug interactions, which is exactly why tools like ClearRx exist.",
  },
  {
    term: "Prodrug",
    definition:
      "A medication that is inactive when you take it and must be converted into its active form by enzymes in your body. Codeine, for example, must be converted to morphine by the CYP2D6 enzyme to work. If another drug inhibits that enzyme, the prodrug may never become active and will not provide its intended benefit.",
  },
  {
    term: "QT Prolongation",
    definition:
      "A change in the electrical activity of the heart that can lead to dangerous irregular heartbeats. Many medications can cause QT prolongation on their own, and the risk increases significantly when two or more QT-prolonging drugs are taken together. This is one of the most clinically serious types of drug interaction.",
  },
  {
    term: "Renal Clearance",
    definition:
      "The removal of a drug from the body through the kidneys into urine. Drugs that are primarily eliminated through renal clearance may accumulate to dangerous levels in patients with kidney disease. Some drug interactions involve competition for the same kidney transport pathways.",
  },
  {
    term: "Serotonin Syndrome",
    definition:
      "A potentially life-threatening condition caused by too much serotonin activity in the brain. It can occur when two or more drugs that increase serotonin are taken together, such as certain antidepressants (SSRIs, SNRIs), migraine medications (triptans), and pain medications (tramadol). Symptoms include agitation, rapid heart rate, high body temperature, and muscle rigidity.",
  },
  {
    term: "Substrate",
    definition:
      "A drug that is broken down (metabolized) by a specific enzyme. For example, if a drug is a CYP3A4 substrate, it means CYP3A4 is the enzyme responsible for metabolizing that drug. Knowing which enzyme handles which drug is the key to predicting most pharmacokinetic drug interactions.",
  },
  {
    term: "Therapeutic Index",
    definition:
      "The range between the dose of a drug that is effective and the dose that becomes toxic. A drug with a narrow therapeutic index (like warfarin or lithium) has very little room for error \u2014 even a small increase in blood levels can cause serious harm. Drug interactions that affect medications with a narrow therapeutic index are especially dangerous and require close monitoring.",
  },
];

/* Group terms by first letter */
function groupByLetter(terms: GlossaryTerm[]): Record<string, GlossaryTerm[]> {
  const groups: Record<string, GlossaryTerm[]> = {};
  for (const t of terms) {
    const letter = t.term[0].toUpperCase();
    if (!groups[letter]) groups[letter] = [];
    groups[letter].push(t);
  }
  return groups;
}

const breadcrumbLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://clearrx.vibed-lab.com" },
    { "@type": "ListItem", position: 2, name: "Glossary", item: "https://clearrx.vibed-lab.com/glossary" },
  ],
};

export default function GlossaryPage() {
  const grouped = groupByLetter(TERMS);
  const letters = Object.keys(grouped).sort();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "DefinedTermSet",
    name: "ClearRx Drug Interaction Glossary",
    description:
      "Plain-English definitions of common drug interaction and pharmacology terms, written by a licensed pharmacist.",
    url: "https://clearrx.vibed-lab.com/glossary",
    hasDefinedTerm: TERMS.map((t) => ({
      "@type": "DefinedTerm",
      name: t.term,
      description: t.definition,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />

      <article className="max-w-2xl mx-auto px-4 py-16">
        {/* Header */}
        <header className="mb-10">
          <h1 className="font-serif text-4xl" style={{ color: "var(--ink)" }}>
            Drug Interaction Glossary
          </h1>
          <p
            className="mt-4 font-sans text-base leading-relaxed"
            style={{ color: "var(--ink-muted)" }}
          >
            Plain-English definitions of the pharmacology and drug interaction
            terms you will encounter on ClearRx. Written and reviewed by a
            licensed pharmacist — no clinical jargon left unexplained.
          </p>
        </header>

        {/* Jump-to-letter nav */}
        <nav
          className="mb-12 p-4 border flex flex-wrap gap-2"
          style={{
            borderColor: "var(--border)",
            background: "var(--rx-accent-light)",
          }}
          aria-label="Jump to letter"
        >
          <span
            className="font-mono text-xs uppercase mr-2 self-center"
            style={{ color: "var(--rx-accent)" }}
          >
            Jump to:
          </span>
          {letters.map((letter) => (
            <a
              key={letter}
              href={`#letter-${letter}`}
              className="inline-flex items-center justify-center w-8 h-8 text-sm font-sans font-medium border transition-colors hover:border-[var(--rx-accent)]"
              style={{
                borderColor: "var(--border)",
                color: "var(--ink)",
              }}
            >
              {letter}
            </a>
          ))}
        </nav>

        {/* Term groups */}
        <div className="space-y-12">
          {letters.map((letter) => (
            <section key={letter} id={`letter-${letter}`}>
              <h2
                className="font-serif text-2xl mb-6 pb-2 border-b"
                style={{
                  color: "var(--rx-accent)",
                  borderColor: "var(--border)",
                }}
              >
                {letter}
              </h2>

              <dl className="space-y-6">
                {grouped[letter].map((item) => (
                  <div key={item.term}>
                    <dt
                      className="font-sans font-medium text-base"
                      style={{ color: "var(--ink)" }}
                    >
                      {item.term}
                    </dt>
                    <dd
                      className="mt-1 font-sans text-base leading-relaxed"
                      style={{ color: "var(--ink-muted)" }}
                    >
                      {item.definition}
                    </dd>
                  </div>
                ))}
              </dl>
            </section>
          ))}
        </div>

        {/* Disclaimer */}
        <div
          className="mt-16 p-5 border text-sm font-sans"
          style={{
            borderColor: "var(--border)",
            background: "var(--rx-accent-light)",
          }}
        >
          <p
            className="font-mono text-xs uppercase mb-2"
            style={{ color: "var(--rx-accent)" }}
          >
            Pharmacist&apos;s Note
          </p>
          <p style={{ color: "var(--ink-muted)" }}>
            This glossary is designed to help you understand the terminology
            behind drug interactions. It is not a substitute for professional
            medical advice. If you have questions about how your specific
            medications interact, use the{" "}
            <Link href="/" style={{ color: "var(--rx-accent)" }}>
              Drug Interaction Checker
            </Link>{" "}
            or consult your pharmacist or physician.
          </p>
        </div>

        {/* Explore More */}
        <section className="mt-12 space-y-3">
          <h2 className="font-serif text-2xl" style={{ color: "var(--ink)" }}>
            Explore ClearRx
          </h2>
          <div className="flex flex-wrap gap-3 text-sm font-sans">
            <Link
              href="/"
              className="px-4 py-2 border transition-colors hover:border-[var(--rx-accent)]"
              style={{ borderColor: "var(--border)", color: "var(--ink-muted)" }}
            >
              Drug Interaction Checker
            </Link>
            <Link
              href="/learn"
              className="px-4 py-2 border transition-colors hover:border-[var(--rx-accent)]"
              style={{ borderColor: "var(--border)", color: "var(--ink-muted)" }}
            >
              Learning Hub
            </Link>
            <Link
              href="/faq"
              className="px-4 py-2 border transition-colors hover:border-[var(--rx-accent)]"
              style={{ borderColor: "var(--border)", color: "var(--ink-muted)" }}
            >
              FAQ
            </Link>
            <Link
              href="/about"
              className="px-4 py-2 border transition-colors hover:border-[var(--rx-accent)]"
              style={{ borderColor: "var(--border)", color: "var(--ink-muted)" }}
            >
              About
            </Link>
          </div>
        </section>
      </article>
    </>
  );
}
