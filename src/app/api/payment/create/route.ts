import { NextResponse } from "next/server";
import { auth } from "@/auth";
import crypto from "crypto";

export async function POST(_req: Request) {
  try {
    const session = await auth();

    if (!session || !session.user || !session.user.email) {
      return NextResponse.json(
        { ok: false, error: "Silakan masuk terlebih dahulu untuk membeli langganan." },
        { status: 401 }
      );
    }

    const email = session.user.email;
    const name = session.user.name || "Pengguna Linkora";

    // Data transaksi Duitku
    const merchantCode = process.env.DUITKU_MERCHANT_CODE || "DS36252";
    const apiKey = process.env.DUITKU_API_KEY || "abcc4f1741cd592be280c4bfab5d612b";
    const env = process.env.DUITKU_ENV || "sandbox";

    const paymentAmount = 25000; // Rp 25.000 / bulan
    const merchantOrderId = `LK-${Date.now()}`;
    const productDetails = "Langganan Premium Pusat Riset Linkora (1 Bulan)";

    // Signature MD5: MD5(merchantCode + merchantOrderId + paymentAmount + apiKey)
    const signatureStr = `${merchantCode}${merchantOrderId}${paymentAmount}${apiKey}`;
    const signature = crypto.createHash("md5").update(signatureStr).digest("hex");

    const appUrl = process.env.APP_URL || "https://linkorian.online";
    const callbackUrl = `${appUrl}/api/payment/callback`;
    const returnUrl = `${appUrl}/scopus`;

    let paymentMethod = "VC"; // Default checkout page
    try {
      const body = await _req.json();
      if (body.paymentMethod) paymentMethod = body.paymentMethod;
    } catch (_e) {
      // Use default VC
    }

    const requestBody = {
      merchantCode,
      paymentAmount,
      paymentMethod,
      merchantOrderId,
      productDetails,
      email,
      customerVaName: name,
      callbackUrl,
      returnUrl,
      signature,
      expiryPeriod: 60, // Expiry in 60 minutes
    };

    const endpoint =
      env === "production"
        ? "https://passport.duitku.com/webapi/api/merchant/v2/inquiry"
        : "https://sandbox.duitku.com/webapi/api/merchant/v2/inquiry";

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    const data = await response.json();

    if (data.paymentUrl) {
      return NextResponse.json({
        ok: true,
        paymentUrl: data.paymentUrl,
        reference: data.reference,
        merchantOrderId,
        amount: paymentAmount,
        message: "Invoice Duitku berhasil dibuat.",
      });
    } else {
      console.error("Duitku API Inquiry Error:", data);
      const errMsg = data.statusMessage || data.Message || data.message || "Gagal menghubungi gerbang pembayaran Duitku.";
      return NextResponse.json(
        {
          ok: false,
          error: errMsg,
        },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error("Create payment error:", error);
    return NextResponse.json(
      { ok: false, error: "Terjadi kesalahan saat memproses pembayaran Duitku." },
      { status: 500 }
    );
  }
}
