import { SerializedLink } from "@/lib/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Calendar, Tag, Folder } from "lucide-react";
import { CATEGORY_COLORS } from "@/lib/utils";

export function ViewLinkDialog({
  link,
  open,
  onOpenChange,
  onOpenExternal,
}: {
  link: SerializedLink;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onOpenExternal: () => void;
}) {
  const handleOpenLink = () => {
    onOpenExternal();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl leading-tight">{link.title}</DialogTitle>
          {link.description && <DialogDescription className="mt-2">{link.description}</DialogDescription>}
        </DialogHeader>

        <div className="space-y-6 mt-2">
          <div className="flex flex-wrap gap-2 items-center">
            <Badge variant="outline" style={{ borderColor: `${CATEGORY_COLORS[link.category] || CATEGORY_COLORS.Custom}40`, color: CATEGORY_COLORS[link.category] || CATEGORY_COLORS.Custom }}>
              <Folder className="w-3 h-3 mr-1" /> {link.category}
            </Badge>
            {link.tags?.map(tag => (
               <Badge key={tag} variant="secondary" className="px-2 font-normal"><Tag className="w-3 h-3 mr-1" /> {tag}</Badge>
            ))}
            {link.reminderAt && (
              <Badge variant="outline" className="text-amber-500 border-amber-500/30 font-normal">
                <Calendar className="w-3 h-3 mr-1" /> {new Date(link.reminderAt).toLocaleString()}
              </Badge>
            )}
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold text-sm text-foreground">Catatan & Hasil Analisis AI</h4>
            <div className="p-5 rounded-xl bg-card whitespace-pre-wrap text-sm leading-relaxed text-foreground border border-border/80 shadow-inner">
              {link.notes || "Belum ada catatan atau hasil analisis AI untuk link ini."}
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button onClick={handleOpenLink} className="gap-2 w-full sm:w-auto transition-all active:scale-95">
              Buka Tautan <ExternalLink className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
