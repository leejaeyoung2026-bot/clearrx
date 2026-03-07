import Link from "next/link";

export default function NotFound() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-24 text-center">
      <h1 className="font-serif text-5xl mb-4">404</h1>
      <p className="font-sans text-lg mb-8" style={{ color: "var(--ink-muted)" }}>
        This page does not exist. It may have been moved or removed.
      </p>
      <nav className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link
          href="/"
          className="px-6 py-3 text-sm font-mono text-white"
          style={{ background: "var(--rx-accent)" }}
        >
          Check Drug Interactions
        </Link>
        <Link
          href="/learn"
          className="px-6 py-3 text-sm font-mono border"
          style={{ borderColor: "var(--border)" }}
        >
          Browse Articles
        </Link>
        <Link
          href="/glossary"
          className="px-6 py-3 text-sm font-mono border"
          style={{ borderColor: "var(--border)" }}
        >
          Glossary
        </Link>
      </nav>
    </div>
  );
}
