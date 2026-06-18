import "server-only";
import type { Bookmark, ExternalItem } from "@prisma/client";
import type { AihotCategory, NormalizedItem } from "@/lib/aihot/types";
import { getLocalDateKey, getLocalWeekRange } from "@/lib/app-time";
import { getPrisma, hasDatabaseUrl } from "@/lib/db";
import {
  bookmarkStatuses,
  getStatusLabel,
  type BookmarkStatus,
} from "@/lib/personal";

export { getStatusLabel };
export type { BookmarkStatus };

export type PersonalState = {
  available: boolean;
  bookmark?: {
    id: string;
    status: BookmarkStatus;
    personalTags: string[];
  };
  note?: {
    id: string;
    content: string;
  };
  message?: string;
};

export type BookmarkItem = NormalizedItem & {
  bookmarkId: string;
  bookmarkStatus: BookmarkStatus;
  personalTags: string[];
  note?: string;
  bookmarkedAt: string;
};

export type BookmarkListResult =
  | {
      ok: true;
      items: BookmarkItem[];
    }
  | {
      ok: false;
      message: string;
    };

export async function getPersonalState(
  targetType: string,
  targetId: string,
): Promise<PersonalState> {
  if (!hasDatabaseUrl()) {
    return {
      available: false,
      message: "DATABASE_URL 未配置，收藏和备注暂不可用。",
    };
  }

  const prisma = getPrisma();
  const [bookmark, note] = await Promise.all([
    prisma.bookmark.findUnique({
      where: {
        targetType_targetId: { targetType, targetId },
      },
    }),
    prisma.note.findUnique({
      where: {
        targetType_targetId: { targetType, targetId },
      },
    }),
  ]);

  return {
    available: true,
    bookmark: bookmark
      ? {
          id: bookmark.id,
          status: normalizeBookmarkStatus(bookmark.status),
          personalTags: bookmark.personalTags,
        }
      : undefined,
    note: note
      ? {
          id: note.id,
          content: note.content,
        }
      : undefined,
  };
}

export async function upsertBookmark({
  targetType,
  targetId,
  status = "unread",
  personalTags = [],
}: {
  targetType: string;
  targetId: string;
  status?: BookmarkStatus;
  personalTags?: string[];
}): Promise<PersonalState> {
  if (!hasDatabaseUrl()) {
    return {
      available: false,
      message: "DATABASE_URL 未配置，无法保存收藏。",
    };
  }

  const prisma = getPrisma();
  await prisma.bookmark.upsert({
    where: {
      targetType_targetId: { targetType, targetId },
    },
    create: {
      targetType,
      targetId,
      status,
      personalTags,
    },
    update: {
      status,
      personalTags,
    },
  });

  return getPersonalState(targetType, targetId);
}

export async function deleteBookmark(
  targetType: string,
  targetId: string,
): Promise<PersonalState> {
  if (!hasDatabaseUrl()) {
    return {
      available: false,
      message: "DATABASE_URL 未配置，无法取消收藏。",
    };
  }

  const prisma = getPrisma();
  await prisma.bookmark.deleteMany({
    where: { targetType, targetId },
  });

  return getPersonalState(targetType, targetId);
}

export async function upsertNote({
  targetType,
  targetId,
  content,
}: {
  targetType: string;
  targetId: string;
  content: string;
}): Promise<PersonalState> {
  if (!hasDatabaseUrl()) {
    return {
      available: false,
      message: "DATABASE_URL 未配置，无法保存备注。",
    };
  }

  const prisma = getPrisma();
  const trimmed = content.trim();

  if (!trimmed) {
    await prisma.note.deleteMany({
      where: { targetType, targetId },
    });
    return getPersonalState(targetType, targetId);
  }

  await prisma.note.upsert({
    where: {
      targetType_targetId: { targetType, targetId },
    },
    create: {
      targetType,
      targetId,
      content: trimmed,
    },
    update: {
      content: trimmed,
    },
  });

  return getPersonalState(targetType, targetId);
}

export async function listBookmarkedItems(
  options: { status?: string; weeklyOnly?: boolean } = {},
): Promise<BookmarkListResult> {
  if (!hasDatabaseUrl()) {
    return {
      ok: false,
      message: "DATABASE_URL 未配置，收藏列表暂不可用。",
    };
  }

  const prisma = getPrisma();
  const bookmarks = await prisma.bookmark.findMany({
    where: {
      targetType: "item",
      ...(options.status && options.status !== "all"
        ? { status: options.status }
        : {}),
    },
    orderBy: { createdAt: "desc" },
    take: 500,
  });

  const filteredBookmarks = options.weeklyOnly
    ? filterBookmarksForLocalWeek(bookmarks)
    : bookmarks;

  const externalIds = filteredBookmarks.map((bookmark) => bookmark.targetId);
  const [items, notes] = await Promise.all([
    prisma.externalItem.findMany({
      where: {
        sourceSystem: "aihot",
        externalId: { in: externalIds },
      },
    }),
    prisma.note.findMany({
      where: {
        targetType: "item",
        targetId: { in: externalIds },
      },
    }),
  ]);

  const itemMap = new Map(items.map((item) => [item.externalId, item]));
  const noteMap = new Map(notes.map((note) => [note.targetId, note]));

  return {
    ok: true,
    items: filteredBookmarks.flatMap((bookmark) => {
      const item = itemMap.get(bookmark.targetId);
      if (!item) {
        return [];
      }

      return [
        {
          ...mapExternalItem(item),
          bookmarkId: bookmark.id,
          bookmarkStatus: normalizeBookmarkStatus(bookmark.status),
          personalTags: bookmark.personalTags,
          note: noteMap.get(bookmark.targetId)?.content,
          bookmarkedAt: bookmark.createdAt.toISOString(),
        },
      ];
    }),
  };
}

export async function searchLocalItems(query: string): Promise<BookmarkListResult> {
  if (!hasDatabaseUrl()) {
    return {
      ok: false,
      message: "DATABASE_URL 未配置，本地搜索暂不可用。",
    };
  }

  const q = query.trim();
  if (!q) {
    return { ok: true, items: [] };
  }

  const prisma = getPrisma();
  const [items, notes, bookmarks] = await Promise.all([
    prisma.externalItem.findMany({
      where: {
        sourceSystem: "aihot",
        OR: [
          { title: { contains: q, mode: "insensitive" } },
          { titleEn: { contains: q, mode: "insensitive" } },
          { summary: { contains: q, mode: "insensitive" } },
          { sourceName: { contains: q, mode: "insensitive" } },
        ],
      },
      orderBy: [{ publishedAt: "desc" }, { fetchedAt: "desc" }],
      take: 80,
    }),
    prisma.note.findMany({
      where: {
        targetType: "item",
        content: { contains: q, mode: "insensitive" },
      },
      take: 80,
    }),
    prisma.bookmark.findMany({
      where: { targetType: "item" },
      take: 500,
    }),
  ]);

  const noteTargetIds = notes.map((note) => note.targetId);
  const noteMatchedItems =
    noteTargetIds.length > 0
      ? await prisma.externalItem.findMany({
          where: {
            sourceSystem: "aihot",
            externalId: { in: noteTargetIds },
          },
        })
      : [];

  const byExternalId = new Map<string, ExternalItem>();
  for (const item of [...items, ...noteMatchedItems]) {
    byExternalId.set(item.externalId, item);
  }

  const bookmarkMap = new Map(bookmarks.map((bookmark) => [bookmark.targetId, bookmark]));
  const noteMap = new Map(notes.map((note) => [note.targetId, note]));

  return {
    ok: true,
    items: Array.from(byExternalId.values()).map((item) => {
      const bookmark = bookmarkMap.get(item.externalId);
      const note = noteMap.get(item.externalId);

      return {
        ...mapExternalItem(item),
        bookmarkId: bookmark?.id ?? "",
        bookmarkStatus: normalizeBookmarkStatus(bookmark?.status),
        personalTags: bookmark?.personalTags ?? [],
        note: note?.content,
        bookmarkedAt: bookmark?.createdAt.toISOString() ?? "",
      };
    }),
  };
}

export function makeWeeklyMarkdown(items: BookmarkItem[]): string {
  if (items.length === 0) {
    return "";
  }

  return items
    .map((item) => {
      const lines = [
        `## ${item.title}`,
        "",
        `- 来源：${item.sourceName}`,
        `- 状态：${getStatusLabel(item.bookmarkStatus)}`,
        `- 原文：${item.url}`,
      ];

      if (item.summary) {
        lines.push("", `摘要：${item.summary}`);
      }

      if (item.note) {
        lines.push("", `我的备注：${item.note}`);
      }

      return lines.join("\n");
    })
    .join("\n\n");
}

function filterBookmarksForLocalWeek(bookmarks: Bookmark[]): Bookmark[] {
  const { startKey, endKey } = getLocalWeekRange();

  return bookmarks.filter((bookmark) => {
    const key = getLocalDateKey(bookmark.createdAt.toISOString());
    return key >= startKey && key <= endKey;
  });
}

function mapExternalItem(row: ExternalItem): NormalizedItem {
  return {
    id: row.externalId,
    title: row.title,
    titleEn: row.titleEn ?? undefined,
    url: row.canonicalUrl,
    sourceName: row.sourceName,
    publishedAt: row.publishedAt?.toISOString(),
    summary: row.summary ?? undefined,
    category: castCategory(row.category),
  };
}

function castCategory(value: string | null): AihotCategory | undefined {
  if (
    value === "ai-models" ||
    value === "ai-products" ||
    value === "industry" ||
    value === "paper" ||
    value === "tip"
  ) {
    return value;
  }

  return undefined;
}

function normalizeBookmarkStatus(status?: string | null): BookmarkStatus {
  if (bookmarkStatuses.includes(status as BookmarkStatus)) {
    return status as BookmarkStatus;
  }

  return "unread";
}
