import { useState, useCallback } from "react";
import { type Clan, type ClanFormData, type FilterState } from "@/lib/types";

interface ClansData {
  clans: Clan[];
  totalCount: number;
}

export function useClans() {
  const [isLoading, setIsLoading] = useState(false);
  const [clans, setClans] = useState<Clan[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const setInitialState = useCallback((data: ClansData) => {
    setClans(data.clans);
    setTotalCount(data.totalCount);
  }, []);

  const fetchClans = useCallback(async (filters: FilterState) => {
    setIsLoading(true);
    setError(null);

    try {
      const searchParams = new URLSearchParams();

      filters.tags.forEach((tag) => {
        searchParams.append("tags[]", tag);
      });

      searchParams.set("location", filters.location);
      searchParams.set("language", filters.language);
      searchParams.set("page", filters.page.toString());
      searchParams.set("limit", "9");

      const response = await fetch(`/api/clans?${searchParams}`);
      if (!response.ok) throw new Error("Failed to fetch clans");

      const data = await response.json();
      setClans(data.clans);
      setTotalCount(data.totalCount);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      console.error("Error fetching clans:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addClan = useCallback(async (clanData: ClanFormData) => {
    setError(null);

    try {
      const formattedData = {
        ...clanData,
        tags: clanData.tags.map((tag) => tag.toLowerCase()),
        imageUrl: clanData.imageUrl || null,
      };

      const response = await fetch("/api/clans", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formattedData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create clan");
      }

      const newClan = await response.json();
      return newClan;
    } catch (err) {
      console.error("Error adding clan:", err);
      setError(err instanceof Error ? err.message : "Failed to add clan");
      throw err;
    }
  }, []);

  return {
    clans,
    totalCount,
    isLoading,
    error,
    fetchClans,
    addClan,
    setInitialState,
  };
}
