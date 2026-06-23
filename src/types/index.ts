export type Peran = 'KASIR' | 'MANAJER' | 'PEMDA' | 'PUSAT'
export type StatusKoperasi = 'AKTIF' | 'MACET' | 'PEMBANGUNAN'
export type StatusTransaksi = 'DIPROSES' | 'SELESAI' | 'DITOLAK'
export type Keputusan = 'BOLEH' | 'TOLAK' | 'WARNING'
export type KategoriBarang = 'PUPUK' | 'LPG' | 'SEMBAKO' | 'OBAT' | 'BANSOS'
export type TipeAnomali = 'INCLUSION_ERROR' | 'OVER_KUOTA' | 'MARKUP_HET' | 'GHOST_RECIPIENT' | 'EXCLUSION_ERROR' | 'BLANK_SPOT'
export type Severity = 'LOW' | 'MEDIUM' | 'HIGH' | 'KRITIS'

export interface User {
  id: string
  email: string
  nama: string
  peran: Peran
  koperasiId: string | null
}

export interface Desa {
  id: string
  kode: string
  nama: string
  kecamatanId: string
  lat: number
  lng: number
  jumlahPenduduk: number
  jumlahKK: number
  indeksKemiskinan: number
  catatan?: string
}

export interface Koperasi {
  id: string
  kode: string
  nama: string
  desaId: string
  lat: number
  lng: number
  status: StatusKoperasi
  unitUsaha: string[]
  skorRisiko: number
  catatan?: string
}

export interface JenisBarang {
  id: string
  kode: string
  nama: string
  kategori: KategoriBarang
  het: number
  satuan: string
  isSubsidi: boolean
}

export interface StokItem {
  koperasiId: string
  jenisBarangId: string
  jumlah: number
}

export interface Warga {
  id: string
  nik: string
  nama: string
  desaId: string
  desil: number
  profesi: string | null
  kuotaPupuk: number
  kuotaPupukSisa: number
  eligible: boolean
  catatan?: string
}

export interface EntitlementResult {
  keputusan: Keputusan
  warga: Warga | null
  alasan: string | null
  desilLabel: string | null
  kuotaInfo: string | null
}

export interface TransaksiItemInput {
  jenisBarangId: string
  jumlah: number
  hargaSatuan: number
}

export interface TransaksiInput {
  koperasiId: string
  wargaId: string
  items: TransaksiItemInput[]
}

export interface TransaksiItem {
  id: string
  jenisBarangId: string
  jenisBarang: JenisBarang
  jumlah: number
  hargaSatuan: number
  total: number
}

export interface Transaksi {
  id: string
  koperasiId: string
  wargaId: string
  warga: Warga
  keputusan: Keputusan
  status: StatusTransaksi
  alasan: string | null
  totalHarga: number
  items: TransaksiItem[]
  createdAt: string
}

export interface Anomali {
  id: string
  koperasiId: string
  transaksiId: string | null
  tipe: TipeAnomali
  deskripsi: string
  severity: Severity
  resolved: boolean
  createdAt: string
}

export interface PetaKoperasi {
  id: string
  kode: string
  nama: string
  desaId: string
  lat: number
  lng: number
  status: StatusKoperasi
  skorRisiko: number
  anomaliCount: number
  label: string
}

export interface PetaAnalitik {
  kabupaten: string
  totalKoperasi: number
  koperasiAktif: number
  totalTransaksi: number
  nilaiTepatSasaran: number
  nilaiKebocoran: number
  nilaiKebocoranRupiah: number
  exclusionError: string[]
  blankSpot: string[]
  inclusionError: string[]
  hotspot: { koperasiId: string; skorRisiko: number; anomaliCount: number; label: string }[]
}

export interface DashboardStats {
  transaksiHariIni: number
  nilaiTransaksiHariIni: number
  anomaliAktif: number
  stokKritis: number
  tepatSasaranRate: number
  totalTransaksiBulanIni: number
}
