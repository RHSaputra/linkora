import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        createdAt: true,
        _count: {
          select: {
            links: true,
            notes: true,
            collections: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
      createdAt: user.createdAt,
      stats: {
        totalLinks: user._count.links,
        totalNotes: user._count.notes,
        totalCollections: user._count.collections,
      },
    });
  } catch (error) {
    console.error("GET /api/user/profile error:", error);
    return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 });
  }
}

import { rateLimit } from "@/lib/rate-limit";

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Rate limiting: 10 profile updates per 5 minutes per user
    const limitCheck = await rateLimit(`profile_update_${session.user.id}`, {
      limit: 10,
      windowMs: 5 * 60 * 1000,
    });
    if (!limitCheck.success) {
      return NextResponse.json(
        { error: `Terlalu banyak permintaan pembaruan profil. Tunggu ${limitCheck.reset} detik.` },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { name, image, currentPassword, newPassword } = body;

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const updateData: {
      name?: string;
      image?: string | null;
      password?: string;
    } = {};

    if (name !== undefined) {
      if (!name || typeof name !== "string" || name.trim().length === 0) {
        return NextResponse.json({ error: "Nama tidak boleh kosong" }, { status: 400 });
      }
      if (name.trim().length > 100) {
        return NextResponse.json({ error: "Nama maksimal 100 karakter" }, { status: 400 });
      }
      updateData.name = name.trim();
    }

    // Strict image validation
    if (image !== undefined) {
      if (image === null || image === "") {
        updateData.image = null;
      } else if (typeof image === "string") {
        if (image.length > 500 * 1024) {
          return NextResponse.json({ error: "Ukuran avatar terlalu besar (maksimal 500 KB)" }, { status: 400 });
        }
        if (image.startsWith("data:")) {
          const match = image.match(/^data:([A-Za-z-+\/]+);base64,/);
          const mime = match ? match[1].toLowerCase() : "";
          const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
          if (!allowed.includes(mime)) {
            return NextResponse.json({ error: "Format gambar avatar tidak didukung. Gunakan PNG, JPEG, atau WebP." }, { status: 400 });
          }
          updateData.image = image;
        } else if (image.startsWith("https://")) {
          updateData.image = image;
        } else {
          return NextResponse.json({ error: "Format URL avatar tidak valid" }, { status: 400 });
        }
      } else {
        return NextResponse.json({ error: "Data gambar tidak valid" }, { status: 400 });
      }
    }

    // Password change validation
    if (newPassword) {
      if (typeof newPassword !== "string" || newPassword.length < 6) {
        return NextResponse.json({ error: "Kata sandi baru minimal 6 karakter" }, { status: 400 });
      }
      if (newPassword.length > 128) {
        return NextResponse.json({ error: "Kata sandi baru maksimal 128 karakter" }, { status: 400 });
      }
      if (!currentPassword) {
        return NextResponse.json({ error: "Masukkan kata sandi saat ini untuk mengubah kata sandi" }, { status: 400 });
      }

      if (user.password) {
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
          return NextResponse.json({ error: "Kata sandi saat ini tidak cocok" }, { status: 400 });
        }
      }

      updateData.password = await bcrypt.hash(newPassword, 10);
    }

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      message: "Profil berhasil diperbarui",
      user: updatedUser,
    });
  } catch (error: any) {
    console.error("PATCH /api/user/profile error:", error);
    return NextResponse.json({ error: "Gagal memperbarui profil" }, { status: 500 });
  }
}

