import "server-only";
import type { DailyReport, DailyReportItem } from "@prisma/client";
import { fetchDailyBySourceDate, fetchLatestDaily } from "@/lib/aihot/adapter";
import type {
  AdapterResult,
  NormalizedDailyReport,
} from "@/lib/aihot/types";
import { APP_TIMEZONE } from "@/lib/app-time";
import { hasDatabaseUrl, getPrisma } from "@/lib/db";

type DailySource = "database" | "remote";

export type DailyPageResult = AdapterResult<NormalizedDailyReport> & {
  source: DailySource;
  warning?: string;
};

export async function getLatestDailyForPage(
  revalidate?: number,
): Promise<DailyPageResult> {
  if (hasDatabaseUrl()) {
    try {
      const local = await findLatestLocalDaily();
      if (local) {
        return {
          ok: true,
          source: "database",
          data: local,
        };
      }
    } catch (error) {
      const remote = await fetchLatestDaily({ revalidate });

      return {
        ...remote,
        source: "remote",
        warning:
          error instanceof Error
            ? `本地日报读取失败，正在显示远端数据：${error.message}`
            : "本地日报读取失败，正在显示远端数据。",
      };
    }
  }

  return {
    ...(await fetchLatestDaily({ revalidate })),
    source: "remote",
    warning: hasDatabaseUrl()
      ? undefined
      : "DATABASE_URL 未配置，当前直接显示 AI HOT 远端日报。",
  };
}

export async function getDailyByLocalDateForPage(
  localDate: string,
  revalidate?: number,
): Promise<DailyPageResult> {
  if (hasDatabaseUrl()) {
    try {
      const local = await findLocalDailyByLocalDate(localDate);
      if (local) {
        return {
          ok: true,
          source: "database",
          data: local,
        };
      }
    } catch (error) {
      const remote = await fetchDailyBySourceDate(localDate, { revalidate });

      return {
        ...remote,
        source: "remote",
        warning:
          error instanceof Error
            ? `本地日报读取失败，正在显示远端数据：${error.message}`
            : "本地日报读取失败，正在显示远端数据。",
      };
    }
  }

  return {
    ...(await fetchDailyBySourceDate(localDate, { revalidate })),
    source: "remote",
    warning: hasDatabaseUrl()
      ? undefined
      : "DATABASE_URL 未配置，当前直接显示 AI HOT 远端日报。",
  };
}

export async function findLatestLocalDaily(): Promise<NormalizedDailyReport | null> {
  const prisma = getPrisma();
  const report = await prisma.dailyReport.findFirst({
    where: { sourceSystem: "aihot" },
    orderBy: [{ localDate: "desc" }, { generatedAt: "desc" }],
    include: {
      items: {
        orderBy: { sortOrder: "asc" },
      },
    },
  });

  return report ? mapDailyReport(report) : null;
}

export async function findLocalDailyByLocalDate(
  localDate: string,
): Promise<NormalizedDailyReport | null> {
  const prisma = getPrisma();
  const report = await prisma.dailyReport.findUnique({
    where: {
      sourceSystem_localDate: {
        sourceSystem: "aihot",
        localDate,
      },
    },
    include: {
      items: {
        orderBy: { sortOrder: "asc" },
      },
    },
  });

  return report ? mapDailyReport(report) : null;
}

function mapDailyReport(
  report: DailyReport & { items: DailyReportItem[] },
): NormalizedDailyReport {
  const fetchedAt = report.updatedAt.toISOString();
  const sectionMap = new Map<string, DailyReportItem[]>();

  for (const item of report.items) {
    const sectionItems = sectionMap.get(item.sectionLabel) ?? [];
    sectionItems.push(item);
    sectionMap.set(item.sectionLabel, sectionItems);
  }

  return {
    sourceDate: report.sourceDate,
    localDate: report.localDate,
    timezone: report.timezone || APP_TIMEZONE,
    generatedAt: report.generatedAt?.toISOString(),
    windowStart: report.windowStart?.toISOString(),
    windowEnd: report.windowEnd?.toISOString(),
    leadTitle: report.leadTitle ?? undefined,
    leadParagraph: report.leadParagraph ?? undefined,
    fetchedAt,
    sections: Array.from(sectionMap.entries()).map(([label, items]) => ({
      label,
      items: items.map((item) => ({
        title: item.title,
        summary: item.summary ?? undefined,
        sourceName: item.sourceName ?? undefined,
        sourceUrl: item.sourceUrl,
      })),
    })),
  };
}
