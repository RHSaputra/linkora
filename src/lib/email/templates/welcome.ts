import { WelcomeTemplateProps } from "../types";
import { renderBaseLayout, escapeHtml } from "./base-layout";

export function renderWelcomeEmail({
  userName,
  isGoogleAuth = false,
  loginUrl,
  appUrl = process.env.APP_URL || "https://linkorian.online",
  currentYear,
}: WelcomeTemplateProps): { subject: string; html: string; text: string } {
  const subject = "Selamat datang di Linkorian!";
  const actionUrl = loginUrl || `${appUrl.replace(/\/$/, "")}/dashboard`;

  // Format greeting safely: avoid undefined, null, Guest, User123
  let displayName = "";
  if (userName && userName.trim() && !/^(undefined|null|guest|user\d+)$/i.test(userName.trim())) {
    displayName = userName.trim();
  }

  const welcomeHeadline = displayName
    ? `Selamat datang di Linkorian, ${escapeHtml(displayName)}.`
    : "Selamat datang di Linkorian.";

  const content = `
    <h1 style="margin: 0 0 16px; font-size: 22px; font-weight: 700; color: #0f172a; line-height: 30px;">
      ${welcomeHeadline}
    </h1>

    <p style="margin: 0 0 16px; font-size: 15px; line-height: 24px; color: #334155;">
      Akun Anda sudah berhasil dibuat ${isGoogleAuth ? "melalui akun Google " : ""}dan siap digunakan secara penuh.
    </p>

    <p style="margin: 0 0 24px; font-size: 15px; line-height: 24px; color: #334155;">
      Mulai sekarang Anda dapat menggunakan <strong>Linkorian</strong> untuk menyimpan, mengatur, dan menemukan kembali seluruh tautan penting, dokumen, serta catatan harian Anda dalam satu ekosistem cerdas.
    </p>

    <!-- Highlights box -->
    <table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" style="margin: 20px 0 28px; background-color: #f8fafc; border-radius: 14px; border: 1px solid #e2e8f0;">
      <tr>
        <td style="padding: 22px 20px;">
          <table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0">
            <tr>
              <td style="padding-bottom: 12px;">
                <span style="font-size: 14px; font-weight: 700; color: #0f172a;">Fitur Unggulan Ruang Kerja Anda:</span>
              </td>
            </tr>
            <tr>
              <td style="font-size: 13px; line-height: 22px; color: #475569; padding-bottom: 8px;">
                🔹 <strong>Manajemen Tautan Cerdas:</strong> Simpan, kategorikan, dan sematkan link favorit dengan pratinjau instan.
              </td>
            </tr>
            <tr>
              <td style="font-size: 13px; line-height: 22px; color: #475569; padding-bottom: 8px;">
                🔹 <strong>Analisis AI Gemini:</strong> Ekstraksi ringkasan otomatis, saran tag cerdas, dan asisten interaktif Liko.
              </td>
            </tr>
            <tr>
              <td style="font-size: 13px; line-height: 22px; color: #475569;">
                🔹 <strong>Catatan & Ekspor Dokumen:</strong> Tulis catatan kaya dan ekspor dokumen PDF berkualitas tinggi kapan saja.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    <!-- CTA Button -->
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="margin: 28px 0 20px;">
      <tr>
        <td align="center" style="border-radius: 12px; background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);">
          <a href="${actionUrl}" target="_blank" style="display: inline-block; padding: 14px 32px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size: 14px; font-weight: 700; color: #ffffff; text-decoration: none; border-radius: 12px; letter-spacing: 0.3px;">
            BUKA RUANG KERJA LINKORIAN &rarr;
          </a>
        </td>
      </tr>
    </table>

    <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 28px 0 20px;" />

    <p style="margin: 0 0 4px; font-size: 14px; color: #475569;">
      Salam hangat,
    </p>
    <p style="margin: 0; font-size: 14px; font-weight: 700; color: #0f172a;">
      Tim Linkorian
    </p>
  `;

  const html = renderBaseLayout({
    title: subject,
    content,
    previewText: "Selamat datang di Linkorian! Akun Anda telah aktif dan siap digunakan.",
    appUrl,
    currentYear,
  });

  const text = `Selamat datang di Linkorian${displayName ? `, ${displayName}` : ""}.

Akun Anda sudah berhasil dibuat.

Mulai sekarang Anda dapat menggunakan Linkorian untuk menyimpan, mengelola, dan menemukan kembali seluruh informasi penting dengan lebih teratur.

Mulai gunakan Linkorian di sini:
${actionUrl}

Salam,
Tim Linkorian`;

  return { subject, html, text };
}
