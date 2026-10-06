import { auth } from "@/auth";
import { getUserEntitlement } from "@/lib/subscription";
import { NextResponse } from "next/server";

export async function enforceServerEntitlement() {
  const session = await auth();

  if (!session || !session.user || !session.user.email) {
    return {
      allowed: false,
      response: NextResponse.json(
        { error: "Anda harus masuk ke akun Linkorian untuk menggunakan fitur Riset." },
        { status: 401 }
      ),
    };
  }

  const entitlement = await getUserEntitlement(session.user.email);

  if (!entitlement.hasAccess) {
    return {
      allowed: false,
      response: NextResponse.json(
        {
          error: entitlement.message,
          status: entitlement.status,
          trialClaimed: entitlement.trialClaimed,
        },
        { status: 403 }
      ),
    };
  }

  return { allowed: true, session, entitlement };
}
