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
  | "benzodiazepine"
  | "antipsychotic"
  | "ppi"
  | "h2-blocker"
  | "immunosuppressant"
  | "antiarrhythmic"
  | "pde5-inhibitor"
  | "antihistamine"
  | "thyroid"
  | "analgesic"
  | "bronchodilator"
  | "corticosteroid"
  | "antiviral"
  | "contraceptive"
  | "bisphosphonate"
  | "alpha-blocker"
  | "diuretic"
  | "antiemetic"
  | "triptan"
  | "gout-agent"
  | "parkinson-agent"
  | "alzheimer-agent"
  | "adhd-stimulant"
  | "muscle-relaxant"
  | "glp1-agonist"
  | "sglt2-inhibitor"
  | "dpp4-inhibitor"
  | "mood-stabilizer"
  | "other";

export type SeverityLevel = "contraindicated" | "serious" | "moderate" | "minor" | "none";
export type EvidenceLevel = "established" | "probable" | "suspected";
export type DataSource = "bundle" | "openfda" | "derived";

export type CypRole = "substrate" | "inhibitor" | "inducer";
export type CypStrength = "strong" | "moderate" | "weak";

export interface CypDetail {
  enzyme: string;      // e.g., "CYP3A4"
  role: CypRole;
  strength?: CypStrength;
}

export type ManagementStrategy = "avoid" | "separate-dosing" | "dose-reduce" | "monitor" | "alternative";
export type EffectDirection = "A-increases-B" | "A-decreases-B" | "mutual-increase" | "mutual-decrease";

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
  // Tier 3 metadata
  halfLife?: string;                                              // free-text e.g., "6-8h" or "30-40h"
  metabolism?: CypDetail[];                                       // structured CYP data
  proteinBinding?: number;                                        // 0-1 fraction
  deaSchedule?: "II" | "III" | "IV" | "V";                       // controlled substance
  pregnancyRisk?: "A" | "B" | "C" | "D" | "X";                   // FDA legacy categories
  renalAdjust?: boolean;                                          // dose adjust for CrCl
  hepaticAdjust?: boolean;                                        // dose adjust for hepatic impairment
  qtProlongation?: "known" | "possible" | "conditional";          // CredibleMeds classification
  serotonergic?: boolean;                                         // flag for serotonergic activity
  otcRx?: "otc" | "rx" | "both";                                  // prescription status
  mechanismClass?: string;                                        // e.g., "SSRI", "CCB-dihydropyridine"
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
  effectDirection?: EffectDirection;
  managementStrategy?: ManagementStrategy;
  onsetHours?: number;             // typical onset time in hours
  clinicalExample?: string;        // e.g., "Torsades de pointes"
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
