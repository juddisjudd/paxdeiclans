"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { type ClanFormData } from "./types";
import { ClanLocation, ClanTag } from "@prisma/client";

export async function createClan(data: ClanFormData) {
  try {
    const clan = await prisma.clan.create({
      data: {
        name: data.name,
        imageUrl: data.imageUrl,
        description: data.description,
        tags: data.tags.map((tag) => tag as ClanTag),
        location: data.location.replace("/", "_") as ClanLocation,
        language: data.language,
        discordUrl: data.discordUrl,
      },
    });

    revalidatePath("/");
    return { success: true, data: clan };
  } catch (error) {
    console.error("Failed to create clan:", error);
    return { success: false, error: "Failed to create clan" };
  }
}
