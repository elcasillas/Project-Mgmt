import { format } from "date-fns";

const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function padDatePart(value: number) {
  return String(value).padStart(2, "0");
}

export function normalizeTaskDate(value?: string | null) {
  if (!value) {
    return null;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  if (DATE_ONLY_PATTERN.test(trimmed)) {
    return trimmed;
  }

  const isoDateMatch = trimmed.match(/^(\d{4}-\d{2}-\d{2})[T\s]/);
  if (isoDateMatch) {
    return isoDateMatch[1];
  }

  const parsed = new Date(trimmed);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return `${parsed.getUTCFullYear()}-${padDatePart(parsed.getUTCMonth() + 1)}-${padDatePart(parsed.getUTCDate())}`;
}

export function formatTaskDate(value?: string | null, emptyState = "Not set") {
  const normalized = normalizeTaskDate(value);
  if (!normalized) {
    return emptyState;
  }

  return format(new Date(`${normalized}T12:00:00Z`), "MMM d, yyyy");
}

export function getTaskDateInputValue(value?: string | null) {
  return normalizeTaskDate(value) ?? "";
}

export function getTaskDateTimestamp(value?: string | null) {
  const normalized = normalizeTaskDate(value);
  if (!normalized) {
    return null;
  }

  return Date.parse(`${normalized}T00:00:00Z`);
}
