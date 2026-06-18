export const APP_TIMEZONE =
  process.env.APP_TIMEZONE?.trim() || "America/Los_Angeles";

const dateFormatter = new Intl.DateTimeFormat("zh-CN", {
  timeZone: APP_TIMEZONE,
  month: "long",
  day: "numeric",
  weekday: "short",
});

const dateTimeFormatter = new Intl.DateTimeFormat("zh-CN", {
  timeZone: APP_TIMEZONE,
  month: "short",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

const dateKeyFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: APP_TIMEZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

export function toDate(value?: string | null): Date | null {
  if (!value) {
    return null;
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function getLocalDateKey(value?: string | null, fallback?: string): string {
  const date = toDate(value);
  if (!date) {
    return fallback ?? dateKeyFormatter.format(new Date());
  }

  return dateKeyFormatter.format(date);
}

export function formatLocalDate(value?: string | null): string {
  const date = toDate(value);
  if (!date) {
    return "日期未知";
  }

  return dateFormatter.format(date);
}

export function formatLocalDateTime(value?: string | null): string {
  const date = toDate(value);
  if (!date) {
    return "时间未知";
  }

  return dateTimeFormatter.format(date);
}

export function formatDateKey(dateKey?: string | null): string {
  if (!dateKey) {
    return "日期未知";
  }

  const date = toDate(`${dateKey}T12:00:00Z`);
  return date ? dateFormatter.format(date) : dateKey;
}

export function getLocalWeekRange(now = new Date()): {
  startKey: string;
  endKey: string;
} {
  const currentKey = dateKeyFormatter.format(now);
  const [year, month, day] = currentKey.split("-").map(Number);
  const currentUtcNoon = new Date(Date.UTC(year, month - 1, day, 12));
  const dayOfWeek = currentUtcNoon.getUTCDay();
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const start = new Date(currentUtcNoon);
  start.setUTCDate(currentUtcNoon.getUTCDate() + mondayOffset);
  const end = new Date(start);
  end.setUTCDate(start.getUTCDate() + 6);

  return {
    startKey: dateKeyFormatter.format(start),
    endKey: dateKeyFormatter.format(end),
  };
}
