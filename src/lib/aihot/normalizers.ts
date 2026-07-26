import { APP_TIMEZONE, getLocalDateKey } from "@/lib/app-time";
import {
  aihotFingerprintSchema,
  aihotVersionSchema,
  dailyResponseSchema,
  dailiesResponseSchema,
  hotTopicsResponseSchema,
  itemsResponseSchema,
  v1DailiesResponseSchema,
  v1DailyResponseSchema,
  v1HotTopicsResponseSchema,
  v1ItemsResponseSchema,
} from "./schemas";
import type {
  AihotAttribution,
  AihotCategory,
  NormalizedAihotFingerprint,
  NormalizedAihotVersion,
  NormalizedDailyIndex,
  NormalizedDailyReport,
  NormalizedHotTopicsResponse,
  NormalizedItemsResponse,
} from "./types";

type LegacyAttribution = { source: string; canonical: string };
type V1Attribution = { name: string; url: string };

function normalizeAttribution(
  attribution?: LegacyAttribution | V1Attribution | null,
): AihotAttribution | undefined {
  if (!attribution) return undefined;
  if ("name" in attribution) {
    return {
      source: attribution.name,
      canonical: attribution.url,
    };
  }
  return {
    source: attribution.source,
    canonical: attribution.canonical,
  };
}

function normalizeCategory(category?: string | null): AihotCategory | undefined {
  switch (category) {
    case "ai-models":
    case "ai-products":
    case "industry":
    case "paper":
    case "tip":
      return category;
    default:
      return undefined;
  }
}

export function normalizeItemsResponse(
  input: unknown,
  fetchedAt = new Date().toISOString(),
): NormalizedItemsResponse {
  const v1 = v1ItemsResponseSchema.safeParse(input);
  if (v1.success) {
    return {
      count: v1.data.page.count,
      hasNext: v1.data.page.hasMore,
      nextCursor: v1.data.page.nextCursor,
      fetchedAt,
      items: v1.data.items.map((item) => ({
        id: item.id,
        title: item.title,
        titleEn: item.originalTitle ?? undefined,
        url: item.links.original,
        permalink: item.links.aihot,
        sourceName: item.source.name,
        publishedAt: item.publishedAt ?? undefined,
        summary: item.summary ?? undefined,
        category: normalizeCategory(item.category),
        score: item.score ?? undefined,
        selected: item.selected,
        attribution: normalizeAttribution(item.attribution),
        raw: item,
      })),
    };
  }

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
      attribution: normalizeAttribution(item.attribution),
      raw: item,
    })),
  };
}

export function normalizeDailyReport(
  input: unknown,
  fetchedAt = new Date().toISOString(),
): NormalizedDailyReport {
  const v1 = v1DailyResponseSchema.safeParse(input);
  if (v1.success) {
    const report = v1.data.report;
    return {
      sourceDate: report.date,
      localDate: getLocalDateKey(report.generatedAt, report.date),
      timezone: APP_TIMEZONE,
      generatedAt: report.generatedAt ?? undefined,
      windowStart: report.windowStart ?? undefined,
      windowEnd: report.windowEnd ?? undefined,
      leadTitle: report.lead?.title ?? undefined,
      leadParagraph: report.lead?.leadParagraph ?? undefined,
      attribution: normalizeAttribution(report.attribution),
      fetchedAt,
      raw: report,
      sections: report.sections.map((section) => ({
        label: section.label,
        items: section.items.map((item) => ({
          title: item.title,
          summary: item.summary ?? undefined,
          sourceName: item.source.name,
          sourceUrl: item.links.original,
          permalink: item.links.aihot ?? undefined,
          attribution: normalizeAttribution(item.attribution),
          raw: item,
        })),
      })),
      flashes: report.flashes.map((flash) => ({
        title: flash.title,
        sourceName: flash.source.name,
        sourceUrl: flash.links.original,
        publishedAt: flash.publishedAt ?? undefined,
        permalink: flash.links.aihot ?? undefined,
        attribution: normalizeAttribution(flash.attribution),
        raw: flash,
      })),
    };
  }

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
    attribution: normalizeAttribution(parsed.attribution),
    fetchedAt,
    raw: parsed,
    sections: parsed.sections.map((section) => ({
      label: section.label,
      items: section.items.map((item) => ({
        title: item.title,
        summary: item.summary ?? undefined,
        sourceName: item.sourceName ?? undefined,
        sourceUrl: item.sourceUrl,
        permalink: item.permalink ?? undefined,
        attribution: normalizeAttribution(item.attribution),
        raw: item,
      })),
    })),
    flashes: parsed.flashes.map((flash) => ({
      title: flash.title,
      sourceName: flash.sourceName ?? undefined,
      sourceUrl: flash.sourceUrl,
      publishedAt: flash.publishedAt ?? undefined,
      permalink: flash.permalink ?? undefined,
      attribution: normalizeAttribution(flash.attribution),
      raw: flash,
    })),
  };
}

export function normalizeDailyIndex(
  input: unknown,
  fetchedAt = new Date().toISOString(),
): NormalizedDailyIndex {
  const v1 = v1DailiesResponseSchema.safeParse(input);
  if (v1.success) {
    return {
      count: v1.data.count,
      fetchedAt,
      items: v1.data.items.map((item) => ({
        sourceDate: item.date,
        localDate: getLocalDateKey(item.generatedAt, item.date),
        generatedAt: item.generatedAt ?? undefined,
        leadTitle: item.leadTitle ?? undefined,
        leadParagraph: item.leadParagraph ?? undefined,
        attribution: normalizeAttribution(item.attribution),
      })),
    };
  }

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
      attribution: normalizeAttribution(item.attribution),
    })),
  };
}

export function normalizeHotTopicsResponse(
  input: unknown,
  fetchedAt = new Date().toISOString(),
): NormalizedHotTopicsResponse {
  const v1 = v1HotTopicsResponseSchema.safeParse(input);
  if (v1.success) {
    return {
      count: v1.data.count,
      fetchedAt,
      items: v1.data.items.map((item) => ({
        id: item.id,
        title: item.title,
        url: item.links.original,
        permalink: item.links.aihot,
        sourceName: item.source.name,
        sourceCount: item.sourceCount,
        signalCount: item.signalCount,
        sourceNames: item.sourceNames,
        latestAt: item.latestAt,
        raw: item,
      })),
    };
  }

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
      signalCount: item.signalCount,
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

export function normalizeAihotFingerprint(
  input: unknown,
  fetchedAt = new Date().toISOString(),
): NormalizedAihotFingerprint {
  const parsed = aihotFingerprintSchema.parse(input);
  return {
    selected: parsed.selected,
    all: parsed.all,
    docs: parsed.docs ?? undefined,
    fetchedAt,
    raw: parsed,
  };
}
