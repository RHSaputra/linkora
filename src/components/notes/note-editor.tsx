"use client";

import { useEditor, EditorContent, Editor, Extension } from "@tiptap/react";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import { Decoration, DecorationSet } from "@tiptap/pm/view";
import StarterKit from "@tiptap/starter-kit";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import Highlight from "@tiptap/extension-highlight";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import Subscript from "@tiptap/extension-subscript";
import Superscript from "@tiptap/extension-superscript";
import { TextStyle } from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import Placeholder from "@tiptap/extension-placeholder";
import { AdvancedImage } from "@/lib/tiptap-image-advanced";
import { ImageToolbar } from "@/components/notes/image-toolbar";
import { Table, TableRow, TableCell, TableHeader } from "@tiptap/extension-table";
import { useTranslation } from "@/components/providers/i18n-provider";
import { useEffect, useState, useRef, useReducer, memo, useCallback } from "react";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  CheckSquare,
  Quote,
  Code,
  FileCode,
  Highlighter,
  Table as TableIcon,
  Undo,
  Redo,
  Minus,
  RemoveFormatting,
  Link as LinkIcon,
  Unlink,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Palette,
  Rows,
  Columns,
  Trash2,
  Plus,
  Combine,
  Split,
  TableProperties,
  ChevronDown,
  Check,
  RotateCcw,
  Type,
  FileDown,
  FileText,
  FileType2,
  Settings2,
  SeparatorHorizontal,
  ImageIcon,
  Upload,
  Layout,
  Maximize2,
  ZoomIn,
  ZoomOut,
  Superscript as SuperscriptIcon,
  Subscript as SubscriptIcon,
  IndentIncrease,
  IndentDecrease,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { toast } from "@/components/ui/custom-toast";

// Document system imports
import { FontFamily, FONT_FAMILIES } from "@/lib/tiptap-font-family";
import { FontSize, FONT_SIZE_PRESETS } from "@/lib/tiptap-font-size";
import { PageBreak } from "@/lib/tiptap-page-break";
import { LineHeight, LINE_HEIGHT_PRESETS } from "@/lib/tiptap-line-height";
import { Indent } from "@/lib/tiptap-indent";
import {
  type DocumentSettings,
  DEFAULT_DOCUMENT_SETTINGS,
  PAPER_SIZES,
  MARGIN_PRESETS,
  type MarginValues,
  type MarginPreset,
  getEffectivePageDimensions,
  mmToPx,
  type Orientation,
} from "@/lib/document-settings";

export interface NoteEditorProps {
  initialContent: string | null;
  onUpdate: (content: string) => void;
  editable?: boolean;
  documentSettings?: DocumentSettings;
  onDocumentSettingsChange?: (settings: DocumentSettings) => void;
  noteTitle?: string;
}

interface MenuButtonProps {
  onClick: () => void;
  isActive?: boolean;
  disabled?: boolean;
  icon: React.ReactNode;
  label: string;
  shortcut?: string;
  className?: string;
}

const MenuButton = memo(function MenuButton({
  onClick,
  isActive,
  disabled,
  icon,
  label,
  shortcut,
  className,
}: MenuButtonProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          disabled={disabled}
          onMouseDown={(e) => {
            e.preventDefault(); // Keep editor selection and focus intact
            onClick();
          }}
          aria-label={label}
          className={cn(
            "h-8 w-8 inline-flex items-center justify-center rounded-lg text-sm transition-all duration-150 active:scale-95 active:duration-75 select-none touch-manipulation cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed disabled:active:scale-100 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:outline-none shrink-0",
            isActive
              ? "bg-primary text-primary-foreground shadow-xs font-semibold"
              : "text-muted-foreground hover:text-foreground hover:bg-foreground/10 active:bg-foreground/15",
            className
          )}
        >
          {icon}
        </button>
      </TooltipTrigger>
      <TooltipContent side="top" className="text-xs py-1 px-2.5 flex items-center gap-1.5 shadow-lg border border-border/60">
        <span>{label}</span>
        {shortcut && (
          <kbd className="px-1.5 py-0.5 text-[10px] font-mono font-semibold bg-muted/80 text-muted-foreground rounded border border-border/80">
            {shortcut}
          </kbd>
        )}
      </TooltipContent>
    </Tooltip>
  );
});

function ToolbarDivider() {
  return <div className="w-px h-5 bg-border/60 mx-1 flex-shrink-0" />;
}

// ─── Font Family Selector ───────────────────────────────────

function FontFamilySelector({
  editor,
  defaultFont = "Arial",
  documentSettings,
  onDocumentSettingsChange,
}: {
  editor: Editor;
  defaultFont?: string;
  documentSettings?: DocumentSettings;
  onDocumentSettingsChange?: (settings: DocumentSettings) => void;
}) {
  const [open, setOpen] = useState(false);

  const currentFont = editor?.getAttributes("textStyle")?.fontFamily;
  const effectiveFont = currentFont || documentSettings?.defaultFont || defaultFont;
  const displayName = effectiveFont
    ? FONT_FAMILIES.find((f) =>
        effectiveFont.toLowerCase().includes(f.name.toLowerCase()) ||
        effectiveFont.toLowerCase().includes(f.value.toLowerCase())
      )?.name || effectiveFont.split(",")[0].replace(/['"]/g, "").trim()
    : "Font";

  const handleSelectFont = (fontValue: string, fontName: string) => {
    const isSelectionEmpty = editor.state.selection.empty;
    if (!isSelectionEmpty) {
      // User selected text: apply font strictly to the selected text range
      editor.chain().focus().setFontFamily(fontValue).run();
    } else {
      // No text selected: change the active document font so all newly typed text uses this font!
      editor.chain().focus().setFontFamily(fontValue).run();
      if (documentSettings && onDocumentSettingsChange) {
        onDocumentSettingsChange({
          ...documentSettings,
          defaultFont: fontName,
        });
      }
    }
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Tooltip>
        <TooltipTrigger asChild>
          <PopoverTrigger asChild>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              className={cn(
                "h-8 px-2.5 inline-flex items-center gap-1.5 rounded-lg text-xs transition-all duration-150 cursor-pointer focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none min-w-[95px] max-w-[145px]",
                open
                  ? "bg-primary text-primary-foreground shadow-sm font-semibold"
                  : "text-muted-foreground hover:text-foreground hover:bg-foreground/10"
              )}
            >
              <Type className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate text-[11px] font-medium">{displayName}</span>
              <ChevronDown className="h-3 w-3 shrink-0 opacity-60 ml-auto" />
            </button>
          </PopoverTrigger>
        </TooltipTrigger>
        <TooltipContent side="top" className="text-xs py-1 px-2.5 shadow-lg border border-border/60">
          <span>Jenis Font (Aktif: {displayName})</span>
        </TooltipContent>
      </Tooltip>
      <PopoverContent
        align="start"
        sideOffset={8}
        className="p-2 rounded-2xl bg-popover border border-border shadow-2xl z-[100] w-[230px] max-h-[340px] overflow-y-auto scrollbar-none"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-2 py-1.5 flex items-center justify-between">
          <span>Jenis Font</span>
          <span className="text-[9px] text-primary font-mono lowercase">aktif: {displayName}</span>
        </div>
        {FONT_FAMILIES.map((font) => {
          const isSelected =
            effectiveFont &&
            (effectiveFont.toLowerCase().includes(font.name.toLowerCase()) ||
              effectiveFont.toLowerCase().includes(font.value.toLowerCase()));
          return (
            <button
              key={font.name}
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleSelectFont(font.value, font.name);
              }}
              className={cn(
                "w-full text-left px-2.5 py-1.5 rounded-lg text-sm transition-colors cursor-pointer flex items-center justify-between",
                isSelected
                  ? "bg-primary/10 text-primary font-semibold"
                  : "hover:bg-foreground/5 text-foreground"
              )}
              style={{ fontFamily: font.value }}
            >
              <span>{font.name}</span>
              {isSelected && <Check className="h-3.5 w-3.5 text-primary shrink-0" />}
            </button>
          );
        })}
        {currentFont && (
          <div className="mt-1 pt-1 border-t border-border/50">
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                editor.chain().focus().unsetFontFamily().run();
                setOpen(false);
              }}
              className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-foreground/5 cursor-pointer flex items-center gap-1.5"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Reset ke Default ({documentSettings?.defaultFont || defaultFont})</span>
            </button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}

// ─── Font Size Selector (Word Points Standard) ─────────────

function FontSizeSelector({
  editor,
  defaultFontSize = 12,
  documentSettings,
  onDocumentSettingsChange,
}: {
  editor: Editor;
  defaultFontSize?: number;
  documentSettings?: DocumentSettings;
  onDocumentSettingsChange?: (settings: DocumentSettings) => void;
}) {
  const [open, setOpen] = useState(false);
  const [customSize, setCustomSize] = useState("");

  const currentSizeRaw = editor?.getAttributes("textStyle")?.fontSize;
  const displaySize = currentSizeRaw
    ? currentSizeRaw.replace(/pt|px/gi, "")
    : `${documentSettings?.defaultFontSize || defaultFontSize}`;

  const handleSetSize = (size: string) => {
    const parsed = parseFloat(size);
    if (!isFinite(parsed)) return;
    const clamped = Math.min(200, Math.max(1, parsed));
    const isSelectionEmpty = editor.state.selection.empty;

    if (!isSelectionEmpty) {
      // Apply font size strictly to the selected text
      editor.chain().focus().setFontSize(`${clamped}pt`).run();
    } else {
      // No text selected: update document active size so newly typed text uses this size!
      editor.chain().focus().setFontSize(`${clamped}pt`).run();
      if (documentSettings && onDocumentSettingsChange) {
        onDocumentSettingsChange({
          ...documentSettings,
          defaultFontSize: clamped,
        });
      }
    }
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Tooltip>
        <TooltipTrigger asChild>
          <PopoverTrigger asChild>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              className={cn(
                "h-8 px-2 inline-flex items-center gap-1 rounded-lg text-xs transition-all duration-150 cursor-pointer focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none min-w-[54px]",
                open
                  ? "bg-primary text-primary-foreground shadow-sm font-semibold"
                  : "text-muted-foreground hover:text-foreground hover:bg-foreground/10"
              )}
            >
              <span className="text-[11px] font-mono font-semibold tabular-nums">{displaySize}</span>
              <span className="text-[9px] text-muted-foreground">pt</span>
              <ChevronDown className="h-3 w-3 shrink-0 opacity-60 ml-0.5" />
            </button>
          </PopoverTrigger>
        </TooltipTrigger>
        <TooltipContent side="top" className="text-xs py-1 px-2.5 shadow-lg border border-border/60">
          <span>Ukuran Font (Poin Word)</span>
        </TooltipContent>
      </Tooltip>
      <PopoverContent
        align="start"
        sideOffset={8}
        className="p-2 rounded-2xl bg-popover border border-border shadow-2xl z-[100] w-[145px] max-h-[320px] overflow-y-auto scrollbar-none"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-2 py-1">
          Ukuran (pt)
        </div>
        {/* Custom size input */}
        <div className="px-1.5 py-1 mb-1">
          <input
            type="text"
            placeholder="Ketik ukuran..."
            value={customSize}
            onChange={(e) => setCustomSize(e.target.value.replace(/[^0-9.]/g, ""))}
            onKeyDown={(e) => {
              if (e.key === "Enter" && customSize) {
                e.preventDefault();
                handleSetSize(customSize);
                setCustomSize("");
              }
            }}
            className="w-full px-2 py-1 text-xs font-mono rounded-md bg-background border border-border focus:outline-none focus:ring-1 focus:ring-primary text-center"
          />
        </div>
        {FONT_SIZE_PRESETS.map((size) => {
          const isSelected = displaySize === size;
          return (
            <button
              key={size}
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleSetSize(size);
              }}
              className={cn(
                "w-full text-center px-2.5 py-1 rounded-lg text-sm font-mono transition-colors cursor-pointer flex items-center justify-between",
                isSelected
                  ? "bg-primary/10 text-primary font-bold"
                  : "hover:bg-foreground/5 text-foreground"
              )}
            >
              <span>{size} pt</span>
              {isSelected && <Check className="h-3 w-3 text-primary" />}
            </button>
          );
        })}
        {currentSizeRaw && (
          <div className="mt-1 pt-1 border-t border-border/50">
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                editor.chain().focus().unsetFontSize().run();
                setOpen(false);
              }}
              className="w-full text-center px-2.5 py-1 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-foreground/5 cursor-pointer flex items-center justify-center gap-1"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Reset</span>
            </button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}

// ─── Line Spacing Selector (Word Parity) ────────────────────

function LineSpacingSelector({ editor }: { editor: Editor }) {
  const [open, setOpen] = useState(false);

  const currentLineHeight =
    editor?.getAttributes("paragraph")?.lineHeight ||
    editor?.getAttributes("heading")?.lineHeight ||
    null;
  const display = currentLineHeight ? `${parseFloat(currentLineHeight)}×` : "1.75×";

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Tooltip>
        <TooltipTrigger asChild>
          <PopoverTrigger asChild>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              className={cn(
                "h-8 px-2 inline-flex items-center gap-1 rounded-lg text-xs transition-all duration-150 cursor-pointer focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none min-w-[58px]",
                open
                  ? "bg-primary text-primary-foreground shadow-sm font-semibold"
                  : "text-muted-foreground hover:text-foreground hover:bg-foreground/10"
              )}
            >
              <span className="text-[11px] font-mono font-semibold tabular-nums">{display}</span>
              <ChevronDown className="h-3 w-3 shrink-0 opacity-60 ml-0.5" />
            </button>
          </PopoverTrigger>
        </TooltipTrigger>
        <TooltipContent side="top" className="text-xs py-1 px-2.5 shadow-lg border border-border/60">
          <span>Spasi Baris</span>
        </TooltipContent>
      </Tooltip>
      <PopoverContent
        align="start"
        sideOffset={8}
        className="p-2 rounded-2xl bg-popover border border-border shadow-2xl z-[100] w-[190px]"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-2 py-1">
          Spasi Baris
        </div>
        {LINE_HEIGHT_PRESETS.map((p) => {
          const isSelected =
            !!currentLineHeight && parseFloat(currentLineHeight) === parseFloat(p.value);
          return (
            <button
              key={p.value}
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
                editor.chain().focus().setLineHeight(p.value).run();
                setOpen(false);
              }}
              className={cn(
                "w-full text-left px-2.5 py-1.5 rounded-lg text-sm transition-colors cursor-pointer flex items-center justify-between",
                isSelected
                  ? "bg-primary/10 text-primary font-semibold"
                  : "hover:bg-foreground/5 text-foreground"
              )}
            >
              <span>{p.label}</span>
              {isSelected && <Check className="h-3.5 w-3.5 text-primary shrink-0" />}
            </button>
          );
        })}
        {currentLineHeight && (
          <div className="mt-1 pt-1 border-t border-border/50">
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                editor.chain().focus().unsetLineHeight().run();
                setOpen(false);
              }}
              className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-foreground/5 cursor-pointer flex items-center gap-1.5"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Reset ke Default</span>
            </button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}

// ─── Image Picker Component (Upload & URL) ──────────────────

function ImagePicker({ editor }: { editor: Editor }) {
  const { t, locale } = useTranslation();
  const [open, setOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInsertUrl = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = imageUrl.trim();
    if (trimmed) {
      (editor.chain().focus() as any).setImage({ src: trimmed }).run();
      setImageUrl("");
      setOpen(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.warning(t("editor.imageTooLarge"), locale === "en" ? "Image Format" : "Format Gambar");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      if (result) {
        (editor.chain().focus() as any).setImage({ src: result, alt: file.name }).run();
        setOpen(false);
      }
    };
    reader.readAsDataURL(file);

    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Tooltip>
        <TooltipTrigger asChild>
          <PopoverTrigger asChild>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              className={cn(
                "h-8 w-8 inline-flex items-center justify-center rounded-lg text-sm transition-all duration-150 cursor-pointer focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none",
                open
                  ? "bg-primary text-primary-foreground shadow-sm font-semibold"
                  : "text-muted-foreground hover:text-foreground hover:bg-foreground/10"
              )}
              aria-label={t("editor.insertImage")}
            >
              <ImageIcon className="h-4 w-4" />
            </button>
          </PopoverTrigger>
        </TooltipTrigger>
        <TooltipContent side="top" className="text-xs py-1 px-2.5 shadow-lg border border-border/60">
          <span>{t("editor.insertImage")}</span>
        </TooltipContent>
      </Tooltip>
      <PopoverContent
        align="start"
        sideOffset={8}
        className="p-4 rounded-2xl bg-popover border border-border shadow-2xl z-[100] w-80"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <div className="text-xs font-semibold text-foreground pb-2 mb-3 border-b border-border/60 flex items-center gap-1.5">
          <ImageIcon className="h-3.5 w-3.5 text-primary" />
          <span>{t("editor.insertImage")}</span>
        </div>

        <div className="space-y-3">
          {/* Upload Button */}
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-primary/10 hover:bg-primary/20 text-primary text-xs font-semibold rounded-xl border border-primary/30 transition-colors cursor-pointer"
            >
              <Upload className="h-4 w-4" />
              <span>{locale === "en" ? "Choose Image from Device" : "Pilih Gambar dari Perangkat"}</span>
            </button>
            <p className="text-[10px] text-muted-foreground mt-1 text-center">
              {locale === "en" ? "Supports PNG, JPG, WebP, GIF (Max. 5MB)" : "Mendukung PNG, JPG, WebP, GIF (Maks. 5MB)"}
            </p>
          </div>

          <div className="relative flex items-center justify-center my-2">
            <div className="border-t border-border/60 w-full" />
            <span className="bg-popover px-2 text-[10px] text-muted-foreground uppercase absolute font-medium">
              {locale === "en" ? "Or Image URL" : "Atau Tautan"}
            </span>
          </div>

          {/* URL Form */}
          <form onSubmit={handleInsertUrl} className="space-y-2">
            <input
              type="url"
              placeholder={locale === "en" ? "https://example.com/image.jpg" : "https://contoh.com/gambar.jpg"}
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl bg-background border border-border focus:outline-none focus:ring-1 focus:ring-primary font-mono"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
              >
                {t("common.cancel")}
              </button>
              <button
                type="submit"
                disabled={!imageUrl.trim()}
                className="px-3.5 py-1.5 text-xs bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 disabled:opacity-40 transition-colors cursor-pointer"
              >
                {locale === "en" ? "Insert" : "Sisipkan"}
              </button>
            </div>
          </form>
        </div>
      </PopoverContent>
    </Popover>
  );
}

// ─── Comprehensive Text Color Palette ───────────────────────

const TEXT_COLOR_GROUPS = [
  {
    label: "Netral & Monokrom",
    colors: [
      { name: "Default (Teks Normal)", color: "" },
      { name: "Hitam", color: "#000000" },
      { name: "Slate Gelap", color: "#1e293b" },
      { name: "Abu-abu Tua", color: "#475569" },
      { name: "Abu-abu", color: "#64748b" },
      { name: "Abu Terang", color: "#94a3b8" },
      { name: "Putih", color: "#ffffff" },
    ],
  },
  {
    label: "Nuansa Hangat",
    colors: [
      { name: "Merah Marun", color: "#991b1b" },
      { name: "Merah", color: "#ef4444" },
      { name: "Rose / Merah Muda", color: "#f43f5e" },
      { name: "Oranye Gelap", color: "#c2410c" },
      { name: "Oranye Cerah", color: "#f97316" },
      { name: "Amber", color: "#f59e0b" },
      { name: "Kuning Emas", color: "#eab308" },
      { name: "Cokelat", color: "#78350f" },
    ],
  },
  {
    label: "Nuansa Hijau & Cyan",
    colors: [
      { name: "Hijau Hutan", color: "#166534" },
      { name: "Hijau Zamrud", color: "#10b981" },
      { name: "Hijau Segar", color: "#22c55e" },
      { name: "Lime", color: "#84cc16" },
      { name: "Teal", color: "#14b8a6" },
      { name: "Cyan", color: "#06b6d4" },
      { name: "Biru Langit", color: "#38bdf8" },
    ],
  },
  {
    label: "Nuansa Biru & Ungu",
    colors: [
      { name: "Biru Navy", color: "#1e40af" },
      { name: "Biru Royal", color: "#3b82f6" },
      { name: "Indigo", color: "#6366f1" },
      { name: "Ungu", color: "#8b5cf6" },
      { name: "Violet", color: "#7c3aed" },
      { name: "Magenta", color: "#d946ef" },
      { name: "Pink", color: "#ec4899" },
    ],
  },
];

function ColorPicker({ editor }: { editor: Editor }) {
  const [open, setOpen] = useState(false);
  const [customHex, setCustomHex] = useState("");

  const currentColor = editor?.getAttributes("textStyle")?.color;

  const handleApplyColor = (colorHex: string) => {
    if (colorHex) {
      editor.chain().focus().setColor(colorHex).run();
    } else {
      editor.chain().focus().unsetColor().run();
    }
    setOpen(false);
  };

  const handleApplyCustomColor = (colorValue: string) => {
    const trimmed = colorValue.trim();
    if (!trimmed) {
      editor.chain().focus().unsetColor().run();
      setOpen(false);
      return;
    }
    const validHex = trimmed.startsWith("#") ? trimmed : `#${trimmed}`;
    editor.chain().focus().setColor(validHex).run();
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Tooltip>
        <TooltipTrigger asChild>
          <PopoverTrigger asChild>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              className={cn(
                "h-8 w-8 inline-flex items-center justify-center rounded-lg text-sm transition-all duration-150 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none",
                !!currentColor || open
                  ? "bg-primary text-primary-foreground shadow-sm font-semibold"
                  : "text-muted-foreground hover:text-foreground hover:bg-foreground/10"
              )}
              aria-label={currentColor ? `Warna Teks (${currentColor})` : "Warna Teks"}
            >
              <div className="relative flex items-center justify-center">
                <Palette className="h-4 w-4" />
                <div
                  className="absolute -bottom-1 left-0.5 right-0.5 h-1 rounded-full border border-black/20 dark:border-white/20 transition-colors"
                  style={{ backgroundColor: currentColor || "transparent" }}
                />
              </div>
            </button>
          </PopoverTrigger>
        </TooltipTrigger>
        <TooltipContent side="top" className="text-xs py-1 px-2.5 shadow-lg border border-border/60">
          <span>{currentColor ? `Warna Teks (${currentColor})` : "Warna Teks"}</span>
        </TooltipContent>
      </Tooltip>
      <PopoverContent
        align="start"
        sideOffset={8}
        className="p-4 rounded-2xl bg-popover border border-border shadow-2xl z-[100] w-[310px]"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <div className="text-xs font-semibold text-foreground pb-2 mb-2.5 border-b border-border/60 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Palette className="h-3.5 w-3.5 text-primary" />
            <span>Pilih Warna Teks</span>
          </span>
          {currentColor && (
            <span className="text-[10px] uppercase font-mono bg-primary/10 text-primary px-1.5 py-0.5 rounded font-bold">
              {currentColor}
            </span>
          )}
        </div>

        <div className="space-y-3.5 max-h-[290px] overflow-y-auto px-1.5 py-1 scrollbar-none">
          {TEXT_COLOR_GROUPS.map((group) => (
            <div key={group.label} className="space-y-1.5">
              <div className="text-[10px] font-semibold text-muted-foreground tracking-wider uppercase">
                {group.label}
              </div>
              <div className="grid grid-cols-7 gap-1.5">
                {group.colors.map((c) => {
                  const isSelected =
                    (!c.color && !currentColor) ||
                    (c.color && currentColor?.toLowerCase() === c.color.toLowerCase());
                  return (
                    <button
                      key={c.name}
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleApplyColor(c.color);
                      }}
                      className={cn(
                        "w-7 h-7 rounded-lg border transition-all duration-150 hover:scale-110 cursor-pointer flex items-center justify-center text-xs font-bold relative shadow-xs",
                        isSelected
                          ? "border-primary ring-2 ring-primary/40 ring-offset-1 ring-offset-background scale-105 shadow-md"
                          : "border-border/60 hover:border-foreground/40",
                        !c.color && "bg-background border-dashed"
                      )}
                      style={{ backgroundColor: c.color || undefined }}
                      title={c.name}
                      aria-label={c.name}
                    >
                      {!c.color && (
                        <span className="text-foreground text-[10px] font-extrabold">A</span>
                      )}
                      {isSelected && c.color && (
                        <Check
                          className={cn(
                            "h-3 w-3",
                            c.color === "#ffffff" || c.color === "#eab308" || c.color === "#fef08a"
                              ? "text-black"
                              : "text-white"
                          )}
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Custom Color Input Section */}
        <div className="mt-3 pt-2.5 border-t border-border/60 flex items-center gap-2">
          <div className="relative flex items-center">
            <input
              type="color"
              value={currentColor || "#3b82f6"}
              onChange={(e) => {
                setCustomHex(e.target.value);
                editor.chain().focus().setColor(e.target.value).run();
              }}
              className="w-7 h-7 rounded-lg cursor-pointer border border-border p-0 bg-transparent overflow-hidden"
              title="Pilih warna bebas via Color Picker"
            />
          </div>
          <input
            type="text"
            placeholder="#HEX..."
            value={customHex}
            onChange={(e) => setCustomHex(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleApplyCustomColor(customHex);
              }
            }}
            className="flex-1 px-2 py-1 text-[11px] font-mono rounded-md bg-background border border-border focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleApplyCustomColor(customHex);
            }}
            className="px-2 py-1 text-[11px] font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90 cursor-pointer"
          >
            Terapkan
          </button>
        </div>

        {/* Reset Color Button */}
        {currentColor && (
          <div className="mt-2 pt-2 border-t border-border/50">
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleApplyColor("");
              }}
              className="w-full flex items-center justify-center gap-1.5 text-center text-xs text-muted-foreground hover:text-foreground py-1 rounded-lg hover:bg-muted transition-colors cursor-pointer"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Reset ke Warna Default</span>
            </button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}

// Curated highlight colors
const HIGHLIGHT_COLORS = [
  { name: "Kuning Lemon", color: "#fef08a", border: "#facc15" },
  { name: "Hijau Mint", color: "#bbf7d0", border: "#4ade80" },
  { name: "Cyan Langit", color: "#a5f3fc", border: "#22d3ee" },
  { name: "Biru Pastel", color: "#bae6fd", border: "#38bdf8" },
  { name: "Ungu Lavender", color: "#ddd6fe", border: "#a78bfa" },
  { name: "Pink Rose", color: "#fbcfe8", border: "#f472b6" },
  { name: "Oranye Peach", color: "#fed7aa", border: "#fb923c" },
  { name: "Merah Lembut", color: "#fecdd3", border: "#fb7185" },
];

function HighlightPicker({ editor }: { editor: Editor }) {
  const { locale } = useTranslation();
  const [open, setOpen] = useState(false);

  const currentHighlight = editor?.getAttributes("highlight")?.color;
  const isHighlightActive = editor?.isActive("highlight");

  const handleApplyHighlight = (colorHex: string) => {
    if (colorHex) {
      editor.chain().focus().setHighlight({ color: colorHex }).run();
    } else {
      editor.chain().focus().unsetHighlight().run();
    }
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Tooltip>
        <TooltipTrigger asChild>
          <PopoverTrigger asChild>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              className={cn(
                "h-8 w-8 inline-flex items-center justify-center rounded-lg text-sm transition-all duration-150 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none",
                isHighlightActive || open
                  ? "bg-primary text-primary-foreground shadow-sm font-semibold"
                  : "text-muted-foreground hover:text-foreground hover:bg-foreground/10"
              )}
              aria-label={
                isHighlightActive
                  ? (locale === "en" ? `Active Highlight (${currentHighlight || "Yellow"})` : `Sorotan Aktif (${currentHighlight || "Kuning"})`)
                  : (locale === "en" ? "Highlight Color" : "Warna Sorotan (Highlight)")
              }
            >
              <div className="relative flex items-center justify-center">
                <Highlighter className="h-4 w-4" />
                {isHighlightActive && (
                  <div
                    className="absolute -bottom-1 left-0.5 right-0.5 h-1 rounded-full border border-black/20 dark:border-white/20"
                    style={{ backgroundColor: currentHighlight || "#fef08a" }}
                  />
                )}
              </div>
            </button>
          </PopoverTrigger>
        </TooltipTrigger>
        <TooltipContent side="top" className="text-xs py-1 px-2.5 shadow-lg border border-border/60">
          <span>
            {isHighlightActive
              ? (locale === "en" ? `Active Highlight (${currentHighlight || "Yellow"})` : `Sorotan Aktif (${currentHighlight || "Kuning"})`)
              : (locale === "en" ? "Highlight Color" : "Warna Sorotan (Highlight)")}
          </span>
        </TooltipContent>
      </Tooltip>
      <PopoverContent
        align="start"
        sideOffset={8}
        className="p-4 rounded-2xl bg-popover border border-border shadow-2xl z-[100] w-auto min-w-[240px]"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <div className="text-xs font-semibold text-foreground pb-2 mb-2.5 border-b border-border/50 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Highlighter className="h-3.5 w-3.5 text-yellow-500" />
            <span>{locale === "en" ? "Highlight Color" : "Warna Sorotan"}</span>
          </span>
        </div>

        <div className="grid grid-cols-4 gap-2.5 p-1">
          {HIGHLIGHT_COLORS.map((h) => {
            const isSelected =
              isHighlightActive &&
              currentHighlight?.toLowerCase() === h.color.toLowerCase();
            return (
              <button
                key={h.name}
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleApplyHighlight(h.color);
                }}
                className={cn(
                  "w-8 h-8 rounded-xl border-2 transition-all duration-150 hover:scale-110 cursor-pointer flex items-center justify-center relative shadow-xs",
                  isSelected
                    ? "border-primary ring-2 ring-primary/40 ring-offset-1 ring-offset-background scale-105"
                    : "border-border/60 hover:border-foreground/40"
                )}
                style={{ backgroundColor: h.color }}
                title={h.name}
                aria-label={h.name}
              >
                {isSelected && <Check className="h-3.5 w-3.5 text-black" />}
              </button>
            );
          })}
        </div>

        {isHighlightActive && (
          <div className="mt-2.5 pt-2 border-t border-border/50">
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleApplyHighlight("");
              }}
              className="w-full flex items-center justify-center gap-1.5 text-center text-xs text-destructive hover:text-destructive/80 py-1 rounded-lg hover:bg-destructive/10 transition-colors cursor-pointer font-medium"
            >
              <Trash2 className="h-3 w-3" />
              <span>{locale === "en" ? "Remove Highlight" : "Hapus Sorotan"}</span>
            </button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}

function TablePicker({ editor }: { editor: Editor }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [hoveredRows, setHoveredRows] = useState(3);
  const [hoveredCols, setHoveredCols] = useState(3);

  const MAX_ROWS = 8;
  const MAX_COLS = 8;

  const handleSelectTable = (rows: number, cols: number) => {
    try {
      editor
        .chain()
        .focus()
        .insertTable({ rows, cols, withHeaderRow: true })
        .run();
    } catch (err) {
      console.error("Gagal menyisipkan tabel:", err);
    }
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Tooltip>
        <TooltipTrigger asChild>
          <PopoverTrigger asChild>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              className={cn(
                "h-8 w-8 inline-flex items-center justify-center rounded-lg text-sm transition-all duration-150 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none",
                editor?.isActive("table") || open
                  ? "bg-primary text-primary-foreground shadow-sm font-semibold"
                  : "text-muted-foreground hover:text-foreground hover:bg-foreground/10"
              )}
              aria-label={t("editor.insertTable")}
            >
              <TableIcon className="h-4 w-4" />
            </button>
          </PopoverTrigger>
        </TooltipTrigger>
        <TooltipContent side="top" className="text-xs py-1 px-2.5 shadow-lg border border-border/60">
          <span>{t("editor.insertTable")}</span>
        </TooltipContent>
      </Tooltip>
      <PopoverContent
        align="start"
        sideOffset={8}
        className="p-4 rounded-2xl bg-popover border border-border shadow-2xl z-[100] w-auto min-w-[250px]"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <div className="text-xs font-semibold text-foreground mb-2.5 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <TableIcon className="h-3.5 w-3.5 text-primary" />
            <span>{t("editor.insertTable")}</span>
          </span>
          <span className="text-primary font-mono text-[11px] bg-primary/10 px-2 py-0.5 rounded-md font-bold">
            {hoveredRows} × {hoveredCols}
          </span>
        </div>

        <div
          className="grid gap-1.5 p-2 bg-background/60 rounded-xl border border-border/60 justify-center"
          style={{
            gridTemplateColumns: `repeat(${MAX_COLS}, minmax(0, 1fr))`,
          }}
          onMouseLeave={() => {
            setHoveredRows(1);
            setHoveredCols(1);
          }}
        >
          {Array.from({ length: MAX_ROWS }).map((_, rIdx) => {
            const rowNum = rIdx + 1;
            return Array.from({ length: MAX_COLS }).map((_, cIdx) => {
              const colNum = cIdx + 1;
              const isSelected = rowNum <= hoveredRows && colNum <= hoveredCols;
              return (
                <button
                  key={`${rowNum}-${colNum}`}
                  type="button"
                  onMouseEnter={() => {
                    setHoveredRows(rowNum);
                    setHoveredCols(colNum);
                  }}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleSelectTable(rowNum, colNum);
                  }}
                  className={cn(
                    "w-5 h-5 rounded-[4px] border transition-colors cursor-pointer",
                    isSelected
                      ? "bg-primary border-primary shadow-xs"
                      : "bg-muted/40 border-border/60 hover:border-primary/50"
                  )}
                  aria-label={`Tabel ${rowNum} baris ${colNum} kolom`}
                />
              );
            });
          })}
        </div>

        <div className="mt-3 pt-2.5 border-t border-border/50">
          <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
            Ukuran Cepat:
          </div>
          <div className="grid grid-cols-4 gap-1.5">
            {[
              { r: 2, c: 2, l: "2 × 2" },
              { r: 3, c: 3, l: "3 × 3" },
              { r: 4, c: 4, l: "4 × 4" },
              { r: 5, c: 5, l: "5 × 5" },
            ].map((p) => (
              <button
                key={p.l}
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleSelectTable(p.r, p.c);
                }}
                className="px-1.5 py-1 text-[11px] font-medium bg-muted/80 hover:bg-primary hover:text-primary-foreground rounded-lg transition-colors cursor-pointer text-center font-mono"
              >
                {p.l}
              </button>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function TableContextActions({ editor }: { editor: Editor }) {
  const { locale } = useTranslation();
  const isInTable = editor?.isActive("table");
  if (!isInTable) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          className="h-8 px-2.5 inline-flex items-center gap-1.5 rounded-lg text-xs font-semibold bg-primary/10 text-primary hover:bg-primary/20 transition-colors cursor-pointer border border-primary/20 shadow-xs"
        >
          <TableProperties className="h-3.5 w-3.5" />
          <span>{locale === "en" ? "Manage Table" : "Kelola Tabel"}</span>
          <ChevronDown className="h-3 w-3 opacity-70" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56 bg-popover border border-border shadow-2xl z-[100]">
        <DropdownMenuLabel className="text-xs text-muted-foreground font-medium">{locale === "en" ? "Row Options" : "Opsi Baris"}</DropdownMenuLabel>
        <DropdownMenuItem
          onSelect={() => editor.chain().focus().addRowBefore().run()}
          className="cursor-pointer text-xs"
        >
          <Plus className="w-3.5 h-3.5 mr-2 text-primary" />
          <span>{locale === "en" ? "Insert Row Above" : "Sisipkan Baris di Atas"}</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onSelect={() => editor.chain().focus().addRowAfter().run()}
          className="cursor-pointer text-xs"
        >
          <Plus className="w-3.5 h-3.5 mr-2 text-primary" />
          <span>{locale === "en" ? "Insert Row Below" : "Sisipkan Baris di Bawah"}</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onSelect={() => editor.chain().focus().deleteRow().run()}
          className="cursor-pointer text-xs text-destructive focus:bg-destructive/10 focus:text-destructive"
        >
          <Trash2 className="w-3.5 h-3.5 mr-2" />
          <span>{locale === "en" ? "Delete Row" : "Hapus Baris"}</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuLabel className="text-xs text-muted-foreground font-medium">{locale === "en" ? "Column Options" : "Opsi Kolom"}</DropdownMenuLabel>
        <DropdownMenuItem
          onSelect={() => editor.chain().focus().addColumnBefore().run()}
          className="cursor-pointer text-xs"
        >
          <Plus className="w-3.5 h-3.5 mr-2 text-primary" />
          <span>{locale === "en" ? "Insert Column Left" : "Sisipkan Kolom di Kiri"}</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onSelect={() => editor.chain().focus().addColumnAfter().run()}
          className="cursor-pointer text-xs"
        >
          <Plus className="w-3.5 h-3.5 mr-2 text-primary" />
          <span>{locale === "en" ? "Insert Column Right" : "Sisipkan Kolom di Kanan"}</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onSelect={() => editor.chain().focus().deleteColumn().run()}
          className="cursor-pointer text-xs text-destructive focus:bg-destructive/10 focus:text-destructive"
        >
          <Trash2 className="w-3.5 h-3.5 mr-2" />
          <span>{locale === "en" ? "Delete Column" : "Hapus Kolom"}</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuLabel className="text-xs text-muted-foreground font-medium">{locale === "en" ? "Cell & Header Options" : "Opsi Sel & Header"}</DropdownMenuLabel>
        <DropdownMenuItem
          disabled={!editor.can().mergeCells()}
          onSelect={() => editor.chain().focus().mergeCells().run()}
          className="cursor-pointer text-xs disabled:opacity-40"
        >
          <Combine className="w-3.5 h-3.5 mr-2" />
          <span>{locale === "en" ? "Merge Cells" : "Gabung Sel (Merge)"}</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          disabled={!editor.can().splitCell()}
          onSelect={() => editor.chain().focus().splitCell().run()}
          className="cursor-pointer text-xs disabled:opacity-40"
        >
          <Split className="w-3.5 h-3.5 mr-2" />
          <span>{locale === "en" ? "Split Cell" : "Pisah Sel (Split)"}</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onSelect={() => editor.chain().focus().toggleHeaderRow().run()}
          className="cursor-pointer text-xs"
        >
          <Rows className="w-3.5 h-3.5 mr-2 text-muted-foreground" />
          <span>{locale === "en" ? "Toggle Header Row" : "Toggle Baris Header"}</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onSelect={() => editor.chain().focus().toggleHeaderColumn().run()}
          className="cursor-pointer text-xs"
        >
          <Columns className="w-3.5 h-3.5 mr-2 text-muted-foreground" />
          <span>{locale === "en" ? "Toggle Header Column" : "Toggle Kolom Header"}</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onSelect={() => editor.chain().focus().deleteTable().run()}
          className="cursor-pointer text-xs text-destructive font-semibold focus:bg-destructive/10 focus:text-destructive"
        >
          <Trash2 className="w-3.5 h-3.5 mr-2" />
          <span>{locale === "en" ? "Delete Entire Table" : "Hapus Seluruh Tabel"}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function LinkButton({ editor }: { editor: Editor }) {
  const { t, locale } = useTranslation();
  const [open, setOpen] = useState(false);
  const previousUrl = editor?.getAttributes("link")?.href || "";
  const [url, setUrl] = useState(previousUrl);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setUrl(editor?.getAttributes("link")?.href || "");
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open, editor]);

  useEffect(() => {
    function handleOpenLinkDialog() {
      setOpen(true);
    }
    window.addEventListener("tiptap-open-link-dialog", handleOpenLinkDialog);
    return () => window.removeEventListener("tiptap-open-link-dialog", handleOpenLinkDialog);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = url.trim();
    if (trimmed) {
      const finalUrl = trimmed.match(/^https?:\/\//i) ? trimmed : `https://${trimmed}`;
      if (editor.state.selection.empty && !editor.isActive("link")) {
        // Sisip via node schema (bukan string HTML) agar URL dengan karakter
        // khusus seperti tanda kutip tidak merusak markup.
        editor
          .chain()
          .focus()
          .insertContent([
            {
              type: "text",
              text: finalUrl,
              marks: [{ type: "link", attrs: { href: finalUrl } }],
            },
            { type: "text", text: " " },
          ])
          .run();
      } else {
        editor
          .chain()
          .focus()
          .extendMarkRange("link")
          .setLink({ href: finalUrl })
          .run();
      }
    } else {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
    }
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Tooltip>
        <TooltipTrigger asChild>
          <PopoverTrigger asChild>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              className={cn(
                "h-8 w-8 inline-flex items-center justify-center rounded-lg text-sm transition-all duration-150 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none",
                editor.isActive("link") || open
                  ? "bg-primary text-primary-foreground shadow-sm font-semibold"
                  : "text-muted-foreground hover:text-foreground hover:bg-foreground/10"
              )}
              aria-label={t("editor.insertLink")}
            >
              <LinkIcon className="h-4 w-4" />
            </button>
          </PopoverTrigger>
        </TooltipTrigger>
        <TooltipContent side="top" className="text-xs py-1 px-2.5 flex items-center gap-1.5 shadow-lg border border-border/60">
          <span>{t("editor.insertLink")}</span>
          <kbd className="px-1.5 py-0.5 text-[10px] font-mono font-semibold bg-muted/80 text-muted-foreground rounded border border-border/80">
            Ctrl+K
          </kbd>
        </TooltipContent>
      </Tooltip>
      <PopoverContent
        align="start"
        sideOffset={8}
        className="p-3.5 rounded-2xl bg-popover border border-border shadow-2xl z-[100] w-80"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="text-xs font-semibold text-foreground flex items-center gap-1.5">
            <LinkIcon className="h-3.5 w-3.5 text-primary" />
            <span>{editor.isActive("link") ? (locale === "en" ? "Edit Link" : "Edit Tautan Link") : (locale === "en" ? "Insert Link" : "Sisipkan Tautan Link")}</span>
          </div>
          <input
            ref={inputRef}
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder={locale === "en" ? "https://example.com" : "https://contoh.com"}
            className="w-full px-3 py-2 text-xs rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all text-foreground font-mono"
          />
          <div className="flex items-center gap-2 justify-end pt-1">
            {editor.isActive("link") && (
              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  editor.chain().focus().extendMarkRange("link").unsetLink().run();
                  setOpen(false);
                }}
                className="text-xs text-destructive hover:text-destructive/80 font-medium cursor-pointer px-2 py-1 mr-auto"
              >
                {locale === "en" ? "Remove Link" : "Hapus Link"}
              </button>
            )}
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                setOpen(false);
                editor.chain().focus().run();
              }}
              className="text-xs text-muted-foreground hover:text-foreground cursor-pointer px-2.5 py-1.5 rounded-lg font-medium"
            >
              {t("common.cancel")}
            </button>
            <button
              type="submit"
              className="text-xs bg-primary text-primary-foreground px-3.5 py-1.5 rounded-lg font-medium cursor-pointer hover:bg-primary/90 transition-colors shadow-sm"
            >
              {t("common.save")}
            </button>
          </div>
        </form>
      </PopoverContent>
    </Popover>
  );
}

// ─── Document Settings Panel (Pengaturan Berkas) ───────────

function DocumentSettingsPanel({
  settings,
  onSettingsChange,
}: {
  settings: DocumentSettings;
  onSettingsChange: (settings: DocumentSettings) => void;
}) {
  const [open, setOpen] = useState(false);

  const updateSetting = <K extends keyof DocumentSettings>(
    key: K,
    value: DocumentSettings[K]
  ) => {
    onSettingsChange({ ...settings, [key]: value });
  };

  const updateMargin = (key: keyof MarginValues, value: number) => {
    onSettingsChange({
      ...settings,
      margins: { ...settings.margins, [key]: value },
    });
  };

  const updateMarginPreset = (preset: MarginPreset) => {
    onSettingsChange({
      ...settings,
      margins: { ...preset.values },
    });
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Tooltip>
        <TooltipTrigger asChild>
          <PopoverTrigger asChild>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              className={cn(
                "h-8 w-8 inline-flex items-center justify-center rounded-lg text-sm transition-all duration-150 cursor-pointer focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none",
                open
                  ? "bg-primary text-primary-foreground shadow-sm font-semibold"
                  : "text-muted-foreground hover:text-foreground hover:bg-foreground/10"
              )}
              aria-label="Pengaturan Dokumen"
            >
              <Settings2 className="h-4 w-4" />
            </button>
          </PopoverTrigger>
        </TooltipTrigger>
        <TooltipContent side="top" className="text-xs py-1 px-2.5 shadow-lg border border-border/60">
          <span>Pengaturan Dokumen (Layout Kertas)</span>
        </TooltipContent>
      </Tooltip>
      <PopoverContent
        align="end"
        sideOffset={8}
        className="p-4 rounded-2xl bg-popover border border-border shadow-2xl z-[100] w-[320px] max-h-[85vh] overflow-y-auto scrollbar-none"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <div className="text-xs font-semibold text-foreground pb-2 mb-3 border-b border-border/60 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Settings2 className="h-3.5 w-3.5 text-primary" />
            <span>Pengaturan Dokumen</span>
          </span>
          <span className="text-[10px] font-mono bg-primary/10 text-primary px-1.5 py-0.5 rounded font-bold">
            {settings.pageSize} • {settings.orientation === "landscape" ? "Landscape" : "Portrait"}
          </span>
        </div>

        <div className="space-y-3.5">
          {/* Page Size */}
          <div>
            <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">
              Ukuran Kertas
            </label>
            <select
              value={settings.pageSize}
              onChange={(e) => updateSetting("pageSize", e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-background border border-border focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer font-medium"
            >
              {PAPER_SIZES.map((p) => (
                <option key={p.name} value={p.name}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>

          {/* Orientation */}
          <div>
            <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">
              Orientasi
            </label>
            <div className="flex gap-2">
              {(["portrait", "landscape"] as Orientation[]).map((o) => (
                <button
                  key={o}
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => updateSetting("orientation", o)}
                  className={cn(
                    "flex-1 px-3 py-1.5 text-xs font-medium rounded-lg border transition-all cursor-pointer capitalize",
                    settings.orientation === o
                      ? "bg-primary text-primary-foreground border-primary shadow-sm font-bold"
                      : "bg-background border-border hover:bg-foreground/5 text-foreground"
                  )}
                >
                  {o === "portrait" ? "Portrait" : "Landscape"}
                </button>
              ))}
            </div>
          </div>

          {/* Margin Preset */}
          <div>
            <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">
              Margin
            </label>
            <select
              value={
                MARGIN_PRESETS.find(
                  (m) =>
                    m.values.top === settings.margins.top &&
                    m.values.bottom === settings.margins.bottom &&
                    m.values.left === settings.margins.left &&
                    m.values.right === settings.margins.right
                )?.name || "Custom"
              }
              onChange={(e) => {
                const preset = MARGIN_PRESETS.find(
                  (m) => m.name === e.target.value
                );
                if (preset) {
                  updateMarginPreset(preset);
                }
              }}
              className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-background border border-border focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer font-medium"
            >
              {MARGIN_PRESETS.map((m) => (
                <option key={m.name} value={m.name}>
                  {m.label}
                </option>
              ))}
              {!MARGIN_PRESETS.find(
                (m) =>
                  m.values.top === settings.margins.top &&
                  m.values.bottom === settings.margins.bottom &&
                  m.values.left === settings.margins.left &&
                  m.values.right === settings.margins.right
              ) && <option value="Custom">Custom</option>}
            </select>

            {/* Custom margin inputs */}
            <div className="grid grid-cols-2 gap-2 mt-2">
              {(
                [
                  ["top", "Atas"],
                  ["bottom", "Bawah"],
                  ["left", "Kiri"],
                  ["right", "Kanan"],
                ] as const
              ).map(([key, label]) => (
                <div key={key} className="flex items-center gap-1">
                  <label className="text-[10px] text-muted-foreground w-10 shrink-0">
                    {label}
                  </label>
                  <input
                    type="number"
                    step="1"
                    min="0"
                    value={Math.round(settings.margins[key] * 10) / 10}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value) || 0;
                      updateMargin(key, val);
                    }}
                    className="w-full px-1.5 py-1 text-[11px] font-mono rounded-md bg-background border border-border focus:outline-none focus:ring-1 focus:ring-primary text-center"
                  />
                </div>
              ))}
            </div>
            <div className="text-[10px] text-muted-foreground mt-1">
              Satuan: milimeter (mm)
            </div>
          </div>

          {/* Default Font */}
          <div>
            <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">
              Font Default Dokumen
            </label>
            <select
              value={settings.defaultFont}
              onChange={(e) => updateSetting("defaultFont", e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-background border border-border focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer font-medium"
            >
              {FONT_FAMILIES.map((f) => (
                <option key={f.name} value={f.name}>
                  {f.name}
                </option>
              ))}
            </select>
          </div>

          {/* Default Font Size */}
          <div>
            <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">
              Ukuran Font Default
            </label>
            <select
              value={settings.defaultFontSize}
              onChange={(e) =>
                updateSetting("defaultFontSize", parseInt(e.target.value) || 12)
              }
              className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-background border border-border focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer font-medium"
            >
              {FONT_SIZE_PRESETS.map((s) => (
                <option key={s} value={s}>
                  {s} pt
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Page dimensions info */}
        <div className="mt-3 pt-2 border-t border-border/50 text-[10px] text-muted-foreground">
          {(() => {
            const dims = getEffectivePageDimensions(settings);
            return (
              <span>
                Halaman: {Math.round(dims.pageWidthMm)}×
                {Math.round(dims.pageHeightMm)} mm | Area konten:{" "}
                {Math.round(dims.contentWidthMm)}×
                {Math.round(dims.bodyHeightMm)} mm
              </span>
            );
          })()}
        </div>

        {/* Real-time Status Indicator */}
        <div className="mt-3 pt-2.5 border-t border-border/60 flex items-center justify-between gap-2">
          <span className="text-[10px] text-emerald-500 font-medium flex items-center gap-1">
            <Check className="h-3 w-3" />
            <span>Perubahan langsung diterapkan</span>
          </span>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="px-3 py-1 text-xs font-semibold bg-foreground/10 hover:bg-foreground/15 text-foreground rounded-lg transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

// ─── Export Menu ─────────────────────────────────────────────

function ExportMenu({
  editor,
  settings,
  noteTitle,
}: {
  editor: Editor;
  settings: DocumentSettings;
  noteTitle: string;
}) {
  const { t, locale } = useTranslation();
  const [isExporting, setIsExporting] = useState(false);
  const [exportType, setExportType] = useState<"pdf" | "docx" | null>(null);

  const handleExportPdf = async () => {
    setIsExporting(true);
    setExportType("pdf");
    try {
      const { exportToPdf } = await import("@/lib/export-pdf");
      const html = editor.getHTML();
      await exportToPdf(html, noteTitle, settings);
      toast.success(t("editor.exportSuccessPdf"), locale === "en" ? "PDF Export Succeeded" : "Ekspor PDF Berhasil");
    } catch (err) {
      console.error("Export PDF gagal:", err);
      toast.error(t("editor.exportErrorPdf"), locale === "en" ? "Export Failed" : "Ekspor Gagal");
    } finally {
      setIsExporting(false);
      setExportType(null);
    }
  };

  const handleExportDocx = async () => {
    setIsExporting(true);
    setExportType("docx");
    try {
      const { exportToDocx } = await import("@/lib/export-docx");
      const html = editor.getHTML();
      await exportToDocx(html, noteTitle, settings);
      toast.success(t("editor.exportSuccessDocx"), locale === "en" ? "Word Export Succeeded" : "Ekspor Word Berhasil");
    } catch (err) {
      console.error("Export DOCX gagal:", err);
      toast.error(t("editor.exportErrorDocx"), locale === "en" ? "Export Failed" : "Ekspor Gagal");
    } finally {
      setIsExporting(false);
      setExportType(null);
    }
  };

  return (
    <DropdownMenu>
      <Tooltip>
        <TooltipTrigger asChild>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              disabled={isExporting}
              onMouseDown={(e) => e.preventDefault()}
              className={cn(
                "h-8 px-2.5 inline-flex items-center gap-1.5 rounded-lg text-xs font-semibold transition-all duration-150 cursor-pointer focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none bg-foreground/5 hover:bg-foreground/10 text-foreground border border-border/60",
                isExporting && "opacity-50 cursor-wait"
              )}
            >
              <FileDown className="h-3.5 w-3.5 text-primary" />
              <span className="hidden sm:inline">
                {isExporting
                  ? (locale === "en" ? `Exporting ${exportType?.toUpperCase()}...` : `Mengekspor ${exportType?.toUpperCase()}...`)
                  : t("editor.exportBtn")}
              </span>
              <ChevronDown className="h-3 w-3 opacity-60" />
            </button>
          </DropdownMenuTrigger>
        </TooltipTrigger>
        <TooltipContent side="top" className="text-xs py-1 px-2.5 shadow-lg border border-border/60">
          <span>{locale === "en" ? "Export Document (PDF & Word)" : "Ekspor Dokumen (PDF & Word)"}</span>
        </TooltipContent>
      </Tooltip>
      <DropdownMenuContent align="end" className="w-56 bg-popover border border-border shadow-2xl z-[100]">
        <DropdownMenuLabel className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
          <FileDown className="h-3.5 w-3.5 text-primary" />
          {locale === "en" ? "Export Document As" : "Ekspor Dokumen Sebagai"}
        </DropdownMenuLabel>
        <DropdownMenuItem
          onSelect={handleExportPdf}
          disabled={isExporting}
          className="cursor-pointer text-xs py-2"
        >
          <FileText className="w-4 h-4 mr-2.5 text-red-500 shrink-0" />
          <div>
            <div className="font-semibold text-foreground">Dokumen PDF (.pdf)</div>
            <div className="text-[10px] text-muted-foreground">
              Layout {settings.pageSize} • {settings.orientation}
            </div>
          </div>
        </DropdownMenuItem>
        <DropdownMenuItem
          onSelect={handleExportDocx}
          disabled={isExporting}
          className="cursor-pointer text-xs py-2"
        >
          <FileType2 className="w-4 h-4 mr-2.5 text-blue-500 shrink-0" />
          <div>
            <div className="font-semibold text-foreground">Microsoft Word (.docx)</div>
            <div className="text-[10px] text-muted-foreground">
              {locale === "en" ? "Tables & native OpenXML formatting" : "Tabel & format native OpenXML"}
            </div>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// ─── Pagination Spacers (lompatan halaman ala Word) ─────────
// Konten yang melewati batas cetak halaman didorong agar dimulai
// tepat di margin-atas halaman berikutnya memakai widget decoration
// (murni visual — tidak mengubah isi dokumen).

export const PAGE_GAP_PX = 36; // tinggi strip pembatas antar lembar (h-9)

const paginationKey = new PluginKey("paginationSpacers");

const paginationSpacersPlugin = new Plugin({
  key: paginationKey,
  state: {
    init: () => DecorationSet.empty,
    apply: (tr, old) => {
      const meta = tr.getMeta(paginationKey);
      if (meta !== undefined) return meta as DecorationSet;
      return tr.docChanged ? DecorationSet.empty : old;
    },
  },
  props: {
    decorations: (state) => paginationKey.getState(state),
  },
});

const paginationSpacersExtension = Extension.create({
  name: "paginationSpacers",
  addProseMirrorPlugins() {
    return [paginationSpacersPlugin];
  },
});

interface PageSpacer {
  pos: number;
  height: number;
}

type FlowUnit =
  | { kind: "text"; el: Text; top: number; bottom: number }
  | { kind: "block"; el: HTMLElement; top: number; bottom: number };

const ATOMIC_BLOCK_SELECTOR =
  "img, hr, div[data-type='page-break'], .tableWrapper";

/**
 * Mengumpulkan unit aliran dokumen (node teks + blok atomik) dalam urutan
 * dokumen. Tinggi spacer lama dikompensasi agar pengukuran bersih.
 */
function collectFlowUnits(
  view: Editor["view"],
  zoomScale: number
): { units: FlowUnit[]; pmRectTop: number } | null {
  const pmEl = view.dom as HTMLElement;
  const pmRect = pmEl.getBoundingClientRect();
  const scale = zoomScale || 1;
  const unscale = (v: number) => v / scale;

  const units: FlowUnit[] = [];
  let spacerComp = 0;

  const walker = document.createTreeWalker(pmEl, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT, {
    acceptNode(node) {
      if (node.nodeType === Node.TEXT_NODE) {
        return (node as Text).data.length > 0
          ? NodeFilter.FILTER_ACCEPT
          : NodeFilter.FILTER_REJECT;
      }
      const el = node as HTMLElement;
      // Spacer lama: kirim ke loop utama untuk dikompensasi (tanpa anak)
      if (el.classList?.contains("pagination-spacer")) {
        return NodeFilter.FILTER_ACCEPT;
      }
      // Blok atomik: jadikan unit, JANGAN telusuri isi dalamnya
      if (el.matches?.(ATOMIC_BLOCK_SELECTOR)) {
        return NodeFilter.FILTER_ACCEPT;
      }
      // Kontainer biasa (p, h1, strong, ...): lewati node-nya, telusuri anak
      return NodeFilter.FILTER_SKIP;
    },
  });

  let current = walker.nextNode();
  while (current) {
    if (current.nodeType === Node.TEXT_NODE) {
      const t = current as Text;
      const range = document.createRange();
      range.selectNodeContents(t);
      const r = range.getBoundingClientRect();
      if (r.height >= 0 && !Number.isNaN(r.top)) {
        units.push({
          kind: "text",
          el: t,
          top: spacerComp + unscale(r.top - pmRect.top),
          bottom: spacerComp + unscale(r.bottom - pmRect.top),
        });
      }
    } else {
      const el = current as HTMLElement;
      if (el.classList?.contains("pagination-spacer")) {
        spacerComp -= el.offsetHeight; // layout px (tidak terpengaruh transform)
        current = walker.nextNode();
        continue;
      }
      if (el.matches(ATOMIC_BLOCK_SELECTOR)) {
        const r = el.getBoundingClientRect();
        units.push({
          kind: "block",
          el,
          top: spacerComp + unscale(r.top - pmRect.top),
          bottom: spacerComp + unscale(r.bottom - pmRect.top),
        });
        current = walker.nextSibling();
        continue;
      }
    }
    current = walker.nextNode();
  }

  return { units, pmRectTop: pmRect.top };
}

/**
 * Binary search: karakter terakhir (offset) pada text node yang seluruh
 * prefiksnya masih berada di atas batas `rawLimit` (ruang tak terskala,
 * relatif PM-top). Return null jika node sepenuhnya muat.
 */
function findTextCutOffset(
  textEl: Text,
  rawLimit: number,
  pmRectTop: number,
  zoomScale: number
): number | null {
  const len = textEl.data.length;
  if (len === 0) return null;
  const unscale = 1 / (zoomScale || 1);

  const bottomOf = (end: number): number => {
    const range = document.createRange();
    range.setStart(textEl, 0);
    range.setEnd(textEl, Math.min(len, Math.max(0, end)));
    const r = range.getBoundingClientRect();
    return (r.bottom - pmRectTop) * unscale;
  };

  if (bottomOf(len) <= rawLimit) return null; // muat seluruhnya

  let lo = 0;
  let hi = len;
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1;
    if (bottomOf(mid) <= rawLimit) lo = mid;
    else hi = mid - 1;
  }

  // Snap ke batas kata agar tidak memotong kata di tengah
  if (lo > 0) {
    const windowStart = Math.max(0, lo - 80);
    const before = textEl.data.slice(windowStart, lo);
    const wsIdx = before.search(/\s(?=\S*$)/); // whitespace terakhir sebelum lo
    if (wsIdx !== -1) lo = windowStart + wsIdx + 1;
  }

  return lo; // bisa 0 -> artinya potong tepat sebelum node ini
}

function posBeforeBlock(view: Editor["view"], el: HTMLElement): number {
  const resolved = view.state.doc.resolve(view.posAtDOM(el, 0));
  return resolved.before(Math.max(1, resolved.depth));
}

function computePageSpacers(
  editor: Editor,
  geo: {
    paperHeightPx: number;
    marginTopPx: number;
    marginBottomPx: number;
    headerHeightPx: number;
    footerHeightPx: number;
    totalPages: number;
    zoomScale: number;
  }
): PageSpacer[] {
  const { view } = editor;
  const {
    paperHeightPx: H,
    marginTopPx: MT,
    marginBottomPx: MB,
    headerHeightPx: HH,
    footerHeightPx: FH,
    totalPages,
    zoomScale,
  } = geo;

  if (totalPages < 2) return [];

  const collected = collectFlowUnits(view, zoomScale);
  if (!collected || collected.units.length === 0) return [];
  const { units, pmRectTop } = collected;

  const spacers: PageSpacer[] = [];
  let shift = 0;
  let idx = 0;

  try {
    for (let page = 0; page < totalPages - 1; page++) {
      // Content body for current page ends at the bottom margin boundary
      const limit = page * (H + PAGE_GAP_PX) + (H - MB);
      // Next page content body starts right at the top margin boundary
      const nextStart = (page + 1) * (H + PAGE_GAP_PX) + MT;

      // Maju melewati semua unit yang masih muat di halaman ini
      while (
        idx < units.length &&
        units[idx].bottom + shift <= limit + 0.5
      ) {
        idx++;
      }
      if (idx >= units.length) break;

      const unit = units[idx];
      let cutPos: number;
      let cutBottom: number;

      if (unit.kind === "text") {
        const cut = findTextCutOffset(unit.el, limit - shift, pmRectTop, zoomScale);
        if (cut !== null && cut > 0) {
          // Baris terakhir yang muat berakhir di `cut` — sisa teks turun halaman
          cutPos = view.posAtDOM(unit.el, cut);
          const range = document.createRange();
          range.setStart(unit.el, 0);
          range.setEnd(unit.el, cut);
          const r = range.getBoundingClientRect();
          cutBottom = (1 / (zoomScale || 1)) * (r.bottom - pmRectTop) + shift;
        } else {
          // Tidak ada karakter yang muat dari node ini: pindahkan mulai node
          cutPos = view.posAtDOM(unit.el, 0);
          cutBottom = unit.top + shift;
        }
      } else {
        // Blok atomik (gambar/tabel/hr/page-break) dipindah utuh
        cutPos = posBeforeBlock(view, unit.el);
        cutBottom = unit.top + shift;
      }

      const height = nextStart - cutBottom;
      if (height > 2) {
        spacers.push({ pos: cutPos, height });
        shift += height;
      }
      // idx sengaja tidak maju: unit yang sama dievaluasi ulang untuk
      // halaman berikutnya (bisa menyeberang beberapa halaman sekaligus).
    }
  } catch {
    // Posisi basi saat dokumen berubah cepat — iterasi berikutnya memperbaiki
    return spacers;
  }

  return spacers;
}

// ─── Main Toolbar ───────────────────────────────────────────

function EditorToolbar({
  editor,
  documentSettings,
  onDocumentSettingsChange,
  noteTitle,
  isPageView,
  onTogglePageView,
}: {
  editor: Editor;
  documentSettings: DocumentSettings;
  onDocumentSettingsChange: (settings: DocumentSettings) => void;
  noteTitle: string;
  isPageView: boolean;
  onTogglePageView: () => void;
}) {
  const [, forceUpdate] = useReducer((x) => x + 1, 0);
  const { t, locale } = useTranslation();

  useEffect(() => {
    if (!editor) return;
    const handleUpdate = () => forceUpdate();
    editor.on("transaction", handleUpdate);
    return () => {
      editor.off("transaction", handleUpdate);
    };
  }, [editor]);

  if (!editor) return null;

  return (
    <div className="flex items-center sm:flex-wrap overflow-x-auto sm:overflow-x-visible scrollbar-none gap-1 p-1.5 bg-card/95 border border-border/80 rounded-2xl mb-4 backdrop-blur-xl shadow-xs max-w-full relative lg:sticky lg:top-[76px] z-10 transition-all">
      {/* History */}
      <MenuButton
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
        icon={<Undo className="h-4 w-4" />}
        label={t("editor.undo")}
        shortcut="Ctrl+Z"
      />
      <MenuButton
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
        icon={<Redo className="h-4 w-4" />}
        label={t("editor.redo")}
        shortcut="Ctrl+Y"
      />

      <ToolbarDivider />

      {/* Font Family & Size */}
      <FontFamilySelector
        editor={editor}
        defaultFont={documentSettings.defaultFont}
        documentSettings={documentSettings}
        onDocumentSettingsChange={onDocumentSettingsChange}
      />
      <FontSizeSelector
        editor={editor}
        defaultFontSize={documentSettings.defaultFontSize}
        documentSettings={documentSettings}
        onDocumentSettingsChange={onDocumentSettingsChange}
      />

      <ToolbarDivider />

      {/* Text Marks */}
      <MenuButton
        onClick={() => editor.chain().focus().toggleBold().run()}
        isActive={editor.isActive("bold")}
        icon={<Bold className="h-4 w-4" />}
        label={t("editor.bold")}
        shortcut="Ctrl+B"
      />
      <MenuButton
        onClick={() => editor.chain().focus().toggleItalic().run()}
        isActive={editor.isActive("italic")}
        icon={<Italic className="h-4 w-4" />}
        label={t("editor.italic")}
        shortcut="Ctrl+I"
      />
      <MenuButton
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        isActive={editor.isActive("underline")}
        icon={<UnderlineIcon className="h-4 w-4" />}
        label={t("editor.underline")}
        shortcut="Ctrl+U"
      />
      <MenuButton
        onClick={() => editor.chain().focus().toggleStrike().run()}
        isActive={editor.isActive("strike")}
        icon={<Strikethrough className="h-4 w-4" />}
        label={t("editor.strikethrough")}
        shortcut="Ctrl+Shift+X"
      />
      <MenuButton
        onClick={() => editor.chain().focus().toggleSuperscript().run()}
        isActive={editor.isActive("superscript")}
        icon={<SuperscriptIcon className="h-4 w-4" />}
        label={t("editor.superscript")}
        shortcut="Ctrl+."
      />
      <MenuButton
        onClick={() => editor.chain().focus().toggleSubscript().run()}
        isActive={editor.isActive("subscript")}
        icon={<SubscriptIcon className="h-4 w-4" />}
        label={t("editor.subscript")}
        shortcut="Ctrl+,"
      />

      {/* Highlight & Text Color */}
      <HighlightPicker editor={editor} />
      <ColorPicker editor={editor} />

      <ToolbarDivider />

      {/* Headings */}
      <MenuButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        isActive={editor.isActive("heading", { level: 1 })}
        icon={<Heading1 className="h-4 w-4" />}
        label={t("editor.heading1")}
        shortcut="H1"
      />
      <MenuButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        isActive={editor.isActive("heading", { level: 2 })}
        icon={<Heading2 className="h-4 w-4" />}
        label={t("editor.heading2")}
        shortcut="H2"
      />
      <MenuButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        isActive={editor.isActive("heading", { level: 3 })}
        icon={<Heading3 className="h-4 w-4" />}
        label={t("editor.heading3")}
        shortcut="H3"
      />

      <ToolbarDivider />

      {/* Alignment */}
      <MenuButton
        onClick={() => editor.chain().focus().setTextAlign("left").run()}
        isActive={editor.isActive({ textAlign: "left" })}
        icon={<AlignLeft className="h-4 w-4" />}
        label={t("editor.alignLeft")}
      />
      <MenuButton
        onClick={() => editor.chain().focus().setTextAlign("center").run()}
        isActive={editor.isActive({ textAlign: "center" })}
        icon={<AlignCenter className="h-4 w-4" />}
        label={t("editor.alignCenter")}
      />
      <MenuButton
        onClick={() => editor.chain().focus().setTextAlign("right").run()}
        isActive={editor.isActive({ textAlign: "right" })}
        icon={<AlignRight className="h-4 w-4" />}
        label={t("editor.alignRight")}
      />
      <MenuButton
        onClick={() => editor.chain().focus().setTextAlign("justify").run()}
        isActive={editor.isActive({ textAlign: "justify" })}
        icon={<AlignJustify className="h-4 w-4" />}
        label={t("editor.alignJustify")}
      />

      {/* Indent / Outdent (paragraf biasa, ala Word) */}
      <MenuButton
        onClick={() => editor.chain().focus().indentBlock().run()}
        disabled={!editor.can().indentBlock()}
        icon={<IndentIncrease className="h-4 w-4" />}
        label={t("editor.indent")}
      />
      <MenuButton
        onClick={() => editor.chain().focus().outdentBlock().run()}
        disabled={!editor.can().outdentBlock()}
        icon={<IndentDecrease className="h-4 w-4" />}
        label={t("editor.outdent")}
      />
      <LineSpacingSelector editor={editor} />

      <ToolbarDivider />

      {/* Lists */}
      <MenuButton
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        isActive={editor.isActive("bulletList")}
        icon={<List className="h-4 w-4" />}
        label={t("editor.bulletList")}
        shortcut="Tab / ⇧Tab"
      />
      <MenuButton
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        isActive={editor.isActive("orderedList")}
        icon={<ListOrdered className="h-4 w-4" />}
        label={t("editor.numberedList")}
        shortcut="Tab / ⇧Tab"
      />
      <MenuButton
        onClick={() => editor.chain().focus().toggleTaskList().run()}
        isActive={editor.isActive("taskList")}
        icon={<CheckSquare className="h-4 w-4" />}
        label={t("editor.checklist")}
        shortcut="Tab / ⇧Tab"
      />

      <ToolbarDivider />

      {/* Insert Menu Group: Images, Tables, Links, Breaks */}
      <ImagePicker editor={editor} />
      <TablePicker editor={editor} />
      <TableContextActions editor={editor} />
      <LinkButton editor={editor} />
      {editor.isActive("link") && (
        <MenuButton
          onClick={() => editor.chain().focus().unsetLink().run()}
          icon={<Unlink className="h-4 w-4" />}
          label={t("editor.removeLink")}
        />
      )}
      <MenuButton
        onClick={() => editor.chain().focus().setPageBreak().run()}
        disabled={editor.isActive("table")}
        icon={<SeparatorHorizontal className="h-4 w-4" />}
        label={editor.isActive("table") ? t("editor.pageBreakDisabled") : t("editor.pageBreakTooltip")}
        shortcut="Ctrl+Enter"
      />

      <ToolbarDivider />

      {/* Blocks & Code */}
      <MenuButton
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        isActive={editor.isActive("blockquote")}
        icon={<Quote className="h-4 w-4" />}
        label={t("editor.blockquote")}
      />
      <MenuButton
        onClick={() => editor.chain().focus().toggleCode().run()}
        isActive={editor.isActive("code")}
        icon={<Code className="h-4 w-4" />}
        label={t("editor.inlineCode")}
        shortcut="`code`"
      />
      <MenuButton
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        isActive={editor.isActive("codeBlock")}
        icon={<FileCode className="h-4 w-4" />}
        label={t("editor.codeBlock")}
        shortcut="```"
      />
      <MenuButton
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
        icon={<Minus className="h-4 w-4" />}
        label={t("editor.horizontalRule")}
        shortcut="---"
      />

      <MenuButton
        onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}
        icon={<RemoveFormatting className="h-4 w-4" />}
        label={t("editor.clearFormatting")}
      />

      <ToolbarDivider />

      {/* View Toggle: Word Page View vs Full Width */}
      <MenuButton
        onClick={onTogglePageView}
        isActive={isPageView}
        icon={isPageView ? <Maximize2 className="h-4 w-4" /> : <Layout className="h-4 w-4" />}
        label={isPageView ? t("editor.fullWidthView") : t("editor.pageView")}
      />

      {/* Document Settings */}
      <DocumentSettingsPanel
        settings={documentSettings}
        onSettingsChange={onDocumentSettingsChange}
      />

      {/* Export Button */}
      <ExportMenu
        editor={editor}
        settings={documentSettings}
        noteTitle={noteTitle}
      />
    </div>
  );
}

function EditorStatusBar({ editor }: { editor: Editor }) {
  const [stats, setStats] = useState({ words: 0, characters: 0, readTimeMin: 1 });
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!editor) return;

    const computeStats = () => {
      const text = editor.getText() || "";
      const words = text.trim() ? text.trim().split(/\s+/).length : 0;
      const characters = text.length;
      const readTimeMin = Math.max(1, Math.ceil(words / 200));
      setStats({ words, characters, readTimeMin });
    };

    computeStats();

    const handleUpdate = () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(computeStats, 250);
    };

    editor.on("transaction", handleUpdate);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      editor.off("transaction", handleUpdate);
    };
  }, [editor]);

  return (
    <div className="mt-4 pt-3 border-t border-border/40 flex items-center justify-between text-[11px] text-muted-foreground select-none">
      <div className="flex items-center gap-3">
        <span>
          <strong className="font-semibold text-foreground">{stats.words}</strong> kata
        </span>
        <span>•</span>
        <span>
          <strong className="font-semibold text-foreground">{stats.characters}</strong> karakter
        </span>
        <span>•</span>
        <span>
          ~{stats.readTimeMin} mnt baca
        </span>
      </div>
      <div className="flex items-center gap-2">
        <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        <span className="text-[10px] font-medium">Editor Siap</span>
      </div>
    </div>
  );
}

function InlineHeaderFooterInput({
  initialValue,
  zone,
  pageIndex,
  onSave,
  onCancel,
}: {
  initialValue: string;
  zone: "header" | "footer";
  pageIndex: number;
  onSave: (value: string) => void;
  onCancel: () => void;
}) {
  const [text, setText] = useState(initialValue || "");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    inputRef.current?.select();
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      onSave(text.trim());
    } else if (e.key === "Escape") {
      e.preventDefault();
      onCancel();
    }
  };

  return (
    <div
      className="w-full relative z-30 flex flex-col items-center animate-in fade-in zoom-in-95 duration-150 py-1"
      onClick={(e) => e.stopPropagation()}
      onDoubleClick={(e) => e.stopPropagation()}
    >
      <input
        ref={inputRef}
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onBlur={() => onSave(text.trim())}
        onKeyDown={handleKeyDown}
        placeholder={`Teks ${zone === "header" ? "Header" : "Footer"}...`}
        className="w-full text-center text-[10pt] font-sans font-medium px-3 py-1.5 rounded-lg border-2 border-dashed border-primary bg-primary/10 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:bg-background shadow-lg transition-all placeholder:text-muted-foreground/60"
      />
      <div className="mt-1 flex items-center gap-1.5 text-[10px] font-semibold bg-popover text-foreground px-2.5 py-0.5 rounded-full border border-border shadow-xs pointer-events-none select-none">
        <span className="text-primary">{zone === "header" ? "Header" : "Footer"} Halaman {pageIndex + 1}</span>
      </div>
    </div>
  );
}

export function NoteEditor({
  initialContent,
  onUpdate,
  editable = true,
  documentSettings = DEFAULT_DOCUMENT_SETTINGS,
  onDocumentSettingsChange,
  noteTitle = "Catatan",
}: NoteEditorProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [isPageView, setIsPageView] = useState(true);
  const [localSettings, setLocalSettings] = useState<DocumentSettings>(documentSettings);
  const [measuredHeight, setMeasuredHeight] = useState(0);
  const [zoomPercent, setZoomPercent] = useState<number>(100);

  // Header/Footer direct inline editing zone on double-click
  const [hfEditingZone, setHfEditingZone] = useState<{ zone: "header" | "footer"; pageIndex: number } | null>(null);

  const onUpdateRef = useRef(onUpdate);
  const updateTimerRef = useRef<NodeJS.Timeout | null>(null);
  const contentWrapperRef = useRef<HTMLDivElement>(null);
  const deskContainerRef = useRef<HTMLDivElement>(null);
  const lastSpacerSigRef = useRef("");
  const hasDecorRef = useRef(false);

  useEffect(() => {
    onUpdateRef.current = onUpdate;
  }, [onUpdate]);

  useEffect(() => {
    setIsMounted(true);
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      setIsPageView(false);
    }
  }, []);

  useEffect(() => {
    setLocalSettings(documentSettings);
  }, [documentSettings]);

  const handleSettingsChange = useCallback(
    (newSettings: DocumentSettings) => {
      setLocalSettings(newSettings);
      onDocumentSettingsChange?.(newSettings);
    },
    [onDocumentSettingsChange]
  );

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Highlight.configure({
        multicolor: true,
      }),
      Underline,
      TextStyle,
      Color,
      Subscript,
      Superscript,
      LineHeight,
      Indent,
      FontFamily,
      FontSize,
      PageBreak,
      AdvancedImage,
      paginationSpacersExtension,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          rel: "noopener noreferrer nofollow",
          target: "_blank",
        },
      }),
      Placeholder.configure({
        placeholder: "Mulai menulis catatan Anda di sini... (Ketik atau tempel gambar langsung)",
      }),
      Table.configure({
        resizable: true,
        lastColumnResizable: true,
        allowTableNodeSelection: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content: initialContent || "",
    editable,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      if (updateTimerRef.current) {
        clearTimeout(updateTimerRef.current);
      }
      updateTimerRef.current = setTimeout(() => {
        onUpdateRef.current(editor.getHTML());
      }, 200);
    },
    onBlur: ({ editor }) => {
      if (updateTimerRef.current) {
        clearTimeout(updateTimerRef.current);
        updateTimerRef.current = null;
      }
      onUpdateRef.current(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          "prose dark:prose-invert max-w-none focus:outline-none min-h-[460px] text-foreground leading-relaxed",
        style: `font-family: ${localSettings.defaultFont}, sans-serif; font-size: ${localSettings.defaultFontSize}pt;`,
      },
      handleKeyDown: (view, event) => {
        if ((event.ctrlKey || event.metaKey) && event.key === "k") {
          event.preventDefault();
          window.dispatchEvent(new CustomEvent("tiptap-open-link-dialog"));
          return true;
        }

        if (event.key === "Tab") {
          if (editor) {
            if (editor.isActive("table")) {
              if (!event.shiftKey) {
                if (editor.can().goToNextCell && !editor.can().goToNextCell()) {
                  event.preventDefault();
                  editor.chain().focus().addRowAfter().goToNextCell().run();
                  return true;
                }
              }
            } else if (editor.isActive("taskList")) {
              event.preventDefault();
              if (event.shiftKey) {
                editor.chain().focus().liftListItem("taskItem").run();
              } else {
                editor.chain().focus().sinkListItem("taskItem").run();
              }
              return true;
            } else if (editor.isActive("bulletList") || editor.isActive("orderedList")) {
              event.preventDefault();
              if (event.shiftKey) {
                editor.chain().focus().liftListItem("listItem").run();
              } else {
                editor.chain().focus().sinkListItem("listItem").run();
              }
              return true;
            }
          }
        }

        return false;
      },
      handlePaste: (view, event) => {
        const items = event.clipboardData?.items;
        if (items) {
          for (let i = 0; i < items.length; i++) {
            if (items[i].type.startsWith("image/")) {
              const file = items[i].getAsFile();
              if (file) {
                event.preventDefault();
                const reader = new FileReader();
                reader.onload = () => {
                  const result = reader.result as string;
                  if (result) {
                    (editor?.chain().focus() as any)?.setImage({ src: result, alt: file.name }).run();
                  }
                };
                reader.readAsDataURL(file);
                return true;
              }
            }
          }
        }
        return false;
      },
      handleDrop: (view, event) => {
        const files = event.dataTransfer?.files;
        if (files && files.length > 0) {
          const file = files[0];
          if (file.type.startsWith("image/")) {
            event.preventDefault();
            const reader = new FileReader();
            reader.onload = () => {
              const result = reader.result as string;
              if (result) {
                (editor?.chain().focus() as any)?.setImage({ src: result, alt: file.name }).run();
              }
            };
            reader.readAsDataURL(file);
            return true;
          }
        }
        return false;
      },
    },
  });

  // Measure content height dynamically to compute multi-page count without forced synchronous layout on transaction
  useEffect(() => {
    if (!editor) return;
    let rafId: number | null = null;

    const updateMeasuredHeight = () => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        if (contentWrapperRef.current) {
          const pmEl = contentWrapperRef.current.querySelector(".ProseMirror") as HTMLElement;
          if (pmEl) {
            // Kurangi tinggi spacer pagination agar tidak memicu loop
            // penambahan halaman semu.
            let spacerTotal = 0;
            pmEl.querySelectorAll<HTMLElement>(".pagination-spacer").forEach((sp) => {
              spacerTotal += sp.offsetHeight;
            });
            const nextHeight = Math.max(0, pmEl.scrollHeight - spacerTotal);
            setMeasuredHeight((prev) => (Math.abs(prev - nextHeight) > 1 ? nextHeight : prev));
          } else {
            setMeasuredHeight(contentWrapperRef.current.scrollHeight);
          }
        }
      });
    };

    updateMeasuredHeight();

    const observer = new ResizeObserver(() => {
      updateMeasuredHeight();
    });

    if (contentWrapperRef.current) {
      observer.observe(contentWrapperRef.current);
    }

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      if (updateTimerRef.current) clearTimeout(updateTimerRef.current);
      observer.disconnect();
    };
  }, [editor]);

  // Synchronize document typography settings directly to editor DOM
  useEffect(() => {
    if (!editor || !editor.view?.dom) return;
    const dom = editor.view.dom as HTMLElement;
    if (dom) {
      dom.style.fontFamily = `${localSettings.defaultFont}, sans-serif`;
      dom.style.fontSize = `${localSettings.defaultFontSize}pt`;
    }
  }, [editor, localSettings.defaultFont, localSettings.defaultFontSize]);

  // Calculate exact physical paper dimensions in pixels based on localSettings
  const pageDims = getEffectivePageDimensions(localSettings);
  const paperWidthPx = Math.round(pageDims.pageWidthPx);
  const paperHeightPx = Math.round(pageDims.pageHeightPx);
  const marginTopPx = Math.round(mmToPx(localSettings.margins.top));
  const marginBottomPx = Math.round(mmToPx(localSettings.margins.bottom));
  const marginLeftPx = Math.round(mmToPx(localSettings.margins.left));
  const marginRightPx = Math.round(mmToPx(localSettings.margins.right));
  const headerHeightPx = Math.round(pageDims.headerHeightPx);
  const footerHeightPx = Math.round(pageDims.footerHeightPx);
  const printableBodyHeightPx = Math.max(100, Math.round(pageDims.bodyHeightPx));

  // Compute total pages automatically based on printable body height per page
  const totalPages = Math.max(1, Math.ceil((measuredHeight || 1) / printableBodyHeightPx));

  // Terapkan spacer antar-halaman (lompatan ala Word yang melewati header dan footer)
  const applyPagination = useCallback(() => {
    if (!editor || !editor.view || editor.isDestroyed) return;

    if (!isPageView) {
      if (hasDecorRef.current) {
        hasDecorRef.current = false;
        lastSpacerSigRef.current = "";
        try {
          editor.view.dispatch(
            editor.state.tr.setMeta(paginationKey, DecorationSet.empty)
          );
        } catch {
          /* view mungkin sedang update */
        }
      }
      return;
    }

    const spacers = computePageSpacers(editor, {
      paperHeightPx,
      marginTopPx,
      marginBottomPx,
      headerHeightPx,
      footerHeightPx,
      totalPages,
      zoomScale: zoomPercent / 100,
    });

    const sig = JSON.stringify(spacers);
    if (sig === lastSpacerSigRef.current) return;
    lastSpacerSigRef.current = sig;
    hasDecorRef.current = true;

    try {
      const decos = DecorationSet.create(
        editor.state.doc,
        spacers.map((s) =>
          Decoration.widget(
            s.pos,
            () => {
              const el = document.createElement("div");
              el.className = "pagination-spacer";
              el.style.display = "inline-block";
              el.style.width = "100%";
              el.style.height = `${s.height}px`;
              el.style.verticalAlign = "bottom";
              el.setAttribute("contenteditable", "false");
              return el;
            },
            { side: -1, ignoreSelection: true, key: `${s.pos}-${Math.round(s.height)}` }
          )
        )
      );
      editor.view.dispatch(editor.state.tr.setMeta(paginationKey, decos));
    } catch {
      /* posisi bisa basi saat dokumen berubah cepat; iterasi berikutnya memperbaiki */
    }
  }, [editor, isPageView, paperHeightPx, marginTopPx, marginBottomPx, headerHeightPx, footerHeightPx, totalPages, zoomPercent]);

  useEffect(() => {
    const raf = requestAnimationFrame(applyPagination);
    return () => cancelAnimationFrame(raf);
  }, [applyPagination]);

  const handleFitWidth = () => {
    if (!deskContainerRef.current) return;
    const availableWidth = deskContainerRef.current.clientWidth - 48;
    if (availableWidth > 0 && paperWidthPx > 0) {
      const fitZoom = Math.min(150, Math.max(40, Math.round((availableWidth / paperWidthPx) * 100)));
      setZoomPercent(fitZoom);
    }
  };

  if (!isMounted || !editor) {
    return (
      <div className="h-[460px] w-full bg-card/20 animate-pulse rounded-2xl border border-border/30" />
    );
  }

  return (
    <div className="w-full relative">
      {editable && (
        <>
          <EditorToolbar
            editor={editor}
            documentSettings={localSettings}
            onDocumentSettingsChange={handleSettingsChange}
            noteTitle={noteTitle}
            isPageView={isPageView}
            onTogglePageView={() => setIsPageView(!isPageView)}
          />
          <ImageToolbar editor={editor} />
        </>
      )}

      {/* Document Info & Zoom Control Bar */}
      <div className="mb-3 px-1 flex flex-wrap items-center justify-between gap-2 text-[11px] text-muted-foreground select-none">
        <div className="flex items-center flex-wrap gap-2">
          {isPageView && (
            <span className="px-2.5 py-1 rounded-lg bg-primary/10 text-primary font-bold border border-primary/20 flex items-center gap-1.5 shadow-xs">
              <FileText className="w-3.5 h-3.5" />
              <span>Halaman 1 dari {totalPages}</span>
            </span>
          )}
          <span className="px-2 py-0.5 rounded-md bg-muted/60 font-medium text-foreground">
            {localSettings.pageSize} • {localSettings.orientation === "landscape" ? "Landscape" : "Portrait"}
          </span>
          <span>•</span>
          <span>
            Margin: T:{Math.round(localSettings.margins.top)} B:{Math.round(localSettings.margins.bottom)} L:{Math.round(localSettings.margins.left)} R:{Math.round(localSettings.margins.right)} (mm)
          </span>
          <span>•</span>
          <span>
            Font: {localSettings.defaultFont} {localSettings.defaultFontSize}pt
          </span>
        </div>

        {/* Page View Specific Quick Add */}
        {isPageView && (
          <div className="flex items-center gap-1.5 ml-auto">
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                editor.chain().focus().setPageBreak().run();
              }}
              disabled={editor.isActive("table")}
              className="px-2.5 py-1 rounded-lg bg-foreground/5 hover:bg-foreground/10 text-foreground text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer border border-border/50 disabled:opacity-40 disabled:cursor-not-allowed"
              title={editor.isActive("table") ? "Tidak tersedia di dalam tabel" : "Sisipkan Lembar Baru (Ctrl+Enter)"}
            >
              <Plus className="w-3.5 h-3.5 text-primary" />
              <span className="hidden sm:inline">Tambah Lembar Baru</span>
            </button>
          </div>
        )}
      </div>

      {/* Desk Canvas Area */}
      <div
        ref={deskContainerRef}
        className={cn(
          "w-full rounded-2xl transition-colors min-h-[620px] relative overflow-hidden",
          isPageView ? "bg-neutral-100/90 dark:bg-neutral-900/90 py-6 sm:py-10 px-2 sm:px-4 flex justify-center shadow-inner overflow-x-auto" : ""
        )}
      >
        {isPageView ? (
          <div className="w-full flex flex-col items-center">
            {/* Top Desk Floating Control */}
            <div className="w-full max-w-4xl flex items-center justify-between pb-4 text-xs select-none">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-medium text-neutral-600 dark:text-neutral-300 bg-neutral-200/80 dark:bg-neutral-800/80 px-2.5 py-1 rounded-full border border-neutral-300 dark:border-neutral-700/60 shadow-xs">
                  {totalPages} Lembar Halaman ({localSettings.pageSize} • {localSettings.orientation})
                </span>
              </div>
              <div className="flex items-center gap-1.5 bg-neutral-200/80 dark:bg-neutral-800/80 px-2 py-1 rounded-full border border-neutral-300 dark:border-neutral-700/60 shadow-xs">
                <button
                  type="button"
                  onClick={() => setZoomPercent((prev) => Math.max(40, prev - 10))}
                  className="p-1 rounded-full hover:bg-neutral-300 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-200 transition-colors cursor-pointer"
                  title="Perkecil (-10%)"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <span className="text-[11px] font-mono font-semibold px-1 text-neutral-800 dark:text-neutral-100 min-w-[42px] text-center">
                  {zoomPercent}%
                </span>
                <button
                  type="button"
                  onClick={() => setZoomPercent((prev) => Math.min(160, prev + 10))}
                  className="p-1 rounded-full hover:bg-neutral-300 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-200 transition-colors cursor-pointer"
                  title="Perbesar (+10%)"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
                <div className="h-3 w-px bg-neutral-400 dark:bg-neutral-600 mx-0.5" />
                <button
                  type="button"
                  onClick={handleFitWidth}
                  className="px-2 py-0.5 rounded-full hover:bg-neutral-300 dark:hover:bg-neutral-700 text-[10px] font-medium text-neutral-700 dark:text-neutral-200 transition-colors cursor-pointer"
                  title="Sesuaikan Lebar Layar"
                >
                  Pas Lebar
                </button>
                <button
                  type="button"
                  onClick={() => setZoomPercent(100)}
                  className="px-2 py-0.5 rounded-full hover:bg-neutral-300 dark:hover:bg-neutral-700 text-[10px] font-medium text-neutral-700 dark:text-neutral-200 transition-colors cursor-pointer"
                  title="Reset ke 100%"
                >
                  100%
                </button>
              </div>
            </div>

            {/* Scale Container */}
            <div
              style={{
                transform: `scale(${zoomPercent / 100})`,
                transformOrigin: "top center",
                marginBottom: `${Math.max(0, (zoomPercent / 100 - 1) * paperHeightPx * totalPages)}px`,
              }}
              className="transition-transform duration-150 flex flex-col items-center gap-8 select-text"
            >
              {/* Word Document Paper Sheet Simulation */}
              <div
                className="paper-surface relative bg-white text-[#111827] shadow-[0_12px_40px_rgba(0,0,0,0.16)] dark:shadow-[0_12px_40px_rgba(0,0,0,0.45)] border border-neutral-300 dark:border-neutral-700/80 rounded-xs cursor-text"
                style={{
                  width: `${paperWidthPx}px`,
                  minHeight: `${paperHeightPx * totalPages + (totalPages - 1) * 36}px`,
                }}
                onClick={(e) => {
                  if ((e.target as HTMLElement).closest('[data-header-footer-zone]')) {
                    return;
                  }
                  if (e.target === e.currentTarget || !(e.target as HTMLElement).closest('.ProseMirror')) {
                    editor?.commands.focus();
                  }
                }}
              >
                {/* ═══ Per-Page Boundary Overlays & Dedicated Header/Footer Zones ═══ */}
                {Array.from({ length: totalPages }).map((_, pageIdx) => {
                  const dividerOffset = pageIdx * 36;
                  const pageTop = pageIdx * paperHeightPx + dividerOffset;
                  const pageBottom = pageTop + paperHeightPx;

                  // Margin boundaries (defines body content bounds)
                  const marginBoundaryTop = pageTop + marginTopPx;
                  const marginBoundaryBottom = pageBottom - marginBottomPx;

                  // Outer Header Zone: lives inside the TOP MARGIN area (pageTop to marginBoundaryTop)
                  const headerZoneTop = pageTop;
                  const headerZoneHeight = marginTopPx;

                  // Outer Footer Zone: lives inside the BOTTOM MARGIN area (marginBoundaryBottom to pageBottom)
                  const footerZoneTop = marginBoundaryBottom;
                  const footerZoneHeight = marginBottomPx;

                  const cornerLen = 12;
                  const isEditingHeader = hfEditingZone?.zone === "header" && hfEditingZone.pageIndex === pageIdx;
                  const isEditingFooter = hfEditingZone?.zone === "footer" && hfEditingZone.pageIndex === pageIdx;

                  return (
                    <div key={`page-boundaries-${pageIdx}`} className="pointer-events-none select-none" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 20 }}>

                      {/* ── 4 Outer Page Corner Marks ── */}
                      <div className="absolute z-20" style={{ top: `${pageTop}px`, left: '0px' }}>
                        <div className="absolute" style={{ top: 0, left: 0, width: `${cornerLen}px`, height: '1.5px', background: 'rgba(156,163,175,0.55)' }} />
                        <div className="absolute" style={{ top: 0, left: 0, width: '1.5px', height: `${cornerLen}px`, background: 'rgba(156,163,175,0.55)' }} />
                      </div>
                      <div className="absolute z-20" style={{ top: `${pageTop}px`, right: '0px' }}>
                        <div className="absolute" style={{ top: 0, right: 0, width: `${cornerLen}px`, height: '1.5px', background: 'rgba(156,163,175,0.55)' }} />
                        <div className="absolute" style={{ top: 0, right: 0, width: '1.5px', height: `${cornerLen}px`, background: 'rgba(156,163,175,0.55)' }} />
                      </div>
                      <div className="absolute z-20" style={{ top: `${pageBottom}px`, left: '0px' }}>
                        <div className="absolute" style={{ bottom: 0, left: 0, width: `${cornerLen}px`, height: '1.5px', background: 'rgba(156,163,175,0.55)', transform: 'translateY(-1.5px)' }} />
                        <div className="absolute" style={{ top: `-${cornerLen}px`, left: 0, width: '1.5px', height: `${cornerLen}px`, background: 'rgba(156,163,175,0.55)' }} />
                      </div>
                      <div className="absolute z-20" style={{ top: `${pageBottom}px`, right: '0px' }}>
                        <div className="absolute" style={{ bottom: 0, right: 0, width: `${cornerLen}px`, height: '1.5px', background: 'rgba(156,163,175,0.55)', transform: 'translateY(-1.5px)' }} />
                        <div className="absolute" style={{ top: `-${cornerLen}px`, right: 0, width: '1.5px', height: `${cornerLen}px`, background: 'rgba(156,163,175,0.55)' }} />
                      </div>

                      {/* ── Content Area Corner Marks (at margin intersections) ── */}
                      <div className="absolute z-20" style={{ top: `${marginBoundaryTop}px`, left: `${marginLeftPx}px` }}>
                        <div className="absolute" style={{ top: '-1px', left: '-8px', width: '8px', height: '1px', background: 'rgba(156,163,175,0.35)' }} />
                        <div className="absolute" style={{ top: '-8px', left: '-1px', width: '1px', height: '8px', background: 'rgba(156,163,175,0.35)' }} />
                      </div>
                      <div className="absolute z-20" style={{ top: `${marginBoundaryTop}px`, right: `${marginRightPx}px` }}>
                        <div className="absolute" style={{ top: '-1px', right: '-8px', width: '8px', height: '1px', background: 'rgba(156,163,175,0.35)' }} />
                        <div className="absolute" style={{ top: '-8px', right: '-1px', width: '1px', height: '8px', background: 'rgba(156,163,175,0.35)' }} />
                      </div>
                      <div className="absolute z-20" style={{ top: `${marginBoundaryBottom}px`, left: `${marginLeftPx}px` }}>
                        <div className="absolute" style={{ bottom: '-1px', left: '-8px', width: '8px', height: '1px', background: 'rgba(156,163,175,0.35)', transform: 'translateY(1px)' }} />
                        <div className="absolute" style={{ top: '0px', left: '-1px', width: '1px', height: '8px', background: 'rgba(156,163,175,0.35)' }} />
                      </div>
                      <div className="absolute z-20" style={{ top: `${marginBoundaryBottom}px`, right: `${marginRightPx}px` }}>
                        <div className="absolute" style={{ bottom: '-1px', right: '-8px', width: '8px', height: '1px', background: 'rgba(156,163,175,0.35)', transform: 'translateY(1px)' }} />
                        <div className="absolute" style={{ top: '0px', right: '-1px', width: '1px', height: '8px', background: 'rgba(156,163,175,0.35)' }} />
                      </div>

                      {/* ── Top Margin Boundary Line (dashed separator between Outer Header and Body Content) ── */}
                      <div
                        className="absolute z-10"
                        style={{
                          top: `${marginBoundaryTop}px`,
                          left: `${marginLeftPx}px`,
                          right: `${marginRightPx}px`,
                          height: '0px',
                          borderTop: '1px dashed rgba(156,163,175,0.30)',
                        }}
                      />

                      {/* ── Bottom Margin Boundary Line (dashed separator between Body Content and Outer Footer) ── */}
                      <div
                        className="absolute z-10"
                        style={{
                          top: `${marginBoundaryBottom}px`,
                          left: `${marginLeftPx}px`,
                          right: `${marginRightPx}px`,
                          height: '0px',
                          borderTop: '1px dashed rgba(156,163,175,0.30)',
                        }}
                      />

                      {/* ── Left Content Boundary ── */}
                      <div
                        className="absolute z-10"
                        style={{
                          top: `${marginBoundaryTop}px`,
                          left: `${marginLeftPx}px`,
                          width: '0px',
                          height: `${marginBoundaryBottom - marginBoundaryTop}px`,
                          borderLeft: '1px dashed rgba(156,163,175,0.20)',
                        }}
                      />

                      {/* ── Right Content Boundary ── */}
                      <div
                        className="absolute z-10"
                        style={{
                          top: `${marginBoundaryTop}px`,
                          right: `${marginRightPx}px`,
                          width: '0px',
                          height: `${marginBoundaryBottom - marginBoundaryTop}px`,
                          borderLeft: '1px dashed rgba(156,163,175,0.20)',
                        }}
                      />

                      {/* ── Outer Header Zone (in Top Margin: Double-click / Click to Edit) ── */}
                      <div
                        data-header-footer-zone="true"
                        className={cn(
                          "absolute z-30 flex items-center justify-center pointer-events-auto cursor-pointer select-none transition-all rounded-lg px-2",
                          isEditingHeader
                            ? "p-1 z-40 bg-background/95 ring-2 ring-primary shadow-lg"
                            : "hover:bg-primary/5 hover:ring-1 hover:ring-primary/30 group"
                        )}
                        style={{
                          top: `${headerZoneTop}px`,
                          left: `${marginLeftPx}px`,
                          right: `${marginRightPx}px`,
                          height: `${headerZoneHeight}px`,
                        }}
                        title={editable ? "Header Dokumen" : undefined}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          if (editable && !isEditingHeader) {
                            setHfEditingZone({ zone: "header", pageIndex: pageIdx });
                          }
                        }}
                        onDoubleClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          if (editable) {
                            setHfEditingZone({ zone: "header", pageIndex: pageIdx });
                          }
                        }}
                      >
                        {isEditingHeader ? (
                          <InlineHeaderFooterInput
                            initialValue={localSettings.headerText || ""}
                            zone="header"
                            pageIndex={pageIdx}
                            onSave={(val) => {
                              handleSettingsChange({ ...localSettings, headerText: val });
                              setHfEditingZone(null);
                            }}
                            onCancel={() => setHfEditingZone(null)}
                          />
                        ) : (
                          <>
                            {localSettings.headerText ? (
                              <span
                                className="w-full text-center truncate text-slate-700 dark:text-slate-300 group-hover:text-primary font-medium transition-colors cursor-pointer"
                                style={{ fontSize: "9pt", lineHeight: 1.2 }}
                              >
                                {localSettings.headerText}
                              </span>
                            ) : (
                              <span className="text-[10px] font-semibold text-primary/70 bg-primary/10 group-hover:bg-primary/20 px-3 py-0.5 rounded-full border border-primary/20 transition-all opacity-70 group-hover:opacity-100 shadow-xs cursor-pointer">
                                Header Dokumen
                              </span>
                            )}
                          </>
                        )}
                      </div>

                      {/* ── Outer Footer Zone (in Bottom Margin: Double-click / Click to Edit) ── */}
                      <div
                        data-header-footer-zone="true"
                        className={cn(
                          "absolute z-30 flex items-center justify-center pointer-events-auto cursor-pointer select-none transition-all rounded-lg px-2",
                          isEditingFooter
                            ? "p-1 z-40 bg-background/95 ring-2 ring-primary shadow-lg"
                            : "hover:bg-primary/5 hover:ring-1 hover:ring-primary/30 group"
                        )}
                        style={{
                          top: `${footerZoneTop}px`,
                          left: `${marginLeftPx}px`,
                          right: `${marginRightPx}px`,
                          height: `${footerZoneHeight}px`,
                        }}
                        title={editable ? "Footer Dokumen" : undefined}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          if (editable && !isEditingFooter) {
                            setHfEditingZone({ zone: "footer", pageIndex: pageIdx });
                          }
                        }}
                        onDoubleClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          if (editable) {
                            setHfEditingZone({ zone: "footer", pageIndex: pageIdx });
                          }
                        }}
                      >
                        {isEditingFooter ? (
                          <InlineHeaderFooterInput
                            initialValue={localSettings.footerText || ""}
                            zone="footer"
                            pageIndex={pageIdx}
                            onSave={(val) => {
                              handleSettingsChange({ ...localSettings, footerText: val });
                              setHfEditingZone(null);
                            }}
                            onCancel={() => setHfEditingZone(null)}
                          />
                        ) : (
                          <>
                            {localSettings.footerText ? (
                              <span
                                className="w-full text-center truncate text-slate-700 dark:text-slate-300 group-hover:text-primary font-medium transition-colors cursor-pointer"
                                style={{ fontSize: "9pt", lineHeight: 1.2 }}
                              >
                                {localSettings.footerText}
                              </span>
                            ) : (
                              <span className="text-[10px] font-semibold text-primary/70 bg-primary/10 group-hover:bg-primary/20 px-3 py-0.5 rounded-full border border-primary/20 transition-all opacity-70 group-hover:opacity-100 shadow-xs cursor-pointer">
                                Footer Dokumen
                              </span>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}

                {/* ═══ Multi-Page Visual Dividers between sheets ═══ */}
                {Array.from({ length: totalPages - 1 }).map((_, index) => {
                  const pageNumber = index + 2;
                  const topOffset = (index + 1) * paperHeightPx + index * 36;
                  return (
                    <div
                      key={`page-divider-${pageNumber}`}
                      className="absolute left-0 right-0 h-9 bg-neutral-200 dark:bg-neutral-800 border-y border-neutral-300 dark:border-neutral-700 shadow-inner flex items-center justify-between px-5 text-[11px] font-semibold text-neutral-600 dark:text-neutral-300 select-none pointer-events-none z-20"
                      style={{ top: `${topOffset}px` }}
                    >
                      <span className="flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-primary" />
                        <span>Lembar Halaman {pageNumber} dari {totalPages}</span>
                      </span>
                      <span className="tracking-widest uppercase text-[9px] opacity-70">
                        Batas Kertas ({localSettings.pageSize} • {localSettings.orientation})
                      </span>
                      <span className="text-[10px] opacity-80">Margin: {localSettings.margins.top}mm</span>
                    </div>
                  );
                })}

                {/* ═══ Editor Body Content Box (Cleanly bounded by Margins) ═══ */}
                <div
                  ref={contentWrapperRef}
                  style={{
                    paddingTop: `${marginTopPx}px`,
                    paddingBottom: `${marginBottomPx}px`,
                    paddingLeft: `${marginLeftPx}px`,
                    paddingRight: `${marginRightPx}px`,
                    minHeight: `${paperHeightPx}px`,
                    fontFamily: `${localSettings.defaultFont}, sans-serif`,
                    fontSize: `${localSettings.defaultFontSize}pt`,
                  }}
                  className="w-full relative z-10"
                >
                  <EditorContent editor={editor} />
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div
            style={{
              fontFamily: `${localSettings.defaultFont}, sans-serif`,
              fontSize: `${localSettings.defaultFontSize}pt`,
            }}
            className="paper-surface w-full bg-white text-[#111827] p-6 rounded-2xl border border-border/70 shadow-lg"
          >
            <EditorContent editor={editor} />
          </div>
        )}
      </div>

      {editable && <EditorStatusBar editor={editor} />}
    </div>
  );
}
