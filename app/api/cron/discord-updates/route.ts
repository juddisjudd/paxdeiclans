import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getDiscordInviteInfo } from "@/lib/discord-utils";

export const runtime = "edge";
export const preferredRegion = "iad1";
export const dynamic = "force-dynamic";

const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;

type UpdateResult = {
  status: "success" | "failed" | "skipped";
  id: number;
  reason?: string;
  members?: number;
  online?: number;
};

interface ClanWithDiscord {
  id: number;
  discordUrl: string;
  discordLastUpdate: Date | null;
}

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET_KEY}`) {
      return new Response("Unauthorized", { status: 401 });
    }

    const clans = await prisma.clan.findMany({
      select: {
        id: true,
        discordUrl: true,
        discordLastUpdate: true,
      },
    });

    console.log(
      `Starting daily Discord stats update for ${clans.length} clans`
    );

    const updates = await Promise.allSettled(
      clans.map(async (clan: ClanWithDiscord): Promise<UpdateResult> => {
        if (
          clan.discordLastUpdate &&
          new Date().getTime() - clan.discordLastUpdate.getTime() <
            TWENTY_FOUR_HOURS
        ) {
          return {
            status: "skipped",
            id: clan.id,
            reason: "Updated within last 24 hours",
          };
        }

        try {
          const discordInfo = await getDiscordInviteInfo(clan.discordUrl);

          if (!discordInfo.isValid) {
            console.warn(
              `Invalid Discord invite for clan ${clan.id}: ${discordInfo.error}`
            );
            return {
              status: "failed",
              id: clan.id,
              reason: discordInfo.error,
            };
          }

          await prisma.clan.update({
            where: { id: clan.id },
            data: {
              discordMembers: discordInfo.memberCount || null,
              discordOnline: discordInfo.presenceCount || null,
              discordLastUpdate: new Date(),
            },
          });

          return {
            status: "success",
            id: clan.id,
            members: discordInfo.memberCount,
            online: discordInfo.presenceCount,
          };
        } catch (error) {
          console.error(`Error updating clan ${clan.id}:`, error);
          return {
            status: "failed",
            id: clan.id,
            reason: error instanceof Error ? error.message : "Unknown error",
          };
        }
      })
    );

    const summary = {
      total: clans.length,
      updated: updates.filter(
        (r) => r.status === "fulfilled" && r.value.status === "success"
      ).length,
      skipped: updates.filter(
        (r) => r.status === "fulfilled" && r.value.status === "skipped"
      ).length,
      failed: updates.filter(
        (r) =>
          r.status === "rejected" ||
          (r.status === "fulfilled" && r.value.status === "failed")
      ).length,
      timestamp: new Date().toISOString(),
    };

    console.log("Discord stats update complete:", summary);

    return NextResponse.json({
      success: true,
      summary,
    });
  } catch (error) {
    console.error("Failed to update Discord stats:", error);
    return NextResponse.json(
      { error: "Failed to update Discord stats" },
      { status: 500 }
    );
  }
}
