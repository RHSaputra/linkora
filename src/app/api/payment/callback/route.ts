import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    let merchantCode = "";
    let amount = "";
    let merchantOrderId = "";
    let signature = "";
    let resultCode = "";
    let email = "";

    const contentType = req.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      const body = await req.json();
      merchantCode = body.merchantCode || "";
      amount = body.amount || "";
      merchantOrderId = body.merchantOrderId || "";
      signature = body.signature || "";
      resultCode = body.resultCode || "";
      email = body.email || "";
    } else {
      const formData = await req.formData();
      merchantCode = (formData.get("merchantCode") as string) || "";
      amount = (formData.get("amount") as string) || "";
      merchantOrderId = (formData.get("merchantOrderId") as string) || "";
      signature = (formData.get("signature") as string) || "";
      resultCode = (formData.get("resultCode") as string) || "";
      email = (formData.get("email") as string) || "";
    }

    const apiKey = process.env.DUITKU_API_KEY || "abcc4f1741cd592be280c4bfab5d612b";

    // Verifikasi Signature MD5: MD5(merchantCode + amount + merchantOrderId + apiKey)
    const calcSignature = crypto
      .createHash("md5")
      .update(`${merchantCode}${amount}${merchantOrderId}${apiKey}`)
      .digest("hex");

    if (calcSignature !== signature) {
      console.warn("Invalid Duitku Callback Signature:", { calcSignature, signature });
      return NextResponse.json({ error: "Invalid Signature" }, { status: 400 });
    }

    // Jika resultCode == "00", Pembayaran Berhasil!
    if (resultCode === "00") {
      console.log(`[Duitku Callback Success] Order ${merchantOrderId} Paid Rp ${amount} by ${email}`);

      if (email) {
        const now = new Date();
        const nextMonth = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

        await prisma.user.update({
          where: { email: email.toLowerCase().trim() },
          data: {
            subscriptionPlan: "PREMIUM",
            subscriptionEndsAt: nextMonth,
          },
        });
      }
    }

    return NextResponse.json({ status: "SUCCESS" }, { status: 200 });
  } catch (error: any) {
    console.error("Duitku Callback Exception:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
