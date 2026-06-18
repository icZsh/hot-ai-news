import { ItemCard } from "@/components/ItemCard";
import { StatusBanner } from "@/components/StatusBanner";
import { getStatusLabel } from "@/lib/personal";
import { listBookmarkedItems } from "@/lib/services/personal";

export const dynamic = "force-dynamic";

type BookmarksPageProps = {
  searchParams?: Promise<{
    status?: string;
  }>;
};

export default async function BookmarksPage({
  searchParams,
}: BookmarksPageProps) {
  const params = await searchParams;
  const status = params?.status ?? "all";
  const result = await listBookmarkedItems({ status });

  return (
    <main className="mx-auto max-w-6xl px-5 py-8">
      <section className="mb-6 border-b border-[var(--line)] pb-6">
        <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[var(--accent)]">
          已保存
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-normal">收藏夹</h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--muted)]">
          这里用于沉淀后续周报、投资观察和技术学习素材。
        </p>
      </section>

      {!result.ok ? (
        <StatusBanner title="收藏暂不可用" description={result.message} />
      ) : result.items.length === 0 ? (
        <StatusBanner title="还没有收藏" description="同步数据并收藏条目后，这里会显示你的个人情报素材。" />
      ) : (
        <div className="space-y-4">
          {result.items.map((item) => (
            <div key={item.id} className="space-y-2">
              <div className="flex flex-wrap gap-2 text-xs text-[var(--muted)]">
                <span>状态：{getStatusLabel(item.bookmarkStatus)}</span>
                {item.note ? <span>有备注</span> : null}
              </div>
              <ItemCard item={item} />
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
