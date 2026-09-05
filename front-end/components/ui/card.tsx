import clsx from "clsx";
import type { ReactNode } from "react";

export function Card({
  children,
  className,
  is_sunken = false,
}: {
  children: ReactNode;
  className?: string;
  is_sunken?: boolean;
}) {
  return (
    <section
      className={clsx(
        "rounded-xl border border-line",
        is_sunken ? "bg-surface-sunken" : "bg-surface",
        className,
      )}
    >
      {children}
    </section>
  );
}

export function CardHeader({
  title,
  hint,
  trailing,
}: {
  title: string;
  hint?: string;
  trailing?: ReactNode;
}) {
  return (
    <header className="flex items-start justify-between gap-4 border-b border-line px-5 py-4">
      <div className="min-w-0">
        <h2 className="text-sm font-semibold tracking-tight text-ink">{title}</h2>
        {hint ? (
          <p className="mt-1 text-xs leading-relaxed text-ink-muted">{hint}</p>
        ) : null}
      </div>
      {trailing}
    </header>
  );
}
