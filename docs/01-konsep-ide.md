# 01 — Konsep Ide

## Event
**Hackathon Digital Cooperatives Expo 2026** — Kemenkop RI × PEBS FEB UI.
Tema: memodernisasi ekosistem koperasi Indonesia lewat inovasi digital; output berupa **MVP**.

Timeline: Reg 12–25 Jun · Kurasi 25 Jun–2 Jul · Bootcamp online 2–8 Jul · **Hackathon+Pitching onsite 11–12 Jul** · Pengumuman 12 Jul.
Tim 2–3 WNI (17+). **Top 10 wajib serahkan HAKI ke Kemenkop** → juri memilih yang bisa benar-benar diadopsi.

Empat pilar (pilih satu): (1) Peningkatan Volume Usaha, (2) Keterlibatan Masyarakat/transparansi tata kelola, (3) Potensi Ekonomi Desa, (4) Literasi Gen-Z/Alpha. → **Kita ambil Pilar 2** (lihat Decision D-01).

## Konteks masalah (KDMP)
- Program nasional: **80.000 Koperasi Desa/Kelurahan Merah Putih**; unit usaha: sembako, apotek/klinik, simpan-pinjam, cold storage, distribusi logistik.
- KDMP jadi **kanal resmi barang bersubsidi negara**: pupuk subsidi, LPG 3kg, bansos, sembako murah, penyerapan gabah untuk Bulog.
- Sejak 2026, **±Rp34 triliun dana desa** (PMK 7/2026, 58,03%) dialirkan ke KDMP.
- Masalah terdokumentasi: koperasi **tidak bankable**, kapasitas pengelola lemah, target molor (±20rb dari 80rb beroperasi), dan **"subsidi salah sasaran"** kronis.

## Masalah yang kita sasar
Penyaluran barang subsidi via KDMP **belum terpantau digital real-time**, sehingga:
- 🔴 **Exclusion error** — keluarga miskin (desil 1–4) terlewat.
- 🟠 **Inclusion error / kebocoran** — yang mampu (desil 8–10) ikut menikmati.
- ⚫ **Blank spot** — wilayah tak terlayani koperasi mana pun.
- Masyarakat tak bisa melihat keadilan distribusi; Kemenkop sulit buktikan akuntabilitas saat diaudit.

## Ide: TepatSasaran (3 lapis)
1. **Entitlement Engine** — saat transaksi, scan NIK → verifikasi hak real-time (desil DTSEN + kuota RDKK/e-Alokasi + HET) → BOLEH/TOLAK/PERINGATAN beserta alasan.
2. **Anomaly Engine** — tiap transaksi dicatat pada log tak-terubah (append-only) + dinilai risiko (tak layak, over-kuota, markup > HET, pola ganda/ghost).
3. **Peta Keadilan Distribusi** — PostGIS + batas desa BIG + statistik PODES → visualisasi exclusion/inclusion/blank spot, drill-down nasional→desa.

## Kebaruan & diferensiasi
| Eksisting | Yang mereka lakukan | Kenapa tak bisa meniru |
|---|---|---|
| BukuWarung / BukuKas | Pembukuan UMKM | Tak punya akses DTSEN/batas desa; bukan kanal subsidi |
| Amartha (AScore.ai) | Credit scoring individu | Sama; fokus pinjaman, bukan keadilan distribusi |
| Simkopdes | Administrasi koperasi resmi | Tak melakukan analisis keadilan spasial; kita **pelengkap**, bukan pesaing |

**Moat:** hanya posisi KDMP yang menyatukan (a) kanal barang subsidi, (b) akses data negara (DTSEN/PODES/BIG), (c) kepemilikan pemerintah. TepatSasaran = peta keadilan distribusi real-time **pertama** untuk ekosistem KDMP.

## Pitch hook
> "Rp34 triliun mengalir lewat 80.000 koperasi tanpa cara real-time memastikan subsidi tepat sasaran. Kami rel yang menjamin itu — dan menyalakan peringatan saat ada kebocoran."
