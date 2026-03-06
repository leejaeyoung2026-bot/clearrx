"use client";
import { useState, useCallback } from "react";
import type { Drug, DrugInteraction, CytoscapeElements } from "@/types/drug";
import { getAllInteractions, buildCytoscapeElements, getDatabase, sortBySeverity } from "@/lib/interaction-engine";

interface SelectedDrug {
  id: string;
  name: string;
}

type CheckerStatus = "idle" | "checking" | "done" | "error";

export function useInteractionChecker() {
  const [selectedDrugs, setSelectedDrugs] = useState<SelectedDrug[]>([]);
  const [interactions, setInteractions] = useState<DrugInteraction[]>([]);
  const [cytoscapeElements, setCytoscapeElements] = useState<CytoscapeElements>({ nodes: [], edges: [] });
  const [status, setStatus] = useState<CheckerStatus>("idle");
  const [selectedInteraction, setSelectedInteraction] = useState<DrugInteraction | null>(null);

  const addDrug = useCallback((drug: SelectedDrug) => {
    setSelectedDrugs((prev) => {
      if (prev.find((d) => d.id === drug.id)) return prev;
      if (prev.length >= 15) return prev;
      return [...prev, drug];
    });
  }, []);

  const removeDrug = useCallback((id: string) => {
    setSelectedDrugs((prev) => prev.filter((d) => d.id !== id));
    setStatus("idle");
    setInteractions([]);
  }, []);

  const checkInteractions = useCallback(async () => {
    if (selectedDrugs.length < 2) return;
    setStatus("checking");
    try {
      const drugIds = selectedDrugs.map((d) => d.id);
      const rawInteractions = await getAllInteractions(drugIds);
      const sorted = sortBySeverity(rawInteractions);
      const elements = await buildCytoscapeElements(drugIds, sorted);
      setInteractions(sorted);
      setCytoscapeElements(elements);
      setStatus("done");

      // Update URL for sharing
      const params = new URLSearchParams();
      params.set("drugs", drugIds.join(","));
      window.history.replaceState({}, "", `?${params.toString()}`);
    } catch {
      setStatus("error");
    }
  }, [selectedDrugs]);

  const reset = useCallback(() => {
    setSelectedDrugs([]);
    setInteractions([]);
    setCytoscapeElements({ nodes: [], edges: [] });
    setStatus("idle");
    setSelectedInteraction(null);
    window.history.replaceState({}, "", window.location.pathname);
  }, []);

  const loadFromUrl = useCallback(async () => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const drugsParam = params.get("drugs");
    if (!drugsParam) return;
    const ids = drugsParam.split(",").filter(Boolean).slice(0, 15);
    const { drugs } = await getDatabase();
    const drugMap = new Map(drugs.map((d: Drug) => [d.id, d]));
    const loaded: SelectedDrug[] = ids
      .map((id) => {
        const drug = drugMap.get(id);
        return drug ? { id: drug.id, name: drug.genericName } : null;
      })
      .filter(Boolean) as SelectedDrug[];
    if (loaded.length >= 2) {
      setSelectedDrugs(loaded);
    }
  }, []);

  return {
    selectedDrugs,
    interactions,
    cytoscapeElements,
    status,
    selectedInteraction,
    setSelectedInteraction,
    addDrug,
    removeDrug,
    checkInteractions,
    reset,
    loadFromUrl,
  };
}
