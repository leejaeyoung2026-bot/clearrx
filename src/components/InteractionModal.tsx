"use client";
import { useEffect } from "react";
import type { DrugInteraction, SeverityLevel } from "@/types/drug";

interface Props {
  interaction: DrugInteraction | null;
  plainEnglish?: string;
  onClose: () => void;
  onAddToReport?: (ix: DrugInteraction) => void;
}

const SEVERITY_COLORS: Record<SeverityLevel, string> = {
  contraindicated: "#B83232",
  serious: "#B83232",
  moderate: "#B86B1A",
  minor: "#7A8C2E",
  none: "#9A9490",
};

const SEVERITY_LABELS: Record<SeverityLevel, string> = {
  contraindicated: "CONTRAINDICATED",
  serious: "SERIOUS",
  moderate: "MODERATE",
  minor: "MINOR",
  none: "NO INTERACTION",
};

export default function InteractionModal({ interaction, plainEnglish, onClose, onAddToReport }: Props) {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!interaction) return null;

  const color = SEVERITY_COLORS[interaction.severity];
  const label = SEVERITY_LABELS[interaction.severity];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backdropFilter: "blur(4px)", background: "rgba(0,0,0,0.4)" }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto"
        style={{ background: "var(--cream)", borderTop: `4px solid ${color}` }}
      >
        {/* Header */}
        <div className="px-6 pt-5 pb-4 border-b" style={{ borderColor: "var(--border)" }}>
          <span
            className="text-xs font-mono px-2 py-1 uppercase tracking-widest"
            style={{ color, background: color + "18", border: `1px solid ${color}40` }}
          >
            {label}
          </span>
          <h2 className="font-serif text-xl mt-3 capitalize">
            {interaction.drugA_id} + {interaction.drugB_id}
          </h2>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-lg opacity-40 hover:opacity-80 transition-opacity"
            aria-label="Close"
          >
            &#10005;
          </button>
        </div>

        {/* Plain English summary */}
        {plainEnglish && (
          <div
            className="mx-6 my-4 pl-4 text-sm font-sans leading-relaxed italic"
            style={{ borderLeft: `3px solid ${color}`, color: "var(--ink-muted)" }}
          >
            {plainEnglish}
          </div>
        )}

        {/* Mechanism */}
        <div className="px-6 pb-3">
          <h3 className="text-xs font-mono uppercase tracking-wide opacity-50 mb-1">Mechanism</h3>
          <p className="text-sm font-sans leading-relaxed">{interaction.mechanism}</p>
        </div>

        {/* Clinical Note */}
        {interaction.clinicalNote && (
          <div className="px-6 pb-3">
            <h3 className="text-xs font-mono uppercase tracking-wide opacity-50 mb-1">Clinical Note</h3>
            <p className="text-sm font-sans leading-relaxed">{interaction.clinicalNote}</p>
          </div>
        )}

        {/* Monitoring */}
        {interaction.monitoringParameters && interaction.monitoringParameters.length > 0 && (
          <div className="px-6 pb-3">
            <h3 className="text-xs font-mono uppercase tracking-wide opacity-50 mb-1">Monitoring</h3>
            <ul className="text-sm font-mono list-disc list-inside space-y-0.5">
              {interaction.monitoringParameters.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Footer */}
        <div className="px-6 pb-5 pt-3 flex gap-3 border-t" style={{ borderColor: "var(--border)" }}>
          {onAddToReport && (
            <button
              onClick={() => onAddToReport(interaction)}
              className="flex-1 py-2.5 text-sm font-mono text-white transition-colors"
              style={{ background: "var(--rx-accent)" }}
            >
              Add to Doctor Report
            </button>
          )}
          <button
            onClick={onClose}
            className="flex-1 py-2.5 text-sm font-mono border transition-colors"
            style={{ borderColor: "var(--rx-accent)", color: "var(--rx-accent)" }}
          >
            I understand this risk
          </button>
        </div>
      </div>
    </div>
  );
}
