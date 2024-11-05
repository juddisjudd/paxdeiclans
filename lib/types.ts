import { type Clan as PrismaClan } from '@prisma/client';

export type Clan = PrismaClan;

export type ClanFormData = {
  name: string;
  imageUrl: string;
  description: string;
  tags: string[];
  location: string;
  language: string;
  discordUrl: string;
};

export type FilterState = {
  tags: string[];
  location: string;
  language: string;
  page: number;
};