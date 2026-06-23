# TepatSasaran — Dokumentasi Proyek

> **Rel Transparansi & Peta Keadilan Distribusi untuk Koperasi Desa/Kelurahan Merah Putih (KDMP)**
> Proyek untuk **Hackathon Digital Cooperatives Expo 2026** (Kemenkop RI × PEBS FEB UI).

## Status proyek
- **Fase saat ini:** Phase 0 — Fondasi & Desain
- **Pilar dipilih:** Pilar 2 — Keterlibatan Masyarakat dalam Berkoperasi
- **Tanggal mulai:** 2026-06-22
- **Tenggat kunci:** Pendaftaran 25 Jun · Bootcamp 2–8 Jul · Hackathon+Pitch onsite **11–12 Jul 2026**

## Cara pakai dokumen ini
1. **Sebelum mengerjakan apa pun**, baca [`00-progress-log.md`](00-progress-log.md) untuk tahu status terkini & menghindari kerja ganda.
2. Setelah menyelesaikan tugas, **wajib catat** di `00-progress-log.md` (entri progres + keputusan bila ada).
3. Dokumen 01–05 adalah **referensi yang stabil**. Ubah hanya bila ada keputusan baru, dan catat perubahannya di progress log.

## Indeks dokumen
| File | Isi |
|---|---|
| [`00-progress-log.md`](00-progress-log.md) | **Log progres + decision log (anti-redundant).** Mulai dari sini. |
| [`01-konsep-ide.md`](01-konsep-ide.md) | Konteks program, masalah, ide, kebaruan, diferensiasi |
| [`02-sumber-data.md`](02-sumber-data.md) | Sumber data (BIG/BPS/DTSEN), terbuka vs terbatas, UU PDP |
| [`03-pendaftaran.md`](03-pendaftaran.md) | Isian form pendaftaran (pilar, judul, problem, solusi) |
| [`04-arsitektur.md`](04-arsitektur.md) | Alur, peran, struktur menu, arsitektur FE/BE/Data, engine, stack |
| [`05-rencana-pengembangan.md`](05-rencana-pengembangan.md) | Fase pengembangan, timeline, peran tim, golden path, risiko |

## Aturan emas eksekusi
1. **Golden path dulu** — 1 alur demo sempurna > 10 fitur setengah jadi.
2. **Vertical slice** — bangun tembus FE→BE→DB per alur.
3. **Mock by default** — data sensitif (DTSEN/NIK) sintetis; hanya peta (BIG) & PODES yang asli.
4. **Cut-list siap** — tiap fase punya daftar yang boleh dibuang bila mepet.
