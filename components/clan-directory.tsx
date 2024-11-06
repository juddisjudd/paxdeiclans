"use client";

import React from "react";
import { ClanFilters } from "./clans/clan-filters";
import { type FilterState, type ClanFormData, type Clan } from "@/lib/types";
import { useRouter, useSearchParams } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

interface ClanDirectoryProps {
  children: React.ReactNode;
  initialData: {
    clans: Clan[];
    totalCount: number;
  };
}

export function ClanDirectory({ children, initialData }: ClanDirectoryProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const currentFilters: FilterState = {
    tags: searchParams.getAll("tags[]"),
    location: searchParams.get("location") || "all",
    language: searchParams.get("language") || "all",
    page: Number(searchParams.get("page")) || 1,
  };

  const updateURL = (newFilters: FilterState) => {
    const params = new URLSearchParams(searchParams.toString());

    params.delete("tags[]");
    newFilters.tags.forEach((tag) => {
      params.append("tags[]", tag);
    });

    if (newFilters.location !== "all") {
      params.set("location", newFilters.location);
    } else {
      params.delete("location");
    }

    if (newFilters.language !== "all") {
      params.set("language", newFilters.language);
    } else {
      params.delete("language");
    }

    if (newFilters.page > 1) {
      params.set("page", newFilters.page.toString());
    } else {
      params.delete("page");
    }

    router.push(`/?${params.toString()}`);
  };

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    if (key === "tags" && value === "") {
      updateURL({
        ...currentFilters,
        tags: [],
        page: 1,
      });
    } else if (key === "tags") {
      updateURL({
        ...currentFilters,
        tags: [value],
        page: 1,
      });
    } else if (key === "location" || key === "language") {
      updateURL({
        ...currentFilters,
        [key]: value,
        page: 1,
      });
    }
  };

  const handleTagToggle = (tag: string) => {
    const newTags = currentFilters.tags.includes(tag)
      ? currentFilters.tags.filter((t) => t !== tag)
      : [...currentFilters.tags, tag];

    updateURL({
      ...currentFilters,
      tags: newTags,
      page: 1,
    });
  };

  const handlePageChange = (page: number) => {
    updateURL({
      ...currentFilters,
      page,
    });
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

      const data = await response.json();

      if (!response.ok) {
        toast({
          title: "Error Adding Clan",
          description: data.error || "Failed to create clan",
          variant: "destructive",
        });
        throw new Error(data.error || "Failed to create clan");
      }

      updateURL({
        tags: [],
        location: "all",
        language: "all",
        page: 1,
      });

      toast({
        title: "Success!",
        description: "Your clan has been added successfully",
        duration: 3000,
      });

      router.refresh();
    } catch (error) {
      console.error("Error adding clan:", error);
      throw error;
    }
  };

  const handleClearFilters = () => {
    router.push("/");
    router.refresh();
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
          filters={currentFilters}
          onFilterChange={handleFilterChange}
          onTagToggle={handleTagToggle}
          selectedTags={currentFilters.tags}
          onClanAdd={handleClanAdd}
          onClearFilters={handleClearFilters}
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
