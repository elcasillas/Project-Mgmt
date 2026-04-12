export type StatusTone = {
  background: string;
  foreground: string;
};

const FALLBACK_TONE: StatusTone = {
  background: "#e8e8ed",
  foreground: "#4b4b52"
};

const STATUS_TONES: Record<string, StatusTone> = {
  Active: { background: "#e8f3ff", foreground: "#0066cc" },
  Planning: { background: "#e8e8ed", foreground: "#4b4b52" },
  "On Hold": { background: "#fff1d6", foreground: "#9b6500" },
  Completed: { background: "#e7f5ea", foreground: "#0f7a2a" },
  Cancelled: { background: "#ffe8eb", foreground: "#b00020" },
  "Not Started": { background: "#e8e8ed", foreground: "#4b4b52" },
  "In Progress": { background: "#e8f3ff", foreground: "#0066cc" },
  Blocked: { background: "#ffe8eb", foreground: "#b00020" },
  "In Review": { background: "#edf1ff", foreground: "#4455c7" },
  Done: { background: "#e7f5ea", foreground: "#0f7a2a" },
  Low: { background: "#e8e8ed", foreground: "#4b4b52" },
  Medium: { background: "#fff1d6", foreground: "#9b6500" },
  High: { background: "#ffe8d5", foreground: "#b65a00" },
  Critical: { background: "#ffe8eb", foreground: "#b00020" },
  Urgent: { background: "#ffe8eb", foreground: "#b00020" },
  Admin: { background: "#e8f3ff", foreground: "#0066cc" },
  "Project Manager": { background: "#e7f5ea", foreground: "#0f7a2a" },
  "Team Member": { background: "#e8e8ed", foreground: "#4b4b52" },
  Viewer: { background: "#edf1ff", foreground: "#4455c7" },
  Inactive: { background: "#dddddf", foreground: "#636366" },
  Pending: { background: "#fff1d6", foreground: "#9b6500" }
};

function clampChannel(value: number) {
  return Math.max(0, Math.min(255, Math.round(value)));
}

function hexToRgb(hex: string) {
  const normalized = hex.replace("#", "");
  const safeHex = normalized.length === 3 ? normalized.split("").map((char) => `${char}${char}`).join("") : normalized;

  return {
    r: Number.parseInt(safeHex.slice(0, 2), 16),
    g: Number.parseInt(safeHex.slice(2, 4), 16),
    b: Number.parseInt(safeHex.slice(4, 6), 16)
  };
}

function rgbToHex(red: number, green: number, blue: number) {
  return `#${[red, green, blue]
    .map((channel) => clampChannel(channel).toString(16).padStart(2, "0"))
    .join("")}`;
}

function getRelativeLuminance(channel: number) {
  const normalized = channel / 255;
  return normalized <= 0.03928 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4;
}

export function getStatusTone(value: string) {
  return STATUS_TONES[value] ?? FALLBACK_TONE;
}

export function isLightColor(hex: string) {
  const { r, g, b } = hexToRgb(hex);
  const luminance =
    0.2126 * getRelativeLuminance(r) +
    0.7152 * getRelativeLuminance(g) +
    0.0722 * getRelativeLuminance(b);

  return luminance > 0.7;
}

export function getContrastTextColor(hex: string) {
  return isLightColor(hex) ? "#111827" : "#ffffff";
}

export function darkenColor(hex: string, amount = 0.08) {
  const { r, g, b } = hexToRgb(hex);
  const multiplier = 1 - amount;

  return rgbToHex(r * multiplier, g * multiplier, b * multiplier);
}
