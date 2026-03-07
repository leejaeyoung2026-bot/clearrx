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
      url: "https://clearrx.vibed-lab.com/about",
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
      url: "https://clearrx.vibed-lab.com/about",
    },
    lastReviewed: "2026-03-07",
    audience: { "@type": "PatientsAudience" },
    specialty: {
      "@type": "MedicalSpecialty",
      name: "Pharmacy",
    },
  };

  const organization = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Vibed Lab",
    url: "https://vibed-lab.com",
    sameAs: [
      "https://clearrx.vibed-lab.com",
      "https://backtest.vibed-lab.com",
      "https://cycle.vibed-lab.com",
    ],
  };

  const breadcrumbList = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Vibed Lab",
        item: "https://vibed-lab.com",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "ClearRx",
        item: "https://clearrx.vibed-lab.com",
      },
    ],
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organization) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbList) }}
      />
    </>
  );
}
