'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import type { User, PetaAnalitik } from '@/types'
import { formatRupiah } from '@/lib/utils'
import AiText from '@/components/AiText'

interface Props { user: User }

export default function PusatDashboardClient({ user }: Props) {
  const [dashboard, setDashboard] = useState<Record<string, unknown> | null>(null)
  const [peta, setPeta] = useState<PetaAnalitik | null>(null)
  const [anomali, setAnomali] = useState<{ total: number; anomali: Array<{ tipe: string; severity: string; deskripsi: string; createdAt: string }> }>({ total: 0, anomali: [] })
  const [aiInsight, setAiInsight] = useState<string>('')
  const [aiLoading, setAiLoading] = useState(false)

  async function generateInsight() {
    if (!peta || !dashboard) return
    setAiLoading(true)
    const konteks = `Statistik Distribusi Subsidi KDMP Kabupaten Klaten:
- Total Koperasi: ${peta.totalKoperasi} (aktif: ${peta.koperasiAktif})
- Total Transaksi: ${peta.totalTransaksi}
- Tepat Sasaran: ${(peta.nilaiTepatSasaran * 100).toFixed(1)}%
- Potensi Kebocoran: ${(peta.nilaiKebocoran * 100).toFixed(1)}% (Rp ${peta.nilaiKebocoranRupiah.toLocaleString('id-ID')})
- Total Anomali Aktif: ${anomali.total}
- Blank Spot (desa tanpa koperasi): ${(dashboard.blankSpot as number) ?? 1}
- Anomali terbaru: ${anomali.anomali.slice(0, 3).map((a) => `${a.tipe} (${a.severity})`).join(', ')}
- Kebocoran dicegah hari ini: Rp ${((dashboard.nilaiKebocoranDicegah as number) ?? 0).toLocaleString('id-ID')}`

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ konteks, tipe: 'DISTRIBUSI_INSIGHT' }),
      })
      const data = await res.json()
      setAiInsight(res.ok ? (data.result as string) : `Error: ${data.error}`)
    } catch (e) {
      setAiInsight(`Gagal terhubung ke AI: ${e instanceof Error ? e.message : 'error'}`)
    } finally {
      setAiLoading(false)
    }
  }

  useEffect(() => {
    Promise.all([
      fetch('/api/dashboard?peran=PUSAT').then((r) => r.json()),
      fetch('/api/peta').then((r) => r.json()),
      fetch('/api/anomali').then((r) => r.json()),
    ]).then(([d, p, a]) => {
      setDashboard(d)
      setPeta(p.analitik)
      setAnomali(a)
    })
  }, [])

  const tepatSasaran = ((dashboard?.tepatSasaranRate as number) ?? 0) * 100

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Header Alert */}
      {(anomali.total ?? 0) > 0 && (
        <div className="bg-red-50 border-l-4 border-red-500 rounded-r-xl p-4 flex items-center gap-3">
          <span className="text-2xl">🚨</span>
          <div>
            <p className="font-bold text-red-800">{anomali.total} anomali terdeteksi secara real-time</p>
            <p className="text-sm text-red-600">Kemungkinan kebocoran subsidi senilai {formatRupiah((dashboard?.nilaiKebocoranDicegah as number) ?? 14250000)} berhasil dicegah hari ini.</p>
          </div>
          <Link href="/pusat/peta" className="ml-auto bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-red-700 transition-colors">
            Lihat Peta →
          </Link>
        </div>
      )}

      {/* KPI Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { icon: '🎯', label: 'Tepat Sasaran', value: `${tepatSasaran.toFixed(0)}%`, sub: 'dari total transaksi', color: 'green' },
          { icon: '🛡️', label: 'Kebocoran Dicegah', value: formatRupiah((dashboard?.nilaiKebocoranDicegah as number) ?? 14250000), sub: 'bulan ini', color: 'blue' },
          { icon: '⚠️', label: 'Anomali Aktif', value: `${(dashboard?.anomaliAktif as number) ?? 0} kasus`, sub: 'belum ditindaklanjuti', color: 'red' },
          { icon: '🗺️', label: 'Blank Spot', value: `${(dashboard?.blankSpot as number) ?? 1} desa`, sub: 'tidak ada koperasi', color: 'amber' },
        ].map((s) => (
          <div key={s.label} className={`bg-white rounded-xl border shadow-sm p-4 ${s.color === 'red' ? 'border-red-100' : s.color === 'amber' ? 'border-amber-100' : 'border-gray-100'}`}>
            <div className="flex items-center gap-2 mb-1">
              <span>{s.icon}</span>
              <p className="text-xs text-gray-500">{s.label}</p>
            </div>
            <p className={`text-xl font-black ${s.color === 'green' ? 'text-green-700' : s.color === 'red' ? 'text-red-700' : s.color === 'amber' ? 'text-amber-700' : 'text-blue-700'}`}>
              {s.value}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* AI Insight Panel */}
      <div className="bg-white rounded-xl border border-purple-100 shadow-sm">
        <div className="flex items-center justify-between p-4 border-b border-purple-100">
          <div>
            <h2 className="font-bold text-gray-900">✨ AI Insight Distribusi</h2>
            <p className="text-xs text-gray-400 mt-0.5">Analisis kondisi distribusi & rekomendasi kebijakan oleh Gemini AI</p>
          </div>
          <button
            onClick={aiInsight ? () => setAiInsight('') : generateInsight}
            disabled={aiLoading || (!peta && !dashboard)}
            className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors shrink-0"
          >
            {aiLoading ? '⏳ Menganalisis...' : aiInsight ? '↺ Refresh' : '✨ Generate AI Insight'}
          </button>
        </div>
        <div className="p-4">
          {aiInsight ? (
            <AiText text={aiInsight} />
          ) : (
            <p className="text-sm text-gray-400 text-center py-4">
              Klik tombol untuk mendapat analisis AI kondisi distribusi subsidi KDMP saat ini
            </p>
          )}
        </div>
      </div>

      {/* Peta CTA */}
      <Link
        href="/pusat/peta"
        className="flex items-center justify-between bg-gradient-to-r from-green-800 to-emerald-700 rounded-2xl p-6 text-white hover:from-green-700 hover:to-emerald-600 transition-all shadow-lg"
      >
        <div>
          <h2 className="text-xl font-bold mb-1">🗺️ Peta Keadilan Distribusi</h2>
          <p className="text-green-100 text-sm">Visualisasi real-time exclusion error, kebocoran, & blank spot se-Kabupaten Klaten</p>
          <div className="flex gap-3 mt-3">
            <span className="bg-white/20 text-xs px-2 py-1 rounded-full">🔴 Risiko Tinggi</span>
            <span className="bg-white/20 text-xs px-2 py-1 rounded-full">⚫ Blank Spot</span>
            <span className="bg-white/20 text-xs px-2 py-1 rounded-full">🟠 Exclusion Error</span>
          </div>
        </div>
        <div className="text-5xl">→</div>
      </Link>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Program Stats */}
        {peta && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <h2 className="font-bold text-gray-900 mb-4">📊 Statistik Program KDMP Klaten</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Koperasi Terdaftar</span>
                <span className="font-bold text-gray-900">{peta.totalKoperasi}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Koperasi Aktif</span>
                <span className="font-bold text-green-700">{peta.koperasiAktif}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Transaksi</span>
                <span className="font-bold text-gray-900">{peta.totalTransaksi.toLocaleString('id-ID')}</span>
              </div>
              <hr className="border-gray-100" />
              <div className="flex justify-between items-center">
                <span className="text-sm text-red-600 font-medium">Potensi Kebocoran Rp</span>
                <span className="font-bold text-red-700">{formatRupiah(peta.nilaiKebocoranRupiah)}</span>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-green-700 font-medium">Tepat Sasaran</span>
                  <span className="text-red-600 font-medium">Kebocoran</span>
                </div>
                <div className="bg-gray-100 rounded-full h-3 flex overflow-hidden">
                  <div className="bg-green-500 h-3" style={{ width: `${peta.nilaiTepatSasaran * 100}%` }} />
                  <div className="bg-red-400 h-3" style={{ width: `${peta.nilaiKebocoran * 100}%` }} />
                </div>
                <div className="flex justify-between text-xs mt-1 text-gray-500">
                  <span>{(peta.nilaiTepatSasaran * 100).toFixed(0)}%</span>
                  <span>{(peta.nilaiKebocoran * 100).toFixed(0)}%</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Live Anomali Feed */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between p-4 border-b border-gray-100">
            <h2 className="font-bold text-gray-900">🚨 Anomali Real-Time</h2>
            <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full font-semibold animate-pulse">
              LIVE
            </span>
          </div>
          <div className="divide-y divide-gray-50 max-h-80 overflow-y-auto">
            {anomali.anomali?.slice(0, 8).map((a, i) => (
              <div key={i} className="flex items-start gap-3 p-3">
                <span className="text-lg shrink-0">
                  {a.severity === 'HIGH' || a.severity === 'KRITIS' ? '🔴' : '🟡'}
                </span>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-gray-800">{a.tipe?.replace(/_/g, ' ')}</p>
                  <p className="text-xs text-gray-500 line-clamp-2 mt-0.5">{a.deskripsi}</p>
                </div>
              </div>
            ))}
            {(!anomali.anomali || anomali.anomali.length === 0) && (
              <p className="p-4 text-gray-400 text-sm text-center">Tidak ada anomali</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
