"use client";
import Link from "next/link";
import { useTheme } from "./ThemeProvider";

export default function Nav() {
  const { theme, toggle } = useTheme();
  return (
    <header
      className="border-b px-4 py-3 flex items-center justify-between"
      style={{ borderColor: "var(--border)", background: "var(--cream)" }}
    >
      <Link href="/" className="font-mono text-sm tracking-widest" style={{ color: "var(--rx-accent)" }}>
        ClearRx
      </Link>
      <nav className="flex items-center gap-4 text-sm font-sans">
        <Link href="/learn" className="opacity-60 hover:opacity-100 transition-opacity">Learn</Link>
        <Link href="/faq" className="opacity-60 hover:opacity-100 transition-opacity">FAQ</Link>
        <Link href="/about" className="opacity-60 hover:opacity-100 transition-opacity">About</Link>
        <button
          onClick={toggle}
          className="opacity-60 hover:opacity-100 transition-opacity text-xs font-mono"
          aria-label="Toggle theme"
        >
          {theme === "light" ? "\u25D0" : "\u25CF"}
        </button>
      </nav>
    </header>
  );
}
