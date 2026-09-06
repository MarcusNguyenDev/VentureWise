/**
 * Extracts readable text from a PDF, entirely in the browser.
 *
 * Client-side on purpose: a CV is the most personal document this product
 * touches, and the same rule the camera follows applies here — the file never
 * leaves the machine. Only the text the candidate can see and edit in the
 * textarea is ever sent anywhere.
 *
 * The work that matters is layout reconstruction. A PDF has no lines and no
 * paragraphs: it has glyphs at coordinates. Joining them in document order
 * produces a blob with the two-column CV interleaved and every date welded to
 * the job title after it — which then feeds the gap analysis and quietly makes
 * every downstream result worse. So items are grouped back into lines by their
 * vertical position and re-joined by horizontal gap.
 */

/** A CV that will not fit in this is not a CV. */
const MAXIMUM_FILE_BYTES = 10 * 1024 * 1024;
const MAXIMUM_PAGES = 30;

/** Two items within this many points vertically are on the same line. */
const SAME_LINE_TOLERANCE = 2.5;

/**
 * A vertical gap larger than this many line heights starts a paragraph.
 *
 * Tuned against a real CV: tight bullet lists sit at roughly 1.7x the font
 * size, and at 1.6 every bullet was getting its own blank line. Section breaks
 * are comfortably above 1.9, so this separates the two.
 */
const PARAGRAPH_GAP_RATIO = 1.9;

/** A horizontal gap wider than this fraction of the font size is a space. */
const SPACE_GAP_RATIO = 0.25;

/** Below this many characters per page, assume there is no text layer. */
const MINIMUM_CHARACTERS_PER_PAGE = 40;

export class PdfExtractionError extends Error {
  constructor(
    message: string,
    /** True when the file is likely a scan, which needs OCR we do not do. */
    readonly is_probably_scanned = false,
  ) {
    super(message);
    this.name = "PdfExtractionError";
  }
}

export interface PositionedItem {
  text: string;
  x: number;
  y: number;
  font_size: number;
}

interface ExtractedLine {
  y: number;
  items: PositionedItem[];
  font_size: number;
}

export interface PdfExtractionResult {
  text: string;
  page_count: number;
  /**
   * Whether the PDF paints any image.
   *
   * Only knowable while parsing, which is why it is captured here rather than
   * inferred later from the text — extraction discards images entirely. It
   * matters because a photo on a CV is the most common and least intuitive
   * convention difference for a candidate whose home market expects one.
   */
  has_embedded_image: boolean;
}

export async function extractTextFromPdf(
  file: File,
): Promise<PdfExtractionResult> {
  if (file.size > MAXIMUM_FILE_BYTES) {
    throw new PdfExtractionError(
      `That file is ${(file.size / 1024 / 1024).toFixed(1)} MB. The limit is ${MAXIMUM_FILE_BYTES / 1024 / 1024} MB — a CV should be far smaller, so this may be the wrong file.`,
    );
  }

  // Imported here rather than at module scope: it is a large library and
  // nobody who pastes their CV as text should download it.
  const pdfjs = await import("pdfjs-dist");
  pdfjs.GlobalWorkerOptions.workerSrc = "/pdfjs/pdf.worker.min.mjs";

  const file_bytes = new Uint8Array(await file.arrayBuffer());

  // The loading task is kept because it, not the document proxy, owns the
  // worker teardown — dropping it leaks a worker per upload.
  const loading_task = pdfjs.getDocument({ data: file_bytes });

  let document;
  try {
    document = await loading_task.promise;
  } catch (error) {
    const name = error instanceof Error ? error.name : "";

    if (name === "PasswordException") {
      throw new PdfExtractionError(
        "That PDF is password-protected. Remove the password, or paste the text instead.",
      );
    }

    throw new PdfExtractionError(
      "That file could not be read as a PDF. If it came from a phone scanner app it may not be one.",
    );
  }

  const page_count = Math.min(document.numPages, MAXIMUM_PAGES);
  const page_texts: string[] = [];

  const IMAGE_OPERATORS = new Set([
    pdfjs.OPS.paintImageXObject,
    pdfjs.OPS.paintInlineImageXObject,
    pdfjs.OPS.paintImageMaskXObject,
  ]);
  let has_embedded_image = false;

  try {
    for (let page_number = 1; page_number <= page_count; page_number += 1) {
      const page = await document.getPage(page_number);
      const text_content = await page.getTextContent();

      const items: PositionedItem[] = [];
      for (const item of text_content.items) {
        // Marked-content entries carry structure, not glyphs.
        if (!("str" in item) || item.str.length === 0) continue;

        items.push({
          text: item.str,
          x: item.transform[4],
          y: item.transform[5],
          font_size: Math.abs(item.transform[3]) || 10,
        });
      }

      if (!has_embedded_image) {
        const operator_list = await page.getOperatorList();
        has_embedded_image = operator_list.fnArray.some((operator) =>
          IMAGE_OPERATORS.has(operator),
        );
      }

      page_texts.push(rebuildPageText(items));
      page.cleanup();
    }
  } finally {
    await loading_task.destroy();
  }

  const text = page_texts
    .join("\n\n")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  if (text.length < MINIMUM_CHARACTERS_PER_PAGE * page_count) {
    throw new PdfExtractionError(
      "That PDF has almost no selectable text, which usually means it is a scan or an exported image. Reading those needs OCR, which this does not do — paste the text instead.",
      true,
    );
  }

  return { text, page_count, has_embedded_image };
}

/** Groups positioned glyphs back into lines and paragraphs. */
export function rebuildPageText(items: PositionedItem[]): string {
  if (items.length === 0) return "";

  const lines: ExtractedLine[] = [];

  // Descending y, because PDF coordinates start at the bottom of the page.
  const by_position = [...items].sort(
    (left, right) => right.y - left.y || left.x - right.x,
  );

  for (const item of by_position) {
    const current_line = lines[lines.length - 1];

    if (
      current_line &&
      Math.abs(current_line.y - item.y) <= SAME_LINE_TOLERANCE
    ) {
      current_line.items.push(item);
      current_line.font_size = Math.max(current_line.font_size, item.font_size);
      continue;
    }

    lines.push({ y: item.y, items: [item], font_size: item.font_size });
  }

  const rendered_lines: string[] = [];
  let previous_line: ExtractedLine | null = null;

  for (const line of lines) {
    if (previous_line) {
      const vertical_gap = previous_line.y - line.y;
      const expected_gap = Math.max(previous_line.font_size, 1);

      // A gap much larger than one line is a paragraph or section break, and
      // keeping it is most of what makes a CV readable afterwards.
      if (vertical_gap > expected_gap * PARAGRAPH_GAP_RATIO) {
        rendered_lines.push("");
      }
    }

    rendered_lines.push(renderLine(line));
    previous_line = line;
  }

  return rendered_lines.join("\n").trim();
}

function renderLine(line: ExtractedLine): string {
  const ordered = [...line.items].sort((left, right) => left.x - right.x);

  let rendered = "";
  let previous_end_x: number | null = null;

  for (const item of ordered) {
    if (previous_end_x !== null) {
      const gap = item.x - previous_end_x;
      const needs_space = gap > item.font_size * SPACE_GAP_RATIO;

      // Only add a space where the glyphs are not already separated, so
      // "Melbourne VIC" does not become "Melbourne  VIC".
      if (needs_space && !/\s$/.test(rendered) && !/^\s/.test(item.text)) {
        rendered += " ";
      }
    }

    rendered += item.text;
    // Width is not always present, so the font size is the fallback estimate.
    previous_end_x = item.x + estimateWidth(item);
  }

  return rendered.replace(/\s+/g, " ").trim();
}

function estimateWidth(item: PositionedItem): number {
  const AVERAGE_GLYPH_WIDTH_RATIO = 0.5;
  return item.text.length * item.font_size * AVERAGE_GLYPH_WIDTH_RATIO;
}
