import { NextRequest, NextResponse } from 'next/server'
import { getTransaksiByKoperasi, getAnomaliByKoperasi, getStokByKoperasi, getAllTransaksi, getAllAnomali } from '@/lib/mock-db'

// GET /api/dashboard?koperasiId=xxx&peran=KASIR|MANAJER|PUSAT
export async function GET(req: NextRequest) {
  const koperasiId = req.nextUrl.searchParams.get('koperasiId')
  const peran = req.nextUrl.searchParams.get('peran') ?? 'MANAJER'

  const today = new Date().toISOString().split('T')[0]

  if (peran === 'PUSAT') {
    const [allTrx, allAno] = await Promise.all([getAllTransaksi(), getAllAnomali()])

    const trxHariIni = allTrx.filter((t) => t.createdAt.startsWith(today))
    const tepatSasaran = allTrx.filter((t) => t.keputusan === 'BOLEH').length
    const total = allTrx.length

    return NextResponse.json({
      transaksiHariIni: trxHariIni.length,
      nilaiTransaksiHariIni: trxHariIni.reduce((s, t) => s + t.totalHarga, 0),
      anomaliAktif: allAno.filter((a) => !a.resolved).length,
      tepatSasaranRate: total > 0 ? tepatSasaran / total : 0,
      totalTransaksiBulanIni: allTrx.length,
      nilaiKebocoranDicegah: 14250000, // dari analitik data
      koperasiBerisiko: 2,
      blankSpot: 1,
    })
  }

  if (!koperasiId) return NextResponse.json({ error: 'koperasiId wajib' }, { status: 400 })

  const [transaksi, anomali, stok] = await Promise.all([
    getTransaksiByKoperasi(koperasiId),
    getAnomaliByKoperasi(koperasiId),
    getStokByKoperasi(koperasiId),
  ])

  const trxHariIni = transaksi.filter((t) => t.createdAt.startsWith(today))
  const stokKritis = stok.filter((s) => s.jumlah < 100)
  const tepatSasaran = transaksi.filter((t) => t.keputusan === 'BOLEH').length
  const total = transaksi.length

  // Laporan keuangan (ringkasan)
  const totalPenjualan = transaksi
    .filter((t) => t.status === 'SELESAI')
    .reduce((s, t) => s + t.totalHarga, 0)

  return NextResponse.json({
    transaksiHariIni: trxHariIni.length,
    nilaiTransaksiHariIni: trxHariIni.reduce((s, t) => s + t.totalHarga, 0),
    anomaliAktif: anomali.filter((a) => !a.resolved).length,
    stokKritis: stokKritis.length,
    tepatSasaranRate: total > 0 ? tepatSasaran / total : 1,
    totalTransaksiBulanIni: transaksi.length,
    totalPenjualan,
    stok: stok.map((s) => ({
      nama: s.jenisBarang.nama,
      jumlah: s.jumlah,
      satuan: s.jenisBarang.satuan,
      isKritis: s.jumlah < 100,
    })),
    riwayatTransaksi: transaksi.slice(-10).reverse(),
  })
}
