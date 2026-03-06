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
