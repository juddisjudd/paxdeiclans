import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getDiscordInviteInfo } from '@/lib/discord-utils';

// Only allow GET requests from Vercel Cron
export const runtime = 'edge';
export const preferredRegion = 'iad1';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    // Verify the request is from Vercel Cron
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET_KEY}`) {
      return new Response('Unauthorized', { status: 401 });
    }

    const clans = await prisma.clan.findMany({
      select: {
        id: true,
        discordUrl: true,
        discordLastUpdate: true
      }
    });

    const updates = await Promise.allSettled(
      clans.map(async (clan) => {
        // Skip if updated in the last hour
        if (clan.discordLastUpdate && 
            new Date().getTime() - clan.discordLastUpdate.getTime() < 3600000) {
          return null;
        }

        const discordInfo = await getDiscordInviteInfo(clan.discordUrl);
        
        if (!discordInfo.isValid) {
          console.warn(`Invalid Discord invite for clan ${clan.id}: ${discordInfo.error}`);
          return null;
        }

        return prisma.clan.update({
          where: { id: clan.id },
          data: {
            discordMembers: discordInfo.memberCount || null,
            discordOnline: discordInfo.presenceCount || null,
            discordLastUpdate: new Date()
          }
        });
      })
    );

    const successCount = updates.filter(result => result.status === 'fulfilled').length;
    
    return NextResponse.json({
      success: true,
      message: `Updated ${successCount} clans`
    });
  } catch (error) {
    console.error('Failed to update Discord stats:', error);
    return NextResponse.json(
      { error: 'Failed to update Discord stats' },
      { status: 500 }
    );
  }
}