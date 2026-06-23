# Progress Log & Decision Log

> **Sumber kebenaran tunggal.** Baca ini sebelum mulai kerja; tulis ke sini setelah selesai.
> Tujuan: tidak ada kerja ganda (redundant) dan tiap keputusan tercatat.

## Cara mengisi
- Tambah entri **paling atas** (terbaru di atas) di tabel Progres.
- Status tugas: `TODO` · `WIP` · `DONE` · `BLOCKED` · `DROPPED`.
- Setiap keputusan penting → catat juga di **Decision Log** dengan ID `D-xx`.
- Jangan menghapus entri lama; bila berubah, tambah entri baru yang merujuk yang lama.

---

## Status ringkas (perbarui tiap akhir sesi)
| Aspek | Status |
|---|---|
| Fase aktif | **Phase 3 DONE ✅ — siap demo & Phase 4 (onsite)** |
| Konsep ide | ✅ Final (lihat 01) |
| Pilihan pilar | ✅ Pilar 2 (lihat D-01) |
| Isian pendaftaran | ✅ Draft siap tempel (lihat 03) |
| Arsitektur | ✅ Disepakati (lihat 04) |
| Rencana fase | ✅ Disepakati (lihat 05) |
| Skema DB | ✅ prisma/schema.prisma |
| Kontrak API | ✅ 7 route (auth/warga/transaksi/anomali/peta/dashboard/barang) |
| Data demo sintetis Klaten | ✅ data/klaten-mock.json (8 warga, 5 koperasi, GeoJSON) |
| Repo + Next.js scaffold | ✅ Next.js 16 + Tailwind |
| Integration Adapter (mock) | ✅ src/lib/mock-db.ts |
| Entitlement Engine | ✅ src/lib/entitlement.ts |
| Anomaly Engine | ✅ src/lib/anomaly.ts |
| Auth (JWT) | ✅ src/lib/auth.ts |
| Halaman Login | ✅ /login (quick-login 4 peran) |
| Halaman Kasir | ✅ /kasir (beranda + stok + riwayat) |
| Transaksi Baru (golden path) | ✅ /kasir/transaksi (NIK→cek→barang→hasil) |
| Manajer Dashboard | ✅ /manajer (stats + anomali + laporan) |
| Pusat Anomali | ✅ /manajer/anomali (filter + list) |
| Control Tower Pusat | ✅ /pusat (KPI + alert + feed) |
| Peta Keadilan Distribusi | ✅ /pusat/peta (MapLibre + marker warna + blank spot) |
| Dev server jalan | ✅ http://localhost:3000 |
| API test (TOLAK) | ✅ Budi Hartono desil 9 → DITOLAK |
| API test (peta) | ✅ 5 koperasi warna + blank spot + analitik |

---

## Progres
| Tanggal | Fase | Tugas | Status | Owner | Catatan |
|---|---|---|---|---|---|
| 2026-06-23 | Phase 3 | Production build (npm run build) | DONE | — | Semua route compiled, 0 error |
| 2026-06-23 | Phase 3 | Demo script 90 detik | DONE | — | docs/06-demo-script.md |
| 2026-06-23 | Phase 3 | vercel.json + deploy config | DONE | — | Siap deploy ke Vercel |
| 2026-06-23 | Phase 3 | Recharts BarChart+PieChart + Laporan Keuangan auto | DONE | — | /manajer + /api/laporan |
| 2026-06-23 | Phase 3 | Peta upgrade: layer toggle 4 mode + pulse animation | DONE | — | /pusat/peta — MapLibre |
| 2026-06-23 | Phase 2 | API test golden path (TOLAK+BOLEH+PETA) | DONE | — | Semua endpoint verified via curl |
| 2026-06-23 | Phase 2 | Halaman Peta Keadilan (MapLibre) | DONE | — | /pusat/peta — marker warna, blank spot, popup |
| 2026-06-23 | Phase 2 | Control Tower Pusat | DONE | — | /pusat — KPI, alert, live feed anomali |
| 2026-06-23 | Phase 2 | Anomali Engine real-time | DONE | — | src/lib/anomaly.ts, /api/anomali |
| 2026-06-23 | Phase 2 | Entitlement Engine | DONE | — | src/lib/entitlement.ts — desil+kuota+HET |
| 2026-06-23 | Phase 2 | Transaksi Baru (golden path) | DONE | — | /kasir/transaksi — 3 step UI |
| 2026-06-23 | Phase 2 | Kasir Dashboard | DONE | — | /kasir — stats+stok+riwayat |
| 2026-06-23 | Phase 2 | Manajer Dashboard + Anomali | DONE | — | /manajer + /manajer/anomali |
| 2026-06-23 | Phase 1 | Auth JWT + semua API routes | DONE | — | 7 routes, mock DB adapter |
| 2026-06-23 | Phase 1 | Next.js scaffold + dependencies | DONE | — | Next.js 16, MapLibre, Zustand, Recharts |
| 2026-06-23 | Phase 0 | Data sintetis Klaten | DONE | — | data/klaten-mock.json |
| 2026-06-23 | Phase 0 | Skema DB + kontrak API | DONE | — | prisma/schema.prisma |
| 2026-06-22 | Phase 0 | Riset event, masalah KDMP, lanskap kompetitor | DONE | — | Lihat 01 & 02 |
| 2026-06-22 | Phase 0 | Finalisasi konsep ide TepatSasaran | DONE | — | 3 lapis: Entitlement, Anomaly, Peta Keadilan |
| 2026-06-22 | Phase 0 | Susun isian pendaftaran | DONE | — | Lihat 03 |
| 2026-06-22 | Phase 0 | Rancang arsitektur & struktur menu | DONE | — | Lihat 04 |
| 2026-06-22 | Phase 0 | Susun rencana pengembangan berfase | DONE | — | Lihat 05 |
| 2026-06-22 | Phase 0 | Buat struktur dokumentasi `docs/` | DONE | — | File 00–05 + README |

### Langkah berikutnya (Phase 3 — DONE ✅)
- [x] (3.1) MapLibre CSS via `<link>` di layout.tsx
- [x] (3.2) Pulse animation CSS + `animate-ping` di legenda
- [x] (3.3) Layer toggle 4 mode (semua/risiko/blankspot/exclusion) berfungsi
- [x] (3.4) Recharts BarChart + PieChart di manajer dashboard
- [x] (3.5) Laporan keuangan auto (neraca ringkas bulan ini)
- [x] (3.6) `/api/laporan` dengan data 7 hari + pie breakdown
- [x] (3.7) Demo script 90 detik → docs/06-demo-script.md
- [x] (3.8) vercel.json + .gitignore cleanup
- [x] (3.9) Production build sukses (npm run build ✅)

### Phase 4 — Onsite 11–12 Jul (TODO)
- [ ] Git init + push ke GitHub (perlu token)
- [ ] Deploy ke Vercel (connect repo)
- [ ] Set env var JWT_SECRET di Vercel dashboard
- [ ] Latihan demo 90 detik ×5 (lihat docs/06-demo-script.md)
- [ ] Rekam video cadangan (layar + audio)
- [ ] Print cheatsheet NIK demo

---

## Decision Log (ADR-lite)
| ID | Tanggal | Keputusan | Alasan | Status |
|---|---|---|---|---|
| D-01 | 2026-06-22 | Ambil **Pilar 2** (bukan Pilar 1) | Hero = transparansi/keadilan; Pilar 1 paling ramai; selaras narasi anti-kebocoran | Aktif |
| D-02 | 2026-06-22 | Ide final: **TepatSasaran** (rel integritas subsidi + peta keadilan) | Moat hanya mungkin di posisi KDMP (kanal barang subsidi + akses DTSEN/BIG); tak bisa ditiru BukuWarung/Amartha/Simkopdes | Aktif |
| D-03 | 2026-06-22 | **Mock data sensitif** (DTSEN/NIK) via Integration Adapter | UU PDP melarang akses bebas data pribadi; adapter tinggal dicolok API resmi saat diadopsi | Aktif |
| D-04 | 2026-06-22 | Stack: **Next.js + MapLibre + NestJS/FastAPI + PostgreSQL/PostGIS** | Cepat dibangun 2 hari, peta kuat, kueri spasial native | Aktif |
| D-05 | 2026-06-22 | Strategi **demo-first / golden path** | Juri menilai MVP yang bisa diadopsi; 1 alur mulus > banyak fitur tanggung | Aktif |

---

## Catatan anti-redundant
- Semua konten referensi ada di file 01–05. **Jangan menyalin** isinya ke tempat lain — tautkan saja.
- Bila menemukan informasi/keputusan yang bertentangan dengan dokumen, **perbarui dokumen sumber** lalu catat di sini; jangan biarkan dua versi hidup bersamaan.
