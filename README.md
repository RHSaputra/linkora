# LinkVault

Modern link manager untuk menyimpan, mengelola, mencari, dan membuka kembali website penting dengan cepat.

## Fitur

- **Dashboard** — Statistik link, favorit, kategori, dan recent activity
- **Tambah Link** — URL, judul, deskripsi, kategori, tag, catatan, reminder
- **Auto Metadata** — Favicon, judul, thumbnail, dan deskripsi otomatis saat paste URL
- **Kategori** — Magang, Beasiswa, Video, AI Tools, Kampus, Tutorial, Lowongan Kerja, Project, Custom
- **Pencarian** — Realtime search dengan filter kategori, tag, dan favorit
- **Quick Open** — Klik card langsung buka website di tab baru
- **Favorite** — Pin link penting di dashboard
- **Recent Activity** — Riwayat link terakhir dibuka
- **Collections** — Folder untuk organisasi link
- **Reminder** — Pengingat opsional untuk membuka kembali link
- **Dark/Light Mode** — Tema modern dengan animasi halus

## Tech Stack

- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS v4
- Shadcn UI (Radix)
- Prisma + SQLite (default) / MySQL
- Framer Motion

## Getting Started

```bash
# Install dependencies
npm install

# Setup database
npm run db:push

# Seed sample data (optional)
npm run db:seed

# Run development server
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000)

## Database

Default menggunakan SQLite (`prisma/dev.db`) — langsung jalan tanpa setup eksternal.

Untuk MySQL, ubah `provider` di `prisma/schema.prisma` menjadi `mysql` dan set `DATABASE_URL` di `.env`:

```
DATABASE_URL="mysql://user:password@localhost:3306/linkvault"
```

## Struktur

```
src/
├── app/              # Pages & API routes
├── components/       # UI components
├── hooks/            # Data fetching hooks
└── lib/              # Utils, types, validations
```
