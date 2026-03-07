import Link from "next/link";

export default function NotFound() {
  return (
    <article className="max-w-xl mx-auto px-4 py-24 text-center">
      <p
        className="text-6xl font-mono font-bold mb-4"
        style={{ color: "var(--rx-accent)" }}
      >
        404
      </p>
      <h1
        className="font-serif text-2xl mb-3"
        style={{ color: "var(--ink)" }}
      >
        Page Not Found
      </h1>
      <p
        className="font-sans text-base mb-8 leading-relaxed"
        style={{ color: "var(--ink-muted)" }}
      >
        The page you are looking for does not exist or has been moved. Try one
        of the links below to get back on track.
      </p>
      <nav className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link
          href="/"
          className="px-6 py-3 text-sm font-mono text-white transition-colors"
          style={{ background: "var(--rx-accent)" }}
        >
          Check Interactions
        </Link>
        <Link
          href="/learn"
          className="px-6 py-3 text-sm font-mono border transition-colors"
          style={{ borderColor: "var(--border)", color: "var(--ink-muted)" }}
        >
          Browse Articles
        </Link>
        <Link
          href="/faq"
          className="px-6 py-3 text-sm font-mono border transition-colors"
          style={{ borderColor: "var(--border)", color: "var(--ink-muted)" }}
        >
          Read FAQ
        </Link>
      </nav>
    </article>
  );
}
