import { VerificationOtpTemplateProps } from "../types";
import { renderBaseLayout, escapeHtml } from "./base-layout";

export function renderVerificationOtpEmail({
  userName,
  otp,
  expiryMinutes = 10,
  appUrl,
  currentYear,
}: VerificationOtpTemplateProps): { subject: string; html: string; text: string } {
  const subject = "Kode verifikasi akun Linkorian";
  const greeting = userName ? `Halo, ${escapeHtml(userName)}` : "Halo";

  const content = `
    <h1 style="margin: 0 0 14px; font-size: 22px; font-weight: 700; color: #0f172a; line-height: 30px;">
      Verifikasi Email Anda
    </h1>

    <p style="margin: 0 0 16px; font-size: 15px; line-height: 24px; color: #334155;">
      ${greeting},
    </p>

    <p style="margin: 0 0 20px; font-size: 15px; line-height: 24px; color: #334155;">
      Terima kasih telah bergabung di <strong>Linkorian</strong>. Gunakan 6-digit kode verifikasi berikut untuk mengaktifkan akun Anda:
    </p>

    <!-- OTP Display Box -->
    <table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" style="margin: 24px 0 26px;">
      <tr>
        <td align="center">
          <div style="display: inline-block; background: #f8fafc; border: 2px dashed #6366f1; border-radius: 14px; padding: 18px 36px; text-align: center; box-shadow: 0 2px 6px rgba(99, 102, 241, 0.08);">
            <span class="otp-code" style="font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace; font-size: 34px; font-weight: 800; letter-spacing: 10px; color: #1e1b4b; display: inline-block; margin-left: 10px;">
              ${escapeHtml(otp)}
            </span>
          </div>
        </td>
      </tr>
    </table>

    <div style="background-color: #eef2ff; border-left: 4px solid #6366f1; border-radius: 8px; padding: 14px 18px; margin: 24px 0;">
      <p style="margin: 0; font-size: 13px; line-height: 20px; color: #3730a3;">
        🔒 Kode verifikasi ini berlaku selama <strong>${expiryMinutes} menit</strong>. Jangan bagikan kode ini kepada siapa pun untuk melindungi keamanan akun Anda.
      </p>
    </div>

    <p style="margin: 0 0 24px; font-size: 14px; line-height: 22px; color: #64748b;">
      Jika Anda tidak merasa mendaftar di Linkorian, silakan abaikan email ini dengan aman.
    </p>

    <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 24px 0 20px;" />

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
    previewText: `Kode verifikasi Linkorian Anda adalah ${otp}. Berlaku selama ${expiryMinutes} menit.`,
    appUrl,
    currentYear,
  });

  const text = `Halo${userName ? ` ${userName}` : ""},

Verifikasi Email Akun Linkorian Anda

Gunakan 6-digit kode verifikasi berikut untuk menyelesaikan pendaftaran:

        ${otp}

Kode ini berlaku selama ${expiryMinutes} menit.
Jangan berikan kode ini kepada siapa pun.

Jika Anda tidak merasa mendaftar di Linkorian, abaikan email ini.

Salam,
Tim Linkorian`;

  return { subject, html, text };
}
