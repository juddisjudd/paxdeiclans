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
import { CharacterCounter } from "../ui/character-counter";
import { cn } from "@/lib/utils";

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
            <div className="relative">
              <Textarea
                id="clanDescription"
                value={formData.description}
                onChange={(e) => {
                  const newValue = e.target.value;
                  if (newValue.length <= 200) {
                    setFormData({ ...formData, description: newValue });
                    if (errors.description) {
                      setErrors(prev => ({ ...prev, description: undefined }));
                    }
                  }
                }}
                className={cn(
                  errors.description ? "border-red-500" : "",
                  formData.description.length >= 200 ? "border-red-500" : ""
                )}
                maxLength={200}
              />
              <div className="absolute right-0 -bottom-6">
                <CharacterCounter 
                  current={formData.description.length} 
                  max={200} 
                />
              </div>
            </div>
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
                {languageOptions.map((option: { value: string; label: string }) => (
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