import { NextRequest, NextResponse } from 'next/server'
import { getStokByKoperasi } from '@/lib/mock-db'

export async function GET(req: NextRequest) {
  const koperasiId = req.nextUrl.searchParams.get('koperasiId')
  if (!koperasiId) return NextResponse.json({ error: 'koperasiId wajib' }, { status: 400 })

  const stok = await getStokByKoperasi(koperasiId)
  return NextResponse.json({ stok })
}
