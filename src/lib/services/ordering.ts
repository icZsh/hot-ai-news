import type { Prisma } from "@prisma/client";

/**
 * Newest-first ordering for external items.
 *
 * Postgres sorts NULLs first for DESC, so items without a publishedAt would
 * otherwise float to the top of every list. Keep them at the bottom instead.
 */
export const externalItemRecencyOrder = [
  { publishedAt: { sort: "desc", nulls: "last" } },
  { fetchedAt: "desc" },
] satisfies Prisma.ExternalItemOrderByWithRelationInput[];

/**
 * Newest-first ordering for daily reports; reports without generatedAt last.
 */
export const dailyReportRecencyOrder = [
  { localDate: "desc" },
  { generatedAt: { sort: "desc", nulls: "last" } },
] satisfies Prisma.DailyReportOrderByWithRelationInput[];

/**
 * Latest fetchedAt across rows (rows are not necessarily sorted by fetchedAt).
 */
export function latestFetchedAt(
  rows: ReadonlyArray<{ fetchedAt: Date }>,
  fallback: Date = new Date(),
): string {
  if (rows.length === 0) {
    return fallback.toISOString();
  }

  let latest = rows[0].fetchedAt;
  for (const row of rows) {
    if (row.fetchedAt.getTime() > latest.getTime()) {
      latest = row.fetchedAt;
    }
  }

  return latest.toISOString();
}
