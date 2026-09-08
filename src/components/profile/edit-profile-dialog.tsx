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
import { invalidateCache, dispatchRefresh } from "@/hooks/use-data";
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
      toast.error(locale === "en" ? "Select an image file (JPG, PNG, WebP)" : "Pilih berkas berupa gambar (JPG, PNG, WebP)", locale === "en" ? "Invalid Format" : "Format Salah");
      return;
    }

    // Limit to 2MB
    if (file.size > 2 * 1024 * 1024) {
      toast.error(locale === "en" ? "Max photo size is 2MB for fast performance" : "Ukuran foto maksimal 2MB agar performa tetap cepat", locale === "en" ? "File Too Large" : "File Terlalu Besar");
      return;
    }

    setUploadingImage(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        setSelectedAvatar(result);
        setCustomAvatarUrl("");
        toast.success(locale === "en" ? "Your profile photo is ready to save!" : "Foto profil Anda siap disimpan!", locale === "en" ? "Photo Selected" : "Foto Terpilih");
      }
      setUploadingImage(false);
    };
    reader.onerror = () => {
      toast.error(locale === "en" ? "Failed to read image file" : "Gagal membaca berkas gambar", "Error");
      setUploadingImage(false);
    };
    reader.readAsDataURL(file);
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

        // Profile text is sourced from the session, so no data list needs re-fetch.
        invalidateCache("/api/dashboard");
        dispatchRefresh([]);

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

  const activeAvatar = customAvatarUrl.trim() || selectedAvatar || session?.user?.image;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100vw-1.5rem)] sm:max-w-[580px] max-h-[90vh] overflow-y-auto p-4 sm:p-8 rounded-2xl sm:rounded-3xl glass-panel border-primary/20 bg-card/95">
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

        <form onSubmit={handleSave} className="space-y-6 pt-4">
          {/* Avatar Preview & Selection */}
          <div className="space-y-3">
            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              {locale === "en" ? "Profile Photo / Avatar" : "Foto / Avatar Profil"}
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
                    {t("profile.uploadPhotoBtn")}
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
                      <RotateCcw className="h-3 w-3" /> {t("profile.resetPhotoBtn")}
                    </Button>
                  )}
                </div>
                <p className="text-[11px] text-muted-foreground">
                  {t("profile.photoHelpText")}
                </p>
              </div>
            </div>

            {/* Avatar Category Tabs */}
            <div className="space-y-2.5 pt-1">
              <div className="flex items-center gap-1.5 border-b border-border/50 pb-2">
                <button
                  type="button"
                  onClick={() => setAvatarTab("avatars")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-150 active:scale-95 touch-manipulation cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                    avatarTab === "avatars"
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground hover:bg-foreground/5"
                  }`}
                >
                  {t("profile.avatarTabPreset")}
                </button>
                <button
                  type="button"
                  onClick={() => setAvatarTab("custom")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-150 active:scale-95 touch-manipulation cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                    avatarTab === "custom"
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground hover:bg-foreground/5"
                  }`}
                >
                  {t("profile.avatarTabCustom")}
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
                    <ImageIcon className="h-3.5 w-3.5 text-primary" /> {locale === "en" ? "Paste External Image URL" : "Tempel URL Gambar Eksternal"}
                  </Label>
                  <Input
                    id="custom-avatar"
                    type="url"
                    value={customAvatarUrl}
                    onChange={(e) => {
                      setCustomAvatarUrl(e.target.value);
                      if (e.target.value) setSelectedAvatar("");
                    }}
                    placeholder={locale === "en" ? "https://example.com/your-photo.jpg" : "https://example.com/foto-anda.jpg"}
                    className="rounded-xl text-base sm:text-xs bg-background/80"
                  />
                </div>
              )}
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
                className="rounded-xl bg-background/60 border-border/60 focus:border-primary text-base sm:text-sm"
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
                className="rounded-xl bg-muted/40 text-muted-foreground border-border/40 cursor-not-allowed text-xs font-mono"
              />
            </div>
          </div>

          {/* Account Quick Stats */}
          {profileStats && (
            <div className="grid grid-cols-3 gap-2.5 p-3 rounded-2xl bg-foreground/[0.02] border border-border/40 text-center">
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
              <div className="mt-3 space-y-3 p-4 rounded-2xl bg-foreground/[0.02] border border-border/50">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">{t("profile.currentPasswordLabel")}</Label>
                  <Input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder={t("profile.currentPasswordPlaceholder")}
                    className="rounded-xl text-base sm:text-xs bg-background/80"
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
                      className="rounded-xl text-base sm:text-xs bg-background/80"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">{t("profile.confirmPasswordLabel")}</Label>
                    <Input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder={t("profile.confirmPasswordPlaceholder")}
                      className="rounded-xl text-base sm:text-xs bg-background/80"
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
              className="text-xs font-semibold text-foreground hover:text-primary hover:border-primary/40 mr-auto flex items-center gap-2 rounded-xl border-border/80 px-3 py-2 bg-foreground/[0.02] hover:bg-primary/5 active:scale-95 transition-all duration-150 group cursor-pointer shadow-2xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
