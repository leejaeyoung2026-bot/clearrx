import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About — Jay, Licensed Pharmacist",
  description:
    "ClearRx was built by Jay, a licensed pharmacist and pharmaceutical researcher, to give patients clear, honest drug interaction information.",
};

export default function AboutPage() {
  const personJsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Jay",
    jobTitle: "Licensed Pharmacist",
    description:
      "Licensed pharmacist and senior pharmaceutical researcher specializing in clinical pharmacokinetics and CYP450 drug-drug interactions.",
    knowsAbout: [
      "Drug Interactions",
      "Clinical Pharmacokinetics",
      "CYP450 Enzyme System",
      "Polypharmacy Management",
      "Medication Safety",
    ],
    url: "https://clearrx.vibed-lab.com/about",
    sameAs: ["https://vibed-lab.com"],
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://clearrx.vibed-lab.com" },
      { "@type": "ListItem", position: 2, name: "About", item: "https://clearrx.vibed-lab.com/about" },
    ],
  };

  return (
    <article className="max-w-2xl mx-auto px-4 py-16 space-y-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />

      <header>
        <h1 className="font-serif text-4xl">About ClearRx</h1>
        <p className="mt-4 text-base font-sans" style={{ color: "var(--ink-muted)" }}>
          Built by a pharmacist who got tired of watching patients get buried in FDA label copy.
        </p>
      </header>

      {/* Who I Am */}
      <section className="space-y-4 text-base font-sans leading-relaxed" style={{ color: "var(--ink-muted)" }}>
        <h2 className="font-serif text-2xl" style={{ color: "var(--ink)" }}>Who I Am</h2>
        <p>
          I&apos;m Jay, a licensed pharmacist whose work is in industrial pharmacy and
          drug-delivery (DDS) research. I focus on pharmacokinetics and drug-drug
          interactions — specifically how the CYP450 enzyme system affects medication safety.
        </p>
        <p>
          The question patients most often ask is simple: &quot;Is it safe to
          take these together?&quot; Existing tools either overwhelm patients with clinical jargon
          or bury the answer under three ad units and a pop-up.
        </p>
        <p>
          My background is in pharmaceutical research — studying CYP-mediated metabolism
          and enzyme inhibition profiles at a molecular level — combined with a pharmacist&apos;s
          training in how those mechanisms translate into real medication-safety risks. That
          research-plus-pharmacy perspective is what most consumer drug-interaction tools lack.
        </p>
      </section>

      {/* Why I Built ClearRx */}
      <section className="space-y-4 text-base font-sans leading-relaxed" style={{ color: "var(--ink-muted)" }}>
        <h2 className="font-serif text-2xl" style={{ color: "var(--ink)" }}>Why I Built ClearRx</h2>
        <p>
          ClearRx is my answer to that problem. It&apos;s a tool I would actually hand to a patient.
          Clean, fast, private. No account. No data sent anywhere. Results compiled from FDA labels,
          drug-class interaction rules, and clinical literature, with plain-English pharmacist notes
          on key drug pairs — not buried in label copy with no accountability.
        </p>
        <p>
          The interaction database is built from FDA drug labels, drug-class interaction rules, and
          published clinical guidelines. For clinically critical pairs — like sertraline + tramadol
          and their serotonin syndrome risk — I have written pharmacist notes based on FDA labeling
          and published clinical guidelines. Those notes are marked clearly in the result.
        </p>
      </section>

      {/* How ClearRx Works */}
      <section className="space-y-4 text-base font-sans leading-relaxed" style={{ color: "var(--ink-muted)" }}>
        <h2 className="font-serif text-2xl" style={{ color: "var(--ink)" }}>How ClearRx Works</h2>
        <p>
          ClearRx checks your medications against a curated database of clinically significant
          drug interactions. Unlike clinical tools designed for pharmacists, every result includes
          a plain-English explanation of <em>why</em> the interaction matters, <em>what</em> could
          happen, and <em>when</em> to talk to your healthcare provider.
        </p>
        <p>
          The Interaction Map visualizes your entire medication regimen as a network diagram — each
          drug is a node, each interaction is a colored line between them. Red means serious. Yellow
          means moderate. Green means safe. For the first time, you can see your complete medication
          picture at a glance.
        </p>
        <p>
          All processing happens locally in your browser. Your medication list never leaves your
          device. There is no server, no database storing your data, no tracking of what you search.
        </p>
      </section>

      {/* Credentials */}
      <div
        className="p-5 border text-sm font-sans"
        style={{ borderColor: "var(--border)", background: "var(--rx-accent-light)" }}
      >
        <p className="font-mono text-xs uppercase mb-3" style={{ color: "var(--rx-accent)" }}>
          Credentials &amp; Expertise
        </p>
        <ul className="space-y-2 list-disc list-inside" style={{ color: "var(--ink-muted)" }}>
          <li><strong>Licensed Pharmacist</strong> — registered pharmacist</li>
          <li><strong>Senior Pharmaceutical Researcher</strong> — CYP-mediated drug metabolism</li>
          <li><strong>Clinical Pharmacokinetics Specialist</strong> — ADME and drug disposition</li>
          <li><strong>CYP450 Drug Interaction Expert</strong> — enzyme inhibition/induction profiling</li>
          <li><strong>Industrial pharmacy &amp; drug-delivery (DDS) research</strong> — formulation and drug disposition</li>
        </ul>
      </div>

      {/* Editorial Process */}
      <section className="space-y-4 text-base font-sans leading-relaxed" style={{ color: "var(--ink-muted)" }}>
        <h2 className="font-serif text-2xl" style={{ color: "var(--ink)" }}>Editorial Process</h2>
        <p>
          Every piece of content on ClearRx follows a structured review process:
        </p>
        <ol className="list-decimal list-inside space-y-2">
          <li>
            <strong>Evidence gathering</strong> — interaction data is drawn from FDA drug labels,
            drug-class interaction rules, and published clinical literature.
          </li>
          <li>
            <strong>Clinical translation</strong> — technical mechanisms are translated into
            plain-English explanations without sacrificing accuracy.
          </li>
          <li>
            <strong>Source-based classification</strong> — severity classifications and mechanisms are
            based on FDA labels, drug-class interaction rules, and clinical literature; key pairs
            receive a personally written pharmacist note for clinical accuracy and practical relevance.
          </li>
          <li>
            <strong>Regular updates</strong> — the drug database and interaction explanations are
            updated as new safety data, FDA warnings, or clinical guidelines are published.
          </li>
        </ol>
      </section>

      {/* Part of Vibed Lab */}
      <section className="space-y-4 text-base font-sans leading-relaxed" style={{ color: "var(--ink-muted)" }}>
        <h2 className="font-serif text-2xl" style={{ color: "var(--ink)" }}>Part of Vibed Lab</h2>
        <p>
          ClearRx is part of{" "}
          <a href="https://vibed-lab.com" target="_blank" rel="noopener noreferrer" style={{ color: "var(--rx-accent)" }}>
            Vibed Lab
          </a>
          , a collection of focused, no-frills tools built by Jay. Other projects include:
        </p>
        <div className="space-y-3 mt-4">
          <div className="p-4 border" style={{ borderColor: "var(--border)" }}>
            <a
              href="https://backtest.vibed-lab.com"
              target="_blank"
              rel="noopener noreferrer"
              className="font-serif text-lg"
              style={{ color: "var(--rx-accent)" }}
            >
              CryptoBacktest
            </a>
            <p className="text-sm mt-1">
              Backtest cryptocurrency trading strategies against real historical price data.
            </p>
          </div>
          <div className="p-4 border" style={{ borderColor: "var(--border)" }}>
            <a
              href="https://cycle.vibed-lab.com"
              target="_blank"
              rel="noopener noreferrer"
              className="font-serif text-lg"
              style={{ color: "var(--rx-accent)" }}
            >
              BitcoinCycle Clock
            </a>
            <p className="text-sm mt-1">
              Real-time Bitcoin market cycle positioning with on-chain indicators.
            </p>
          </div>
        </div>
      </section>

      {/* Explore More */}
      <section className="space-y-3">
        <h2 className="font-serif text-2xl" style={{ color: "var(--ink)" }}>Explore ClearRx</h2>
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
            href="/glossary"
            className="px-4 py-2 border transition-colors hover:border-[var(--rx-accent)]"
            style={{ borderColor: "var(--border)", color: "var(--ink-muted)" }}
          >
            Glossary
          </Link>
          <Link
            href="/contact"
            className="px-4 py-2 border transition-colors hover:border-[var(--rx-accent)]"
            style={{ borderColor: "var(--border)", color: "var(--ink-muted)" }}
          >
            Contact
          </Link>
        </div>
      </section>
    </article>
  );
}
