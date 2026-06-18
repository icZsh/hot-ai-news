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
  source: z.string(),
  publishedAt: z.string().nullish(),
  summary: z.string().nullish(),
  category: aihotCategorySchema.nullish(),
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
