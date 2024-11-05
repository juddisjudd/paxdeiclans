"use client";

import { useEffect, useState } from "react";
import { type Clan } from "@/lib/types";
import { ClanCard } from "./clan-card";
import { Pagination } from "./pagination";

interface ClanGridProps {
  initialData: {
    clans: Clan[];
    totalCount: number;
  };
}

export function ClanGrid({ initialData }: ClanGridProps) {
  const [clans, setClans] = useState(initialData.clans);
  const [totalCount, setTotalCount] = useState(initialData.totalCount);

  useEffect(() => {
    setClans(initialData.clans);
    setTotalCount(initialData.totalCount);
  }, [initialData]);

  const handleBumpSuccess = async () => {
    // Refetch clans after successful bump
    const response = await fetch("/api/clans");
    const data = await response.json();
    setClans(data.clans);
    setTotalCount(data.totalCount);
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {clans.map((clan) => (
          <ClanCard key={clan.id} clan={clan} onBumpSuccess={handleBumpSuccess} />
        ))}
      </div>
      {Math.ceil(totalCount / 9) > 1 && (
        <Pagination
          currentPage={1}
          totalPages={Math.ceil(totalCount / 9)}
          onPageChange={() => {}}
        />
      )}
    </div>
  );
}