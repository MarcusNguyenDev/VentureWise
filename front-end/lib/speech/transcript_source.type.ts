import type { TranscriptWord } from "../api/api_contracts";

/**
 * One append to the transcript buffer, from whichever source is driving.
 *
 * The practice screen does not care whether words came from a microphone or a
 * canned replay — that indifference is what makes the replay a usable fallback
 * when venue wifi or a browser permission prompt kills the mic on stage.
 */
export interface TranscriptChunkEvent {
  chunk_index: number;
  text: string;
  words: TranscriptWord[];
  is_final: boolean;
}

export interface TranscriptSourceHandlers {
  onChunk: (chunk: TranscriptChunkEvent) => void;
  onError: (message: string) => void;
  onEnd: () => void;
}

export interface TranscriptSource {
  start: (handlers: TranscriptSourceHandlers) => void;
  stop: () => void;
}

export type TranscriptSourceKind = "MICROPHONE" | "CANNED_REPLAY";
