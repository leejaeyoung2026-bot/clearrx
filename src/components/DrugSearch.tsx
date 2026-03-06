"use client";
import { useState, useRef, useEffect } from "react";
import { useDrugSearch } from "@/hooks/useDrugSearch";

interface SelectedDrug {
  id: string;
  name: string;
}

interface Props {
  selectedDrugs: SelectedDrug[];
  onAdd: (drug: SelectedDrug) => void;
  onRemove: (id: string) => void;
  maxDrugs?: number;
}

export default function DrugSearch({ selectedDrugs, onAdd, onRemove, maxDrugs = 10 }: Props) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const { results, search } = useDrugSearch();
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedIds = new Set(selectedDrugs.map((d) => d.id));

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleInput(value: string) {
    setQuery(value);
    search(value);
    setIsOpen(value.length >= 2);
  }

  function handleSelect(result: { id: string; name: string }) {
    if (selectedIds.has(result.id) || selectedDrugs.length >= maxDrugs) return;
    onAdd({ id: result.id, name: result.name });
    setQuery("");
    setIsOpen(false);
    inputRef.current?.focus();
  }

  return (
    <div ref={containerRef} className="relative w-full max-w-xl">
      {/* Chips */}
      {selectedDrugs.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {selectedDrugs.map((drug) => (
            <span
              key={drug.id}
              className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-mono border"
              style={{
                background: "var(--rx-accent-light)",
                borderColor: "var(--rx-accent-mid)",
                color: "var(--rx-accent)",
              }}
            >
              {drug.name}
              <button
                onClick={() => onRemove(drug.id)}
                className="hover:opacity-70 transition-opacity"
                aria-label={`Remove ${drug.name}`}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => handleInput(e.target.value)}
          placeholder={
            selectedDrugs.length === 0
              ? "Search medications (e.g. warfarin, Advil…)"
              : selectedDrugs.length >= maxDrugs
              ? `Maximum ${maxDrugs} medications reached`
              : "Add another medication…"
          }
          disabled={selectedDrugs.length >= maxDrugs}
          className="w-full px-4 py-3 text-sm border transition-colors outline-none disabled:opacity-50"
          style={{
            background: "var(--cream)",
            borderColor: "var(--border)",
            color: "var(--ink)",
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = "var(--rx-accent)";
            if (query.length >= 2) setIsOpen(true);
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = "var(--border)";
          }}
        />
      </div>

      {/* Dropdown */}
      {isOpen && results.length > 0 && (
        <div
          className="absolute top-full left-0 right-0 z-50 mt-1 border shadow-lg"
          style={{ background: "var(--cream)", borderColor: "var(--rx-accent)" }}
        >
          {results.map((result) => {
            const alreadyAdded = selectedIds.has(result.id);
            return (
              <button
                key={result.id}
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleSelect(result);
                }}
                disabled={alreadyAdded}
                className="w-full flex items-center justify-between px-4 py-2.5 text-left text-sm transition-colors disabled:opacity-50"
                style={{
                  color: "var(--ink)",
                }}
                onMouseEnter={(e) => {
                  if (!alreadyAdded) {
                    (e.currentTarget as HTMLElement).style.background = "var(--rx-accent-light)";
                  }
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.background = "transparent";
                }}
              >
                <span className="font-sans">{result.name}</span>
                {alreadyAdded ? (
                  <span className="text-xs font-mono opacity-50">✓ added</span>
                ) : (
                  result.aliases.length > 0 && (
                    <span className="text-xs font-mono opacity-50">{result.aliases[0]}</span>
                  )
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
