import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  fetchAihotVersion,
  fetchHotTopics,
  fetchSelectedItems,
} from "./adapter";

const itemListPayload = {
  count: 1,
  hasNext: false,
  nextCursor: null,
  items: [
    {
      id: "item-1",
      title: "OpenAI 发布新模型",
      url: "https://example.com/item-1",
      permalink: "https://aihot.virxact.com/items/item-1",
      source: "AI HOT",
      selected: true,
    },
  ],
};

function mockJsonResponse(payload: unknown) {
  return vi.fn(async () => ({
    ok: true,
    json: async () => payload,
  })) as unknown as typeof fetch;
}

describe("AI HOT adapter", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-01T00:00:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("sends keyword and since filters when fetching selected items", async () => {
    const fetchMock = mockJsonResponse(itemListPayload);
    vi.stubGlobal("fetch", fetchMock);

    const result = await fetchSelectedItems({
      mode: "selected",
      q: "Anthropic Claude",
      since: "2026-05-30T00:00:00.000Z",
      take: 10,
    });

    expect(result.ok).toBe(true);
    const requestedUrl = new URL(String(vi.mocked(fetchMock).mock.calls[0][0]));
    expect(requestedUrl.pathname).toBe("/api/public/items");
    expect(requestedUrl.searchParams.get("mode")).toBe("selected");
    expect(requestedUrl.searchParams.get("q")).toBe("Anthropic Claude");
    expect(requestedUrl.searchParams.get("since")).toBe("2026-05-30T00:00:00.000Z");
    expect(requestedUrl.searchParams.get("take")).toBe("10");
  });

  it("fetches and normalizes hot topics", async () => {
    const fetchMock = mockJsonResponse({
      count: 1,
      items: [
        {
          id: "topic-1",
          title: "Claude Code",
          url: "https://example.com/topic-1",
          permalink: "https://aihot.virxact.com/hot/topic-1",
          source: "AI HOT",
          sourceCount: 3,
          sourceNames: ["Anthropic", "Hacker News"],
          latestAt: "2026-06-01T02:00:00.000Z",
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
      sourceCount: 3,
      sourceNames: ["Anthropic", "Hacker News"],
      permalink: "https://aihot.virxact.com/hot/topic-1",
    });
    const requestedUrl = new URL(String(vi.mocked(fetchMock).mock.calls[0][0]));
    expect(requestedUrl.pathname).toBe("/api/public/hot-topics");
  });

  it("fetches and normalizes API version metadata", async () => {
    const fetchMock = mockJsonResponse({
      apiVersion: "1.1.0",
      skillVersion: "1.0.0",
      updatedAt: "2026-06-01T02:00:00.000Z",
      changelogUrl: "https://aihot.virxact.com/changelog",
      recentChanges: ["Added hot topics"],
    });
    vi.stubGlobal("fetch", fetchMock);

    const result = await fetchAihotVersion();

    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error(result.error.message);
    expect(result.data).toMatchObject({
      apiVersion: "1.1.0",
      skillVersion: "1.0.0",
      recentChanges: ["Added hot topics"],
    });
    const requestedUrl = new URL(String(vi.mocked(fetchMock).mock.calls[0][0]));
    expect(requestedUrl.pathname).toBe("/api/public/version");
  });
});
