export const tagOptions = [
  {
    label: "PvE",
    value: "pve",
    description: "Player versus Environment focused",
  },
  { label: "PvP", value: "pvp", description: "Player versus Player focused" },
  { label: "PvX", value: "pvx", description: "Both PvE and PvP focused" },
  {
    label: "Crafting",
    value: "crafting",
    description: "Focused on crafting and resource gathering",
  },
  { label: "Casual", value: "casual", description: "Relaxed, casual gameplay" },
  {
    label: "Hardcore",
    value: "hardcore",
    description: "Dedicated, serious gameplay",
  },
  {
    label: "Roleplay",
    value: "roleplay",
    description: "In-character roleplay focused",
  },
  {
    label: "Trading",
    value: "trading",
    description: "Trading and economy focused",
  },
] as const;

export const locationOptions = [
  { label: "Europe/Africa", value: "Europe/Africa" },
  { label: "Americas", value: "Americas" },
  { label: "Asia/Oceania", value: "Asia/Oceania" },
  { label: "Worldwide", value: "Worldwide" },
] as const;

export const languageOptions = [
  { label: "Multilingual", value: "Multilingual" },
  { label: "English", value: "English" },
  { label: "Spanish", value: "Spanish" },
  { label: "French", value: "French" },
  { label: "German", value: "German" },
  { label: "Portuguese", value: "Portuguese" },
  { label: "Russian", value: "Russian" },
  { label: "Korean", value: "Korean" },
  { label: "Japanese", value: "Japanese" },
  { label: "Chinese (Simplified)", value: "Chinese (Simplified)" },
  { label: "Chinese (Traditional)", value: "Chinese (Traditional)" },
  { label: "Turkish", value: "Turkish" },
  { label: "Polish", value: "Polish" },
  { label: "Italian", value: "Italian" },
  { label: "Thai", value: "Thai" },
  { label: "Vietnamese", value: "Vietnamese" },
  { label: "Indonesian", value: "Indonesian" },
  { label: "Dutch", value: "Dutch" },
  { label: "Arabic", value: "Arabic" },
  { label: "Swedish", value: "Swedish" },
  { label: "Norwegian", value: "Norwegian" },
  { label: "Danish", value: "Danish" },
  { label: "Finnish", value: "Finnish" },
  { label: "Czech", value: "Czech" },
  { label: "Hungarian", value: "Hungarian" },
  { label: "Romanian", value: "Romanian" },
].sort((a, b) => {
  if (a.value === "Multilingual") return -1;
  if (b.value === "Multilingual") return 1;
  return a.label.localeCompare(b.label);
});
