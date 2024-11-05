import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;

export async function POST(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const clanId = parseInt(context.params.id);
    if (isNaN(clanId)) {
      return NextResponse.json({ error: "Invalid clan ID" }, { status: 400 });
    }

    const clan = await prisma.clan.findUnique({
      where: { id: clanId },
      select: { lastBumpedAt: true },
    });

    if (!clan) {
      return NextResponse.json({ error: "Clan not found" }, { status: 404 });
    }

    const timeSinceLastBump = Date.now() - clan.lastBumpedAt.getTime();
    if (timeSinceLastBump < TWENTY_FOUR_HOURS) {
      const hoursRemaining = Math.ceil(
        (TWENTY_FOUR_HOURS - timeSinceLastBump) / (1000 * 60 * 60)
      );
      return NextResponse.json(
        {
          error: "Too soon to bump",
          hoursRemaining,
          nextBumpAvailable: new Date(
            clan.lastBumpedAt.getTime() + TWENTY_FOUR_HOURS
          ),
        },
        { status: 429 }
      );
    }

    const updatedClan = await prisma.clan.update({
      where: { id: clanId },
      data: { lastBumpedAt: new Date() },
    });

    return NextResponse.json({
      success: true,
      lastBumpedAt: updatedClan.lastBumpedAt,
      nextBumpAvailable: new Date(
        updatedClan.lastBumpedAt.getTime() + TWENTY_FOUR_HOURS
      ),
    });
  } catch (error) {
    console.error("Failed to bump clan:", error);
    return NextResponse.json({ error: "Failed to bump clan" }, { status: 500 });
  }
}
