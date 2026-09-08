export function shortDate(value: string | null | undefined) {
  if (!value) return "";
  const d = new Date(value);
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

export function longDate(value: string | null | undefined) {
  if (!value) return "";
  const d = new Date(value);
  return d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });
}

export function timeAgo(value: string | null | undefined) {
  if (!value) return "";
  const diff = Date.now() - new Date(value).getTime();
  const mins = Math.round(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days}d ago`;
  return shortDate(value);
}

export function daysUntil(dateStr: string) {
  const target = new Date(dateStr);
  const today = new Date();
  target.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - today.getTime()) / 86400000);
}

export function countdownLabel(dateStr: string) {
  const d = daysUntil(dateStr);
  if (d < 0) return "COMPLETED";
  if (d === 0) return "TODAY";
  if (d === 1) return "STARTS TOMORROW";
  return `STARTS IN ${d} DAYS`;
}

export function initials(name: string | null | undefined) {
  if (!name) return "SE";
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}
