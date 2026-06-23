// Anomaly Engine
// Mendeteksi kebocoran dan ketidaksesuaian secara real-time

import type { Anomali, Severity, TipeAnomali, Transaksi } from '@/types'
import { createAnomali } from './mock-db'

export async function detectAndRecordAnomalies(transaksi: Transaksi): Promise<Anomali[]> {
  const detected: Anomali[] = []
  const now = new Date().toISOString()

  // Rule 1: INCLUSION_ERROR — penerima tidak layak (sudah ditolak = tetap catat anomali)
  if (transaksi.keputusan === 'TOLAK' && transaksi.alasan?.includes('tidak layak')) {
    const ano = await createAnomali({
      koperasiId: transaksi.koperasiId,
      transaksiId: transaksi.id,
      tipe: 'INCLUSION_ERROR' as TipeAnomali,
      deskripsi: `Upaya pembelian subsidi oleh warga tidak layak (${transaksi.warga?.nama ?? 'unknown'}, desil ${transaksi.warga?.desil}). Ditolak otomatis.`,
      severity: 'HIGH' as Severity,
      resolved: false,
      createdAt: now,
    })
    detected.push(ano)
  }

  // Rule 2: OVER_KUOTA — melebihi kuota RDKK
  if (transaksi.alasan?.includes('kuota') || transaksi.alasan?.includes('melebihi sisa kuota')) {
    const ano = await createAnomali({
      koperasiId: transaksi.koperasiId,
      transaksiId: transaksi.id,
      tipe: 'OVER_KUOTA' as TipeAnomali,
      deskripsi: `Pembelian pupuk melebihi sisa kuota RDKK (${transaksi.warga?.nama ?? 'unknown'}).`,
      severity: 'MEDIUM' as Severity,
      resolved: false,
      createdAt: now,
    })
    detected.push(ano)
  }

  // Rule 3: MARKUP_HET — harga di atas HET
  if (transaksi.alasan?.includes('HET') || transaksi.alasan?.includes('melebihi HET')) {
    const ano = await createAnomali({
      koperasiId: transaksi.koperasiId,
      transaksiId: transaksi.id,
      tipe: 'MARKUP_HET' as TipeAnomali,
      deskripsi: `Harga jual di atas HET: ${transaksi.alasan}`,
      severity: 'MEDIUM' as Severity,
      resolved: false,
      createdAt: now,
    })
    detected.push(ano)
  }

  return detected
}

export function hitungSkorRisiko(anomaliCount: number, transaksiCount: number): number {
  if (transaksiCount === 0) return 0
  const rate = anomaliCount / transaksiCount
  // Skor 0–100, non-linear: sedikit anomali sudah tingkatkan skor signifikan
  return Math.min(100, Math.round(rate * 200 + anomaliCount * 3))
}

export function severityColor(severity: Severity): string {
  switch (severity) {
    case 'KRITIS': return '#dc2626' // red-600
    case 'HIGH': return '#ea580c'   // orange-600
    case 'MEDIUM': return '#d97706' // amber-600
    case 'LOW': return '#65a30d'    // lime-600
    default: return '#6b7280'
  }
}

export function tipeLabel(tipe: TipeAnomali): string {
  const map: Record<TipeAnomali, string> = {
    INCLUSION_ERROR: 'Kebocoran Subsidi',
    OVER_KUOTA: 'Melebihi Kuota',
    MARKUP_HET: 'Markup di Atas HET',
    GHOST_RECIPIENT: 'Penerima Fiktif',
    EXCLUSION_ERROR: 'Warga Miskin Terlewat',
    BLANK_SPOT: 'Wilayah Tidak Terlayani',
  }
  return map[tipe]
}
