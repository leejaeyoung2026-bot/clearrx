import type { MDXComponents } from "mdx/types";

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    h1: (props) => (
      <h1 className="font-serif text-3xl sm:text-4xl leading-tight mb-4" {...props} />
    ),
    h2: (props) => (
      <h2 className="font-serif text-2xl mt-10 mb-3" {...props} />
    ),
    h3: (props) => (
      <h3 className="font-serif text-lg font-semibold mt-6 mb-2" {...props} />
    ),
    p: (props) => (
      <p className="font-sans text-base leading-relaxed mb-4" style={{ color: "var(--ink-muted)" }} {...props} />
    ),
    ul: (props) => (
      <ul className="font-sans text-base leading-relaxed mb-4 pl-6 list-disc space-y-1" style={{ color: "var(--ink-muted)" }} {...props} />
    ),
    ol: (props) => (
      <ol className="font-sans text-base leading-relaxed mb-4 pl-6 list-decimal space-y-1" style={{ color: "var(--ink-muted)" }} {...props} />
    ),
    a: (props) => (
      <a style={{ color: "var(--rx-accent)" }} {...props} />
    ),
    strong: (props) => (
      <strong style={{ color: "var(--ink)" }} {...props} />
    ),
    em: (props) => (
      <em className="font-sans" {...props} />
    ),
    table: (props) => (
      <div className="overflow-x-auto mb-4">
        <table className="w-full text-sm font-sans border-collapse" {...props} />
      </div>
    ),
    th: (props) => (
      <th className="text-left p-2 border-b font-medium" style={{ borderColor: "var(--border)", color: "var(--ink)" }} {...props} />
    ),
    td: (props) => (
      <td className="p-2 border-b" style={{ borderColor: "var(--border)", color: "var(--ink-muted)" }} {...props} />
    ),
    blockquote: (props) => (
      <blockquote className="pl-4 border-l-2 italic mb-4" style={{ borderColor: "var(--rx-accent)", color: "var(--ink-muted)" }} {...props} />
    ),
    hr: () => (
      <hr className="my-8" style={{ borderColor: "var(--border)" }} />
    ),
    ...components,
  };
}
