import { useState } from "react";
import { SiDiscord } from "@icons-pack/react-simple-icons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { ArrowUp } from "lucide-react";
import { type Clan } from "@/lib/types";
import Image from "next/image";
import { TimeDisplay } from "./time-display";

interface ClanCardProps {
  clan: Clan;
  onBumpSuccess?: () => void;
}

export function ClanCard({ clan, onBumpSuccess }: ClanCardProps) {
  const [bumpError, setBumpError] = useState<string | null>(null);
  const [isBumping, setIsBumping] = useState(false);

  const handleBump = async () => {
    if (isBumping) return;

    setIsBumping(true);
    setBumpError(null);

    try {
      const response = await fetch(`/api/clans/${clan.id}/bump`, {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 429) {
          setBumpError(`Can bump again in ${data.hoursRemaining} hours`);
        } else {
          setBumpError(data.error || "Failed to bump clan");
        }
        return;
      }

      if (onBumpSuccess) {
        onBumpSuccess();
      }
    } catch (error) {
      setBumpError("Failed to bump clan");
    } finally {
      setIsBumping(false);
    }
  };

  const canBump =
    Date.now() - new Date(clan.lastBumpedAt).getTime() >= 24 * 60 * 60 * 1000;

  return (
    <Card className="relative overflow-hidden border-[#B3955D] bg-white flex flex-col h-[500px]">
      {/* Decorative corners */}
      <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-[#B3955D]" />
      <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-[#B3955D]" />
      <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-[#B3955D]" />
      <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-[#B3955D]" />

      <div className="relative h-40">
        <Image
          src={clan.imageUrl || "/images/clan-placeholder.png"}
          alt={clan.name}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          priority={false}
        />
        <div className="absolute bottom-2 right-2 bg-black/50 px-2 py-1 rounded text-xs text-white flex items-center gap-2">
          <TimeDisplay date={clan.lastBumpedAt} />{" "}
          {/* Using lastBumpedAt instead of createdAt */}
          <Button
            variant="ghost"
            size="sm"
            className={`p-1 h-6 ${
              canBump ? "text-green-400 hover:text-green-300" : "text-gray-400"
            }`}
            onClick={handleBump}
            disabled={!canBump || isBumping}
            title={canBump ? "Bump clan to top" : "Wait 24 hours between bumps"}
          >
            <ArrowUp className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex flex-col flex-grow">
        <CardHeader className="pb-2">
          <h2 className="text-xl font-serif text-[#4A3D2C] text-center">
            {clan.name}
          </h2>
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
          {bumpError && (
            <p className="text-xs text-red-500 text-center mt-1">{bumpError}</p>
          )}
        </CardHeader>

        <CardContent className="pb-2 flex-grow">
          <div className="flex flex-col h-full">
            <p className="text-[#6B5C45] text-sm mb-4 line-clamp-4">
              {clan.description}
            </p>
            <div className="mt-auto space-y-1 text-sm">
              <p className="text-[#4A3D2C]">
                <span className="font-semibold">Location:</span>{" "}
                {clan.location.replace("_", "/")}
              </p>
              <p className="text-[#4A3D2C]">
                <span className="font-semibold">Language:</span> {clan.language}
              </p>
            </div>
          </div>
        </CardContent>

        <CardFooter className="pt-2 flex flex-col gap-1">
          <Button
            className="w-full bg-[#B3955D] hover:bg-[#8C714A] text-white"
            onClick={() => window.open(clan.discordUrl, "_blank")}
          >
            <SiDiscord className="w-4 h-4" />
            Join Discord
          </Button>
          {(clan.discordMembers !== null || clan.discordOnline !== null) && (
            <div className="text-xs text-center space-y-0.5">
              <div className="text-muted-foreground">
                {clan.discordMembers?.toLocaleString() ?? "?"} Server{" "}
                {clan.discordMembers === 1 ? "Member" : "Members"}
              </div>
              {clan.discordOnline !== null && (
                <div className="text-emerald-600 flex items-center justify-center gap-1">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  {clan.discordOnline.toLocaleString()} Online
                </div>
              )}
            </div>
          )}
        </CardFooter>
      </div>
    </Card>
  );
}
