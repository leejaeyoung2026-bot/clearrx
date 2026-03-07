export default function ArticleJsonLd({
  title,
  description,
  slug,
}: {
  title: string;
  description: string;
  slug: string;
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description,
    author: {
      "@type": "Person",
      name: "Jay",
      jobTitle: "Licensed Pharmacist",
      url: "https://clearrx.vibed-lab.com/about",
    },
    publisher: {
      "@type": "Organization",
      name: "ClearRx",
      url: "https://clearrx.vibed-lab.com",
    },
    url: `https://clearrx.vibed-lab.com/learn/${slug}`,
    datePublished: "2026-03-07",
    dateModified: "2026-03-07",
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://clearrx.vibed-lab.com/learn/${slug}`,
    },
    isPartOf: {
      "@type": "WebSite",
      name: "ClearRx",
      url: "https://clearrx.vibed-lab.com",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
