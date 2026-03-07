export type DrugCategory =
  | "anticoagulant"
  | "antiplatelet"
  | "antidepressant"
  | "antidiabetic"
  | "antihypertensive"
  | "antilipid"
  | "antibiotic"
  | "antifungal"
  | "antiseizure"
  | "opioid"
  | "nsaid"
  | "statin"
  | "supplement"
  | "other";

export type SeverityLevel = "contraindicated" | "serious" | "moderate" | "minor" | "none";
export type EvidenceLevel = "established" | "probable" | "suspected";
export type DataSource = "bundle" | "openfda" | "derived";

export interface Drug {
  id: string;
  genericName: string;
  brandNames: string[];
  categories: DrugCategory[];
  interactionRiskScore: number; // 0-10, drives node size
  cypInhibitor?: string[];
  cypSubstrate?: string[];
  cypInducer?: string[];
  inBundle: boolean;
}

export interface DrugInteraction {
  pairKey: string; // "aspirin::warfarin" (sorted, "::" joined)
  drugA_id: string;
  drugB_id: string;
  severity: SeverityLevel;
  mechanism: string; // 1-2 sentence pharmacological explanation
  plainEnglish?: string; // 150-250 word patient text
  clinicalNote?: string;
  evidenceLevel: EvidenceLevel;
  source: DataSource;
  monitoringParameters?: string[];
  lastReviewed: string; // ISO date
}

export interface DrugDatabase {
  version: string;
  lastUpdated: string;
  drugs: Drug[];
  interactions: DrugInteraction[];
}

export interface CytoscapeNode {
  data: {
    id: string;
    label: string;
    riskScore: number;
    categories: DrugCategory[];
  };
}

export interface CytoscapeEdge {
  data: {
    id: string;
    source: string;
    target: string;
    severity: SeverityLevel;
    pairKey: string;
  };
}

export type CytoscapeElements = {
  nodes: CytoscapeNode[];
  edges: CytoscapeEdge[];
};
