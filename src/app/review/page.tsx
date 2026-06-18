import { ItemCard } from "@/components/ItemCard";
import { StatusBanner } from "@/components/StatusBanner";
import { MarkdownExport } from "@/components/personal/MarkdownExport";
import { formatDateKey, getLocalWeekRange } from "@/lib/app-time";
import { makeWeeklyMarkdown, listBookmarkedItems } from "@/lib/services/personal";

export const dynamic = "force-dynamic";

export default async function ReviewPage() {
  const week = getLocalWeekRange();
  const result = await listBookmarkedItems({ weeklyOnly: true });
  const markdown = result.ok ? makeWeeklyMarkdown(result.items) : "";

  return (
    <main className="mx-auto max-w-6xl px-5 py-8">
      <section className="mb-6 border-b border-[var(--line)] pb-6">
        <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[var(--accent)]">
          Weekly Review
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-normal">本周回顾</h1>
        <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
          {formatDateKey(week.startKey)} - {formatDateKey(week.endKey)}
        </p>
      </section>

      {!result.ok ? (
        <StatusBanner title="本周回顾暂不可用" description={result.message} />
      ) : (
        <div className="space-y-6">
          <MarkdownExport markdown={markdown} />
          {result.items.length === 0 ? (
            <StatusBanner title="本周还没有收藏素材" description="收藏一些条目并写下备注后，这里会自动整理成周报素材。" />
          ) : (
            <div className="space-y-4">
              {result.items.map((item) => (
                <ItemCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </div>
      )}
    </main>
  );
}
