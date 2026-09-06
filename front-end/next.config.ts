import { loadEnvConfig } from "@next/env";
import type { NextConfig } from "next";

/**
 * `.env` is loaded explicitly, before it is read.
 *
 * Next loads env files for the app, but not in time for `next.config.ts` — the
 * config is evaluated first, so `process.env.API_URL` is undefined here unless
 * it is loaded by hand. Without this the fallback below always won and the
 * browser was quietly sent `http://localhost:3001` no matter what `.env` said.
 * `loadEnvConfig` is the loader Next itself uses, so file precedence
 * (`.env.local` over `.env`, and so on) behaves identically.
 */
loadEnvConfig(process.cwd());

const DEFAULT_API_URL = "http://localhost:3001";

const nextConfig: NextConfig = {
  /**
   * Puts API_URL into the browser bundle.
   *
   * Next only exposes variables prefixed `NEXT_PUBLIC_` to the client — a bare
   * `API_URL` in `.env` reaches the Node runtime and is `undefined` in the
   * browser. Every page here is client-rendered and the API call is made by
   * the visitor's machine, so the value has to cross that boundary.
   *
   * The `env` key is the documented way to do that without the prefix: what is
   * listed here is always inlined into the bundle. It keeps the variable named
   * API_URL, which is what the deployment writes, rather than forcing a
   * NEXT_PUBLIC_ name through every env file and compose stanza.
   *
   * Inlined at BUILD time, like anything else reaching the browser. A
   * production image is pinned to whatever API_URL was set when it was built,
   * which is why the deploy passes FE_ENV to the build and not only to the
   * runtime.
   */
  env: {
    API_URL: process.env.API_URL ?? DEFAULT_API_URL,
  },
};

export default nextConfig;
