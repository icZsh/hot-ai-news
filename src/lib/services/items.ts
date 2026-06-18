import "server-only";
import type { ExternalItem } from "@prisma/client";
import { fetchSelectedItems } from "@/lib/aihot/adapter";
import type {
  AihotCategory,
  AdapterResult,
  NormalizedItem,
  NormalizedItemsResponse,
} from "@/lib/aihot/types";
import { hasDatabaseUrl, getPrisma } from "@/lib/db";

type ItemsSource = "database" | "remote";

export type ItemsPageResult = AdapterResult<NormalizedItemsResponse> & {
  source: ItemsSource;
  warning?: string;
};

type GetItemsOptions = {
  category?: string;
  take?: number;
  revalidate?: number;
};

export async function getItemsForPage(
  options: GetItemsOptions = {},
): Promise<ItemsPageResult> {
  if (hasDatabaseUrl()) {
    try {
      const local = await findLocalItems(options);
      if (local.items.length > 0) {
        return {
          ok: true,
          source: "database",
          data: local,
        };
      }
    } catch (error) {
      const remote = await fetchSelectedItems({
        category: options.category,
        take: options.take,
        revalidate: options.revalidate,
      });

      return {
        ...remote,
        source: "remote",
        warning:
          error instanceof Error
            ? `本地数据库读取失败，正在显示远端数据：${error.message}`
            : "本地数据库读取失败，正在显示远端数据。",
      };
    }
  }

  return {
    ...(await fetchSelectedItems({
      category: options.category,
      take: options.take,
      revalidate: options.revalidate,
    })),
    source: "remote",
    warning: hasDatabaseUrl()
      ? undefined
      : "DATABASE_URL 未配置，当前直接显示 AI HOT 远端数据。",
  };
}

export async function findLocalItems(
  options: GetItemsOptions = {},
): Promise<NormalizedItemsResponse> {
  const prisma = getPrisma();
  const take = options.take ?? 100;
  const category =
    options.category && options.category !== "all" ? options.category : undefined;

  const rows = await prisma.externalItem.findMany({
    where: {
      sourceSystem: "aihot",
      selected: true,
      ...(category ? { category } : {}),
    },
    orderBy: [{ publishedAt: "desc" }, { fetchedAt: "desc" }],
    take,
  });

  return {
    count: rows.length,
    hasNext: false,
    nextCursor: null,
    fetchedAt: rows[0]?.fetchedAt.toISOString() ?? new Date().toISOString(),
    items: rows.map(mapExternalItem),
  };
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
