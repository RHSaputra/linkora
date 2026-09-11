import { PasswordResetTemplateProps } from "../types";
import { renderBaseLayout, escapeHtml } from "./base-layout";

export function renderPasswordResetEmail({
  userName,
  resetUrl,
  expiryMinutes = 15,
  appUrl,
  currentYear,
}: PasswordResetTemplateProps): { subject: string; html: string; text: string } {
  const subject = "Atur Ulang Password Akun Linkorian";
  const greeting = userName ? `Halo, ${escapeHtml(userName)}` : "Halo";

  const content = `
    <h1 style="margin: 0 0 16px; font-size: 22px; font-weight: 700; color: #0f172a; line-height: 30px;">
      Atur Ulang Password
    </h1>

    <p style="margin: 0 0 16px; font-size: 15px; line-height: 24px; color: #334155;">
      ${greeting},
    </p>

    <p style="margin: 0 0 20px; font-size: 15px; line-height: 24px; color: #334155;">
      Kami menerima permintaan untuk mengatur ulang kata sandi akun <strong>Linkorian</strong> Anda. Jika Anda yang meminta perubahan ini, silakan klik tombol di bawah untuk membuat kata sandi baru yang aman:
    </p>

    <!-- CTA Button -->
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="margin: 28px 0;">
      <tr>
        <td align="center" style="border-radius: 12px; background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);">
          <a href="${resetUrl}" target="_blank" style="display: inline-block; padding: 14px 32px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size: 14px; font-weight: 700; color: #ffffff; text-decoration: none; border-radius: 12px; letter-spacing: 0.3px;">
            ATUR ULANG KATA SANDI &rarr;
          </a>
        </td>
      </tr>
    </table>

    <div style="background-color: #f8fafc; border-left: 4px solid #6366f1; border-radius: 8px; padding: 14px 18px; margin: 24px 0;">
      <p style="margin: 0; font-size: 13px; line-height: 20px; color: #475569;">
        ⏱️ Tautan ini hanya berlaku selama <strong>${expiryMinutes} menit</strong> dan hanya dapat digunakan satu kali.
      </p>
    </div>

    <p style="margin: 0 0 16px; font-size: 14px; line-height: 22px; color: #64748b;">
      Jika Anda tidak meminta perubahan kata sandi, Anda dapat mengabaikan email ini dengan aman. Kata sandi akun Anda tidak akan berubah tanpa konfirmasi Anda melalui tautan di atas.
    </p>

    <p style="margin: 0 0 24px; font-size: 13px; line-height: 20px; color: #94a3b8;">
      Demi keamanan akun, jangan pernah membagikan tautan ini kepada siapa pun.
    </p>

    <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 24px 0 20px;" />

    <p style="margin: 0 0 4px; font-size: 14px; color: #475569;">
      Salam hangat,
    </p>
    <p style="margin: 0; font-size: 14px; font-weight: 700; color: #0f172a;">
      Tim Linkorian
    </p>

    <!-- Fallback URL -->
    <div style="margin-top: 28px; padding-top: 16px; border-top: 1px dashed #e2e8f0;">
      <p style="margin: 0 0 6px; font-size: 12px; color: #94a3b8;">
        Tombol di atas tidak dapat diklik? Salin dan buka tautan berikut di browser Anda:
      </p>
      <p style="margin: 0; font-size: 12px; word-break: break-all; color: #4f46e5;">
        <a href="${resetUrl}" style="color: #4f46e5; text-decoration: underline;">${resetUrl}</a>
      </p>
    </div>
  `;

  const html = renderBaseLayout({
    title: subject,
    content,
    previewText: "Permintaan atur ulang kata sandi akun Linkorian Anda.",
    appUrl,
    currentYear,
  });

  const text = `Halo${userName ? ` ${userName}` : ""},

Kami menerima permintaan untuk mengatur ulang kata sandi akun Linkorian Anda.

Jika Anda meminta perubahan kata sandi, buka tautan berikut di browser Anda:
${resetUrl}

Tautan memiliki masa berlaku terbatas (${expiryMinutes} menit) dan hanya dapat digunakan satu kali.

Jika Anda tidak meminta reset kata sandi, abaikan email ini.
Demi keamanan, jangan bagikan tautan ini kepada siapa pun.

Salam,
Tim Linkorian`;

  return { subject, html, text };
}
