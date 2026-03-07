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

function getSeverityIcon(severity: SeverityLevel): string {
  const icons: Record<SeverityLevel, string> = {
    contraindicated: "⛔",
    serious: "⚠️",
    moderate: "⚡",
    minor: "ℹ️",
    none: "✓",
  };
  return icons[severity];
}

const sectionHeaderStyle: React.CSSProperties = {
  fontSize: "9px",
  fontFamily: "monospace",
  fontWeight: 700,
  letterSpacing: "0.12em",
  textTransform: "uppercase",
  color: "var(--ink-muted)",
  marginBottom: "6px",
  opacity: 0.7,
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
      style={{
        backdropFilter: "blur(4px)",
        background: "rgba(10, 15, 20, 0.6)",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto"
        style={{
          background: "var(--cream)",
          borderRadius: "4px",
          boxShadow: "0 20px 60px rgba(0,0,0,0.25), 0 0 0 1px var(--border)",
        }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: "16px",
            right: "16px",
            width: "28px",
            height: "28px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(0,0,0,0.08)",
            border: "none",
            cursor: "pointer",
            fontSize: "14px",
            color: "var(--ink-muted)",
            borderRadius: "50%",
          }}
          aria-label="Close"
        >
          ✕
        </button>

        {/* Severity header bar */}
        <div
          style={{
            padding: "20px 24px 16px",
            borderBottom: "1px solid var(--border)",
            background: color + "10",
            borderRadius: "4px 4px 0 0",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                fontSize: "10px",
                fontFamily: "monospace",
                fontWeight: 700,
                letterSpacing: "0.1em",
                color: color,
                background: color + "18",
                padding: "4px 10px",
                border: `1px solid ${color}50`,
              }}
            >
              {getSeverityIcon(interaction.severity)} {label}
            </span>
            <span style={{ fontSize: "10px", fontFamily: "monospace", color: "var(--ink-muted)" }}>
              Evidence: {interaction.evidenceLevel}
            </span>
          </div>
          <h2 style={{ fontFamily: "serif", fontSize: "1.25rem", textTransform: "capitalize", margin: 0 }}>
            {interaction.drugA_id}
            <span style={{ color: "var(--ink-muted)", margin: "0 8px", fontStyle: "normal" }}>+</span>
            {interaction.drugB_id}
          </h2>
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
        <div style={{ padding: "12px 24px 0" }}>
          <h3 style={{ ...sectionHeaderStyle }}>Mechanism</h3>
          <p className="text-sm font-sans leading-relaxed">{interaction.mechanism}</p>
        </div>

        {/* Clinical Note */}
        {interaction.clinicalNote && (
          <div style={{ padding: "12px 24px 0" }}>
            <h3 style={{ ...sectionHeaderStyle }}>Clinical Note</h3>
            <p className="text-sm font-sans leading-relaxed">{interaction.clinicalNote}</p>
          </div>
        )}

        {/* Monitoring parameters as pills */}
        {interaction.monitoringParameters && interaction.monitoringParameters.length > 0 && (
          <div style={{ padding: "12px 24px 0" }}>
            <h3 style={{ ...sectionHeaderStyle }}>Monitoring</h3>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "6px" }}>
              {interaction.monitoringParameters.map((p) => (
                <span
                  key={p}
                  style={{
                    padding: "3px 10px",
                    background: "var(--rx-accent-light)",
                    border: "1px solid var(--rx-accent-mid)",
                    color: "var(--rx-accent)",
                    fontSize: "11px",
                    fontFamily: "monospace",
                  }}
                >
                  {p}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Footer buttons */}
        <div
          style={{
            padding: "16px 24px",
            display: "flex",
            gap: "10px",
            borderTop: "1px solid var(--border)",
            background: "var(--cream)",
            marginTop: "16px",
          }}
        >
          {onAddToReport && (
            <button
              onClick={() => onAddToReport(interaction)}
              style={{
                flex: 1,
                padding: "10px",
                fontSize: "12px",
                fontFamily: "monospace",
                fontWeight: 600,
                color: "white",
                background: "var(--rx-accent)",
                border: "none",
                cursor: "pointer",
                letterSpacing: "0.03em",
              }}
            >
              Add to Doctor Report
            </button>
          )}
          <button
            onClick={onClose}
            style={{
              flex: 1,
              padding: "10px",
              fontSize: "12px",
              fontFamily: "monospace",
              fontWeight: 600,
              color: "var(--rx-accent)",
              background: "transparent",
              border: "1.5px solid var(--rx-accent)",
              cursor: "pointer",
              letterSpacing: "0.03em",
            }}
          >
            I understand this risk
          </button>
        </div>
      </div>
    </div>
  );
}
