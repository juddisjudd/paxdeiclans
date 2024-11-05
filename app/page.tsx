import { ClanDirectory } from "@/components/clan-directory";
import prisma from "@/lib/prisma";
import { Clan } from "@prisma/client";

async function getInitialClans(): Promise<{ clans: Clan[], totalCount: number }> {
  const [clans, totalCount] = await Promise.all([
    prisma.clan.findMany({
      take: 9,
      orderBy: {
        createdAt: 'desc'
      }
    }),
    prisma.clan.count()
  ]);

  return {
    clans,
    totalCount
  };
}

export default async function Page() {
  const initialData = await getInitialClans();
  
  return (
    <ClanDirectory initialData={initialData} />
  );
}