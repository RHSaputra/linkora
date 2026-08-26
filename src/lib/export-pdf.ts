/**
 * PDF Export Engine (Fail-Proof & High Resolution)
 *
 * Generates a PDF from editor content using an isolated sandbox iframe + html2canvas + jsPDF.
 * Completely immune to Tailwind CSS v4 `oklch(...)` color parser errors because
 * it renders inside an isolated DOM environment without host stylesheets.
 *
 * Respects document settings for paper size (A4, A5, Letter, etc.), orientation, and margins.
 */

import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { saveAs } from "file-saver";
import {
  type DocumentSettings,
  DEFAULT_DOCUMENT_SETTINGS,
  getPaperSize,
  mmToPx,
} from "./document-settings";

// ─── Image Pre-loader & CORS-Safe Converter ────────────────

async function preloadAndConvertImages(container: HTMLElement): Promise<void> {
  const images = Array.from(container.querySelectorAll("img"));
  if (images.length === 0) return;

  const promises = images.map(async (img) => {
    const src = img.getAttribute("src");
    if (!src) return;

    // If base64 data URI, wait for it to load
    if (src.startsWith("data:")) {
      if (img.complete && img.naturalHeight !== 0) return;
      return new Promise<void>((resolve) => {
        img.onload = () => resolve();
        img.onerror = () => resolve();
        setTimeout(resolve, 3000);
      });
    }

    // For external URLs, attempt to convert to blob / data URL
    try {
      img.crossOrigin = "anonymous";
      const resp = await fetch(src, { mode: "cors" });
      if (resp.ok) {
        const blob = await resp.blob();
        const reader = new FileReader();
        await new Promise<void>((resolve) => {
          reader.onloadend = () => {
            if (typeof reader.result === "string") {
              img.src = reader.result;
            }
            resolve();
          };
          reader.onerror = () => resolve();
          reader.readAsDataURL(blob);
        });
      }
    } catch {
      // If fetching fails, let html2canvas handle or skip gracefully
    }

    if (img.complete && img.naturalHeight !== 0) return;
    return new Promise<void>((resolve) => {
      img.onload = () => resolve();
      img.onerror = () => resolve();
      setTimeout(resolve, 3000);
    });
  });

  await Promise.all(promises);
}

// ─── Clean Standard CSS (Zero oklch/color-mix) ───────────────

function getSafeCss(defaultFont: string, defaultFontSizePt: number): string {
  return `
    * {
      box-sizing: border-box !important;
      margin: 0;
      padding: 0;
    }
    html, body {
      background-color: #ffffff !important;
      color: #111827 !important;
      font-family: ${defaultFont || "Arial, sans-serif"} !important;
      font-size: ${(defaultFontSizePt || 12) * 1.333}px !important;
      line-height: 1.6 !important;
      margin: 0 !important;
      padding: 0 !important;
      width: 100% !important;
    }
    .pdf-render-sandbox {
      background-color: #ffffff !important;
      color: #111827 !important;
      word-break: break-word !important;
      padding: 0 !important;
      margin: 0 !important;
    }
    .pdf-render-sandbox table {
      width: 100% !important;
      border-collapse: collapse !important;
      margin: 14px 0 !important;
      table-layout: auto !important;
    }
    .pdf-render-sandbox td,
    .pdf-render-sandbox th {
      border: 1px solid #94a3b8 !important;
      padding: 8px 12px !important;
      text-align: left !important;
      vertical-align: top !important;
      color: #111827 !important;
    }
    .pdf-render-sandbox th {
      background-color: #f1f5f9 !important;
      font-weight: 700 !important;
    }
    .pdf-render-sandbox h1 {
      font-size: 26px !important;
      font-weight: 700 !important;
      margin: 18px 0 10px !important;
      color: #0f172a !important;
    }
    .pdf-render-sandbox h2 {
      font-size: 20px !important;
      font-weight: 600 !important;
      margin: 16px 0 8px !important;
      color: #1e293b !important;
    }
    .pdf-render-sandbox h3 {
      font-size: 16px !important;
      font-weight: 600 !important;
      margin: 14px 0 6px !important;
      color: #334155 !important;
    }
    .pdf-render-sandbox p {
      margin: 8px 0 !important;
      color: #1f2937 !important;
    }
    .pdf-render-sandbox ul,
    .pdf-render-sandbox ol {
      padding-left: 26px !important;
      margin: 8px 0 !important;
    }
    .pdf-render-sandbox li {
      margin: 4px 0 !important;
      color: #1f2937 !important;
    }
    .pdf-render-sandbox blockquote {
      border-left: 4px solid #6366f1 !important;
      padding-left: 14px !important;
      margin: 12px 0 !important;
      color: #4b5563 !important;
      font-style: italic !important;
      background-color: #f8fafc !important;
      padding-top: 6px !important;
      padding-bottom: 6px !important;
    }
    .pdf-render-sandbox pre {
      background: #f8fafc !important;
      border: 1px solid #e2e8f0 !important;
      padding: 12px !important;
      border-radius: 6px !important;
      font-family: 'Courier New', Courier, monospace !important;
      font-size: 12px !important;
      color: #0f172a !important;
      white-space: pre-wrap !important;
      margin: 10px 0 !important;
    }
    .pdf-render-sandbox code {
      background: #f1f5f9 !important;
      padding: 2px 5px !important;
      border-radius: 4px !important;
      font-family: 'Courier New', Courier, monospace !important;
      font-size: 0.9em !important;
      color: #0f172a !important;
    }
    .pdf-render-sandbox a {
      color: #2563eb !important;
      text-decoration: underline !important;
    }
    .pdf-render-sandbox mark {
      padding: 2px 4px !important;
      border-radius: 3px !important;
      background-color: #fef08a !important;
    }
    .pdf-render-sandbox img {
      max-width: 100% !important;
      height: auto !important;
      border-radius: 6px !important;
      margin: 10px 0 !important;
      display: block !important;
    }
    .pdf-render-sandbox hr {
      border: none !important;
      border-top: 1px solid #cbd5e1 !important;
      margin: 18px 0 !important;
    }
    .pdf-render-sandbox ul[data-type="taskList"] {
      list-style: none !important;
      padding-left: 4px !important;
    }
    .pdf-render-sandbox ul[data-type="taskList"] li {
      display: flex !important;
      align-items: flex-start !important;
      gap: 8px !important;
    }
    .pdf-render-sandbox .page-break,
    .pdf-render-sandbox div[data-type="page-break"] {
      height: 1px !important;
      margin: 24px 0 !important;
      border: none !important;
    }
  `;
}

// ─── Main Export Function ───────────────────────────────────

export async function exportToPdf(
  html: string,
  title: string,
  settings: DocumentSettings = DEFAULT_DOCUMENT_SETTINGS
): Promise<void> {
  const paper = getPaperSize(settings.pageSize);
  const isLandscape = settings.orientation === "landscape";

  // Page dimensions in mm
  const pageWidthMm = isLandscape ? paper.heightMm : paper.widthMm;
  const pageHeightMm = isLandscape ? paper.widthMm : paper.heightMm;

  // Content area in mm
  const contentWidthMm =
    pageWidthMm - settings.margins.left - settings.margins.right;
  const contentHeightMm =
    pageHeightMm - settings.margins.top - settings.margins.bottom;

  // Create jsPDF instance
  const pdf = new jsPDF({
    orientation: isLandscape ? "landscape" : "portrait",
    unit: "mm",
    format: [pageWidthMm, pageHeightMm],
    compress: true,
  });

  // Calculate container pixel width based on standard 96 DPI
  const targetWidthPx = Math.round(mmToPx(contentWidthMm));

  // Sanitize any stray modern color functions in input html
  const sanitizedHtml = (html || "<p></p>")
    .replace(/oklch\([^)]+\)/gi, "#111827")
    .replace(/color-mix\([^)]+\)/gi, "#111827");

  // Create an isolated sandbox iframe to completely shield html2canvas from host Tailwind v4 stylesheets
  const iframe = document.createElement("iframe");
  iframe.style.position = "fixed";
  iframe.style.top = "0";
  iframe.style.left = "0";
  iframe.style.width = `${targetWidthPx}px`;
  iframe.style.height = "1000px";
  iframe.style.zIndex = "-99999";
  iframe.style.opacity = "0";
  iframe.style.pointerEvents = "none";
  iframe.style.border = "none";

  document.body.appendChild(iframe);

  const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
  if (!iframeDoc) {
    throw new Error("Gagal menginisialisasi sandbox rendering PDF.");
  }

  const safeCss = getSafeCss(
    settings.defaultFont || "Arial, sans-serif",
    settings.defaultFontSize || 12
  );

  iframeDoc.open();
  iframeDoc.write(`
    <!DOCTYPE html>
    <html lang="id">
      <head>
        <meta charset="utf-8" />
        <title>PDF Render</title>
        <style id="pdf-safe-styles">${safeCss}</style>
      </head>
      <body>
        <div id="pdf-content-wrapper" class="pdf-render-sandbox" style="width:${targetWidthPx}px;max-width:${targetWidthPx}px;">
          ${sanitizedHtml}
        </div>
      </body>
    </html>
  `);
  iframeDoc.close();

  try {
    const contentElement = iframeDoc.getElementById("pdf-content-wrapper");
    if (!contentElement) {
      throw new Error("Gagal memuat konten catatan ke dalam sandbox.");
    }

    // Preload & convert images inside iframe
    await preloadAndConvertImages(contentElement);

    // Render using html2canvas on the clean iframe element
    const canvas = await html2canvas(contentElement, {
      scale: 2,
      useCORS: true,
      allowTaint: false,
      backgroundColor: "#ffffff",
      logging: false,
      windowWidth: targetWidthPx,
      onclone: (clonedDoc) => {
        // Strip any external stylesheets that html2canvas might have picked up
        const allStyles = Array.from(
          clonedDoc.head.querySelectorAll("style, link[rel='stylesheet']")
        );
        allStyles.forEach((s) => {
          if (s.id !== "pdf-safe-styles") {
            s.remove();
          }
        });

        clonedDoc.documentElement.removeAttribute("class");
        clonedDoc.documentElement.removeAttribute("style");
        clonedDoc.body.removeAttribute("class");
        clonedDoc.body.removeAttribute("style");
        clonedDoc.body.style.backgroundColor = "#ffffff";
        clonedDoc.body.style.color = "#111827";
      },
    });

    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;

    if (canvasWidth === 0 || canvasHeight === 0) {
      throw new Error("Render canvas menghasilkan dimensi kosong.");
    }

    // Content dimensions in PDF points/pixels
    const pageContentHeightPx = Math.round(mmToPx(contentHeightMm) * 2);
    const totalPages = Math.max(1, Math.ceil(canvasHeight / pageContentHeightPx));

    for (let page = 0; page < totalPages; page++) {
      if (page > 0) pdf.addPage();

      const sourceY = page * pageContentHeightPx;
      const sliceHeight = Math.min(pageContentHeightPx, canvasHeight - sourceY);

      if (sliceHeight <= 0) break;

      // Create slice canvas
      const pageCanvas = document.createElement("canvas");
      pageCanvas.width = canvasWidth;
      pageCanvas.height = sliceHeight;

      const ctx = pageCanvas.getContext("2d");
      if (ctx) {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvasWidth, sliceHeight);
        ctx.drawImage(
          canvas,
          0,
          sourceY,
          canvasWidth,
          sliceHeight,
          0,
          0,
          canvasWidth,
          sliceHeight
        );

        const imgData = pageCanvas.toDataURL("image/jpeg", 0.95);
        const renderHeightMm = (sliceHeight / canvasWidth) * contentWidthMm;

        pdf.addImage(
          imgData,
          "JPEG",
          settings.margins.left,
          settings.margins.top,
          contentWidthMm,
          renderHeightMm,
          undefined,
          "FAST"
        );
      }
    }

    // Save PDF via file-saver Blob for universal cross-browser/mobile compatibility
    const sanitizedTitle = sanitizeFileName(title || "Catatan");
    const pdfBlob = pdf.output("blob");
    saveAs(pdfBlob, `${sanitizedTitle}.pdf`);
  } catch (error) {
    console.error("PDF Export failed:", error);
    throw error;
  } finally {
    // Clean up sandbox iframe
    if (iframe.parentNode) {
      document.body.removeChild(iframe);
    }
  }
}

// ─── File Name Sanitizer ────────────────────────────────────

function sanitizeFileName(name: string): string {
  return (
    name
      .replace(/[<>:"/\\|?*\x00-\x1f]/g, "")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 200) || "Catatan"
  );
}
