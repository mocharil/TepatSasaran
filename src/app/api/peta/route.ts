import { NextResponse } from 'next/server'
import { getAllKoperasi, getAllDesa, getAllAnomali, getPetaAnalitik } from '@/lib/mock-db'
import { skorRisikoColor } from '@/lib/utils'

// GET /api/peta — data untuk Control Tower map
export async function GET() {
  const [koperasiList, desaList, anomaliList, analitik] = await Promise.all([
    getAllKoperasi(),
    getAllDesa(),
    getAllAnomali(),
    getPetaAnalitik(),
  ])

  // Hitung anomali per koperasi
  const anomaliByKop = anomaliList.reduce<Record<string, number>>((acc, a) => {
    acc[a.koperasiId] = (acc[a.koperasiId] ?? 0) + 1
    return acc
  }, {})

  // Enrich koperasi dengan anomali count + warna
  const koperasiEnriched = koperasiList.map((k) => {
    const anomaliCount = anomaliByKop[k.id] ?? 0
    const skor = k.skorRisiko
    return {
      id: k.id,
      kode: k.kode,
      nama: k.nama,
      desaId: k.desaId,
      lat: k.lat,
      lng: k.lng,
      status: k.status,
      skorRisiko: skor,
      anomaliCount,
      warna: skorRisikoColor(skor),
      label: skor >= 70 ? '⚠️ Risiko Tinggi' : skor >= 40 ? '⚠️ Normal' : '✓ Baik',
    }
  })

  // GeoJSON FeatureCollection untuk peta
  const geojsonKoperasi = {
    type: 'FeatureCollection',
    features: koperasiEnriched.map((k) => ({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [k.lng, k.lat] },
      properties: {
        id: k.id, nama: k.nama, status: k.status,
        skorRisiko: k.skorRisiko, anomaliCount: k.anomaliCount,
        warna: k.warna, label: k.label, kode: k.kode,
      },
    })),
  }

  // Desa points (termasuk blank spot)
  const blankSpotIds = new Set(analitik.blankSpot as string[])
  const exclusionIds = new Set(analitik.exclusionError as string[])

  const geojsonDesa = {
    type: 'FeatureCollection',
    features: desaList.map((d) => ({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [d.lng, d.lat] },
      properties: {
        id: d.id, nama: d.nama,
        jumlahPenduduk: d.jumlahPenduduk,
        indeksKemiskinan: d.indeksKemiskinan,
        isBlankSpot: blankSpotIds.has(d.id),
        isExclusionError: exclusionIds.has(d.id),
        tipe: blankSpotIds.has(d.id) ? 'blank_spot' : exclusionIds.has(d.id) ? 'exclusion' : 'normal',
      },
    })),
  }

  return NextResponse.json({
    koperasi: koperasiEnriched,
    desa: desaList,
    analitik,
    geojsonKoperasi,
    geojsonDesa,
    stats: {
      totalAnomali: anomaliList.length,
      anomaliUnresolved: anomaliList.filter((a) => !a.resolved).length,
      koperasiBerisiko: koperasiEnriched.filter((k) => k.skorRisiko >= 70).length,
      blankSpotCount: blankSpotIds.size,
      exclusionCount: exclusionIds.size,
    },
  })
}
