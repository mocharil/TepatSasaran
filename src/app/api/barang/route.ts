import { NextResponse } from 'next/server'
import { getAllJenisBarang } from '@/lib/mock-db'

export async function GET() {
  const barang = await getAllJenisBarang()
  return NextResponse.json({ barang })
}
