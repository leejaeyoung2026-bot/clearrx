import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Contact Jay, the pharmacist behind ClearRx, for feedback, bug reports, or drug data corrections.",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "ContactPage",
  name: "Contact ClearRx",
  url: "https://clearrx.vibed-lab.com/contact",
  mainEntity: {
    "@type": "Organization",
    name: "ClearRx",
    url: "https://clearrx.vibed-lab.com",
    contactPoint: {
      "@type": "ContactPoint",
      email: "contact@vibed-lab.com",
      contactType: "customer support",
      availableLanguage: "English",
    },
  },
};

export default function ContactPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <article
        className="max-w-2xl mx-auto px-4 py-16"
        style={{ color: "var(--ink)" }}
      >
      <h1 className="font-serif text-4xl mb-4">Contact</h1>
      <p
        className="mb-10 leading-relaxed"
        style={{ color: "var(--ink-muted)" }}
      >
        ClearRx is a personal project by Jay, a licensed pharmacist. I read
        every message and appreciate all feedback.
      </p>

      <section className="mb-10">
        <h2 className="font-serif text-xl mb-3">Get in Touch</h2>
        <p className="mb-4 leading-relaxed">
          For questions, feedback, or drug data corrections, the best way to
          reach me is by email:
        </p>
        <a
          href="mailto:contact@vibed-lab.com"
          className="inline-block font-mono text-base px-4 py-3 border transition-colors"
          style={{
            color: "var(--rx-accent)",
            borderColor: "var(--border)",
            background: "var(--cream)",
          }}
        >
          contact@vibed-lab.com
        </a>

        <div className="mt-4 flex gap-4">
          <a href="https://x.com/vibed_lab" target="_blank" rel="noopener noreferrer" style={{ color: "var(--rx-accent)", fontSize: "0.9rem" }}>X @vibed_lab</a>
          <a href="https://www.linkedin.com/in/jae-young-lee-8516303b5/" target="_blank" rel="noopener noreferrer" style={{ color: "var(--rx-accent)", fontSize: "0.9rem" }}>LinkedIn</a>
        </div>

        <div className="mt-6">
          <p className="mb-2 text-sm" style={{ color: "var(--ink-muted)" }}>
            What I would love to hear about:
          </p>
          <ul
            className="list-disc pl-6 space-y-1 text-sm leading-relaxed"
            style={{ color: "var(--ink-muted)" }}
          >
            <li>Missing drugs or incorrect interaction data</li>
            <li>UI issues or broken features</li>
            <li>Suggestions for new drug interaction explanations</li>
            <li>Accessibility or usability improvements</li>
            <li>General feedback on the site experience</li>
          </ul>
        </div>
      </section>

      <section className="mb-10">
        <h2 className="font-serif text-xl mb-3">GitHub</h2>
        <p className="mb-4 leading-relaxed">
          ClearRx is an open project. If you find a bug or want to contribute,
          feel free to open an issue or pull request on GitHub:
        </p>
        <a
          href="https://github.com/leejaeyoung2026-bot/clearrx"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block font-mono text-sm px-4 py-3 border transition-colors"
          style={{
            color: "var(--ink-muted)",
            borderColor: "var(--border)",
            background: "var(--cream)",
          }}
        >
          github.com/leejaeyoung2026-bot/clearrx
        </a>
      </section>

      </article>
    </>
  );
}
