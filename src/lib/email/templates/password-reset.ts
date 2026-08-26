import { PasswordResetTemplateProps } from "../types";
import { renderBaseLayout, escapeHtml } from "./base-layout";

export function renderPasswordResetEmail({
  userName,
  resetUrl,
  expiryMinutes = 15,
  appUrl,
  currentYear,
}: PasswordResetTemplateProps): { subject: string; html: string; text: string } {
  const subject = "Atur ulang password Linkora";
  const greeting = userName ? `Halo, ${escapeHtml(userName)}` : "Halo";

  const content = `
    <h1 style="margin: 0 0 16px; font-size: 20px; font-weight: 700; color: #0f172a; line-height: 28px;">
      Atur Ulang Password
    </h1>

    <p style="margin: 0 0 16px; font-size: 15px; line-height: 24px; color: #334155;">
      ${greeting},
    </p>

    <p style="margin: 0 0 20px; font-size: 15px; line-height: 24px; color: #334155;">
      Kami menerima permintaan untuk mengatur ulang password akun Linkora Anda. Jika Anda memang meminta perubahan ini, silakan klik tombol di bawah untuk membuat password baru:
    </p>

    <!-- CTA Button -->
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="margin: 28px 0;">
      <tr>
        <td align="center" style="border-radius: 10px; background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);">
          <a href="${resetUrl}" target="_blank" style="display: inline-block; padding: 14px 28px; font-family: 'Inter', sans-serif; font-size: 14px; font-weight: 600; color: #ffffff; text-decoration: none; border-radius: 10px; letter-spacing: 0.2px;">
            ATUR ULANG PASSWORD
          </a>
        </td>
      </tr>
    </table>

    <div style="background-color: #f8fafc; border-left: 3px solid #6366f1; border-radius: 6px; padding: 14px 16px; margin: 24px 0;">
      <p style="margin: 0; font-size: 13px; line-height: 20px; color: #64748b;">
        Link ini berlaku selama <strong>${expiryMinutes} menit</strong> dan hanya dapat digunakan satu kali.
      </p>
    </div>

    <p style="margin: 0 0 16px; font-size: 14px; line-height: 22px; color: #64748b;">
      Jika Anda tidak meminta reset password, Anda dapat mengabaikan email ini dengan aman. Password Anda tidak akan berubah tanpa persetujuan Anda melalui link di atas.
    </p>

    <p style="margin: 0 0 24px; font-size: 13px; line-height: 20px; color: #94a3b8;">
      Untuk keamanan, jangan bagikan link ini kepada siapa pun.
    </p>

    <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 24px 0 20px;" />

    <p style="margin: 0 0 4px; font-size: 14px; color: #475569;">
      Salam hangat,
    </p>
    <p style="margin: 0; font-size: 14px; font-weight: 600; color: #0f172a;">
      Tim Linkora
    </p>

    <!-- Fallback URL -->
    <div style="margin-top: 28px; padding-top: 16px; border-top: 1px dashed #e2e8f0;">
      <p style="margin: 0 0 6px; font-size: 12px; color: #94a3b8;">
        Tombol tidak berfungsi? Salin tautan berikut ke browser Anda:
      </p>
      <p style="margin: 0; font-size: 11px; word-break: break-all; color: #6366f1;">
        <a href="${resetUrl}" style="color: #6366f1; text-decoration: underline;">${resetUrl}</a>
      </p>
    </div>
  `;

  const html = renderBaseLayout({
    title: subject,
    content,
    previewText: "Permintaan atur ulang password akun Linkora Anda.",
    appUrl,
    currentYear,
  });

  const text = `Halo${userName ? ` ${userName}` : ""},

Kami menerima permintaan untuk mengatur ulang password akun Linkora Anda.

Jika Anda memang meminta perubahan password, buka link berikut di browser Anda:
${resetUrl}

Link memiliki masa berlaku terbatas (${expiryMinutes} menit) dan hanya dapat digunakan satu kali.

Jika Anda tidak meminta reset password, Anda dapat mengabaikan email ini.
Untuk keamanan, jangan bagikan link ini kepada siapa pun.

Salam,
Tim Linkora`;

  return { subject, html, text };
}
