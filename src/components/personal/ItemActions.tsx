"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { getStatusLabel, type BookmarkStatus } from "@/lib/personal";

type PersonalState = {
  available: boolean;
  bookmark?: {
    id: string;
    status: BookmarkStatus;
    personalTags: string[];
  };
  note?: {
    id: string;
    content: string;
  };
  message?: string;
};

type ItemActionsProps = {
  targetType: "item" | "daily_item";
  targetId: string;
};

const statuses: BookmarkStatus[] = [
  "unread",
  "read",
  "research_later",
  "used_in_brief",
  "archived",
];

export function ItemActions({ targetType, targetId }: ItemActionsProps) {
  const [state, setState] = useState<PersonalState | null>(null);
  const [note, setNote] = useState("");
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  const isBookmarked = Boolean(state?.bookmark);
  const disabled = state?.available === false || isPending;

  useEffect(() => {
    let cancelled = false;

    fetch(`/api/bookmarks?targetType=${targetType}&targetId=${targetId}`)
      .then((response) => response.json() as Promise<PersonalState>)
      .then((nextState) => {
        if (!cancelled) {
          setState(nextState);
          setNote(nextState.note?.content ?? "");
          setMessage(nextState.message ?? "");
        }
      })
      .catch(() => {
        if (!cancelled) {
          setMessage("个人操作暂时不可用。");
        }
      });

    return () => {
      cancelled = true;
    };
  }, [targetId, targetType]);

  const statusValue = state?.bookmark?.status ?? "unread";

  const noteDirty = useMemo(
    () => note.trim() !== (state?.note?.content ?? ""),
    [note, state?.note?.content],
  );

  function saveBookmark(status: BookmarkStatus = statusValue) {
    startTransition(async () => {
      const response = await fetch("/api/bookmarks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetType, targetId, status }),
      });
      const nextState = (await response.json()) as PersonalState;
      setState(nextState);
      setMessage(nextState.message ?? (response.ok ? "收藏已保存。" : "保存失败。"));
    });
  }

  function removeBookmark() {
    startTransition(async () => {
      const response = await fetch(
        `/api/bookmarks?targetType=${targetType}&targetId=${targetId}`,
        { method: "DELETE" },
      );
      const nextState = (await response.json()) as PersonalState;
      setState(nextState);
      setMessage(nextState.message ?? (response.ok ? "已取消收藏。" : "取消失败。"));
    });
  }

  function saveNote() {
    startTransition(async () => {
      const response = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetType, targetId, content: note }),
      });
      const nextState = (await response.json()) as PersonalState;
      setState(nextState);
      setMessage(nextState.message ?? (response.ok ? "备注已保存。" : "备注保存失败。"));
    });
  }

  return (
    <div className="mt-4 border-t border-[var(--line)] pt-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap gap-2">
          {isBookmarked ? (
            <button
              type="button"
              onClick={removeBookmark}
              disabled={disabled}
              className="rounded-md border border-[var(--line)] px-3 py-2 text-sm font-medium text-[var(--foreground)] transition hover:border-[var(--danger-border)] hover:text-[var(--danger)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              取消收藏
            </button>
          ) : (
            <button
              type="button"
              onClick={() => saveBookmark("unread")}
              disabled={disabled}
              className="rounded-md border border-[var(--accent)] bg-[var(--accent)] px-3 py-2 text-sm font-medium text-white transition hover:bg-[var(--accent-strong)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              收藏
            </button>
          )}
          <select
            value={statusValue}
            onChange={(event) => saveBookmark(event.target.value as BookmarkStatus)}
            disabled={disabled}
            className="rounded-md border border-[var(--line)] bg-[var(--input)] px-3 py-2 text-sm text-[var(--foreground)] disabled:cursor-not-allowed disabled:opacity-60"
            aria-label="收藏状态"
          >
            {statuses.map((status) => (
              <option key={status} value={status}>
                {getStatusLabel(status)}
              </option>
            ))}
          </select>
        </div>
        {message ? <p className="text-xs text-[var(--muted)]">{message}</p> : null}
      </div>
      <div className="mt-3 flex flex-col gap-2 sm:flex-row">
        <textarea
          value={note}
          onChange={(event) => setNote(event.target.value)}
          placeholder="写一点自己的判断..."
          disabled={state?.available === false}
          rows={2}
          className="min-h-20 flex-1 resize-y rounded-md border border-[var(--line)] bg-[var(--input)] px-3 py-2 text-sm leading-6 text-[var(--foreground)] disabled:cursor-not-allowed disabled:opacity-60"
        />
        <button
          type="button"
          onClick={saveNote}
          disabled={state?.available === false || isPending || !noteDirty}
          className="h-fit rounded-md border border-[var(--line)] px-3 py-2 text-sm font-medium text-[var(--accent-strong)] transition hover:border-[var(--accent)] hover:bg-[var(--accent-soft)] disabled:cursor-not-allowed disabled:opacity-60"
        >
          保存备注
        </button>
      </div>
    </div>
  );
}
