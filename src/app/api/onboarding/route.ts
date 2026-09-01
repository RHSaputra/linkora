import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

const CURRENT_ONBOARDING_VERSION = 1;

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({
        completed: true,
        version: CURRENT_ONBOARDING_VERSION,
        step: 0,
        dismissedAt: null,
        completedAt: null,
        currentVersion: CURRENT_ONBOARDING_VERSION,
      });
    }

    // Find or create onboarding record
    let onboarding = await prisma.userOnboarding.findUnique({
      where: { userId: session.user.id },
    });

    if (!onboarding) {
      onboarding = await prisma.userOnboarding.create({
        data: {
          userId: session.user.id,
          onboardingCompleted: false,
          onboardingVersion: 0,
          onboardingStep: 0,
        },
      });
    }

    return NextResponse.json({
      completed: onboarding.onboardingCompleted,
      version: onboarding.onboardingVersion,
      step: onboarding.onboardingStep,
      dismissedAt: onboarding.dismissedAt,
      completedAt: onboarding.completedAt,
      currentVersion: CURRENT_ONBOARDING_VERSION,
    });
  } catch (error) {
    console.error("GET /api/onboarding error:", error);
    // Fail gracefully — don't break the app
    return NextResponse.json({
      completed: true,
      version: CURRENT_ONBOARDING_VERSION,
      step: 0,
      dismissedAt: null,
      completedAt: null,
      currentVersion: CURRENT_ONBOARDING_VERSION,
    });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { step, completed, dismissed } = body;

    const updateData: Record<string, unknown> = {};

    if (typeof step === "number") {
      updateData.onboardingStep = step;
    }

    if (completed === true) {
      updateData.onboardingCompleted = true;
      updateData.onboardingVersion = CURRENT_ONBOARDING_VERSION;
      updateData.completedAt = new Date();
    }

    if (dismissed === true) {
      updateData.onboardingCompleted = true;
      updateData.onboardingVersion = CURRENT_ONBOARDING_VERSION;
      updateData.dismissedAt = new Date();
    }

    // Upsert: create if doesn't exist, update if it does
    const onboarding = await prisma.userOnboarding.upsert({
      where: { userId: session.user.id },
      create: {
        userId: session.user.id,
        ...updateData,
        onboardingCompleted: (updateData.onboardingCompleted as boolean) || false,
        onboardingVersion: (updateData.onboardingVersion as number) || 0,
        onboardingStep: (updateData.onboardingStep as number) || 0,
      },
      update: updateData,
    });

    return NextResponse.json({
      completed: onboarding.onboardingCompleted,
      version: onboarding.onboardingVersion,
      step: onboarding.onboardingStep,
    });
  } catch (error) {
    console.error("PATCH /api/onboarding error:", error);
    return NextResponse.json({ error: "Failed to update onboarding" }, { status: 500 });
  }
}
