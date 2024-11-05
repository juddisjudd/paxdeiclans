import { type Clan } from "@/lib/types";
import { ClanCard } from "./clan-card";

interface ClanGridProps {
  clans: Clan[];
  onBumpSuccess?: () => void;
}

export function ClanGrid({ clans, onBumpSuccess }: ClanGridProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {clans.map((clan) => (
        <ClanCard key={clan.id} clan={clan} onBumpSuccess={onBumpSuccess} />
      ))}
    </div>
  );
}
