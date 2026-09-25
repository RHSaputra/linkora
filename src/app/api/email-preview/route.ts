import { NextResponse } from "next/server";
import { renderVerificationOtpEmail } from "@/lib/email/templates/verification-otp";
import { renderWelcomeEmail } from "@/lib/email/templates/welcome";
import { renderPasswordResetEmail } from "@/lib/email/templates/password-reset";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type") || "otp";
  const appUrl = process.env.APP_URL || "http://localhost:3000";


  let result: { subject: string; html: string; text: string };

  switch (type) {
    case "welcome":
      result = renderWelcomeEmail({
        userName: "Pengguna Linkorian",
        isGoogleAuth: false,
        appUrl,
      });
      break;

    case "reset":
      result = renderPasswordResetEmail({
        userName: "Pengguna Linkorian",
        resetUrl: `${appUrl}/reset-password?token=sample_token_64chars_demo_linkora_resend_security&email=user%40linkora.id`,
        expiryMinutes: 15,
        appUrl,
      });
      break;

    case "otp":
    default:
      result = renderVerificationOtpEmail({
        userName: "Pengguna Linkorian",
        otp: "849201",
        expiryMinutes: 10,
        appUrl,
      });
      break;
  }

  // If raw HTML requested
  if (searchParams.get("format") === "html") {
    return new Response(result.html, {
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }

  return NextResponse.json({
    type,
    subject: result.subject,
    html: result.html,
    text: result.text,
  });
}
