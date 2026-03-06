import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contact Jay at ClearRx with questions, feedback, or drug data corrections.",
};

export default function ContactPage() {
  return (
    <article className="max-w-xl mx-auto px-4 py-16">
      <h1 className="font-serif text-4xl mb-4">Contact</h1>
      <p className="font-sans text-base mb-8" style={{ color: "var(--ink-muted)" }}>
        Questions, feedback, or spotted a missing drug? Let me know.
      </p>
      <form
        action="https://formspree.io/f/YOUR_FORM_ID"
        method="POST"
        className="space-y-4"
      >
        <div>
          <label className="block text-xs font-mono uppercase mb-1">Name</label>
          <input
            type="text"
            name="name"
            required
            className="w-full px-3 py-2 text-sm border outline-none"
            style={{ background: "var(--cream)", borderColor: "var(--border)", color: "var(--ink)" }}
          />
        </div>
        <div>
          <label className="block text-xs font-mono uppercase mb-1">Email</label>
          <input
            type="email"
            name="email"
            required
            className="w-full px-3 py-2 text-sm border outline-none"
            style={{ background: "var(--cream)", borderColor: "var(--border)", color: "var(--ink)" }}
          />
        </div>
        <div>
          <label className="block text-xs font-mono uppercase mb-1">Message</label>
          <textarea
            name="message"
            required
            rows={5}
            className="w-full px-3 py-2 text-sm border outline-none resize-none"
            style={{ background: "var(--cream)", borderColor: "var(--border)", color: "var(--ink)" }}
          />
        </div>
        <button
          type="submit"
          className="px-6 py-2.5 text-sm font-mono text-white"
          style={{ background: "var(--rx-accent)" }}
        >
          Send Message
        </button>
      </form>
    </article>
  );
}
