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
import { invalidateAndRefresh, dispatchRefresh } from "@/hooks/use-data";
import { useTranslation } from "@/components/providers/i18n-provider";
import { LanguageSwitcher } from "@/components/ui/language-switcher";

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

// Downscale image using HTML5 Canvas to keep data size small (~20-40KB) and fast
function resizeImage(file: File, maxWidth = 400, maxHeight = 400, quality = 0.88): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (readerEvent) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(readerEvent.target?.result as string);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL("image/jpeg", quality);
        resolve(dataUrl);
      };
      img.onerror = () => {
        resolve(readerEvent.target?.result as string);
      };
      img.src = readerEvent.target?.result as string;
    };
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

interface EditProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditProfileDialog({ open, onOpenChange }: EditProfileDialogProps) {
  const { data: session, update } = useSession();
  const { t, locale } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState<string>("");
  const [chosenPresetUrl, setChosenPresetUrl] = useState<string | null>(null);

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
      setChosenPresetUrl(null);
      if (session?.user) {
        setName(session.user.name || "");
        setSelectedAvatar(session.user.image || "");
      }
      // Fetch fresh profile stats
      fetch(`/api/user/profile?t=${Date.now()}`, { cache: "no-store" })
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
      // Reset sensitive form fields & preset selection
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setShowPasswordSection(false);
      setChosenPresetUrl(null);
    }
  }, [open, session]);

  // Handle local photo file upload
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error(
        locale === "en" ? "Select an image file (JPG, PNG, WebP)" : "Pilih berkas berupa gambar (JPG, PNG, WebP)",
        locale === "en" ? "Invalid Format" : "Format Salah"
      );
      return;
    }

    // Limit original input size to 10MB (canvas will compress to ~30KB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error(
        locale === "en" ? "Max photo size is 10MB" : "Ukuran foto maksimal 10MB",
        locale === "en" ? "File Too Large" : "File Terlalu Besar"
      );
      return;
    }

    setUploadingImage(true);
    try {
      const resized = await resizeImage(file, 400, 400, 0.88);
      setSelectedAvatar(resized);
      setChosenPresetUrl(null);
      toast.success(
        locale === "en" ? "Your profile photo is ready to save!" : "Foto profil Anda siap disimpan!",
        locale === "en" ? "Photo Selected" : "Foto Terpilih"
      );
    } catch {
      toast.error(locale === "en" ? "Failed to read image file" : "Gagal membaca berkas gambar", "Error");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error(locale === "en" ? "Display name cannot be empty" : "Nama tidak boleh kosong", locale === "en" ? "Validation" : "Validasi");
      return;
    }

    if (showPasswordSection && newPassword) {
      if (!currentPassword) {
        toast.error(locale === "en" ? "Enter your current password to change password" : "Masukkan kata sandi saat ini untuk mengubah kata sandi", locale === "en" ? "Validation" : "Validasi");
        return;
      }
      if (newPassword.length < 6) {
        toast.error(locale === "en" ? "New password must be at least 6 characters" : "Kata sandi baru minimal 6 karakter", locale === "en" ? "Validation" : "Validasi");
        return;
      }
      if (newPassword !== confirmPassword) {
        toast.error(locale === "en" ? "Password confirmation does not match" : "Konfirmasi kata sandi tidak cocok", locale === "en" ? "Validation" : "Validasi");
        return;
      }
    }

    setLoading(true);

    try {
      const avatarToSave = selectedAvatar;

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
        const uId = session?.user?.id || "";
        // If data URL, use the tiny avatar endpoint to avoid blowing up cookie size
        const effectiveAvatarForSession = payload.image
          ? payload.image.startsWith("data:") || payload.image.length >= 300
            ? `/api/user/avatar?userId=${uId}&t=${Date.now()}`
            : payload.image
          : null;

        await update({
          name: payload.name,
          image: effectiveAvatarForSession,
        });

        // Broadcast profile update event across the entire app for instant 0ms sync
        if (typeof window !== "undefined") {
          try {
            localStorage.setItem(
              "linkora_cached_profile",
              JSON.stringify({
                name: payload.name,
                image: payload.image,
              })
            );
          } catch {}
          window.dispatchEvent(
            new CustomEvent("linkora_profile_updated", {
              detail: {
                name: payload.name,
                image: payload.image,
              },
            })
          );
        }

        dispatchRefresh(["dashboard"], false);

        toast.success(locale === "en" ? "Your profile has been updated successfully!" : "Profil Anda berhasil diperbarui!", locale === "en" ? "Saved Successfully" : "Berhasil Disimpan");
        onOpenChange(false);
      } else {
        toast.error(data.error || (locale === "en" ? "Failed to update profile" : "Gagal memperbarui profil"), "Error");
      }
    } catch (err: any) {
      toast.error(err?.message || (locale === "en" ? "System error occurred" : "Terjadi kesalahan sistem"), "Error");
    } finally {
      setLoading(false);
    }
  };

  const activeAvatar = selectedAvatar || session?.user?.image;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100vw-1.5rem)] sm:max-w-[680px] md:max-w-[740px] max-h-[90vh] overflow-y-auto p-6 sm:p-8 rounded-2xl sm:rounded-3xl border border-primary/20 bg-white dark:bg-slate-900 shadow-2xl backdrop-blur-2xl space-y-5">
        <DialogHeader className="pb-4 border-b border-border/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
              <User className="h-5 w-5" />
            </div>
            <div className="text-left">
              <DialogTitle className="text-xl font-bold font-heading text-foreground">
                {t("profile.title")}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                {t("profile.subtitle")}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSave} className="flex flex-col flex-1 min-h-0">
          <div className="space-y-6 flex-1 overflow-y-auto pr-1 py-4">
          {/* Avatar Preview & Selection */}
          <div className="space-y-3">
            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              {locale === "en" ? "Profile Photo / Avatar" : "Foto / Avatar Profil"}
            </Label>

            {/* Active Preview Banner */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-primary/20 shadow-xs">
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
                    {t("profile.uploadPhotoBtn")}
                  </Button>

                  {selectedAvatar && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedAvatar("");
                        setChosenPresetUrl(null);
                      }}
                      className="rounded-xl text-xs font-medium text-muted-foreground hover:text-foreground gap-1"
                    >
                      <RotateCcw className="h-3 w-3" /> {t("profile.resetPhotoBtn")}
                    </Button>
                  )}
                </div>
                <p className="text-[11px] text-muted-foreground">
                  {t("profile.photoHelpText")}
                </p>
              </div>
            </div>

            {/* Avatar Presets Grid */}
            <div className="space-y-2 pt-1">
              <Label className="text-xs font-semibold text-muted-foreground">
                {t("profile.avatarTabPreset")}
              </Label>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5 pt-1">
                {AVATARS.map((preset) => {
                  const isSelected = chosenPresetUrl === preset.url;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => {
                        setSelectedAvatar(preset.url);
                        setChosenPresetUrl(preset.url);
                      }}
                      className={`group relative rounded-2xl overflow-hidden border-2 transition-all p-1 flex flex-col items-center gap-1 bg-white dark:bg-slate-800/90 hover:bg-primary/5 cursor-pointer shadow-2xs ${
                        isSelected
                          ? "border-primary scale-105 shadow-md ring-2 ring-primary/25"
                          : "border-border/60 hover:border-primary/50"
                      }`}
                      title={preset.name}
                    >
                      <div className="w-11 h-11 rounded-xl overflow-hidden bg-primary/5 relative">
                        <img src={preset.url} alt={preset.name} className="w-full h-full object-cover" />
                        {isSelected && (
                          <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                            <Check className="h-4 w-4 text-primary stroke-[3]" />
                          </div>
                        )}
                      </div>
                      <span className="text-[10px] font-semibold text-foreground truncate w-full text-center">
                        {preset.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* User Information */}
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="profile-name" className="text-xs font-semibold text-foreground">
                {t("profile.nameLabel")} <span className="text-primary">*</span>
              </Label>
              <Input
                id="profile-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t("profile.namePlaceholder")}
                className="rounded-xl bg-white dark:bg-slate-800/90 border-border/80 focus:border-primary text-base sm:text-sm shadow-2xs"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="profile-email" className="text-xs font-semibold text-foreground flex items-center justify-between">
                <span>{t("profile.emailLabel")}</span>
                <span className="text-[10px] text-emerald-500 font-medium flex items-center gap-1">
                  <ShieldCheck className="h-3 w-3" /> {t("profile.verifiedBadge")}
                </span>
              </Label>
              <Input
                id="profile-email"
                value={session?.user?.email || ""}
                disabled
                className="rounded-xl bg-slate-100 dark:bg-slate-800/50 text-muted-foreground border-border/40 cursor-not-allowed text-xs font-mono"
              />
            </div>
          </div>

          {/* Account Quick Stats */}
          {profileStats && (
            <div className="grid grid-cols-3 gap-2.5 p-3 rounded-2xl bg-gradient-to-r from-primary/10 via-accent/10 to-purple-500/10 border border-primary/20 text-center shadow-xs">
              <div className="p-2">
                <div className="flex items-center justify-center gap-1 text-[11px] text-muted-foreground font-medium">
                  <Layers className="h-3 w-3 text-primary" /> {t("profile.statsLinks")}
                </div>
                <div className="text-base font-bold font-sans tracking-tight tabular-nums text-foreground mt-0.5">
                  {profileStats.totalLinks}
                </div>
              </div>
              <div className="p-2 border-x border-border/40">
                <div className="flex items-center justify-center gap-1 text-[11px] text-muted-foreground font-medium">
                  <FileText className="h-3 w-3 text-accent" /> {t("profile.statsNotes")}
                </div>
                <div className="text-base font-bold font-sans tracking-tight tabular-nums text-foreground mt-0.5">
                  {profileStats.totalNotes}
                </div>
              </div>
              <div className="p-2">
                <div className="flex items-center justify-center gap-1 text-[11px] text-muted-foreground font-medium">
                  <Calendar className="h-3 w-3 text-purple-400" /> {t("profile.statsJoined")}
                </div>
                <div className="text-[11px] font-semibold text-foreground mt-1 truncate">
                  {profileStats.createdAt ? new Date(profileStats.createdAt).toLocaleDateString(locale === "en" ? "en-US" : "id-ID", { month: "short", year: "numeric" }) : "-"}
                </div>
              </div>
            </div>
          )}

          {/* Language Preference Section */}
          <div className="border-t border-border/50 pt-4">
            <LanguageSwitcher variant="select" />
          </div>

          {/* Security & Password Section Toggle */}
          <div className="border-t border-border/50 pt-4">
            <button
              type="button"
              onClick={() => setShowPasswordSection(!showPasswordSection)}
              className="flex items-center justify-between w-full text-xs font-bold text-foreground/80 hover:text-primary transition-colors cursor-pointer py-1"
            >
              <div className="flex items-center gap-2">
                <KeyRound className="h-3.5 w-3.5 text-primary" />
                <span>{t("profile.changePasswordTitle")}</span>
              </div>
              <span className="text-[11px] text-primary underline">
                {showPasswordSection ? t("profile.hideForm") : t("profile.showForm")}
              </span>
            </button>

            {showPasswordSection && (
              <div className="mt-3 space-y-3 p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-primary/20 shadow-xs">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">{t("profile.currentPasswordLabel")}</Label>
                  <Input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder={t("profile.currentPasswordPlaceholder")}
                    className="rounded-xl text-base sm:text-xs bg-white dark:bg-slate-800/90 border-border/80"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">{t("profile.newPasswordLabel")}</Label>
                    <Input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder={t("profile.newPasswordPlaceholder")}
                      className="rounded-xl text-base sm:text-xs bg-white dark:bg-slate-800/90 border-border/80"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">{t("profile.confirmPasswordLabel")}</Label>
                    <Input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder={t("profile.confirmPasswordPlaceholder")}
                      className="rounded-xl text-base sm:text-xs bg-white dark:bg-slate-800/90 border-border/80"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="pt-4 border-t border-border/50 shrink-0 flex flex-col sm:flex-row sm:justify-between items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                onOpenChange(false);
                window.dispatchEvent(new Event("restart-onboarding-tour"));
              }}
              className="text-xs font-semibold text-foreground hover:text-primary hover:border-primary/40 mr-auto flex items-center gap-2 rounded-xl border-primary/20 px-3 py-2 bg-white dark:bg-slate-800/80 hover:bg-primary/5 active:scale-95 transition-all duration-150 group cursor-pointer shadow-2xs"
              title={t("profile.tourGuideBtn")}
            >
              <Compass className="h-4 w-4 text-primary group-hover:rotate-45 transition-transform shrink-0" />
              <span>{t("profile.tourGuideBtn")}</span>
              <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Button>
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="rounded-xl text-xs font-semibold"
              >
                {t("common.cancel")}
              </Button>
              <Button
                type="submit"
                disabled={loading || uploadingImage}
                className="rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                    {t("common.saving")}
                  </>
                ) : (
                  t("common.saveChanges")
                )}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
