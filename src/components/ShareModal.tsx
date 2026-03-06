"use client";
import { useState } from "react";
import type { DrugInteraction } from "@/types/drug";

interface Props {
  selectedDrugs: { id: string; name: string }[];
  interactions: DrugInteraction[];
  onClose: () => void;
}

export default function ShareModal({ selectedDrugs, interactions, onClose }: Props) {
  const [copying, setCopying] = useState(false);

  function copyLink() {
    navigator.clipboard.writeText(window.location.href);
    setCopying(true);
    setTimeout(() => setCopying(false), 2000);
  }

  async function downloadPNG() {
    const { default: html2canvas } = await import("html2canvas");
    const el = document.getElementById("share-card");
    if (!el) return;
    const canvas = await html2canvas(el, { scale: 2, useCORS: true });
    const link = document.createElement("a");
    link.download = "clearrx-interactions.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  }

  const significant = interactions.filter((ix) => ix.severity !== "none");

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backdropFilter: "blur(4px)", background: "rgba(0,0,0,0.4)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-md" style={{ background: "var(--cream)" }}>
        <div className="px-6 pt-5 pb-4 border-b flex justify-between" style={{ borderColor: "var(--border)" }}>
          <h2 className="font-serif text-xl">Share Results</h2>
          <button onClick={onClose} className="opacity-40 hover:opacity-80">✕</button>
        </div>

        {/* Share Card (for html2canvas) */}
        <div
          id="share-card"
          className="m-6 p-5"
          style={{
            background: "#F2EFE7",
            borderTop: "6px solid var(--rx-accent)",
          }}
        >
          <p className="font-mono text-xs mb-3" style={{ color: "var(--rx-accent)" }}>ClearRx</p>
          <div className="flex flex-wrap gap-2 mb-4">
            {selectedDrugs.map((d) => (
              <span
                key={d.id}
                className="text-xs font-mono px-2 py-0.5 border"
                style={{ borderColor: "var(--rx-accent-mid)", background: "var(--rx-accent-light)" }}
              >
                {d.name}
              </span>
            ))}
          </div>
          <p className="text-sm font-sans">
            {significant.length === 0
              ? "✓ No interactions found"
              : `${significant.length} interaction${significant.length !== 1 ? "s" : ""} found`}
          </p>
          <p className="text-xs font-mono mt-4 opacity-50">clearrx.vibed-lab.com</p>
        </div>

        {/* Actions */}
        <div className="px-6 pb-6 space-y-3">
          <button
            onClick={copyLink}
            className="w-full py-2.5 text-sm font-mono border transition-colors"
            style={{ borderColor: "var(--rx-accent)", color: "var(--rx-accent)" }}
          >
            {copying ? "Copied!" : "Copy Link"}
          </button>
          <button
            onClick={downloadPNG}
            className="w-full py-2.5 text-sm font-mono text-white"
            style={{ background: "var(--rx-accent)" }}
          >
            Download PNG
          </button>
        </div>
      </div>
    </div>
  );
}
