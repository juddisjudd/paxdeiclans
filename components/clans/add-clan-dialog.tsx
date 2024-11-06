import { useEffect, useState } from "react";
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
import { AlertCircle, Link, Loader2 } from "lucide-react";
import { CharacterCounter } from "../ui/character-counter";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { isValidImageUrl, checkImageLoads } from "@/lib/validations";
import Image from "next/image";

const MAX_TAGS = 5;

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

const RequiredLabel: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => (
  <span className="flex items-center gap-1">
    {children}
    <span className="text-red-500" title="Required field">
      *
    </span>
  </span>
);

export function AddClanDialog({ onClanAdd }: AddClanDialogProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<ClanFormData>(defaultClanData);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isCheckingImage, setIsCheckingImage] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<
    Partial<Record<keyof ClanFormData, string>>
  >({});
  const { toast } = useToast();

  const resetForm = () => {
    setFormData(defaultClanData);
    setErrors({});
    setImagePreview(null);
  };

  useEffect(() => {
    if (!formData.imageUrl) {
      setImagePreview(null);
      return;
    }

    const timeoutId = setTimeout(async () => {
      const validationResult = isValidImageUrl(formData.imageUrl);

      if (!validationResult.isValid) {
        setErrors((prev) => ({
          ...prev,
          imageUrl: validationResult.error,
        }));
        setImagePreview(null);
        toast({
          title: "Invalid Image URL",
          description: validationResult.error,
          variant: "destructive",
        });
        return;
      }

      setIsCheckingImage(true);
      try {
        const imageLoads = await checkImageLoads(formData.imageUrl);

        if (!imageLoads) {
          throw new Error("Failed to load image");
        }

        setImagePreview(formData.imageUrl);
        setErrors((prev) => ({ ...prev, imageUrl: undefined }));
      } catch (error) {
        setErrors((prev) => ({
          ...prev,
          imageUrl: "Unable to load image from URL",
        }));
        setImagePreview(null);
        toast({
          title: "Image Load Error",
          description: "Unable to load image from the provided URL",
          variant: "destructive",
        });
      } finally {
        setIsCheckingImage(false);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [formData.imageUrl, toast]);

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof ClanFormData, string>> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Clan name is required";
    } else if (formData.name.length < 3) {
      newErrors.name = "Clan name must be at least 3 characters";
    } else if (formData.name.length > 100) {
      newErrors.name = "Clan name cannot exceed 100 characters";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    } else if (formData.description.length < 10) {
      newErrors.description = "Description must be at least 10 characters";
    } else if (formData.description.length > 200) {
      newErrors.description = "Description cannot exceed 200 characters";
    }

    if (formData.tags.length === 0) {
      newErrors.tags = "Select at least one tag";
    }

    if (!formData.location) {
      newErrors.location = "Location is required";
    }

    if (!formData.language) {
      newErrors.language = "Language is required";
    }

    if (!formData.discordUrl.trim()) {
      newErrors.discordUrl = "Discord invite link is required";
    } else if (!formData.discordUrl.trim().match(/^https:\/\/discord\.gg\//)) {
      newErrors.discordUrl = "Must be a valid Discord invite link";
    }

    if (formData.imageUrl && !formData.imageUrl.match(/^https?:\/\/.+/)) {
      newErrors.imageUrl = "Must be a valid URL";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      toast({
        title: "Validation Error",
        description: "Please check the form for errors",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      await onClanAdd(formData);
      toast({
        title: "Success!",
        description: "Your clan has been created successfully",
        duration: 3000,
      });
      resetForm();
      setOpen(false);
    } catch (error) {
      console.error("Failed to add clan:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to create clan",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseDialog = (isOpen: boolean) => {
    if (!isOpen && isSubmitting) {
      toast({
        title: "Warning",
        description: "Please wait while your clan is being created",
        variant: "destructive",
      });
      return;
    }

    setOpen(isOpen);
    if (!isOpen) {
      if (
        Object.keys(formData).some(
          (key) =>
            formData[key as keyof ClanFormData] !==
            defaultClanData[key as keyof ClanFormData]
        )
      ) {
        toast({
          title: "Form Reset",
          description: "Your form data has been cleared",
          duration: 2000,
        });
      }
      resetForm();
    }
  };

  const handleTagChange = (tag: string) => {
    setFormData((prev) => {
      if (prev.tags.includes(tag)) {
        return {
          ...prev,
          tags: prev.tags.filter((t) => t !== tag),
        };
      }

      if (prev.tags.length >= MAX_TAGS) {
        toast({
          title: "Tag Limit Reached",
          description: `You can only select up to ${MAX_TAGS} tags`,
          variant: "destructive",
        });
        return prev;
      }

      return {
        ...prev,
        tags: [...prev.tags, tag],
      };
    });

    if (errors.tags) {
      setErrors((prev) => ({ ...prev, tags: undefined }));
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
    <Dialog open={open} onOpenChange={handleCloseDialog}>
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
                  setErrors((prev) => ({ ...prev, name: undefined }));
                }
              }}
              className={errors.name ? "border-red-500" : ""}
            />
            <ErrorMessage error={errors.name} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="clanImage">Clan Image URL (Optional)</Label>
            <div className="relative">
              <Input
                id="clanImage"
                value={formData.imageUrl}
                onChange={(e) => {
                  const newUrl = e.target.value;
                  setFormData({ ...formData, imageUrl: newUrl });
                  if (!newUrl) {
                    setErrors((prev) => ({ ...prev, imageUrl: undefined }));
                    setImagePreview(null);
                  }
                }}
                placeholder="https://imgur.com/your-image.png"
                className={cn(
                  errors.imageUrl ? "border-red-500" : "",
                  isCheckingImage ? "pr-10" : ""
                )}
              />
              {isCheckingImage && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                </div>
              )}
            </div>
            <div className="text-sm space-y-1">
              <p className="text-muted-foreground flex items-center gap-1">
                <Link className="h-3 w-3" />
                Supported: Imgur, Discord, or GitHub image links
              </p>
              {imagePreview && (
                <div className="relative w-full h-32 mt-2 rounded-md overflow-hidden">
                  <Image
                    src={imagePreview}
                    alt="Preview"
                    fill
                    className="object-cover"
                  />
                </div>
              )}
            </div>
            <ErrorMessage error={errors.imageUrl} />
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
                      setErrors((prev) => ({
                        ...prev,
                        description: undefined,
                      }));
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
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm text-muted-foreground">
                <span>Select tags that best describe your clan</span>
                <span
                  className={
                    formData.tags.length >= MAX_TAGS ? "text-red-500" : ""
                  }
                >
                  {formData.tags.length}/{MAX_TAGS}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {tagOptions.map((tag) => {
                  const isSelected = formData.tags.includes(tag.value);
                  const atLimit = formData.tags.length >= MAX_TAGS;

                  return (
                    <div
                      key={tag.value}
                      className={cn(
                        "flex items-center space-x-2",
                        !isSelected && atLimit && "opacity-50"
                      )}
                    >
                      <Checkbox
                        id={`tag-${tag.value}`}
                        checked={isSelected}
                        onCheckedChange={() => handleTagChange(tag.value)}
                        disabled={!isSelected && atLimit}
                      />
                      <Label
                        htmlFor={`tag-${tag.value}`}
                        className={cn(
                          "cursor-pointer",
                          !isSelected && atLimit && "cursor-not-allowed"
                        )}
                      >
                        {tag.label}
                      </Label>
                    </div>
                  );
                })}
              </div>
              <ErrorMessage error={errors.tags} />
            </div>
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
                  setErrors((prev) => ({ ...prev, location: undefined }));
                }
              }}
            >
              <SelectTrigger
                className={errors.location ? "border-red-500" : ""}
              >
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
                  setErrors((prev) => ({ ...prev, language: undefined }));
                }
              }}
            >
              <SelectTrigger
                className={errors.language ? "border-red-500" : ""}
              >
                <SelectValue placeholder="Select language..." />
              </SelectTrigger>
              <SelectContent>
                {languageOptions.map(
                  (option: { value: string; label: string }) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  )
                )}
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
                  setErrors((prev) => ({ ...prev, discordUrl: undefined }));
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
            {isSubmitting ? "Adding..." : "Add Clan"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
