/**
 * TipTap Font Size Extension (Microsoft Word Standard in Points - pt)
 *
 * Extends TextStyle mark to support font-size formatting.
 * Uses typographic points (pt) matching Microsoft Word and Google Docs:
 * 12pt in Word = 12pt in Web = 16px CSS.
 *
 * Usage:
 *   editor.chain().focus().setFontSize('12pt').run()
 *   editor.chain().focus().unsetFontSize().run()
 *   editor.getAttributes('textStyle').fontSize  // → '12pt'
 */

import { Extension } from "@tiptap/react";

// Standard typographic font size presets in points (pt) - exactly like Microsoft Word
export const FONT_SIZE_PRESETS = [
  "8",
  "9",
  "10",
  "11",
  "12",
  "14",
  "16",
  "18",
  "20",
  "22",
  "24",
  "26",
  "28",
  "36",
  "48",
  "72",
] as const;

export type FontSizePreset = (typeof FONT_SIZE_PRESETS)[number];

declare module "@tiptap/react" {
  interface Commands<ReturnType> {
    fontSize: {
      setFontSize: (fontSize: string) => ReturnType;
      unsetFontSize: () => ReturnType;
    };
  }
}

export const FontSize = Extension.create({
  name: "fontSize",

  addOptions() {
    return {
      types: ["textStyle"],
    };
  },

  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          fontSize: {
            default: null,
            parseHTML: (element: HTMLElement) => {
              const size = element.style.fontSize;
              if (!size) return null;
              return size;
            },
            renderHTML: (attributes: Record<string, unknown>) => {
              if (!attributes.fontSize) return {};
              return {
                style: `font-size: ${attributes.fontSize}`,
              };
            },
          },
        },
      },
    ];
  },

  addCommands() {
    return {
      setFontSize:
        (fontSize: string) =>
        ({ chain }) => {
          // Normalize: if user gives "12", treat as "12pt" (Word standard)
          let normalized = fontSize.trim();
          if (/^\d+(\.\d+)?$/.test(normalized)) {
            normalized = `${normalized}pt`;
          }
          return chain().setMark("textStyle", { fontSize: normalized }).run();
        },
      unsetFontSize:
        () =>
        ({ chain }) => {
          return chain()
            .setMark("textStyle", { fontSize: null })
            .removeEmptyTextStyle()
            .run();
        },
    };
  },
});
