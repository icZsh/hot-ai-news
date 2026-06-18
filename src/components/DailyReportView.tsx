import { formatDateKey, formatLocalDateTime } from "@/lib/app-time";
import type { NormalizedDailyReport } from "@/lib/aihot/types";

type DailyReportViewProps = {
  report: NormalizedDailyReport;
};

export function DailyReportView({ report }: DailyReportViewProps) {
  return (
    <div className="space-y-6">
      <section className="border-b border-[var(--line)] pb-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[var(--accent)]">
              AI 日报
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-normal text-[var(--foreground)]">
              {formatDateKey(report.localDate)}
            </h1>
          </div>
          <div className="text-sm leading-6 text-[var(--muted)]">
            <div>生成时间：{formatLocalDateTime(report.generatedAt)}</div>
            <div>AI HOT 原始日期：{report.sourceDate}</div>
          </div>
        </div>
        {report.leadTitle || report.leadParagraph ? (
          <div className="mt-5 rounded-md border border-[var(--line)] bg-[var(--panel)] p-4">
            {report.leadTitle ? (
              <h2 className="text-lg font-semibold tracking-normal">
                {report.leadTitle}
              </h2>
            ) : null}
            {report.leadParagraph ? (
              <p className="mt-2 text-sm leading-7 text-[var(--muted)]">
                {report.leadParagraph}
              </p>
            ) : null}
          </div>
        ) : null}
      </section>

      {report.sections.map((section) => (
        <section key={section.label} className="space-y-3">
          <h2 className="text-xl font-semibold tracking-normal text-[var(--foreground)]">
            {section.label}
          </h2>
          <div className="space-y-3">
            {section.items.map((item) => (
              <article
                key={`${section.label}-${item.sourceUrl}-${item.title}`}
                className="rounded-md border border-[var(--line)] bg-[var(--panel)] p-4 shadow-sm"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-[var(--muted)]">
                      {item.sourceName ?? "来源未知"}
                    </p>
                    <h3 className="mt-2 text-base font-semibold leading-7 tracking-normal text-[var(--foreground)]">
                      {item.title}
                    </h3>
                  </div>
                  <a
                    href={item.sourceUrl}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="w-fit shrink-0 rounded-md border border-[var(--line)] px-3 py-2 text-sm font-medium text-[var(--accent-strong)] transition hover:border-[var(--accent)] hover:bg-[var(--accent-soft)]"
                  >
                    原文
                  </a>
                </div>
                {item.summary ? (
                  <p className="mt-3 text-sm leading-7 text-[var(--foreground)]">
                    {item.summary}
                  </p>
                ) : null}
              </article>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
