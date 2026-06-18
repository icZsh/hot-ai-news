import Link from "next/link";
import { DailyReportView } from "@/components/DailyReportView";
import { StatusBanner } from "@/components/StatusBanner";
import { getLatestDailyForPage } from "@/lib/services/daily";

export const revalidate = 300;
export const dynamic = "force-dynamic";

export default async function DailyPage() {
  const result = await getLatestDailyForPage(revalidate);

  return (
    <main className="mx-auto max-w-6xl px-5 py-8">
      {!result.ok ? (
        <div className="space-y-5">
          <StatusBanner
            tone="error"
            title="日报暂时不可用"
            description={result.error.message}
          />
          <Link
            href="/"
            className="inline-flex rounded-md border border-[var(--line)] bg-[var(--panel)] px-3 py-2 text-sm font-medium text-[var(--accent-strong)] transition hover:border-[var(--accent)] hover:bg-[var(--accent-soft)]"
          >
            返回今日精选
          </Link>
        </div>
      ) : (
        <div className="space-y-5">
          {result.warning ? (
            <StatusBanner title="正在使用降级数据源" description={result.warning} />
          ) : null}
          <div className="text-sm text-[var(--muted)]">
            当前来源：
            {result.source === "database" ? "本地缓存" : "AI HOT 远端"}
          </div>
          <DailyReportView report={result.data} />
        </div>
      )}
    </main>
  );
}
