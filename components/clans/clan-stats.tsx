import React from "react";
import { Users } from "lucide-react";

const ClanStats = ({ totalClans }: { totalClans: number }) => {
  return (
    <div className="text-center mb-4">
      <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#B3955D]/10 rounded-full border border-[#B3955D]/20">
        <Users className="w-4 h-4 text-[#B3955D]" />
        <div className="text-[#6B5D4E] font-medium">
          {totalClans.toLocaleString()} {totalClans === 1 ? "Clan" : "Clans"}{" "}
          Listed
        </div>
      </div>
    </div>
  );
};

export default ClanStats;
