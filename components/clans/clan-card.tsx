import { useState } from "react";
import { useSession } from "next-auth/react";
import { SiDiscord } from "@icons-pack/react-simple-icons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { ArrowUp, Loader2, Edit } from "lucide-react";
import Image from "next/image";
import { TimeDisplay } from "./time-display";
import { useToast } from "@/hooks/use-toast";
import { ClanDialog } from "./clan-dialog";
import { type Clan, type ClanFormData } from "@/lib/types";

interface ClanCardProps {
  clan: Clan;
  priority?: boolean;
  onBumpSuccess?: () => void;
}

export function ClanCard({
  clan,
  priority = false,
  onBumpSuccess,
}: ClanCardProps) {
  const { data: session } = useSession();
  const isOwner = session?.user?.id === clan.ownerId;
  const [isBumping, setIsBumping] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [optimisticLastBumped, setOptimisticLastBumped] = useState<Date | null>(
    null
  );
  const [imageError, setImageError] = useState(false);
  const { toast } = useToast();

  const handleImageError = async () => {
    setImageError(true);

    if (clan.imageUrl) {
      try {
        const response = await fetch(`/api/clans/${clan.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            imageUrl: null,
          }),
        });

        if (!response.ok) {
          console.error("Failed to update clan with broken image");
        }
      } catch (error) {
        console.error("Error updating clan with broken image:", error);
      }
    }
  };

  const handleBump = async () => {
    if (isBumping) return;

    setIsBumping(true);
    setOptimisticLastBumped(new Date());

    try {
      const response = await fetch(`/api/clans/${clan.id}/bump`, {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok) {
        setOptimisticLastBumped(null);

        if (response.status === 429) {
          toast({
            title: "Cannot Bump Yet",
            description: `Please wait ${data.hoursRemaining} more hours before bumping again`,
            variant: "destructive",
          });
        } else {
          toast({
            title: "Error",
            description: data.error || "Failed to bump clan",
            variant: "destructive",
          });
        }
        return;
      }

      if (onBumpSuccess) {
        onBumpSuccess();
      }

      toast({
        title: "Success!",
        description: "Clan bumped to the top",
        duration: 2000,
      });
    } catch (error) {
      setOptimisticLastBumped(null);
      toast({
        title: "Error",
        description: "Failed to bump clan",
        variant: "destructive",
      });
    } finally {
      setIsBumping(false);
    }
  };

  const handleDiscordJoin = () => {
    window.open(clan.discordUrl, "_blank");
  };

  const handleEditClan = async (clanData: ClanFormData) => {
    try {
      const updateData = {
        name: clanData.name,
        imageUrl: clanData.imageUrl || null,
        description: clanData.description,
        tags: clanData.tags,
        location: clanData.location.replace("/", "_"),
        language: clanData.language,
        discordUrl: clanData.discordUrl,
      };

      const response = await fetch(`/api/clans/${clan.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update clan");
      }

      onBumpSuccess?.();
      return Promise.resolve();
    } catch (error) {
      console.error("Failed to update clan:", error);
      throw error;
    }
  };

  const effectiveLastBumpedAt =
    optimisticLastBumped || new Date(clan.lastBumpedAt);
  const canBump =
    Date.now() - effectiveLastBumpedAt.getTime() >= 24 * 60 * 60 * 1000;

  return (
    <>
      <Card className="relative overflow-hidden border-[#B3955D] bg-white flex flex-col h-[500px]">
        {/* Decorative corners */}
        <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-[#B3955D]" />
        <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-[#B3955D]" />
        <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-[#B3955D]" />
        <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-[#B3955D]" />

        {/* Image Section */}
        <div className="relative h-48 flex-shrink-0">
          <Image
            src={
              !imageError
                ? clan.imageUrl || "/images/clan-placeholder.png"
                : "/images/clan-placeholder.png"
            }
            alt={clan.name}
            fill
            className="object-cover"
            priority={priority}
            loading={priority ? "eager" : "lazy"}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            onError={handleImageError}
          />
          <div className="absolute bottom-2 left-2">
            {isOwner && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditDialogOpen(true)}
                className="p-1 h-6 text-red-400 hover:text-red-300 transition-colors duration-200"
                title="Edit clan"
              >
                <Edit className="h-4 w-4" />
              </Button>
            )}
          </div>
          <div className="absolute bottom-2 right-2 bg-black/50 px-2 py-1 rounded text-xs text-white flex items-center gap-2">
            <TimeDisplay date={effectiveLastBumpedAt} />
            <Button
              variant="ghost"
              size="sm"
              className={`p-1 h-6 ${
                canBump
                  ? "text-green-400 hover:text-green-300"
                  : isBumping
                  ? "text-blue-400"
                  : "text-gray-400"
              } transition-colors duration-200`}
              onClick={handleBump}
              disabled={!canBump || isBumping}
              title={
                canBump ? "Bump clan to top" : "Wait 24 hours between bumps"
              }
            >
              {isBumping ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ArrowUp
                  className={`h-4 w-4 ${isBumping ? "animate-bounce" : ""}`}
                />
              )}
            </Button>
          </div>
        </div>

        {/* Content Section */}
        <div className="flex flex-col flex-1">
          <CardHeader className="py-2 space-y-2">
            <h2 className="text-xl font-serif text-[#4A3D2C] text-center">
              {clan.name}
            </h2>
            <div className="flex gap-1.5 justify-center">
              {clan.tags.slice(0, 5).map((tag) => (
                <Badge
                  key={tag}
                  variant="outline"
                  className="bg-[#B3955D]/10 text-[#4A3D2C] border-[#B3955D] px-2 py-0.5 text-xs"
                >
                  {tag.toLowerCase()}
                </Badge>
              ))}
            </div>
          </CardHeader>

          <CardContent className="pb-0 flex flex-col flex-1">
            <div className="flex flex-col h-[100px]">
              <p className="text-[#6B5C45] text-sm line-clamp-4">
                {clan.description}
              </p>
            </div>

            <div className="flex justify-between text-sm text-[#4A3D2C] py-1.5 border-t border-[#B3955D]/20">
              <div className="flex items-center">
                <span className="font-semibold">Location:</span>{" "}
                {clan.location.replace("_", "/")}
              </div>
              <div className="flex items-center gap-1">
                <span className="font-semibold">Language:</span>
                <span className="max-w-[80px] truncate" title={clan.language}>
                  {clan.language}
                </span>
              </div>
            </div>
          </CardContent>

          <CardFooter className="py-2 flex flex-col gap-1">
            <Button
              className="w-full bg-[#B3955D] hover:bg-[#8C714A] text-white"
              onClick={handleDiscordJoin}
            >
              <SiDiscord className="w-4 h-4 mr-2" />
              Join Discord
            </Button>
            <div className="text-xs text-center space-y-0.5 min-h-[32px]">
              {clan.discordMembers !== null || clan.discordOnline !== null ? (
                <>
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
                </>
              ) : (
                <div className="text-muted-foreground">&nbsp;</div>
              )}
            </div>
          </CardFooter>
        </div>
      </Card>

      {isOwner && (
        <ClanDialog
          mode="edit"
          clan={clan}
          onClanSubmit={handleEditClan}
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
        />
      )}
    </>
  );
}
