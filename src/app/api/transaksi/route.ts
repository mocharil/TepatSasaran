import { NextRequest, NextResponse } from 'next/server'
import { checkEntitlement, checkHET } from '@/lib/entitlement'
import { detectAndRecordAnomalies } from '@/lib/anomaly'
import {
  getWargaById,
  getAllJenisBarang,
  getJenisBarangById,
  createTransaksi,
  reduceStok,
  updateKuotaWarga,
  getTransaksiByKoperasi,
} from '@/lib/mock-db'
import type { JenisBarang, Transaksi, TransaksiItemInput } from '@/types'

// POST /api/transaksi — proses transaksi baru (golden path)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { koperasiId, nik, items }: { koperasiId: string; nik: string; items: TransaksiItemInput[] } = body

    if (!koperasiId || !nik || !items?.length) {
      return NextResponse.json({ error: 'koperasiId, nik, dan items wajib diisi' }, { status: 400 })
    }

    // Bangun barang map
    const semuaBarang = await getAllJenisBarang()
    const barangMap = new Map<string, JenisBarang>(semuaBarang.map((b) => [b.id, b]))

    // 1. Cek entitlement (DTSEN + RDKK)
    const entitlement = await checkEntitlement(nik, items, barangMap)

    // 2. Cek markup HET (independen dari entitlement)
    const { isMarkup, detail: markupDetail } = checkHET(items, barangMap)

    // Tentukan keputusan akhir
    let keputusan = entitlement.keputusan
    let alasan = entitlement.alasan

    if (keputusan === 'BOLEH' && isMarkup) {
      keputusan = 'WARNING'
      alasan = markupDetail
    } else if (keputusan === 'WARNING' && isMarkup) {
      alasan = [alasan, markupDetail].filter(Boolean).join(' | ')
    }

    // 3. Hitung total
    const totalHarga = keputusan === 'TOLAK'
      ? 0
      : items.reduce((sum, item) => sum + item.jumlah * item.hargaSatuan, 0)

    // 4. Buat transaksi record
    const warga = entitlement.warga
    const itemsEnriched = await Promise.all(
      items.map(async (item) => {
        const barang = await getJenisBarangById(item.jenisBarangId)
        return {
          id: `item-${Date.now()}-${item.jenisBarangId}`,
          jenisBarangId: item.jenisBarangId,
          jenisBarang: barang!,
          jumlah: item.jumlah,
          hargaSatuan: item.hargaSatuan,
          total: item.jumlah * item.hargaSatuan,
        }
      })
    )

    const wargaFull = warga ? await getWargaById(warga.id) : null
    const transaksi: Transaksi = await createTransaksi({
      koperasiId,
      wargaId: warga?.id ?? 'unknown',
      warga: wargaFull!,
      keputusan,
      status: keputusan === 'TOLAK' ? 'DITOLAK' : 'SELESAI',
      alasan,
      totalHarga,
      items: itemsEnriched,
      createdAt: new Date().toISOString(),
    })

    // 5. Update stok & kuota jika tidak ditolak
    if (keputusan !== 'TOLAK') {
      for (const item of items) {
        await reduceStok(koperasiId, item.jenisBarangId, item.jumlah)
        if (warga) {
          await updateKuotaWarga(warga.id, item.jenisBarangId, item.jumlah)
        }
      }
    }

    // 6. Detect & record anomali
    const anomaliDetected = await detectAndRecordAnomalies(transaksi)

    return NextResponse.json({
      transaksi,
      entitlement: {
        keputusan,
        alasan,
        desilLabel: entitlement.desilLabel,
        kuotaInfo: entitlement.kuotaInfo,
        warga: warga ? {
          nama: warga.nama,
          desil: warga.desil,
          eligible: warga.eligible,
        } : null,
      },
      anomaliDetected: anomaliDetected.length,
    })
  } catch (err) {
    console.error('Transaksi error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

// GET /api/transaksi?koperasiId=xxx
export async function GET(req: NextRequest) {
  const koperasiId = req.nextUrl.searchParams.get('koperasiId')
  if (!koperasiId) return NextResponse.json({ error: 'koperasiId wajib' }, { status: 400 })

  const transaksi = await getTransaksiByKoperasi(koperasiId)
  return NextResponse.json({ transaksi })
}
