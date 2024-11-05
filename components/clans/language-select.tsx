import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from "@/components/ui/select";
  import { languageOptions } from "@/lib/constants";
  
  interface LanguageSelectProps {
    value: string;
    onChange: (value: string) => void;
  }
  
  export function LanguageSelect({ value, onChange }: LanguageSelectProps) {
    return (
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="bg-white border-[#B3955D]">
          <SelectValue placeholder="Select language..." />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Languages</SelectItem>
          {languageOptions.map((language) => (
            <SelectItem key={language.value} value={language.value}>
              {language.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }