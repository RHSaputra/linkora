/**
 * Document Settings Module
 *
 * Centralized definitions for paper sizes, orientations, margins,
 * and default document configuration used across:
 *   - Editor page view layout
 *   - PDF export
 *   - DOCX export
 *   - Print preview
 *
 * All dimensions stored in millimeters as canonical unit.
 * Conversion helpers provided for pixels (screen) and twips (DOCX/OpenXML).
 */

// ─── Paper Size Definitions ─────────────────────────────────

export interface PaperSize {
  name: string;
  label: string;
  /** Width in mm (portrait orientation) */
  widthMm: number;
  /** Height in mm (portrait orientation) */
  heightMm: number;
}

export const PAPER_SIZES: PaperSize[] = [
  { name: "A4", label: "A4 (210 × 297 mm)", widthMm: 210, heightMm: 297 },
  { name: "A5", label: "A5 (148 × 210 mm)", widthMm: 148, heightMm: 210 },
  { name: "A3", label: "A3 (297 × 420 mm)", widthMm: 297, heightMm: 420 },
  { name: "Letter", label: "Letter (215.9 × 279.4 mm)", widthMm: 215.9, heightMm: 279.4 },
  { name: "Legal", label: "Legal (215.9 × 355.6 mm)", widthMm: 215.9, heightMm: 355.6 },
  { name: "Tabloid", label: "Tabloid (279.4 × 431.8 mm)", widthMm: 279.4, heightMm: 431.8 },
  { name: "B5", label: "B5 (176 × 250 mm)", widthMm: 176, heightMm: 250 },
  { name: "Executive", label: "Executive (184.2 × 266.7 mm)", widthMm: 184.15, heightMm: 266.7 },
];

export function getPaperSize(name: string): PaperSize {
  return PAPER_SIZES.find((p) => p.name === name) || PAPER_SIZES[0]; // Default A4
}

// ─── Orientation ────────────────────────────────────────────

export type Orientation = "portrait" | "landscape";

// ─── Margin Presets ─────────────────────────────────────────

export interface MarginValues {
  top: number;    // in mm
  bottom: number; // in mm
  left: number;   // in mm
  right: number;  // in mm
}

export interface MarginPreset {
  name: string;
  label: string;
  values: MarginValues;
}

export const MARGIN_PRESETS: MarginPreset[] = [
  {
    name: "Normal",
    label: "Normal (2.54 cm)",
    values: { top: 25.4, bottom: 25.4, left: 25.4, right: 25.4 },
  },
  {
    name: "Narrow",
    label: "Narrow (1.27 cm)",
    values: { top: 12.7, bottom: 12.7, left: 12.7, right: 12.7 },
  },
  {
    name: "Moderate",
    label: "Moderate (2.54 / 1.91 cm)",
    values: { top: 25.4, bottom: 25.4, left: 19.1, right: 19.1 },
  },
  {
    name: "Wide",
    label: "Wide (2.54 / 5.08 cm)",
    values: { top: 25.4, bottom: 25.4, left: 50.8, right: 50.8 },
  },
];

export function getMarginPreset(name: string): MarginPreset {
  return MARGIN_PRESETS.find((m) => m.name === name) || MARGIN_PRESETS[0]; // Default Normal
}

// ─── Document Settings Interface ────────────────────────────

export interface DocumentSettings {
  pageSize: string;       // Paper size name, e.g. "A4"
  orientation: Orientation;
  margins: MarginValues;
  defaultFont: string;     // Font family name, e.g. "Arial"
  defaultFontSize: number; // in px, e.g. 12
  headerText: string;      // Teks header dokumen (kosong = tanpa header)
  footerText: string;      // Teks footer dokumen (kosong = tanpa footer)
}

export const DEFAULT_DOCUMENT_SETTINGS: DocumentSettings = {
  pageSize: "A4",
  orientation: "portrait",
  margins: { top: 25.4, bottom: 25.4, left: 25.4, right: 25.4 },
  defaultFont: "Arial",
  defaultFontSize: 12,
  headerText: "",
  footerText: "",
};

// ─── Conversion Helpers ─────────────────────────────────────

const MM_PER_INCH = 25.4;
const TWIPS_PER_INCH = 1440;
const PX_PER_INCH = 96; // CSS reference pixel

/** Convert mm to CSS pixels (at 96 DPI) */
export function mmToPx(mm: number): number {
  return (mm / MM_PER_INCH) * PX_PER_INCH;
}

/** Convert mm to inches */
export function mmToInches(mm: number): number {
  return mm / MM_PER_INCH;
}

/** Convert mm to OpenXML twips (1/1440 of an inch) */
export function mmToTwips(mm: number): number {
  return Math.round((mm / MM_PER_INCH) * TWIPS_PER_INCH);
}

/** Convert mm to jsPDF points (1/72 of an inch) */
export function mmToPt(mm: number): number {
  return (mm / MM_PER_INCH) * 72;
}

// ─── Effective Page Dimensions ──────────────────────────────

export interface EffectivePageDimensions {
  /** Total page width in mm */
  pageWidthMm: number;
  /** Total page height in mm */
  pageHeightMm: number;
  /** Content area width in mm */
  contentWidthMm: number;
  /** Content area height in mm */
  contentHeightMm: number;
  /** Total page width in px */
  pageWidthPx: number;
  /** Total page height in px */
  pageHeightPx: number;
  /** Content area width in px */
  contentWidthPx: number;
  /** Content area height in px */
  contentHeightPx: number;
}

export function getEffectivePageDimensions(
  settings: DocumentSettings
): EffectivePageDimensions {
  const paper = getPaperSize(settings.pageSize);
  const isLandscape = settings.orientation === "landscape";

  const pageWidthMm = isLandscape ? paper.heightMm : paper.widthMm;
  const pageHeightMm = isLandscape ? paper.widthMm : paper.heightMm;

  const contentWidthMm =
    pageWidthMm - settings.margins.left - settings.margins.right;
  const contentHeightMm =
    pageHeightMm - settings.margins.top - settings.margins.bottom;

  return {
    pageWidthMm,
    pageHeightMm,
    contentWidthMm,
    contentHeightMm,
    pageWidthPx: mmToPx(pageWidthMm),
    pageHeightPx: mmToPx(pageHeightMm),
    contentWidthPx: mmToPx(contentWidthMm),
    contentHeightPx: mmToPx(contentHeightMm),
  };
}

// ─── Serialization ──────────────────────────────────────────

export function serializeDocumentSettings(
  settings: DocumentSettings
): string {
  return JSON.stringify(settings);
}

export function deserializeDocumentSettings(
  json: string | null | undefined
): DocumentSettings {
  if (!json) return { ...DEFAULT_DOCUMENT_SETTINGS };
  try {
    const parsed = JSON.parse(json);
    return {
      pageSize: parsed.pageSize || DEFAULT_DOCUMENT_SETTINGS.pageSize,
      orientation: parsed.orientation || DEFAULT_DOCUMENT_SETTINGS.orientation,
      margins: {
        top: parsed.margins?.top ?? DEFAULT_DOCUMENT_SETTINGS.margins.top,
        bottom: parsed.margins?.bottom ?? DEFAULT_DOCUMENT_SETTINGS.margins.bottom,
        left: parsed.margins?.left ?? DEFAULT_DOCUMENT_SETTINGS.margins.left,
        right: parsed.margins?.right ?? DEFAULT_DOCUMENT_SETTINGS.margins.right,
      },
      defaultFont: parsed.defaultFont || DEFAULT_DOCUMENT_SETTINGS.defaultFont,
      defaultFontSize: parsed.defaultFontSize || DEFAULT_DOCUMENT_SETTINGS.defaultFontSize,
      headerText: typeof parsed.headerText === "string" ? parsed.headerText : DEFAULT_DOCUMENT_SETTINGS.headerText,
      footerText: typeof parsed.footerText === "string" ? parsed.footerText : DEFAULT_DOCUMENT_SETTINGS.footerText,
    };
  } catch {
    return { ...DEFAULT_DOCUMENT_SETTINGS };
  }
}
