/**
 * Marks output that came from fixtures rather than a model.
 *
 * The API stamps `is_stubbed` on everything that crosses the AI boundary, and
 * this is what makes that visible. It exists so nobody — on stage or in review
 * — mistakes placeholder text for a real critique.
 */
export function StubBadge({ label = "Awaiting AI" }: { label?: string }) {
  return (
    <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-stub-soft px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-stub">
      <span
        aria-hidden
        className="size-1.5 rounded-full bg-stub"
      />
      {label}
    </span>
  );
}
