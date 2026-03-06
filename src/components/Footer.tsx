import Link from "next/link";

export default function Footer() {
  return (
    <footer
      className="border-t px-4 py-8 mt-16 text-xs font-sans"
      style={{ borderColor: "var(--border)", color: "var(--ink-muted)" }}
    >
      <div className="max-w-2xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <p>&copy; 2026 ClearRx &middot; <span style={{ color: "var(--rx-accent)" }}>clearrx.vibed-lab.com</span></p>
        <nav className="flex gap-4">
          <Link href="/about" className="hover:opacity-100 opacity-60 transition-opacity">About</Link>
          <Link href="/privacy" className="hover:opacity-100 opacity-60 transition-opacity">Privacy</Link>
          <Link href="/contact" className="hover:opacity-100 opacity-60 transition-opacity">Contact</Link>
          <Link href="/learn" className="hover:opacity-100 opacity-60 transition-opacity">Learn</Link>
        </nav>
      </div>
      <p className="text-center mt-4 opacity-40">
        Reviewed by Jay, Licensed Pharmacist. Not medical advice.
      </p>
    </footer>
  );
}
