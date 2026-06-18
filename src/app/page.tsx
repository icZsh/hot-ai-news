import { CategoryTabs } from "@/components/CategoryTabs";
import { ItemCard } from "@/components/ItemCard";
import { StatusBanner } from "@/components/StatusBanner";
import { formatLocalDateTime } from "@/lib/app-time";
import { categories } from "@/lib/categories";
import { getItemsForPage } from "@/lib/services/items";

export const revalidate = 300;
export const dynamic = "force-dynamic";

type HomePageProps = {
  searchParams?: Promise<{
    category?: string;
  }>;
};

export default async function HomePage({ searchParams }: HomePageProps) {
  const params = await searchParams;
  const requestedCategory = params?.category ?? "all";
  const activeCategory = categories.some(
    (category) => category.value === requestedCategory,
  )
    ? requestedCategory
    : "all";

  const result = await getItemsForPage({
    category: activeCategory,
    take: 100,
    revalidate,
  });

  return (
    <main>
      <section className="border-b border-[var(--line)] bg-[var(--panel)]">
        <div className="mx-auto max-w-6xl px-5 py-6">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[var(--accent)]">
              今日精选
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-normal text-[var(--foreground)] sm:text-4xl">
              AI 精选动态
            </h1>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-6">
        <div className="mb-5">
          <CategoryTabs activeCategory={activeCategory} />
        </div>

        {!result.ok ? (
          <StatusBanner
            tone="error"
            title="远端暂时不可用"
            description={result.error.message}
          />
        ) : null}

        {result.ok && result.warning ? (
          <div className="mb-4">
            <StatusBanner title="正在使用降级数据源" description={result.warning} />
          </div>
        ) : null}

        {result.ok && result.data.items.length === 0 ? (
          <StatusBanner
            title="还没有精选内容"
            description="当前分类没有返回内容，可以切回全部或稍后再试。"
          />
        ) : null}

        {result.ok ? (
          <div className="space-y-4">
            <div className="flex flex-col gap-2 text-sm text-[var(--muted)] sm:flex-row sm:items-center sm:justify-between">
              <span>共 {result.data.count} 条结果</span>
              <span>拉取时间：{formatLocalDateTime(result.data.fetchedAt)}</span>
            </div>
            <div className="space-y-4">
              {result.data.items.map((item) => (
                <ItemCard key={item.id} item={item} />
              ))}
            </div>
          </div>
        ) : null}
      </section>
    </main>
  );
}
