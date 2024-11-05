'use server'

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { type ClanFormData } from './types';

export async function createClan(data: ClanFormData) {
  try {
    const clan = await prisma.clan.create({
      data: {
        name: data.name,
        imageUrl: data.imageUrl,
        description: data.description,
        tags: data.tags.map(tag => tag as any),
        location: data.location.replace('/', '_') as any,
        language: data.language as any,
        discordUrl: data.discordUrl,
      },
    });

    revalidatePath('/');
    return { success: true, data: clan };
  } catch (error) {
    console.error('Failed to create clan:', error);
    return { success: false, error: 'Failed to create clan' };
  }
}