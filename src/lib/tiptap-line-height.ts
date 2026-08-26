/**
 * TipTap Line Height Extension (Word "Line Spacing" parity)
 *
 * Menambahkan atribut lineHeight pada paragraph & heading.
 * Nilai: "1", "1.15", "1.5", "2", "2.5", "3" (unitless multiplier).
 */

import { Extension } from "@tiptap/react";

declare module "@tiptap/react" {
  interface Commands<ReturnType> {
    lineHeight: {
      setLineHeight: (lineHeight: string) => ReturnType;
      unsetLineHeight: () => ReturnType;
    };
  }
}

export const LINE_HEIGHT_TYPES = ["paragraph", "heading"];

export const LINE_HEIGHT_PRESETS = [
  { value: "1", label: "Tunggal (1.0)" },
  { value: "1.15", label: "1.15" },
  { value: "1.5", label: "1.5" },
  { value: "2", label: "Ganda (2.0)" },
  { value: "2.5", label: "2.5" },
  { value: "3", label: "3.0" },
];

export const LineHeight = Extension.create({
  name: "lineHeight",

  addGlobalAttributes() {
    return [
      {
        types: LINE_HEIGHT_TYPES,
        attributes: {
          lineHeight: {
            default: null,
            parseHTML: (element) => element.style.lineHeight || null,
            renderHTML: (attributes) => {
              if (!attributes.lineHeight) return {};
              return { style: `line-height: ${attributes.lineHeight}` };
            },
          },
        },
      },
    ];
  },

  addCommands() {
    return {
      setLineHeight:
        (lineHeight: string) =>
        ({ chain }) => {
          let cmd = chain().focus();
          LINE_HEIGHT_TYPES.forEach((type) => {
            cmd = cmd.updateAttributes(type, { lineHeight });
          });
          return cmd.run();
        },
      unsetLineHeight:
        () =>
        ({ chain }) => {
          let cmd = chain().focus();
          LINE_HEIGHT_TYPES.forEach((type) => {
            cmd = cmd.updateAttributes(type, { lineHeight: null });
          });
          return cmd.run();
        },
    };
  },

  addKeyboardShortcuts() {
    return {
      "Mod-Shift-1": () => this.editor.commands.setLineHeight("1"),
      "Mod-Shift-2": () => this.editor.commands.setLineHeight("2"),
    };
  },
});
