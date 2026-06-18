"use client";

import { Moon, Sun } from "lucide-react";
import { useState } from "react";

type Theme = "light" | "dark";

const storageKey = "hot-ai-news-theme";

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);
  const isDark = theme === "dark";

  function toggleTheme() {
    const nextTheme = theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = nextTheme;
    window.localStorage.setItem(storageKey, nextTheme);
    setTheme(nextTheme);
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="inline-flex size-10 shrink-0 items-center justify-center rounded-md border border-[var(--line)] bg-[var(--panel)] text-[var(--foreground)] transition hover:border-[var(--accent)] hover:text-[var(--accent-strong)]"
      aria-label={isDark ? "当前深色模式，切换浅色模式" : "当前浅色模式，切换深色模式"}
      title={isDark ? "深色模式" : "浅色模式"}
      suppressHydrationWarning
    >
      {isDark ? (
        <Moon aria-hidden="true" size={18} strokeWidth={2} />
      ) : (
        <Sun aria-hidden="true" size={18} strokeWidth={2} />
      )}
    </button>
  );
}

function getInitialTheme(): Theme {
  if (typeof document === "undefined") {
    return "light";
  }

  return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
}
