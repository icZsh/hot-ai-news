import { describe, expect, it } from "vitest";
import {
  dailyReportRecencyOrder,
  externalItemRecencyOrder,
  latestFetchedAt,
} from "./ordering";

describe("externalItemRecencyOrder", () => {
  it("sorts publishedAt desc with NULLs last, then fetchedAt desc", () => {
    expect(externalItemRecencyOrder).toEqual([
      { publishedAt: { sort: "desc", nulls: "last" } },
      { fetchedAt: "desc" },
    ]);
  });
});

describe("dailyReportRecencyOrder", () => {
  it("sorts generatedAt with NULLs last", () => {
    expect(dailyReportRecencyOrder).toEqual([
      { localDate: "desc" },
      { generatedAt: { sort: "desc", nulls: "last" } },
    ]);
  });
});

describe("latestFetchedAt", () => {
  it("returns the max fetchedAt, not the first row's", () => {
    const rows = [
      { fetchedAt: new Date("2026-10-08T00:30:00.000Z") },
      { fetchedAt: new Date("2026-10-21T16:00:00.000Z") },
      { fetchedAt: new Date("2026-10-20T08:00:00.000Z") },
    ];

    expect(latestFetchedAt(rows)).toBe("2026-10-21T16:00:00.000Z");
  });

  it("falls back when there are no rows", () => {
    const fallback = new Date("2026-10-21T00:00:00.000Z");
    expect(latestFetchedAt([], fallback)).toBe("2026-10-21T00:00:00.000Z");
  });
});
