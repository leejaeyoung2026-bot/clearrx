"use client";
import { useEffect, useRef } from "react";
import type cytoscape from "cytoscape";
import type { CytoscapeElements, SeverityLevel } from "@/types/drug";

interface Props {
  elements: CytoscapeElements;
  onEdgeClick?: (pairKey: string) => void;
  height?: number;
}

const SEVERITY_COLORS: Record<SeverityLevel, string> = {
  contraindicated: "#B83232",
  serious: "#B83232",
  moderate: "#B86B1A",
  minor: "#7A8C2E",
  none: "#9A9490",
};

const EDGE_WIDTHS: Record<SeverityLevel, number> = {
  contraindicated: 3,
  serious: 2.5,
  moderate: 2,
  minor: 1.5,
  none: 1,
};

export default function InteractionMap({ elements, onEdgeClick, height = 400 }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cyRef = useRef<cytoscape.Core | null>(null);
  const onEdgeClickRef = useRef(onEdgeClick);
  onEdgeClickRef.current = onEdgeClick;

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
              "background-color": "#FFFFFF",
              "border-color": "#2E7D7A",
              "border-width": 1.5,
              width: "mapData(riskScore, 0, 10, 28, 52)",
              height: "mapData(riskScore, 0, 10, 28, 52)",
              label: "data(label)",
              "font-family": "monospace",
              "font-size": "8px",
              color: "#1A1815",
              "text-valign": "bottom",
              "text-margin-y": 4,
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
              "line-color": SEVERITY_COLORS.contraindicated,
              width: EDGE_WIDTHS.contraindicated,
              "line-style": "solid",
            } as any,
          },
          {
            selector: "edge[severity = 'serious']",
            style: {
              "line-color": SEVERITY_COLORS.serious,
              width: EDGE_WIDTHS.serious,
              "line-style": "solid",
            } as any,
          },
          {
            selector: "edge[severity = 'moderate']",
            style: {
              "line-color": SEVERITY_COLORS.moderate,
              width: EDGE_WIDTHS.moderate,
              "line-style": "solid",
            } as any,
          },
          {
            selector: "edge[severity = 'minor']",
            style: {
              "line-color": SEVERITY_COLORS.minor,
              width: EDGE_WIDTHS.minor,
              "line-style": "dashed",
            } as any,
          },
          {
            selector: "edge[severity = 'none']",
            style: {
              "line-color": SEVERITY_COLORS.none,
              width: EDGE_WIDTHS.none,
              "line-style": "dashed",
            } as any,
          },
        ],
        layout: {
          name: "cose",
          animate: true,
          animationDuration: 600,
          animationEasing: "ease-out" as any,
          randomize: false,
          padding: 30,
        },
        userZoomingEnabled: true,
        userPanningEnabled: true,
        minZoom: 0.5,
        maxZoom: 3,
      });

      cy.on("tap", "edge", (evt: cytoscape.EventObject) => {
        const pairKey = evt.target.data("pairKey");
        onEdgeClickRef.current?.(pairKey);
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
    <div
      ref={containerRef}
      style={{
        width: "100%",
        height: `${height}px`,
        border: "1px solid var(--border)",
      }}
    />
  );
}
