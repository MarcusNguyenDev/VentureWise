"use client";

import clsx from "clsx";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { ThemeToggle } from "./theme_toggle";

interface NavigationLink {
  href: string;
  label: string;
}

export function AppShell({
  children,
  navigation_links = [],
}: {
  children: ReactNode;
  navigation_links?: NavigationLink[];
}) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <header className="sticky top-0 z-20 border-b border-line bg-canvas/85 backdrop-blur-sm">
        <div className="mx-auto flex h-14 w-full max-w-[1400px] items-center gap-6 px-6">
          <Link href="/" className="flex items-baseline gap-2">
            {/* The wordmark, and only the wordmark — see the note in
                globals.css on why the script stops here. */}
            <span className="font-display text-2xl leading-none text-ink">
              VentureWise
            </span>
            <span className="hidden text-[11px] text-ink-faint sm:inline">
              interview coaching for international students in Australia
            </span>
          </Link>

          <nav className="ml-auto flex items-center gap-1">
            {navigation_links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={clsx(
                  "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                  pathname === link.href
                    ? "bg-surface-sunken text-ink"
                    : "text-ink-muted hover:text-ink",
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <ThemeToggle />
        </div>
      </header>

      <main className="flex flex-1 flex-col">{children}</main>
    </div>
  );
}
