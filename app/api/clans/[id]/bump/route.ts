import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const clanId = parseInt(params.id);
    if (isNaN(clanId)) {
      return NextResponse.json(
        { error: 'Invalid clan ID' },
        { status: 400 }
      );
    }

    // Get the clan and check last bump time
    const clan = await prisma.clan.findUnique({
      where: { id: clanId },
      select: { lastBumpedAt: true }
    });

    if (!clan) {
      return NextResponse.json(
        { error: 'Clan not found' },
        { status: 404 }
      );
    }

    // Check if 24 hours have passed since last bump
    const timeSinceLastBump = Date.now() - clan.lastBumpedAt.getTime();
    if (timeSinceLastBump < TWENTY_FOUR_HOURS) {
      const hoursRemaining = Math.ceil((TWENTY_FOUR_HOURS - timeSinceLastBump) / (1000 * 60 * 60));
      return NextResponse.json(
        { 
          error: 'Too soon to bump',
          hoursRemaining,
          nextBumpAvailable: new Date(clan.lastBumpedAt.getTime() + TWENTY_FOUR_HOURS)
        },
        { status: 429 }
      );
    }

    // Update the bump time
    const updatedClan = await prisma.clan.update({
      where: { id: clanId },
      data: { lastBumpedAt: new Date() }
    });

    return NextResponse.json({
      success: true,
      lastBumpedAt: updatedClan.lastBumpedAt,
      nextBumpAvailable: new Date(updatedClan.lastBumpedAt.getTime() + TWENTY_FOUR_HOURS)
    });
  } catch (error) {
    console.error('Failed to bump clan:', error);
    return NextResponse.json(
      { error: 'Failed to bump clan' },
      { status: 500 }
    );
  }
}