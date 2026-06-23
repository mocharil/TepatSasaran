# 03 — Isian Pendaftaran (siap tempel)

## Kategori Tema Solusi
✅ **Pilar 2: Keterlibatan Masyarakat dalam Berkoperasi**
*(Alasan pilih Pilar 2 — lihat Decision D-01 di progress log. Versi cadangan Pilar 1 bisa dibuat bila diperlukan.)*

## Judul Ide / Solusi Aplikasi
**TepatSasaran — Rel Transparansi & Peta Keadilan Distribusi KDMP**
*(alternatif pendek: TepatSasaran)*

## Problem Statement (±130 kata)
> Sejak 2026, sekitar Rp34 triliun dana desa dialirkan melalui lebih dari 80.000 Koperasi Desa/Kelurahan Merah Putih, yang kini menjadi kanal resmi penyaluran barang bersubsidi negara: pupuk subsidi, LPG 3kg, bansos, dan sembako murah. Masalahnya, penyaluran ini belum terpantau secara digital dan real-time, padahal "subsidi salah sasaran" adalah persoalan kronis di Indonesia. Akibatnya muncul risiko kebocoran—penerima tidak layak ikut menikmati subsidi, sementara keluarga miskin (desil 1–4) justru terlewat. Masyarakat grassroot tidak punya cara melihat apakah bantuan disalurkan secara adil, dan Kemenkop sulit membuktikan akuntabilitas saat diaudit. TepatSasaran menyelesaikannya dengan memverifikasi hak penerima pada saat transaksi, mencatatnya secara tak-terubah, lalu menyajikan Peta Keadilan Distribusi yang transparan kepada pengurus, pengawas, dan masyarakat—mengubah koperasi menjadi instrumen transparansi tata kelola, bukan sekadar gerai.

## Deskripsi Solusi Teknis & Kebaruan Ide (±285 kata)
> TepatSasaran adalah rel transparansi penyaluran untuk KDMP yang bekerja di tiga lapis.
>
> **(1) Entitlement Engine** — saat warga bertransaksi, kasir memindai NIK/KTP; sistem memverifikasi hak secara real-time dengan memadukan desil kesejahteraan (DTSEN), sisa kuota (RDKK/e-Alokasi pupuk), dan Harga Eceran Tertinggi. Hasilnya: keputusan BOLEH/TOLAK/PERINGATAN beserta alasannya, sehingga penyaluran tepat sasaran sejak titik transaksi.
>
> **(2) Anomaly Engine** — setiap transaksi dicatat pada log tak-terubah (append-only) dan dinilai risikonya: penerima tidak layak (desil 8–10), pembelian melebihi kuota, harga di atas HET, hingga pola ganda/ghost recipient.
>
> **(3) Peta Keadilan Distribusi** — memakai PostGIS, batas desa resmi (BIG), dan statistik desa (PODES BPS) untuk memetakan exclusion error (warga miskin tak kebagian), inclusion error (kebocoran), dan blank spot wilayah tak terlayani—transparan bagi pengawas, Pemda, Kemenkop, dan masyarakat.
>
> **Kebaruan & diferensiasi.** Aplikasi eksisting seperti BukuWarung/BukuKas hanya mencatat keuangan, Amartha hanya melakukan credit scoring individu, dan Simkopdes fokus administrasi koperasi. Tidak satu pun memiliki akses ke DTSEN, batas desa resmi, maupun posisi sebagai kanal barang subsidi—sehingga secara struktural tidak bisa melakukan analisis keadilan distribusi spasial. Kebaruan TepatSasaran adalah menyatukan data yang negara sudah miliki (DTSEN + PODES + batas BIG + transaksi koperasi) menjadi peta keadilan distribusi real-time pertama untuk ekosistem KDMP.
>
> **Prinsip kerja & kesiapan.** Arsitektur memakai pola Integration Adapter: selama hackathon, data sensitif disimulasikan dengan dataset sintetis berstruktur DTSEN; saat diadopsi Kemenkop, adapter tinggal dialihkan ke API resmi tanpa mengubah aplikasi—menghormati UU PDP. Stack: Next.js (PWA POS + dashboard), MapLibre (peta), backend NestJS/FastAPI, serta PostgreSQL+PostGIS untuk kueri spasial. Hasil akhir: subsidi yang tepat sasaran sekaligus bukti transparansi yang dapat diaudit.

## Catatan
- "KDKMP" pada teks form asli kemungkinan typo dari **KDMP**.
- Patuhi batas kata: Problem ≤150, Solusi ≤300.
