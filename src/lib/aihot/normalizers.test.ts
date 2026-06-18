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

  it("keeps sourceDate and derives localDate for daily reports", () => {
    const result = normalizeDailyReport(dailyFixture, fetchedAt);

    expect(result.sourceDate).toBe("2026-06-01");
    expect(result.localDate).toBe("2026-05-31");
    expect(result.timezone).toBe("America/Los_Angeles");
    expect(result.sections).toHaveLength(2);
    expect(result.sections[0].items[0].sourceName).toContain("Sam Altman");
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
