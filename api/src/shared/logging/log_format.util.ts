// eslint-disable-next-line @typescript-eslint/no-require-imports
import chalk = require('chalk');

/**
 * Every colour decision in one place.
 *
 * Colour carries meaning in these logs — a red duration means "this is the
 * thing making the app feel slow" — so it is never chosen at a call site.
 *
 * chalk is pinned to v4 deliberately: v5 is pure ESM and this is a CommonJS
 * Nest build, so v5 fails at require time.
 *
 * The import is `import chalk = require(...)` rather than a default import
 * because this tsconfig sets `allowSyntheticDefaultImports` without
 * `esModuleInterop`. A default import therefore typechecks but compiles to
 * `chalk_1.default`, which is undefined for a CommonJS module — it fails at
 * runtime, not build time. Import-equals is the correct form here, and it is
 * local to this file rather than a project-wide compiler flag change.
 */

/** Anything slower than this in the request path is worth noticing. */
const SLOW_MS = 300;
const VERY_SLOW_MS = 1500;

export function formatDuration(duration_ms: number): string {
  const label = `${duration_ms}ms`;

  if (duration_ms >= VERY_SLOW_MS) return chalk.red.bold(label);
  if (duration_ms >= SLOW_MS) return chalk.yellow(label);

  return chalk.green(label);
}

export function formatHttpStatus(status_code: number): string {
  const label = String(status_code);

  if (status_code >= 500) return chalk.bgRed.white.bold(` ${label} `);
  if (status_code >= 400) return chalk.yellow.bold(label);
  if (status_code >= 300) return chalk.cyan(label);

  return chalk.green(label);
}

export function formatHttpMethod(method: string): string {
  const label = method.padEnd(6);

  switch (method) {
    case 'GET':
      return chalk.cyan(label);
    case 'POST':
      return chalk.magenta(label);
    case 'DELETE':
      return chalk.red(label);
    default:
      return chalk.white(label);
  }
}

/** Which loop a line belongs to, so the three clock speeds are separable. */
export enum LogLane {
  MID_LOOP = 'MID ',
  SLOW_LOOP = 'SLOW',
  OFF_PATH = 'OFF ',
}

export function formatLane(lane: LogLane): string {
  switch (lane) {
    case LogLane.MID_LOOP:
      return chalk.bgBlue.black(` ${lane} `);
    case LogLane.SLOW_LOOP:
      return chalk.bgMagenta.black(` ${lane} `);
    default:
      return chalk.bgGray.black(` ${lane} `);
  }
}

/**
 * The badge that answers "why is it saying Awaiting AI?" at a glance.
 */
export function formatProviderTag(is_stubbed: boolean): string {
  return is_stubbed
    ? chalk.bgYellow.black.bold(' STUB ')
    : chalk.bgGreen.black.bold(' MODEL ');
}

export const dim = chalk.gray;
export const label = chalk.white.bold;
export const warn = chalk.yellow;
export const bad = chalk.red;
export const good = chalk.green;
