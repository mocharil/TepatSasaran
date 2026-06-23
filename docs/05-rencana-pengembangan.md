# 05 — Rencana Pengembangan

> Time-boxed ke kalender hackathon (hari ini 22 Jun → pitch 11–12 Jul). Prinsip: **demo-first**.
> ⚠️ Cek aturan resmi: seberapa banyak MVP boleh dibangun sebelum onsite. Rencana ini aman — Phase 0 = persiapan (desain/data/skeleton); logika inti dibangun saat bootcamp.

## Prinsip eksekusi
1. Golden path dulu — 1 alur demo sempurna > 10 fitur tanggung.
2. Vertical slice — bangun tembus FE→BE→DB per alur.
3. Mock by default — data sensitif sintetis; asli hanya peta (BIG) & PODES.
4. Cut-list siap — tiap fase punya yang boleh dibuang bila mepet.

## Peran tim (3 orang)
| Peran | Tanggung jawab |
|---|---|
| A — Backend/Data | DB+PostGIS, API, engine, seed data, adapter |
| B — Frontend | PWA POS + dashboard + peta (MapLibre) |
| C — Product/Pitch | UX/wireframe, skenario demo, deck, narasi, QA |

## Fase

### Phase 0 — Fondasi & Desain · 22 Jun – 1 Jul (nunggu kurasi)
| # | Tugas | Owner | Output |
|---|---|---|---|
| 0.1 | Kunci golden path (1 skenario) | C | 1 paragraf |
| 0.2 | Wireframe 4 layar kunci | C | Figma/sketsa |
| 0.3 | Skema DB + kontrak API | A | schema.sql + API doc |
| 0.4 | Repo + CI + deploy kosong | A+B | URL hidup |
| 0.5 | Data: batas desa BIG (1 kab) + PODES + sintetis warga/transaksi | A | GeoJSON + seed.sql |
| 0.6 | Pilih kabupaten demo | C | nama kab |

**Exit:** kontrak API & skema beku → FE/BE paralel.

### Phase 1 — Skeleton & Data Layer · 2–4 Jul (bootcamp)
DB+PostGIS up & seed (A) · Auth+RBAC 4 peran (A) · API CRUD koperasi/barang/transaksi (A) · Integration Adapter mock (A) · FE shell + login (B) · Peta render batas desa+titik koperasi (B)
**Exit:** login kasir & admin, peta tampil, data ada. **Cut:** RBAC → 2 peran.

### Phase 2 — Golden Path (vertical slice) · 5–8 Jul ⭐ paling kritis
Entitlement Engine (A) · Layar Transaksi kasir input NIK→keputusan→catat (B) · Append-only log + stok (A) · Anomaly Engine rules dasar (A) · Dashboard koperasi: laporan auto + anomali (B) · Peta Control Tower: titik berubah warna saat anomali (B) · Uji end-to-end (C)
**Exit:** transaksi bocor ditolak di kasir → merah di Control Tower. **Cut:** laporan keuangan lengkap → ringkasan saja.

### Phase 3 — Peta Keadilan & Polish · 9–10 Jul
Layer exclusion/inclusion/blank spot (A+B) · Drill-down nasional→desa (B) · Polish UI + animasi "peta menyala" (B) · Tanam 1 kasus bocor di seed (A+C) · Statistik program (A)
**Exit:** layak panggung, peta bercerita sendiri.

### Phase 4 — Onsite + Pitch · 11–12 Jul
Integrasi final + bug bash (A+B) · Rekam video demo cadangan (C) · Latihan demo 90 detik ×5 (semua) · Finalisasi deck (C) · Submit + pitch (semua)

## Golden path (skenario demo)
> Bu Siti (desil 2, petani terdaftar) beli pupuk subsidi → BOLEH, tercatat. Pak Budi (desil 9) coba beli pupuk subsidi → DITOLAK + alasan. Kasir markup harga > HET → flag. Potong ke Control Tower: peta kabupaten menyala — 1 desa merah (kebocoran), 1 desa abu (exclusion/blank spot). Statistik: "Rp X kebocoran dicegah, 87% tepat sasaran."

Semua keputusan teknis diukur: *"apakah ini bikin golden path lebih meyakinkan?"* Kalau tidak → cut-list.

## Manajemen risiko
| Risiko | Mitigasi |
|---|---|
| PostGIS/peta makan waktu | Siapkan GeoJSON di Phase 0.5; fallback Leaflet sederhana |
| Scope melebar | Cut-list + golden path sebagai hakim |
| Demo gagal onsite | Video cadangan + data seed lokal (bukan API live) |
| Aturan larang pre-build | Phase 0 hanya desain/data/scaffold |
