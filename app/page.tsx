import { Suspense } from "react";
import { ClanDirectory } from "@/components/clan-directory";
import { ClanGridSkeleton } from "@/components/clans/clan-grid-skeleton";
import prisma from "@/lib/prisma";
import { ClanGrid } from "@/components/clans/clan-grid";
import { Prisma } from "@prisma/client";
import { Toaster } from "@/components/ui/toaster";

interface PageProps {
  searchParams: { [key: string]: string | string[] };
}

async function getFilteredClans(searchParams: {
  [key: string]: string | string[];
}) {
  const tags = Array.isArray(searchParams["tags[]"])
    ? searchParams["tags[]"]
    : searchParams["tags[]"]
    ? [searchParams["tags[]"]]
    : [];
  const location = searchParams.location || "all";
  const language = searchParams.language || "all";
  const page = Number(searchParams.page) || 1;
  const limit = 9;
  const offset = (page - 1) * limit;

  const where: Prisma.ClanWhereInput = {};
  const conditions: Prisma.ClanWhereInput[] = [];

  if (tags.length > 0) {
    conditions.push({
      tags: {
        hasSome: tags as any[],
      },
    });
  }

  if (location !== "all") {
    conditions.push({
      location: (location as string).replace("/", "_") as any,
    });
  }

  if (language !== "all") {
    conditions.push({
      language: language as string,
    });
  }

  if (conditions.length > 0) {
    where.AND = conditions;
  }

  const [clans, totalCount] = await Promise.all([
    prisma.clan.findMany({
      where,
      take: limit,
      skip: offset,
      orderBy: {
        lastBumpedAt: "desc",
      },
    }),
    prisma.clan.count({ where }),
  ]);

  return { clans, totalCount };
}

async function FilteredClans({
  searchParams,
}: {
  searchParams: PageProps["searchParams"];
}) {
  const data = await getFilteredClans(searchParams);
  return <ClanGrid initialData={data} />;
}

export default async function Page({ searchParams }: PageProps) {
  const initialData = await getFilteredClans({});

  return (
    <>
      <ClanDirectory initialData={initialData}>
        <Suspense
          key={JSON.stringify(searchParams)}
          fallback={<ClanGridSkeleton />}
        >
          <FilteredClans searchParams={searchParams} />
        </Suspense>
      </ClanDirectory>
      <Toaster />
    </>
  );
}