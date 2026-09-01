import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

async function exportAll() {
  console.log("🚀 Memulai ekstraksi data dari SQLite (dev.db)...");

  const data = {
    users: await prisma.user.findMany(),
    accounts: await prisma.account.findMany(),
    sessions: await prisma.session.findMany(),
    verificationTokens: await prisma.verificationToken.findMany(),
    collections: await prisma.collection.findMany(),
    noteFolders: await prisma.noteFolder.findMany(),
    noteTags: await prisma.noteTag.findMany(),
    links: await prisma.link.findMany(),
    collectionLinks: await prisma.collectionLink.findMany(),
    activities: await prisma.activity.findMany(),
    notes: await prisma.note.findMany(),
    noteAttachments: await prisma.noteAttachment.findMany(),
    userOnboardings: await prisma.userOnboarding.findMany(),
    passwordResetTokens: await prisma.passwordResetToken.findMany(),
    emailVerificationOtps: await prisma.emailVerificationOtp.findMany(),
    emailLogs: await prisma.emailLog.findMany(),
  };

  const counts: Record<string, number> = {};
  for (const [key, val] of Object.entries(data)) {
    counts[key] = (val as any[]).length;
  }

  const exportDir = path.join(process.cwd(), "backups");
  if (!fs.existsSync(exportDir)) {
    fs.mkdirSync(exportDir, { recursive: true });
  }

  const exportPath = path.join(exportDir, "sqlite-data-export.json");
  fs.writeFileSync(exportPath, JSON.stringify(data, null, 2), "utf8");

  console.log("✅ Ekstraksi selesai! Data tersimpan di:", exportPath);
  console.log("📊 Ringkasan Baris yang Diekstrak:");
  console.table(counts);
}

exportAll()
  .catch((err) => {
    console.error("❌ Ekstraksi gagal:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
