// Integration Adapter — mock layer
// Saat produksi: ganti implementasi ini ke API DTSEN/Dukcapil resmi
// Interface tetap sama, kode inti tidak perlu diubah (patuh UU PDP)

import type { Warga, Koperasi, JenisBarang, StokItem, Desa, Transaksi, Anomali, User } from '@/types'

// Load data sintetis dari file JSON (resolveJsonModule = true di tsconfig)
import RAW_IMPORT from '../../data/klaten-mock.json'
const RAW = RAW_IMPORT as unknown as typeof RAW_IMPORT

// In-memory mutable state (simulates DB for demo)
let _stok: StokItem[] = structuredClone(RAW.stok)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _transaksi: Transaksi[] = structuredClone(RAW.transaksi_demo) as any[]
let _anomali: Anomali[] = _transaksi
  .filter((t: Transaksi) => (t as unknown as { anomali?: unknown }).anomali)
  .map((t: Transaksi, i: number) => {
    const raw = (t as unknown as { anomali: { tipe: string; severity: string; deskripsi: string } }).anomali
    return {
      id: `ano-${i + 1}`,
      koperasiId: t.koperasiId,
      transaksiId: t.id,
      tipe: raw.tipe,
      deskripsi: raw.deskripsi,
      severity: raw.severity,
      resolved: false,
      createdAt: t.createdAt,
    } as Anomali
  })

// ─── DTSEN Adapter (mock) ───────────────────────────────────────────────────
export async function getWargaByNIK(nik: string): Promise<Warga | null> {
  const found = (RAW.warga as Warga[]).find((w) => w.nik === nik)
  return found ?? null
}

export async function getWargaById(id: string): Promise<Warga | null> {
  const found = (RAW.warga as Warga[]).find((w) => w.id === id)
  return found ?? null
}

// ─── Koperasi ───────────────────────────────────────────────────────────────
export async function getKoperasiById(id: string): Promise<Koperasi | null> {
  return (RAW.koperasi as Koperasi[]).find((k) => k.id === id) ?? null
}

export async function getAllKoperasi(): Promise<Koperasi[]> {
  return RAW.koperasi as Koperasi[]
}

// ─── Barang ─────────────────────────────────────────────────────────────────
export async function getAllJenisBarang(): Promise<JenisBarang[]> {
  return RAW.jenisBarang as JenisBarang[]
}

export async function getJenisBarangById(id: string): Promise<JenisBarang | null> {
  return (RAW.jenisBarang as JenisBarang[]).find((b) => b.id === id) ?? null
}

// ─── Stok ───────────────────────────────────────────────────────────────────
export async function getStokByKoperasi(koperasiId: string): Promise<(StokItem & { jenisBarang: JenisBarang })[]> {
  const stokItems = _stok.filter((s) => s.koperasiId === koperasiId)
  return stokItems.map((s) => ({
    ...s,
    jenisBarang: (RAW.jenisBarang as JenisBarang[]).find((b) => b.id === s.jenisBarangId)!,
  }))
}

export async function reduceStok(koperasiId: string, jenisBarangId: string, jumlah: number): Promise<void> {
  const stokItem = _stok.find((s) => s.koperasiId === koperasiId && s.jenisBarangId === jenisBarangId)
  if (stokItem) {
    stokItem.jumlah = Math.max(0, stokItem.jumlah - jumlah)
  }
}

// ─── Transaksi ──────────────────────────────────────────────────────────────
export async function getTransaksiByKoperasi(koperasiId: string): Promise<Transaksi[]> {
  return _transaksi.filter((t) => t.koperasiId === koperasiId)
}

export async function getAllTransaksi(): Promise<Transaksi[]> {
  return [..._transaksi]
}

export async function createTransaksi(data: Omit<Transaksi, 'id'>): Promise<Transaksi> {
  const trx: Transaksi = { ...data, id: `trx-${Date.now()}` }
  _transaksi.push(trx)
  return trx
}

// ─── Anomali ────────────────────────────────────────────────────────────────
export async function getAllAnomali(): Promise<Anomali[]> {
  return [..._anomali].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

export async function getAnomaliByKoperasi(koperasiId: string): Promise<Anomali[]> {
  return _anomali.filter((a) => a.koperasiId === koperasiId)
}

export async function createAnomali(data: Omit<Anomali, 'id'>): Promise<Anomali> {
  const ano: Anomali = { ...data, id: `ano-${Date.now()}` }
  _anomali.push(ano)
  return ano
}

// ─── Desa / Peta ────────────────────────────────────────────────────────────
export async function getAllDesa(): Promise<Desa[]> {
  return RAW.desa as Desa[]
}

export async function getPetaAnalitik() {
  return RAW.peta_analitik
}

// ─── Auth ────────────────────────────────────────────────────────────────────
export async function getUserByEmail(email: string): Promise<(User & { password: string }) | null> {
  return (RAW.users as (User & { password: string })[]).find((u) => u.email === email) ?? null
}

export async function getUserById(id: string): Promise<User | null> {
  return (RAW.users as User[]).find((u) => u.id === id) ?? null
}

// ─── RDKK Adapter (mock) ─────────────────────────────────────────────────────
export async function updateKuotaWarga(wargaId: string, jenisBarangId: string, jumlah: number): Promise<void> {
  // Pupuk saja yang punya kuota individual
  if (!jenisBarangId.startsWith('brg-001') && !jenisBarangId.startsWith('brg-002')) return
  const warga = (RAW.warga as Warga[]).find((w) => w.id === wargaId)
  if (warga) {
    warga.kuotaPupukSisa = Math.max(0, warga.kuotaPupukSisa - jumlah)
  }
}

// Reset untuk testing ulang saat dev
export function resetMockDb() {
  _stok = structuredClone(RAW.stok)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  _transaksi = structuredClone(RAW.transaksi_demo) as any[]
  _anomali = []
}
