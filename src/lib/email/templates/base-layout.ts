import { BaseTemplateProps } from "../types";

export interface LayoutOptions extends BaseTemplateProps {
  title: string;
  content: string;
}

export function renderBaseLayout({
  title,
  content,
  previewText = "",
  appUrl = process.env.APP_URL || "http://localhost:3000",
  currentYear = new Date().getFullYear(),
}: LayoutOptions): string {
  const logoUrl = `${appUrl.replace(/\/$/, "")}/icon.jpg`;

  return `<!DOCTYPE html>
<html lang="id" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="x-apple-disable-message-reformatting">
  <title>${escapeHtml(title)}</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <style type="text/css">
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; outline: none; text-decoration: none; }
    body { margin: 0 !important; padding: 0 !important; width: 100% !important; background-color: #f8fafc; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #0f172a; }
    @media only screen and (max-width: 600px) {
      .email-container { width: 100% !important; max-width: 100% !important; }
      .mobile-padding { padding-left: 20px !important; padding-right: 20px !important; }
      .mobile-card { border-radius: 12px !important; padding: 24px 20px !important; }
      .otp-code { font-size: 28px !important; letter-spacing: 6px !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
  <!-- Preheader text (hidden preview in inbox) -->
  ${
    previewText
      ? `<div style="display: none; font-size: 1px; line-height: 1px; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden; mso-hide: all; font-family: sans-serif;">
          ${escapeHtml(previewText)}
          ${"&#847; &zwnj; &nbsp; ".repeat(25)}
        </div>`
      : ""
  }

  <table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; width: 100%;">
    <tr>
      <td align="center" style="padding: 40px 16px 48px;">
        <!-- Container -->
        <table role="presentation" class="email-container" width="100%" border="0" cellpadding="0" cellspacing="0" style="max-width: 540px; margin: 0 auto;">
          
          <!-- Header / Brand Logo -->
          <tr>
            <td align="center" style="padding-bottom: 28px;">
              <a href="${appUrl}" target="_blank" style="text-decoration: none; display: inline-block;">
                <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                  <tr>
                    <td align="center" vertical-align="middle">
                      <img src="${logoUrl}" alt="Linkora" width="44" height="44" style="display: block; border-radius: 10px; width: 44px; height: 44px; object-fit: cover; border: 1px solid #e2e8f0; margin-bottom: 8px;" />
                    </td>
                  </tr>
                  <tr>
                    <td align="center" vertical-align="middle">
                      <span style="font-size: 22px; font-weight: 800; color: #0f172a; letter-spacing: -0.5px; font-family: 'Space Grotesk', 'Inter', sans-serif;">
                        Link<span style="color: #6366f1;">o</span>ra
                      </span>
                    </td>
                  </tr>
                </table>
              </a>
            </td>
          </tr>

          <!-- Main Card Content -->
          <tr>
            <td>
              <table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" class="mobile-card" style="background-color: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.04), 0 2px 4px -1px rgba(0, 0, 0, 0.02); overflow: hidden;">
                <tr>
                  <td class="mobile-padding" style="padding: 36px 32px;">
                    ${content}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer Section -->
          <tr>
            <td align="center" style="padding-top: 32px; padding-bottom: 16px;">
              <table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="font-size: 12px; line-height: 18px; color: #94a3b8; text-align: center;">
                    <p style="margin: 0 0 6px;">Email ini dikirim secara otomatis oleh sistem keamanan Linkora.</p>
                    <p style="margin: 0 0 12px;">Linkora — Ruang Kerja Digital Cerdas untuk Manajemen Informasi Anda.</p>
                    <p style="margin: 0; color: #cbd5e1;">&copy; ${currentYear} Linkora. Semua hak dilindungi.</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function escapeHtml(str: string): string {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
