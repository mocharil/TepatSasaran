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
| Fase aktif | Phase 0 — Fondasi & Desain |
| Konsep ide | ✅ Final (lihat 01) |
| Pilihan pilar | ✅ Pilar 2 (lihat D-01) |
| Isian pendaftaran | ✅ Draft siap tempel (lihat 03) |
| Arsitektur | ✅ Disepakati (lihat 04) |
| Rencana fase | ✅ Disepakati (lihat 05) |
| Skema DB | ⬜ Belum (Phase 0.3) |
| Kontrak API | ⬜ Belum (Phase 0.3) |
| Data demo (BIG/PODES/sintetis) | ⬜ Belum (Phase 0.5) |
| Repo + deploy | ⬜ Belum (Phase 0.4) |

---

## Progres
| Tanggal | Fase | Tugas | Status | Owner | Catatan |
|---|---|---|---|---|---|
| 2026-06-22 | Phase 0 | Riset event, masalah KDMP, lanskap kompetitor | DONE | — | Lihat 01 & 02 |
| 2026-06-22 | Phase 0 | Finalisasi konsep ide TepatSasaran | DONE | — | 3 lapis: Entitlement, Anomaly, Peta Keadilan |
| 2026-06-22 | Phase 0 | Susun isian pendaftaran | DONE | — | Lihat 03 |
| 2026-06-22 | Phase 0 | Rancang arsitektur & struktur menu | DONE | — | Lihat 04 |
| 2026-06-22 | Phase 0 | Susun rencana pengembangan berfase | DONE | — | Lihat 05 |
| 2026-06-22 | Phase 0 | Buat struktur dokumentasi `docs/` | DONE | — | File 00–05 + README |

### Langkah berikutnya (next actions)
- [ ] (0.3) Skema database + PostGIS
- [ ] (0.3) Kontrak API
- [ ] (0.1) Kunci skenario golden path final + pilih kabupaten demo
- [ ] (0.5) Unduh batas desa BIG 1 kabupaten + PODES + generate data sintetis

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
