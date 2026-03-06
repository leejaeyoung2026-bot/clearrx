import type { Drug, DrugInteraction, DrugDatabase, CytoscapeElements, SeverityLevel } from "@/types/drug";
import { makePairKey } from "./search-engine";

let db: DrugDatabase | null = null;

export async function getDatabase(): Promise<DrugDatabase> {
  if (db) return db;
  const res = await fetch("/data/drug-db.json");
  db = await res.json();
  return db!;
}

export async function getDrugById(id: string): Promise<Drug | undefined> {
  const { drugs } = await getDatabase();
  return drugs.find((d) => d.id === id);
}

export async function getAllInteractions(drugIds: string[]): Promise<DrugInteraction[]> {
  if (drugIds.length < 2) return [];
  const { interactions } = await getDatabase();
  const results: DrugInteraction[] = [];

  for (let i = 0; i < drugIds.length; i++) {
    for (let j = i + 1; j < drugIds.length; j++) {
      const key = makePairKey(drugIds[i], drugIds[j]);
      const found = interactions.find((ix) => ix.pairKey === key);
      if (found) {
        results.push(found);
      } else {
        results.push({
          pairKey: key,
          drugA_id: drugIds[i],
          drugB_id: drugIds[j],
          severity: "none",
          mechanism: "No clinically significant interaction identified in current database.",
          evidenceLevel: "suspected",
          source: "derived",
          lastReviewed: new Date().toISOString().split("T")[0],
        });
      }
    }
  }

  return results;
}

export async function buildCytoscapeElements(
  drugIds: string[],
  interactions: DrugInteraction[]
): Promise<CytoscapeElements> {
  const { drugs } = await getDatabase();
  const drugMap = new Map(drugs.map((d) => [d.id, d]));

  const nodes = drugIds.map((id) => {
    const drug = drugMap.get(id);
    return {
      data: {
        id,
        label: drug?.genericName ?? id,
        riskScore: drug?.interactionRiskScore ?? 5,
        categories: drug?.categories ?? [],
      },
    };
  });

  const edges = interactions
    .filter((ix) => ix.severity !== "none")
    .map((ix) => ({
      data: {
        id: ix.pairKey,
        source: ix.drugA_id,
        target: ix.drugB_id,
        severity: ix.severity,
        pairKey: ix.pairKey,
      },
    }));

  return { nodes, edges };
}

export function sortBySeverity(interactions: DrugInteraction[]): DrugInteraction[] {
  const order: Record<SeverityLevel, number> = {
    contraindicated: 0,
    serious: 1,
    moderate: 2,
    minor: 3,
    none: 4,
  };
  return [...interactions].sort((a, b) => order[a.severity] - order[b.severity]);
}

export function getWorstSeverity(interactions: DrugInteraction[]): SeverityLevel {
  const sorted = sortBySeverity(interactions.filter((ix) => ix.severity !== "none"));
  return sorted[0]?.severity ?? "none";
}
