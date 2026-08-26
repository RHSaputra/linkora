import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Create a seed/demo user first
  const hashedPassword = await bcrypt.hash("demo1234", 10);
  const seedUser = await prisma.user.upsert({
    where: { email: "demo@linkvault.app" },
    update: {},
    create: {
      name: "Demo User",
      email: "demo@linkvault.app",
      password: hashedPassword,
    },
  });

  const collections = await Promise.all([
    prisma.collection.upsert({
      where: { id: "seed-magang-2026" },
      update: {},
      create: {
        id: "seed-magang-2026",
        name: "Magang 2026",
        description: "Kumpulan link magang dan internship",
        color: "#f59e0b",
        icon: "briefcase",
        userId: seedUser.id,
      },
    }),
    prisma.collection.upsert({
      where: { id: "seed-beasiswa" },
      update: {},
      create: {
        id: "seed-beasiswa",
        name: "Beasiswa Luar Negeri",
        description: "Info beasiswa internasional",
        color: "#10b981",
        icon: "graduation-cap",
        userId: seedUser.id,
      },
    }),
    prisma.collection.upsert({
      where: { id: "seed-nextjs" },
      update: {},
      create: {
        id: "seed-nextjs",
        name: "Belajar Next.js",
        description: "Tutorial dan dokumentasi Next.js",
        color: "#3b82f6",
        icon: "code",
        userId: seedUser.id,
      },
    }),
    prisma.collection.upsert({
      where: { id: "seed-ai-tools" },
      update: {},
      create: {
        id: "seed-ai-tools",
        name: "AI Tools",
        description: "Tools AI untuk produktivitas",
        color: "#8b5cf6",
        icon: "sparkles",
        userId: seedUser.id,
      },
    }),
  ]);

  const sampleLinks = [
    {
      url: "https://nextjs.org",
      title: "Next.js — The React Framework",
      description: "Production grade React applications that scale",
      category: "Tutorial",
      tags: JSON.stringify(["react", "nextjs", "web"]),
      favicon: "https://www.google.com/s2/favicons?domain=nextjs.org&sz=64",
      isFavorite: true,
    },
    {
      url: "https://vercel.com",
      title: "Vercel — Develop. Preview. Ship.",
      description: "The platform for frontend developers",
      category: "Project",
      tags: JSON.stringify(["deployment", "hosting"]),
      favicon: "https://www.google.com/s2/favicons?domain=vercel.com&sz=64",
      isFavorite: true,
    },
    {
      url: "https://openai.com",
      title: "OpenAI",
      description: "Creating safe AGI that benefits all of humanity",
      category: "AI Tools",
      tags: JSON.stringify(["ai", "gpt", "tools"]),
      favicon: "https://www.google.com/s2/favicons?domain=openai.com&sz=64",
      isFavorite: false,
    },
    {
      url: "https://github.com",
      title: "GitHub — Build and ship software",
      description: "Where the world builds software",
      category: "Project",
      tags: JSON.stringify(["git", "code", "collaboration"]),
      favicon: "https://www.google.com/s2/favicons?domain=github.com&sz=64",
      isFavorite: true,
    },
    {
      url: "https://tailwindcss.com",
      title: "Tailwind CSS",
      description: "Rapidly build modern websites",
      category: "Tutorial",
      tags: JSON.stringify(["css", "design"]),
      favicon: "https://www.google.com/s2/favicons?domain=tailwindcss.com&sz=64",
      isFavorite: false,
    },
  ];

  for (const link of sampleLinks) {
    const existing = await prisma.link.findFirst({ where: { url: link.url, userId: seedUser.id } });
    if (!existing) {
      const created = await prisma.link.create({ data: { ...link, userId: seedUser.id } });
      if (link.category === "AI Tools") {
        await prisma.collectionLink.create({
          data: { collectionId: collections[3].id, linkId: created.id },
        });
      }
      if (link.category === "Tutorial" && link.url.includes("nextjs")) {
        await prisma.collectionLink.create({
          data: { collectionId: collections[2].id, linkId: created.id },
        });
      }
    }
  }

  console.log("✅ Seed completed! Demo user: demo@linkvault.app / demo1234");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
