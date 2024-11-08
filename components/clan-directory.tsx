"use client";

import React, { useState } from "react";
import { useSession } from "next-auth/react";
import { ClanFilters } from "./clans/clan-filters";
import { type FilterState, type ClanFormData, type Clan } from "@/lib/types";
import { useRouter, useSearchParams } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import ClanStats from "./clans/clan-stats";
import { UserMenu } from "./user-menu";
import { Footer } from "./footer";

interface ClanDirectoryProps {
  children: React.ReactNode;
  initialData: {
    clans: Clan[];
    totalCount: number;
  };
}

export function ClanDirectory({ children, initialData }: ClanDirectoryProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const [localFilters, setLocalFilters] = useState({
    tags: searchParams.getAll("tags[]"),
    location: searchParams.get("location") || "all",
    language: searchParams.get("language") || "all",
    page: Number(searchParams.get("page")) || 1,
  });

  const updateURL = (newFilters: FilterState) => {
    const params = new URLSearchParams(searchParams.toString());

    params.delete("tags[]");
    newFilters.tags.forEach((tag) => params.append("tags[]", tag));

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

    router.push(`/?${params.toString()}`, { scroll: false });
  };

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    const newFilters = { ...localFilters };

    if (key === "tags") {
      newFilters.tags = value ? [value] : [];
    } else if (key === "location" || key === "language") {
      newFilters[key] = value;
    }
    newFilters.page = 1;

    setLocalFilters(newFilters);
    updateURL(newFilters);
  };

  const handleTagToggle = (tag: string) => {
    const newTags = localFilters.tags.includes(tag)
      ? localFilters.tags.filter((t) => t !== tag)
      : [...localFilters.tags, tag];

    const newFilters = {
      ...localFilters,
      tags: newTags,
      page: 1,
    };

    setLocalFilters(newFilters);
    updateURL(newFilters);
  };

  const handleClearFilters = () => {
    const defaultFilters = {
      tags: [],
      location: "all",
      language: "all",
      page: 1,
    };
    setLocalFilters(defaultFilters);
    router.push("/", { scroll: false });
    router.refresh();
  };

  const handleClanAdd = async (clanData: ClanFormData) => {
    if (!session) {
      toast({
        title: "Authentication Required",
        description: "You must be logged in to add a clan",
        variant: "destructive",
      });
      return;
    }

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

  return (
    <div className="min-h-screen bg-[#F5F2EA] p-6 flex flex-col">
      <div className="max-w-6xl mx-auto space-y-6 flex-grow">
        <div className="text-center space-y-2">
          {/* Mobile layout (default) */}
          <div className="flex flex-col items-center gap-2 md:hidden">
            <h1
              className="text-4xl font-serif text-[#4A3D2C] hover:text-[#6B5C45] cursor-pointer"
              onClick={() => router.push("/")}
            >
              Pax Dei Clan Directory
            </h1>
            <p className="text-[#6B5C45]">
              Find a clan and begin your medieval journey.
            </p>
            <div className="mt-2">
              <UserMenu />
            </div>
          </div>

          {/* Desktop layout (md and up) */}
          <div className="hidden md:block">
            <div className="flex justify-between items-center">
              <div className="flex-1" /> {/* Spacer */}
              <div className="flex-1">
                <h1
                  className="text-4xl font-serif text-[#4A3D2C] hover:text-[#6B5C45] cursor-pointer"
                  onClick={() => router.push("/")}
                >
                  Pax Dei Clan Directory
                </h1>
                <p className="text-[#6B5C45]">
                  Find a clan and begin your medieval journey.
                </p>
              </div>
              <div className="flex-1 flex justify-end">
                <UserMenu />
              </div>
            </div>
          </div>

          <ClanStats totalClans={initialData.totalCount} />
        </div>

        <ClanFilters
          filters={localFilters}
          onFilterChange={handleFilterChange}
          onTagToggle={handleTagToggle}
          selectedTags={localFilters.tags}
          onClanAdd={handleClanAdd}
          onClearFilters={handleClearFilters}
        />

        {children}
      </div>
      <Footer />
    </div>
  );
}
