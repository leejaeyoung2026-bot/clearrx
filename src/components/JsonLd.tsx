export default function JsonLd() {
  const softwareApp = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "ClearRx",
    description:
      "Drug interaction checker. Enter your medications, see a visual network of interactions with plain-English explanations.",
    url: "https://clearrx.vibed-lab.com",
    applicationCategory: "HealthApplication",
    operatingSystem: "Any",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    author: {
      "@type": "Person",
      name: "Jay",
      jobTitle: "Licensed Pharmacist",
    },
  };

  const medicalWebPage = {
    "@context": "https://schema.org",
    "@type": "MedicalWebPage",
    name: "ClearRx — Drug Interaction Checker",
    url: "https://clearrx.vibed-lab.com",
    description:
      "Check drug interactions instantly. Visual network diagram. Written by a licensed pharmacist.",
    reviewedBy: {
      "@type": "Person",
      name: "Jay",
      jobTitle: "Licensed Pharmacist",
    },
    lastReviewed: "2026-03-07",
    audience: { "@type": "PatientsAudience" },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareApp) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(medicalWebPage) }}
      />
    </>
  );
}
