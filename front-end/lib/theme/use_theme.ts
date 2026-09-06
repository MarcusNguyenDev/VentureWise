"use client";

import { useCallback, useEffect, useSyncExternalStore } from "react";

/**
 * Light, dark, or follow the system.
 *
 * The stored choice is an external store rather than component state, so the
 * hook subscribes to it instead of copying it into state inside an effect. The
 * only effect here writes to the DOM, which is what effects are for.
 */

export type ThemeChoice = "light" | "dark" | "system";

// Renamed with the product. Anyone who had chosen a theme under the old key
// falls back to "system" once, which is the correct default anyway.
const THEME_STORAGE_KEY = "venturewise_theme";

const store_listeners = new Set<() => void>();

function subscribeToStoredTheme(listener: () => void): () => void {
  store_listeners.add(listener);
  return () => store_listeners.delete(listener);
}

function notifyStoredThemeChanged(): void {
  store_listeners.forEach((listener) => listener());
}

function readStoredTheme(): ThemeChoice {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === "light" || stored === "dark" || stored === "system") {
      return stored;
    }
  } catch {
    // Private windows and blocked site data both throw here; the default is fine.
  }

  return "system";
}

/** The server has no stored preference, so it always renders the system theme. */
function readServerTheme(): ThemeChoice {
  return "system";
}

function applyTheme(choice: ThemeChoice): void {
  const root = document.documentElement;

  if (choice === "system") {
    root.removeAttribute("data-theme");
    return;
  }

  root.setAttribute("data-theme", choice);
}

export function useTheme(): {
  theme: ThemeChoice;
  setTheme: (choice: ThemeChoice) => void;
} {
  const theme = useSyncExternalStore(
    subscribeToStoredTheme,
    readStoredTheme,
    readServerTheme,
  );

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const setTheme = useCallback((choice: ThemeChoice) => {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, choice);
    } catch {
      // Not being able to remember the choice is not worth failing over.
    }

    notifyStoredThemeChanged();
  }, []);

  return { theme, setTheme };
}
