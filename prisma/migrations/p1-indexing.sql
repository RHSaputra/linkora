-- =========================================================================
-- OPTIMASI P1: POSTGRESQL FULL-TEXT SEARCH TRIGRAM INDEXING (pg_trgm)
-- =========================================================================
-- Eksekusi SQL ini di Supabase SQL Editor / Migration untuk mempercepat pencarian
-- kueri ILIKE '%q%' hingga 10x - 50x lebih cepat (tanpa full table scan).

-- 1. Aktifkan ekstensi pg_trgm
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- 2. Indeks GIN Trigram untuk Tabel Link (Judul & Deskripsi)
CREATE INDEX IF NOT EXISTS idx_link_title_trgm ON "Link" USING gin (title gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_link_description_trgm ON "Link" USING gin (description gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_link_url_trgm ON "Link" USING gin (url gin_trgm_ops);

-- 3. Indeks GIN Trigram untuk Tabel Note (Judul & Konten)
CREATE INDEX IF NOT EXISTS idx_note_title_trgm ON "Note" USING gin (title gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_note_content_trgm ON "Note" USING gin (content gin_trgm_ops);

-- 4. Indeks Composite untuk Kueri User + Filter Favorit & Status
CREATE INDEX IF NOT EXISTS idx_link_user_fav_cat ON "Link" ("userId", "isFavorite", "category");
CREATE INDEX IF NOT EXISTS idx_note_user_status_fav ON "Note" ("userId", "status", "isFavorite", "isPinned");
