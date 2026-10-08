"use client";

import { useEffect, useSyncExternalStore } from "react";

/**
 * The practice session this tab is working in, remembered across routes.
 *
 * CV review and the sponsorship drill have no session in their URL, so without
 * this the way back to Practice disappears the moment you visit either. Kept
 * in sessionStorage: it belongs to this tab, and the API forgets sessions
 * after twelve hours anyway.
 */

const ACTIVE_SESSION_STORAGE_KEY = "venturewise_active_session";

const store_listeners = new Set<() => void>();

function subscribeToActiveSession(listener: () => void): () => void {
  store_listeners.add(listener);
  return () => store_listeners.delete(listener);
}

function readStoredSession(): string | null {
  try {
    return sessionStorage.getItem(ACTIVE_SESSION_STORAGE_KEY);
  } catch {
    // Blocked site data throws here; the nav just loses its Practice link.
    return null;
  }
}

function readServerSession(): string | null {
  return null;
}

function rememberSession(session_id: string): void {
  try {
    sessionStorage.setItem(ACTIVE_SESSION_STORAGE_KEY, session_id);
  } catch {
    // Not being able to remember it is not worth failing over.
  }

  store_listeners.forEach((listener) => listener());
}

/**
 * The session in the URL wins, and becomes the remembered one; otherwise the
 * last session this tab practised in.
 */
export function useActiveSession(session_id_in_url: string | null): string | null {
  const stored_session_id = useSyncExternalStore(
    subscribeToActiveSession,
    readStoredSession,
    readServerSession,
  );

  useEffect(() => {
    if (session_id_in_url) rememberSession(session_id_in_url);
  }, [session_id_in_url]);

  return session_id_in_url ?? stored_session_id;
}
