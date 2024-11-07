"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSession, signIn, signOut } from "next-auth/react";
import { SiDiscord } from "@icons-pack/react-simple-icons";
import { User } from "lucide-react";
import Image from "next/image";

export function UserMenu() {
  const { data: session } = useSession();

  if (!session) {
    return (
      <Button
        onClick={() => signIn("discord")}
        className="bg-[#b3955d] hover:bg-[#d19544] text-white"
      >
        <SiDiscord className="h-4 w-4" />
        Login with Discord
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          {session.user?.image ? (
            <Image
              src={session.user.image}
              alt={session.user.name ?? ""}
              fill
              className="rounded-full"
            />
          ) : (
            <User className="h-4 w-4" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => signOut()}>Log out</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
