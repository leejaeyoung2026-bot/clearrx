import Link from "next/link";

export default function LearnLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <nav className="text-xs font-mono mb-6" style={{ color: "var(--ink-muted)" }}>
        <Link href="/" className="hover:opacity-100 opacity-60 transition-opacity">Home</Link>
        <span className="mx-1">/</span>
        <Link href="/learn" className="hover:opacity-100 opacity-60 transition-opacity">Learn</Link>
      </nav>
      {children}
    </div>
  );
}
