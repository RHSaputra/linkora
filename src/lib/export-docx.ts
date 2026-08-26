/**
 * DOCX Export Engine
 *
 * Converts TipTap HTML content into a native Microsoft Word .docx file
 * using the `docx` library (OpenXML). Preserves:
 *   - Paragraphs, headings (H1–H3)
 *   - Bold, italic, underline, strikethrough
 *   - Font family & font size (1:1 matching Word point size: 12pt in web = 12pt in Word)
 *   - Text color & highlight (background) color
 *   - Text alignment
 *   - Bullet lists, numbered lists, checklists
 *   - Tables with cells, headers, borders
 *   - Images (embedded natively into Word via ImageRun)
 *   - Links (hyperlinks)
 *   - Page breaks
 *   - Page size, orientation, and margins from DocumentSettings
 */

import {
  Document,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  Table as DocxTable,
  TableRow as DocxTableRow,
  TableCell as DocxTableCell,
  WidthType,
  BorderStyle,
  PageBreak as DocxPageBreak,
  ExternalHyperlink,
  LevelFormat,
  convertInchesToTwip,
  Packer,
  PageOrientation,
  ImageRun,
} from "docx";
import { saveAs } from "file-saver";
import {
  type DocumentSettings,
  DEFAULT_DOCUMENT_SETTINGS,
  getPaperSize,
  mmToTwips,
} from "./document-settings";

// ─── HTML Parsing Helpers ───────────────────────────────────

function createDOMDocument(html: string): globalThis.Document | null {
  if (typeof window === "undefined") return null;
  const parser = new DOMParser();
  return parser.parseFromString(html, "text/html");
}

interface TextFormat {
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strike?: boolean;
  color?: string;
  highlight?: string;
  fontFamily?: string;
  fontSize?: number; // in half-points (docx standard: 24 half-points = 12pt in Word)
  href?: string;
}

function parseColor(color: string | undefined): string | undefined {
  if (!color) return undefined;
  return color.replace(/^#/, "");
}

/**
 * Parses font size string into Word half-points (1 pt = 2 half-points).
 * Handles:
 * - "12pt" -> 12 * 2 = 24 half-points (12pt in Word)
 * - "12" -> 12 * 2 = 24 half-points (12pt in Word)
 * - "16px" -> 16 * (72/96) * 2 = 24 half-points (12pt in Word)
 */
function parseFontSizeToHalfPoints(size: string | undefined): number | undefined {
  if (!size) return undefined;
  const trimmed = size.trim().toLowerCase();
  
  if (trimmed.endsWith("pt")) {
    const pts = parseFloat(trimmed);
    return isNaN(pts) ? undefined : Math.round(pts * 2);
  }
  
  if (trimmed.endsWith("px")) {
    const px = parseFloat(trimmed);
    return isNaN(px) ? undefined : Math.round(px * (72 / 96) * 2);
  }
  
  const num = parseFloat(trimmed);
  if (!isNaN(num)) {
    // Default unit is pt
    return Math.round(num * 2);
  }
  
  return undefined;
}

/**
 * Cleans font family string for Word Document XML.
 * E.g., "'Times New Roman', Times, serif" -> "Times New Roman"
 */
function cleanFontFamilyForDocx(fontFamily: string | undefined): string | undefined {
  if (!fontFamily) return undefined;
  const first = fontFamily.split(",")[0].replace(/['"]/g, "").trim();
  return first || undefined;
}

// ─── Inline Element Processing ──────────────────────────────

function getInlineFormatFromElement(
  el: Element,
  parentFormat: TextFormat = {}
): TextFormat {
  const format: TextFormat = { ...parentFormat };
  const tag = el.tagName.toLowerCase();
  const style = (el as HTMLElement).style;

  if (tag === "strong" || tag === "b") format.bold = true;
  if (tag === "em" || tag === "i") format.italic = true;
  if (tag === "u") format.underline = true;
  if (tag === "s" || tag === "del") format.strike = true;
  if (tag === "mark") {
    format.highlight =
      style.backgroundColor || el.getAttribute("data-color") || "FFFF00";
  }
  if (tag === "a") {
    format.href = el.getAttribute("href") || undefined;
  }

  // Inline styles
  if (style.color) format.color = style.color;
  if (style.backgroundColor && tag !== "mark")
    format.highlight = style.backgroundColor;
  if (style.fontFamily)
    format.fontFamily = cleanFontFamilyForDocx(style.fontFamily);
  if (style.fontSize) {
    const hpSize = parseFontSizeToHalfPoints(style.fontSize);
    if (hpSize) format.fontSize = hpSize;
  }
  if (style.fontWeight === "bold" || parseInt(style.fontWeight) >= 700)
    format.bold = true;
  if (style.fontStyle === "italic") format.italic = true;
  if (style.textDecoration?.includes("underline")) format.underline = true;
  if (style.textDecoration?.includes("line-through")) format.strike = true;

  return format;
}

function createTextRun(text: string, format: TextFormat): TextRun {
  return new TextRun({
    text,
    bold: format.bold,
    italics: format.italic,
    underline: format.underline ? {} : undefined,
    strike: format.strike,
    color: parseColor(format.color),
    shading: format.highlight
      ? { type: "clear" as never, fill: parseColor(format.highlight) || "FFFF00" }
      : undefined,
    font: format.fontFamily || undefined,
    size: format.fontSize || undefined,
  });
}

function processInlineNodes(
  node: Node,
  format: TextFormat,
  runs: (TextRun | ExternalHyperlink)[]
): void {
  if (node.nodeType === Node.TEXT_NODE) {
    const text = node.textContent || "";
    if (text) {
      if (format.href) {
        runs.push(
          new ExternalHyperlink({
            children: [
              createTextRun(text, {
                ...format,
                color: format.color || "0563C1",
                underline: true,
              }),
            ],
            link: format.href,
          })
        );
      } else {
        runs.push(createTextRun(text, format));
      }
    }
    return;
  }

  if (node.nodeType === Node.ELEMENT_NODE) {
    const el = node as Element;
    const tag = el.tagName.toLowerCase();

    if (tag === "br") {
      runs.push(new TextRun({ break: 1 }));
      return;
    }

    const childFormat = getInlineFormatFromElement(el, format);

    for (const child of Array.from(el.childNodes)) {
      processInlineNodes(child, childFormat, runs);
    }
  }
}

// ─── Base64 to Uint8Array Helper ────────────────────────────

function base64ToUint8Array(base64: string): Uint8Array {
  const binaryString = atob(base64.split(",")[1] || base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

// ─── Block Processing ───────────────────────────────────────

function getAlignment(el: Element): (typeof AlignmentType)[keyof typeof AlignmentType] | undefined {
  const style = (el as HTMLElement).style;
  const align = style.textAlign || el.getAttribute("align");
  switch (align) {
    case "center": return AlignmentType.CENTER;
    case "right": return AlignmentType.RIGHT;
    case "justify": return AlignmentType.JUSTIFIED;
    case "left": return AlignmentType.LEFT;
    default: return undefined;
  }
}

function getHeadingLevel(tag: string): (typeof HeadingLevel)[keyof typeof HeadingLevel] | undefined {
  switch (tag) {
    case "h1": return HeadingLevel.HEADING_1;
    case "h2": return HeadingLevel.HEADING_2;
    case "h3": return HeadingLevel.HEADING_3;
    default: return undefined;
  }
}

function processBlockElement(
  el: Element,
  docSettings: DocumentSettings
): (Paragraph | DocxTable)[] {
  const tag = el.tagName.toLowerCase();
  const results: (Paragraph | DocxTable)[] = [];

  // Page break
  if (tag === "div" && el.getAttribute("data-type") === "page-break") {
    results.push(
      new Paragraph({
        children: [new TextRun(""), new DocxPageBreak()],
      })
    );
    return results;
  }

  // Image block
  if (tag === "img") {
    const src = el.getAttribute("src") || "";
    if (src.startsWith("data:image/")) {
      try {
        const htmlEl = el as HTMLElement;
        const imageBytes = base64ToUint8Array(src);
        // Determine dimensions
        const widthAttr = parseInt(el.getAttribute("width") || htmlEl.style?.width || "500", 10) || 500;
        const heightAttr = parseInt(el.getAttribute("height") || htmlEl.style?.height || "350", 10) || 350;
        const maxDocWidth = 520;
        const scaledWidth = Math.min(widthAttr, maxDocWidth);
        const scaledHeight = Math.round((scaledWidth / widthAttr) * heightAttr);

        const formatMatch = src.match(/data:image\/([a-zA-Z0-9+]+);/);
        const rawFormat = formatMatch ? formatMatch[1].toLowerCase() : "png";
        const imageType = rawFormat === "jpeg" ? "jpg" : (rawFormat === "svg+xml" ? "svg" : rawFormat);

        // Alignment mapping
        const alignAttr = el.getAttribute("data-align") || "";
        const wrapAttr = el.getAttribute("data-wrap") || "";
        let docxAlign: any = AlignmentType.CENTER;
        if (alignAttr === "left" || wrapAttr === "square-left") {
          docxAlign = AlignmentType.LEFT;
        } else if (alignAttr === "right" || wrapAttr === "square-right") {
          docxAlign = AlignmentType.RIGHT;
        }

        results.push(
          new Paragraph({
            children: [
              new ImageRun({
                data: imageBytes,
                type: imageType as any,
                transformation: {
                  width: scaledWidth,
                  height: scaledHeight,
                },
              }),
            ],
            alignment: docxAlign,
          })
        );
        return results;
      } catch (err) {
        console.warn("Gagal menyisipkan gambar ke DOCX:", err);
      }
    }
  }

  // Headings & Paragraphs
  if (["h1", "h2", "h3", "h4", "h5", "h6", "p"].includes(tag)) {
    // Check if paragraph contains an img child
    const imgChild = el.querySelector("img");
    if (imgChild && el.textContent?.trim() === "") {
      return processBlockElement(imgChild, docSettings);
    }

    const runs: (TextRun | ExternalHyperlink)[] = [];
    const format: TextFormat = getInlineFormatFromElement(el);
    for (const child of Array.from(el.childNodes)) {
      processInlineNodes(child, format, runs);
    }

    const heading = getHeadingLevel(tag);
    results.push(
      new Paragraph({
        children: runs,
        heading,
        alignment: getAlignment(el),
      })
    );
    return results;
  }

  // Blockquote
  if (tag === "blockquote") {
    for (const child of Array.from(el.children)) {
      const innerResults = processBlockElement(child, docSettings);
      for (const item of innerResults) {
        if (item instanceof Paragraph) {
          results.push(
            new Paragraph({
              children: (item as any).root?.[1]?.children || [],
              indent: { left: convertInchesToTwip(0.5) },
            })
          );
        } else {
          results.push(item);
        }
      }
    }
    if (el.children.length === 0) {
      const runs: (TextRun | ExternalHyperlink)[] = [];
      processInlineNodes(el, {}, runs);
      results.push(
        new Paragraph({
          children: runs,
          indent: { left: convertInchesToTwip(0.5) },
        })
      );
    }
    return results;
  }

  // Lists (ul/ol)
  if (tag === "ul" || tag === "ol") {
    const isOrdered = tag === "ol";
    const listItems = Array.from(el.children).filter(
      (c) => c.tagName.toLowerCase() === "li"
    );

    for (const li of listItems) {
      const isTask =
        li.getAttribute("data-type") === "taskItem" ||
        li.getAttribute("data-checked") !== null;

      const runs: (TextRun | ExternalHyperlink)[] = [];
      const format = getInlineFormatFromElement(li);

      if (isTask) {
        const isChecked = li.getAttribute("data-checked") === "true";
        runs.push(
          new TextRun({
            text: isChecked ? "☑ " : "☐ ",
            font: "Segoe UI Symbol",
          })
        );
      }

      for (const child of Array.from(li.childNodes)) {
        if (
          child.nodeType === Node.ELEMENT_NODE &&
          ["ul", "ol"].includes((child as Element).tagName.toLowerCase())
        ) {
          if (runs.length > 0) {
            results.push(
              new Paragraph({
                children: runs,
                bullet: !isOrdered && !isTask ? { level: 0 } : undefined,
                numbering: isOrdered
                  ? { reference: "ordered-list", level: 0 }
                  : undefined,
              })
            );
          }
          const nestedResults = processBlockElement(child as Element, docSettings);
          results.push(...nestedResults);
          return results;
        }
        processInlineNodes(child, format, runs);
      }

      if (isTask) {
        results.push(new Paragraph({ children: runs }));
      } else {
        results.push(
          new Paragraph({
            children: runs,
            bullet: !isOrdered ? { level: 0 } : undefined,
            numbering: isOrdered
              ? { reference: "ordered-list", level: 0 }
              : undefined,
          })
        );
      }
    }
    return results;
  }

  // Tables
  if (tag === "table") {
    const tableRows: DocxTableRow[] = [];
    const allRows = el.querySelectorAll("tr");

    for (const tr of Array.from(allRows)) {
      const cells: DocxTableCell[] = [];
      const tds = tr.querySelectorAll("td, th");

      for (const td of Array.from(tds)) {
        const cellFormat = getInlineFormatFromElement(td);
        const cellParagraphs: Paragraph[] = [];
        let hasBlockChildren = false;

        for (const child of Array.from(td.childNodes)) {
          if (
            child.nodeType === Node.ELEMENT_NODE &&
            ["p", "h1", "h2", "h3"].includes((child as Element).tagName.toLowerCase())
          ) {
            hasBlockChildren = true;
            const pRuns: (TextRun | ExternalHyperlink)[] = [];
            const pFormat = getInlineFormatFromElement(child as Element, cellFormat);
            for (const pChild of Array.from(child.childNodes)) {
              processInlineNodes(pChild, pFormat, pRuns);
            }
            cellParagraphs.push(
              new Paragraph({
                children: pRuns,
                heading: getHeadingLevel((child as Element).tagName.toLowerCase()),
              })
            );
          }
        }

        if (!hasBlockChildren) {
          const cellRuns: (TextRun | ExternalHyperlink)[] = [];
          for (const child of Array.from(td.childNodes)) {
            processInlineNodes(child, cellFormat, cellRuns);
          }
          cellParagraphs.push(new Paragraph({ children: cellRuns }));
        }

        cells.push(
          new DocxTableCell({
            children: cellParagraphs.length > 0 ? cellParagraphs : [new Paragraph({})],
            shading:
              td.tagName.toLowerCase() === "th"
                ? { fill: "E8E8E8", type: "clear" as never }
                : undefined,
          })
        );
      }

      if (cells.length > 0) {
        tableRows.push(new DocxTableRow({ children: cells }));
      }
    }

    if (tableRows.length > 0) {
      results.push(
        new DocxTable({
          rows: tableRows,
          width: { size: 100, type: WidthType.PERCENTAGE },
        })
      );
    }
    return results;
  }

  // Horizontal rule
  if (tag === "hr") {
    results.push(
      new Paragraph({
        border: {
          bottom: {
            color: "CCCCCC",
            style: BorderStyle.SINGLE,
            size: 1,
            space: 1,
          },
        },
      })
    );
    return results;
  }

  // Code block (pre > code)
  if (tag === "pre") {
    const codeEl = el.querySelector("code") || el;
    const text = codeEl.textContent || "";
    const lines = text.split("\n");
    for (const line of lines) {
      results.push(
        new Paragraph({
          children: [
            new TextRun({
              text: line,
              font: "Courier New",
              size: 20, // 10pt in half-points
            }),
          ],
        })
      );
    }
    return results;
  }

  // Generic div (fallback)
  if (tag === "div") {
    for (const child of Array.from(el.children)) {
      results.push(...processBlockElement(child, docSettings));
    }
    if (el.children.length === 0 && el.textContent?.trim()) {
      const runs: (TextRun | ExternalHyperlink)[] = [];
      processInlineNodes(el, {}, runs);
      results.push(new Paragraph({ children: runs }));
    }
    return results;
  }

  // Fallback: treat as paragraph
  const runs: (TextRun | ExternalHyperlink)[] = [];
  processInlineNodes(el, {}, runs);
  if (runs.length > 0) {
    results.push(new Paragraph({ children: runs }));
  }

  return results;
}

// ─── Main Export Function ───────────────────────────────────

export async function exportToDocx(
  html: string,
  title: string,
  settings: DocumentSettings = DEFAULT_DOCUMENT_SETTINGS
): Promise<void> {
  const doc = createDOMDocument(html);
  if (!doc) throw new Error("Failed to parse HTML");

  const body = doc.body;
  const elements: (Paragraph | DocxTable)[] = [];

  // Process all top-level block elements
  for (const child of Array.from(body.children)) {
    elements.push(...processBlockElement(child, settings));
  }

  // If no content, add empty paragraph
  if (elements.length === 0) {
    elements.push(new Paragraph({ children: [] }));
  }

  // Build page size
  const paper = getPaperSize(settings.pageSize);
  const isLandscape = settings.orientation === "landscape";

  const pageWidth = isLandscape ? paper.heightMm : paper.widthMm;
  const pageHeight = isLandscape ? paper.widthMm : paper.heightMm;

  // Clean default font family for Word
  const defaultFontName = cleanFontFamilyForDocx(settings.defaultFont) || "Arial";
  const defaultFontSizeHalfPoints = (settings.defaultFontSize || 12) * 2; // 12pt -> 24 half-points

  const document = new Document({
    sections: [
      {
        properties: {
          page: {
            size: {
              width: mmToTwips(pageWidth),
              height: mmToTwips(pageHeight),
              orientation: isLandscape
                ? PageOrientation.LANDSCAPE
                : PageOrientation.PORTRAIT,
            },
            margin: {
              top: mmToTwips(settings.margins.top),
              bottom: mmToTwips(settings.margins.bottom),
              left: mmToTwips(settings.margins.left),
              right: mmToTwips(settings.margins.right),
            },
          },
        },
        children: elements,
      },
    ],
    numbering: {
      config: [
        {
          reference: "ordered-list",
          levels: [
            {
              level: 0,
              format: LevelFormat.DECIMAL,
              text: "%1.",
              alignment: AlignmentType.LEFT,
            },
          ],
        },
      ],
    },
    title,
    creator: "Linkora Notes",
    styles: {
      default: {
        document: {
          run: {
            font: defaultFontName,
            size: defaultFontSizeHalfPoints,
          },
        },
      },
    },
  });

  // Generate and download
  const blob = await Packer.toBlob(document);
  const sanitizedTitle = sanitizeFileName(title || "Catatan");
  saveAs(blob, `${sanitizedTitle}.docx`);
}

// ─── File Name Sanitizer ────────────────────────────────────

function sanitizeFileName(name: string): string {
  return name
    .replace(/[<>:"/\\|?*\x00-\x1f]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 200) || "Catatan";
}
