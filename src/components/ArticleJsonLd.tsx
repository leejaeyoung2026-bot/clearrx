export default function ArticleJsonLd({
  title,
  description,
  slug,
}: {
  title: string;
  description: string;
  slug: string;
}) {
  const base = "https://clearrx.vibed-lab.com";

  const articleLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description,
    author: {
      "@type": "Person",
      name: "Jay",
      jobTitle: "Licensed Pharmacist",
      url: `${base}/about`,
    },
    publisher: {
      "@type": "Organization",
      name: "ClearRx",
      url: base,
    },
    url: `${base}/learn/${slug}`,
    datePublished: "2026-03-07",
    dateModified: "2026-03-07",
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${base}/learn/${slug}`,
    },
    isPartOf: {
      "@type": "WebSite",
      name: "ClearRx",
      url: base,
    },
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: base,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Learn",
        item: `${base}/learn`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: title,
        item: `${base}/learn/${slug}`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
    </>
  );
}
