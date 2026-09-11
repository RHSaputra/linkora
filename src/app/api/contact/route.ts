import { NextResponse } from "next/server";
import { rateLimit } from "@/lib/rate-limit";
import { sendRawEmail } from "@/lib/email/client";
import { prisma } from "@/lib/prisma";
import { escapeHtml } from "@/lib/email/templates/base-layout";
import { verifyRecaptcha } from "@/lib/recaptcha";

export async function POST(req: Request) {
  try {
    // Client IP rate limiting (max 5 contact submissions per 10 minutes)
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1";
    const limitCheck = await rateLimit(`contact_${ip}`, { limit: 5, windowMs: 10 * 60 * 1000 });

    if (!limitCheck.success) {
      return NextResponse.json(
        { error: `Terlalu banyak pengiriman pesan. Silakan coba lagi dalam ${limitCheck.reset} detik.` },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { name, email, category, message, captchaToken } = body;

    // Google reCAPTCHA v2 verification (auto-bypassed if RECAPTCHA_SECRET_KEY not set)
    const captchaCheck = await verifyRecaptcha(captchaToken, ip);
    if (!captchaCheck.success) {
      return NextResponse.json(
        { error: captchaCheck.error || "Verifikasi captcha gagal. Silakan centang kotak reCAPTCHA." },
        { status: 400 }
      );
    }

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Nama, alamat email, dan pesan wajib diisi." },
        { status: 400 }
      );
    }

    const trimmedName = String(name).trim();
    const trimmedEmail = String(email).trim().toLowerCase();
    const trimmedCategory = String(category || "Pertanyaan Umum").trim();
    const trimmedMessage = String(message).trim();

    // Basic email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      return NextResponse.json(
        { error: "Format alamat email tidak valid." },
        { status: 400 }
      );
    }

    if (trimmedMessage.length < 10) {
      return NextResponse.json(
        { error: "Pesan terlalu singkat (minimal 10 karakter)." },
        { status: 400 }
      );
    }

    const officialEmail = process.env.EMAIL_REPLY_TO || "supportlinkorian@gmail.com";
    const appUrl = process.env.APP_URL || "https://linkorian.online";
    const sentAt = new Date().toLocaleString("id-ID", { timeZone: "Asia/Jakarta" });

    // HTML Email to the Official Support Team
    const html = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f1f5f9; padding: 32px 16px; margin: 0;">
  <table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" style="max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #cbd5e1; box-shadow: 0 4px 12px rgba(0,0,0,0.06); overflow: hidden;">
    <tr>
      <td style="background-color: #090d16; padding: 22px 24px; border-bottom: 3px solid #6366f1;">
        <table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0">
          <tr>
            <td>
              <h2 style="margin: 0; color: #ffffff; font-size: 18px; font-weight: 700; letter-spacing: -0.3px;">
                Link<span style="color: #6366f1;">o</span>rian &bull; Pesan Pengunjung Baru
              </h2>
              <p style="margin: 4px 0 0; color: #94a3b8; font-size: 11px; text-transform: uppercase; letter-spacing: 1px;">
                Form Hubungi Kami (${escapeHtml(trimmedCategory)})
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td style="padding: 28px 24px;">
        <table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; margin-bottom: 24px;">
          <tr>
            <td style="font-size: 13px; line-height: 22px; color: #475569;">
              <strong style="color: #0f172a;">Pengirim:</strong> ${escapeHtml(trimmedName)}<br>
              <strong style="color: #0f172a;">Email:</strong> <a href="mailto:${escapeHtml(trimmedEmail)}" style="color: #4f46e5; text-decoration: none; font-weight: 600;">${escapeHtml(trimmedEmail)}</a><br>
              <strong style="color: #0f172a;">Kategori:</strong> ${escapeHtml(trimmedCategory)}<br>
              <strong style="color: #0f172a;">Waktu (WIB):</strong> ${escapeHtml(sentAt)}
            </td>
          </tr>
        </table>

        <h3 style="margin: 0 0 12px; font-size: 14px; font-weight: 700; color: #0f172a; text-transform: uppercase; letter-spacing: 0.5px;">
          Isi Pesan:
        </h3>
        <div style="background-color: #ffffff; border: 1px solid #e2e8f0; border-left: 4px solid #4f46e5; border-radius: 8px; padding: 18px; font-size: 14px; line-height: 24px; color: #1e293b; white-space: pre-wrap;">
${escapeHtml(trimmedMessage)}
        </div>

        <div style="margin-top: 28px; padding-top: 18px; border-top: 1px solid #f1f5f9;">
          <a href="mailto:${escapeHtml(trimmedEmail)}?subject=Re:%20[Linkorian]%20${encodeURIComponent(trimmedCategory)}" style="display: inline-block; background-color: #4f46e5; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 10px; font-size: 13px; font-weight: 600;">
            Balas Pesan Ini Secara Langsung &rarr;
          </a>
        </div>
      </td>
    </tr>
    <tr>
      <td style="background-color: #f8fafc; padding: 14px 24px; border-top: 1px solid #f1f5f9; font-size: 11px; color: #94a3b8; text-align: center;">
        Pesan ini dikirimkan melalui form resmi Hubungi Kami di <a href="${appUrl}" style="color: #6366f1; text-decoration: none;">${appUrl}</a>
      </td>
    </tr>
  </table>
</body>
</html>`;

    const text = `Pesan Pengunjung Linkorian
Kategori: ${trimmedCategory}
Pengirim: ${trimmedName} (${trimmedEmail})
Waktu: ${sentAt}

Isi Pesan:
${trimmedMessage}

Untuk membalas, kirim email ke: ${trimmedEmail}`;

    // Send email to official support inbox
    const result = await sendRawEmail({
      to: officialEmail,
      replyTo: trimmedEmail,
      subject: `[Hubungi Kami - ${trimmedCategory}] dari ${trimmedName}`,
      html,
      text,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: "Gagal mengirimkan pesan saat ini. Silakan coba beberapa saat lagi atau hubungi via email langsung." },
        { status: 500 }
      );
    }

    // Record event in database
    try {
      await prisma.emailLog.create({
        data: {
          email: trimmedEmail,
          eventType: "contact_form_submitted",
          provider: "resend",
          status: "SUCCESS",
          metadata: JSON.stringify({
            name: trimmedName,
            category: trimmedCategory,
            target: officialEmail,
          }),
        },
      });
    } catch {
      // non-blocking
    }

    return NextResponse.json({
      success: true,
      message: "Terima kasih! Pesan Anda telah berhasil terkirim ke tim kami. Kami akan merespons melalui email Anda secepatnya.",
    });
  } catch (error) {
    console.error("[Contact API Error]:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan internal pada server. Silakan coba lagi." },
      { status: 500 }
    );
  }
}
