import "server-only";
import type { Prisma } from "@prisma/client";
import { fetchLatestDaily, fetchSelectedItems } from "@/lib/aihot/adapter";
import type {
  NormalizedDailyReport,
  NormalizedItemsResponse,
} from "@/lib/aihot/types";
import { toDate } from "@/lib/app-time";
import { getPrisma, hasDatabaseUrl } from "@/lib/db";
import { sha256 } from "@/lib/hash";
import { canonicalizeUrl } from "@/lib/url";
import { toPrismaJson, toNullablePrismaJson } from "./json";

export type SyncResult = {
  ok: boolean;
  jobName: string;
  sourceSystem: "aihot";
  status: "success" | "partial" | "failed";
  itemCount: number;
  message?: string;
};

export async function syncSelectedItems(
  jobName = "manual-refresh",
): Promise<SyncResult> {
  if (!hasDatabaseUrl()) {
    return {
      ok: false,
      jobName,
      sourceSystem: "aihot",
      status: "failed",
      itemCount: 0,
      message: "DATABASE_URL 未配置，无法写入本地缓存。",
    };
  }

  const startedAt = new Date();
  const remote = await fetchSelectedItems({
    mode: "selected",
    take: 100,
    revalidate: 0,
  });

  if (!remote.ok) {
    await writeFetchLog({
      jobName,
      startedAt,
      status: "failed",
      itemCount: 0,
      errorMessage: remote.error.message,
      metadata: { code: remote.error.code },
    });

    return {
      ok: false,
      jobName,
      sourceSystem: "aihot",
      status: "failed",
      itemCount: 0,
      message: remote.error.message,
    };
  }

  try {
    const itemCount = await upsertSelectedItems(remote.data);
    await writeFetchLog({
      jobName,
      startedAt,
      status: "success",
      itemCount,
      metadata: {
        remoteCount: remote.data.count,
        fetchedAt: remote.data.fetchedAt,
      },
    });

    return {
      ok: true,
      jobName,
      sourceSystem: "aihot",
      status: "success",
      itemCount,
    };
  } catch (error) {
    await writeFetchLog({
      jobName,
      startedAt,
      status: "failed",
      itemCount: 0,
      errorMessage: error instanceof Error ? error.message : "Unknown DB error",
    });

    return {
      ok: false,
      jobName,
      sourceSystem: "aihot",
      status: "failed",
      itemCount: 0,
      message: error instanceof Error ? error.message : "Unknown DB error",
    };
  }
}

export async function syncDailyReport(
  jobName = "sync-daily",
): Promise<SyncResult> {
  if (!hasDatabaseUrl()) {
    return {
      ok: false,
      jobName,
      sourceSystem: "aihot",
      status: "failed",
      itemCount: 0,
      message: "DATABASE_URL 未配置，无法写入本地缓存。",
    };
  }

  const startedAt = new Date();
  const remote = await fetchLatestDaily({ revalidate: 0 });

  if (!remote.ok) {
    await writeFetchLog({
      jobName,
      startedAt,
      status: "failed",
      itemCount: 0,
      errorMessage: remote.error.message,
      metadata: { code: remote.error.code },
    });

    return {
      ok: false,
      jobName,
      sourceSystem: "aihot",
      status: "failed",
      itemCount: 0,
      message: remote.error.message,
    };
  }

  try {
    const itemCount = await upsertDailyReport(remote.data);
    await writeFetchLog({
      jobName,
      startedAt,
      status: "success",
      itemCount,
      metadata: {
        sourceDate: remote.data.sourceDate,
        localDate: remote.data.localDate,
        fetchedAt: remote.data.fetchedAt,
      },
    });

    return {
      ok: true,
      jobName,
      sourceSystem: "aihot",
      status: "success",
      itemCount,
    };
  } catch (error) {
    await writeFetchLog({
      jobName,
      startedAt,
      status: "failed",
      itemCount: 0,
      errorMessage: error instanceof Error ? error.message : "Unknown DB error",
    });

    return {
      ok: false,
      jobName,
      sourceSystem: "aihot",
      status: "failed",
      itemCount: 0,
      message: error instanceof Error ? error.message : "Unknown DB error",
    };
  }
}

async function upsertSelectedItems(
  data: NormalizedItemsResponse,
): Promise<number> {
  const prisma = getPrisma();
  const fetchedAt = new Date(data.fetchedAt);

  for (const item of data.items) {
    const canonicalUrl = canonicalizeUrl(item.url);
    const canonicalUrlHash = sha256(canonicalUrl);

    await prisma.externalItem.upsert({
      where: {
        canonicalUrlHash,
      },
      create: {
        sourceSystem: "aihot",
        externalId: item.id,
        canonicalUrl,
        canonicalUrlHash,
        title: item.title,
        titleEn: item.titleEn,
        summary: item.summary,
        sourceName: item.sourceName,
        publishedAt: toDate(item.publishedAt),
        fetchedAt,
        category: item.category,
        tags: [],
        selected: true,
        raw: toPrismaJson(item.raw ?? item),
      },
      update: {
        canonicalUrl,
        title: item.title,
        titleEn: item.titleEn,
        summary: item.summary,
        sourceName: item.sourceName,
        publishedAt: toDate(item.publishedAt),
        fetchedAt,
        category: item.category,
        selected: true,
        raw: toPrismaJson(item.raw ?? item),
      },
    });
  }

  return data.items.length;
}

async function upsertDailyReport(data: NormalizedDailyReport): Promise<number> {
  const prisma = getPrisma();
  const report = await prisma.dailyReport.upsert({
    where: {
      sourceSystem_sourceDate: {
        sourceSystem: "aihot",
        sourceDate: data.sourceDate,
      },
    },
    create: {
      sourceSystem: "aihot",
      sourceDate: data.sourceDate,
      localDate: data.localDate,
      timezone: data.timezone,
      generatedAt: toDate(data.generatedAt),
      windowStart: toDate(data.windowStart),
      windowEnd: toDate(data.windowEnd),
      leadTitle: data.leadTitle,
      leadParagraph: data.leadParagraph,
      raw: toPrismaJson(data.raw ?? data),
    },
    update: {
      localDate: data.localDate,
      timezone: data.timezone,
      generatedAt: toDate(data.generatedAt),
      windowStart: toDate(data.windowStart),
      windowEnd: toDate(data.windowEnd),
      leadTitle: data.leadTitle,
      leadParagraph: data.leadParagraph,
      raw: toPrismaJson(data.raw ?? data),
    },
  });

  await prisma.dailyReportItem.deleteMany({
    where: { dailyReportId: report.id },
  });

  const itemRows = data.sections.flatMap((section, sectionIndex) =>
    section.items.map((item, itemIndex) => ({
      dailyReportId: report.id,
      sectionLabel: section.label,
      title: item.title,
      summary: item.summary,
      sourceName: item.sourceName,
      sourceUrl: item.sourceUrl,
      sortOrder: sectionIndex * 1000 + itemIndex,
      raw: toPrismaJson(item.raw ?? item),
    })),
  );

  if (itemRows.length > 0) {
    await prisma.dailyReportItem.createMany({
      data: itemRows,
    });
  }

  return itemRows.length;
}

async function writeFetchLog({
  jobName,
  startedAt,
  status,
  itemCount,
  errorMessage,
  metadata,
}: {
  jobName: string;
  startedAt: Date;
  status: "success" | "partial" | "failed";
  itemCount: number;
  errorMessage?: string;
  metadata?: Prisma.InputJsonValue;
}) {
  const prisma = getPrisma();
  await prisma.fetchLog.create({
    data: {
      jobName,
      sourceSystem: "aihot",
      status,
      startedAt,
      finishedAt: new Date(),
      itemCount,
      errorMessage,
      metadata: toNullablePrismaJson(metadata),
    },
  });
}
