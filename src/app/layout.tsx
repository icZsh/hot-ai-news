import type { Metadata } from "next";
import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";
import "./globals.css";

export const metadata: Metadata = {
  title: "Hot AI News",
  description: "A personal AI intelligence desk powered by AI HOT.",
};

const navItems = [
  { href: "/", label: "今日精选" },
  { href: "/daily", label: "AI 日报" },
  { href: "/bookmarks", label: "收藏" },
  { href: "/review", label: "本周回顾" },
];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var savedTheme = window.localStorage.getItem("hot-ai-news-theme");
                var prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
                document.documentElement.dataset.theme = savedTheme || (prefersDark ? "dark" : "light");
              } catch (error) {
                document.documentElement.dataset.theme = "light";
              }
            `,
          }}
        />
      </head>
      <body>
        <div className="min-h-screen">
          <header className="border-b border-[var(--line)] bg-[var(--header)] backdrop-blur">
            <div className="mx-auto flex max-w-6xl flex-col gap-3 px-5 py-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start justify-between gap-3">
                  <Link href="/" className="group w-fit">
                    <div className="text-sm font-semibold uppercase tracking-[0.12em] text-[var(--accent)]">
                      Hot AI News
                    </div>
                    <div className="mt-1 text-xl font-semibold tracking-normal text-[var(--foreground)]">
                      Isaac AI Radar
                    </div>
                  </Link>
                  <div className="sm:hidden">
                    <ThemeToggle />
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <nav className="flex flex-wrap gap-2" aria-label="Primary">
                    {navItems.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="rounded-md border border-[var(--line)] bg-[var(--panel)] px-3 py-2 text-sm font-medium text-[var(--foreground)] transition hover:border-[var(--accent)] hover:text-[var(--accent-strong)]"
                      >
                        {item.label}
                      </Link>
                    ))}
                  </nav>
                  <div className="hidden sm:block">
                    <ThemeToggle />
                  </div>
                </div>
              </div>
              <form action="/search" className="flex w-full gap-2 sm:max-w-xl sm:self-end">
                <input
                  type="search"
                  name="q"
                  placeholder="搜索标题、摘要、来源、备注"
                  className="min-h-11 min-w-0 flex-1 rounded-md border border-[var(--line)] bg-[var(--input)] px-3 py-2 text-sm text-[var(--foreground)] outline-none transition placeholder:text-[var(--muted)] focus:border-[var(--accent)]"
                />
                <button
                  type="submit"
                  className="rounded-md border border-[var(--accent)] bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white transition hover:bg-[var(--accent-strong)]"
                >
                  搜索
                </button>
              </form>
            </div>
          </header>
          {children}
        </div>
      </body>
    </html>
  );
}
