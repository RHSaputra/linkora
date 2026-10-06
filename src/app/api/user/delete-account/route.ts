import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { OWNER_EMAIL } from "@/lib/subscription";

export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session || !session.user || !session.user.id || !session.user.email) {
      return NextResponse.json(
        { error: "Permintaan ditolak. Anda belum masuk." },
        { status: 401 }
      );
    }

    const currentUserId = session.user.id;
    const currentUserEmail = session.user.email.toLowerCase().trim();

    const body = await req.json().catch(() => ({}));
    const targetUserId = body.userId || currentUserId;

    // Authorization Rule: User can ONLY delete their own account.
    if (targetUserId !== currentUserId) {
      return NextResponse.json(
        { error: "Hak akses ditolak. Anda hanya diperbolehkan menghapus akun Anda sendiri." },
        { status: 403 }
      );
    }

    // Protection Rule: Web Owner account cannot be deleted by non-owners or API calls.
    if (currentUserEmail === OWNER_EMAIL) {
      return NextResponse.json(
        { error: "Akun Pemilik Utama (Owner) dilindungi dan tidak dapat dihapus." },
        { status: 403 }
      );
    }

    // Delete user and associated relations (cascade)
    await prisma.user.delete({
      where: { id: currentUserId },
    });

    return NextResponse.json({
      success: true,
      message: "Akun Anda berhasil dihapus sepenuhnya.",
    });
  } catch (error: any) {
    console.error("[Delete Account Route Error]:", error);
    return NextResponse.json(
      { error: "Gagal menghapus akun. Silakan coba lagi nanti." },
      { status: 500 }
    );
  }
}
