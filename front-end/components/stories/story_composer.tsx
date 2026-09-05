"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";

/**
 * The messy-memory input.
 *
 * Nothing here assumes English. That assumption is the wall this feature exists
 * to remove — students cannot retrieve stories under pressure in a second
 * language, so they dump the memory in whichever one they think in and the app
 * translates only the delivery.
 */

const LANGUAGE_OPTIONS: { value: string; label: string }[] = [
  { value: "vi", label: "Tiếng Việt · Vietnamese" },
  { value: "", label: "Detect it for me" },
  { value: "zh", label: "中文 · Mandarin" },
  { value: "ko", label: "한국어 · Korean" },
  { value: "hi", label: "हिन्दी · Hindi" },
  { value: "id", label: "Bahasa Indonesia" },
  { value: "th", label: "ไทย · Thai" },
  { value: "en", label: "English" },
];

export function StoryComposer({
  onAdd,
  is_adding,
}: {
  onAdd: (input: { raw_memory_text: string; source_language?: string }) => void;
  is_adding: boolean;
}) {
  const [raw_memory_text, setRawMemoryText] = useState("");
  const [source_language, setSourceLanguage] = useState("vi");

  const MINIMUM_MEMORY_LENGTH = 20;
  const is_long_enough = raw_memory_text.trim().length >= MINIMUM_MEMORY_LENGTH;

  return (
    <Card>
      <CardHeader
        title="Dump the memory"
        hint="Messy is fine. Any language is fine. The specifics matter more than the grammar — names, numbers, what broke."
      />

      <div className="space-y-4 px-5 py-5">
        <textarea
          value={raw_memory_text}
          onChange={(event) => setRawMemoryText(event.target.value)}
          rows={8}
          placeholder="Hồi làm đồ án tốt nghiệp, nhóm em có 5 người. Em phụ trách phần pipeline dữ liệu, có một bạn muốn bỏ hết dữ liệu ngoại lai…"
          className="w-full resize-y rounded-lg border border-line bg-surface px-3 py-2.5 text-sm leading-relaxed text-ink placeholder:text-ink-faint focus:border-accent focus:outline-none"
        />

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={source_language}
            onChange={(event) => setSourceLanguage(event.target.value)}
            className="rounded-lg border border-line bg-surface px-3 py-2 text-xs text-ink focus:border-accent focus:outline-none"
          >
            {LANGUAGE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <Button
            disabled={!is_long_enough || is_adding}
            onClick={() =>
              onAdd({
                raw_memory_text,
                source_language: source_language || undefined,
              })
            }
          >
            {is_adding ? "Extracting…" : "Extract to STAR"}
          </Button>

          {!is_long_enough && raw_memory_text.length > 0 ? (
            <span className="text-[11px] text-ink-faint">
              A few more words — {MINIMUM_MEMORY_LENGTH} minimum.
            </span>
          ) : null}
        </div>
      </div>
    </Card>
  );
}
