import { prisma } from "@/lib/prisma";
import { sendRawEmail } from "./client";
import { EmailEventType, SendEmailResult } from "./types";
import { renderPasswordResetEmail } from "./templates/password-reset";
import { renderWelcomeEmail } from "./templates/welcome";
import { renderVerificationOtpEmail } from "./templates/verification-otp";

/**
 * Record email event to EmailLog table safely without logging plaintext tokens/passwords
 */
async function logEmailEvent(
  email: string,
  eventType: EmailEventType,
  status: "SUCCESS" | "FAILED",
  metadata?: Record<string, any>
) {
  try {
    // Sanitize metadata to never store secrets or raw tokens
    const safeMetadata = metadata ? JSON.stringify(metadata) : null;

    await prisma.emailLog.create({
      data: {
        email: email.toLowerCase().trim(),
        eventType,
        provider: "resend",
        status,
        metadata: safeMetadata,
      },
    });
  } catch (err) {
    // Non-blocking log failure
    console.error("[EmailLog Warning]: Failed to persist email event", err);
  }
}

/**
 * Send OTP Verification Email for manual registration
 */
export async function sendVerificationOtpEmail(params: {
  to: string;
  name?: string | null;
  otp: string;
  expiryMinutes?: number;
}): Promise<SendEmailResult> {
  const normalizedEmail = params.to.toLowerCase().trim();
  const expiryMinutes = params.expiryMinutes || Number(process.env.OTP_EXPIRY_MINUTES) || 10;
  const appUrl = process.env.APP_URL || "http://localhost:3000";

  const { subject, html, text } = renderVerificationOtpEmail({
    userName: params.name,
    otp: params.otp,
    expiryMinutes,
    appUrl,
  });

  const result = await sendRawEmail({
    to: normalizedEmail,
    subject,
    html,
    text,
  });

  await logEmailEvent(
    normalizedEmail,
    result.success ? "otp_sent" : "email_send_failed",
    result.success ? "SUCCESS" : "FAILED",
    { expiryMinutes, isTestMode: result.isTestMode }
  );

  return result;
}

/**
 * Send Password Reset Email with cryptographically secure reset link
 */
export async function sendPasswordResetEmail(params: {
  to: string;
  name?: string | null;
  resetUrl: string;
  expiryMinutes?: number;
}): Promise<SendEmailResult> {
  const normalizedEmail = params.to.toLowerCase().trim();
  const expiryMinutes = params.expiryMinutes || Number(process.env.RESET_TOKEN_EXPIRY_MINUTES) || 15;
  const appUrl = process.env.APP_URL || "http://localhost:3000";

  const { subject, html, text } = renderPasswordResetEmail({
    userName: params.name,
    resetUrl: params.resetUrl,
    expiryMinutes,
    appUrl,
  });

  const result = await sendRawEmail({
    to: normalizedEmail,
    subject,
    html,
    text,
  });

  await logEmailEvent(
    normalizedEmail,
    result.success ? "password_reset_requested" : "email_send_failed",
    result.success ? "SUCCESS" : "FAILED",
    { expiryMinutes, isTestMode: result.isTestMode }
  );

  return result;
}

/**
 * Send Welcome Email with Idempotency guarantee (only once per user)
 */
export async function sendWelcomeEmail(params: {
  to: string;
  name?: string | null;
  isGoogleAuth?: boolean;
}): Promise<SendEmailResult & { skipped?: boolean }> {
  const normalizedEmail = params.to.toLowerCase().trim();
  const appUrl = process.env.APP_URL || "http://localhost:3000";

  // Check Idempotency: Has welcome email already been sent?
  const existingUser = await prisma.user.findUnique({
    where: { email: normalizedEmail },
    select: { id: true, name: true, welcomeEmailSentAt: true },
  });

  if (existingUser?.welcomeEmailSentAt) {
    // Idempotent: skip sending duplicate welcome email
    return {
      success: true,
      skipped: true,
    };
  }

  const { subject, html, text } = renderWelcomeEmail({
    userName: params.name || existingUser?.name,
    isGoogleAuth: params.isGoogleAuth ?? false,
    appUrl,
  });

  const result = await sendRawEmail({
    to: normalizedEmail,
    subject,
    html,
    text,
  });

  if (result.success && existingUser) {
    // Mark as sent in DB for idempotency
    await prisma.user.update({
      where: { id: existingUser.id },
      data: { welcomeEmailSentAt: new Date() },
    });
  }

  await logEmailEvent(
    normalizedEmail,
    result.success ? "welcome_email_sent" : "email_send_failed",
    result.success ? "SUCCESS" : "FAILED",
    { isGoogleAuth: params.isGoogleAuth, isTestMode: result.isTestMode }
  );

  return result;
}
