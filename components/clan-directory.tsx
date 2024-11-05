"use client";

import { useState, useEffect } from "react";
import { ClanFilters } from "./clans/clan-filters";
import { ClanGrid } from "./clans/clan-grid";
import { Pagination } from "./clans/pagination";
import { useClans } from "@/hooks/use-clans";
import { type FilterState, type Clan, type ClanFormData } from "@/lib/types";

const ITEMS_PER_PAGE = 9;

interface ClanDirectoryProps {
  initialData: {
    clans: Clan[];
    totalCount: number;
  };
}

export function ClanDirectory({ initialData }: ClanDirectoryProps) {
  const [filters, setFilters] = useState<FilterState>({
    tags: [],
    location: "all",
    language: "all",
    page: 1,
  });

  const {
    clans,
    totalCount,
    isLoading,
    error,
    fetchClans,
    addClan,
    setInitialState,
  } = useClans();

  useEffect(() => {
    setInitialState(initialData);
  }, [initialData, setInitialState]);

  useEffect(() => {
    fetchClans(filters);
  }, [filters, fetchClans]);

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    if (key === "tags" && value === "") {
      setFilters((prev) => ({
        ...prev,
        tags: [],
        page: 1,
      }));
    } else {
      setFilters((prev) => ({
        ...prev,
        [key]: value,
        page: 1,
      }));
    }
  };

  const handleTagToggle = (tag: string) => {
    setFilters((prev) => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter((t) => t !== tag)
        : [...prev.tags, tag],
      page: 1,
    }));
  };

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({
      ...prev,
      page,
    }));
  };

  const handleClanAdd = async (clanData: ClanFormData) => {
    await addClan(clanData);
    setFilters({
      tags: [],
      location: "all",
      language: "all",
      page: 1,
    });
    await fetchClans({
      tags: [],
      location: "all",
      language: "all",
      page: 1,
    });
  };

  return (
    <div className="min-h-screen bg-[#F5F2EA] p-6 flex flex-col">
      <div className="max-w-6xl mx-auto space-y-6 flex-grow">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-serif text-[#4A3D2C]">
            Pax Dei Clan Directory
          </h1>
          <p className="text-[#6B5C45]">
            Find a clan and begin your medieval journey.
          </p>
        </div>

        <ClanFilters
          filters={filters}
          onFilterChange={handleFilterChange}
          onTagToggle={handleTagToggle}
          selectedTags={filters.tags}
          onClanAdd={handleClanAdd}
        />

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="text-center py-8">Loading clans...</div>
        ) : (
          <>
            {clans.length === 0 ? (
              <div className="text-center py-8 text-[#6B5C45]">
                No clans found. Try adjusting your filters or add a new clan!
              </div>
            ) : (
              <ClanGrid
                clans={clans}
                onBumpSuccess={() => {
                  fetchClans(filters);
                }}
              />
            )}

            <Pagination
              currentPage={filters.page}
              totalPages={Math.ceil(totalCount / ITEMS_PER_PAGE)}
              onPageChange={handlePageChange}
            />
          </>
        )}
      </div>

      <footer className="mt-8 py-4 text-center text-[#6B5C45] border-t border-[#B3955D]">
        <div className="max-w-6xl mx-auto px-4">
          <p>
            &copy; {new Date().getFullYear()} Pax Dei Clan Directory |
            <a
              href="https://ko-fi.com/ohitsjudd"
              target="_blank"
              rel="noopener noreferrer"
              className="ml-2 text-[#B3955D] hover:text-[#8C714A]"
            >
              Support This Project
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
