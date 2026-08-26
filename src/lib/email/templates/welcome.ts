import { WelcomeTemplateProps } from "../types";
import { renderBaseLayout, escapeHtml } from "./base-layout";

export function renderWelcomeEmail({
  userName,
  isGoogleAuth = false,
  loginUrl,
  appUrl = process.env.APP_URL || "http://localhost:3000",
  currentYear,
}: WelcomeTemplateProps): { subject: string; html: string; text: string } {
  const subject = "Selamat datang di Linkora";
  const actionUrl = loginUrl || `${appUrl.replace(/\/$/, "")}/dashboard`;

  // Format greeting safely: avoid undefined, null, Guest, User123
  let displayName = "";
  if (userName && userName.trim() && !/^(undefined|null|guest|user\d+)$/i.test(userName.trim())) {
    displayName = userName.trim();
  }

  const welcomeHeadline = displayName
    ? `Selamat datang di Linkora, ${escapeHtml(displayName)}.`
    : "Selamat datang di Linkora.";

  const content = `
    <h1 style="margin: 0 0 16px; font-size: 22px; font-weight: 700; color: #0f172a; line-height: 30px;">
      ${welcomeHeadline}
    </h1>

    <p style="margin: 0 0 16px; font-size: 15px; line-height: 24px; color: #334155;">
      Akun Anda sudah berhasil dibuat ${isGoogleAuth ? "melalui akun Google " : ""}dan siap digunakan.
    </p>

    <p style="margin: 0 0 24px; font-size: 15px; line-height: 24px; color: #334155;">
      Mulai sekarang Anda dapat menggunakan Linkora untuk membantu menyimpan, mengelola, dan menemukan kembali informasi penting dengan lebih teratur dan efisien.
    </p>

    <!-- Highlights box -->
    <table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" style="margin: 20px 0 28px; background-color: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0;">
      <tr>
        <td style="padding: 20px;">
          <table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0">
            <tr>
              <td style="padding-bottom: 12px;">
                <span style="font-size: 14px; font-weight: 600; color: #0f172a;">Fitur Unggulan Ruang Kerja Anda:</span>
              </td>
            </tr>
            <tr>
              <td style="font-size: 13px; line-height: 22px; color: #475569; padding-bottom: 6px;">
                • <strong>Manajemen Tautan Cerdas:</strong> Simpan dan kelompokkan link dengan cepat.
              </td>
            </tr>
            <tr>
              <td style="font-size: 13px; line-height: 22px; color: #475569; padding-bottom: 6px;">
                • <strong>Analisis AI Imersif:</strong> Dapatkan ringkasan instan dari konten tersimpan.
              </td>
            </tr>
            <tr>
              <td style="font-size: 13px; line-height: 22px; color: #475569;">
                • <strong>Catatan & Dokumen:</strong> Tulis catatan kaya dan ekspor dokumen kapan saja.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    <!-- CTA Button -->
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="margin: 28px 0 16px;">
      <tr>
        <td align="center" style="border-radius: 10px; background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);">
          <a href="${actionUrl}" target="_blank" style="display: inline-block; padding: 14px 28px; font-family: 'Inter', sans-serif; font-size: 14px; font-weight: 600; color: #ffffff; text-decoration: none; border-radius: 10px; letter-spacing: 0.2px;">
            MULAI MENGGUNAKAN LINKORA
          </a>
        </td>
      </tr>
    </table>

    <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 28px 0 20px;" />

    <p style="margin: 0 0 4px; font-size: 14px; color: #475569;">
      Salam hangat,
    </p>
    <p style="margin: 0; font-size: 14px; font-weight: 600; color: #0f172a;">
      Tim Linkora
    </p>
  `;

  const html = renderBaseLayout({
    title: subject,
    content,
    previewText: "Selamat datang di Linkora! Akun Anda telah siap digunakan.",
    appUrl,
    currentYear,
  });

  const text = `Selamat datang di Linkora${displayName ? `, ${displayName}` : ""}.

Akun Anda sudah berhasil dibuat.

Mulai sekarang Anda dapat menggunakan Linkora untuk membantu menyimpan, mengelola, dan menemukan kembali informasi penting dengan lebih teratur.

Mulai gunakan Linkora di sini:
${actionUrl}

Salam,
Tim Linkora`;

  return { subject, html, text };
}
