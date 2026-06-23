'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import type { User } from '@/types'
import { formatRupiah, formatDate, keputusanColor, keputusanIcon } from '@/lib/utils'

interface Props { user: User }

export default function KasirDashboardClient({ user }: Props) {
  const [data, setData] = useState<Record<string, unknown> | null>(null)

  useEffect(() => {
    if (!user.koperasiId) return
    fetch(`/api/dashboard?koperasiId=${user.koperasiId}&peran=KASIR`)
      .then((r) => r.json())
      .then(setData)
  }, [user.koperasiId])

  const stok = (data?.stok as { nama: string; jumlah: number; satuan: string; isKritis: boolean }[]) ?? []
  const riwayat = (data?.riwayatTransaksi as Array<{ id: string; keputusan: string; warga?: { nama: string }; totalHarga: number; createdAt: string }>) ?? []

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Transaksi Hari Ini', value: (data?.transaksiHariIni as number) ?? 0, color: 'green' },
          { label: 'Nilai Hari Ini', value: formatRupiah((data?.nilaiTransaksiHariIni as number) ?? 0), color: 'blue' },
          { label: 'Anomali Aktif', value: (data?.anomaliAktif as number) ?? 0, color: 'red' },
          { label: 'Stok Kritis', value: (data?.stokKritis as number) ?? 0, color: 'amber' },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
            <p className="text-xs text-gray-500 mb-1">{s.label}</p>
            <p className="text-xl font-bold text-gray-900">{s.value}</p>
          </div>
        ))}
      </div>

      {/* CTA transaksi baru */}
      <Link
        href="/kasir/transaksi"
        className="flex items-center justify-between bg-green-600 hover:bg-green-700 text-white rounded-xl p-5 transition-colors shadow-md"
      >
        <div>
          <p className="font-bold text-lg">Transaksi Baru</p>
          <p className="text-green-100 text-sm">Scan NIK & verifikasi hak penerima subsidi</p>
        </div>
        <span className="text-4xl">→</span>
      </Link>

      <div className="grid sm:grid-cols-2 gap-6">
        {/* Stok */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <h2 className="font-semibold text-gray-900 mb-3 text-sm">Stok Gerai</h2>
          {stok.length === 0 ? (
            <p className="text-gray-400 text-xs">Memuat...</p>
          ) : (
            <div className="space-y-2">
              {stok.map((s) => (
                <div key={s.nama} className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">{s.nama}</span>
                  <span className={`text-sm font-semibold ${s.isKritis ? 'text-red-600' : 'text-gray-900'}`}>
                    {s.jumlah} {s.satuan}
                    {s.isKritis && ' ⚠'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Riwayat */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <h2 className="font-semibold text-gray-900 mb-3 text-sm">Transaksi Terakhir</h2>
          {riwayat.length === 0 ? (
            <p className="text-gray-400 text-xs">Belum ada transaksi</p>
          ) : (
            <div className="space-y-2">
              {riwayat.slice(0, 6).map((t) => (
                <div key={t.id} className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-gray-800">{t.warga?.nama ?? '-'}</p>
                    <p className="text-xs text-gray-400">{formatDate(t.createdAt)}</p>
                  </div>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${keputusanColor(t.keputusan)}`}>
                    {keputusanIcon(t.keputusan)} {t.keputusan}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
