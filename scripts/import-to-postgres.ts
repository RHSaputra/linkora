import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

async function importAll() {
  console.log("🚀 Memulai injeksi data ke PostgreSQL...");

  const exportPath = path.join(process.cwd(), "backups", "sqlite-data-export.json");
  if (!fs.existsSync(exportPath)) {
    throw new Error(`File export tidak ditemukan: ${exportPath}`);
  }

  const raw = fs.readFileSync(exportPath, "utf8");
  const data = JSON.parse(raw);

  // 1. Users
  console.log(`⏳ Mengimpor ${data.users.length} Users...`);
  for (const item of data.users) {
    await prisma.user.upsert({
      where: { id: item.id },
      update: {},
      create: {
        ...item,
        emailVerified: item.emailVerified ? new Date(item.emailVerified) : null,
        welcomeEmailSentAt: item.welcomeEmailSentAt ? new Date(item.welcomeEmailSentAt) : null,
        createdAt: new Date(item.createdAt),
        updatedAt: new Date(item.updatedAt),
      },
    });
  }

  // 2. Accounts
  console.log(`⏳ Mengimpor ${data.accounts.length} Accounts...`);
  for (const item of data.accounts) {
    await prisma.account.upsert({
      where: {
        provider_providerAccountId: {
          provider: item.provider,
          providerAccountId: item.providerAccountId,
        },
      },
      update: {},
      create: {
        ...item,
        createdAt: new Date(item.createdAt),
        updatedAt: new Date(item.updatedAt),
      },
    });
  }

  // 3. UserOnboarding
  console.log(`⏳ Mengimpor ${data.userOnboardings.length} UserOnboardings...`);
  for (const item of data.userOnboardings) {
    await prisma.userOnboarding.upsert({
      where: { userId: item.userId },
      update: {},
      create: {
        ...item,
        completedAt: item.completedAt ? new Date(item.completedAt) : null,
        dismissedAt: item.dismissedAt ? new Date(item.dismissedAt) : null,
        createdAt: new Date(item.createdAt),
        updatedAt: new Date(item.updatedAt),
      },
    });
  }

  // 4. Collections
  console.log(`⏳ Mengimpor ${data.collections.length} Collections...`);
  for (const item of data.collections) {
    await prisma.collection.upsert({
      where: { id: item.id },
      update: {},
      create: {
        ...item,
        createdAt: new Date(item.createdAt),
        updatedAt: new Date(item.updatedAt),
      },
    });
  }

  // 5. NoteFolders
  if (data.noteFolders?.length > 0) {
    console.log(`⏳ Mengimpor ${data.noteFolders.length} NoteFolders...`);
    for (const item of data.noteFolders) {
      await prisma.noteFolder.upsert({
        where: { id: item.id },
        update: {},
        create: {
          ...item,
          createdAt: new Date(item.createdAt),
          updatedAt: new Date(item.updatedAt),
        },
      });
    }
  }

  // 6. NoteTags
  if (data.noteTags?.length > 0) {
    console.log(`⏳ Mengimpor ${data.noteTags.length} NoteTags...`);
    for (const item of data.noteTags) {
      await prisma.noteTag.upsert({
        where: {
          userId_name: {
            userId: item.userId,
            name: item.name,
          },
        },
        update: {},
        create: {
          ...item,
          createdAt: new Date(item.createdAt),
        },
      });
    }
  }

  // 7. Links
  console.log(`⏳ Mengimpor ${data.links.length} Links...`);
  for (const item of data.links) {
    await prisma.link.upsert({
      where: { id: item.id },
      update: {},
      create: {
        ...item,
        lastOpenedAt: item.lastOpenedAt ? new Date(item.lastOpenedAt) : null,
        reminderAt: item.reminderAt ? new Date(item.reminderAt) : null,
        createdAt: new Date(item.createdAt),
        updatedAt: new Date(item.updatedAt),
      },
    });
  }

  // 8. CollectionLinks
  console.log(`⏳ Mengimpor ${data.collectionLinks.length} CollectionLinks...`);
  for (const item of data.collectionLinks) {
    await prisma.collectionLink.upsert({
      where: {
        collectionId_linkId: {
          collectionId: item.collectionId,
          linkId: item.linkId,
        },
      },
      update: {},
      create: {
        ...item,
        addedAt: new Date(item.addedAt),
      },
    });
  }

  // 9. Activities
  console.log(`⏳ Mengimpor ${data.activities.length} Activities...`);
  for (const item of data.activities) {
    const exists = await prisma.activity.findUnique({ where: { id: item.id } });
    if (!exists) {
      await prisma.activity.create({
        data: {
          ...item,
          createdAt: new Date(item.createdAt),
        },
      });
    }
  }

  // 10. Notes
  console.log(`⏳ Mengimpor ${data.notes.length} Notes...`);
  for (const item of data.notes) {
    await prisma.note.upsert({
      where: { id: item.id },
      update: {},
      create: {
        ...item,
        reminderAt: item.reminderAt ? new Date(item.reminderAt) : null,
        createdAt: new Date(item.createdAt),
        updatedAt: new Date(item.updatedAt),
      },
    });
  }

  // 11. NoteAttachments
  if (data.noteAttachments?.length > 0) {
    console.log(`⏳ Mengimpor ${data.noteAttachments.length} NoteAttachments...`);
    for (const item of data.noteAttachments) {
      await prisma.noteAttachment.upsert({
        where: { id: item.id },
        update: {},
        create: {
          ...item,
          createdAt: new Date(item.createdAt),
        },
      });
    }
  }

  // 12. EmailLogs
  console.log(`⏳ Mengimpor ${data.emailLogs.length} EmailLogs...`);
  for (const item of data.emailLogs) {
    const exists = await prisma.emailLog.findUnique({ where: { id: item.id } });
    if (!exists) {
      await prisma.emailLog.create({
        data: {
          ...item,
          createdAt: new Date(item.createdAt),
        },
      });
    }
  }

  // Verification
  console.log("\n🔍 Melakukan Verifikasi 1-to-1 Row Count...");
  const targetCounts = {
    users: await prisma.user.count(),
    accounts: await prisma.account.count(),
    collections: await prisma.collection.count(),
    links: await prisma.link.count(),
    collectionLinks: await prisma.collectionLink.count(),
    activities: await prisma.activity.count(),
    notes: await prisma.note.count(),
    userOnboardings: await prisma.userOnboarding.count(),
    emailLogs: await prisma.emailLog.count(),
  };

  const comparison: Record<string, { Source: number; Target: number; Status: string }> = {};
  for (const [key, targetCount] of Object.entries(targetCounts)) {
    const sourceCount = (data[key] || []).length;
    comparison[key] = {
      Source: sourceCount,
      Target: targetCount,
      Status: sourceCount === targetCount ? "✅ PASS" : "⚠️ MISMATCH",
    };
  }

  console.table(comparison);
  console.log("🎉 Injeksi data dan verifikasi selesai!");
}

importAll()
  .catch((err) => {
    console.error("❌ Gagal mengimpor data ke PostgreSQL:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
