/**
 * The disclaimer. Part 4 of the spec calls this non-negotiable, so it ships in
 * the root layout rather than on the sponsorship screen alone.
 *
 * Australia has no equivalent of a US DSO, and giving migration advice without
 * MARA registration is an offence — so this points somewhere a student can
 * legally be helped rather than at their education agent.
 */
export function DisclaimerBanner() {
  return (
    <p className="border-t border-line bg-surface-sunken px-6 py-3 text-center text-xs text-ink-muted">
      Sponsor Ready gives interview coaching, not migration advice. Check
      anything about your visa with a{" "}
      <span className="font-medium text-ink">MARA-registered migration agent</span>{" "}
      or your university&rsquo;s international student support team.
    </p>
  );
}
