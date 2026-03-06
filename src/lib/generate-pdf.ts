import type { DrugInteraction } from "@/types/drug";

interface PDFOptions {
  drugs: { id: string; name: string }[];
  interactions: DrugInteraction[];
}

const SEVERITY_LABELS: Record<string, string> = {
  contraindicated: "CONTRAINDICATED",
  serious: "SERIOUS",
  moderate: "MODERATE",
  minor: "MINOR",
  none: "NONE",
};

export async function generateDoctorReport({ drugs, interactions }: PDFOptions) {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const significant = interactions.filter((ix) => ix.severity !== "none");

  // Header
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("Drug Interaction Report", 20, 25);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Generated: ${new Date().toLocaleDateString()} | clearrx.vibed-lab.com`, 20, 33);
  doc.text("Reviewed by Jay, Licensed Pharmacist", 20, 39);

  // Medications
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.text("Medications Checked", 20, 52);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  drugs.forEach((d, i) => {
    doc.text(`• ${d.name}`, 25, 60 + i * 7);
  });

  // Interactions
  let y = 60 + drugs.length * 7 + 12;
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.text(`Interactions Found: ${significant.length}`, 20, y);
  y += 10;

  significant.forEach((ix) => {
    if (y > 260) {
      doc.addPage();
      y = 20;
    }
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text(`${ix.drugA_id} + ${ix.drugB_id}`, 20, y);
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text(SEVERITY_LABELS[ix.severity] ?? ix.severity, 150, y);
    y += 6;
    doc.setFont("helvetica", "normal");
    const lines = doc.splitTextToSize(ix.mechanism, 170);
    doc.text(lines, 20, y);
    y += lines.length * 5 + 4;

    if (ix.monitoringParameters?.length) {
      doc.text(`Monitor: ${ix.monitoringParameters.join(", ")}`, 20, y);
      y += 8;
    }
  });

  // Footer disclaimer
  doc.addPage();
  doc.setFontSize(9);
  doc.setFont("helvetica", "italic");
  const disclaimer = [
    "MEDICAL DISCLAIMER",
    "",
    "This report is for educational and informational purposes only. It is not intended to substitute",
    "for professional medical advice, diagnosis, or treatment. Always consult a qualified healthcare",
    "provider before making changes to your medications.",
    "",
    "Drug interaction information is provided for general awareness. The absence of an interaction",
    "in this tool does not guarantee that no interaction exists.",
    "",
    "If you believe you are experiencing a drug interaction emergency, call 911 or contact",
    "Poison Control at 1-800-222-1222 (US).",
  ];
  doc.text(disclaimer, 20, 30);

  doc.save("clearrx-doctor-report.pdf");
}
