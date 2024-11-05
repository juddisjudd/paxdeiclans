"use client";

import { useState } from "react";
import { ClanFilters } from "./clans/clan-filters";
import { type FilterState, type ClanFormData } from "@/lib/types";

interface ClanDirectoryProps {
  children: React.ReactNode;
}

export function ClanDirectory({ children }: ClanDirectoryProps) {
  const [filters, setFilters] = useState<FilterState>({
    tags: [],
    location: "all",
    language: "all",
    page: 1,
  });

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
    try {
      const response = await fetch("/api/clans", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(clanData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create clan");
      }

      setFilters({
        tags: [],
        location: "all",
        language: "all",
        page: 1,
      });
    } catch (error) {
      console.error("Error adding clan:", error);
      throw error;
    }
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

        {children}
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