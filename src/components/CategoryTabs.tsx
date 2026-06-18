import Link from "next/link";
import { categories } from "@/lib/categories";

type CategoryTabsProps = {
  activeCategory: string;
};

export function CategoryTabs({ activeCategory }: CategoryTabsProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1" aria-label="分类筛选">
      {categories.map((category) => {
        const active = category.value === activeCategory;
        const href = category.value === "all" ? "/" : `/?category=${category.value}`;

        return (
          <Link
            key={category.value}
            href={href}
            className={[
              "shrink-0 rounded-md border px-3 py-2 text-sm font-medium transition",
              active
                ? "border-[var(--accent)] bg-[var(--accent)] text-white"
                : "border-[var(--line)] bg-[var(--panel)] text-[var(--foreground)] hover:border-[var(--accent)] hover:text-[var(--accent-strong)]",
            ].join(" ")}
            aria-current={active ? "page" : undefined}
          >
            {category.label}
          </Link>
        );
      })}
    </div>
  );
}
