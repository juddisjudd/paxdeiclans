import { auth } from "@/auth"
import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

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
    select: { ownerId: true }
  });

  if (!clan) {
    return NextResponse.json({ error: "Clan not found" }, { status: 404 });
  }

  if (clan.ownerId !== session.user.id) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  const data = await request.json();
  
  const updatedClan = await prisma.clan.update({
    where: { id: clanId },
    data
  });

  return NextResponse.json(updatedClan);
}