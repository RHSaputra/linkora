/**
 * TipTap Page Break Extension
 *
 * Adds a `pageBreak` block node to TipTap, rendered as
 * <div data-type="page-break" class="page-break"></div>
 *
 * In the editor it displays as a visual page separator.
 * In PDF/DOCX export it maps to an actual page break.
 *
 * Usage:
 *   editor.chain().focus().setPageBreak().run()
 */

import { Node, mergeAttributes } from "@tiptap/react";

declare module "@tiptap/react" {
  interface Commands<ReturnType> {
    pageBreak: {
      setPageBreak: () => ReturnType;
    };
  }
}

export const PageBreak = Node.create({
  name: "pageBreak",

  group: "block",

  atom: true,

  draggable: true,

  parseHTML() {
    return [
      {
        tag: 'div[data-type="page-break"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes(HTMLAttributes, {
        "data-type": "page-break",
        class: "page-break",
      }),
    ];
  },

  addCommands() {
    return {
      setPageBreak:
        () =>
        ({ chain }) => {
          return chain()
            .insertContent({ type: this.name })
            .run();
        },
    };
  },

  addKeyboardShortcuts() {
    return {
      "Mod-Enter": () => this.editor.commands.setPageBreak(),
    };
  },
});
