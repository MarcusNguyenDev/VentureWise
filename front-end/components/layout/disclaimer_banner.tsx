/**
 * The DSO line. Part 4 of the spec calls this non-negotiable, so it ships in
 * the root layout rather than on the sponsorship screen alone.
 */
export function DisclaimerBanner() {
  return (
    <p className="border-t border-line bg-surface-sunken px-6 py-3 text-center text-xs text-ink-muted">
      Sponsor Ready gives interview coaching, not immigration advice. Confirm
      anything about your status with your DSO before you rely on it.
    </p>
  );
}
