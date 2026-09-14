import { NextResponse } from "next/server";
import { sendVerificationOtpEmail, sendWelcomeEmail, sendPasswordResetEmail } from "@/lib/email/service";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { toEmail, type = "otp" } = body;

    if (!toEmail || !toEmail.includes("@")) {
      return NextResponse.json(
        { success: false, error: "Alamat email penerima tidak valid" },
        { status: 400 }
      );
    }

    const appUrl = process.env.APP_URL || "http://localhost:3000";
    let sendResult;

    switch (type) {
      case "welcome":
        sendResult = await sendWelcomeEmail({
          to: toEmail,
          name: "Komandan Linkora",
          isGoogleAuth: false,
        });
        break;

      case "reset":
        sendResult = await sendPasswordResetEmail({
          to: toEmail,
          name: "Komandan Linkora",
          resetUrl: `${appUrl}/reset-password?token=demo_test_token_resend_security_123456&email=${encodeURIComponent(toEmail)}`,
          expiryMinutes: 15,
        });
        break;

      case "otp":
      default:
        sendResult = await sendVerificationOtpEmail({
          to: toEmail,
          name: "Komandan Linkora",
          otp: Math.floor(100000 + Math.random() * 900000).toString(),
          expiryMinutes: 10,
        });
        break;
    }

    if (sendResult.error) {
      return NextResponse.json({
        success: false,
        error: sendResult.error,
        isTestMode: sendResult.isTestMode,
      });
    }

    return NextResponse.json({
      success: true,
      messageId: sendResult.messageId,
      isTestMode: sendResult.isTestMode,
      recipient: toEmail,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || "Gagal mengirim email tes" },
      { status: 500 }
    );
  }
}
