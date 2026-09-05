/**
 * How a live metric should be rendered in the right rail.
 *
 * The fast loop and the delivery scorer both emit this so the UI never has to
 * hold threshold logic of its own.
 */
export enum MetricVerdict {
  GOOD = 'GOOD',
  WATCH = 'WATCH',
  POOR = 'POOR',
}
