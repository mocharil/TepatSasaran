# 06 — Demo Script (90 Detik)

> Latihkan minimal 5x sebelum onsite. Satu orang driver (layar), satu orang narasi.

## Setup sebelum naik panggung
1. Buka browser, sudah di `/login`
2. Tab 1: `/kasir/transaksi`
3. Tab 2: `/pusat/peta`
4. Pastikan data reset (server restart agar state mock segar)
5. WiFi: siapkan hotspot cadangan

---

## Skenario 90 detik

### [0–10 detik] Hook pembuka (presenter bicara, layar tunjukkan slide/homepage)
> "Rp34 triliun dana desa mengalir lewat 80.000 koperasi — tanpa cara real-time tahu apakah subsidinya tepat sasaran. **TepatSasaran** adalah relnya."

### [10–25 detik] Login kasir + Transaksi DITOLAK
1. Login `kasir@bentangan.id` / `demo1234` → auto ke `/kasir`
2. Klik **Transaksi Baru**
3. Ketik NIK: `3310010001000002` atau klik shortcut demo "Budi Hartono (Desil 9)"
4. Klik **Cek Hak Penerima**
5. Muncul: warga **Budi Hartono, Desil 9**
6. Pilih Pupuk Urea, 100 kg, **Proses Transaksi**

**LAYAR:** Muncul kotak MERAH besar → **"✕ TRANSAKSI DITOLAK"** + "Penerima tidak layak: Desil 9 (mampu)"

> **Narasi:** "Pak Budi pengusaha kaya mencoba beli pupuk subsidi — sistem **langsung tolak**. Anomali tercatat real-time."

### [25–45 detik] Transaksi BOLEH + WARNING
1. Klik **Transaksi Baru** lagi
2. NIK shortcut: `3310010001000001` → Siti Rahayu (Desil 2, petani)
3. Pilih Pupuk Urea, 50 kg, harga: **2250** (sesuai HET) → Proses → **"✓ BOLEH"**

> "Ibu Siti petani desil 2 — **diizinkan**."

4. Transaksi baru, Siti lagi, harga ganti **2500** (di atas HET 2250) → Proses → **"⚠ WARNING"** + alasan markup

> "Kasir mencoba markup — **sistem flagging** langsung."

### [45–65 detik] Control Tower + Peta Menyala
1. Buka Tab 2: `/pusat/peta` (sudah terbuka, tinggal switch)
2. Marker **KopDes Bentangan menyala merah** (skor risiko 85, pulse ring beranimasi)
3. Klik marker → popup: **"⚠️ Risiko Tinggi · 3 anomali"**
4. Klik layer **"Blank Spot"** → peta zoom ke **⊘ Desa Karanganom** — desa miskin (31%) tanpa koperasi

> "Di sini: Desa Karanganom, 2.340 jiwa miskin, **tidak dilayani koperasi mana pun**. Exclusion error terdeteksi otomatis dari data PODES BPS."

### [65–80 detik] Statistik keadilan
1. Lihat bottom bar peta: **87% tepat sasaran · 13% kebocoran · Rp14,2 jt dicegah**
2. Switch ke sidebar: tepat sasaran vs kebocoran bar visualization

> "Dalam satu hari: Rp14 juta kebocoran **dicegah**. Bayangkan di 80.000 koperasi."

### [80–90 detik] Close
> "TepatSasaran menyatukan DTSEN, PODES BPS, dan batas desa BIG ke dalam satu rel yang **sudah ada tapi belum pernah disambungkan**. Kami bukan saingan Simkopdes — kami pelengkap yang menjamin setiap rupiah subsidi **tepat sampai ke yang berhak**."

---

## NIK demo cheatsheet
| NIK | Nama | Desil | Hasil |
|---|---|---|---|
| 3310010001000001 | Siti Rahayu | 2 — petani | **BOLEH** |
| 3310010001000002 | Budi Hartono | 9 — pengusaha | **DITOLAK** |
| 3310010001000004 | Sri Wahyuni | 3 — kuota habis | **WARNING** |

## Kredensial
| Email | Password | Peran |
|---|---|---|
| kasir@bentangan.id | demo1234 | Kasir |
| manajer@bentangan.id | demo1234 | Manajer |
| admin@kemenkop.go.id | demo1234 | Control Tower (Pusat) |

## Jika demo offline / WiFi mati
- Data sepenuhnya lokal (mock JSON) → tetap berjalan di `localhost:3000`
- Tidak ada ketergantungan API eksternal
- Pastikan `npm run dev` jalan sebelum masuk ruang

## Pitching talking points (juri)
- **PEBS FEB UI**: tekankan financial inclusion, desil DTSEN, anti-kebocoran
- **Kemenkop**: tekankan "siap diadopsi", adapter tinggal colok API resmi, patuh UU PDP
- **HAKI**: "Kami rancang ini untuk Kemenkop — IP siap diserahkan, kami siap mendampingi deployment"
