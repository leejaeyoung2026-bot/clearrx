"use client";
import { useState } from "react";
import type { DrugInteraction, SeverityLevel } from "@/types/drug";

interface Props {
  interactions: DrugInteraction[];
  onSelectInteraction?: (ix: DrugInteraction) => void;
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

function SeverityBadge({ severity }: { severity: SeverityLevel }) {
  return (
    <span
      className="text-xs font-mono px-2 py-0.5 uppercase tracking-wide"
      style={{
        color: SEVERITY_COLORS[severity],
        background: SEVERITY_COLORS[severity] + "18",
        border: `1px solid ${SEVERITY_COLORS[severity]}40`,
      }}
    >
      {SEVERITY_LABELS[severity]}
    </span>
  );
}

function InteractionRow({
  ix,
  onClick,
}: {
  ix: DrugInteraction;
  onClick: () => void;
}) {
  const [open, setOpen] = useState(false);
  const color = SEVERITY_COLORS[ix.severity];

  if (ix.severity === "none") return null;

  return (
    <div className="border-b last:border-b-0" style={{ borderColor: "var(--border)" }}>
      <button
        onClick={() => {
          setOpen(!open);
          onClick();
        }}
        className="w-full flex items-center justify-between px-4 py-3 text-left transition-colors"
        style={{ borderLeft: `4px solid ${color}` }}
      >
        <div className="flex flex-col gap-1">
          <span className="text-sm font-sans capitalize">
            {ix.drugA_id} + {ix.drugB_id}
          </span>
          <SeverityBadge severity={ix.severity} />
        </div>
        <span className="text-sm opacity-50 ml-2">{open ? "▲" : "▼"}</span>
      </button>
      {open && (
        <div
          className="px-5 py-3 text-sm space-y-2"
          style={{ borderLeft: `4px solid ${color}`, background: color + "08" }}
        >
          <p className="font-sans text-sm leading-relaxed" style={{ color: "var(--ink-muted)" }}>
            {ix.mechanism}
          </p>
          {ix.monitoringParameters && ix.monitoringParameters.length > 0 && (
            <p className="text-xs font-mono" style={{ color: "var(--ink-muted)" }}>
              Monitor: {ix.monitoringParameters.join(", ")}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default function ResultsPanel({ interactions, onSelectInteraction }: Props) {
  const significant = interactions.filter((ix) => ix.severity !== "none");
  const allSafe = significant.length === 0;

  if (allSafe) {
    return (
      <div
        className="p-6 border flex items-center gap-3"
        style={{ borderColor: "#7A8C2E40", background: "#7A8C2E08" }}
      >
        <span className="text-2xl">&#10003;</span>
        <div>
          <p className="font-serif text-base" style={{ color: "#7A8C2E" }}>
            No interactions found
          </p>
          <p className="text-sm font-sans mt-1" style={{ color: "var(--ink-muted)" }}>
            No clinically significant interactions were identified between these medications.
            The absence of an interaction here does not guarantee safety — always consult your
            pharmacist.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="border" style={{ borderColor: "var(--border)" }}>
      <div className="px-4 py-3 border-b" style={{ borderColor: "var(--border)" }}>
        <h2 className="font-serif text-lg">{significant.length} interaction{significant.length !== 1 ? "s" : ""} found</h2>
      </div>
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
