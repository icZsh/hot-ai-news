"use client";

import { useState } from "react";

type MarkdownExportProps = {
  markdown: string;
};

export function MarkdownExport({ markdown }: MarkdownExportProps) {
  const [message, setMessage] = useState("");

  async function copyMarkdown() {
    if (!markdown) {
      return;
    }

    await navigator.clipboard.writeText(markdown);
    setMessage("已复制 Markdown。");
  }

  return (
    <div className="rounded-md border border-[var(--line)] bg-[var(--panel)] p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-base font-semibold">周报素材 Markdown</h2>
        <button
          type="button"
          onClick={copyMarkdown}
          disabled={!markdown}
          className="w-fit rounded-md border border-[var(--line)] px-3 py-2 text-sm font-medium text-[var(--accent-strong)] transition hover:border-[var(--accent)] hover:bg-[var(--accent-soft)] disabled:cursor-not-allowed disabled:opacity-60"
        >
          复制
        </button>
      </div>
      <textarea
        readOnly
        value={markdown || "本周还没有可导出的收藏素材。"}
        rows={10}
        className="mt-3 w-full resize-y rounded-md border border-[var(--line)] bg-[var(--input)] px-3 py-2 text-sm leading-6 text-[var(--foreground)]"
      />
      {message ? <p className="mt-2 text-xs text-[var(--muted)]">{message}</p> : null}
    </div>
  );
}
