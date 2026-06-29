import { describe, expect, it } from "vitest";
import dailyFixture from "./__fixtures__/daily.json";
import dailiesFixture from "./__fixtures__/dailies.json";
import itemsFixture from "./__fixtures__/items.json";
import {
  normalizeDailyIndex,
  normalizeDailyReport,
  normalizeItemsResponse,
} from "./normalizers";

const fetchedAt = "2026-06-01T01:00:00.000Z";

describe("AI HOT normalizers", () => {
  it("normalizes public items without exposing raw field names", () => {
    const result = normalizeItemsResponse(itemsFixture, fetchedAt);

    expect(result.count).toBe(3);
    expect(result.hasNext).toBe(true);
    expect(result.nextCursor).toBe("fixture-cursor");
    expect(result.fetchedAt).toBe(fetchedAt);
    expect(result.items[0]).toMatchObject({
      id: "cmpurl8qd009dsl0zyghfa9kw",
      title: "介绍Cosmos Coalition",
      titleEn: "Introducing the Cosmos Coalition",
      sourceName: "Runway：News（网页）",
      category: "industry",
    });
  });

  it("preserves optional OpenAPI item metadata", () => {
    const result = normalizeItemsResponse(
      {
        ...itemsFixture,
        items: [
          {
            ...itemsFixture.items[0],
            permalink: "https://aihot.virxact.com/items/cmpurl8qd009dsl0zyghfa9kw",
            score: 91.5,
            selected: true,
          },
        ],
      },
      fetchedAt,
    );

    expect(result.items[0]).toMatchObject({
      permalink: "https://aihot.virxact.com/items/cmpurl8qd009dsl0zyghfa9kw",
      score: 91.5,
      selected: true,
    });
  });

  it("keeps sourceDate and derives localDate for daily reports", () => {
    const result = normalizeDailyReport(dailyFixture, fetchedAt);

    expect(result.sourceDate).toBe("2026-06-01");
    expect(result.localDate).toBe("2026-05-31");
    expect(result.timezone).toBe("America/Los_Angeles");
    expect(result.sections).toHaveLength(2);
    expect(result.sections[0].items[0].sourceName).toContain("Sam Altman");
  });

  it("preserves daily flashes", () => {
    const result = normalizeDailyReport(
      {
        ...dailyFixture,
        flashes: [
          {
            title: "Claude Code 热度上升",
            sourceName: "Anthropic",
            sourceUrl: "https://example.com/claude-code",
            publishedAt: "2026-06-01T03:00:00.000Z",
            permalink: "https://aihot.virxact.com/flashes/claude-code",
          },
        ],
      },
      fetchedAt,
    );

    expect(result.flashes).toHaveLength(1);
    expect(result.flashes[0]).toMatchObject({
      title: "Claude Code 热度上升",
      sourceName: "Anthropic",
      sourceUrl: "https://example.com/claude-code",
      publishedAt: "2026-06-01T03:00:00.000Z",
      permalink: "https://aihot.virxact.com/flashes/claude-code",
    });
  });

  it("normalizes daily index with local dates", () => {
    const result = normalizeDailyIndex(dailiesFixture, fetchedAt);

    expect(result.count).toBe(3);
    expect(result.items[0]).toMatchObject({
      sourceDate: "2026-06-01",
      localDate: "2026-05-31",
      leadTitle: "OpenAI发布生物防御AI工具Rosalind",
    });
  });
});
