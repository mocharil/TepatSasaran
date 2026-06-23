// Entitlement Engine
// Memverifikasi hak penerima saat transaksi: DTSEN (desil) + RDKK (kuota) + HET
// Adapter: saat produksi ganti mock-db → API DTSEN/RDKK resmi

import { getWargaByNIK } from './mock-db'
import type { EntitlementResult, JenisBarang, TransaksiItemInput } from '@/types'

const DESIL_MAX_SUBSIDI = 7 // desil 1–7 boleh, 8–10 tidak

function desilLabel(desil: number): string {
  if (desil <= 2) return `Desil ${desil} — Sangat Miskin`
  if (desil <= 4) return `Desil ${desil} — Miskin`
  if (desil <= 6) return `Desil ${desil} — Rentan Miskin`
  if (desil <= 7) return `Desil ${desil} — Hampir Mampu`
  if (desil <= 9) return `Desil ${desil} — Mampu`
  return `Desil 10 — Sangat Mampu`
}

export async function checkEntitlement(
  nik: string,
  items: TransaksiItemInput[],
  barangMap: Map<string, JenisBarang>,
): Promise<EntitlementResult> {
  // 1. Lookup warga (DTSEN adapter)
  const warga = await getWargaByNIK(nik)

  if (!warga) {
    return {
      keputusan: 'TOLAK',
      warga: null,
      alasan: `NIK ${nik} tidak ditemukan dalam data DTSEN. Pastikan NIK sesuai KTP dan warga terdaftar di desa setempat.`,
      desilLabel: null,
      kuotaInfo: null,
    }
  }

  // 2. Cek eligible (terdaftar DTSEN)
  if (!warga.eligible) {
    return {
      keputusan: 'TOLAK',
      warga,
      alasan: `Warga tidak terdaftar sebagai penerima bantuan dalam DTSEN.`,
      desilLabel: desilLabel(warga.desil),
      kuotaInfo: null,
    }
  }

  // 3. Cek apakah ada barang subsidi dalam transaksi
  const itemsSubsidi = items.filter((item) => {
    const barang = barangMap.get(item.jenisBarangId)
    return barang?.isSubsidi
  })

  if (itemsSubsidi.length === 0) {
    // Tidak ada barang subsidi — transaksi boleh tanpa cek desil
    return {
      keputusan: 'BOLEH',
      warga,
      alasan: null,
      desilLabel: desilLabel(warga.desil),
      kuotaInfo: null,
    }
  }

  // 4. Cek desil (DTSEN)
  if (warga.desil > DESIL_MAX_SUBSIDI) {
    return {
      keputusan: 'TOLAK',
      warga,
      alasan: `Penerima tidak layak: ${desilLabel(warga.desil)} (ambang batas subsidi: desil 1–${DESIL_MAX_SUBSIDI}). Pembelian barang bersubsidi tidak diizinkan.`,
      desilLabel: desilLabel(warga.desil),
      kuotaInfo: null,
    }
  }

  // 5. Cek kuota pupuk (RDKK adapter)
  const itemsPupuk = items.filter((item) => {
    const barang = barangMap.get(item.jenisBarangId)
    return barang?.kategori === 'PUPUK'
  })

  if (itemsPupuk.length > 0) {
    const totalPupuk = itemsPupuk.reduce((sum, item) => sum + item.jumlah, 0)
    const kuotaInfo = `Sisa kuota pupuk: ${warga.kuotaPupukSisa} kg / ${warga.kuotaPupuk} kg`

    if (warga.kuotaPupukSisa <= 0) {
      return {
        keputusan: 'WARNING',
        warga,
        alasan: `Kuota pupuk sudah habis. ${kuotaInfo}. Transaksi memerlukan persetujuan manajer.`,
        desilLabel: desilLabel(warga.desil),
        kuotaInfo,
      }
    }

    if (totalPupuk > warga.kuotaPupukSisa) {
      return {
        keputusan: 'WARNING',
        warga,
        alasan: `Jumlah pembelian (${totalPupuk} kg) melebihi sisa kuota (${warga.kuotaPupukSisa} kg). ${kuotaInfo}.`,
        desilLabel: desilLabel(warga.desil),
        kuotaInfo,
      }
    }

    return {
      keputusan: 'BOLEH',
      warga,
      alasan: null,
      desilLabel: desilLabel(warga.desil),
      kuotaInfo,
    }
  }

  // 6. Semua cek lolos
  return {
    keputusan: 'BOLEH',
    warga,
    alasan: null,
    desilLabel: desilLabel(warga.desil),
    kuotaInfo: null,
  }
}

export function checkHET(
  items: TransaksiItemInput[],
  barangMap: Map<string, JenisBarang>,
): { isMarkup: boolean; detail: string | null } {
  const markupItems = items.filter((item) => {
    const barang = barangMap.get(item.jenisBarangId)
    return barang && item.hargaSatuan > barang.het
  })

  if (markupItems.length === 0) return { isMarkup: false, detail: null }

  const details = markupItems.map((item) => {
    const barang = barangMap.get(item.jenisBarangId)!
    const selisih = item.hargaSatuan - barang.het
    return `${barang.nama}: harga jual Rp ${item.hargaSatuan.toLocaleString('id-ID')}/kg melebihi HET Rp ${barang.het.toLocaleString('id-ID')}/kg (selisih Rp ${selisih.toLocaleString('id-ID')})`
  })

  return {
    isMarkup: true,
    detail: details.join('; '),
  }
}
