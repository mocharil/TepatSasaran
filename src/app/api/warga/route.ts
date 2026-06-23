import { NextRequest, NextResponse } from 'next/server'
import { getWargaByNIK } from '@/lib/mock-db'

// GET /api/warga?nik=3310...
export async function GET(req: NextRequest) {
  const nik = req.nextUrl.searchParams.get('nik')
  if (!nik) return NextResponse.json({ error: 'NIK wajib diisi' }, { status: 400 })

  const warga = await getWargaByNIK(nik)
  if (!warga) return NextResponse.json({ error: 'NIK tidak ditemukan dalam DTSEN' }, { status: 404 })

  // Sembunyikan data sensitif internal (UU PDP) — hanya return yang diperlukan
  return NextResponse.json({
    id: warga.id,
    nik: warga.nik,
    nama: warga.nama,
    desaId: warga.desaId,
    desil: warga.desil,
    profesi: warga.profesi,
    eligible: warga.eligible,
    kuotaPupuk: warga.kuotaPupuk,
    kuotaPupukSisa: warga.kuotaPupukSisa,
  })
}
