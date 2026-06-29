import { z } from "zod";

export const aihotCategorySchema = z.enum([
  "ai-models",
  "ai-products",
  "industry",
  "paper",
  "tip",
]);

const itemSchema = z.object({
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
});

export const itemsResponseSchema = z.object({
  count: z.number(),
  hasNext: z.boolean().default(false),
  nextCursor: z.string().nullable().optional(),
  items: z.array(itemSchema),
});

const dailyItemSchema = z.object({
  title: z.string(),
  summary: z.string().nullish(),
  sourceUrl: z.string().url(),
  sourceName: z.string().nullish(),
});

const dailyFlashSchema = z.object({
  title: z.string(),
  sourceName: z.string().nullish(),
  sourceUrl: z.string().url(),
  publishedAt: z.string().nullish(),
  permalink: z.string().url().nullish(),
});

const dailySectionSchema = z.object({
  label: z.string(),
  items: z.array(dailyItemSchema),
});

export const dailyResponseSchema = z.object({
  date: z.string(),
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
  sections: z.array(dailySectionSchema).default([]),
  flashes: z.array(dailyFlashSchema).default([]),
});

const dailyIndexItemSchema = z.object({
  date: z.string(),
  generatedAt: z.string().nullish(),
  leadTitle: z.string().nullish(),
  leadParagraph: z.string().nullish(),
});

export const dailiesResponseSchema = z.object({
  count: z.number(),
  items: z.array(dailyIndexItemSchema),
});

const hotTopicSchema = z.object({
  id: z.string(),
  title: z.string(),
  url: z.string().url(),
  permalink: z.string().url(),
  source: z.string(),
  sourceCount: z.number(),
  sourceNames: z.array(z.string()).default([]),
  latestAt: z.string(),
});

export const hotTopicsResponseSchema = z.object({
  count: z.number(),
  items: z.array(hotTopicSchema),
});

export const aihotVersionSchema = z.object({
  apiVersion: z.string().nullish(),
  skillVersion: z.string().nullish(),
  updatedAt: z.string().nullish(),
  changelogUrl: z.string().url().nullish(),
  recentChanges: z.array(z.string()).default([]),
});
