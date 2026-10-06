"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { GraduationCap, Check, Crown, Zap, ArrowRight, ShieldCheck } from "lucide-react";
import { LinkoraText } from "@/components/ui/linkora-text";

export function PricingPromoSection() {
  const { data: session } = useSession();

  return (
    <section className="py-20 px-4 relative overflow-hidden bg-background border-t border-border/60">
      {/* Subtle Glow Background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-5xl mx-auto relative z-10">
        <div className="text-center space-y-4 mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs font-bold mx-auto">
            <Crown className="w-4 h-4 text-amber-500" />
            <span>Paket Premium Riset Ilmiah</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-extrabold font-heading text-foreground tracking-tight">
            Akses 5 Mesin Riset Dunia Hanya <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-500">Rp 25.000 / Bulan</span>
          </h2>

          <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Dapatkan referensi jurnal terakreditasi dari Elsevier Scopus, SINTA, GARUDA, Google Scholar, dan Semantic Scholar langsung dalam ruang kerja <LinkoraText /> Anda.
          </p>
        </div>

        {/* Single Centered Premium Pricing Card */}
        <div className="max-w-lg mx-auto">
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-amber-500/40 bg-gradient-to-b from-amber-500/[0.06] to-transparent flex flex-col justify-between space-y-6 relative overflow-hidden shadow-2xl ring-1 ring-amber-500/20">
            <div className="absolute top-0 right-0 px-4 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-black uppercase tracking-wider rounded-bl-2xl shadow-sm">
              Wajib Berlangganan
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 text-xs font-bold flex items-center gap-1.5">
                  <Crown className="w-3.5 h-3.5 text-amber-500" />
                  <span>Akses Premium Riset</span>
                </span>
              </div>

              <div>
                <h3 className="text-xl font-bold text-foreground">Paket Riset Akademik</h3>
                <p className="text-xs text-muted-foreground mt-1">Akses penuh ke pencarian 5 mesin riset & simpan referensi jurnal ke Linkora.</p>
              </div>

              <div className="flex items-baseline gap-1 pt-2">
                <span className="text-3 font-black text-amber-600 dark:text-amber-400 text-4xl">Rp 25.000</span>
                <span className="text-xs text-muted-foreground font-semibold"> / bulan</span>
              </div>

              <hr className="border-amber-500/20" />

              <ul className="space-y-2.5 text-xs text-foreground/90 font-medium">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>Pencarian Unlimited 5 Mesin Riset Utama (Scopus, SINTA, GARUDA, Scholar, Semantic)</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>Simpan Referensi Jurnal ke Bookmark Workspace Linkora</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>Pembayaran Instan via QRIS, Virtual Account & E-Wallet Duitku</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>Aktif Otomatis Segera Setelah Pembayaran Berhasil</span>
                </li>
              </ul>
            </div>

            <div className="pt-4">
              {session?.user ? (
                <Link
                  href="/scopus"
                  className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 active:scale-95 transition-all"
                >
                  <span>Berlangganan Rp 25.000 / Bulan</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              ) : (
                <Link
                  href="/login"
                  className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 active:scale-95 transition-all"
                >
                  <span>Masuk & Berlangganan Premium</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              )}
            </div>
          </div>
        </div>

        <div className="mt-8 text-center flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <ShieldCheck className="w-4 h-4 text-primary" />
          <span>Pembayaran Aman Diterima via QRIS, BCA, Mandiri, BRI & E-Wallet Duitku</span>
        </div>
      </div>
    </section>
  );
}
