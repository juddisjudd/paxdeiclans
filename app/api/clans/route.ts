import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { z } from 'zod';
import { type Prisma } from '@prisma/client';
import { getDiscordInviteInfo } from '@/lib/discord-utils';

const ClanSchema = z.object({
  name: z.string().min(3).max(100),
  imageUrl: z.string().url().optional().nullable(),
  description: z.string()
    .min(10, "Description must be at least 10 characters")
    .max(200, "Description cannot exceed 200 characters"),
  tags: z.array(z.enum(['pve', 'pvp', 'pvx', 'crafting', 'casual', 'hardcore', 'roleplay', 'trading'])),
  location: z.enum(['Europe/Africa', 'Americas', 'Asia/Oceania', 'Worldwide']),
  language: z.string().min(1),
  discordUrl: z.string().regex(/^https:\/\/discord\.gg\//)
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const tags = searchParams.getAll('tags[]');
  const location = searchParams.get('location') || 'all';
  const language = searchParams.get('language') || 'all';
  const page = Number(searchParams.get('page')) || 1;
  const limit = Number(searchParams.get('limit')) || 9;
  const offset = (page - 1) * limit;

  try {
    const where: Prisma.ClanWhereInput = {};
    const conditions: Prisma.ClanWhereInput[] = [];

    // Handle tag filtering
    if (tags.length > 0) {
      conditions.push({
        tags: {
          hasSome: tags as any[]
        }
      });
    }

    // Handle location filtering
    if (location !== 'all') {
      conditions.push({
        location: location.replace('/', '_') as any
      });
    }

    // Handle language filtering
    if (language !== 'all') {
      conditions.push({
        language: language as any
      });
    }

    // Combine all conditions
    if (conditions.length > 0) {
      where.AND = conditions;
    }

    const [clans, totalCount] = await Promise.all([
      prisma.clan.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: {
          createdAt: 'desc'
        }
      }),
      prisma.clan.count({ where })
    ]);

    return NextResponse.json({
      clans,
      totalCount
    });
  } catch (error) {
    console.error('Failed to fetch clans:', error);
    return NextResponse.json(
      { error: 'Failed to fetch clans' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const data = ClanSchema.parse(json);

    // Check Discord invite before creating clan
    const discordInfo = await getDiscordInviteInfo(data.discordUrl);
    
    if (!discordInfo.isValid) {
      return NextResponse.json(
        { error: discordInfo.error || 'Invalid Discord invite' },
        { status: 400 }
      );
    }

    // Convert location format and add Discord member count
    const prismaData = {
      ...data,
      location: data.location.replace('/', '_') as any,
      discordMembers: discordInfo.memberCount || null
    };

    const clan = await prisma.clan.create({
      data: prismaData
    });

    return NextResponse.json(clan, { status: 201 });
  } catch (error) {
    console.error('Failed to create clan:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create clan' },
      { status: 500 }
    );
  }
}