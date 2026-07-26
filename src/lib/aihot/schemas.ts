import { z } from "zod";

export const aihotCategorySchema = z.enum([
  "ai-models",
  "ai-products",
  "industry",
  "paper",
  "tip",
]);

const legacyAttributionSchema = z.object({
  source: z.string(),
  canonical: z.string().url(),
});

const v1AttributionSchema = z.object({
  name: z.string(),
  url: z.string().url(),
});

const legacyItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  title_en: z.string().nullish(),
  url: z.string().url(),
  permalink: z.string().url().nullish(),
  source: z.string(),
  publishedAt: z.string().nullish(),
  summary: z.string().nullish(),
  category: aihotCategorySchema.nullish(),
  score: z.number().nullish(),
  selected: z.boolean().nullish(),
  attribution: legacyAttributionSchema.nullish(),
});

export const itemsResponseSchema = z.object({
  count: z.number(),
  hasNext: z.boolean().default(false),
  nextCursor: z.string().nullable().optional(),
  items: z.array(legacyItemSchema),
});

const v1SourceSchema = z.object({
  name: z.string(),
});

const v1LinksSchema = z.object({
  aihot: z.string().url().nullable(),
  original: z.string().url(),
});

const v1ItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  originalTitle: z.string().nullish(),
  summary: z.string().nullish(),
  source: v1SourceSchema,
  links: v1LinksSchema.extend({ aihot: z.string().url() }),
  publishedAt: z.string().nullish(),
  discoveredAt: z.string(),
  category: z.string().nullish(),
  score: z.number().nullish(),
  selected: z.boolean(),
  attribution: v1AttributionSchema.nullish(),
});

export const v1ItemsResponseSchema = z.object({
  schemaVersion: z.number(),
  query: z.object({
    mode: z.enum(["selected", "all"]),
    category: z.string().nullable(),
    q: z.string().nullable(),
    window: z.enum(["24h", "7d"]),
    by: z.enum(["timeline", "published"]),
    ordering: z.string(),
  }),
  items: z.array(v1ItemSchema),
  page: z.object({
    count: z.number(),
    hasMore: z.boolean(),
    nextCursor: z.string().nullable(),
  }),
});

const legacyDailyItemSchema = z.object({
  title: z.string(),
  summary: z.string().nullish(),
  sourceUrl: z.string().url(),
  sourceName: z.string().nullish(),
  permalink: z.string().url().nullish(),
  attribution: legacyAttributionSchema.nullish(),
});

const legacyDailyFlashSchema = z.object({
  title: z.string(),
  sourceName: z.string().nullish(),
  sourceUrl: z.string().url(),
  publishedAt: z.string().nullish(),
  permalink: z.string().url().nullish(),
  attribution: legacyAttributionSchema.nullish(),
});

const legacyDailySectionSchema = z.object({
  label: z.string(),
  items: z.array(legacyDailyItemSchema),
});

export const dailyResponseSchema = z.object({
  date: z.string(),
  attribution: legacyAttributionSchema.nullish(),
  generatedAt: z.string().nullish(),
  windowStart: z.string().nullish(),
  windowEnd: z.string().nullish(),
  lead: z
    .object({
      title: z.string().nullish(),
      paragraph: z.string().nullish(),
    })
    .nullable()
    .optional(),
  leadTitle: z.string().nullish(),
  leadParagraph: z.string().nullish(),
  sections: z.array(legacyDailySectionSchema).default([]),
  flashes: z.array(legacyDailyFlashSchema).default([]),
});

const v1DailyItemSchema = z.object({
  title: z.string(),
  summary: z.string().nullish(),
  source: v1SourceSchema,
  links: v1LinksSchema,
  attribution: v1AttributionSchema.nullish(),
});

const v1DailyFlashSchema = z.object({
  title: z.string(),
  source: v1SourceSchema,
  links: v1LinksSchema,
  publishedAt: z.string().nullish(),
  attribution: v1AttributionSchema.nullish(),
});

const v1DailyReportSchema = z.object({
  date: z.string(),
  generatedAt: z.string().nullish(),
  windowStart: z.string().nullish(),
  windowEnd: z.string().nullish(),
  links: z.object({ aihot: z.string().url() }),
  attribution: v1AttributionSchema.nullish(),
  lead: z
    .object({
      title: z.string().nullish(),
      leadParagraph: z.string().nullish(),
    })
    .nullable()
    .optional(),
  sections: z
    .array(
      z.object({
        label: z.string(),
        items: z.array(v1DailyItemSchema),
      }),
    )
    .default([]),
  flashes: z.array(v1DailyFlashSchema).default([]),
});

export const v1DailyResponseSchema = z.object({
  schemaVersion: z.number(),
  report: v1DailyReportSchema,
});

const legacyDailyIndexItemSchema = z.object({
  date: z.string(),
  attribution: legacyAttributionSchema.nullish(),
  generatedAt: z.string().nullish(),
  leadTitle: z.string().nullish(),
  leadParagraph: z.string().nullish(),
});

export const dailiesResponseSchema = z.object({
  count: z.number(),
  items: z.array(legacyDailyIndexItemSchema),
});

const v1DailyIndexItemSchema = z.object({
  date: z.string(),
  attribution: v1AttributionSchema.nullish(),
  generatedAt: z.string().nullish(),
  leadTitle: z.string().nullish(),
  leadParagraph: z.string().nullish(),
  links: z.object({ aihot: z.string().url() }),
});

export const v1DailiesResponseSchema = z.object({
  schemaVersion: z.number(),
  count: z.number(),
  items: z.array(v1DailyIndexItemSchema),
});

const legacyHotTopicSchema = z.object({
  id: z.string(),
  title: z.string(),
  url: z.string().url(),
  permalink: z.string().url(),
  source: z.string(),
  sourceCount: z.number(),
  signalCount: z.number(),
  sourceNames: z.array(z.string()).default([]),
  latestAt: z.string(),
});

export const hotTopicsResponseSchema = z.object({
  count: z.number(),
  items: z.array(legacyHotTopicSchema),
});

const v1HotTopicSchema = z.object({
  id: z.string(),
  title: z.string(),
  source: v1SourceSchema,
  links: v1LinksSchema.extend({ aihot: z.string().url() }),
  sourceCount: z.number(),
  signalCount: z.number(),
  sourceNames: z.array(z.string()).default([]),
  latestAt: z.string(),
});

export const v1HotTopicsResponseSchema = z.object({
  schemaVersion: z.number(),
  count: z.number(),
  items: z.array(v1HotTopicSchema),
});

export const aihotVersionSchema = z.object({
  apiVersion: z.string().nullish(),
  skillVersion: z.string().nullish(),
  updatedAt: z.string().nullish(),
  changelogUrl: z.string().url().nullish(),
  recentChanges: z.array(z.string()).default([]),
});

export const aihotFingerprintSchema = z.object({
  selected: z.string(),
  all: z.string(),
  docs: z.string().nullish(),
});
