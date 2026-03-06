import Fuse from "fuse.js";

interface SearchEntry {
  id: string;
  name: string;
  aliases: string[];
}

let fuseInstance: Fuse<SearchEntry> | null = null;
let searchIndex: SearchEntry[] = [];

export async function getSearchEngine(): Promise<Fuse<SearchEntry>> {
  if (fuseInstance) return fuseInstance;

  const res = await fetch("/data/drug-search-index.json");
  searchIndex = await res.json();

  fuseInstance = new Fuse(searchIndex, {
    keys: [
      { name: "name", weight: 0.7 },
      { name: "aliases", weight: 0.3 },
    ],
    threshold: 0.35,
    includeScore: true,
    minMatchCharLength: 2,
  });

  return fuseInstance;
}

export function makePairKey(a: string, b: string): string {
  return [a, b].sort().join("::");
}
