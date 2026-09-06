"use client";

import clsx from "clsx";
import { useRef, useState } from "react";

import {
  extractTextFromPdf,
  PdfExtractionError,
} from "@/lib/documents/pdf_text_extraction.client";

/**
 * A textarea you can also drop a PDF onto.
 *
 * The extracted text lands in the textarea rather than being held invisibly,
 * so the candidate can see exactly what was read and fix it. PDF extraction is
 * never perfect on a heavily designed CV, and the alternative — silently
 * sending a mangled version to the model — degrades every downstream result
 * with no way to tell.
 *
 * The file is read in the browser and never uploaded.
 */
export function DocumentField({
  label,
  hint,
  placeholder,
  value,
  rows = 7,
  onChange,
}: {
  label: string;
  hint?: string;
  placeholder: string;
  value: string;
  rows?: number;
  onChange: (text: string) => void;
}) {
  const file_input_ref = useRef<HTMLInputElement>(null);
  const [is_reading, setIsReading] = useState(false);
  const [is_dragging, setIsDragging] = useState(false);
  const [status_message, setStatusMessage] = useState<string | null>(null);
  const [error_message, setErrorMessage] = useState<string | null>(null);

  const readFile = async (file: File): Promise<void> => {
    setErrorMessage(null);
    setStatusMessage(null);

    if (!file.name.toLowerCase().endsWith(".pdf")) {
      setErrorMessage(
        `${file.name} is not a PDF. Only PDFs can be read — paste the text for anything else.`,
      );
      return;
    }

    setIsReading(true);

    try {
      const { text, page_count } = await extractTextFromPdf(file);
      onChange(text);
      setStatusMessage(
        `Read ${page_count} page${page_count === 1 ? "" : "s"} from ${file.name}. Check it below — PDF layouts do not always survive.`,
      );
    } catch (error) {
      setErrorMessage(
        error instanceof PdfExtractionError
          ? error.message
          : "That PDF could not be read. Paste the text instead.",
      );
    } finally {
      setIsReading(false);
    }
  };

  return (
    <div>
      <div className="flex items-baseline justify-between gap-4">
        <span className="text-xs font-medium text-ink">{label}</span>

        <button
          type="button"
          onClick={() => file_input_ref.current?.click()}
          disabled={is_reading}
          className="text-[11px] font-medium text-accent underline underline-offset-2 disabled:opacity-50"
        >
          {is_reading ? "Reading…" : "Upload a PDF"}
        </button>
      </div>

      {hint ? (
        <p className="mt-0.5 text-[11px] text-ink-faint">{hint}</p>
      ) : null}

      <input
        ref={file_input_ref}
        type="file"
        accept="application/pdf,.pdf"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) void readFile(file);
          // Cleared so choosing the same file twice still fires a change.
          event.target.value = "";
        }}
      />

      <div
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setIsDragging(false);

          const file = event.dataTransfer.files?.[0];
          if (file) void readFile(file);
        }}
        className={clsx(
          "relative mt-1.5 rounded-lg transition-colors",
          is_dragging && "ring-2 ring-accent",
        )}
      >
        <textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          rows={rows}
          placeholder={placeholder}
          className="w-full resize-y rounded-lg border border-line bg-surface px-3 py-2.5 font-mono text-xs leading-relaxed text-ink placeholder:text-ink-faint focus:border-accent focus:outline-none"
        />

        {is_dragging ? (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-lg bg-accent-soft/90">
            <p className="text-xs font-medium text-accent">Drop the PDF</p>
          </div>
        ) : null}
      </div>

      {status_message ? (
        <p className="mt-1 text-[11px] leading-relaxed text-ink-muted">
          {status_message}
        </p>
      ) : null}

      {error_message ? (
        <p className="mt-1 text-[11px] leading-relaxed text-poor">
          {error_message}
        </p>
      ) : null}

      <p className="mt-1 text-[10px] text-ink-faint">
        Drag a PDF anywhere onto the box. It is read in your browser and never
        uploaded.
      </p>
    </div>
  );
}
