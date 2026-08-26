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

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
      if (!name || name.trim().length === 0) {
        return NextResponse.json({ error: "Nama tidak boleh kosong" }, { status: 400 });
      }
      updateData.name = name.trim();
    }

    if (image !== undefined) {
      updateData.image = image || null;
    }

    // Password change
    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json({ error: "Masukkan kata sandi saat ini untuk mengubah kata sandi" }, { status: 400 });
      }

      if (user.password) {
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
          return NextResponse.json({ error: "Kata sandi saat ini tidak cocok" }, { status: 400 });
        }
      }

      if (newPassword.length < 6) {
        return NextResponse.json({ error: "Kata sandi baru minimal 6 karakter" }, { status: 400 });
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
    return NextResponse.json({ error: error?.message || "Failed to update profile" }, { status: 500 });
  }
}
