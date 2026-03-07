import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Contact Jay, the pharmacist behind ClearRx, for feedback, bug reports, or drug data corrections.",
};

export default function ContactPage() {
  return (
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
          href="mailto:jay@vibed-lab.com"
          className="inline-block font-mono text-base px-4 py-3 border transition-colors"
          style={{
            color: "var(--rx-accent)",
            borderColor: "var(--border)",
            background: "var(--cream)",
          }}
        >
          jay@vibed-lab.com
        </a>

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

      <section className="mb-10">
        <h2 className="font-serif text-xl mb-3">Other Vibed Lab Projects</h2>
        <p className="mb-4 leading-relaxed">
          ClearRx is part of{" "}
          <a
            href="https://vibed-lab.com"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "var(--rx-accent)" }}
          >
            Vibed Lab
          </a>
          , a small portfolio of focused tools. You might also find these useful:
        </p>
        <div className="space-y-3">
          <div
            className="p-4 border"
            style={{ borderColor: "var(--border)", background: "var(--cream)" }}
          >
            <a
              href="https://backtest.vibed-lab.com"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium font-serif"
              style={{ color: "var(--rx-accent)" }}
            >
              CryptoBacktest
            </a>
            <p className="text-sm mt-1" style={{ color: "var(--ink-muted)" }}>
              backtest.vibed-lab.com — Backtest historical trading strategies
              against real Bitcoin and crypto price data.
            </p>
          </div>
          <div
            className="p-4 border"
            style={{ borderColor: "var(--border)", background: "var(--cream)" }}
          >
            <a
              href="https://cycle.vibed-lab.com"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium font-serif"
              style={{ color: "var(--rx-accent)" }}
            >
              BitcoinCycle Clock
            </a>
            <p className="text-sm mt-1" style={{ color: "var(--ink-muted)" }}>
              cycle.vibed-lab.com — Real-time Bitcoin market cycle dashboard with
              on-chain indicators.
            </p>
          </div>
        </div>
      </section>
    </article>
  );
}
