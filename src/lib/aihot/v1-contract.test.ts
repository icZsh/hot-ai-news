import { describe, expect, it } from "vitest";
import {
  normalizeDailyIndex,
  normalizeDailyReport,
  normalizeHotTopicsResponse,
  normalizeItemsResponse,
} from "./normalizers";

const fetchedAt = "2026-07-25T03:00:00.000Z";

describe("AI HOT v1 wire normalization", () => {
  it("maps the v1 items envelope into the stable local shape", () => {
    const result = normalizeItemsResponse(
      {
        schemaVersion: 1,
        query: {
          mode: "selected",
          category: null,
          q: null,
          window: "7d",
          by: "timeline",
          ordering: "timelineDesc",
        },
        items: [
          {
            id: "item-1",
            title: "中文标题",
            originalTitle: "Original title",
            summary: "摘要",
            source: { name: "Official Blog" },
            links: {
              aihot: "https://aihot.virxact.com/items/item-1",
              original: "https://example.com/item-1",
            },
            publishedAt: null,
            discoveredAt: "2026-07-25T02:00:00.000Z",
            category: "future-category",
            score: 88,
            selected: true,
            attribution: {
              name: "AI HOT",
              url: "https://aihot.virxact.com/items/item-1",
            },
          },
        ],
        page: { count: 1, hasMore: true, nextCursor: "opaque" },
      },
      fetchedAt,
    );

    expect(result).toMatchObject({
      count: 1,
      hasNext: true,
      nextCursor: "opaque",
      fetchedAt,
    });
    expect(result.items[0]).toMatchObject({
      id: "item-1",
      title: "中文标题",
      titleEn: "Original title",
      sourceName: "Official Blog",
      url: "https://example.com/item-1",
      permalink: "https://aihot.virxact.com/items/item-1",
      attribution: {
        source: "AI HOT",
        canonical: "https://aihot.virxact.com/items/item-1",
      },
    });
    expect(result.items[0].category).toBeUndefined();
  });

  it("unwraps v1 daily reports and maps nested source and links", () => {
    const result = normalizeDailyReport(
      {
        schemaVersion: 1,
        report: {
          date: "2026-07-25",
          generatedAt: "2026-07-25T00:00:00.000Z",
          windowStart: "2026-07-24T00:00:00.000Z",
          windowEnd: "2026-07-25T00:00:00.000Z",
          links: { aihot: "https://aihot.virxact.com/daily/2026-07-25" },
          attribution: {
            name: "AI HOT",
            url: "https://aihot.virxact.com/daily/2026-07-25",
          },
          lead: { title: "重点", leadParagraph: "导语" },
          sections: [
            {
              label: "行业动态",
              items: [
                {
                  title: "条目",
                  summary: "摘要",
                  source: { name: "Example" },
                  links: {
                    aihot: "https://aihot.virxact.com/items/item-1",
                    original: "https://example.com/item-1",
                  },
                },
              ],
            },
          ],
          flashes: [
            {
              title: "快讯",
              source: { name: "Example" },
              links: { aihot: null, original: "https://example.com/flash" },
              publishedAt: null,
            },
          ],
        },
      },
      fetchedAt,
    );

    expect(result).toMatchObject({
      sourceDate: "2026-07-25",
      leadTitle: "重点",
      leadParagraph: "导语",
    });
    expect(result.sections[0].items[0]).toMatchObject({
      sourceName: "Example",
      sourceUrl: "https://example.com/item-1",
      permalink: "https://aihot.virxact.com/items/item-1",
    });
    expect(result.flashes[0]).toMatchObject({
      sourceName: "Example",
      sourceUrl: "https://example.com/flash",
    });
    expect(result.flashes[0].permalink).toBeUndefined();
  });

  it("normalizes v1 daily index and hot topics", () => {
    const index = normalizeDailyIndex(
      {
        schemaVersion: 1,
        count: 1,
        items: [
          {
            date: "2026-07-25",
            generatedAt: "2026-07-25T00:00:00.000Z",
            leadTitle: "重点",
            leadParagraph: null,
            links: { aihot: "https://aihot.virxact.com/daily/2026-07-25" },
            attribution: {
              name: "AI HOT",
              url: "https://aihot.virxact.com/daily/2026-07-25",
            },
          },
        ],
      },
      fetchedAt,
    );
    const topics = normalizeHotTopicsResponse(
      {
        schemaVersion: 1,
        count: 1,
        items: [
          {
            id: "topic-1",
            title: "热点",
            source: { name: "Example" },
            links: {
              aihot: "https://aihot.virxact.com/items/topic-1",
              original: "https://example.com/topic-1",
            },
            sourceCount: 2,
            signalCount: 3,
            sourceNames: ["A", "B"],
            latestAt: "2026-07-25T00:00:00.000Z",
          },
        ],
      },
      fetchedAt,
    );

    expect(index.items[0]).toMatchObject({
      sourceDate: "2026-07-25",
      leadTitle: "重点",
      attribution: {
        source: "AI HOT",
        canonical: "https://aihot.virxact.com/daily/2026-07-25",
      },
    });
    expect(topics.items[0]).toMatchObject({
      sourceName: "Example",
      url: "https://example.com/topic-1",
      permalink: "https://aihot.virxact.com/items/topic-1",
    });
  });
});
