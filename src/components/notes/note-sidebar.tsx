"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Plus,
  FileText,
  Trash2,
  Star,
  Layers,
  Pin,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useTranslation } from "@/components/providers/i18n-provider";

export function NoteSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useTranslation();
  const [folders, setFolders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFolders();
  }, []);

  const fetchFolders = async () => {
    try {
      const res = await fetch("/api/notes/folders");
      const data = await res.json();
      if (Array.isArray(data)) {
        setFolders(data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const createNote = async () => {
    try {
      const res = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: t("notes.untitledNote") }),
      });
      const data = await res.json();
      if (data.id) {
        router.push(`/notes/${data.id}`);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const navItems = [
    { href: "/notes", label: t("notes.allNotes"), icon: Layers },
    { href: "/notes?filter=pinned", label: t("notes.pinned"), icon: Pin },
    { href: "/notes?filter=favorites", label: t("notes.favorites"), icon: Star },
    { href: "/notes?filter=trash", label: t("notes.trash"), icon: Trash2 },
  ];

  return (
    <aside className="w-64 border-r border-border/50 bg-card/30 flex flex-col h-full rounded-2xl p-2">
      <div className="p-3 flex items-center justify-between">
        <h2 className="text-sm font-bold flex items-center gap-2 text-foreground font-heading">
          <FileText className="w-4 h-4 text-primary" /> {t("notes.title")}
        </h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={createNote}
          className="h-8 w-8 hover:bg-primary/10 hover:text-primary rounded-xl cursor-pointer"
          title={t("notes.newNoteBtn")}
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      <div className="px-1 pb-2 flex-1 overflow-y-auto space-y-4">
        {/* Quick Links */}
        <div className="space-y-1">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/notes" && pathname.includes(item.href));
            return (
              <Link key={item.href} href={item.href} className="block">
                <div
                  className={cn(
                    "flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm transition-colors",
                    isActive
                      ? "bg-primary/15 text-primary font-semibold"
                      : "text-muted-foreground hover:bg-foreground/5 hover:text-foreground"
                  )}
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Folders */}
        <div>
          <div className="px-3 mb-2 flex items-center justify-between text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            <span>{t("notes.folders")}</span>
          </div>
          <div className="space-y-0.5">
            {loading ? (
              <div className="px-3 text-xs text-muted-foreground animate-pulse">
                {t("notes.loadingFolders")}
              </div>
            ) : folders.length === 0 ? (
              <div className="px-3 text-xs text-muted-foreground">{t("notes.noFolders")}</div>
            ) : (
              folders.map((folder) => (
                <Link
                  key={folder.id}
                  href={`/notes?folderId=${folder.id}`}
                  className="block"
                >
                  <div className="flex items-center justify-between px-3 py-1.5 rounded-xl text-sm text-muted-foreground hover:bg-foreground/5 hover:text-foreground transition-colors group">
                    <div className="flex items-center gap-2 truncate">
                      <div
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: folder.color }}
                      />
                      <span className="truncate">{folder.name}</span>
                    </div>
                    {folder._count?.notes !== undefined && (
                      <span className="text-[11px] opacity-60">
                        {folder._count.notes}
                      </span>
                    )}
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}
