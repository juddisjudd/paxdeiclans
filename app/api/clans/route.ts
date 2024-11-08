import { NextResponse } from "next/server";
import { type NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { z } from "zod";
import { type Prisma } from "@prisma/client";
import { getDiscordInviteInfo } from "@/lib/discord-utils";
import { auth } from "@/auth";

const RATE_LIMIT_WINDOW = 60 * 1000;
const MAX_REQUESTS = 30;
const requestMap = new Map<string, number[]>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const requests = requestMap.get(ip) || [];
  const recentRequests = requests.filter(
    (time) => time > now - RATE_LIMIT_WINDOW
  );

  if (recentRequests.length >= MAX_REQUESTS) {
    return true;
  }

  requestMap.set(ip, [...recentRequests, now]);
  return false;
}

const ClanSchema = z.object({
  name: z.string().min(3).max(100),
  imageUrl: z.string().url().nullish().or(z.literal("")),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(200, "Description cannot exceed 200 characters"),
  tags: z.array(
    z.enum([
      "pve",
      "pvp",
      "pvx",
      "crafting",
      "casual",
      "hardcore",
      "roleplay",
      "trading",
    ])
  ),
  location: z.enum(["Europe/Africa", "Americas", "Asia/Oceania", "Worldwide"]),
  language: z.string().min(1),
  discordUrl: z.string().regex(/^https:\/\/discord\.gg\//),
});

export async function GET(request: NextRequest) {
  const ip = request.ip || "unknown";
  if (isRateLimited(ip)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const origin = request.headers.get('origin');
  if (process.env.NODE_ENV === 'production' && origin) {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '');
    const requestOrigin = origin.replace(/\/$/, '');
    
    if (!requestOrigin.includes(siteUrl || '')) {
      console.log('Unauthorized origin:', {
        requestOrigin,
        allowedOrigin: siteUrl
      });
      return NextResponse.json(
        { error: "Unauthorized origin" },
        { status: 401 }
      );
    }
  }

  const { searchParams } = new URL(request.url);
  const tags = searchParams.getAll("tags[]");
  const location = searchParams.get("location") || "all";
  const language = searchParams.get("language") || "all";
  const page = Number(searchParams.get("page")) || 1;
  const limit = Number(searchParams.get("limit")) || 9;
  const offset = (page - 1) * limit;

  try {
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
        location: location.replace("/", "_") as any,
      });
    }

    if (language !== "all") {
      conditions.push({
        language: language as any,
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

    return NextResponse.json({
      clans,
      totalCount,
    });
  } catch (error) {
    console.error("Failed to fetch clans:", error);
    return NextResponse.json(
      { error: "Failed to fetch clans" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const ip = request.ip || "unknown";
  if (isRateLimited(ip)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const origin = request.headers.get('origin');
  if (process.env.NODE_ENV === 'production' && origin) {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '');
    const requestOrigin = origin.replace(/\/$/, '');
    
    if (!requestOrigin.includes(siteUrl || '')) {
      console.log('Unauthorized origin:', {
        requestOrigin,
        allowedOrigin: siteUrl
      });
      return NextResponse.json(
        { error: "Unauthorized origin" },
        { status: 401 }
      );
    }
  }

  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const json = await request.json();
    const data = ClanSchema.parse({
      ...json,
      imageUrl: json.imageUrl || null,
    });

    const discordInfo = await getDiscordInviteInfo(data.discordUrl);

    if (!discordInfo.isValid) {
      return NextResponse.json(
        { error: discordInfo.error || "Invalid Discord invite" },
        { status: 400 }
      );
    }

    const prismaData = {
      ...data,
      ownerId: session.user.id,
      imageUrl: data.imageUrl || null,
      location: data.location.replace("/", "_") as any,
      discordMembers: discordInfo.memberCount || null,
      discordOnline: discordInfo.presenceCount || null,
      discordLastUpdate: new Date(),
    };

    const clan = await prisma.clan.create({
      data: prismaData,
    });

    return NextResponse.json(clan, { status: 201 });
  } catch (error) {
    console.error("Failed to create clan:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create clan" },
      { status: 500 }
    );
  }
}
