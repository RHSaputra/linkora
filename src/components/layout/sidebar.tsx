"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import {
  LayoutDashboard,
  Link2,
  FolderOpen,
  Plus,
  Menu,
  X,
  LogOut,
  User,
  PenBox,
  Bell,
  Check,
  Clock,
  ExternalLink,
  Compass,
  BookOpen,
  Loader2,
  Volume2,
  VolumeX,
} from "lucide-react";
import { playNotificationSound, requestWebNotificationPermission } from "@/lib/notification-service";
import { LinkoraText } from "@/components/ui/linkora-text";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useState, useEffect, useTransition } from "react";
import { motion } from "framer-motion";
import { useRealtime } from "@/components/providers/realtime-provider";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ThemeToggle } from "@/components/theme-toggle";

const navItems = [
  { href: "/dashboard", label: "Dasbor", icon: LayoutDashboard, tourId: "dashboard" },
  { href: "/links", label: "Semua Tautan", icon: Link2, tourId: "links" },
  { href: "/collections", label: "Koleksi", icon: FolderOpen, tourId: "collections" },
  { href: "/notes", label: "Personal Notes", icon: PenBox, tourId: "notes" },
];

interface SidebarProps {
  onAddLink: () => void;
  onEditProfile?: () => void;
}

interface NavContentProps {
  onAddLink: () => void;
  onEditProfile?: () => void;
  pathname: string;
  setMobileOpen: (open: boolean) => void;
  session: any;
  notifications: any[];
  dismissNotification: (id: string) => Promise<void>;
  snoozeNotification: (id: string, minutes: number) => Promise<void>;
  unreadCount: number;
}

function NavContent({
  onAddLink,
  onEditProfile,
  pathname,
  setMobileOpen,
  session,
  notifications,
  dismissNotification,
  snoozeNotification,
  unreadCount,
}: NavContentProps) {
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (typeof window !== "undefined") {
      setSoundEnabled(localStorage.getItem("linkora_sound_enabled") !== "false");
    }
  }, []);

  const toggleSound = () => {
    const nextState = !soundEnabled;
    setSoundEnabled(nextState);
    if (typeof window !== "undefined") {
      localStorage.setItem("linkora_sound_enabled", String(nextState));
    }
    if (nextState) {
      playNotificationSound();
      requestWebNotificationPermission().catch(() => {});
    }
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    sessionStorage.removeItem("linkora_session_greeted");
    await signOut({ callbackUrl: "/login" });
  };

  return (
    <>
      <div className="flex items-center justify-center px-6 py-8">
        <Dialog>
          <DialogTrigger asChild>
            <img 
              src="/logo.png" 
              alt="Linkora Logo" 
              className="w-full h-auto max-w-[180px] object-contain drop-shadow-md hover:scale-105 transition-transform duration-300 cursor-pointer"
            />
          </DialogTrigger>
          <DialogContent className="glass-panel border-primary/20 sm:max-w-lg bg-card/95 flex flex-col items-center justify-center p-12">
            <img 
              src="/logo.png" 
              alt="Linkora Logo" 
              className="w-full h-auto max-w-[300px] object-contain drop-shadow-xl"
            />
            <div className="mt-8 text-center space-y-2">
              <h2 className="text-2xl font-heading font-bold text-foreground"><LinkoraText /></h2>
              <p className="text-sm text-muted-foreground font-medium tracking-widest uppercase">Save. Organize. Understand.</p>
              <p className="text-xs text-muted-foreground/60 mt-4 pt-4 border-t border-border/50">Versi 1.0.0 &copy; 2026</p>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="px-4 mb-6 flex gap-2">
        <Button 
          data-tour="add-link"
          onClick={onAddLink} 
          className="flex-1 gap-2 bg-foreground/5 hover:bg-foreground/10 text-foreground border border-border shadow-sm hover:shadow-md transition-all duration-300"
        >
          <Plus className="h-4 w-4" />
          <span>Tautan Baru</span>
        </Button>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="relative bg-foreground/5 hover:bg-foreground/10 text-foreground border border-border shadow-sm transition-all duration-300 shrink-0"
              title="Notifikasi Pengingat"
            >
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground animate-pulse">
                  {unreadCount}
                </span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0 glass-panel border-primary/20 bg-background/95 shadow-xl rounded-2xl z-[100]" align="start">
            <div className="flex items-center justify-between p-3 border-b border-border">
              <span className="text-xs font-bold text-foreground">Pengingat Aktif</span>
              {unreadCount > 0 && (
                <span className="text-[10px] bg-primary/20 text-primary px-1.5 py-0.5 rounded-full font-bold">
                  {unreadCount} Baru
                </span>
              )}
            </div>
            {unreadCount === 0 ? (
              <div className="p-6 text-center text-xs text-muted-foreground">
                Tidak ada pengingat aktif saat ini.
              </div>
            ) : (
              <ScrollArea className="max-h-64 overflow-y-auto">
                <div className="divide-y divide-border/50">
                  {notifications.map((n) => (
                    <div key={n.id} className="p-3 text-xs flex flex-col gap-2 hover:bg-foreground/5 transition-colors">
                      <div>
                        <p className="font-bold text-foreground">{n.title}</p>
                        <p className="text-muted-foreground mt-0.5 leading-normal">{n.description}</p>
                      </div>
                      <div className="flex gap-1.5">
                        {n.type === "link" && n.url && (
                          <a
                            href={n.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2 py-1.5 rounded bg-primary hover:bg-primary/95 active:scale-95 text-primary-foreground text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer"
                          >
                            Buka <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                        <button
                          onClick={() => dismissNotification(n.id)}
                          className="px-2 py-1.5 rounded bg-foreground/10 hover:bg-foreground/15 active:scale-95 text-foreground text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer"
                        >
                          <Check className="h-3 w-3" /> Selesai
                        </button>
                        <button
                          onClick={() => snoozeNotification(n.id, 15)}
                          className="px-2 py-1.5 rounded bg-foreground/5 hover:bg-foreground/10 active:scale-95 text-muted-foreground text-[10px] font-medium flex items-center gap-1 transition-all cursor-pointer"
                        >
                          <Clock className="h-3 w-3" /> Tunda 15m
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </PopoverContent>
        </Popover>
      </div>

      <nav className="flex-1 px-3 space-y-2">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              prefetch={true}
              data-tour={item.tourId}
              onClick={(e) => {
                e.preventDefault();
                setMobileOpen(false);
                startTransition(() => {
                  router.push(item.href);
                });
              }}
              className="relative block"
            >
              <div
                className={cn(
                  "relative flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all duration-300 overflow-hidden group",
                  isActive
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {isActive && (
                  <motion.div 
                    layoutId="activeNavIndicator"
                    className="absolute inset-0 bg-foreground/5 rounded-xl border border-border shadow-sm"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                
                {/* Hover Glow */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-primary/5 to-transparent" />
                
                <item.icon className={cn("h-5 w-5 relative z-10 transition-transform duration-300 group-hover:scale-110", isActive && "text-primary group-hover:text-glow")} />
                
                <span className="relative z-10 whitespace-nowrap">
                  {item.label}
                </span>
              </div>
            </Link>
          );
        })}
      </nav>

      {/* User Info & Logout */}
      <div className="p-4 mt-auto">
        {session?.user && (
          <button
            type="button"
            data-tour="profile"
            onClick={onEditProfile}
            className="flex items-center gap-3 w-full px-2.5 py-2 mb-3 rounded-2xl bg-foreground/[0.04] hover:bg-foreground/[0.08] border border-border hover:border-primary/40 transition-all duration-200 text-left group cursor-pointer shadow-xs"
            title="Klik untuk Atur Profil"
          >
            <div className="relative flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 ring-1 ring-primary/20 shadow-xs flex-shrink-0 overflow-hidden">
              {session.user.image ? (
                <img src={session.user.image} alt={session.user.name || "Avatar"} className="w-full h-full object-cover" />
              ) : (
                <User className="h-4 w-4 text-primary" />
              )}
            </div>
            <div className="flex-1 min-w-0 overflow-hidden">
              <p className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                {session.user.name || "Komandan"}
              </p>
              <p className="text-[10px] text-primary font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Atur Profil
              </p>
            </div>
          </button>
        )}
        <div className="flex items-center justify-between gap-1.5 pt-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.dispatchEvent(new Event("restart-onboarding-tour"))}
            className="flex-1 text-[11px] font-semibold text-muted-foreground hover:text-foreground hover:bg-foreground/5 rounded-xl gap-1.5 h-9 px-2 border border-border/50 hover:border-primary/40 transition-all group cursor-pointer"
            title="Panduan Penggunaan Linkora"
          >
            <div className="flex items-center gap-1 shrink-0">
              <Compass className="h-3.5 w-3.5 text-primary group-hover:rotate-45 transition-transform duration-300" />
              <BookOpen className="h-3.5 w-3.5 text-cyan-400" />
            </div>
            <span>Panduan</span>
          </Button>

          <ThemeToggle />
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSound}
            className={cn(
              "cursor-pointer h-9 w-9 rounded-xl transition-all",
              soundEnabled ? "text-primary hover:bg-primary/10" : "text-muted-foreground hover:bg-foreground/5"
            )}
            title={soundEnabled ? "Suara Notifikasi: Aktif (Klik untuk Mematikan)" : "Suara Notifikasi: Senyap (Klik untuk Mengaktifkan)"}
          >
            {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4 text-muted-foreground/60" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer h-9 w-9 rounded-xl"
            onClick={() => setLogoutDialogOpen(true)}
            title="Keluar"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Logout Confirmation Dialog */}
      <Dialog open={logoutDialogOpen} onOpenChange={setLogoutDialogOpen}>
        <DialogContent className="sm:max-w-[420px] p-6 rounded-3xl glass-panel border-destructive/30 bg-card/95 shadow-2xl backdrop-blur-2xl">
          <DialogHeader className="pb-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-destructive/10 border border-destructive/20 flex items-center justify-center text-destructive shrink-0">
                <LogOut className="h-5 w-5" />
              </div>
              <div className="text-left">
                <DialogTitle className="text-lg font-bold font-heading text-foreground">
                  Konfirmasi Keluar Akun
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                  Apakah Anda yakin ingin keluar dari Linkora?
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <p className="text-xs text-muted-foreground leading-relaxed py-2">
            Anda akan diarahkan ke halaman login dan perlu masuk kembali untuk mengakses data Anda.
          </p>

          <DialogFooter className="pt-3 border-t border-border/40 flex sm:justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={isLoggingOut}
              onClick={() => setLogoutDialogOpen(false)}
              className="rounded-xl text-xs font-semibold"
            >
              Batal
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={isLoggingOut}
              onClick={handleLogout}
              className="rounded-xl text-xs font-bold gap-1.5 shadow-sm cursor-pointer active:scale-95 transition-transform"
            >
              {isLoggingOut ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Keluar...
                </>
              ) : (
                <>
                  <LogOut className="h-3.5 w-3.5" />
                  Ya, Keluar Akun
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export function Sidebar({ onAddLink, onEditProfile }: SidebarProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { data: session } = useSession();
  const { notifications, dismissNotification, snoozeNotification, unreadCount } = useRealtime();

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 lg:hidden text-foreground glass-panel"
        onClick={() => setMobileOpen(true)}
      >
        <Menu className="h-5 w-5" />
      </Button>

      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Floating Glass Dock */}
      <aside
        className={cn(
          "fixed z-50 flex flex-col transition-transform duration-300 lg:translate-x-0 glass-panel border-r lg:border-border",
          "lg:left-6 lg:top-6 lg:bottom-6 lg:rounded-3xl lg:w-[260px]", // Floating permanently expanded on desktop
          "inset-y-0 left-0 w-64 rounded-r-3xl", // Classic on mobile
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4 lg:hidden text-foreground"
          onClick={() => setMobileOpen(false)}
        >
          <X className="h-4 w-4" />
        </Button>
        <NavContent
          onAddLink={onAddLink}
          onEditProfile={onEditProfile}
          pathname={pathname}
          setMobileOpen={setMobileOpen}
          session={session}
          notifications={notifications}
          dismissNotification={dismissNotification}
          snoozeNotification={snoozeNotification}
          unreadCount={unreadCount}
        />
      </aside>
    </>
  );
}
