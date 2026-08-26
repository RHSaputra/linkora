import { VerificationOtpTemplateProps } from "../types";
import { renderBaseLayout, escapeHtml } from "./base-layout";

export function renderVerificationOtpEmail({
  userName,
  otp,
  expiryMinutes = 10,
  appUrl,
  currentYear,
}: VerificationOtpTemplateProps): { subject: string; html: string; text: string } {
  const subject = "Kode verifikasi akun Linkora";
  const greeting = userName ? `Halo, ${escapeHtml(userName)}` : "Halo";

  const content = `
    <h1 style="margin: 0 0 16px; font-size: 20px; font-weight: 700; color: #0f172a; line-height: 28px;">
      Verifikasi Email Anda
    </h1>

    <p style="margin: 0 0 16px; font-size: 15px; line-height: 24px; color: #334155;">
      ${greeting},
    </p>

    <p style="margin: 0 0 24px; font-size: 15px; line-height: 24px; color: #334155;">
      Gunakan kode verifikasi berikut untuk menyelesaikan proses pendaftaran akun Linkora Anda:
    </p>

    <!-- OTP Display Box -->
    <table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" style="margin: 24px 0 28px;">
      <tr>
        <td align="center">
          <div style="display: inline-block; background-color: #f1f5f9; border: 2px dashed #cbd5e1; border-radius: 12px; padding: 18px 32px; text-align: center;">
            <span class="otp-code" style="font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace; font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #0f172a; display: inline-block; margin-left: 8px;">
              ${escapeHtml(otp)}
            </span>
          </div>
        </td>
      </tr>
    </table>

    <div style="background-color: #f8fafc; border-left: 3px solid #6366f1; border-radius: 6px; padding: 14px 16px; margin: 24px 0;">
      <p style="margin: 0; font-size: 13px; line-height: 20px; color: #64748b;">
        Kode ini berlaku selama <strong>${expiryMinutes} menit</strong>. Jangan bagikan kode ini kepada siapa pun, termasuk pihak yang mengatasnamakan Linkora.
      </p>
    </div>

    <p style="margin: 0 0 24px; font-size: 14px; line-height: 22px; color: #64748b;">
      Jika Anda tidak merasa melakukan pendaftaran di Linkora, silakan abaikan email ini dengan aman.
    </p>

    <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 24px 0 20px;" />

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
    previewText: `Kode verifikasi Linkora Anda adalah ${otp}. Berlaku selama ${expiryMinutes} menit.`,
    appUrl,
    currentYear,
  });

  const text = `Halo${userName ? ` ${userName}` : ""},

Verifikasi email Anda

Gunakan kode berikut untuk melanjutkan pendaftaran:

        ${otp}

Kode ini berlaku selama ${expiryMinutes} menit.
Jangan bagikan kode ini kepada siapa pun.

Jika Anda tidak merasa melakukan pendaftaran di Linkora, abaikan email ini.

Salam,
Tim Linkora`;

  return { subject, html, text };
}
