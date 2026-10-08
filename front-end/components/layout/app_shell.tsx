"use client";

import clsx from "clsx";
import Link, { useLinkStatus } from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { useActiveSession } from "@/lib/navigation/use_active_session";
import { ThemeToggle } from "./theme_toggle";

interface NavigationItem {
  label: string;
  /** Null when the destination needs a session and there is none yet. */
  href: string | null;
  isActive: (pathname: string) => boolean;
  /** Shown as a tooltip while the item is unavailable. */
  unavailable_hint?: string;
}

const PRACTICE_PATH_PATTERN = /^\/practice\/([^/]+)/;

/**
 * One header for every route, rendered once by the root layout.
 *
 * The items never change between pages — only which one is active and whether
 * Practice has a session to go back to — so the nav does not reshuffle under
 * the cursor, and the header is not torn down and rebuilt on every route.
 */
function buildNavigationItems(
  active_session_id: string | null,
): NavigationItem[] {
  return [
    {
      label: "Start",
      href: "/",
      isActive: (pathname) => pathname === "/",
    },
    {
      label: "Practice",
      href: active_session_id ? `/practice/${active_session_id}` : null,
      isActive: (pathname) => PRACTICE_PATH_PATTERN.test(pathname),
      unavailable_hint: "Start a session first",
    },
    {
      label: "CV review",
      href: "/cv-review",
      isActive: (pathname) => pathname.startsWith("/cv-review"),
    },
    {
      label: "Sponsorship drill",
      href: "/sponsorship",
      isActive: (pathname) => pathname.startsWith("/sponsorship"),
    },
  ];
}

const NAVIGATION_ITEM_CLASS =
  "relative shrink-0 whitespace-nowrap rounded-md px-3 py-1.5 text-xs font-medium transition-colors";

/** Dynamic routes are not prefetched in full, so show the click registered. */
function PendingIndicator() {
  const { pending } = useLinkStatus();

  return (
    <span
      aria-hidden
      className={clsx(
        "absolute inset-x-3 -bottom-px h-px origin-left bg-accent transition-transform duration-300",
        pending ? "scale-x-100 animate-pulse" : "scale-x-0",
      )}
    />
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const session_id_in_url = PRACTICE_PATH_PATTERN.exec(pathname)?.[1] ?? null;
  const active_session_id = useActiveSession(session_id_in_url);

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <header className="sticky top-0 z-20 border-b border-line bg-canvas/85 backdrop-blur-sm">
        <div className="mx-auto flex h-14 w-full max-w-[1400px] items-center gap-4 px-4 sm:gap-6 sm:px-6">
          <Link href="/" className="flex shrink-0 items-baseline gap-2">
            <span className="text-2xl font-bold leading-none text-accent">
              VentureWise
            </span>
            <span className="hidden text-[11px] text-ink-faint xl:inline">
              interview coaching for international students in Australia
            </span>
          </Link>

          <nav
            aria-label="Primary"
            className="-mx-1 ml-auto flex min-w-0 items-center gap-1 overflow-x-auto px-1 [scrollbar-width:none]"
          >
            {buildNavigationItems(active_session_id).map((item) => {
              const is_active = item.isActive(pathname);

              if (!item.href) {
                return (
                  <span
                    key={item.label}
                    aria-disabled="true"
                    title={item.unavailable_hint}
                    className={clsx(
                      NAVIGATION_ITEM_CLASS,
                      "cursor-not-allowed text-ink-faint/60",
                    )}
                  >
                    {item.label}
                  </span>
                );
              }

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  aria-current={is_active ? "page" : undefined}
                  className={clsx(
                    NAVIGATION_ITEM_CLASS,
                    is_active
                      ? "bg-surface-sunken text-ink"
                      : "text-ink-muted hover:bg-surface-sunken/60 hover:text-ink",
                  )}
                >
                  {item.label}
                  <PendingIndicator />
                </Link>
              );
            })}
          </nav>

          <ThemeToggle />
        </div>
      </header>

      <main className="flex flex-1 flex-col">{children}</main>
    </div>
  );
}
