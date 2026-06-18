import { APP_TIMEZONE, getLocalDateKey } from "@/lib/app-time";
import {
  dailyResponseSchema,
  dailiesResponseSchema,
  itemsResponseSchema,
} from "./schemas";
import type {
  NormalizedDailyIndex,
  NormalizedDailyReport,
  NormalizedItemsResponse,
} from "./types";

export function normalizeItemsResponse(
  input: unknown,
  fetchedAt = new Date().toISOString(),
): NormalizedItemsResponse {
  const parsed = itemsResponseSchema.parse(input);

  return {
    count: parsed.count,
    hasNext: parsed.hasNext,
    nextCursor: parsed.nextCursor ?? null,
    fetchedAt,
    items: parsed.items.map((item) => ({
      id: item.id,
      title: item.title,
      titleEn: item.title_en ?? undefined,
      url: item.url,
      sourceName: item.source,
      publishedAt: item.publishedAt ?? undefined,
      summary: item.summary ?? undefined,
      category: item.category ?? undefined,
      raw: item,
    })),
  };
}

export function normalizeDailyReport(
  input: unknown,
  fetchedAt = new Date().toISOString(),
): NormalizedDailyReport {
  const parsed = dailyResponseSchema.parse(input);
  const leadTitle = parsed.leadTitle ?? parsed.lead?.title ?? undefined;
  const leadParagraph =
    parsed.leadParagraph ?? parsed.lead?.paragraph ?? undefined;

  return {
    sourceDate: parsed.date,
    localDate: getLocalDateKey(parsed.generatedAt, parsed.date),
    timezone: APP_TIMEZONE,
    generatedAt: parsed.generatedAt ?? undefined,
    windowStart: parsed.windowStart ?? undefined,
    windowEnd: parsed.windowEnd ?? undefined,
    leadTitle,
    leadParagraph,
    fetchedAt,
    raw: parsed,
    sections: parsed.sections.map((section) => ({
      label: section.label,
      items: section.items.map((item) => ({
        title: item.title,
        summary: item.summary ?? undefined,
        sourceName: item.sourceName ?? undefined,
        sourceUrl: item.sourceUrl,
        raw: item,
      })),
    })),
  };
}

export function normalizeDailyIndex(
  input: unknown,
  fetchedAt = new Date().toISOString(),
): NormalizedDailyIndex {
  const parsed = dailiesResponseSchema.parse(input);

  return {
    count: parsed.count,
    fetchedAt,
    items: parsed.items.map((item) => ({
      sourceDate: item.date,
      localDate: getLocalDateKey(item.generatedAt, item.date),
      generatedAt: item.generatedAt ?? undefined,
      leadTitle: item.leadTitle ?? undefined,
      leadParagraph: item.leadParagraph ?? undefined,
    })),
  };
}
