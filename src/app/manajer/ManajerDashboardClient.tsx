'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts'
import type { User, Anomali, Transaksi } from '@/types'
import { formatRupiah, formatDate, keputusanColor, keputusanIcon } from '@/lib/utils'
import { tipeLabel } from '@/lib/anomaly'

interface Props { user: User }

const SEVERITY_COLOR: Record<string, string> = {
  KRITIS: 'bg-red-100 text-red-700 border-red-200',
  HIGH: 'bg-orange-100 text-orange-700 border-orange-200',
  MEDIUM: 'bg-amber-100 text-amber-700 border-amber-200',
  LOW: 'bg-green-100 text-green-700 border-green-200',
}

export default function ManajerDashboardClient({ user }: Props) {
  const [dashboard, setDashboard] = useState<Record<string, unknown> | null>(null)
  const [anomali, setAnomali] = useState<Anomali[]>([])
  const [laporan, setLaporan] = useState<{
    chart7Hari: Array<{ tanggal: string; boleh: number; tolak: number; warning: number; nilai: number }>
    pieData: Array<{ name: string; value: number; fill: string }>
    laporanKeuangan: { pendapatan: number; hpp: number; labaKotor: number; bebanOperasional: number; labaBersih: number }
  } | null>(null)

  const koperasiId = user.koperasiId ?? 'kop-001'

  useEffect(() => {
    Promise.all([
      fetch(`/api/dashboard?koperasiId=${koperasiId}&peran=MANAJER`).then((r) => r.json()),
      fetch(`/api/anomali?koperasiId=${koperasiId}`).then((r) => r.json()),
      fetch(`/api/laporan?koperasiId=${koperasiId}&range=7`).then((r) => r.json()),
    ]).then(([d, a, l]) => {
      setDashboard(d)
      setAnomali(a.anomali ?? [])
      setLaporan(l)
    })
  }, [koperasiId])

  const stok = (dashboard?.stok as { nama: string; jumlah: number; satuan: string; isKritis: boolean }[]) ?? []
  const riwayat = (dashboard?.riwayatTransaksi as Transaksi[]) ?? []
  const tepatSasaranRate = ((dashboard?.tepatSasaranRate as number) ?? 0) * 100

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Transaksi Hari Ini', value: (dashboard?.transaksiHariIni as number) ?? 0 },
          { label: 'Nilai Hari Ini', value: formatRupiah((dashboard?.nilaiTransaksiHariIni as number) ?? 0) },
          { label: 'Anomali Aktif', value: `${(dashboard?.anomaliAktif as number) ?? 0} kasus`, warn: ((dashboard?.anomaliAktif as number) ?? 0) > 0 },
          { label: 'Tepat Sasaran', value: `${tepatSasaranRate.toFixed(0)}%`, ok: tepatSasaranRate > 80 },
        ].map((s) => (
          <div key={s.label} className={`rounded-xl p-4 border shadow-sm ${s.warn ? 'bg-red-50 border-red-200' : s.ok ? 'bg-green-50 border-green-200' : 'bg-white border-gray-100'}`}>
            <p className="text-xs text-gray-500 mb-1">{s.label}</p>
            <p className={`text-xl font-bold ${s.warn ? 'text-red-700' : s.ok ? 'text-green-700' : 'text-gray-900'}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Anomali */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between p-4 border-b border-gray-100">
            <h2 className="font-bold text-gray-900">🚩 Pusat Anomali</h2>
            <Link href="/manajer/anomali" className="text-xs text-green-600 hover:underline">Lihat semua →</Link>
          </div>
          <div className="divide-y divide-gray-50">
            {anomali.length === 0 ? (
              <p className="p-4 text-gray-400 text-sm">Tidak ada anomali aktif</p>
            ) : (
              anomali.slice(0, 6).map((a) => (
                <div key={a.id} className="flex items-start gap-3 p-4">
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full border shrink-0 ${SEVERITY_COLOR[a.severity]}`}>
                    {a.severity}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-800">{tipeLabel(a.tipe)}</p>
                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{a.deskripsi}</p>
                    <p className="text-xs text-gray-400 mt-1">{formatDate(a.createdAt)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="space-y-4">
          {/* Stok */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <h2 className="font-bold text-gray-900 mb-3 text-sm">📦 Stok Gerai</h2>
            <div className="space-y-3">
              {stok.map((s) => (
                <div key={s.nama}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-700 font-medium">{s.nama}</span>
                    <span className={s.isKritis ? 'text-red-600 font-bold' : 'text-gray-600'}>
                      {s.jumlah} {s.satuan} {s.isKritis && '⚠'}
                    </span>
                  </div>
                  <div className="bg-gray-100 rounded-full h-1.5">
                    <div
                      className={`h-1.5 rounded-full ${s.isKritis ? 'bg-red-500' : 'bg-green-500'}`}
                      style={{ width: `${Math.min(100, (s.jumlah / 5000) * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tepat Sasaran Rate */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <h2 className="font-bold text-gray-900 mb-2 text-sm">🎯 Tingkat Tepat Sasaran</h2>
            <div className="relative w-full h-4 bg-gray-100 rounded-full">
              <div
                className="absolute top-0 left-0 h-4 rounded-full bg-green-500 transition-all"
                style={{ width: `${tepatSasaranRate}%` }}
              />
            </div>
            <p className="text-right text-2xl font-black text-green-600 mt-1">{tepatSasaranRate.toFixed(0)}%</p>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Bar Chart: Transaksi 7 Hari */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <h2 className="font-bold text-gray-900 mb-4 text-sm">📈 Transaksi 7 Hari Terakhir</h2>
          {laporan?.chart7Hari ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={laporan.chart7Hari} barSize={16} barGap={2}>
                <XAxis dataKey="tanggal" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} width={28} />
                <Tooltip
                  formatter={(value, name) => [value, name === 'boleh' ? 'Boleh' : name === 'tolak' ? 'Ditolak' : 'Warning']}
                  contentStyle={{ fontSize: 12, borderRadius: 8 }}
                />
                <Bar dataKey="boleh" fill="#16a34a" radius={[4, 4, 0, 0]} name="Boleh" />
                <Bar dataKey="warning" fill="#d97706" radius={[4, 4, 0, 0]} name="Warning" />
                <Bar dataKey="tolak" fill="#dc2626" radius={[4, 4, 0, 0]} name="Ditolak" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-gray-400 text-sm">Memuat chart...</div>
          )}
        </div>

        {/* Pie Chart: Tepat Sasaran */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <h2 className="font-bold text-gray-900 mb-2 text-sm">🎯 Distribusi Keputusan</h2>
          {laporan?.pieData ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={laporan.pieData}
                  cx="50%" cy="45%"
                  innerRadius={45} outerRadius={70}
                  dataKey="value"
                  label={({ percent }: { percent?: number }) => `${((percent ?? 0) * 100).toFixed(0)}%`}
                  labelLine={false}
                  fontSize={11}
                >
                  {laporan.pieData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Pie>
                <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-gray-400 text-sm">Memuat...</div>
          )}
        </div>
      </div>

      {/* Laporan Keuangan Ringkas */}
      {laporan?.laporanKeuangan && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
          <div className="p-4 border-b border-gray-100">
            <h2 className="font-bold text-gray-900">💰 Laporan Keuangan Bulan Ini (Auto)</h2>
            <p className="text-xs text-gray-400 mt-0.5">Format baku — dihasilkan otomatis dari catatan transaksi</p>
          </div>
          <div className="grid sm:grid-cols-5 divide-y sm:divide-y-0 sm:divide-x divide-gray-100">
            {[
              { label: 'Pendapatan', value: laporan.laporanKeuangan.pendapatan, color: 'text-gray-900' },
              { label: 'HPP', value: laporan.laporanKeuangan.hpp, color: 'text-gray-600' },
              { label: 'Laba Kotor', value: laporan.laporanKeuangan.labaKotor, color: 'text-blue-700' },
              { label: 'Beban Ops', value: laporan.laporanKeuangan.bebanOperasional, color: 'text-orange-600' },
              { label: 'Laba Bersih', value: laporan.laporanKeuangan.labaBersih, color: 'text-green-700', bold: true },
            ].map((item) => (
              <div key={item.label} className="p-4">
                <p className="text-xs text-gray-500">{item.label}</p>
                <p className={`text-base font-bold mt-1 ${item.color} ${item.bold ? 'text-xl' : ''}`}>
                  {formatRupiah(item.value)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Riwayat Transaksi */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        <div className="p-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-900">📜 Riwayat Transaksi Terakhir</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                {['Waktu', 'Penerima', 'Barang', 'Nilai', 'Keputusan'].map((h) => (
                  <th key={h} className="px-4 py-2 text-left text-xs font-semibold text-gray-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {riwayat.slice(0, 8).map((t) => (
                <tr key={t.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2 text-xs text-gray-500">{formatDate(t.createdAt)}</td>
                  <td className="px-4 py-2 font-medium text-gray-900">{t.warga?.nama ?? '-'}</td>
                  <td className="px-4 py-2 text-xs text-gray-600">
                    {t.items?.map((i) => i.jenisBarang?.nama).filter(Boolean).join(', ') ?? '-'}
                  </td>
                  <td className="px-4 py-2 font-semibold text-gray-900">{formatRupiah(t.totalHarga)}</td>
                  <td className="px-4 py-2">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${keputusanColor(t.keputusan)}`}>
                      {keputusanIcon(t.keputusan)} {t.keputusan}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
