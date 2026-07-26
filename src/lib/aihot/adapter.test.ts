import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  fetchDailyBySourceDate,
  fetchDailyIndex,
  fetchHotTopics,
  fetchLatestDaily,
  fetchSelectedItems,
} from "./adapter";

const itemListPayload = {
  schemaVersion: 1,
  query: {
    mode: "selected",
    category: null,
    q: "Anthropic Claude",
    window: "24h",
    by: "timeline",
    ordering: "timelineDesc",
  },
  items: [
    {
      id: "item-1",
      title: "OpenAI 发布新模型",
      originalTitle: "OpenAI releases a new model",
      summary: "摘要",
      source: { name: "AI HOT" },
      links: {
        aihot: "https://aihot.virxact.com/items/item-1",
        original: "https://example.com/item-1",
      },
      publishedAt: "2026-07-25T01:00:00.000Z",
      discoveredAt: "2026-07-25T01:05:00.000Z",
      category: "ai-models",
      score: 91,
      selected: true,
      attribution: {
        name: "AI HOT",
        url: "https://aihot.virxact.com/items/item-1",
      },
    },
  ],
  page: { count: 1, hasMore: false, nextCursor: null },
};

const dailyReport = {
  date: "2026-07-25",
  generatedAt: "2026-07-25T00:00:00.000Z",
  windowStart: "2026-07-24T00:00:00.000Z",
  windowEnd: "2026-07-25T00:00:00.000Z",
  links: { aihot: "https://aihot.virxact.com/daily/2026-07-25" },
  attribution: {
    name: "AI HOT",
    url: "https://aihot.virxact.com/daily/2026-07-25",
  },
  lead: { title: "今日重点", leadParagraph: "重点摘要" },
  sections: [],
  flashes: [],
};

function mockJsonResponse(payload: unknown) {
  return vi.fn(async () => ({
    ok: true,
    json: async () => payload,
  })) as unknown as typeof fetch;
}

describe("AI HOT v1 adapter", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-25T00:00:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("uses v1 item query names and endpoint", async () => {
    const fetchMock = mockJsonResponse(itemListPayload);
    vi.stubGlobal("fetch", fetchMock);

    const result = await fetchSelectedItems({
      mode: "selected",
      q: "Anthropic Claude",
      window: "24h",
      by: "timeline",
      take: 10,
    });

    const requestedUrl = new URL(String(vi.mocked(fetchMock).mock.calls[0][0]));
    expect(requestedUrl.pathname).toBe("/api/v1/items");
    expect(requestedUrl.searchParams.get("mode")).toBe("selected");
    expect(requestedUrl.searchParams.get("q")).toBe("Anthropic Claude");
    expect(requestedUrl.searchParams.get("window")).toBe("24h");
    expect(requestedUrl.searchParams.get("by")).toBe("timeline");
    expect(requestedUrl.searchParams.get("limit")).toBe("10");
    expect(requestedUrl.searchParams.has("take")).toBe(false);
    expect(requestedUrl.searchParams.has("since")).toBe(false);
    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error(result.error.message);
    expect(result.data.items[0]).toMatchObject({
      titleEn: "OpenAI releases a new model",
      sourceName: "AI HOT",
      url: "https://example.com/item-1",
      permalink: "https://aihot.virxact.com/items/item-1",
    });
  });

  it("uses v1 daily endpoints and unwraps reports", async () => {
    const fetchMock = mockJsonResponse({ schemaVersion: 1, report: dailyReport });
    vi.stubGlobal("fetch", fetchMock);

    const latest = await fetchLatestDaily();
    const byDate = await fetchDailyBySourceDate("2026-07-25");

    expect(new URL(String(vi.mocked(fetchMock).mock.calls[0][0])).pathname).toBe(
      "/api/v1/dailies/latest",
    );
    expect(new URL(String(vi.mocked(fetchMock).mock.calls[1][0])).pathname).toBe(
      "/api/v1/dailies/2026-07-25",
    );
    expect(latest.ok).toBe(true);
    expect(byDate.ok).toBe(true);
    if (!latest.ok) throw new Error(latest.error.message);
    expect(latest.data.leadParagraph).toBe("重点摘要");
  });

  it("uses v1 daily index endpoint and limit parameter", async () => {
    const fetchMock = mockJsonResponse({ schemaVersion: 1, count: 0, items: [] });
    vi.stubGlobal("fetch", fetchMock);

    const result = await fetchDailyIndex();

    const requestedUrl = new URL(String(vi.mocked(fetchMock).mock.calls[0][0]));
    expect(requestedUrl.pathname).toBe("/api/v1/dailies");
    expect(requestedUrl.searchParams.get("limit")).toBe("10");
    expect(requestedUrl.searchParams.has("take")).toBe(false);
    expect(result.ok).toBe(true);
  });

  it("fetches and normalizes v1 hot topics", async () => {
    const fetchMock = mockJsonResponse({
      schemaVersion: 1,
      count: 1,
      items: [
        {
          id: "topic-1",
          title: "Claude Code",
          source: { name: "Anthropic" },
          links: {
            aihot: "https://aihot.virxact.com/items/topic-1",
            original: "https://example.com/topic-1",
          },
          sourceCount: 3,
          signalCount: 5,
          sourceNames: ["Anthropic", "Hacker News"],
          latestAt: "2026-07-25T02:00:00.000Z",
        },
      ],
    });
    vi.stubGlobal("fetch", fetchMock);

    const result = await fetchHotTopics();

    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error(result.error.message);
    expect(result.data.items[0]).toMatchObject({
      id: "topic-1",
      title: "Claude Code",
      sourceName: "Anthropic",
      sourceCount: 3,
      signalCount: 5,
      url: "https://example.com/topic-1",
      permalink: "https://aihot.virxact.com/items/topic-1",
    });
    const requestedUrl = new URL(String(vi.mocked(fetchMock).mock.calls[0][0]));
    expect(requestedUrl.pathname).toBe("/api/v1/hot-topics");
  });
});
