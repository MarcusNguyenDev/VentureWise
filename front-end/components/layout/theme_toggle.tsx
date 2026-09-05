"use client";

import clsx from "clsx";

import { useTheme, type ThemeChoice } from "@/lib/theme/use_theme";

const THEME_OPTIONS: { value: ThemeChoice; label: string }[] = [
  { value: "light", label: "Light" },
  { value: "system", label: "Auto" },
  { value: "dark", label: "Dark" },
];

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div
      role="radiogroup"
      aria-label="Colour theme"
      className="flex items-center gap-0.5 rounded-lg border border-line bg-surface p-0.5"
    >
      {THEME_OPTIONS.map((option) => (
        <button
          key={option.value}
          role="radio"
          aria-checked={theme === option.value}
          onClick={() => setTheme(option.value)}
          className={clsx(
            "rounded-md px-2.5 py-1 text-[11px] font-medium transition-colors",
            theme === option.value
              ? "bg-surface-sunken text-ink"
              : "text-ink-faint hover:text-ink-muted",
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
