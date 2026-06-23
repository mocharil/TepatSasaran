import { NextRequest, NextResponse } from 'next/server'
import { getAllAnomali, getAnomaliByKoperasi } from '@/lib/mock-db'

// GET /api/anomali?koperasiId=xxx (opsional)
export async function GET(req: NextRequest) {
  const koperasiId = req.nextUrl.searchParams.get('koperasiId')

  const anomali = koperasiId
    ? await getAnomaliByKoperasi(koperasiId)
    : await getAllAnomali()

  return NextResponse.json({ anomali, total: anomali.length })
}
