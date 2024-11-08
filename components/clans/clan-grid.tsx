"use client";

import { type Clan } from "@/lib/types";
import { ClanCard } from "./clan-card";
import { Pagination } from "./pagination";
import { useRouter, useSearchParams } from "next/navigation";

interface ClanGridProps {
  initialData: {
    clans: Clan[];
    totalCount: number;
  };
  priority?: boolean;
}

export function ClanGrid({ initialData, priority = false }: ClanGridProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentPage = Number(searchParams.get("page")) || 1;

  const handleBumpSuccess = () => {
    router.refresh();
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {initialData.clans.map((clan, index) => (
          <ClanCard
            key={clan.id}
            clan={clan}
            onBumpSuccess={handleBumpSuccess}
            priority={priority && index < 3}
          />
        ))}
      </div>

      {Math.ceil(initialData.totalCount / 9) > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={Math.ceil(initialData.totalCount / 9)}
          onPageChange={(page) => {
            const params = new URLSearchParams(searchParams.toString());
            params.set("page", page.toString());
            router.push(`/?${params.toString()}`);
          }}
        />
      )}
    </div>
  );
}
