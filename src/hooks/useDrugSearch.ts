"use client";
import { useState, useCallback, useRef } from "react";
import { getSearchEngine } from "@/lib/search-engine";

interface SearchResult {
  id: string;
  name: string;
  aliases: string[];
  score: number;
}

export function useDrugSearch() {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const search = useCallback((query: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (query.length < 2) {
      setResults([]);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setIsLoading(true);
      try {
        const fuse = await getSearchEngine();
        const raw = fuse.search(query, { limit: 8 });
        setResults(
          raw.map((r) => ({
            ...r.item,
            score: r.score ?? 1,
          }))
        );
      } finally {
        setIsLoading(false);
      }
    }, 120);
  }, []);

  const clear = useCallback(() => {
    setResults([]);
    if (debounceRef.current) clearTimeout(debounceRef.current);
  }, []);

  return { results, isLoading, search, clear };
}
