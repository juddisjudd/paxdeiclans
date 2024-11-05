# app\api\clans\route.ts

```ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { z } from 'zod';

// This should match your Prisma schema exactly
const ClanSchema = z.object({
  name: z.string().min(3).max(100),
  imageUrl: z.string().url().optional().nullable(),
  description: z.string().min(10),
  tags: z.array(z.enum(['pve', 'pvp', 'casual', 'competitive', 'roleplay', 'trading', 'crafting'])),
  location: z.enum(['Europe/Africa', 'Americas', 'Asia/Oceania', 'Worldwide']),
  language: z.enum(['English', 'French', 'German', 'Spanish']),
  discordUrl: z.string().regex(/^https:\/\/discord\.gg\//)
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search') || '';
  const location = searchParams.get('location') || 'all';
  const language = searchParams.get('language') || 'all';
  const page = Number(searchParams.get('page')) || 1;
  const limit = Number(searchParams.get('limit')) || 9;
  const offset = (page - 1) * limit;

  try {
    const where: any = {};
    const conditions = [];

    if (search) {
      conditions.push({
        name: {
          contains: search,
          mode: 'insensitive'
        }
      });
    }

    if (location !== 'all') {
      conditions.push({
        location: location.replace('/', '_')
      });
    }

    if (language !== 'all') {
      conditions.push({
        language
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

    // Convert location format from "Europe/Africa" to "Europe_Africa" for Prisma enum
    const prismaData = {
      ...data,
      location: data.location.replace('/', '_') as ClanLocation
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
```

# app\globals.css

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  font-family: Arial, Helvetica, sans-serif;
}

@layer utilities {
  .text-balance {
    text-wrap: balance;
  }
}

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 240 10% 3.9%;
    --card: 0 0% 100%;
    --card-foreground: 240 10% 3.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 240 10% 3.9%;
    --primary: 240 5.9% 10%;
    --primary-foreground: 0 0% 98%;
    --secondary: 240 4.8% 95.9%;
    --secondary-foreground: 240 5.9% 10%;
    --muted: 240 4.8% 95.9%;
    --muted-foreground: 240 3.8% 46.1%;
    --accent: 240 4.8% 95.9%;
    --accent-foreground: 240 5.9% 10%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 0 0% 98%;
    --border: 240 5.9% 90%;
    --input: 240 5.9% 90%;
    --ring: 240 10% 3.9%;
    --chart-1: 12 76% 61%;
    --chart-2: 173 58% 39%;
    --chart-3: 197 37% 24%;
    --chart-4: 43 74% 66%;
    --chart-5: 27 87% 67%;
    --radius: 0.5rem;
  }
  .dark {
    --background: 240 10% 3.9%;
    --foreground: 0 0% 98%;
    --card: 240 10% 3.9%;
    --card-foreground: 0 0% 98%;
    --popover: 240 10% 3.9%;
    --popover-foreground: 0 0% 98%;
    --primary: 0 0% 98%;
    --primary-foreground: 240 5.9% 10%;
    --secondary: 240 3.7% 15.9%;
    --secondary-foreground: 0 0% 98%;
    --muted: 240 3.7% 15.9%;
    --muted-foreground: 240 5% 64.9%;
    --accent: 240 3.7% 15.9%;
    --accent-foreground: 0 0% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 0 0% 98%;
    --border: 240 3.7% 15.9%;
    --input: 240 3.7% 15.9%;
    --ring: 240 4.9% 83.9%;
    --chart-1: 220 70% 50%;
    --chart-2: 160 60% 45%;
    --chart-3: 30 80% 55%;
    --chart-4: 280 65% 60%;
    --chart-5: 340 75% 55%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}

```

# app\layout.tsx

```tsx
import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Pax Dei Clan Directory",
  description: "Find a clan and begin your medieval journey.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}

```

# app\page.tsx

```tsx
import { ClanDirectory } from "@/components/clan-directory";
import prisma from "@/lib/prisma";
import { Clan } from "@prisma/client";

async function getInitialClans(): Promise<{ clans: Clan[], totalCount: number }> {
  const [clans, totalCount] = await Promise.all([
    prisma.clan.findMany({
      take: 9,
      orderBy: {
        createdAt: 'desc'
      }
    }),
    prisma.clan.count()
  ]);

  return {
    clans,
    totalCount
  };
}

export default async function Page() {
  const initialData = await getInitialClans();
  
  return (
    <ClanDirectory initialData={initialData} />
  );
}
```

# components.json

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "default",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.ts",
    "css": "app/globals.css",
    "baseColor": "zinc",
    "cssVariables": true,
    "prefix": ""
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  }
}
```

# components\clan-directory.tsx

```tsx
'use client';

import { useState, useEffect } from "react";
import { ClanFilters } from "./clans/clan-filters";
import { ClanGrid } from "./clans/clan-grid";
import { AddClanDialog } from "./clans/add-clan-dialog";
import { Pagination } from "./clans/pagination";
import { useClans } from "@/hooks/use-clans";
import { type FilterState, type Clan } from "@/lib/types";

const ITEMS_PER_PAGE = 9;

interface ClanDirectoryProps {
  initialData: {
    clans: Clan[];
    totalCount: number;
  };
}

export function ClanDirectory({ initialData }: ClanDirectoryProps) {
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    location: "all",
    language: "all",
    page: 1,
  });

  const {
    clans,
    totalCount,
    isLoading,
    error,
    fetchClans,
    addClan,
  } = useClans();

  useEffect(() => {
    setFilters({
      search: "",
      location: "all",
      language: "all",
      page: 1,
    });
    fetchClans({
      search: "",
      location: "all",
      language: "all",
      page: 1,
    });
  }, [initialData]);
  useEffect(() => {
    if (filters.search || filters.location !== 'all' || filters.language !== 'all' || filters.page !== 1) {
      fetchClans(filters);
    }
  }, [filters]);

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1,
    }));
  };

  const handlePageChange = (page: number) => {
    setFilters(prev => ({
      ...prev,
      page,
    }));
  };

  return (
    <div className="min-h-screen bg-[#F5F2EA] p-6 flex flex-col">
      <div className="max-w-6xl mx-auto space-y-6 flex-grow">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-serif text-[#4A3D2C]">Pax Dei Clan Directory</h1>
          <p className="text-[#6B5C45]">Find a clan and begin your medieval journey</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex-grow">
            <ClanFilters 
              filters={filters} 
              onFilterChange={handleFilterChange} 
            />
          </div>
          <AddClanDialog onClanAdd={addClan} />
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="text-center py-8">Loading clans...</div>
        ) : (
          <>
            {clans.length === 0 ? (
              <div className="text-center py-8 text-[#6B5C45]">
                No clans found. Try adjusting your filters or add a new clan!
              </div>
            ) : (
              <ClanGrid clans={clans} />
            )}

            <Pagination
              currentPage={filters.page}
              totalPages={Math.ceil(totalCount / ITEMS_PER_PAGE)}
              onPageChange={handlePageChange}
            />
          </>
        )}
      </div>
      
      {/* Footer */}
      <footer className="mt-8 py-4 text-center text-[#6B5C45] border-t border-[#B3955D]">
        <div className="max-w-6xl mx-auto px-4">
          <p>
            &copy; {new Date().getFullYear()} Pax Dei Clan Directory | 
            <a 
              href="https://ko-fi.com/ohitsjudd" 
              target="_blank" 
              rel="noopener noreferrer"
              className="ml-2 text-[#B3955D] hover:text-[#8C714A]"
            >
              Support Us
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
```

# components\clans\add-clan-dialog.tsx

```tsx
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { tagOptions, locationOptions, languageOptions } from "@/lib/constants";
import { type ClanFormData } from "@/lib/types";
import { AlertCircle } from "lucide-react";

const defaultClanData: ClanFormData = {
  name: "",
  imageUrl: "",
  description: "",
  tags: [],
  location: "",
  language: "",
  discordUrl: "",
};

interface AddClanDialogProps {
  onClanAdd: (clan: ClanFormData) => Promise<void>;
}

const RequiredLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span className="flex items-center gap-1">
    {children}
    <span className="text-red-500" title="Required field">*</span>
  </span>
);

export function AddClanDialog({ onClanAdd }: AddClanDialogProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<ClanFormData>(defaultClanData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof ClanFormData, string>>>({});

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof ClanFormData, string>> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Clan name is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (formData.tags.length === 0) {
      newErrors.tags = 'Select at least one tag';
    }

    if (!formData.location) {
      newErrors.location = 'Location is required';
    }

    if (!formData.language) {
      newErrors.language = 'Language is required';
    }

    if (!formData.discordUrl.trim()) {
      newErrors.discordUrl = 'Discord invite link is required';
    } else if (!formData.discordUrl.match(/^https:\/\/discord\.gg\//)) {
      newErrors.discordUrl = 'Must be a valid Discord invite link';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      await onClanAdd(formData);
      setFormData(defaultClanData);
      setOpen(false);
    } catch (error) {
      console.error('Failed to add clan:', error);
      // You might want to show an error message to the user here
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTagChange = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }));
    // Clear tag error when user selects a tag
    if (errors.tags) {
      setErrors(prev => ({ ...prev, tags: undefined }));
    }
  };

  const ErrorMessage: React.FC<{ error?: string }> = ({ error }) => {
    if (!error) return null;
    return (
      <p className="text-sm text-red-500 flex items-center gap-1 mt-1">
        <AlertCircle className="h-4 w-4" />
        {error}
      </p>
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-[#B3955D] hover:bg-[#8C714A] text-white">
          Add Clan
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Clan</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="clanName">
              <RequiredLabel>Clan Name</RequiredLabel>
            </Label>
            <Input
              id="clanName"
              value={formData.name}
              onChange={(e) => {
                setFormData({ ...formData, name: e.target.value });
                if (errors.name) {
                  setErrors(prev => ({ ...prev, name: undefined }));
                }
              }}
              className={errors.name ? "border-red-500" : ""}
            />
            <ErrorMessage error={errors.name} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="clanImage">Clan Image URL (Optional)</Label>
            <Input
              id="clanImage"
              value={formData.imageUrl}
              onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
              placeholder="https://imgur.com/your-image"
            />
            <p className="text-sm text-muted-foreground">
              Paste an Imgur image URL, or leave empty to use default image
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="clanDescription">
              <RequiredLabel>Clan Description</RequiredLabel>
            </Label>
            <Textarea
              id="clanDescription"
              value={formData.description}
              onChange={(e) => {
                setFormData({ ...formData, description: e.target.value });
                if (errors.description) {
                  setErrors(prev => ({ ...prev, description: undefined }));
                }
              }}
              className={errors.description ? "border-red-500" : ""}
            />
            <ErrorMessage error={errors.description} />
          </div>

          <div className="space-y-2">
            <Label>
              <RequiredLabel>Clan Tags</RequiredLabel>
            </Label>
            <div className="grid grid-cols-2 gap-2">
              {tagOptions.map((tag) => (
                <div key={tag.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`tag-${tag.value}`}
                    checked={formData.tags.includes(tag.value)}
                    onCheckedChange={() => handleTagChange(tag.value)}
                  />
                  <Label htmlFor={`tag-${tag.value}`}>{tag.label}</Label>
                </div>
              ))}
            </div>
            <ErrorMessage error={errors.tags} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="clanLocation">
              <RequiredLabel>Location/Timezone</RequiredLabel>
            </Label>
            <Select
              value={formData.location}
              onValueChange={(value) => {
                setFormData({ ...formData, location: value });
                if (errors.location) {
                  setErrors(prev => ({ ...prev, location: undefined }));
                }
              }}
            >
              <SelectTrigger className={errors.location ? "border-red-500" : ""}>
                <SelectValue placeholder="Select location..." />
              </SelectTrigger>
              <SelectContent>
                {locationOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <ErrorMessage error={errors.location} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="clanLanguage">
              <RequiredLabel>Language</RequiredLabel>
            </Label>
            <Select
              value={formData.language}
              onValueChange={(value) => {
                setFormData({ ...formData, language: value });
                if (errors.language) {
                  setErrors(prev => ({ ...prev, language: undefined }));
                }
              }}
            >
              <SelectTrigger className={errors.language ? "border-red-500" : ""}>
                <SelectValue placeholder="Select language..." />
              </SelectTrigger>
              <SelectContent>
                {languageOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <ErrorMessage error={errors.language} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="discordUrl">
              <RequiredLabel>Discord Invite Link</RequiredLabel>
            </Label>
            <Input
              id="discordUrl"
              value={formData.discordUrl}
              onChange={(e) => {
                setFormData({ ...formData, discordUrl: e.target.value });
                if (errors.discordUrl) {
                  setErrors(prev => ({ ...prev, discordUrl: undefined }));
                }
              }}
              placeholder="https://discord.gg/..."
              className={errors.discordUrl ? "border-red-500" : ""}
            />
            <ErrorMessage error={errors.discordUrl} />
          </div>

          <Button 
            type="submit" 
            className="w-full bg-[#B3955D] hover:bg-[#8C714A] text-white"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Adding...' : 'Add Clan'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
```

# components\clans\clan-card.tsx

```tsx
import { SiDiscord } from '@icons-pack/react-simple-icons';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { type Clan } from '@/lib/types';
import Image from 'next/image';

interface ClanCardProps {
  clan: Clan;
}

export function ClanCard({ clan }: ClanCardProps) {
  return (
    <Card className="relative overflow-hidden border-[#B3955D] bg-white">
      {/* Decorative corners */}
      <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-[#B3955D]" />
      <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-[#B3955D]" />
      <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-[#B3955D]" />
      <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-[#B3955D]" />
      
      <div className="relative h-40 w-full">
        <Image
          src={clan.imageUrl || '/images/clan-placeholder.png'}
          alt={clan.name}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          priority={false}
        />
      </div>
      <CardHeader className="pb-2">
        <h2 className="text-xl font-serif text-[#4A3D2C] text-center">{clan.name}</h2>
        <div className="flex gap-2 flex-wrap justify-center">
          {clan.tags.map((tag) => (
            <Badge
              key={tag}
              variant="outline"
              className="bg-[#B3955D]/10 text-[#4A3D2C] border-[#B3955D]"
            >
              {tag.toLowerCase()}
            </Badge>
          ))}
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <p className="text-[#6B5C45] text-sm">{clan.description}</p>
        <div className="mt-4 space-y-1 text-sm">
          <p className="text-[#4A3D2C]">
            <span className="font-semibold">Location:</span> {clan.location.replace('_', '/')}
          </p>
          <p className="text-[#4A3D2C]">
            <span className="font-semibold">Language:</span> {clan.language}
          </p>
        </div>
      </CardContent>
      <CardFooter>
        <Button
          className="w-full bg-[#B3955D] hover:bg-[#8C714A] text-white"
          onClick={() => window.open(clan.discordUrl, '_blank')}
        >
          <SiDiscord className="w-4 h-4 mr-2" />
          Join Discord
        </Button>
      </CardFooter>
    </Card>
  );
}
```

# components\clans\clan-filters.tsx

```tsx
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { languageOptions, locationOptions } from "@/lib/constants";
import { type FilterState } from "@/lib/types";

interface ClanFiltersProps {
  filters: FilterState;
  onFilterChange: (key: keyof FilterState, value: string) => void;
}

export function ClanFilters({ filters, onFilterChange }: ClanFiltersProps) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Input
        placeholder="Search clans..."
        value={filters.search}
        onChange={(e) => onFilterChange('search', e.target.value)}
        className="bg-white border-[#B3955D]"
      />
      <Select 
        value={filters.location} 
        onValueChange={(value) => onFilterChange('location', value)}
      >
        <SelectTrigger className="bg-white border-[#B3955D]">
          <SelectValue placeholder="Filter by location" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Locations</SelectItem>
          {locationOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select 
        value={filters.language} 
        onValueChange={(value) => onFilterChange('language', value)}
      >
        <SelectTrigger className="bg-white border-[#B3955D]">
          <SelectValue placeholder="Filter by language" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Languages</SelectItem>
          {languageOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
```

# components\clans\clan-grid.tsx

```tsx
import { type Clan } from '@/lib/types';
import { ClanCard } from './clan-card';

interface ClanGridProps {
  clans: Clan[];
}

export function ClanGrid({ clans }: ClanGridProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {clans.map((clan) => (
        <ClanCard key={clan.id} clan={clan} />
      ))}
    </div>
  );
}
```

# components\clans\pagination.tsx

```tsx
import { Button } from "@/components/ui/button";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex justify-center space-x-2 mt-6">
      <Button
        onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
        disabled={currentPage === 1}
        className="bg-[#B3955D] hover:bg-[#8C714A] text-white"
      >
        Previous
      </Button>
      <span className="flex items-center px-4 py-2 bg-white border border-[#B3955D] rounded-md">
        Page {currentPage} of {totalPages}
      </span>
      <Button
        onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
        disabled={currentPage === totalPages}
        className="bg-[#B3955D] hover:bg-[#8C714A] text-white"
      >
        Next
      </Button>
    </div>
  );
}
```

# components\ui\badge.tsx

```tsx
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }

```

# components\ui\button.tsx

```tsx
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }

```

# components\ui\card.tsx

```tsx
import * as React from "react"

import { cn } from "@/lib/utils"

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-lg border bg-card text-card-foreground shadow-sm",
      className
    )}
    {...props}
  />
))
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "text-2xl font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }

```

# components\ui\checkbox.tsx

```tsx
"use client"

import * as React from "react"
import * as CheckboxPrimitive from "@radix-ui/react-checkbox"
import { Check } from "lucide-react"

import { cn } from "@/lib/utils"

const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(({ className, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={cn(
      "peer h-4 w-4 shrink-0 rounded-sm border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground",
      className
    )}
    {...props}
  >
    <CheckboxPrimitive.Indicator
      className={cn("flex items-center justify-center text-current")}
    >
      <Check className="h-4 w-4" />
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
))
Checkbox.displayName = CheckboxPrimitive.Root.displayName

export { Checkbox }

```

# components\ui\dialog.tsx

```tsx
"use client"

import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { X } from "lucide-react"

import { cn } from "@/lib/utils"

const Dialog = DialogPrimitive.Root

const DialogTrigger = DialogPrimitive.Trigger

const DialogPortal = DialogPrimitive.Portal

const DialogClose = DialogPrimitive.Close

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-black/80  data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    )}
    {...props}
  />
))
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg",
        className
      )}
      {...props}
    >
      {children}
      <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
        <X className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </DialogPortal>
))
DialogContent.displayName = DialogPrimitive.Content.displayName

const DialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col space-y-1.5 text-center sm:text-left",
      className
    )}
    {...props}
  />
)
DialogHeader.displayName = "DialogHeader"

const DialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
      className
    )}
    {...props}
  />
)
DialogFooter.displayName = "DialogFooter"

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(
      "text-lg font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
))
DialogTitle.displayName = DialogPrimitive.Title.displayName

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
DialogDescription.displayName = DialogPrimitive.Description.displayName

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
}

```

# components\ui\input.tsx

```tsx
import * as React from "react"

import { cn } from "@/lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }

```

# components\ui\label.tsx

```tsx
"use client"

import * as React from "react"
import * as LabelPrimitive from "@radix-ui/react-label"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const labelVariants = cva(
  "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
)

const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> &
    VariantProps<typeof labelVariants>
>(({ className, ...props }, ref) => (
  <LabelPrimitive.Root
    ref={ref}
    className={cn(labelVariants(), className)}
    {...props}
  />
))
Label.displayName = LabelPrimitive.Root.displayName

export { Label }

```

# components\ui\scroll-area.tsx

```tsx
"use client"

import * as React from "react"
import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area"

import { cn } from "@/lib/utils"

const ScrollArea = React.forwardRef<
  React.ElementRef<typeof ScrollAreaPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.Root>
>(({ className, children, ...props }, ref) => (
  <ScrollAreaPrimitive.Root
    ref={ref}
    className={cn("relative overflow-hidden", className)}
    {...props}
  >
    <ScrollAreaPrimitive.Viewport className="h-full w-full rounded-[inherit]">
      {children}
    </ScrollAreaPrimitive.Viewport>
    <ScrollBar />
    <ScrollAreaPrimitive.Corner />
  </ScrollAreaPrimitive.Root>
))
ScrollArea.displayName = ScrollAreaPrimitive.Root.displayName

const ScrollBar = React.forwardRef<
  React.ElementRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>,
  React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>
>(({ className, orientation = "vertical", ...props }, ref) => (
  <ScrollAreaPrimitive.ScrollAreaScrollbar
    ref={ref}
    orientation={orientation}
    className={cn(
      "flex touch-none select-none transition-colors",
      orientation === "vertical" &&
        "h-full w-2.5 border-l border-l-transparent p-[1px]",
      orientation === "horizontal" &&
        "h-2.5 flex-col border-t border-t-transparent p-[1px]",
      className
    )}
    {...props}
  >
    <ScrollAreaPrimitive.ScrollAreaThumb className="relative flex-1 rounded-full bg-border" />
  </ScrollAreaPrimitive.ScrollAreaScrollbar>
))
ScrollBar.displayName = ScrollAreaPrimitive.ScrollAreaScrollbar.displayName

export { ScrollArea, ScrollBar }

```

# components\ui\select.tsx

```tsx
"use client"

import * as React from "react"
import * as SelectPrimitive from "@radix-ui/react-select"
import { Check, ChevronDown, ChevronUp } from "lucide-react"

import { cn } from "@/lib/utils"

const Select = SelectPrimitive.Root

const SelectGroup = SelectPrimitive.Group

const SelectValue = SelectPrimitive.Value

const SelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Trigger
    ref={ref}
    className={cn(
      "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1",
      className
    )}
    {...props}
  >
    {children}
    <SelectPrimitive.Icon asChild>
      <ChevronDown className="h-4 w-4 opacity-50" />
    </SelectPrimitive.Icon>
  </SelectPrimitive.Trigger>
))
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName

const SelectScrollUpButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollUpButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollUpButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollUpButton
    ref={ref}
    className={cn(
      "flex cursor-default items-center justify-center py-1",
      className
    )}
    {...props}
  >
    <ChevronUp className="h-4 w-4" />
  </SelectPrimitive.ScrollUpButton>
))
SelectScrollUpButton.displayName = SelectPrimitive.ScrollUpButton.displayName

const SelectScrollDownButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollDownButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollDownButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollDownButton
    ref={ref}
    className={cn(
      "flex cursor-default items-center justify-center py-1",
      className
    )}
    {...props}
  >
    <ChevronDown className="h-4 w-4" />
  </SelectPrimitive.ScrollDownButton>
))
SelectScrollDownButton.displayName =
  SelectPrimitive.ScrollDownButton.displayName

const SelectContent = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
>(({ className, children, position = "popper", ...props }, ref) => (
  <SelectPrimitive.Portal>
    <SelectPrimitive.Content
      ref={ref}
      className={cn(
        "relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
        position === "popper" &&
          "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
        className
      )}
      position={position}
      {...props}
    >
      <SelectScrollUpButton />
      <SelectPrimitive.Viewport
        className={cn(
          "p-1",
          position === "popper" &&
            "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]"
        )}
      >
        {children}
      </SelectPrimitive.Viewport>
      <SelectScrollDownButton />
    </SelectPrimitive.Content>
  </SelectPrimitive.Portal>
))
SelectContent.displayName = SelectPrimitive.Content.displayName

const SelectLabel = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Label
    ref={ref}
    className={cn("py-1.5 pl-8 pr-2 text-sm font-semibold", className)}
    {...props}
  />
))
SelectLabel.displayName = SelectPrimitive.Label.displayName

const SelectItem = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    className={cn(
      "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    )}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <SelectPrimitive.ItemIndicator>
        <Check className="h-4 w-4" />
      </SelectPrimitive.ItemIndicator>
    </span>

    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
  </SelectPrimitive.Item>
))
SelectItem.displayName = SelectPrimitive.Item.displayName

const SelectSeparator = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Separator
    ref={ref}
    className={cn("-mx-1 my-1 h-px bg-muted", className)}
    {...props}
  />
))
SelectSeparator.displayName = SelectPrimitive.Separator.displayName

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton,
}

```

# components\ui\textarea.tsx

```tsx
import * as React from "react"

import { cn } from "@/lib/utils"

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea }

```

# hooks\use-clans.ts

```ts
import { useState } from 'react';
import { type Clan, type ClanFormData, type FilterState } from '@/lib/types';

interface ClansData {
  clans: Clan[];
  totalCount: number;
}

export function useClans() {
  const [isLoading, setIsLoading] = useState(false);
  const [clans, setClans] = useState<Clan[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const setInitialState = (data: ClansData) => {
    setClans(data.clans);
    setTotalCount(data.totalCount);
  };

  const fetchClans = async (filters: FilterState) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const searchParams = new URLSearchParams({
        search: filters.search,
        location: filters.location,
        language: filters.language,
        page: filters.page.toString(),
        limit: '9'
      });

      const response = await fetch(`/api/clans?${searchParams}`);
      if (!response.ok) throw new Error('Failed to fetch clans');
      
      const data = await response.json();
      setClans(data.clans);
      setTotalCount(data.totalCount);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const addClan = async (clanData: ClanFormData) => {
    setError(null);
    
    try {
      // Ensure all tags are lowercase
      const formattedData = {
        ...clanData,
        tags: clanData.tags.map(tag => tag.toLowerCase()),
        imageUrl: clanData.imageUrl || null // Convert empty string to null
      };

      const response = await fetch('/api/clans', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formattedData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create clan');
      }

      const newClan = await response.json();
      setClans(prev => [newClan, ...prev]);
      setTotalCount(prev => prev + 1);
    } catch (err) {
      console.error('Error adding clan:', err);
      setError(err instanceof Error ? err.message : 'Failed to add clan');
      throw err;
    }
  };

  return {
    clans,
    totalCount,
    isLoading,
    error,
    fetchClans,
    addClan,
    setInitialState,
  };
}
```

# lib\actions.ts

```ts
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
```

# lib\constants.ts

```ts
export const tagOptions = [
    { label: "PvE", value: "pve" },
    { label: "PvP", value: "pvp" },
    { label: "Casual", value: "casual" },
    { label: "Competitive", value: "competitive" },
    { label: "Roleplay", value: "roleplay" },
    { label: "Trading", value: "trading" },
    { label: "Crafting", value: "crafting" },
  ] as const;
  
  export const locationOptions = [
    { label: "Europe/Africa", value: "Europe/Africa" },
    { label: "Americas", value: "Americas" },
    { label: "Asia/Oceania", value: "Asia/Oceania" },
    { label: "Worldwide", value: "Worldwide" },
  ] as const;
  
  export const languageOptions = [
    { label: "English", value: "English" },
    { label: "French", value: "French" },
    { label: "German", value: "German" },
    { label: "Spanish", value: "Spanish" },
  ] as const;
```

# lib\prisma.ts

```ts
import { PrismaClient } from '@prisma/client'

const prismaClientSingleton = () => {
  return new PrismaClient()
}

declare global {
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>
}

const prisma = globalThis.prisma ?? prismaClientSingleton()

export default prisma

if (process.env.NODE_ENV !== 'production') globalThis.prisma = prisma
```

# lib\types.ts

```ts
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
  search: string;
  location: string;
  language: string;
  page: number;
};
```

# lib\utils.ts

```ts
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

```

# next-env.d.ts

```ts
/// <reference types="next" />
/// <reference types="next/image-types/global" />

// NOTE: This file should not be edited
// see https://nextjs.org/docs/app/building-your-application/configuring/typescript for more information.

```

# next.config.mjs

```mjs
/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
      remotePatterns: [
        {
          protocol: 'https',
          hostname: 'i.imgur.com',
        },
        {
          protocol: 'https',
          hostname: 'imgur.com',
        },
        // Add other image hosting services as needed
      ],
    },
  };
  
  export default nextConfig;
```

# package.json

```json
{
  "name": "paxdeiclans",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "@icons-pack/react-simple-icons": "^10.1.0",
    "@prisma/client": "^5.21.1",
    "@radix-ui/react-checkbox": "^1.1.2",
    "@radix-ui/react-dialog": "^1.1.2",
    "@radix-ui/react-label": "^2.1.0",
    "@radix-ui/react-scroll-area": "^1.2.0",
    "@radix-ui/react-select": "^2.1.2",
    "@radix-ui/react-slot": "^1.1.0",
    "@vercel/postgres": "^0.10.0",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.1",
    "lucide-react": "^0.454.0",
    "next": "14.2.16",
    "prisma": "^5.21.1",
    "react": "^18",
    "react-dom": "^18",
    "simple-icons": "^13.16.0",
    "tailwind-merge": "^2.5.4",
    "tailwindcss-animate": "^1.0.7",
    "zod": "^3.23.8"
  },
  "devDependencies": {
    "@types/node": "^20",
    "@types/react": "^18",
    "@types/react-dom": "^18",
    "eslint": "^8",
    "eslint-config-next": "14.2.16",
    "postcss": "^8",
    "tailwindcss": "^3.4.1",
    "typescript": "^5"
  }
}

```

# postcss.config.mjs

```mjs
/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    tailwindcss: {},
  },
};

export default config;

```

# prisma\schema.prisma

```prisma
// This is your Prisma schema file,
// learn more about it in the docs: https://pris.ly/d/prisma-schema

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("POSTGRES_PRISMA_URL") // uses connection pooling
  directUrl = env("POSTGRES_URL_NON_POOLING") // uses a direct connection
}

enum ClanTag {
  pve
  pvp
  casual
  competitive
  roleplay
  trading
  crafting
}

enum ClanLocation {
  Europe_Africa @map("Europe/Africa")
  Americas
  Asia_Oceania @map("Asia/Oceania")
  Worldwide
}

enum ClanLanguage {
  English
  French
  German
  Spanish
}

model Clan {
  id          Int          @id @default(autoincrement())
  name        String       @db.VarChar(100)
  imageUrl    String?      @map("image_url")
  description String
  tags        ClanTag[]
  location    ClanLocation
  language    ClanLanguage
  discordUrl  String       @map("discord_url")
  createdAt   DateTime     @default(now()) @map("created_at")
  updatedAt   DateTime     @updatedAt @map("updated_at")

  @@index([name])
  @@map("clans")
}
```

# public\images\clan-placeholder.png

# tailwind.config.ts

```ts
import type { Config } from "tailwindcss";

const config: Config = {
    darkMode: ["class"],
    content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
  	extend: {
  		colors: {
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			}
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;

```

# tsconfig.json

```json
{
  "compilerOptions": {
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}

```

