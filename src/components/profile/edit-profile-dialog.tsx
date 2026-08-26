"use client";

import React, { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/custom-toast";
import {
  User,
  KeyRound,
  ShieldCheck,
  Calendar,
  Layers,
  FileText,
  Loader2,
  Check,
  Upload,
  Image as ImageIcon,
  RotateCcw,
  Compass,
  BookOpen,
  ArrowUpRight,
} from "lucide-react";
import { invalidateCache } from "@/hooks/use-data";

const AVATARS = [
  { id: "a-1", name: "Maya", url: "https://api.dicebear.com/7.x/adventurer/svg?seed=Maya" },
  { id: "a-2", name: "Luna", url: "https://api.dicebear.com/7.x/adventurer/svg?seed=Luna" },
  { id: "a-3", name: "Elena", url: "https://api.dicebear.com/7.x/adventurer/svg?seed=Elena" },
  { id: "a-4", name: "Sora", url: "https://api.dicebear.com/7.x/adventurer/svg?seed=Sora" },
  { id: "a-5", name: "Chloe", url: "https://api.dicebear.com/7.x/lorelei/svg?seed=Chloe" },
  { id: "a-6", name: "Aria", url: "https://api.dicebear.com/7.x/adventurer/svg?seed=Aria" },
  { id: "a-7", name: "Alex", url: "https://api.dicebear.com/7.x/adventurer/svg?seed=Alex" },
  { id: "a-8", name: "Leo", url: "https://api.dicebear.com/7.x/adventurer/svg?seed=Leo" },
  { id: "a-9", name: "Kai", url: "https://api.dicebear.com/7.x/adventurer/svg?seed=Kai" },
  { id: "a-10", name: "Cyber Pulse", url: "https://api.dicebear.com/7.x/bottts/svg?seed=CyberPulse" },
  { id: "a-11", name: "Quantum", url: "https://api.dicebear.com/7.x/bottts/svg?seed=QuantumX" },
  { id: "a-12", name: "Nova", url: "https://api.dicebear.com/7.x/bottts/svg?seed=NovaLink" },
];

interface EditProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditProfileDialog({ open, onOpenChange }: EditProfileDialogProps) {
  const { data: session, update } = useSession();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState<string>("");
  const [customAvatarUrl, setCustomAvatarUrl] = useState("");
  const [avatarTab, setAvatarTab] = useState<"avatars" | "custom">("avatars");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPasswordSection, setShowPasswordSection] = useState(false);

  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [profileStats, setProfileStats] = useState<{
    totalLinks: number;
    totalNotes: number;
    createdAt?: string;
  } | null>(null);

  useEffect(() => {
    if (open) {
      if (session?.user) {
        setName(session.user.name || "");
        setSelectedAvatar(session.user.image || "");
      }
      // Fetch fresh profile stats
      fetch("/api/user/profile")
        .then((r) => r.json())
        .then((data) => {
          if (data && !data.error) {
            setName(data.name || session?.user?.name || "");
            setSelectedAvatar(data.image || "");
            setProfileStats({
              totalLinks: data.stats?.totalLinks || 0,
              totalNotes: data.stats?.totalNotes || 0,
              createdAt: data.createdAt,
            });
          }
        })
        .catch(() => {});
    } else {
      // Reset sensitive form fields
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setShowPasswordSection(false);
    }
  }, [open, session]);

  // Handle local photo file upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Pilih berkas berupa gambar (JPG, PNG, WebP)", "Format Salah");
      return;
    }

    // Limit to 2MB
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Ukuran foto maksimal 2MB agar performa tetap cepat", "File Terlalu Besar");
      return;
    }

    setUploadingImage(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        setSelectedAvatar(result);
        setCustomAvatarUrl("");
        toast.success("Foto profil Anda siap disimpan!", "Foto Terpilih");
      }
      setUploadingImage(false);
    };
    reader.onerror = () => {
      toast.error("Gagal membaca berkas gambar", "Error");
      setUploadingImage(false);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Nama tidak boleh kosong", "Validasi");
      return;
    }

    if (showPasswordSection && newPassword) {
      if (!currentPassword) {
        toast.error("Masukkan kata sandi saat ini untuk mengubah kata sandi", "Validasi");
        return;
      }
      if (newPassword.length < 6) {
        toast.error("Kata sandi baru minimal 6 karakter", "Validasi");
        return;
      }
      if (newPassword !== confirmPassword) {
        toast.error("Konfirmasi kata sandi tidak cocok", "Validasi");
        return;
      }
    }

    setLoading(true);

    try {
      const avatarToSave = customAvatarUrl.trim() || selectedAvatar;

      const payload: any = {
        name: name.trim(),
        image: avatarToSave,
      };

      if (showPasswordSection && newPassword) {
        payload.currentPassword = currentPassword;
        payload.newPassword = newPassword;
      }

      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        // Update client-side next-auth session (hindari base64 besar di cookie)
        const safeImageForSession = payload.image && !payload.image.startsWith("data:") && payload.image.length < 500 
          ? payload.image 
          : undefined;

        await update({
          name: payload.name,
          image: safeImageForSession,
        });

        // Invalidate caches and trigger refresh across the whole app
        invalidateCache("/api/dashboard");
        window.dispatchEvent(new Event("refreshData"));

        toast.success("Profil Anda berhasil diperbarui!", "Berhasil Disimpan");
        onOpenChange(false);
      } else {
        toast.error(data.error || "Gagal memperbarui profil", "Error");
      }
    } catch (err: any) {
      toast.error(err?.message || "Terjadi kesalahan sistem", "Error");
    } finally {
      setLoading(false);
    }
  };

  const activeAvatar = customAvatarUrl.trim() || selectedAvatar || session?.user?.image;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[580px] max-h-[90vh] overflow-y-auto p-6 sm:p-8 rounded-3xl glass-panel border-primary/20 bg-card/95">
        <DialogHeader className="pb-4 border-b border-border/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
              <User className="h-5 w-5" />
            </div>
            <div className="text-left">
              <DialogTitle className="text-xl font-bold font-heading text-foreground">
                Pengaturan Profil Saya
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                Pilih avatar, unggah foto sendiri, dan sesuaikan identitas akun Anda.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSave} className="space-y-6 pt-4">
          {/* Avatar Preview & Selection */}
          <div className="space-y-3">
            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Foto / Avatar Profil
            </Label>

            {/* Active Preview Banner */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 rounded-2xl bg-foreground/[0.03] border border-border/50">
              {/* Active Avatar View */}
              <div className="relative w-18 h-18 rounded-2xl bg-background border-2 border-primary/40 shadow-md flex items-center justify-center overflow-hidden shrink-0 mx-auto sm:mx-0">
                {activeAvatar ? (
                  <img src={activeAvatar} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <User className="h-9 w-9 text-muted-foreground" />
                )}
                {uploadingImage && (
                  <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  </div>
                )}
              </div>

              {/* Upload & Reset Buttons */}
              <div className="flex-1 min-w-0 space-y-2 w-full text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    className="rounded-xl text-xs font-semibold gap-1.5 border-primary/30 hover:border-primary hover:bg-primary/10 cursor-pointer"
                  >
                    <Upload className="h-3.5 w-3.5 text-primary" />
                    Unggah Foto Sendiri
                  </Button>

                  {selectedAvatar && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedAvatar("");
                        setCustomAvatarUrl("");
                      }}
                      className="rounded-xl text-xs font-medium text-muted-foreground hover:text-foreground gap-1"
                    >
                      <RotateCcw className="h-3 w-3" /> Reset
                    </Button>
                  )}
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Gunakan foto asli Anda dari perangkat atau pilih salah satu karakter preset di bawah.
                </p>
              </div>
            </div>

            {/* Avatar Category Tabs */}
            <div className="space-y-2.5 pt-1">
              <div className="flex items-center gap-1.5 border-b border-border/50 pb-2">
                <button
                  type="button"
                  onClick={() => setAvatarTab("avatars")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    avatarTab === "avatars"
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground hover:bg-foreground/5"
                  }`}
                >
                  Pilih Avatar
                </button>
                <button
                  type="button"
                  onClick={() => setAvatarTab("custom")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    avatarTab === "custom"
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground hover:bg-foreground/5"
                  }`}
                >
                  Tautan URL
                </button>
              </div>

              {/* Avatar Presets */}
              {avatarTab === "avatars" && (
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5 pt-1">
                  {AVATARS.map((preset) => {
                    const isSelected = selectedAvatar === preset.url && !customAvatarUrl;
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => {
                          setSelectedAvatar(preset.url);
                          setCustomAvatarUrl("");
                        }}
                        className={`group relative rounded-2xl overflow-hidden border-2 transition-all p-1 flex flex-col items-center gap-1 bg-background/80 hover:bg-background cursor-pointer ${
                          isSelected
                            ? "border-primary scale-105 shadow-md ring-2 ring-primary/20"
                            : "border-border/60 hover:border-primary/50 opacity-85 hover:opacity-100"
                        }`}
                        title={preset.name}
                      >
                        <div className="w-11 h-11 rounded-xl overflow-hidden bg-muted/40 relative">
                          <img src={preset.url} alt={preset.name} className="w-full h-full object-cover" />
                          {isSelected && (
                            <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                              <Check className="h-4 w-4 text-primary stroke-[3]" />
                            </div>
                          )}
                        </div>
                        <span className="text-[10px] font-medium text-foreground/80 truncate w-full text-center">
                          {preset.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Custom URL Input */}
              {avatarTab === "custom" && (
                <div className="p-3 rounded-2xl bg-foreground/[0.02] border border-border/50 space-y-2">
                  <Label htmlFor="custom-avatar" className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                    <ImageIcon className="h-3.5 w-3.5 text-primary" /> Tempel URL Gambar Eksternal
                  </Label>
                  <Input
                    id="custom-avatar"
                    type="url"
                    value={customAvatarUrl}
                    onChange={(e) => {
                      setCustomAvatarUrl(e.target.value);
                      if (e.target.value) setSelectedAvatar("");
                    }}
                    placeholder="https://example.com/foto-anda.jpg"
                    className="rounded-xl text-xs bg-background/80"
                  />
                </div>
              )}
            </div>
          </div>

          {/* User Information */}
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="profile-name" className="text-xs font-semibold text-foreground">
                Nama Tampilan <span className="text-primary">*</span>
              </Label>
              <Input
                id="profile-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Masukkan nama lengkap / panggilan Anda"
                className="rounded-xl bg-background/60 border-border/60 focus:border-primary"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="profile-email" className="text-xs font-semibold text-foreground flex items-center justify-between">
                <span>Alamat Email</span>
                <span className="text-[10px] text-emerald-500 font-medium flex items-center gap-1">
                  <ShieldCheck className="h-3 w-3" /> Akun Terverifikasi
                </span>
              </Label>
              <Input
                id="profile-email"
                value={session?.user?.email || ""}
                disabled
                className="rounded-xl bg-muted/40 text-muted-foreground border-border/40 cursor-not-allowed text-xs font-mono"
              />
            </div>
          </div>

          {/* Account Quick Stats */}
          {profileStats && (
            <div className="grid grid-cols-3 gap-2.5 p-3 rounded-2xl bg-foreground/[0.02] border border-border/40 text-center">
              <div className="p-2">
                <div className="flex items-center justify-center gap-1 text-[11px] text-muted-foreground font-medium">
                  <Layers className="h-3 w-3 text-primary" /> Tautan
                </div>
                <div className="text-base font-bold font-sans tracking-tight tabular-nums text-foreground mt-0.5">
                  {profileStats.totalLinks}
                </div>
              </div>
              <div className="p-2 border-x border-border/40">
                <div className="flex items-center justify-center gap-1 text-[11px] text-muted-foreground font-medium">
                  <FileText className="h-3 w-3 text-accent" /> Catatan
                </div>
                <div className="text-base font-bold font-sans tracking-tight tabular-nums text-foreground mt-0.5">
                  {profileStats.totalNotes}
                </div>
              </div>
              <div className="p-2">
                <div className="flex items-center justify-center gap-1 text-[11px] text-muted-foreground font-medium">
                  <Calendar className="h-3 w-3 text-purple-400" /> Bergabung
                </div>
                <div className="text-[11px] font-semibold text-foreground mt-1 truncate">
                  {profileStats.createdAt ? new Date(profileStats.createdAt).toLocaleDateString("id-ID", { month: "short", year: "numeric" }) : "-"}
                </div>
              </div>
            </div>
          )}

          {/* Security & Password Section Toggle */}
          <div className="border-t border-border/50 pt-4">
            <button
              type="button"
              onClick={() => setShowPasswordSection(!showPasswordSection)}
              className="flex items-center justify-between w-full text-xs font-bold text-foreground/80 hover:text-primary transition-colors cursor-pointer py-1"
            >
              <div className="flex items-center gap-2">
                <KeyRound className="h-3.5 w-3.5 text-primary" />
                <span>Ubah Kata Sandi (Opsional)</span>
              </div>
              <span className="text-[11px] text-primary underline">
                {showPasswordSection ? "Sembunyikan" : "Buka Formulir"}
              </span>
            </button>

            {showPasswordSection && (
              <div className="mt-3 space-y-3 p-4 rounded-2xl bg-foreground/[0.02] border border-border/50">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Kata Sandi Saat Ini</Label>
                  <Input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Masukkan sandi lama"
                    className="rounded-xl text-xs bg-background/80"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Kata Sandi Baru</Label>
                    <Input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Min. 6 karakter"
                      className="rounded-xl text-xs bg-background/80"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Ulangi Sandi Baru</Label>
                    <Input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Ulangi sandi baru"
                      className="rounded-xl text-xs bg-background/80"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="pt-4 border-t border-border/50 flex flex-col sm:flex-row sm:justify-between items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                onOpenChange(false);
                window.dispatchEvent(new Event("restart-onboarding-tour"));
              }}
              className="text-xs font-semibold text-foreground hover:text-primary hover:border-primary/40 mr-auto flex items-center gap-2 rounded-xl border-border/80 px-3 py-2 bg-foreground/[0.02] hover:bg-primary/5 transition-all group cursor-pointer shadow-2xs"
              title="Mulai Ulang Panduan Penggunaan"
            >
              <div className="flex items-center gap-1.5 shrink-0">
                <div className="w-6 h-6 rounded-lg bg-primary/10 border border-primary/25 flex items-center justify-center text-primary group-hover:scale-105 transition-transform">
                  <Compass className="h-3.5 w-3.5" />
                </div>
                <div className="w-6 h-6 rounded-lg bg-cyan-500/10 border border-cyan-500/25 flex items-center justify-center text-cyan-400 group-hover:scale-105 transition-transform">
                  <BookOpen className="h-3 w-3" />
                </div>
              </div>
              <span>Panduan Penggunaan</span>
              <ArrowUpRight className="h-3 w-3 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Button>
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="rounded-xl text-xs font-semibold"
              >
                Batal
              </Button>
              <Button
                type="submit"
                disabled={loading || uploadingImage}
                className="rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                    Menyimpan...
                  </>
                ) : (
                  "Simpan Perubahan"
                )}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
