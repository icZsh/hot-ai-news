import { NextResponse } from "next/server";
import { fetchDailyIndex } from "@/lib/aihot/adapter";
import { hasDatabaseUrl, getPrisma } from "@/lib/db";

export async function GET() {
  if (hasDatabaseUrl()) {
    try {
      const prisma = getPrisma();
      const reports = await prisma.dailyReport.findMany({
        where: { sourceSystem: "aihot" },
        orderBy: [{ localDate: "desc" }, { generatedAt: "desc" }],
        take: 30,
      });

      if (reports.length > 0) {
        return NextResponse.json({
          ok: true,
          source: "database",
          data: {
            count: reports.length,
            fetchedAt: new Date().toISOString(),
            items: reports.map((report) => ({
              sourceDate: report.sourceDate,
              localDate: report.localDate,
              generatedAt: report.generatedAt?.toISOString(),
              leadTitle: report.leadTitle ?? undefined,
              leadParagraph: report.leadParagraph ?? undefined,
            })),
          },
        });
      }
    } catch {
      // Fall through to remote index.
    }
  }

  const remote = await fetchDailyIndex({ revalidate: 300 });
  return NextResponse.json(
    {
      ...remote,
      source: "remote",
      warning: hasDatabaseUrl()
        ? "本地日报索引不可用，正在显示 AI HOT 远端索引。"
        : "DATABASE_URL 未配置，当前直接显示 AI HOT 远端索引。",
    },
    { status: remote.ok ? 200 : 502 },
  );
}
