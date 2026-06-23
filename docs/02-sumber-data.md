# 02 — Sumber Data

Prinsip: **kita tidak butuh data baru** — kita menyatukan data yang negara sudah punya. Pisahkan tegas antara data **terbuka** (boleh dipakai sekarang) dan **terlindungi** (UU PDP, hanya lewat mekanisme resmi).

## A. Terbuka — pakai sekarang (untuk demo)
| Data | Sumber | Isi | Akses |
|---|---|---|---|
| Batas desa (peta) | BIG — geoservices.big.go.id | Poligon batas 80rb+ desa, 38 prov | Download SHP / WebGIS |
| PODES (Potensi Desa) | BPS — geoportal.bps.go.id | Sosial-ekonomi, sarana, potensi per desa | **REST API (ArcGIS MapServer)** + download |
| Peta tematik BPS | sig.bps.go.id | Kemiskinan, demografi per wilayah | WebGIS interaktif |
| Kode wilayah | Kemendagri/BPS | Mapping NIK → desa → kab → prov | Terbuka |

## B. Terlindungi — simulasikan dulu, colok API resmi nanti
| Data | Sumber | Status | Penanganan |
|---|---|---|---|
| DTSEN (desil 1–10) | dtsen.data.go.id | Data pribadi, **UU PDP** → tak bisa diunduh bebas | **Mock** dataset sintetis berstruktur desil; adapter dialihkan ke API resmi saat diadopsi Kemenkop |
| NIK/Dukcapil | Kemendagri | Terbatas | Mock; input NIK manual saat demo |
| Kuota pupuk (RDKK/e-Alokasi) | Pupuk Indonesia/Kementan | Terbatas | Mock kuota per NIK |

## Catatan UU PDP (penting untuk pitch)
- DTSEN = acuan tunggal resmi penyaluran bansos sejak 2026 (gabungan DTKS Kemensos + P3KE Bappenas + Dukcapil + BPS).
- Karena berisi data pribadi, akses lewat mekanisme resmi. **Pola Integration Adapter** menjaga kepatuhan: aplikasi hanya bicara ke adapter; isi adapter = mock (hackathon) atau API resmi (produksi). Tidak ada perubahan kode inti.

## Untuk demo
- Pilih **1 kabupaten** dengan batas desa rapi.
- Siapkan: GeoJSON batas desa (BIG) + statistik PODES + **data sintetis** warga (NIK, desil), kuota, dan transaksi — termasuk **1 kasus kebocoran tertanam**.

## Tautan
- BIG Peta Batas Desa: https://geoservices.big.go.id/portal/apps/webappviewer/index.html?id=9917592df1f24501ae804b7d346c08fb
- BPS Geoportal PODES: https://geoportal.bps.go.id/server/rest/services/podes/Podes_2018_Compressed/MapServer
- BPS SIG tematik: https://sig.bps.go.id/webgis/tematik-interaktif
- DTSEN (Satu Data Indonesia): https://dtsen.data.go.id/
