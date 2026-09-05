import type { MetricVerdict } from "@/lib/api/api_contracts";

/**
 * The one place verdict colour is decided.
 *
 * Colour carries meaning here, so it is never chosen at a call site and never
 * reused for decoration.
 */

export const VERDICT_TEXT_CLASS: Record<MetricVerdict, string> = {
  GOOD: "text-good",
  WATCH: "text-watch",
  POOR: "text-poor",
};

export const VERDICT_BAR_CLASS: Record<MetricVerdict, string> = {
  GOOD: "bg-good",
  WATCH: "bg-watch",
  POOR: "bg-poor",
};

export const VERDICT_SOFT_CLASS: Record<MetricVerdict, string> = {
  GOOD: "bg-good-soft",
  WATCH: "bg-watch-soft",
  POOR: "bg-poor-soft",
};

export const VERDICT_LABEL: Record<MetricVerdict, string> = {
  GOOD: "ok",
  WATCH: "watch",
  POOR: "fix",
};
