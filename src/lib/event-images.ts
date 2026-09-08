import workshop from "@/assets/event-workshop.jpg";
import hackathon from "@/assets/event-hackathon.jpg";
import drive from "@/assets/event-drive.jpg";
import music from "@/assets/event-music.jpg";
import social from "@/assets/event-social.jpg";

const byCategory: Record<string, string> = {
  workshop,
  hackathon,
  drive,
  music,
  social,
  competition: workshop,
  project: hackathon,
  general: social,
};

export function coverFor(category: string | null | undefined, explicit?: string | null) {
  if (explicit) return explicit;
  return byCategory[(category ?? "general").toLowerCase()] ?? social;
}

export const accentFor = (category: string | null | undefined) => {
  switch ((category ?? "general").toLowerCase()) {
    case "hackathon":
    case "project":
      return "sky";
    case "drive":
    case "competition":
      return "rose";
    case "music":
    case "social":
      return "jade";
    default:
      return "saffron";
  }
};
