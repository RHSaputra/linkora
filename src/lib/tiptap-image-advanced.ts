import {
  Node,
  mergeAttributes,
  nodeInputRule,
} from "@tiptap/react";

export type ImageAlignment = "left" | "center" | "right";
export type ImageWrapMode = "inline" | "square-left" | "square-right" | "top-bottom" | "behind" | "front";

export interface AdvancedImageAttributes {
  src: string;
  alt?: string;
  title?: string;
  width?: number | string | null;
  height?: number | string | null;
  align?: ImageAlignment;
  wrap?: ImageWrapMode;
  rotation?: number;
  aspectRatio?: number | null;
}

declare module "@tiptap/react" {
  interface Commands<ReturnType> {
    image: {
      setImage: (options: AdvancedImageAttributes) => ReturnType;
      updateImageAttributes: (attributes: Partial<AdvancedImageAttributes>) => ReturnType;
      duplicateSelectedImage: () => ReturnType;
      deleteSelectedImage: () => ReturnType;
    };
  }
}

export const inputRegex = /(?:^|\s)(!\[(.+|:?)]\((\S+)(?:(?:\s+)["'](\S+)["'])?\))$/;

export const AdvancedImage = Node.create({
  name: "image",

  group: "block",
  inline: false,
  draggable: true,
  selectable: true,

  addAttributes() {
    return {
      src: {
        default: null,
        parseHTML: (element: HTMLElement) => element.getAttribute("src"),
        renderHTML: (attributes: Record<string, any>) => ({ src: attributes.src }),
      },
      alt: {
        default: "",
        parseHTML: (element: HTMLElement) => element.getAttribute("alt") || "",
        renderHTML: (attributes: Record<string, any>) => ({ alt: attributes.alt || "" }),
      },
      title: {
        default: "",
        parseHTML: (element: HTMLElement) => element.getAttribute("title") || "",
        renderHTML: (attributes: Record<string, any>) => (attributes.title ? { title: attributes.title } : {}),
      },
      width: {
        default: null,
        parseHTML: (element: HTMLElement) => {
          const w = element.getAttribute("width") || element.style.width;
          if (!w) return null;
          const parsed = parseInt(w, 10);
          return isNaN(parsed) ? null : parsed;
        },
        renderHTML: (attributes: Record<string, any>) => (attributes.width ? { width: attributes.width } : {}),
      },
      height: {
        default: null,
        parseHTML: (element: HTMLElement) => {
          const h = element.getAttribute("height") || element.style.height;
          if (!h) return null;
          const parsed = parseInt(h, 10);
          return isNaN(parsed) ? null : parsed;
        },
        renderHTML: (attributes: Record<string, any>) => (attributes.height ? { height: attributes.height } : {}),
      },
      align: {
        default: "center",
        parseHTML: (element: HTMLElement) => (element.getAttribute("data-align") as ImageAlignment) || "center",
        renderHTML: (attributes: Record<string, any>) => ({ "data-align": attributes.align || "center" }),
      },
      wrap: {
        default: "top-bottom",
        parseHTML: (element: HTMLElement) => (element.getAttribute("data-wrap") as ImageWrapMode) || "top-bottom",
        renderHTML: (attributes: Record<string, any>) => ({ "data-wrap": attributes.wrap || "top-bottom" }),
      },
      rotation: {
        default: 0,
        parseHTML: (element: HTMLElement) => {
          const r = element.getAttribute("data-rotation");
          return r ? parseInt(r, 10) || 0 : 0;
        },
        renderHTML: (attributes: Record<string, any>) => (attributes.rotation ? { "data-rotation": attributes.rotation } : {}),
      },
      aspectRatio: {
        default: null,
        parseHTML: (element: HTMLElement) => {
          const ar = element.getAttribute("data-aspect-ratio");
          return ar ? parseFloat(ar) || null : null;
        },
        renderHTML: (attributes: Record<string, any>) => (attributes.aspectRatio ? { "data-aspect-ratio": attributes.aspectRatio } : {}),
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'img[src]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }: { HTMLAttributes: Record<string, any> }) {
    const align = (HTMLAttributes["data-align"] as ImageAlignment) || "center";
    const wrap = (HTMLAttributes["data-wrap"] as ImageWrapMode) || "top-bottom";
    const rotation = (HTMLAttributes["data-rotation"] as number) || 0;
    const width = HTMLAttributes.width ? `${HTMLAttributes.width}px` : "auto";
    const height = HTMLAttributes.height ? `${HTMLAttributes.height}px` : "auto";

    let inlineStyle = `max-width: 100%; width: ${width}; height: ${height};`;
    
    if (rotation) {
      inlineStyle += ` transform: rotate(${rotation}deg); transform-origin: center center;`;
    }

    if (wrap === "square-left") {
      inlineStyle += " float: left; margin: 8px 18px 8px 0; clear: left;";
    } else if (wrap === "square-right") {
      inlineStyle += " float: right; margin: 8px 0 8px 18px; clear: right;";
    } else if (wrap === "behind") {
      inlineStyle += " position: relative; z-index: 0; opacity: 0.85; margin: 8px auto;";
    } else if (wrap === "front") {
      inlineStyle += " position: relative; z-index: 10; margin: 8px auto;";
    } else if (wrap === "inline") {
      inlineStyle += " display: inline-block; vertical-align: middle; margin: 4px 8px;";
    } else {
      // top-bottom (default block)
      inlineStyle += " display: block;";
      if (align === "left") {
        inlineStyle += " margin: 12px auto 12px 0;";
      } else if (align === "right") {
        inlineStyle += " margin: 12px 0 12px auto;";
      } else {
        inlineStyle += " margin: 12px auto;";
      }
    }

    const merged = mergeAttributes(HTMLAttributes, {
      style: inlineStyle,
      class: "word-style-image",
    });

    return ["img", merged];
  },

  addNodeView() {
    return ({ node, editor, getPos }: { node: any; editor: any; getPos: any }) => {
      // Container wrapper for image & Word-like handles
      const dom = document.createElement("div");
      dom.className = "word-image-node-container";
      dom.setAttribute("data-image-selected", "false");

      const imgWrapper = document.createElement("div");
      imgWrapper.className = "word-image-wrapper";

      const img = document.createElement("img");
      img.className = "word-image-element";
      img.src = node.attrs.src || "";
      img.alt = node.attrs.alt || "";
      img.title = node.attrs.title || "";
      img.draggable = false;

      imgWrapper.appendChild(img);
      dom.appendChild(imgWrapper);

      // Create 8 resize handles + 1 rotation handle
      const handles: { [key: string]: HTMLDivElement } = {};
      const handlePositions = ["nw", "n", "ne", "e", "se", "s", "sw", "w"];
      
      const handlesContainer = document.createElement("div");
      handlesContainer.className = "word-image-handles-overlay";

      // Rotation pin on top
      const rotateStem = document.createElement("div");
      rotateStem.className = "word-image-rotate-stem";
      const rotateHandle = document.createElement("div");
      rotateHandle.className = "word-image-handle word-image-handle-rotate";
      rotateHandle.title = "Putar Gambar (Drag untuk memutar, tahan Shift untuk snap 15°)";
      rotateStem.appendChild(rotateHandle);
      handlesContainer.appendChild(rotateStem);

      handlePositions.forEach((pos) => {
        const handle = document.createElement("div");
        handle.className = `word-image-handle word-image-handle-${pos}`;
        handle.setAttribute("data-handle", pos);
        handles[pos] = handle;
        handlesContainer.appendChild(handle);
      });

      imgWrapper.appendChild(handlesContainer);

      // Sync attributes to DOM
      const updateDom = (attrs: Record<string, any>) => {
        const align = attrs.align || "center";
        const wrap = attrs.wrap || "top-bottom";
        const rotation = attrs.rotation || 0;
        const width = attrs.width;
        const height = attrs.height;

        dom.setAttribute("data-align", align);
        dom.setAttribute("data-wrap", wrap);
        if (attrs.src && img.src !== attrs.src) {
          img.src = attrs.src;
        }
        img.alt = attrs.alt || "";
        img.title = attrs.title || "";

        // Apply width/height to wrapper
        if (width) {
          imgWrapper.style.width = `${width}px`;
          img.style.width = "100%";
        } else {
          imgWrapper.style.width = "auto";
          img.style.width = "auto";
        }

        if (height) {
          imgWrapper.style.height = `${height}px`;
          img.style.height = "100%";
        } else {
          imgWrapper.style.height = "auto";
          img.style.height = "auto";
        }

        // Apply rotation
        imgWrapper.style.transform = rotation ? `rotate(${rotation}deg)` : "none";

        // Apply alignment & wrap layout
        dom.style.textAlign = align;
        if (wrap === "square-left") {
          dom.style.float = "left";
          dom.style.margin = "8px 18px 8px 0";
          dom.style.display = "block";
          dom.style.clear = "none";
        } else if (wrap === "square-right") {
          dom.style.float = "right";
          dom.style.margin = "8px 0 8px 18px";
          dom.style.display = "block";
          dom.style.clear = "none";
        } else if (wrap === "behind") {
          dom.style.float = "none";
          dom.style.display = "block";
          dom.style.position = "relative";
          dom.style.zIndex = "0";
          dom.style.opacity = "0.85";
        } else if (wrap === "front") {
          dom.style.float = "none";
          dom.style.display = "block";
          dom.style.position = "relative";
          dom.style.zIndex = "10";
          dom.style.opacity = "1";
        } else if (wrap === "inline") {
          dom.style.float = "none";
          dom.style.display = "inline-block";
          dom.style.margin = "4px 8px";
          dom.style.verticalAlign = "middle";
        } else {
          // top-bottom
          dom.style.float = "none";
          dom.style.display = "block";
          dom.style.clear = "both";
          if (align === "left") {
            dom.style.marginLeft = "0";
            dom.style.marginRight = "auto";
          } else if (align === "right") {
            dom.style.marginLeft = "auto";
            dom.style.marginRight = "0";
          } else {
            dom.style.marginLeft = "auto";
            dom.style.marginRight = "auto";
          }
        }
      };

      // Set initial natural aspect ratio when image loads
      img.onload = () => {
        if (!node.attrs.aspectRatio && img.naturalWidth && img.naturalHeight) {
          const ar = img.naturalWidth / img.naturalHeight;
          const pos = typeof getPos === "function" ? getPos() : undefined;
          if (pos !== undefined) {
            editor.commands.command(({ tr }: { tr: any }) => {
              tr.setNodeMarkup(pos, undefined, {
                ...node.attrs,
                aspectRatio: ar,
                width: node.attrs.width || Math.min(img.naturalWidth, 600),
                height: node.attrs.height || (node.attrs.width ? Math.round(node.attrs.width / ar) : Math.min(img.naturalHeight, Math.round(600 / ar))),
              });
              return true;
            });
          }
        }
      };

      updateDom(node.attrs);

      // Node selection click handler
      dom.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (typeof getPos === "function") {
          const pos = getPos();
          if (pos !== undefined) {
            editor.commands.setNodeSelection(pos);
          }
        }
      });

      // Resize logic
      let isResizing = false;
      let startX = 0;
      let startY = 0;
      let startWidth = 0;
      let startHeight = 0;
      let activeHandle = "";
      let currentAspectRatio = node.attrs.aspectRatio || (img.naturalWidth / img.naturalHeight) || 1;

      const onMouseDownHandle = (e: MouseEvent, handleType: string) => {
        e.preventDefault();
        e.stopPropagation();
        isResizing = true;
        activeHandle = handleType;
        startX = e.clientX;
        startY = e.clientY;
        startWidth = imgWrapper.offsetWidth || img.naturalWidth || 300;
        startHeight = imgWrapper.offsetHeight || img.naturalHeight || 200;
        currentAspectRatio = node.attrs.aspectRatio || (startWidth / startHeight) || 1;

        document.addEventListener("mousemove", onMouseMove);
        document.addEventListener("mouseup", onMouseUp);
      };

      const onMouseMove = (e: MouseEvent) => {
        if (!isResizing) return;
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;

        let newWidth = startWidth;
        let newHeight = startHeight;

        const isCorner = ["se", "sw", "ne", "nw"].includes(activeHandle);

        if (activeHandle === "se") {
          newWidth = Math.max(50, startWidth + dx);
          newHeight = isCorner ? Math.round(newWidth / currentAspectRatio) : Math.max(50, startHeight + dy);
        } else if (activeHandle === "sw") {
          newWidth = Math.max(50, startWidth - dx);
          newHeight = isCorner ? Math.round(newWidth / currentAspectRatio) : Math.max(50, startHeight + dy);
        } else if (activeHandle === "ne") {
          newWidth = Math.max(50, startWidth + dx);
          newHeight = isCorner ? Math.round(newWidth / currentAspectRatio) : Math.max(50, startHeight - dy);
        } else if (activeHandle === "nw") {
          newWidth = Math.max(50, startWidth - dx);
          newHeight = isCorner ? Math.round(newWidth / currentAspectRatio) : Math.max(50, startHeight - dy);
        } else if (activeHandle === "e") {
          newWidth = Math.max(50, startWidth + dx);
          newHeight = e.shiftKey ? Math.round(newWidth / currentAspectRatio) : startHeight;
        } else if (activeHandle === "w") {
          newWidth = Math.max(50, startWidth - dx);
          newHeight = e.shiftKey ? Math.round(newWidth / currentAspectRatio) : startHeight;
        } else if (activeHandle === "s") {
          newHeight = Math.max(50, startHeight + dy);
          newWidth = e.shiftKey ? Math.round(newHeight * currentAspectRatio) : startWidth;
        } else if (activeHandle === "n") {
          newHeight = Math.max(50, startHeight - dy);
          newWidth = e.shiftKey ? Math.round(newHeight * currentAspectRatio) : startWidth;
        }

        imgWrapper.style.width = `${newWidth}px`;
        imgWrapper.style.height = `${newHeight}px`;
      };

      const onMouseUp = () => {
        if (!isResizing) return;
        isResizing = false;
        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onMouseUp);

        const finalWidth = imgWrapper.offsetWidth;
        const finalHeight = imgWrapper.offsetHeight;

        const pos = typeof getPos === "function" ? getPos() : undefined;
        if (pos !== undefined) {
          editor.commands.command(({ tr }: { tr: any }) => {
            tr.setNodeMarkup(pos, undefined, {
              ...node.attrs,
              width: finalWidth,
              height: finalHeight,
              aspectRatio: currentAspectRatio,
            });
            return true;
          });
        }
      };

      // Attach handle mousedown listeners
      Object.entries(handles).forEach(([pos, handleEl]) => {
        handleEl.addEventListener("mousedown", (e) => onMouseDownHandle(e, pos));
      });

      // Rotation logic
      let isRotating = false;
      let centerBox = { x: 0, y: 0 };
      let startAngle = 0;
      let initialRotation = node.attrs.rotation || 0;

      const onRotateMouseDown = (e: MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        isRotating = true;
        const rect = imgWrapper.getBoundingClientRect();
        centerBox = {
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2,
        };
        startAngle = Math.atan2(e.clientY - centerBox.y, e.clientX - centerBox.x) * (180 / Math.PI);
        initialRotation = node.attrs.rotation || 0;

        document.addEventListener("mousemove", onRotateMouseMove);
        document.addEventListener("mouseup", onRotateMouseUp);
      };

      const onRotateMouseMove = (e: MouseEvent) => {
        if (!isRotating) return;
        const currentAngle = Math.atan2(e.clientY - centerBox.y, e.clientX - centerBox.x) * (180 / Math.PI);
        let deg = Math.round(initialRotation + (currentAngle - startAngle));
        // Snap to 15 degrees if Shift is held
        if (e.shiftKey) {
          deg = Math.round(deg / 15) * 15;
        }
        // Normalize 0-360
        deg = ((deg % 360) + 360) % 360;
        imgWrapper.style.transform = `rotate(${deg}deg)`;
      };

      const onRotateMouseUp = () => {
        if (!isRotating) return;
        isRotating = false;
        document.removeEventListener("mousemove", onRotateMouseMove);
        document.removeEventListener("mouseup", onRotateMouseUp);

        // Extract transform angle
        const transformStr = imgWrapper.style.transform;
        const match = transformStr.match(/rotate\(([-0-9.]+)deg\)/);
        const finalRotation = match ? Math.round(parseFloat(match[1])) : 0;

        const pos = typeof getPos === "function" ? getPos() : undefined;
        if (pos !== undefined) {
          editor.commands.command(({ tr }: { tr: any }) => {
            tr.setNodeMarkup(pos, undefined, {
              ...node.attrs,
              rotation: ((finalRotation % 360) + 360) % 360,
            });
            return true;
          });
        }
      };

      rotateHandle.addEventListener("mousedown", onRotateMouseDown);

      return {
        dom,
        update: (updatedNode: any) => {
          if (updatedNode.type !== node.type) return false;
          node = updatedNode;
          updateDom(updatedNode.attrs);
          return true;
        },
        selectNode: () => {
          dom.classList.add("word-image-selected");
          dom.setAttribute("data-image-selected", "true");
        },
        deselectNode: () => {
          dom.classList.remove("word-image-selected");
          dom.setAttribute("data-image-selected", "false");
        },
        destroy: () => {
          document.removeEventListener("mousemove", onMouseMove);
          document.removeEventListener("mouseup", onMouseUp);
          document.removeEventListener("mousemove", onRotateMouseMove);
          document.removeEventListener("mouseup", onRotateMouseUp);
        },
      };
    };
  },

  addCommands() {
    return {
      setImage:
        (options: AdvancedImageAttributes) =>
        ({ commands }: any) => {
          return commands.insertContent({
            type: this.name,
            attrs: options,
          });
        },
      updateImageAttributes:
        (attributes: Partial<AdvancedImageAttributes>) =>
        ({ tr, state, dispatch }: any) => {
          const { selection } = state;
          const node = (selection as any)?.node;
          if (node && node.type.name === this.name) {
            if (dispatch) {
              tr.setNodeMarkup(selection.from, undefined, {
                ...node.attrs,
                ...attributes,
              });
              dispatch(tr);
            }
            return true;
          }
          return false;
        },
      duplicateSelectedImage:
        () =>
        ({ tr, state, dispatch }: any) => {
          const { selection } = state;
          const node = (selection as any)?.node;
          if (node && node.type.name === this.name) {
            if (dispatch) {
              const clone = node.type.create(node.attrs);
              tr.insert(selection.to, clone);
              dispatch(tr);
            }
            return true;
          }
          return false;
        },
      deleteSelectedImage:
        () =>
        ({ tr, state, dispatch }: any) => {
          const { selection } = state;
          const node = (selection as any)?.node;
          if (node && node.type.name === this.name) {
            if (dispatch) {
              tr.delete(selection.from, selection.to);
              dispatch(tr);
            }
            return true;
          }
          return false;
        },
    };
  },

  addInputRules() {
    return [
      nodeInputRule({
        find: inputRegex,
        type: this.type,
        getAttributes: (match: any) => {
          const [, , alt, src, title] = match;
          return { src, alt, title };
        },
      }),
    ];
  },
});
