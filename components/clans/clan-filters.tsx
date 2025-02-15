import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { tagOptions, locationOptions } from "@/lib/constants";
import { type FilterState } from "@/lib/types";
import { X } from "lucide-react";
import { LanguageSelect } from "./language-select";
import { ClanDialog } from "./clan-dialog";
import { type ClanFormData } from "@/lib/types";
import { useSession } from "next-auth/react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "../ui/button";

interface ClanFiltersProps {
  filters: FilterState;
  onFilterChange: (key: keyof FilterState, value: string) => void;
  onTagToggle: (tag: string) => void;
  selectedTags: string[];
  onClanAdd: (clan: ClanFormData) => Promise<void>;
  onClearFilters: () => void;
}

export function ClanFilters({
  filters,
  onFilterChange,
  onTagToggle,
  selectedTags,
  onClanAdd,
  onClearFilters,
}: ClanFiltersProps) {
  const { toast } = useToast();
  const { data: session } = useSession();

  const handleAddClanClick = () => {
    if (!session) {
      toast({
        title: "Authentication Required",
        description: "You must be logged in to add a clan",
        variant: "destructive",
      });
      return;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 justify-center">
      {tagOptions.map((tag) => (
        <Badge
        key={tag.value}
        variant="outline"
        className={`cursor-pointer px-3 py-1.5 rounded-full text-sm border ${
          selectedTags.includes(tag.value)
          ? "bg-[#B39164] hover:bg-[#B39164]/90 text-white border-[#B39164]"
          : "hover:bg-[#B39164] hover:text-white border-[#B39164] text-[#6B5D4E]"
        }`}
        title={tag.description}
        onClick={() => onTagToggle(tag.value)}
        >
        {tag.label}
        </Badge>
      ))}
      </div>

      <div className="flex gap-4 items-start">
        <div className="grid md:grid-cols-2 gap-4 flex-grow">
          <div>
            <Select
              value={filters.location}
              onValueChange={(value) => onFilterChange("location", value)}
            >
              <SelectTrigger className="bg-white border-[#B3955D] rounded-full">
                <SelectValue placeholder="All Locations" />
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
          </div>

          <div className="flex gap-4">
            <div className="flex-grow">
              <LanguageSelect
                value={filters.language}
                onChange={(value) => onFilterChange("language", value)}
              />
            </div>
            <div>
              {session ? (
                <ClanDialog mode="add" onClanSubmit={onClanAdd} />
              ) : (
                <Button
                  onClick={handleAddClanClick}
                  className="bg-[#B3955D] hover:bg-[#8C714A] text-white rounded-full"
                >
                  Add Clan
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {(filters.tags.length > 0 ||
        filters.location !== "all" ||
        filters.language !== "all") && (
        <div className="flex items-center justify-end">
          <button
            onClick={onClearFilters}
            className="text-sm text-[#B3955D] hover:text-[#8C714A] flex items-center gap-1"
          >
            <X className="h-4 w-4" />
            Clear all filters
          </button>
        </div>
      )}
    </div>
  );
}