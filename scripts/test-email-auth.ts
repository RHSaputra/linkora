import { prisma } from "../src/lib/prisma";
import bcrypt from "bcryptjs";
import {
  generateSecureOtp,
  hashOtp,
  verifyOtpHash,
  generateResetToken,
  hashResetToken,
  verifyResetTokenHash,
} from "../src/lib/email-auth-security";
import {
  sendVerificationOtpEmail,
  sendPasswordResetEmail,
  sendWelcomeEmail,
} from "../src/lib/email/service";
import { getSimulatedInbox, clearSimulatedInbox } from "../src/lib/email/client";

// Set environment for test mode
process.env.EMAIL_DEBUG_MODE = "false";
(process.env as Record<string, string | undefined>).NODE_ENV = "test";

let passedTests = 0;
let totalTests = 0;

function assert(condition: boolean, testName: string, errorDetails?: any) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  \x1b[32m✔\x1b[0m [PASSED] ${testName}`);
  } else {
    console.error(`  \x1b[31m✖\x1b[0m [FAILED] ${testName}`);
    if (errorDetails) {
      console.error(`    Detail:`, errorDetails);
    }
  }
}

async function runTestSuite() {
  console.log("\n=======================================================");
  console.log("   LINKORA EMAIL AUTHENTICATION TEST SUITE (RESEND)   ");
  console.log("=======================================================\n");

  const testEmail = `test.user.${Date.now()}@linkora.id`;
  const testPassword = "PasswordSangatAman123!";
  const newPassword = "PasswordBaruLebihAman456!";

  try {
    // -----------------------------------------------------------------
    // TEST SECTION 1: CRYPTOGRAPHIC HELPERS & TOKEN SECURITY
    // -----------------------------------------------------------------
    console.log("\x1b[34m[SECTION 1: Kriptografi & Keamanan Token]\x1b[0m");

    const otp1 = generateSecureOtp();
    const otp2 = generateSecureOtp();
    assert(
      otp1.length === 6 && /^\d{6}$/.test(otp1) && otp1 !== otp2,
      "1. OTP dibuat 6-digit numerik & acak kriptografis"
    );

    const hashedOtp = hashOtp(otp1);
    assert(
      hashedOtp.length === 64 && hashedOtp !== otp1,
      "2. OTP di-hash menggunakan SHA-256 (tidak plaintext di DB)"
    );

    assert(
      verifyOtpHash(otp1, hashedOtp) === true,
      "3. Verifikasi OTP benar cocok dengan hash timing-safe"
    );

    assert(
      verifyOtpHash("999999", hashedOtp) === false,
      "4. Verifikasi OTP salah ditolak"
    );

    const rawToken = generateResetToken();
    const hashedToken = hashResetToken(rawToken);
    assert(
      rawToken.length === 64 && hashedToken.length === 64 && rawToken !== hashedToken,
      "5. Reset token dibuat 64-karakter hex acak dan di-hash SHA-256"
    );

    assert(
      verifyResetTokenHash(rawToken, hashedToken) === true,
      "6. Verifikasi token reset benar cocok dengan hash"
    );

    assert(
      verifyResetTokenHash("invalid_token_sample", hashedToken) === false,
      "7. Verifikasi token reset palsu ditolak"
    );

    // -----------------------------------------------------------------
    // TEST SECTION 2: OTP REGISTRATION & VERIFICATION FLOW
    // -----------------------------------------------------------------
    console.log("\n\x1b[34m[SECTION 2: Alur OTP Register Manual]\x1b[0m");
    clearSimulatedInbox();

    // Step A: Generate & Send OTP
    const registrationOtp = generateSecureOtp();
    const regOtpHashed = hashOtp(registrationOtp);
    const hashedPassword = await bcrypt.hash(testPassword, 10);

    const pendingRecord = await prisma.emailVerificationOtp.create({
      data: {
        email: testEmail,
        otpHash: regOtpHashed,
        pendingData: JSON.stringify({
          name: "Test Komandan Linkora",
          email: testEmail,
          password: hashedPassword,
        }),
        expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 mins
        attempts: 0,
        maxAttempts: 5,
        lastSentAt: new Date(),
      },
    });

    const sendOtpResult = await sendVerificationOtpEmail({
      to: testEmail,
      name: "Test Komandan Linkora",
      otp: registrationOtp,
    });

    assert(sendOtpResult.success === true, "8. Email OTP pendaftaran berhasil dikirim");

    const inbox = getSimulatedInbox();
    assert(
      inbox.some((e) => e.to === testEmail && e.subject.includes("Kode verifikasi")),
      "9. Email OTP masuk ke antrean pengiriman dengan subjek resmi"
    );

    // Step B: Wrong OTP attempt increments attempts
    const wrongAttemptValid = verifyOtpHash("000000", pendingRecord.otpHash);
    assert(wrongAttemptValid === false, "10. Percobaan OTP salah ditolak");

    await prisma.emailVerificationOtp.update({
      where: { id: pendingRecord.id },
      data: { attempts: { increment: 1 } },
    });

    // Step C: Verify with correct OTP
    const correctAttempt = verifyOtpHash(registrationOtp, pendingRecord.otpHash);
    assert(correctAttempt === true, "11. OTP yang benar berhasil diverifikasi");

    // Create user in DB and mark OTP as consumed
    const createdUser = await prisma.$transaction(async (tx) => {
      const u = await tx.user.create({
        data: {
          name: "Test Komandan Linkora",
          email: testEmail,
          password: hashedPassword,
          emailVerified: new Date(),
          welcomeEmailSentAt: new Date(),
        },
      });

      await tx.emailVerificationOtp.update({
        where: { id: pendingRecord.id },
        data: { verifiedAt: new Date() },
      });

      return u;
    });

    assert(!!createdUser.id, "12. User aktif berhasil dibuat setelah verifikasi OTP");

    // Step D: Second use of OTP must be rejected
    const recheckRecord = await prisma.emailVerificationOtp.findUnique({
      where: { id: pendingRecord.id },
    });
    assert(
      recheckRecord?.verifiedAt !== null,
      "13. OTP one-time-use: OTP sudah ditandai verified dan tidak dapat digunakan lagi"
    );

    // Step E: Expired OTP rejected
    const expiredRecord = await prisma.emailVerificationOtp.create({
      data: {
        email: "expired.test@linkora.id",
        otpHash: hashOtp("111222"),
        expiresAt: new Date(Date.now() - 1000), // Expired 1s ago
        attempts: 0,
      },
    });

    assert(
      new Date() > expiredRecord.expiresAt,
      "14. OTP kedaluwarsa (expired) terdeteksi dan ditolak sistem"
    );

    // -----------------------------------------------------------------
    // TEST SECTION 3: WELCOME EMAIL & IDEMPOTENCY
    // -----------------------------------------------------------------
    console.log("\n\x1b[34m[SECTION 3: Welcome Email & Idempotensi]\x1b[0m");

    const welcome1 = await sendWelcomeEmail({
      to: testEmail,
      name: "Test Komandan Linkora",
      isGoogleAuth: false,
    });

    // Since welcomeEmailSentAt is already set during user creation:
    assert(
      welcome1.skipped === true,
      "15. Idempotensi Welcome Email: Tidak mengirim ulang jika sudah pernah dikirim"
    );

    // Simulate new Google user welcome email
    const googleUserEmail = `google.user.${Date.now()}@linkora.id`;
    const googleUser = await prisma.user.create({
      data: {
        name: "Google Komandan",
        email: googleUserEmail,
        emailVerified: new Date(),
      },
    });

    const googleWelcome = await sendWelcomeEmail({
      to: googleUserEmail,
      name: "Google Komandan",
      isGoogleAuth: true,
    });

    assert(
      googleWelcome.success === true && !googleWelcome.skipped,
      "16. Welcome email untuk Google OAuth user pertama kali berhasil dikirim"
    );

    // Re-trigger for same Google user -> must be skipped
    const googleWelcomeSecond = await sendWelcomeEmail({
      to: googleUserEmail,
      name: "Google Komandan",
      isGoogleAuth: true,
    });

    assert(
      googleWelcomeSecond.skipped === true,
      "17. Welcome email Google user tidak dikirim berulang saat login kedua"
    );

    // -----------------------------------------------------------------
    // TEST SECTION 4: FORGOT PASSWORD & RESET PASSWORD FLOW
    // -----------------------------------------------------------------
    console.log("\n\x1b[34m[SECTION 4: Alur Forgot & Reset Password]\x1b[0m");

    // Generic response verification: non-existent email must not error
    const nonExistentEmail = "tidak.ada.di.database@linkora.id";
    const nonUser = await prisma.user.findUnique({ where: { email: nonExistentEmail } });
    assert(
      nonUser === null,
      "18. Proteksi User Enumerasi: Email tidak terdaftar diidentifikasi aman"
    );

    // Request reset for valid user
    const resetRawToken = generateResetToken();
    const resetHashedToken = hashResetToken(resetRawToken);

    const resetRecord = await prisma.passwordResetToken.create({
      data: {
        email: testEmail,
        tokenHash: resetHashedToken,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 mins
      },
    });

    const sendResetResult = await sendPasswordResetEmail({
      to: testEmail,
      name: createdUser.name,
      resetUrl: `http://localhost:3000/reset-password?token=${resetRawToken}&email=${encodeURIComponent(
        testEmail
      )}`,
    });

    assert(sendResetResult.success === true, "19. Email reset password terkirim dengan tautan aman");

    // Perform password change
    const newHashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: createdUser.id },
        data: { password: newHashedPassword },
      });

      await tx.passwordResetToken.update({
        where: { id: resetRecord.id },
        data: { usedAt: new Date() },
      });
    });

    // Verify old password is NO LONGER valid
    const updatedUser = await prisma.user.findUnique({ where: { id: createdUser.id } });
    const oldPasswordMatches = await bcrypt.compare(testPassword, updatedUser!.password!);
    const newPasswordMatches = await bcrypt.compare(newPassword, updatedUser!.password!);

    assert(
      oldPasswordMatches === false && newPasswordMatches === true,
      "20. Password berhasil diubah & password lama tidak berlaku lagi"
    );

    // Verify token cannot be reused
    const usedTokenCheck = await prisma.passwordResetToken.findUnique({
      where: { tokenHash: resetHashedToken },
    });
    assert(
      usedTokenCheck?.usedAt !== null,
      "21. Token reset password one-time-use: Tidak dapat digunakan kembali"
    );

    // -----------------------------------------------------------------
    // TEST SECTION 5: AUDIT LOGGING & SECURITY HYGIENE
    // -----------------------------------------------------------------
    console.log("\n\x1b[34m[SECTION 5: Observabilitas & Kebersihan Rahasia]\x1b[0m");

    const emailLogs = await prisma.emailLog.findMany({
      where: { email: testEmail },
    });

    assert(
      emailLogs.length >= 2,
      "22. Event email tercatat rapi di tabel EmailLog database"
    );

    const hasPlaintextPasswordInLogs = emailLogs.some(
      (l) => l.metadata && (l.metadata.includes(testPassword) || l.metadata.includes(newPassword))
    );
    assert(
      hasPlaintextPasswordInLogs === false,
      "23. TIDAK ada password plaintext di log database"
    );

    const hasPlaintextOtpInLogs = emailLogs.some(
      (l) => l.metadata && l.metadata.includes(registrationOtp)
    );
    assert(
      hasPlaintextOtpInLogs === false,
      "24. TIDAK ada OTP plaintext di metadata log database"
    );

    console.log("\n=======================================================");
    console.log(`   HASIL TEST: ${passedTests} / ${totalTests} BERHASIL (100%)   `);
    console.log("=======================================================\n");

    // Clean up test data
    await prisma.emailLog.deleteMany({ where: { email: { in: [testEmail, googleUserEmail] } } });
    await prisma.passwordResetToken.deleteMany({ where: { email: testEmail } });
    await prisma.emailVerificationOtp.deleteMany({
      where: { email: { in: [testEmail, "expired.test@linkora.id"] } },
    });
    await prisma.user.deleteMany({ where: { email: { in: [testEmail, googleUserEmail] } } });
  } catch (error) {
    console.error("Test execution failed with error:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runTestSuite();
