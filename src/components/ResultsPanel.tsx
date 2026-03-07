"use client";
import { useState } from "react";
import type { DrugInteraction, SeverityLevel } from "@/types/drug";

interface Props {
  interactions: DrugInteraction[];
  onSelectInteraction?: (ix: DrugInteraction) => void;
}

const SEVERITY_CONFIG: Record<
  SeverityLevel,
  { color: string; bg: string; border: string; icon: string; label: string }
> = {
  contraindicated: {
    color: "#E53E3E",
    bg: "#FFF5F5",
    border: "#FC8181",
    icon: "⛔",
    label: "CONTRAINDICATED",
  },
  serious: {
    color: "#DD6B20",
    bg: "#FFFAF0",
    border: "#F6AD55",
    icon: "⚠️",
    label: "SERIOUS",
  },
  moderate: {
    color: "#D69E2E",
    bg: "#FFFFF0",
    border: "#F6E05E",
    icon: "⚡",
    label: "MODERATE",
  },
  minor: {
    color: "#38A169",
    bg: "#F0FFF4",
    border: "#9AE6B4",
    icon: "ℹ️",
    label: "MINOR",
  },
  none: {
    color: "#718096",
    bg: "#F7FAFC",
    border: "#E2E8F0",
    icon: "✓",
    label: "NONE",
  },
};

function InteractionRow({
  ix,
  onClick,
}: {
  ix: DrugInteraction;
  onClick: () => void;
}) {
  const [open, setOpen] = useState(false);
  const cfg = SEVERITY_CONFIG[ix.severity];

  if (ix.severity === "none") return null;

  return (
    <div
      style={{
        borderBottom: "1px solid var(--border)",
        background: open ? cfg.bg : "transparent",
        transition: "background 0.2s ease",
      }}
    >
      {/* Main row button */}
      <button
        onClick={() => {
          setOpen(!open);
          onClick();
        }}
        style={{
          width: "100%",
          padding: "14px 20px",
          textAlign: "left",
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: "12px",
          background: "transparent",
          cursor: "pointer",
          border: "none",
          borderLeft: `4px solid ${cfg.color}`,
        } as React.CSSProperties}
      >
        <div style={{ flex: 1 }}>
          {/* Severity badge */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              marginBottom: "6px",
            }}
          >
            <span style={{ fontSize: "13px" }}>{cfg.icon}</span>
            <span
              style={{
                fontSize: "10px",
                fontFamily: "monospace",
                fontWeight: 600,
                letterSpacing: "0.08em",
                color: cfg.color,
                background: cfg.bg,
                padding: "2px 6px",
                border: `1px solid ${cfg.border}`,
              }}
            >
              {cfg.label}
            </span>
          </div>
          {/* Drug names as pills */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              flexWrap: "wrap",
            }}
          >
            <span
              style={{
                padding: "3px 10px",
                background: "var(--rx-accent-light)",
                border: "1px solid var(--rx-accent-mid)",
                color: "var(--rx-accent)",
                fontSize: "12px",
                fontFamily: "monospace",
                textTransform: "capitalize",
              }}
            >
              {ix.drugA_id}
            </span>
            <span
              style={{
                fontSize: "14px",
                color: "var(--ink-muted)",
                fontWeight: "bold",
              }}
            >
              +
            </span>
            <span
              style={{
                padding: "3px 10px",
                background: "var(--rx-accent-light)",
                border: "1px solid var(--rx-accent-mid)",
                color: "var(--rx-accent)",
                fontSize: "12px",
                fontFamily: "monospace",
                textTransform: "capitalize",
              }}
            >
              {ix.drugB_id}
            </span>
          </div>
        </div>
        {/* Chevron */}
        <span
          style={{
            fontSize: "12px",
            color: "var(--ink-muted)",
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.2s ease",
            marginTop: "2px",
            flexShrink: 0,
          }}
        >
          ▼
        </span>
      </button>

      {/* Expanded content */}
      {open && (
        <div
          style={{
            padding: "12px 20px 16px 24px",
            borderLeft: `4px solid ${cfg.color}`,
            background: cfg.bg,
          }}
        >
          <p
            style={{
              fontSize: "13px",
              fontFamily: "sans-serif",
              lineHeight: 1.7,
              color: "var(--ink-muted)",
              marginBottom:
                ix.monitoringParameters && ix.monitoringParameters.length > 0
                  ? "10px"
                  : 0,
            }}
          >
            {ix.mechanism}
          </p>
          {ix.monitoringParameters && ix.monitoringParameters.length > 0 && (
            <div
              style={{
                display: "flex",
                gap: "6px",
                flexWrap: "wrap",
                alignItems: "center",
                marginTop: "8px",
              }}
            >
              <span
                style={{
                  fontSize: "10px",
                  fontFamily: "monospace",
                  color: "var(--ink-muted)",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  marginRight: "4px",
                }}
              >
                Monitor:
              </span>
              {ix.monitoringParameters.map((p) => (
                <span
                  key={p}
                  style={{
                    padding: "2px 8px",
                    background: "rgba(0,0,0,0.06)",
                    fontSize: "11px",
                    fontFamily: "monospace",
                    color: "var(--ink)",
                    border: "1px solid rgba(0,0,0,0.1)",
                  }}
                >
                  {p}
                </span>
              ))}
            </div>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClick();
            }}
            style={{
              marginTop: "12px",
              fontSize: "11px",
              fontFamily: "monospace",
              color: cfg.color,
              background: "transparent",
              border: "none",
              cursor: "pointer",
              padding: 0,
              textDecoration: "underline",
            }}
          >
            View Full Details →
          </button>
        </div>
      )}
    </div>
  );
}

export default function ResultsPanel({ interactions, onSelectInteraction }: Props) {
  const significant = interactions.filter((ix) => ix.severity !== "none");
  const allSafe = significant.length === 0;

  const countBySeverity = {
    contraindicated: interactions.filter((i) => i.severity === "contraindicated").length,
    serious: interactions.filter((i) => i.severity === "serious").length,
    moderate: interactions.filter((i) => i.severity === "moderate").length,
    minor: interactions.filter((i) => i.severity === "minor").length,
  };

  if (allSafe) {
    return (
      <div
        style={{
          padding: "24px",
          border: "1px solid #9AE6B4",
          background: "#F0FFF4",
          display: "flex",
          alignItems: "flex-start",
          gap: "16px",
        }}
      >
        <div
          style={{
            width: "36px",
            height: "36px",
            background: "#38A169",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "18px",
            flexShrink: 0,
            borderRadius: "50%",
            color: "white",
          }}
        >
          ✓
        </div>
        <div>
          <p
            style={{
              fontFamily: "serif",
              fontSize: "1rem",
              color: "#276749",
              marginBottom: "6px",
            }}
          >
            No interactions found
          </p>
          <p
            style={{
              fontSize: "13px",
              fontFamily: "sans-serif",
              lineHeight: 1.6,
              color: "#2F855A",
            }}
          >
            No clinically significant interactions were identified between these
            medications. The absence of an interaction here does not guarantee
            safety — always consult your pharmacist.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        border: "1px solid var(--border)",
        background: "var(--cream)",
        boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
      }}
    >
      {/* Summary header */}
      <div
        style={{
          padding: "16px 20px",
          borderBottom: "1px solid var(--border)",
          background: "var(--cream)",
        }}
      >
        <h2
          className="font-serif"
          style={{ fontSize: "1.1rem", marginBottom: "10px" }}
        >
          {significant.length} interaction{significant.length !== 1 ? "s" : ""} found
        </h2>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
          {countBySeverity.contraindicated > 0 && (
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
                padding: "2px 8px",
                fontSize: "11px",
                fontFamily: "monospace",
                background: "#FFF5F5",
                border: "1px solid #FC8181",
                color: "#E53E3E",
              }}
            >
              ⛔ {countBySeverity.contraindicated} contraindicated
            </span>
          )}
          {countBySeverity.serious > 0 && (
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
                padding: "2px 8px",
                fontSize: "11px",
                fontFamily: "monospace",
                background: "#FFFAF0",
                border: "1px solid #F6AD55",
                color: "#DD6B20",
              }}
            >
              ⚠️ {countBySeverity.serious} serious
            </span>
          )}
          {countBySeverity.moderate > 0 && (
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
                padding: "2px 8px",
                fontSize: "11px",
                fontFamily: "monospace",
                background: "#FFFFF0",
                border: "1px solid #F6E05E",
                color: "#D69E2E",
              }}
            >
              ⚡ {countBySeverity.moderate} moderate
            </span>
          )}
          {countBySeverity.minor > 0 && (
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
                padding: "2px 8px",
                fontSize: "11px",
                fontFamily: "monospace",
                background: "#F0FFF4",
                border: "1px solid #9AE6B4",
                color: "#38A169",
              }}
            >
              ℹ️ {countBySeverity.minor} minor
            </span>
          )}
        </div>
      </div>

      {/* Interaction rows */}
      {interactions.map((ix) => (
        <InteractionRow
          key={ix.pairKey}
          ix={ix}
          onClick={() => onSelectInteraction?.(ix)}
        />
      ))}
    </div>
  );
}
