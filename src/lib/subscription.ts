import { prisma } from "@/lib/prisma";

export const OWNER_EMAIL = "rahmatsaputra7818@gmail.com";
export const PREMIUM_RESEARCH_PLAN_ID = "premium_research_monthly";
export const PREMIUM_RESEARCH_PRICE = 25000;

export type EntitlementStatus =
  | "UNLIMITED"
  | "PREMIUM"
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
      message: "Pengguna belum login. Silakan masuk untuk berlangganan Premium Rp 25.000 / bulan.",
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
    },
  });

  if (!user) {
    return {
      ok: true,
      authenticated: true,
      isOwner: false,
      status: "EXPIRED",
      hasAccess: false,
      trialClaimed: false,
      trialDaysLeft: 0,
      subscriptionEndsAt: null,
      trialEndsAt: null,
      message: "Fitur Riset wajib berlangganan Paket Premium Rp 25.000 / bulan.",
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
      trialEndsAt: null,
      message: `Status Premium Aktif (Sisa ${daysLeft} Hari).`,
    };
  }

  // 4. Non-Premium User (Mandatory Paid Requirement)
  return {
    ok: true,
    authenticated: true,
    isOwner: false,
    status: "EXPIRED",
    hasAccess: false,
    trialClaimed: false,
    trialDaysLeft: 0,
    subscriptionEndsAt: user.subscriptionEndsAt,
    trialEndsAt: null,
    message: "Fitur Riset wajib berlangganan Paket Premium Rp 25.000 / bulan.",
  };
}
