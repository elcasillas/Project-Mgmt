import { format, formatDistanceToNowStrict, isAfter, isBefore, isThisWeek } from "date-fns";

export function formatDate(value?: string | null) {
  if (!value) {
    return "Not set";
  }

  return format(new Date(value), "MMM d, yyyy");
}

export function formatRelative(value?: string | null) {
  if (!value) {
    return "just now";
  }

  return formatDistanceToNowStrict(new Date(value), { addSuffix: true });
}

export function isOverdue(date?: string | null, completed?: boolean) {
  if (!date || completed) {
    return false;
  }

  return isBefore(new Date(date), new Date());
}

export function isDueThisWeek(date?: string | null) {
  if (!date) {
    return false;
  }

  return isThisWeek(new Date(date), { weekStartsOn: 1 });
}

export function isApproaching(date?: string | null) {
  if (!date) {
    return false;
  }

  const target = new Date(date);
  const soon = new Date();
  soon.setDate(soon.getDate() + 7);
  return isAfter(target, new Date()) && isBefore(target, soon);
}
