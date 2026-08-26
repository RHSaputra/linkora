/**
 * TipTap Indent Extension (Word "Increase/Decrease Indent" parity)
 *
 * Menambahkan indentasi kiri pada paragraph & heading (bukan hanya list).
 * Disimpan sebagai langkah (step) 0..MAX_INDENT_STEPS, dirender
 * menjadi margin-left px agar konsisten di layar & ekspor.
 */

import { Extension } from "@tiptap/react";

declare module "@tiptap/react" {
  interface Commands<ReturnType> {
    indent: {
      indentBlock: () => ReturnType;
      outdentBlock: () => ReturnType;
    };
  }
}

const INDENT_TYPES = ["paragraph", "heading"];
export const INDENT_STEP_PX = 40;
export const MAX_INDENT_STEPS = 10;

function getIndentAttrs(step: number): Record<string, unknown> {
  return step > 0
    ? { style: `margin-left: ${step * INDENT_STEP_PX}px` }
    : {};
}

export const Indent = Extension.create({
  name: "indent",

  addGlobalAttributes() {
    return [
      {
        types: INDENT_TYPES,
        attributes: {
          indent: {
            default: 0,
            parseHTML: (element) => {
              const ml = parseInt(element.style.marginLeft || "0", 10);
              return Math.min(
                MAX_INDENT_STEPS,
                Math.max(0, Math.round(ml / INDENT_STEP_PX))
              );
            },
            renderHTML: (attributes) => getIndentAttrs(attributes.indent ?? 0),
          },
        },
      },
    ];
  },

  addCommands() {
    return {
      indentBlock:
        () =>
        ({ chain, state }) => {
          const parent = state.selection.$from.parent as { attrs?: { indent?: number } };
          const current = parent?.attrs?.indent ?? 0;
          if (current >= MAX_INDENT_STEPS) return false;
          const next = Math.min(MAX_INDENT_STEPS, current + 1);
          let cmd = chain().focus();
          INDENT_TYPES.forEach((type) => {
            cmd = cmd.updateAttributes(type, { indent: next });
          });
          return cmd.run();
        },
      outdentBlock:
        () =>
        ({ chain, state }) => {
          const parent = state.selection.$from.parent as { attrs?: { indent?: number } };
          const current = parent?.attrs?.indent ?? 0;
          if (current <= 0) return false;
          const next = Math.max(0, current - 1);
          let cmd = chain().focus();
          INDENT_TYPES.forEach((type) => {
            cmd = cmd.updateAttributes(type, { indent: next });
          });
          return cmd.run();
        },
    };
  },
});
