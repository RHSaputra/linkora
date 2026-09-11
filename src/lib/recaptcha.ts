/**
 * Google reCAPTCHA v2 Verification Utility
 * 
 * Memvalidasi token respon captcha yang dikirimkan oleh frontend
 * langsung ke Google Siteverify API.
 */

export interface RecaptchaVerifyResult {
  success: boolean;
  score?: number;
  hostname?: string;
  error?: string;
  isBypassed?: boolean;
}

export async function verifyRecaptcha(
  token?: string | null,
  clientIp?: string
): Promise<RecaptchaVerifyResult> {
  const secretKey = process.env.RECAPTCHA_SECRET_KEY?.trim();

  // Mode Bypass Aman: Jika kunci rahasia belum dipasang di environment,
  // atau saat pengujian automated test, sistem tidak memblokir developer.
  if (!secretKey || secretKey === "" || process.env.NODE_ENV === "test") {
    if (process.env.NODE_ENV === "development") {
      console.log(
        "\x1b[33m[reCAPTCHA Notice]\x1b[0m RECAPTCHA_SECRET_KEY belum diisi di .env. Membuka akses otomatis untuk development."
      );
    }
    return {
      success: true,
      isBypassed: true,
    };
  }

  // Jika kunci ada tapi token dari form kosong
  if (!token || token.trim() === "") {
    return {
      success: false,
      error: "Silakan centang kotak reCAPTCHA 'Saya bukan robot' terlebih dahulu.",
    };
  }

  try {
    const formData = new URLSearchParams();
    formData.append("secret", secretKey);
    formData.append("response", token.trim());
    if (clientIp) {
      formData.append("remoteip", clientIp);
    }

    const response = await fetch("https://www.google.com/recaptcha/api/siteverify", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData.toString(),
    });

    if (!response.ok) {
      console.error("[reCAPTCHA HTTP Error]:", response.status, response.statusText);
      return {
        success: false,
        error: "Gagal memvalidasi reCAPTCHA ke server Google. Coba lagi.",
      };
    }

    const data = await response.json();

    if (data.success) {
      return {
        success: true,
        hostname: data.hostname,
      };
    } else {
      console.warn("[reCAPTCHA Verification Failed]:", data["error-codes"]);
      return {
        success: false,
        error: "Verifikasi reCAPTCHA gagal. Silakan centang ulang kotak captcha.",
      };
    }
  } catch (err: any) {
    console.error("[reCAPTCHA Exception]:", err?.message || err);
    return {
      success: false,
      error: "Terjadi gangguan saat memverifikasi reCAPTCHA. Silakan coba kembali.",
    };
  }
}
