import { auth } from "@/auth";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { z } from "zod";

const UpdateClanSchema = z.object({
  name: z.string().min(3).max(100).optional(),
  imageUrl: z.string().url().nullish().or(z.literal("")),
  description: z.string().min(10).max(200).optional(),
  tags: z
    .array(
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
    )
    .optional(),
  location: z
    .enum(["Europe_Africa", "Americas", "Asia_Oceania", "Worldwide"])
    .optional(),
  language: z.string().min(1).optional(),
  discordUrl: z
    .string()
    .regex(/^https:\/\/discord\.gg\//)
    .optional(),
});

export async function PUT(
  request: Request,
  context: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const clanId = parseInt(context.params.id);
  const clan = await prisma.clan.findUnique({
    where: { id: clanId },
    select: { ownerId: true },
  });

  if (!clan) {
    return NextResponse.json({ error: "Clan not found" }, { status: 404 });
  }

  if (clan.ownerId !== session.user.id) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  const data = await request.json();

  const validatedData = UpdateClanSchema.parse(data);

  const updatedClan = await prisma.clan.update({
    where: { id: clanId },
    data: validatedData,
  });

  return NextResponse.json(updatedClan);
}
