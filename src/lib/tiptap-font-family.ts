/**
 * TipTap Font Family Extension
 *
 * Extends TextStyle mark to support per-character font-family inline styling.
 * Stores font-family as a CSS inline style on <span style="font-family: ...">
 * which integrates natively with TipTap's TextStyle mark.
 *
 * Usage:
 *   editor.chain().focus().setFontFamily('Arial').run()
 *   editor.chain().focus().unsetFontFamily().run()
 *   editor.getAttributes('textStyle').fontFamily  // → 'Arial'
 */

import { Extension } from "@tiptap/react";

// Curated list of web-safe and Google Fonts available in most environments
export const FONT_FAMILIES = [
  { name: "Arial", value: "Arial, sans-serif" },
  { name: "Calibri", value: "Calibri, sans-serif" },
  { name: "Cambria", value: "Cambria, serif" },
  { name: "Georgia", value: "Georgia, serif" },
  { name: "Helvetica", value: "Helvetica, Arial, sans-serif" },
  { name: "Inter", value: "'Inter', sans-serif" },
  { name: "Roboto", value: "'Roboto', sans-serif" },
  { name: "Times New Roman", value: "'Times New Roman', Times, serif" },
  { name: "Verdana", value: "Verdana, sans-serif" },
  { name: "Courier New", value: "'Courier New', Courier, monospace" },
  { name: "Trebuchet MS", value: "'Trebuchet MS', sans-serif" },
  { name: "Garamond", value: "Garamond, serif" },
  { name: "Comic Sans MS", value: "'Comic Sans MS', cursive" },
  { name: "Impact", value: "Impact, sans-serif" },
  { name: "Fira Code", value: "'Fira Code', monospace" },
] as const;

export type FontFamilyOption = (typeof FONT_FAMILIES)[number];

declare module "@tiptap/react" {
  interface Commands<ReturnType> {
    fontFamily: {
      setFontFamily: (fontFamily: string) => ReturnType;
      unsetFontFamily: () => ReturnType;
    };
  }
}

export const FontFamily = Extension.create({
  name: "fontFamily",

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
          fontFamily: {
            default: null,
            parseHTML: (element: HTMLElement) =>
              element.style.fontFamily?.replace(/['"]+/g, "") || null,
            renderHTML: (attributes: Record<string, unknown>) => {
              if (!attributes.fontFamily) return {};
              return {
                style: `font-family: ${attributes.fontFamily}`,
              };
            },
          },
        },
      },
    ];
  },

  addCommands() {
    return {
      setFontFamily:
        (fontFamily: string) =>
        ({ chain }) => {
          return chain().setMark("textStyle", { fontFamily }).run();
        },
      unsetFontFamily:
        () =>
        ({ chain }) => {
          return chain()
            .setMark("textStyle", { fontFamily: null })
            .removeEmptyTextStyle()
            .run();
        },
    };
  },
});
