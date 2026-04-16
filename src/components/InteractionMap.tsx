"use client";
import { useEffect, useRef, useState } from "react";
import type cytoscape from "cytoscape";
import type { CytoscapeElements, SeverityLevel } from "@/types/drug";

interface Props {
  elements: CytoscapeElements;
  onEdgeClick?: (pairKey: string) => void;
  height?: number;
}

function getCategoryColor(category?: string): string {
  const map: Record<string, string> = {
    // existing 14
    anticoagulant: "#C0392B",
    antiplatelet: "#E74C3C",
    antidepressant: "#8E44AD",
    antidiabetic: "#27AE60",
    antihypertensive: "#2980B9",
    antilipid: "#1A5276",
    statin: "#1A5276",
    antibiotic: "#16A085",
    antifungal: "#0E6655",
    antiseizure: "#6C3483",
    opioid: "#BA4A00",
    nsaid: "#D68910",
    supplement: "#52BE80",
    other: "#5D6D7E",

    // new 28
    benzodiazepine: "#5B2C6F",
    antipsychotic: "#7D3C98",
    ppi: "#239B56",
    "h2-blocker": "#1E8449",
    immunosuppressant: "#922B21",
    antiarrhythmic: "#21618C",
    "pde5-inhibitor": "#D35400",
    antihistamine: "#AF601A",
    thyroid: "#B9770E",
    analgesic: "#E67E22",
    bronchodilator: "#148F77",
    corticosteroid: "#9A7D0A",
    antiviral: "#117A65",
    contraceptive: "#C39BD3",
    bisphosphonate: "#85929E",
    "alpha-blocker": "#2874A6",
    diuretic: "#3498DB",
    antiemetic: "#229954",
    triptan: "#CB4335",
    "gout-agent": "#873600",
    "parkinson-agent": "#6D4C41",
    "alzheimer-agent": "#78909C",
    "adhd-stimulant": "#E74C3C",
    "muscle-relaxant": "#5499C7",
    "glp1-agonist": "#1ABC9C",
    "sglt2-inhibitor": "#17A589",
    "dpp4-inhibitor": "#45B39D",
    "mood-stabilizer": "#7B241C",
  };
  return map[category ?? ""] ?? "#5D6D7E";
}

const SEVERITY_STYLES: Record<
  SeverityLevel,
  {
    lineColor: string;
    width: number;
    lineStyle: string;
    lineDashPattern?: number[];
  }
> = {
  contraindicated: {
    lineColor: "#FF3B3B",
    width: 4,
    lineStyle: "solid",
  },
  serious: {
    lineColor: "#FF7043",
    width: 3,
    lineStyle: "solid",
  },
  moderate: {
    lineColor: "#FFB300",
    width: 2.5,
    lineStyle: "solid",
  },
  minor: {
    lineColor: "#8BC34A",
    width: 1.5,
    lineStyle: "dashed",
    lineDashPattern: [6, 4],
  },
  none: {
    lineColor: "#9E9E9E",
    width: 1,
    lineStyle: "dashed",
  },
};

const LEGEND_ITEMS = [
  { label: "Contraindicated", color: "#FF3B3B" },
  { label: "Serious", color: "#FF7043" },
  { label: "Moderate", color: "#FFB300" },
  { label: "Minor", color: "#8BC34A" },
];

export default function InteractionMap({ elements, onEdgeClick, height = 400 }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cyRef = useRef<cytoscape.Core | null>(null);
  const onEdgeClickRef = useRef(onEdgeClick);
  onEdgeClickRef.current = onEdgeClick;

  const [tooltip, setTooltip] = useState<{ x: number; y: number; label: string } | null>(null);

  useEffect(() => {
    let cy: cytoscape.Core | null = null;
    let mounted = true;

    async function init() {
      if (!containerRef.current || elements.nodes.length === 0) return;
      const cytoscape = (await import("cytoscape")).default;
      if (!mounted) return;

      cy = cytoscape({
        container: containerRef.current,
        elements: {
          nodes: elements.nodes.map((n) => ({ data: n.data })),
          edges: elements.edges.map((e) => ({ data: e.data })),
        },
        style: [
          {
            selector: "node",
            style: {
              "background-color": (ele: any) =>
                getCategoryColor(ele.data("categories")?.[0]),
              "border-color": "rgba(255,255,255,0.35)",
              "border-width": 2,
              width: "mapData(riskScore, 0, 10, 32, 68)",
              height: "mapData(riskScore, 0, 10, 32, 68)",
              label: "data(label)",
              "font-family": "monospace",
              "font-size": "7px",
              "font-weight": "bold",
              color: "#FFFFFF",
              "text-valign": "center",
              "text-halign": "center",
              "text-wrap": "wrap",
              "text-max-width": "60px",
            } as any,
          },
          {
            selector: "edge",
            style: {
              "curve-style": "bezier",
              "overlay-padding": "16px",
              "overlay-opacity": 0,
            } as any,
          },
          {
            selector: "edge[severity = 'contraindicated']",
            style: {
              "line-color": SEVERITY_STYLES.contraindicated.lineColor,
              width: SEVERITY_STYLES.contraindicated.width,
              "line-style": SEVERITY_STYLES.contraindicated.lineStyle,
            } as any,
          },
          {
            selector: "edge[severity = 'serious']",
            style: {
              "line-color": SEVERITY_STYLES.serious.lineColor,
              width: SEVERITY_STYLES.serious.width,
              "line-style": SEVERITY_STYLES.serious.lineStyle,
            } as any,
          },
          {
            selector: "edge[severity = 'moderate']",
            style: {
              "line-color": SEVERITY_STYLES.moderate.lineColor,
              width: SEVERITY_STYLES.moderate.width,
              "line-style": SEVERITY_STYLES.moderate.lineStyle,
            } as any,
          },
          {
            selector: "edge[severity = 'minor']",
            style: {
              "line-color": SEVERITY_STYLES.minor.lineColor,
              width: SEVERITY_STYLES.minor.width,
              "line-style": SEVERITY_STYLES.minor.lineStyle,
              "line-dash-pattern": SEVERITY_STYLES.minor.lineDashPattern,
            } as any,
          },
          {
            selector: "edge[severity = 'none']",
            style: {
              "line-color": SEVERITY_STYLES.none.lineColor,
              width: SEVERITY_STYLES.none.width,
              "line-style": SEVERITY_STYLES.none.lineStyle,
            } as any,
          },
          {
            selector: ".cx-dimmed",
            style: { opacity: 0.15 } as any,
          },
          {
            selector: ".cx-highlighted",
            style: {
              opacity: 1,
              width: "mapData(width, 0, 10, 1.5, 5)",
            } as any,
          },
          {
            selector: ".cx-selected",
            style: {
              "line-color": "#FFFFFF",
              width: 5,
              opacity: 1,
            } as any,
          },
          {
            selector: "node:selected",
            style: {
              "border-width": 3,
              "border-color": "#FFFFFF",
              "shadow-blur": 12,
              "shadow-color": "#FFFFFF",
              "shadow-opacity": 0.8,
              "shadow-offset-x": 0,
              "shadow-offset-y": 0,
            } as any,
          },
        ],
        layout: {
          name: "cose",
          animate: true,
          animationDuration: 800,
          animationEasing: "ease-out-cubic" as any,
          randomize: true,
          padding: 40,
          nodeOverlap: 20,
          idealEdgeLength: 100,
          edgeElasticity: 0.45,
          nestingFactor: 5,
          gravity: 0.25,
          numIter: 1000,
          initialTemp: 200,
          coolingFactor: 0.95,
          minTemp: 1.0,
        } as any,
        userZoomingEnabled: true,
        userPanningEnabled: true,
        minZoom: 0.5,
        maxZoom: 3,
      });

      cy.on("mouseover", "node", (evt: cytoscape.EventObject) => {
        const node = evt.target;
        cy!.elements().addClass("cx-dimmed");
        node.removeClass("cx-dimmed");
        node.connectedEdges().removeClass("cx-dimmed").addClass("cx-highlighted");
        node.connectedEdges().connectedNodes().removeClass("cx-dimmed");

        const pos = evt.renderedPosition;
        const containerRect = containerRef.current?.getBoundingClientRect();
        if (containerRect) {
          setTooltip({
            x: pos.x,
            y: pos.y - 40,
            label: evt.target.data("label"),
          });
        }
      });

      cy.on("mouseout", "node", () => {
        cy!.elements().removeClass("cx-dimmed cx-highlighted");
        setTooltip(null);
      });

      cy.on("tap", "edge", (evt: cytoscape.EventObject) => {
        cy!.edges().removeClass("cx-selected");
        evt.target.addClass("cx-selected");
        const pairKey = evt.target.data("pairKey");
        onEdgeClickRef.current?.(pairKey);
      });

      cy.on("layoutstop", () => {
        cy!.fit(undefined, 40);
      });

      cyRef.current = cy;
    }

    init();

    return () => {
      mounted = false;
      if (cy) {
        cy.destroy();
        cyRef.current = null;
      }
    };
  }, [elements]);

  return (
    <div style={{ position: "relative", width: "100%", height: `${height}px` }}>
      <div
        ref={containerRef}
        style={{
          width: "100%",
          height: "100%",
          background: "var(--cream)",
          border: "1px solid var(--border)",
          borderRadius: "2px",
        }}
      />

      {elements.nodes.length > 0 && (
        <div
          style={{
            position: "absolute",
            bottom: 12,
            left: 12,
            display: "flex",
            flexDirection: "column",
            gap: 4,
            background: "rgba(250, 248, 243, 0.9)",
            padding: "8px 12px",
            border: "1px solid var(--border)",
            fontSize: "10px",
            fontFamily: "monospace",
            zIndex: 5,
          }}
        >
          {LEGEND_ITEMS.map((item) => (
            <div
              key={item.label}
              style={{ display: "flex", alignItems: "center", gap: 8 }}
            >
              <div
                style={{
                  width: 20,
                  height: 3,
                  background: item.color,
                  borderRadius: 2,
                  flexShrink: 0,
                }}
              />
              <span style={{ color: "var(--ink-muted)" }}>{item.label}</span>
            </div>
          ))}
        </div>
      )}

      {tooltip && (
        <div
          style={{
            position: "absolute",
            left: tooltip.x,
            top: tooltip.y,
            transform: "translateX(-50%)",
            background: "var(--ink)",
            color: "var(--cream)",
            padding: "4px 10px",
            fontSize: "11px",
            fontFamily: "monospace",
            pointerEvents: "none",
            whiteSpace: "nowrap",
            zIndex: 10,
            borderRadius: "2px",
          }}
        >
          {tooltip.label}
        </div>
      )}
    </div>
  );
}
