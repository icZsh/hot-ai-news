import { formatLocalDateTime } from "@/lib/app-time";
import type { NormalizedItem } from "@/lib/aihot/types";
import { getCategoryLabel } from "@/lib/categories";
import { ItemActions } from "./personal/ItemActions";

type ItemCardProps = {
  item: NormalizedItem;
};

export function ItemCard({ item }: ItemCardProps) {
  const originalTitle = getDisplayableOriginalTitle(item.titleEn);

  return (
    <article className="rounded-md border border-[var(--line)] bg-[var(--panel)] p-4 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-[var(--muted)]">
            <span>{item.sourceName}</span>
            <span aria-hidden="true">/</span>
            <span>{formatLocalDateTime(item.publishedAt)}</span>
            {item.category ? (
              <>
                <span aria-hidden="true">/</span>
                <span className="rounded-sm bg-[var(--accent-soft)] px-2 py-1 text-[var(--accent-strong)]">
                  {getCategoryLabel(item.category)}
                </span>
              </>
            ) : null}
          </div>
          <h2 className="mt-3 text-lg font-semibold leading-7 tracking-normal text-[var(--foreground)]">
            {item.title}
          </h2>
          {originalTitle ? (
            <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
              {originalTitle}
            </p>
          ) : null}
        </div>
        <a
          href={item.url}
          target="_blank"
          rel="noreferrer noopener"
          className="w-fit shrink-0 rounded-md border border-[var(--line)] px-3 py-2 text-sm font-medium text-[var(--accent-strong)] transition hover:border-[var(--accent)] hover:bg-[var(--accent-soft)]"
        >
          原文
        </a>
      </div>
      {item.summary ? (
        <p className="mt-4 text-sm leading-7 text-[var(--foreground)]">
          {item.summary}
        </p>
      ) : null}
      <ItemActions targetType="item" targetId={item.id} />
    </article>
  );
}

function getDisplayableOriginalTitle(value?: string): string | null {
  const title = value?.trim();
  if (!title) {
    return null;
  }

  const normalized = title.replace(/^https?：\/\//i, "http://");
  if (/^https?:\/\//i.test(normalized)) {
    return null;
  }

  if (title.endsWith("...") || title.endsWith("…")) {
    return null;
  }

  return title;
}
