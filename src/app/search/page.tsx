import { ItemCard } from "@/components/ItemCard";
import { StatusBanner } from "@/components/StatusBanner";
import { searchLocalItems } from "@/lib/services/personal";

export const dynamic = "force-dynamic";

type SearchPageProps = {
  searchParams?: Promise<{
    q?: string;
  }>;
};

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const query = params?.q?.trim() ?? "";
  const result = query ? await searchLocalItems(query) : null;

  return (
    <main className="mx-auto max-w-6xl px-5 py-8">
      <section className="mb-6 border-b border-[var(--line)] pb-6">
        <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[var(--accent)]">
          Search
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-normal">本地搜索</h1>
        <form className="mt-5 flex flex-col gap-2 sm:flex-row">
          <input
            name="q"
            defaultValue={query}
            placeholder="搜索标题、摘要、来源、备注..."
            className="min-h-11 flex-1 rounded-md border border-[var(--line)] bg-[var(--input)] px-3 py-2 text-sm text-[var(--foreground)] placeholder:text-[var(--muted)]"
          />
          <button
            type="submit"
            className="rounded-md border border-[var(--accent)] bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white transition hover:bg-[var(--accent-strong)]"
          >
            搜索
          </button>
        </form>
      </section>

      {!query ? (
        <StatusBanner title="输入关键词开始搜索" description="搜索范围包括本地已归档条目的标题、摘要、来源和个人备注。" />
      ) : !result?.ok ? (
        <StatusBanner title="搜索暂不可用" description={result?.message ?? "本地搜索暂不可用。"} />
      ) : result.items.length === 0 ? (
        <StatusBanner title="没有找到结果" description="换个关键词试试，或者先同步更多 AI HOT 数据。" />
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-[var(--muted)]">找到 {result.items.length} 条结果</p>
          {result.items.map((item) => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </main>
  );
}
