# 04 — Arsitektur

## Alur besar (end-to-end)
```
WARGA datang ke gerai koperasi
        │
        ▼
[1] KASIR scan KTP/NIK  ──►  [2] CEK HAK (Entitlement Engine)
                                  ├─ DTSEN: desil berapa? berhak?
                                  ├─ RDKK/e-Alokasi: kuota pupuk sisa?
                                  └─ Aturan: HET, batas beli
        │  valid / ditolak / warning
        ▼
[3] CATAT TRANSAKSI subsidi ──► log append-only (tak bisa diubah) + update stok
        ▼
[4] ENGINE ANOMALI (real-time): over-kuota? tak layak? markup>HET? ganda/ghost?
        ▼
[5] AGREGASI
        ├──► Dashboard KOPERASI (laporan otomatis)
        └──► PETA KEADILAN nasional (exclusion / inclusion / blank spot)
```
**Inti:** 1 transaksi → 3 output (bukti tepat sasaran, laporan keuangan, peta keadilan).

## Peran pengguna
| Peran | Siapa | Perangkat |
|---|---|---|
| Kasir / Pengurus | Operator gerai | HP/tablet (PWA) |
| Manajer / Pengawas Koperasi | Ketua/pengawas | Web |
| Pemda / Dinas | Pengawas kab/prov | Web (peta) |
| Admin Kemenkop (Pusat) | Control tower nasional | Web (peta + audit) |

## Struktur menu (FE)
**A. Kasir (PWA):** Beranda · Transaksi Baru (scan→cek hak→bayar) · Stok Gerai · Riwayat · Notifikasi
**B. Manajer Koperasi:** Dashboard · Laporan Keuangan (auto) · Penyaluran Subsidi · Pusat Anomali · Inventori & Pemasok · Anggota & Simpan-Pinjam · Pengaturan
**C. Pemda/Dinas:** Peta Wilayah · Analitik Distribusi · Anomali Wilayah · Ekspor Laporan
**D. Admin Kemenkop (Control Tower ⭐):** Peta Keadilan Distribusi (nasional, drill-down) · Pusat Integritas (anomali real-time) · Statistik Program · Kesehatan Koperasi · Integrasi Data · Audit Trail

## Arsitektur teknis
```
FRONTEND  — Next.js (React): PWA POS + Web Dashboard
            Peta: MapLibre/Leaflet + GeoJSON batas desa (BIG)
            UI: Tailwind + shadcn/ui · State: React Query
   │ REST/JSON (atau tRPC)
BACKEND   — NestJS (Node) atau FastAPI (Python). Modul:
            Auth & RBAC · Koperasi & Gerai · Transaksi (append-only)
            Entitlement Engine · Anomaly Engine · Laporan Keuangan
            Geo/Analytics · Integration Adapter
   │
DATA      — PostgreSQL + PostGIS ⭐ · Redis (cache) · Object store (foto nota)
INTEGRASI — Adapter: DTSEN(mock) · Dukcapil(mock) · RDKK(mock)
            PODES(BPS API, real) · Batas desa BIG (GeoJSON, real)
```
- **PostGIS wajib:** blank spot, cakupan layanan, radius = kueri spasial 1 baris SQL.
- **Integration Adapter:** satu interface seragam; mock saat hackathon, API resmi saat produksi (argumen "siap produksi" + patuh UU PDP).

## Dua engine
- **Entitlement Engine** (saat transaksi): `NIK + barang + jumlah` → ambil desil(DTSEN)+kuota(RDKK)+HET → `BOLEH/TOLAK/WARNING` + alasan.
- **Anomaly Engine** (real-time + batch): rules cepat (over-kuota, harga>HET, desil 8–10, frekuensi) + skor risiko koperasi (0–100) + spasial (cakupan vs kemiskinan PODES → exclusion/blank spot).

## Stack rekomendasi (realistis 2 hari)
| Layer | Pilihan | Alasan |
|---|---|---|
| FE | Next.js + Tailwind + shadcn/ui | 1 repo POS+dashboard, deploy cepat (Vercel) |
| Peta | MapLibre GL + GeoJSON BIG | gratis, "wow" di proyektor |
| BE | NestJS (atau FastAPI) | modular, cepat |
| DB | PostgreSQL + PostGIS (Supabase) | spasial + auth bawaan |
| Scan KTP | kamera+OCR ringan / input NIK manual | jangan habis waktu di OCR |
| Seed | 1 kab, ~5 koperasi, ~200 warga sintetis | cukup buat peta "nyala" |
