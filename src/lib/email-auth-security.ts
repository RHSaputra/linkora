import crypto from "crypto";

/**
 * Generate a cryptographically secure 6-digit numeric OTP
 */
export function generateSecureOtp(): string {
  const otpNumber = crypto.randomInt(100000, 1000000);
  return otpNumber.toString();
}

/**
 * Hash an OTP using SHA-256 for secure database storage
 */
export function hashOtp(otp: string): string {
  return crypto.createHash("sha256").update(otp.trim()).digest("hex");
}

/**
 * Verify an incoming OTP against its stored SHA-256 hash using timing-safe comparison
 */
export function verifyOtpHash(plainOtp: string, storedHash: string): boolean {
  const incomingHash = hashOtp(plainOtp);
  try {
    const a = Buffer.from(incomingHash, "hex");
    const b = Buffer.from(storedHash, "hex");
    if (a.length !== b.length) return false;
    return crypto.timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

/**
 * Generate a cryptographically secure random reset token (64 hex characters)
 */
export function generateResetToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

/**
 * Hash a reset token using SHA-256 for secure database storage
 */
export function hashResetToken(token: string): string {
  return crypto.createHash("sha256").update(token.trim()).digest("hex");
}

/**
 * Verify an incoming reset token against its stored SHA-256 hash using timing-safe comparison
 */
export function verifyResetTokenHash(plainToken: string, storedHash: string): boolean {
  const incomingHash = hashResetToken(plainToken);
  try {
    const a = Buffer.from(incomingHash, "hex");
    const b = Buffer.from(storedHash, "hex");
    if (a.length !== b.length) return false;
    return crypto.timingSafeEqual(a, b);
  } catch {
    return false;
  }
}
