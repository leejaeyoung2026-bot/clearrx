import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "ClearRx privacy policy — how we handle data, cookies, and analytics. We do not collect, store, or transmit any medication information.",
};

const breadcrumbLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://clearrx.vibed-lab.com" },
    { "@type": "ListItem", position: 2, name: "Privacy Policy", item: "https://clearrx.vibed-lab.com/privacy" },
  ],
};

export default function PrivacyPage() {
  return (
    <article className="max-w-2xl mx-auto px-4 py-16 space-y-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />

      <h1 className="font-serif text-4xl">Privacy Policy</h1>
      <p className="text-sm font-mono opacity-50">Last updated: March 7, 2026</p>

      <div className="space-y-6 text-base font-sans leading-relaxed" style={{ color: "var(--ink-muted)" }}>
        <section>
          <h2 className="font-serif text-xl mb-2" style={{ color: "var(--ink)" }}>No Account Required</h2>
          <p>
            ClearRx requires no account, registration, or login. You can use every feature
            anonymously. We do not collect, store, or transmit any medication information
            you enter. All drug interaction checks run entirely within your browser — your
            medication list never leaves your device.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl mb-2" style={{ color: "var(--ink)" }}>Google Analytics (GA4)</h2>
          <p className="mb-3">
            We use Google Analytics 4 to understand aggregate, anonymous traffic patterns —
            pages visited, general location (country/region), and device type. This data does
            not include your medication searches and does not reveal the identity of individual
            users.
          </p>
          <p>
            Google Analytics sets its own cookies to track sessions and page views. This data
            is processed by Google under their{" "}
            <a
              href="https://policies.google.com/privacy"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "var(--rx-accent)" }}
            >
              Privacy Policy
            </a>
            . You can opt out using the{" "}
            <a
              href="https://tools.google.com/dlpage/gaoptout"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "var(--rx-accent)" }}
            >
              Google Analytics Opt-out Browser Add-on
            </a>
            .
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl mb-2" style={{ color: "var(--ink)" }}>Google AdSense</h2>
          <p className="mb-3">
            This site displays advertisements served by Google AdSense. Google may use cookies
            and web beacons to serve ads based on your prior visits to this and other websites.
          </p>
          <p>
            Google's use of advertising cookies is governed by their{" "}
            <a
              href="https://policies.google.com/technologies/ads"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "var(--rx-accent)" }}
            >
              Advertising Policies
            </a>
            . You can opt out of personalized advertising at{" "}
            <a
              href="https://www.google.com/settings/ads"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "var(--rx-accent)" }}
            >
              Google Ad Settings
            </a>
            .
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl mb-2" style={{ color: "var(--ink)" }}>Cookies &amp; Local Storage</h2>
          <p className="mb-3">
            ClearRx uses your browser's localStorage for one purpose only: remembering your
            light or dark mode preference. This is entirely client-side and never transmitted
            to any server.
          </p>
          <p>
            Google Analytics and AdSense set their own cookies as described in their
            respective privacy policies above. You can clear all site data at any time through
            your browser settings.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl mb-2" style={{ color: "var(--ink)" }}>Third-Party Data Sharing</h2>
          <p>
            We do not sell, trade, or share any data with third parties beyond what is
            described above (Google Analytics and Google AdSense). No email lists, no
            marketing platforms, no data brokers.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl mb-2" style={{ color: "var(--ink)" }}>Contact</h2>
          <p>
            If you have questions about this privacy policy, reach out at{" "}
            <a href="mailto:contact@vibed-lab.com" style={{ color: "var(--rx-accent)" }}>
              contact@vibed-lab.com
            </a>{" "}
            or visit the{" "}
            <Link href="/contact" style={{ color: "var(--rx-accent)" }}>
              contact page
            </Link>
            .
          </p>
        </section>
      </div>
    </article>
  );
}
