import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://clearrx.vibed-lab.com";
  return [
    { url: base, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${base}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/faq`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/privacy`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/contact`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/learn`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/learn/what-is-a-drug-interaction`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/learn/metformin-alcohol`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/learn/grapefruit-drug-interactions`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/learn/warfarin-ibuprofen`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/learn/blood-pressure-medication-combinations`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/glossary`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
  ];
}
