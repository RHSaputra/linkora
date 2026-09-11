import { BaseTemplateProps } from "../types";

export interface LayoutOptions extends BaseTemplateProps {
  title: string;
  content: string;
}

export function renderBaseLayout({
  title,
  content,
  previewText = "",
  appUrl = process.env.APP_URL || "https://linkorian.online",
  currentYear = new Date().getFullYear(),
}: LayoutOptions): string {
  const cleanAppUrl = appUrl.replace(/\/$/, "");
  const logoBannerUrl = `${cleanAppUrl}/logo.png`;
  const iconUrl = `${cleanAppUrl}/icon.jpg`;

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
    body { margin: 0 !important; padding: 0 !important; width: 100% !important; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #0f172a; }
    @media only screen and (max-width: 600px) {
      .email-container { width: 100% !important; max-width: 100% !important; }
      .mobile-padding { padding-left: 20px !important; padding-right: 20px !important; }
      .mobile-card { border-radius: 12px !important; }
      .otp-code { font-size: 28px !important; letter-spacing: 6px !important; }
      .header-logo { width: 140px !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
  <!-- Preheader text (hidden preview in inbox) -->
  ${
    previewText
      ? `<div style="display: none; font-size: 1px; line-height: 1px; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden; mso-hide: all; font-family: sans-serif;">
          ${escapeHtml(previewText)}
          ${"&#847; &zwnj; &nbsp; ".repeat(25)}
        </div>`
      : ""
  }

  <table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" style="background-color: #f1f5f9; width: 100%;">
    <tr>
      <td align="center" style="padding: 32px 16px 48px;">
        <!-- Container -->
        <table role="presentation" class="email-container" width="100%" border="0" cellpadding="0" cellspacing="0" style="max-width: 560px; margin: 0 auto;">
          
          <!-- Outer Card with Sleek Dark Header & Gradient Border -->
          <tr>
            <td>
              <table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" class="mobile-card" style="background-color: #ffffff; border-radius: 20px; border: 1px solid #cbd5e1; box-shadow: 0 10px 25px -5px rgba(15, 23, 42, 0.08), 0 8px 10px -6px rgba(15, 23, 42, 0.04); overflow: hidden;">
                
                <!-- Sleek Branded Header Banner -->
                <tr>
                  <td align="center" style="background-color: #090d16; padding: 26px 20px; border-bottom: 3px solid #6366f1;">
                    <a href="${cleanAppUrl}" target="_blank" style="text-decoration: none; display: inline-block;">
                      <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                        <tr>
                          <td align="center">
                            <!-- Official Linkora/Linkorian 3D Logo Banner -->
                            <img class="header-logo" src="${logoBannerUrl}" alt="Linkorian" width="165" style="display: block; width: 165px; max-width: 100%; height: auto; margin: 0 auto;" />
                          </td>
                        </tr>
                        <tr>
                          <td align="center" style="padding-top: 6px;">
                            <span style="display: inline-block; font-size: 10px; letter-spacing: 1.5px; text-transform: uppercase; color: #94a3b8; font-weight: 700; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
                              Intelligent Digital Workspace
                            </span>
                          </td>
                        </tr>
                      </table>
                    </a>
                  </td>
                </tr>

                <!-- Content Area -->
                <tr>
                  <td class="mobile-padding" style="padding: 36px 32px 32px; background-color: #ffffff;">
                    ${content}
                  </td>
                </tr>

                <!-- Direct Support Banner Inside Card -->
                <tr>
                  <td style="padding: 16px 32px; background-color: #f8fafc; border-top: 1px solid #f1f5f9;">
                    <table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="left" style="font-size: 12px; color: #64748b;">
                          Butuh bantuan langsung? Hubungi kami di <a href="mailto:supportlinkorian@gmail.com" style="color: #4f46e5; text-decoration: none; font-weight: 600;">supportlinkorian@gmail.com</a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

              </table>
            </td>
          </tr>

          <!-- Footer Section -->
          <tr>
            <td align="center" style="padding-top: 24px; padding-bottom: 8px;">
              <table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="font-size: 11px; line-height: 18px; color: #94a3b8; text-align: center;">
                    <p style="margin: 0 0 6px;">Email resmi ini dikirim otomatis oleh sistem keamanan <strong>Linkorian</strong>.</p>
                    <p style="margin: 0 0 6px;">
                      <a href="${cleanAppUrl}" style="color: #6366f1; text-decoration: none; font-weight: 600;">linkorian.online</a> &bull;
                      <a href="${cleanAppUrl}/privacy" style="color: #64748b; text-decoration: none;">Kebijakan Privasi</a> &bull;
                      <a href="mailto:supportlinkorian@gmail.com" style="color: #64748b; text-decoration: none;">Bantuan</a>
                    </p>
                    <p style="margin: 0; color: #cbd5e1;">&copy; ${currentYear} Linkorian. All rights reserved.</p>
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
