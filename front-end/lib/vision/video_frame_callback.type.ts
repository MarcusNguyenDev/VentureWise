/**
 * Thin runtime guards around `requestVideoFrameCallback`.
 *
 * It is the right loop for this: it fires once per decoded video frame, so
 * inference runs exactly as often as there is new pixel data — never twice on
 * the same frame, and never missing one. A `setInterval` at a guessed rate does
 * both.
 *
 * TypeScript's DOM library declares the methods as always present, but they are
 * still missing from some browsers, so presence is checked at runtime even
 * though the types insist it is unnecessary.
 */

export function supportsVideoFrameCallback(
  video_element: HTMLVideoElement,
): boolean {
  return typeof video_element.requestVideoFrameCallback === "function";
}

export function requestVideoFrame(
  video_element: HTMLVideoElement,
  callback: VideoFrameRequestCallback,
): number | null {
  if (!supportsVideoFrameCallback(video_element)) return null;
  return video_element.requestVideoFrameCallback(callback);
}

export function cancelVideoFrame(
  video_element: HTMLVideoElement,
  handle: number,
): void {
  if (typeof video_element.cancelVideoFrameCallback !== "function") return;
  video_element.cancelVideoFrameCallback(handle);
}
