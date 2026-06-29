import { APP_TIMEZONE, getLocalDateKey } from "@/lib/app-time";
import {
  aihotVersionSchema,
  dailyResponseSchema,
  dailiesResponseSchema,
  hotTopicsResponseSchema,
  itemsResponseSchema,
} from "./schemas";
import type {
  NormalizedAihotVersion,
  NormalizedDailyIndex,
  NormalizedDailyReport,
  NormalizedHotTopicsResponse,
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
      permalink: item.permalink ?? undefined,
      sourceName: item.source,
      publishedAt: item.publishedAt ?? undefined,
      summary: item.summary ?? undefined,
      category: item.category ?? undefined,
      score: item.score ?? undefined,
      selected: item.selected ?? undefined,
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
    flashes: parsed.flashes.map((flash) => ({
      title: flash.title,
      sourceName: flash.sourceName ?? undefined,
      sourceUrl: flash.sourceUrl,
      publishedAt: flash.publishedAt ?? undefined,
      permalink: flash.permalink ?? undefined,
      raw: flash,
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

export function normalizeHotTopicsResponse(
  input: unknown,
  fetchedAt = new Date().toISOString(),
): NormalizedHotTopicsResponse {
  const parsed = hotTopicsResponseSchema.parse(input);

  return {
    count: parsed.count,
    fetchedAt,
    items: parsed.items.map((item) => ({
      id: item.id,
      title: item.title,
      url: item.url,
      permalink: item.permalink,
      sourceName: item.source,
      sourceCount: item.sourceCount,
      sourceNames: item.sourceNames,
      latestAt: item.latestAt,
      raw: item,
    })),
  };
}

export function normalizeAihotVersion(
  input: unknown,
  fetchedAt = new Date().toISOString(),
): NormalizedAihotVersion {
  const parsed = aihotVersionSchema.parse(input);

  return {
    apiVersion: parsed.apiVersion ?? undefined,
    skillVersion: parsed.skillVersion ?? undefined,
    updatedAt: parsed.updatedAt ?? undefined,
    changelogUrl: parsed.changelogUrl ?? undefined,
    recentChanges: parsed.recentChanges,
    fetchedAt,
    raw: parsed,
  };
}
