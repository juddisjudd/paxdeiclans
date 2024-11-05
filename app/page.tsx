import { Suspense } from "react";
import { ClanDirectory } from "@/components/clan-directory";
import { ClanGrid } from "@/components/clans/clan-grid";
import { ClanGridSkeleton } from "@/components/clans/clan-grid-skeleton";
import prisma from "@/lib/prisma";

async function getInitialClans() {
  // Simulate some delay to show loading state
  // await new Promise((resolve) => setTimeout(resolve, 2000));
  const [clans, totalCount] = await Promise.all([
    prisma.clan.findMany({
      take: 9,
      orderBy: {
        createdAt: "desc",
      },
    }),
    prisma.clan.count(),
  ]);

  return {
    clans,
    totalCount,
  };
}

export default async function Page() {
  return (
    <ClanDirectory>
      <Suspense fallback={<ClanGridSkeleton />}>
        <InitialClans />
      </Suspense>
    </ClanDirectory>
  );
}

async function InitialClans() {
  const initialData = await getInitialClans();
  return <ClanGrid initialData={initialData} />;
}