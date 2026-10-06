import { prisma } from "@/lib/prisma";

export const OWNER_EMAIL = "rahmatsaputra7818@gmail.com";
export const PREMIUM_RESEARCH_PLAN_ID = "premium_research_monthly";
export const PREMIUM_RESEARCH_PRICE = 25000;

export type EntitlementStatus =
  | "UNLIMITED"
  | "PREMIUM"
  | "TRIAL_ACTIVE"
  | "TRIAL_AVAILABLE"
  | "EXPIRED"
  | "GUEST";

export interface EntitlementCheckResult {
  ok: boolean;
  authenticated: boolean;
  isOwner: boolean;
  status: EntitlementStatus;
  hasAccess: boolean;
  trialClaimed: boolean;
  trialDaysLeft: number;
  subscriptionEndsAt: Date | null;
  trialEndsAt: Date | null;
  message: string;
}

export async function getUserEntitlement(email?: string | null): Promise<EntitlementCheckResult> {
  if (!email) {
    return {
      ok: true,
      authenticated: false,
      isOwner: false,
      status: "GUEST",
      hasAccess: false,
      trialClaimed: false,
      trialDaysLeft: 0,
      subscriptionEndsAt: null,
      trialEndsAt: null,
      message: "Pengguna belum login. Silakan masuk untuk mengakses fitur Riset.",
    };
  }

  const normalizedEmail = email.toLowerCase().trim();

  // 1. Owner Web: rahmatsaputra7818@gmail.com -> UNLIMITED SELAMANYA
  if (normalizedEmail === OWNER_EMAIL) {
    return {
      ok: true,
      authenticated: true,
      isOwner: true,
      status: "UNLIMITED",
      hasAccess: true,
      trialClaimed: true,
      trialDaysLeft: 99999,
      subscriptionEndsAt: null,
      trialEndsAt: null,
      message: "Akun Pemilik Website (Akses Bebas Unlimited Selamanya).",
    };
  }

  // 2. Query user record from Prisma
  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
    select: {
      id: true,
      createdAt: true,
      subscriptionPlan: true,
      subscriptionEndsAt: true,
      trialEndsAt: true,
      trialClaimedAt: true,
    },
  });

  if (!user) {
    return {
      ok: true,
      authenticated: true,
      isOwner: false,
      status: "TRIAL_AVAILABLE",
      hasAccess: false,
      trialClaimed: false,
      trialDaysLeft: 30,
      subscriptionEndsAt: null,
      trialEndsAt: null,
      message: "Akun Anda berhak klaim Uji Coba Gratis 30 Hari. Silakan klik Klaim Trial.",
    };
  }

  const now = new Date();

  // 3. Active Premium Subscription (via Duitku)
  if (user.subscriptionPlan === "PREMIUM" && user.subscriptionEndsAt && user.subscriptionEndsAt > now) {
    const daysLeft = Math.ceil((user.subscriptionEndsAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return {
      ok: true,
      authenticated: true,
      isOwner: false,
      status: "PREMIUM",
      hasAccess: true,
      trialClaimed: true,
      trialDaysLeft: daysLeft,
      subscriptionEndsAt: user.subscriptionEndsAt,
      trialEndsAt: user.trialEndsAt,
      message: `Status Premium Aktif (Sisa ${daysLeft} Hari).`,
    };
  }

  // 4. Active Trial Check (Must have been explicitly claimed)
  if (user.trialClaimedAt && user.trialEndsAt && user.trialEndsAt > now) {
    const daysLeft = Math.ceil((user.trialEndsAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return {
      ok: true,
      authenticated: true,
      isOwner: false,
      status: "TRIAL_ACTIVE",
      hasAccess: true,
      trialClaimed: true,
      trialDaysLeft: daysLeft,
      subscriptionEndsAt: null,
      trialEndsAt: user.trialEndsAt,
      message: `Uji Coba Gratis Aktif (Sisa ${daysLeft} Hari).`,
    };
  }

  // 5. Unclaimed Trial Check
  if (!user.trialClaimedAt) {
    return {
      ok: true,
      authenticated: true,
      isOwner: false,
      status: "TRIAL_AVAILABLE",
      hasAccess: false,
      trialClaimed: false,
      trialDaysLeft: 30,
      subscriptionEndsAt: null,
      trialEndsAt: null,
      message: "Uji Coba Gratis 30 Hari belum diklaim. Silakan klaim sekarang.",
    };
  }

  // 6. Expired Trial & Expired Subscription
  return {
    ok: true,
    authenticated: true,
    isOwner: false,
    status: "EXPIRED",
    hasAccess: false,
    trialClaimed: true,
    trialDaysLeft: 0,
    subscriptionEndsAt: user.subscriptionEndsAt,
    trialEndsAt: user.trialEndsAt,
    message: "Masa Uji Coba Gratis telah berakhir. Silakan berlangganan Premium Rp 25.000 / bulan.",
  };
}

export async function claimUserTrial(email: string) {
  const normalizedEmail = email.toLowerCase().trim();

  return await prisma.$transaction(async (tx) => {
    const user = await tx.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      throw new Error("Pengguna tidak ditemukan.");
    }

    if (user.trialClaimedAt) {
      throw new Error("Anda sudah pernah mengklaim Uji Coba Gratis sebelumnya.");
    }

    const now = new Date();
    const trialEndsAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    const updated = await tx.user.update({
      where: { email: normalizedEmail },
      data: {
        subscriptionPlan: "TRIAL",
        trialClaimedAt: now,
        trialEndsAt,
      },
    });

    return updated;
  });
}
